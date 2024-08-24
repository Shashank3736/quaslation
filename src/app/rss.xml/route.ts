import RSS from "rss";

export async function GET(req: Request) {
  const time = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
  const url = new URL(req.url);
  const response = await fetch(process.env.HYGRAPH_URL || "", {
    cache: "no-store",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'gcms-stage': 'PUBLISHED',
    },
    body: JSON.stringify({
      query: `query MyQuery {
                chapters(
                  where: {premium: false, published_gte: "${time.toISOString()}"}
                  first: 100
                ) {
                  id
                  slug
                  chapter
                  title
                  description
                  published
                  novel {
                    slug
                  }
                  volume {
                    number
                  }
                }
              }`
    })
  });
  const data = await response.json();

  if(!response.ok) {
    console.error(data)
    throw "Something is wrong! Please try again."
  }
  
  const feed = new RSS({
    title: "Quaslation",
    description: "Quality ai translations.",
    site_url: url.origin,
    feed_url: url.href,
    image_url: `${url.origin}/logo/logo100x100.jpg`,
    categories: [data.data.chapters.map((chapter:any) => chapter.novel.slug).filter((value:string, index:number, self:string[]) => self.indexOf(value) === index)],
  })

  for (const chapter of data.data.chapters) {
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