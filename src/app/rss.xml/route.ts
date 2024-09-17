import { db } from "@/lib/db";
import { chapter as chapterTable, novel as novelTable, richText, volume as volumeTable } from "@/lib/db/schema";
import { shortifyString } from "@/lib/utils";
import { and, eq, isNotNull, gte } from "drizzle-orm";
import RSS from "rss";

export async function GET(req: Request) {
  const time = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
  const url = new URL(req.url);
  

  const chapters = await db.select({
    chapter: chapterTable.number,
    slug: chapterTable.slug,
    description: richText.text,
    published: chapterTable.publishedAt,
    novel: {
      slug: novelTable.slug,
    },
    volume: {
      number: volumeTable.number,
    }
  })
  .from(chapterTable)
  .innerJoin(novelTable, eq(chapterTable.novelId, novelTable.id))
  .innerJoin(richText, eq(chapterTable.richTextId, richText.id))
  .innerJoin(volumeTable, eq(chapterTable.volumeId, volumeTable.id))
  .where(and(isNotNull(chapterTable.publishedAt),gte(chapterTable.publishedAt, time), eq(chapterTable.premium, false)));
  
  const feed = new RSS({
    title: "Quaslation",
    description: "Quality ai translations.",
    site_url: url.origin,
    feed_url: url.href,
    image_url: `${url.origin}/logo/logo100x100.jpg`,
    categories: chapters.map(chap => chap.novel.slug).filter((value, index, array) => array.indexOf(value) === index),
  })

  for (const chapter of chapters) {
    feed.item({
      title: `${chapter.novel.slug} ${chapter.volume.number > 0 ? `Volume ${chapter.volume.number} ` : ""}Chapter ${chapter.chapter}`,
      description: shortifyString(chapter.description, 255),
      url: `${url.origin}/novels/${chapter.novel.slug}/${chapter.slug}`,
      date: new Date(chapter.published || ""),
      categories: [chapter.novel.slug],
    })
  }
  
  return new Response(feed.xml({ indent: true }), {
    headers: {
      "Content-Type": "text/xml",
    },
  });
}