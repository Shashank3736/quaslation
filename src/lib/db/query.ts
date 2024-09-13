import "server-only";
import { db } from "."
import { chapter, novel, richText, volume } from "./schema";
import { and, count, desc, eq, gte, isNotNull, isNull, lte, not, or } from "drizzle-orm";

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
  }).from(chapter)
  .where(
    and(
      eq(chapter.premium, premium), 
      isNotNull(chapter.publishedAt)
    )
  ).orderBy(
    desc(chapter.publishedAt), 
    desc(chapter.createdAt)
  ).innerJoin(novel, eq(chapter.novelId, novel.id))
  .innerJoin(richText, eq(chapter.richTextId, richText.id)
  ).offset(skip).limit(10);
}

export async function getChapterSlugMany() {
  return await db.select({
    chapter: chapter.slug,
    slug: novel.slug,
  }).from(chapter)
  .where(isNotNull(chapter.publishedAt))
  .orderBy(desc(chapter.publishedAt), desc(chapter.createdAt))
  .innerJoin(novel, eq(novel.id, chapter.novelId))
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
    premium: chapter.premium,
  }).from(chapter)
  .where(and(eq(chapter.novelId, novelId), isNotNull(chapter.publishedAt)))
  .leftJoin(volume, eq(chapter.volumeId, volume.id))
  .orderBy(chapter.serial)
  .offset(skip).limit(limit)
}

export const getChapterBySlug = async (slug: string) => {
  const data = await db.select({
    number: chapter.number,
    title: chapter.title,
    premium: chapter.premium,
    content: richText.html,
    serial: chapter.serial,
    novelId: chapter.novelId,
    slug: chapter.slug,
  })
  .from(chapter)
  .where(and(eq(chapter.slug, slug), isNotNull(chapter.publishedAt)))
  .innerJoin(richText, eq(chapter.richTextId, richText.id))
  return data[0]
}

export const getNovelChaptersBetweenSerial = async({ novelId, first, last }:{ novelId: number, first: number, last: number }) => {
  return db.select({
    slug: chapter.slug
  }).from(chapter)
  .where(and(gte(chapter.serial, first), lte(chapter.serial, last), eq(chapter.novelId, novelId), isNotNull(chapter.publishedAt)))
} 

export const getNovelFirstChapter = async(novelId: number) => {
  const data = await db.select({
    slug: chapter.slug,
    novel: novel.slug,
  }).from(chapter)
  .where(and(eq(chapter.novelId, novelId), isNotNull(chapter.publishedAt)))
  .innerJoin(novel, eq(chapter.novelId, novel.id))
  .orderBy(chapter.serial)
  .limit(1)

  return data[0]
}

export const getNovelLastChapter = async(novelId: number) => {
  const data = await db.select({
    slug: chapter.slug,
    novel: novel.slug,
  }).from(chapter)
  .where(and(eq(chapter.novelId, novelId), isNotNull(chapter.publishedAt)))
  .innerJoin(novel, eq(chapter.novelId, novel.id))
  .orderBy(desc(chapter.serial))
  .limit(1);

  return data[0]
}

export const getChapters = async({ novelId, skip=0, limit=25 }:{ novelId?: number, skip?: number, limit?: number }) => {
  const data = db.select({
    id: chapter.id,
    serial: chapter.serial,
    number: chapter.number,
    title: chapter.title,
    publishedAt: chapter.publishedAt,
    premium: chapter.premium,
    novel: {
      title: novel.title,
      id: novel.id,
    }
  }).from(chapter).innerJoin(novel, eq(chapter.novelId, novel.id))
  if(novelId) data.where(eq(chapter.novelId, novelId)).orderBy(desc(chapter.serial))
  else data.orderBy(desc(chapter.createdAt))
  
  return await data.limit(limit).offset(skip);
}

export const freeChapters = async({ novelId, first, last }:{ novelId: number, first: number, last: number}) => {
  return db.update(chapter).set({
    premium: false,
    publishedAt: new Date()
  })
  .where(and(eq(chapter.novelId, novelId), gte(chapter.serial, first), lte(chapter.serial, last)))
}

export const publishChapters = async({ novelId, serial }:{ novelId: number, serial: number}) => {
  return db.update(chapter).set({
    publishedAt: new Date()
  })
  .where(and(lte(chapter.serial, serial), isNull(chapter.publishedAt), eq(chapter.novelId, novelId)))
}

export const getLatestChapter = async(novelId: number) => {
  try {
    const data = await db.select({
      serial: chapter.serial,
      number: chapter.number,
      volume: volume.number,
      novel: novel.title
    })
    .from(chapter)
    .where(eq(chapter.novelId, novelId))
    .innerJoin(volume, eq(chapter.volumeId, volume.id))
    .innerJoin(novel, eq(chapter.novelId, novel.id))
    .orderBy(desc(chapter.serial))
    .limit(1)

    return data.at(0);
  } catch (error) {
    console.error(error)
    throw new Error("Something seems wrong.");
  }
}

export const getNovelFromId = async(id: number) => {
  return (await db.select().from(novel).where(eq(novel.id, id))).at(0)
}