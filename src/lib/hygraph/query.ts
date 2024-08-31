async function runQuery(QUERY: string) {
  try {
    const response = await fetch(process.env.HYGRAPH_URL || "", {
      cache: "no-store",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'gcms-stage': 'PUBLISHED',
      },
      body: JSON.stringify({
        query: QUERY
      })
    });

    if(!response.ok) {
        console.log(await response.json())
        throw new Error("Seems like something is wrong.")
    }
    const { data } = await response.json()
    return data
  } catch (error) {
    throw new Error("Server closed.")
  }
}
export interface ChapterDetail {
  chapter: number;
  description: string;
  slug: string;
  novel: {
      title: string;
      slug: string
  }
  published?: Date;
  createdAt: Date;
  title: string;
  volume: {
      number: number;
  };
}

export interface LatestPosts {
  chapters : ChapterDetail[]
  chaptersConnection: {
      aggregate: {
          count: number;
      }
  }
}

export async function getLatestPosts({ last=25, premium=false, skip=0 }): Promise<LatestPosts> {
  const QUERY = `query LastChapters {
    chapters(first: ${last}, skip: ${skip}, where: {premium: ${premium}}, orderBy: ${premium? "createdAt_DESC": "published_DESC"}) {
      chapter
      description
      slug
      novel {
        title
        slug
      }
      title
      published
      createdAt
      volume {
        number
      }
    }
    chaptersConnection(where: {premium: ${premium}}) {
        aggregate {
          count
        }
      }
  }`
  try {
      console.log("Request made for last chapters.")
      const data = await runQuery(QUERY);

      return data

  } catch (error) {
      console.error(error)
      throw "Server closed."
  }
}