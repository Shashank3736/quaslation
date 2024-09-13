"use server";

import { z } from "zod";
import { createNovelSchema } from "./create-novel-form";
import { db } from "@/lib/db";
import { novelTable, richTextTable } from "@/lib/db/schema";
import { markdownToHtml, markdownToText, slugify } from "@/lib/utils";

export async function createNovel(values: z.infer<typeof createNovelSchema>) {
  const richTextData = await db.insert(richTextTable).values({
    markdown: values.description,
    text: await markdownToText(values.description),
    html: await markdownToHtml(values.description)
  }).returning({
    id: richTextTable.id,
  })
  return (await db.insert(novelTable).values({
    slug: slugify(values.title),
    title: values.title,
    richTextId: richTextData[0].id
  }).returning({
    slug: novelTable.slug,
  }))[0]
}