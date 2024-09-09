"use server"

import { z } from "zod"
import { createChapterFormSchema } from "./create-chapter-form"
import { db } from "@/lib/db"
import { chapterTable, richTextTable, volumeTable } from "@/lib/db/schema"
import { markdownToHtml, markdownToText, slugify } from "@/lib/utils"
import { and, eq } from "drizzle-orm"

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
    
      await db.insert(chapterTable).values({
        slug: `${slugify(values.title)}-${values.volume}-${values.number}`,
        title: values.title,
        serial: values.serial,
        richTextId: content[0].id,
        number: values.number,
        novelId: novelId,
        volumeId: volumeData[0].id,
      })
    } catch (error) {
      await db.delete(richTextTable).where(eq(richTextTable.id, content[0].id));
      console.error(error);
      throw new Error("Something is wrong about the chapter.")
    }
  
  } catch (error) {
    console.error(error);
    throw new Error("Seems like something is wrong.")
  }
}