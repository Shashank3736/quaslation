"use server";

import { z } from "zod";
import { createNovelSchema } from "./create-novel-form";
import { db } from "@/lib/db";
import { novel as novelTable, richText as richTextTable } from "@/lib/db/schema";
import { markdownToHtml, markdownToText, slugify } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";

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

    revalidateTag("novel:create");

    return data[0]
  } catch (error) {
    await db.delete(richTextTable).where(eq(richTextTable.id, richTextData[0].id));
    return {
      slug: false
    }
  }
}