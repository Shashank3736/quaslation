"use server"

import { z } from "zod"
import { createChapterFormSchema } from "./create-chapter-form"
import { db } from "@/lib/db"
import { chapter as chapterTable, richText as richTextTable, volume as volumeTable } from "@/lib/db/schema"
import { markdownToHtml, markdownToText, slugify } from "@/lib/utils"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export const createChapter = async (novelId:number, values: z.infer<typeof createChapterFormSchema>) => {
  try {
    const content = await db.insert(richTextTable).values({
      markdown: values.content,
      text: await markdownToText(values.content),
      html: await markdownToHtml(values.content)
    }).returning({
      id: richTextTable.id
    })

    
    try {
      const volumeData = await db.select({
        number: volumeTable.number,
        novelId: volumeTable.novelId,
        id: volumeTable.id,
      }).from(volumeTable).where(and(eq(volumeTable.novelId, novelId), eq(volumeTable.number, values.volume)))

      if (values.title.length < 1) {
        throw new Error("Title is required.");
      }

      if (volumeData.length < 1) {
        throw new Error("Volume does not exist. Please create the volume first.");
      }
    
      await db.insert(chapterTable).values({
        slug: `${slugify(values.title)}-${values.volume}-${values.number}`,
        title: values.title,
        serial: values.serial,
        richTextId: content[0].id,
        number: values.number,
        novelId: novelId,
        volumeId: volumeData[0].id,
      })

      revalidatePath(`/admin/chapters/${novelId}/create`);
    } catch (error) {
      await db.delete(richTextTable).where(eq(richTextTable.id, content[0].id));
      throw new Error((error instanceof Error ? error.message : "Unknown error"));
    }
  
  } catch (error) {
    throw new Error((error instanceof Error ? error.message : "Unknown error"));
  }
}