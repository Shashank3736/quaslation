"use server";

import { z } from "zod";
import { createNovelSchema } from "./create-novel-form";
import { db } from "@/lib/db";
import { novel as novelTable, novelTag as novelTagTable, richText as richTextTable } from "@/lib/db/schema";
import { markdownToHtml, markdownToText, slugify } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { updateTag, revalidatePath } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache";
import { invalidateSearchCaches } from "@/lib/search/invalidate";

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
      thumbnail: values.thumbnail == "" ? undefined : values.thumbnail,
      author: values.author === "" ? null : values.author,
      language: values.language === "" ? null : values.language,
      status: values.status,
    }).returning({
      id: novelTable.id,
      slug: novelTable.slug,
    });

    // Mirror the checked tags into the join table (search vector weight D).
    if (values.tagIds.length > 0) {
      await db.insert(novelTagTable).values(
        values.tagIds.map((tagId) => ({ novelId: data[0].id, tagId }))
      );
    }

    // Invalidate novel list and all novel-related caches
    updateTag(CACHE_TAGS.novel.list);
    updateTag(CACHE_TAGS.novel.all);
    updateTag(CACHE_TAGS.novel.create);
    updateTag(CACHE_TAGS.novel.updateGeneral);
    invalidateSearchCaches();
    revalidatePath("/novels");
    revalidatePath("/admin/novel");
    revalidatePath("/admin/chapters");

    return data[0]
  } catch (error) {
    await db.delete(richTextTable).where(eq(richTextTable.id, richTextData[0].id));
    return {
      slug: false
    }
  }
}