"use server";

import { db } from "@/lib/db";
import { chapter as chapterTable, novel as novelTable, richText as richTextTable, volume as volumeTable } from "@/lib/db/schema";
import { markdownToHtml, markdownToText } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";

export const getChapter = async(id:number) => {
  return (await db.select({
    id: chapterTable.number,
    slug: chapterTable.slug,
    title: chapterTable.title,
    number: chapterTable.number,
    richText: {
      id: richTextTable.id,
      content: richTextTable.markdown,
    }
  })
  .from(chapterTable)
  .innerJoin(richTextTable, eq(chapterTable.richTextId, richTextTable.id))
  .where(eq(chapterTable.id, id))
  )[0]
}

export const updateChapterContent = async(richTextId: number, markdown: string, chapterSlug: string) => {
  const text = await markdownToText(markdown);
  const html = await markdownToHtml(markdown);

  await db.update(richTextTable).set({
    text, html, markdown
  }).where(eq(richTextTable.id, richTextId))
  revalidateTag(`chapter:update:${chapterSlug}`);
  revalidateTag(`chapter:update:richText:${chapterSlug}`);
  revalidateTag(`chapter:update:content:${chapterSlug}`);
}