import { runQuery } from "@/lib/hygraph/query";
import RSS from "rss";

type FeedChapter = {
  chapter: number;
  description: string;
  id: string;
  slug: string;
  title: string;
  published: Date;
  novel: {
    slug: string;
  }
  volume: {
    number: number
  }
}

const ms = (days:number) => (days*24*60*60*1000)

export async function GET(req: Request, { params }:{ params: { slug: string }}) {
  const time = new Date(new Date().getTime() - ms(7))
  const url = new URL(req.url);
  const QUERY = `query MyQuery {
    chapters(
      last: 100
      where: {novel: {slug: "${params.slug}"}, premium: false, published_gte: "${time.toISOString()}"}
      orderBy: createdAt_DESC
    ) {
      chapter
      description
      id
      slug
      title
      published
      novel {
        slug
      }
      volume {
        number
      }
    }
  }`

  const { chapters }:{ chapters: FeedChapter[] } = await runQuery(QUERY);
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
      description: chapter.description,
      url: `${url.origin}/novels/${chapter.novel.slug}/${chapter.slug}`,
      date: new Date(chapter.published),
      categories: [chapter.novel.slug],
    })
  }
  
  return new Response(feed.xml({ indent: true }), {
    headers: {
      "Content-Type": "text/xml",
    },
  });
}