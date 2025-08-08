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
});

export const uploadChapter = async (filePath: string) => {
  console.log(`Processing file: ${filePath}`);

  const fileContent = await fs.readFile(filePath, "utf-8");
  const { data, content: markdownContent } = matter(fileContent);

  const frontmatter = frontmatterSchema.parse(data);

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
    }).from(volumeTable).where(and(eq(volumeTable.novelId, frontmatter.novel), eq(volumeTable.number, frontmatter.volume)));

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

    console.log(`Successfully uploaded chapter: ${frontmatter.title}`);

  } catch (error) {
    await db.delete(richTextTable).where(eq(richTextTable.id, richTextId));
    console.error(`Failed to upload chapter: ${frontmatter.title}`);
    console.error(error);
    throw new Error((error instanceof Error ? error.message : "Unknown error"));
  }
};

const chaptersDir = path.resolve(__dirname, "../output/gemini");

const uploadAllChapters = async () => {
  const files = await fs.readdir(chaptersDir);
  const chapterFiles = files.filter(f => /^chapter_\d+_\d{8}_\d{6}\.md$/.test(f));

  for (const file of chapterFiles) {
    const filePath = path.join(chaptersDir, file);
    try {
      await uploadChapter(filePath);
    } catch (err) {
      console.error(`Error uploading ${file}:`, err);
    }
  }
};

if (require.main === module) {
  uploadAllChapters()
    .then(() => {
      console.log("All chapters processed.");
    })
    .catch(console.error)
    .finally(async () => {
      await sql.end();
      console.log("Database connection closed.");
      process.exit()
    });
}