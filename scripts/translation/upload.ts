import { db } from "@/lib/db";
import { chapter as chapterTable, richText as richTextTable, volume as volumeTable } from "@/lib/db/schema";
import { markdownToHtml, markdownToText, slugify } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";
import readline from "readline";

const CHAPTERS_FILE_PATH = 'scripts/output/translation/16818093090655323692/translated/volume-001.json';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query: string): Promise<string> => {
  return new Promise(resolve => rl.question(query, resolve));
};

type Chapter = {
  premium: boolean;
  slug: string;
  serial: number;
  number: number;
  title: string;
  createdAt: string;
  publishedAt: string;
  updatedAt: string;
  richText: {
    text: string;
    html: string;
    markdown: string;
  };
};

type VolumeData = {
  workId: string;
  volume: {
    number: number;
    title: string;
  };
  chapters: Chapter[];
};

async function main() {
  try {
    const args = process.argv.slice(2);
    if (args.length < 2) {
      console.error("Usage: bun scripts/translation/upload.ts <novelId> <volumeNumber>");
      process.exit(1);
    }

    const novelId = parseInt(args[0], 10);
    const volumeNumber = parseInt(args[1], 10);

    if (isNaN(novelId) || isNaN(volumeNumber)) {
      console.error("Invalid novelId or volumeNumber. Both must be integers.");
      process.exit(1);
    }

    const fileContent = await fs.readFile(path.join(process.cwd(), CHAPTERS_FILE_PATH), "utf-8");
    const data: VolumeData = JSON.parse(fileContent);

    console.log(`Preparing to upload chapters for Novel ID: ${novelId}, Volume: ${volumeNumber}`);
    console.log(`Found ${data.chapters.length} chapters in the JSON file.`);
    console.log("---");

    const confirmation = await askQuestion(`Do you want to proceed with uploading these chapters? (yes/no): `);
    if (confirmation.toLowerCase() !== 'yes') {
      console.log("Upload cancelled by user.");
      process.exit(0);
    }

    let volumeId: number;
    const volumeData = await db.select({
      id: volumeTable.id
    }).from(volumeTable).where(and(eq(volumeTable.novelId, novelId), eq(volumeTable.number, volumeNumber))).limit(1);

    if (volumeData.length > 0) {
      volumeId = volumeData[0].id;
      console.log(`Volume ${volumeNumber} already exists with ID: ${volumeId}`);
    } else {
      console.log(`Volume ${volumeNumber} not found. Creating a new volume.`);
      const newVolume = await db.insert(volumeTable).values({
        novelId: novelId,
        number: volumeNumber,
        title: data.volume.title,
      }).returning({ id: volumeTable.id });
      volumeId = newVolume[0].id;
      console.log(`Created new volume with ID: ${volumeId}`);
    }

    for (const chapter of data.chapters) {
      const { title, serial, number, richText, slug } = chapter;
      console.log(`\nProcessing Chapter: ${title} (Serial: ${serial}, Number: ${number})`);

      const existingChapter = await db.select({ id: chapterTable.id }).from(chapterTable).where(and(eq(chapterTable.novelId, novelId), eq(chapterTable.serial, serial))).limit(1);

      if (existingChapter.length > 0) {
        console.log("Chapter already exists. Skipping.");
        continue;
      }

      let uploadAll = false;
      const uploadConfirmation = uploadAll ? 'yes' : await askQuestion(`Upload this chapter? (yes/yes to all/no): `);

      if (uploadConfirmation.toLowerCase() === 'no') {
        console.log("Stopping upload process as requested.");
        break;
      }

      if (uploadConfirmation.toLowerCase() === 'yes to all') {
        uploadAll = true;
      }

      if (uploadConfirmation.toLowerCase() === 'yes' || uploadAll) {
        console.log(`Uploading chapter: ${title}`);
        const content = await db.insert(richTextTable).values({
          markdown: richText.markdown,
          text: await markdownToText(richText.markdown),
          html: await markdownToHtml(richText.markdown)
        }).returning({
          id: richTextTable.id
        });

        await db.insert(chapterTable).values({
          slug: `${slugify(title)}-${volumeNumber}-${number}`,
          title: title,
          serial: serial,
          richTextId: content[0].id,
          number: number,
          novelId: novelId,
          volumeId: volumeId,
        });
        console.log(`Successfully uploaded chapter: ${title}`);
      }
    }

  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    rl.close();
    process.exit(0);
  }
}

main();