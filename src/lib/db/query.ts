import "server-only";
import { db } from "."
import { chapter, novel, richText, volume } from "./schema";
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

export async function getNovelBySlug(slug: string) {
  const data = await db.select({
    id: novel.id,
    description: richText.html,
    title: novel.title,
    thumbnail: novel.thumbnail,
  }).from(novel).where(eq(novel.slug, slug)).innerJoin(richText, eq(novel.richTextId, richText.id))
  return data[0]
}

export async function getNovelVolumes(novelId: number) {
  return db.select().from(volume).where(eq(volume.novelId, novelId))
}

export const getNovelChapters = async({ novelId, skip=0, limit=25 }:{ novelId: number, skip?: number, limit?: number }) => {
  return db.select({
    slug: chapter.slug,
    title: chapter.title,
    volume: {
      number: volume.number,
      title: volume.title
    },
    number: chapter.number,
  }).from(chapter)
  .where(eq(chapter.novelId, novelId))
  .leftJoin(volume, eq(chapter.volumeId, volume.id))
  .orderBy(chapter.serial)
  .offset(skip).limit(limit)
}