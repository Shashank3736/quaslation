import { db } from "@/lib/db";
import { chapter as chapterTable, novel as novelTable } from "@/lib/db/schema";
import { eq, isNotNull } from "drizzle-orm";
import { MetadataRoute } from "next";
import { unstable_cache } from "next/cache";

const getCache = unstable_cache(async () => {
  console.log("Here");
  return await db.select({
    novel: novelTable.slug,
    chapter: chapterTable.slug,
    updatedAt: chapterTable.updatedAt
  })
  .from(chapterTable)
  .where(isNotNull(chapterTable.publishedAt))
  .innerJoin(novelTable, eq(chapterTable.novelId, novelTable.id));
}, [], {
  tags: ["chapter_publish"],
  revalidate: 24*3600
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://quaslation.xyz"
  const chapters = await getCache();
  
  return chapters.map(chapter => (
    {
      url: `${base}/novels/${chapter.novel}/${chapter.chapter}`,
      lastModified: chapter.updatedAt
    }
  ));
}

export const revalidate = 24*60*60