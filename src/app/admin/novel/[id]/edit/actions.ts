"use server";

import { z } from "zod";
import { editNovelSchema } from "./edit-novel-form";
import { db } from "@/lib/db";
import { novelTag as novelTagTable, richText, novel as novelTable } from "@/lib/db/schema";
import { markdownToHtml, markdownToText } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { updateTag, revalidatePath } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache";
import { Novel } from "./server";
import { invalidateSearchCaches } from "@/lib/search/invalidate";

export const updateNovel = async (values: z.infer<typeof editNovelSchema>, oldData: Novel) => {
  try {
    if(oldData.richText.markdown !== values.description) {
      await db.update(richText).set({
        markdown: values.description,
        html: await markdownToHtml(values.description),
        text: await markdownToText(values.description)
      }).where(eq(richText.id, oldData.richText.id));
    }

    if(
      oldData.title !== values.title ||
      oldData.thumbnail !== (values.thumbnail == "" ? null : values.thumbnail) ||
      (oldData.author ?? "") !== (values.author ?? "") ||
      (oldData.language ?? "") !== (values.language ?? "") ||
      (oldData.status ?? "ONGOING") !== values.status
    ) {
      await db.update(novelTable).set({
        title: values.title,
        thumbnail: values.thumbnail == "" ? undefined : values.thumbnail,
        author: values.author === "" ? null : values.author,
        language: values.language === "" ? null : values.language,
        status: values.status,
      }).where(eq(novelTable.id, oldData.id))
    }

    const oldTagIds = oldData.novelTags.map((entry) => entry.tag.id).sort((a, b) => a - b);
    const newTagIds = [...values.tagIds].sort((a, b) => a - b);
    const tagsChanged =
      oldTagIds.length !== newTagIds.length ||
      oldTagIds.some((id, index) => id !== newTagIds[index]);

    if (tagsChanged) {
      await db.delete(novelTagTable).where(eq(novelTagTable.novelId, oldData.id));
      if (newTagIds.length > 0) {
        await db.insert(novelTagTable).values(
          newTagIds.map((tagId) => ({ novelId: oldData.id, tagId }))
        );
      }
    }

    updateTag("novel:update");
    updateTag(`novel:update:${oldData.slug}`);
    updateTag(CACHE_TAGS.novel.all);
    updateTag(CACHE_TAGS.novel.list);
    invalidateSearchCaches();
    revalidatePath("/novels");
    revalidatePath("/admin/novel");
    revalidatePath(`/novels/${oldData.slug}`);

    return {
      message: "ok"
    };
  } catch (error) {
    return {
      message: `Error: ${error}`
    }
  }
}