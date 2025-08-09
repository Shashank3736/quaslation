import { db } from "@/lib/db";
import { sql } from "@vercel/postgres";
import { chapter as chapterTable, richText as richTextTable, volume as volumeTable } from "@/lib/db/schema";
import { markdownToHtml, markdownToText, slugify } from "@/lib/utils";
import { config } from "dotenv";
import { and, eq } from "drizzle-orm";
import fs from "fs/promises";
import matter from "gray-matter";
import { z } from "zod";
const path = require("path");

config({ path: '.env.local' });

const frontmatterSchema = z.object({
  chapter: z.number(),
  title: z.string(),
  novel: z.number(),
  volume: z.number(),
  serial: z.number(),
  originalLanguage: z.string().optional(),
  translatedAt: z.union([z.string(), z.date()]).optional(),
});

export interface UploadOptions {
  baseDir?: string;
  novelId?: number;
  volumeNumber?: number;
  verbose?: boolean;
  noResume?: boolean;
}

export const uploadChapter = async (filePath: string, options: UploadOptions = {}): Promise<{ success: boolean; chapter?: any; error?: string }> => {
  const {
    baseDir = path.resolve(__dirname, "../output/gemini"),
    novelId,
    volumeNumber,
    verbose = false,
    noResume = false
  } = options;

  try {
    if (verbose) {
      console.log(`📄 Processing file: ${filePath}`);
    }

    const fileContent = await fs.readFile(filePath, "utf-8");
    const { data, content: markdownContent } = matter(fileContent);

    const frontmatter = frontmatterSchema.parse(data);

    // Apply filters if specified
    if (novelId && frontmatter.novel !== novelId) {
      if (verbose) {
        console.log(`⏭️  Skipping chapter - Novel ID mismatch (expected: ${novelId}, actual: ${frontmatter.novel})`);
      }
      return { success: false, error: `Novel ID mismatch` };
    }

    if (volumeNumber && frontmatter.volume !== volumeNumber) {
      if (verbose) {
        console.log(`⏭️  Skipping chapter - Volume mismatch (expected: ${volumeNumber}, actual: ${frontmatter.volume})`);
      }
      return { success: false, error: `Volume mismatch` };
    }


    const richTextId = await db.transaction(async (tx) => {
      const content = await tx.insert(richTextTable).values({
        markdown: markdownContent,
        text: await markdownToText(markdownContent),
        html: await markdownToHtml(markdownContent)
      }).returning({
        id: richTextTable.id
      });
      return content[0].id;
    });

    try {
      const volumeData = await db.select({
        id: volumeTable.id,
      }).from(volumeTable).where(and(
        eq(volumeTable.novelId, frontmatter.novel),
        eq(volumeTable.number, frontmatter.volume)
      ));

      if (frontmatter.title.length < 1) {
        throw new Error("Title is required.");
      }

      if (volumeData.length < 1) {
        throw new Error(`Volume ${frontmatter.volume} for novel ${frontmatter.novel} does not exist. Please create the volume first.`);
      }

      await db.insert(chapterTable).values({
        slug: `${slugify(frontmatter.title)}-${frontmatter.volume}-${frontmatter.chapter}`,
        title: frontmatter.title,
        serial: frontmatter.serial,
        richTextId: richTextId,
        number: frontmatter.chapter,
        novelId: frontmatter.novel,
        volumeId: volumeData[0].id,
      });

      if (verbose) {
        console.log(`✅ Successfully uploaded chapter: "${frontmatter.title}" (Novel: ${frontmatter.novel}, Volume: ${frontmatter.volume}, Chapter: ${frontmatter.chapter})`);
      }

      return { success: true, chapter: frontmatter };

    } catch (error) {
      await db.delete(richTextTable).where(eq(richTextTable.id, richTextId));
      throw error;
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (verbose) {
      console.error(`❌ Failed to upload chapter from ${filePath}:`, errorMessage);
    }
    return { success: false, error: errorMessage };
  }
};

const findChapterFiles = async (baseDir: string): Promise<string[]> => {
  try {
    const files = await fs.readdir(baseDir, { recursive: true });
    const chapterFiles: string[] = [];

    for (const file of files) {
      const filePath = path.join(baseDir, file);
      const stat = await fs.stat(filePath);

      if (stat.isFile()) {
        // Extract just the filename from the path
        const fileName = path.basename(file);
        if (/^chapter_\d+_\d{8}_\d{6}\.(md|mdX)$/.test(fileName)) {
          // Fix the file extension if it's .mdX
          const correctedFilePath = file.endsWith('.mdX')
            ? path.join(baseDir, file.replace('.mdX', '.md'))
            : filePath;

          chapterFiles.push(correctedFilePath);
        }
      }
    }

    return chapterFiles.sort();
  } catch (error) {
    console.error('❌ Error reading directory structure:', error);
    return [];
  }
};

const uploadAllChapters = async (options: UploadOptions = {}) => {
  const {
    baseDir = path.resolve(__dirname, "../output/gemini"),
    novelId,
    volumeNumber,
    verbose = false,
    noResume = false
  } = options;

  // Adjust base directory if novel ID and/or volume number is provided
  let adjustedBaseDir = baseDir;
  if (novelId) {
    adjustedBaseDir = path.join(adjustedBaseDir, `novel-${novelId}`);
    if (volumeNumber) {
      adjustedBaseDir = path.join(adjustedBaseDir, `volume-${volumeNumber}`);
    }
  }

  console.log('🚀 Starting chapter upload process...');
  console.log(`📁 Base directory: ${baseDir}`);
  if (novelId || volumeNumber) {
    console.log(`📁 Adjusted directory: ${adjustedBaseDir}`);
  }
  console.log(`📖 Filter by Novel ID: ${novelId || 'all'}`);
  console.log(`📚 Filter by Volume: ${volumeNumber || 'all'}`);
  console.log(`📝 Verbose logging: ${verbose}`);
  console.log(`🔄 Resume: ${noResume ? 'no' : 'yes'}`);

  try {
    const chapterFiles = await findChapterFiles(adjustedBaseDir);

    if (chapterFiles.length === 0) {
      console.log('⚠️  No chapter files found to upload');
      return;
    }

    console.log(`📄 Found ${chapterFiles.length} chapter files to process`);

    // Get already uploaded chapters from database if resume is enabled (default behavior)
    let uploadedChapters: Set<string> = new Set();
    if (!noResume && novelId && volumeNumber) {
      console.log('🔍 Checking database for already uploaded chapters...');
      const volId = await db.query.volume.findFirst({
        where: (vol, { and, eq }) => and(eq(vol.novelId, novelId), eq(vol.number, volumeNumber)),
        columns: {
          id: true
        }
      });
      if(!volId) throw `Volume ${volumeNumber} do not exist in novel ${novelId}.`
      const existingChapters = await db.select({
        chapterNumber: chapterTable.number
      }).from(chapterTable)
        .where(and(
          eq(chapterTable.novelId, novelId),
          eq(chapterTable.volumeId, volId.id)
        ));

      uploadedChapters = new Set(existingChapters.map(ch => ch.chapterNumber.toString()));
      console.log(`📊 Found ${uploadedChapters.size} already uploaded chapters`);
    }

    let successCount = 0;
    let failureCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const filePath of chapterFiles) {
      try {
        const fileContent = await fs.readFile(filePath, "utf-8");
        const { data } = matter(fileContent);
        const frontmatter = frontmatterSchema.parse(data);

        // Skip if already uploaded and resume is enabled (default behavior)
        if (!noResume && uploadedChapters.has(frontmatter.chapter.toString())) {
          skippedCount++;
          if (verbose) {
            console.log(`⏭️  Skipping chapter - Already uploaded: ${frontmatter.title} (Chapter ${frontmatter.chapter})`);
          }
          continue;
        }

        const result = await uploadChapter(filePath, {
          baseDir: adjustedBaseDir,
          novelId,
          volumeNumber,
          verbose,
          noResume: true
        });

        if (result.success) {
          successCount++;
        } else {
          failureCount++;
          if (result.error) {
            errors.push(`File: ${filePath}, Error: ${result.error}`);
          }
        }
      } catch (err) {
        failureCount++;
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`File: ${filePath}, Error: ${errorMessage}`);
        if (verbose) {
          console.error(`❌ Unexpected error processing ${filePath}:`, err);
        }
      }
    }

    // Summary report
    console.log('\n📊 Upload Summary:');
    console.log(`   ✅ Successfully uploaded: ${successCount} chapters`);
    console.log(`   ⏭️  Skipped (already uploaded): ${skippedCount} chapters`);
    console.log(`   ❌ Failed to upload: ${failureCount} chapters`);
    console.log(`   📄 Total processed: ${chapterFiles.length} chapters`);

    if (errors.length > 0) {
      console.log('\n📝 Error Details:');
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    if (failureCount === 0) {
      console.log('\n🎉 All chapters uploaded successfully!');
    } else {
      console.log(`\n⚠️  ${failureCount} chapters failed to upload. Check error details above.`);
    }

  } catch (error) {
    console.error('❌ Fatal error during upload process:', error);
    throw error;
  }
};

