import { db } from "@/lib/db";
import { chapterTable, novelTable } from "@/lib/db/schema";
import { eq, isNotNull } from "drizzle-orm";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://quaslation.xyz"
  const chapters = await db.select({
    novel: novelTable.slug,
    chapter: chapterTable.slug,
    updatedAt: chapterTable.updatedAt
  }).from(chapterTable).where(isNotNull(chapterTable.publishedAt)).innerJoin(novelTable, eq(chapterTable.novelId, novelTable.id));
  
  return chapters.map(chapter => (
    {
      url: `${base}/novels/${chapter.novel}/${chapter.chapter}`,
      lastModified: chapter.updatedAt
    }
  ));
}

export const revalidate = 24*60*60