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
      throw error;
  }
}

export type ChapterSlug = {
  slug: string;
  novel: {
      slug: string
  }
}

export async function getChapterSlug(id: string):Promise<ChapterSlug> {
  const QUERY = `query Chapter {
    chapter(where: {id: "${id}"}) {
      slug
      novel {
        slug
      }
    }
  }`
  try {
      console.log("Request made for chapter: ", id)
      const data = await runQuery(QUERY);
      return data.chapter
  } catch (error) {
      console.error(error)
      throw error
  }
}

export interface FullChapter {
  chapter: number;
  content: {
    html: string;
  }
  createdAt: Date;
  premium: boolean;
  title: string;
  updatedAt: Date;
  volume: {
    number: number;
    title: string | null;
  };
  novel: {
    id: string;
    title: string;
    slug: string
  }
  next?: {
    slug: string;
  }
  previous?: {
    slug: string;
  }
}

export async function getChapter(slug: string): Promise<FullChapter> {
  const QUERY = `query Chapter {
    chapter(where: {slug: "${slug}"}) {
      chapter
      content {
        html
      }
      createdAt
      premium
      title
      updatedAt
      volume {
        number
        title
      }
      novel {
        id
        title
        slug
      }
      next {
        slug
      }
      previous {
        slug
      }
    }
  }`
  try {
      console.log("Request made for chapter: ", slug)
      const { chapter } = await runQuery(QUERY);
      return chapter

  } catch (error) {
    console.error(error)
    throw error
  }
}

export interface NovelIndex {
  id: string;
  title: string;
  slug: string;
}

export async function getNovels({ last = 25 }): Promise<NovelIndex[]> {
  const QUERY = `query Novels {
    novels(first: ${last}, orderBy: title_ASC) {
      id
      title
      slug
    }
  }`
  try {
      console.log("Request made for novels")
      const { novels } = await runQuery(QUERY);
      
      return novels
  } catch (error) {
      console.error(error)
      throw error
  }
}

export type VolumeChapter = {
  chapter: number;
  premium: boolean;
  slug: string;
  title: string;
}

export type Volume = {
  id: string;
  number: number;
  title: string;
  chapters: VolumeChapter[]
  novel: {
    slug: string;
  }
}

export type HTMLData = {
  html: string;
}

export type ImageURL = {
  url: string;
}

export type Novel = {
  fullDescription: HTMLData;
  volumes: Volume[];
  title: string;
  thumbnail?: ImageURL;
}

export async function getNovel(slug: string): Promise<Novel> {
  const QUERY = `query MyQuery {
    novel(where: {slug: "${slug}"}) {
      fullDescription {
        html
      }
      volumes(orderBy: number_ASC, first: 10) {
        id
        number
        title
        chapters(first: 100, orderBy: chapter_ASC) {
          chapter
          premium
          slug
          title
        }
        novel {
          slug
        }
      }
      title
      thumbnail {
        url
      }
    }
  }`

  try {
    const { novel } = await runQuery(QUERY);
    return novel;
  } catch (error) {
    console.error(error)
    throw error
  }
}
export type BlogIndex = {
  description: string;
  slug: string;
  title: string;
  publishedAt: Date;
}

export async function getBlogs({ last = 15, skip=0 }): Promise<BlogIndex[]> {
  const QUERY = `query GetBlogs {
    blogs(first: ${last}, skip: ${skip}, orderBy: createdAt_DESC) {
      description
      slug
      title
      publishedAt
    }
  }`
  try {
      console.log("Request made for blogs")
      const { blogs } = await runQuery(QUERY);
      
      return blogs

  } catch (error) {
      console.error(error)
      throw error
  }
}

export type Blog = {
  content: HTMLData;
  publishedAt: Date;
  title: string;
}

export async function getBlog(slug: string): Promise<Blog> {
  const QUERY = `query GetBlog {
    blog(where: {slug: "${slug}"}) {
      content {
        html
      }
      publishedAt
      title
    }
  }`
  try {
      console.log("Request made for blog: ", slug)
      const { blog } = await runQuery(QUERY);
      
      return blog
  } catch (error) {
      console.error(error)
      throw error
  }
}