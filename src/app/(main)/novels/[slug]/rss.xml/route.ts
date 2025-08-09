import { db } from "@/lib/db";
import { shortifyString } from "@/lib/utils";
import { unstable_cache } from "next/cache";
import RSS from "rss";

export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

const ms = (days: number) => days * 24 * 60 * 60 * 1000;

const getChapters = async (time: Date, slug: string) => {
  return await db.query.novel.findFirst({
    columns: {
      slug: true,
      title: true,
    },
    where: (novel, { eq }) => eq(novel.slug, slug),
    with: {
      chapters: {
        columns: {
          number: true,
          slug: true,
          publishedAt: true,
        },
        where: (chapter, { and, eq, gte, isNotNull }) =>
          and(eq(chapter.premium, false), isNotNull(chapter.publishedAt), gte(chapter.publishedAt, time)),
        with: {
          volume: {
            columns: {
              number: true,
            },
          },
          richText: {
            columns: {
              text: true,
            },
          },
        },
      },
    },
  });
};

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const paramsResolved = await params;
  const time = new Date(new Date().getTime() - ms(30));
  const url = new URL(req.url);

  const getCache = unstable_cache(getChapters, [], {
    tags: [`novel:update:${paramsResolved.slug}`],
  });

  const novel = await getCache(
    new Date(time.getFullYear(), time.getMonth(), time.getDate(), 0, 0, 0, 0),
    paramsResolved.slug
  );
  if (!novel)
    return Response.json({
      message: "No novel found",
    });
  const chapters = novel.chapters;
  const feed = new RSS({
    title: "Quaslation",
    description: "Quality ai translations.",
    site_url: url.origin,
    feed_url: url.href,
    image_url: `${url.origin}/icon.jpg`,
    categories: [novel.slug],
  });

  for (const chapter of chapters) {
    feed.item({
      title: `${novel.title} ${chapter.volume.number > 0 ? `Volume ${chapter.volume.number} ` : ""}Chapter ${chapter.number}`,
      description: shortifyString(chapter.richText.text, 255),
      url: `${url.origin}/novels/${novel.slug}/${chapter.slug}`,
      date: new Date(chapter.publishedAt || ""),
      categories: [novel.slug],
      guid: chapter.slug,
    });
  }

  return new Response(feed.xml({ indent: true }), {
    headers: {
      "Content-Type": "text/xml",
    },
  });
}