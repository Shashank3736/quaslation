"use server";

import { db } from "@/lib/db";
import { chapter, chapter as chapterTable, novel as novelTable, richText as richTextTable, volume as volumeTable } from "@/lib/db/schema";
import { markdownToHtml, markdownToText } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { z } from "zod";
import { formSchema } from "./form";

export const getChapter = async(id:number) => {
  return (await db.select({
    id: chapterTable.number,
    slug: chapterTable.slug,
    title: chapterTable.title,
    number: chapterTable.number,
    richText: {
      id: richTextTable.id,
      content: richTextTable.markdown,
    },
    serial: chapterTable.serial,
    volume: volumeTable.number,  
  })
  .from(chapterTable)
  .innerJoin(richTextTable, eq(chapterTable.richTextId, richTextTable.id))
  .innerJoin(volumeTable, eq(chapterTable.volumeId, volumeTable.id))
  .where(eq(chapterTable.id, id))
  )[0]
}

export const updateChapterContent = async(richTextId: number, values: z.infer<typeof formSchema>, chapterSlug: string) => {
  const text = await markdownToText(values.content);
  const html = await markdownToHtml(values.content);

  await db.update(richTextTable).set({
    text, html, markdown: values.content
  }).where(eq(richTextTable.id, richTextId))

  const novel = await db.query.chapter.findFirst({
    where: (chapter, { eq }) => eq(chapter.slug, chapterSlug),
    columns: {
      novelId: true,
    },
  });

  if (!novel) {
    throw new Error("Novel not found for the given chapter slug.");
  }

  const volume = await db.query.volume.findFirst({
    where: (volume, { eq, and }) => and(
      eq(volume.novelId, novel.novelId),
      eq(volume.number, values.volume)
    ),
    columns: {
      id: true,
    },
  });

  if (!volume) {
    throw new Error("Volume not found for the given chapter slug.");
  }

  await db.update(chapterTable).set({
    title: values.title,
    serial: values.serial,
    number: values.number,
    volumeId: volume.id,
  }).where(eq(chapterTable.slug, chapterSlug));

  updateTag(`chapter:update:${chapterSlug}`);
  updateTag(`chapter:update:richText:${chapterSlug}`);
  updateTag(`chapter:update:content:${chapterSlug}`);
}