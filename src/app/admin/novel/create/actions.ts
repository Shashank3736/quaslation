"use server";

import { z } from "zod";
import { createNovelSchema } from "./create-novel-form";
import { db } from "@/lib/db";
import { novel as novelTable, richText as richTextTable } from "@/lib/db/schema";
import { markdownToHtml, markdownToText, slugify } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache";

export async function createNovel(values: z.infer<typeof createNovelSchema>):Promise<{ slug: string | false }> {
  const richTextData = await db.insert(richTextTable).values({
    markdown: values.description,
    text: await markdownToText(values.description),
    html: await markdownToHtml(values.description)
  }).returning({
    id: richTextTable.id,
  });

  try {
    const data = await db.insert(novelTable).values({
      slug: slugify(values.title),
      title: values.title,
      richTextId: richTextData[0].id,
      thumbnail: values.thumbnail == "" ? undefined : values.thumbnail
    }).returning({
      slug: novelTable.slug,
    });

    // Invalidate novel list and all novel-related caches
    updateTag(CACHE_TAGS.novel.list);
    updateTag(CACHE_TAGS.novel.all);

    return data[0]
  } catch (error) {
    await db.delete(richTextTable).where(eq(richTextTable.id, richTextData[0].id));
    return {
      slug: false
    }
  }
}