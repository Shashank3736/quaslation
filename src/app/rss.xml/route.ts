import { prisma } from "@/lib/prisma/query";
import { shortifyString } from "@/lib/utils";
import RSS from "rss";

export async function GET(req: Request) {
  const time = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
  const url = new URL(req.url);

  const chapters = await prisma.chapter.findMany({
    orderBy: [
      {
        publishedAt: "desc"
      }
    ],
    where: {
      publishedAt: { gte: time.toISOString() }
    }, 
    select: {
      novel: {
        select: {
          slug: true
        }
      },
      volume: {
        select: {
          number: true,
        }
      },
      number: true,
      publishedAt: true,
      createdAt: true,
      slug: true,
      content: {
        select: {
          text: true,
        }
      }
    }
  });
  
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
      title: `${chapter.novel.slug} ${chapter.volume.number > 0 ? `Volume ${chapter.volume.number} ` : ""}Chapter ${chapter.number}`,
      description: shortifyString(chapter.content.text, 255),
      url: `${url.origin}/novels/${chapter.novel.slug}/${chapter.slug}`,
      date: new Date(chapter.publishedAt ?? chapter.createdAt),
      categories: [chapter.novel.slug],
    })
  }
  
  return new Response(feed.xml({ indent: true }), {
    headers: {
      "Content-Type": "text/xml",
    },
  });
}