// Enhanced CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options: UploadOptions = {
    baseDir: path.resolve(__dirname, "../output/gemini"),
    verbose: false,
    noResume: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--base-dir' && i + 1 < args.length) {
      options.baseDir = args[++i];
    } else if (arg === '--novel-id' && i + 1 < args.length) {
      options.novelId = parseInt(args[++i], 10);
    } else if (arg === '--volume' && i + 1 < args.length) {
      options.volumeNumber = parseInt(args[++i], 10);
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--no-resume') {
      options.noResume = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
📚 Enhanced Chapter Upload Tool

Usage:
  npx tsx upload.ts [options]

Options:
  --base-dir PATH       Base directory containing chapter files (default: ./scripts/output/gemini)
  --novel-id ID         Filter by specific novel ID
  --volume NUMBER       Filter by specific volume number
  --no-resume           Process all chapters, including already uploaded ones
  --verbose, -v         Enable verbose logging
  --help, -h            Show this help message

Examples:
  # Upload all chapters
  npx tsx upload.ts

  # Upload chapters for specific novel
  npx tsx upload.ts --novel-id 16

  # Upload chapters for specific novel and volume
  npx tsx upload.ts --novel-id 16 --volume 8

  # Process all chapters, including already uploaded ones (disable resume)
  npx tsx upload.ts --no-resume --novel-id 16 --volume 8

  # Use custom base directory
  npx tsx upload.ts --base-dir ./my-translations
`);
      process.exit(0);
    }
  }

  await uploadAllChapters(options);
}

if (require.main === module) {
  main()
    .catch(err => {
      console.error('❌ Upload process failed:', err?.message || err);
      process.exit(1);
    })
    .finally(async () => {
      try {
        await sql.end();
        console.log('🔌 Database connection closed.');
      } catch (error) {
        console.warn('⚠️  Warning: Could not close database connection gracefully');
      }
      process.exit();
    });
}