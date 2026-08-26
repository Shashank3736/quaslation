"use server";

import { z } from "zod";
import { editNovelSchema } from "./edit-novel-form";
import { db } from "@/lib/db";
import { richText, novel as novelTable } from "@/lib/db/schema";
import { markdownToHtml, markdownToText } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { updateTag, revalidatePath } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache";
import { Novel } from "./server";

export const updateNovel = async (values: z.infer<typeof editNovelSchema>, oldData: Novel) => {
  try {
    if(oldData.richText.markdown !== values.description) {
      await db.update(richText).set({
        markdown: values.description,
        html: await markdownToHtml(values.description),
        text: await markdownToText(values.description)
      }).where(eq(richText.id, oldData.richText.id));
    }
    
    if(oldData.title !== values.title || oldData.thumbnail !== values.thumbnail) {
      await db.update(novelTable).set({
        title: values.title,
        thumbnail: values.thumbnail == "" ? undefined : values.thumbnail,
      }).where(eq(novelTable.id, oldData.id))
    }

    updateTag("novel:update");
    updateTag(`novel:update:${oldData.slug}`);
    updateTag(CACHE_TAGS.novel.all);
    updateTag(CACHE_TAGS.novel.list);
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