import "server-only";
import { db } from "."
import { chapter, novel, richText } from "./schema";
import { desc, eq } from "drizzle-orm";

export async function getReleases({ skip=0, premium=false }) {
  return db.select({
    number: chapter.number,
    title: chapter.title,
    novel: {
      title: novel.title,
      slug: novel.slug,
    },
    slug: chapter.slug,
    description: richText.text,
    publishedAt: chapter.publishedAt,
    createdAt: chapter.createdAt,
  }).from(chapter).where(eq(chapter.premium, premium)).orderBy(desc(chapter.publishedAt), desc(chapter.createdAt)).innerJoin(novel, eq(chapter.novelId, novel.id)).innerJoin(richText, eq(chapter.richTextId, richText.id)).offset(skip).limit(10);
}

export async function getNovelList() {
  return db.select({
    slug: novel.slug,
    title: novel.title,
    id: novel.id,
  }).from(novel).orderBy(novel.title)
}