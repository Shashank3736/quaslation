import { db } from "@/lib/db";
import { shortifyString } from "@/lib/utils";
import { unstable_cache } from "next/cache";
import RSS from "rss";

const getLatestChapters = async (time: Date) => {
  return await db.query.chapter.findMany({
    where: (chapter, { gte }) => gte(chapter.publishedAt, time),
    columns: {
      slug: true,
      publishedAt: true,
      number: true
    },
    with: {
      richText: {
        columns: {
          text: true,
        }
      },

      volume: {
        columns: {
          number: true,
        }
      },

      novel: {
        columns: {
          title: true,
          slug: true
        }
      }
    }
  })
}

const getCache = unstable_cache(getLatestChapters, [], {
  tags: ["chapter:update:free"],
  revalidate: 3600*12
});

export async function GET(req: Request) {
  const time = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
  const url = new URL(req.url);
  
  const chapters = await getCache(new Date(time.getFullYear(), time.getMonth(), time.getDate(), 0, 0, 0, 0));
  
  const feed = new RSS({
    title: "Quaslation",
    description: "Quality ai translations.",
    site_url: url.origin,
    feed_url: url.href,
    image_url: `${url.origin}/icon.jpg`,
    categories: chapters.map(chap => chap.novel.slug).filter((value, index, array) => array.indexOf(value) === index),
  });

  for (const chapter of chapters) {
    feed.item({
      title: `${chapter.novel.title} ${chapter.volume.number > 0 ? `Volume ${chapter.volume.number} ` : ""}Chapter ${chapter.number}`,
      description: shortifyString(chapter.richText.text, 255),
      url: `${url.origin}/novels/${chapter.novel.slug}/${chapter.slug}`,
      guid: chapter.slug,
      date: new Date(chapter.publishedAt || ""),
      categories: [chapter.novel.slug],
    })
  }
  
  return new Response(feed.xml({ indent: true }), {
    headers: {
      "Content-Type": "text/xml",
    },
  });
}