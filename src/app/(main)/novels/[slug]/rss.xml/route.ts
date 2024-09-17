import { db } from "@/lib/db";
import { shortifyString } from "@/lib/utils";
import { unstable_cache } from "next/cache";
import RSS from "rss";

const ms = (days:number) => (days*24*60*60*1000)

const getChapters = unstable_cache(async (time: Date, slug: string) => {
  return await db.query.novel.findFirst({
    columns: {
      slug: true,
    },
    where: (novel, { eq }) => eq(novel.slug, slug),
    with: {
      chapters: {
        columns: {
          number: true,
          slug: true,
          publishedAt: true
        },
        where: (chapter, { and, eq, gte, isNotNull }) => and(
          eq(chapter.premium, false), 
          isNotNull(chapter.publishedAt), 
          gte(chapter.publishedAt, time)
        ),
        with: {
          volume: {
            columns: {
              number: true
            }
          },
          richText: {
            columns: {
              text: true
            }
          }
        }
      }
    }
  })
}, [], {
  tags: ["chapter_free"],
  revalidate: 6*3600
});

export async function GET(req: Request, { params }:{ params: { slug: string }}) {
  const time = new Date(new Date().getTime() - ms(7))
  const url = new URL(req.url);

  const novel = await getChapters(new Date(time.getFullYear(), time.getMonth(), time.getDate(), 0, 0, 0, 0), params.slug);
  if(!novel) return Response.json({
    message: "No novel found",
  })
  const chapters = novel.chapters;
  const feed = new RSS({
    title: "Quaslation",
    description: "Quality ai translations.",
    site_url: url.origin,
    feed_url: url.href,
    image_url: `${url.origin}/logo/logo100x100.jpg`,
    categories: [novel.slug],
  })

  for (const chapter of chapters) {
    feed.item({
      title: `${novel.slug} ${chapter.volume.number > 0 ? `Volume ${chapter.volume.number} ` : ""}Chapter ${chapter.number}`,
      description: shortifyString(chapter.richText.text, 255),
      url: `${url.origin}/novels/${novel.slug}/${chapter.slug}`,
      date: new Date(chapter.publishedAt || ""),
      categories: [novel.slug],
    });
  }
  
  return new Response(feed.xml({ indent: true }), {
    headers: {
      "Content-Type": "text/xml",
    },
  });
}