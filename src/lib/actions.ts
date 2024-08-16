"use server"

interface GetLatestPostsOptions {
    last?: number;
    premium?: boolean;
    skip?: number;
}

export interface ChapterDetail {
    chapter: number;
    description: string;
    id: string;
    novel: {
        title: string;
        novel_slug: {
            slug: string;
        }
    }
    createdAt: Date;
    publishedAt: Date;
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
        novel_slug: {
            slug: string
        }
    }
    next?: {
        id: string;
    }
    previous?: {
        id: string;
    }
}

export interface Novel {
    description: string;
    title: string;
    volumes: {
        id: string;
        number: number;
        title: string | null;
    }[]
}

export interface NovelSlug {
    novel: Novel
}

export interface Volume {
    chapters: {
        chapter: number;
        id: string;
        premium: boolean;
        title: string;
    }[]
}

export interface GetVolume {
    volume: Volume;
    chaptersConnection: {
        aggregate: {
            count: number;
        }
    }
}

export interface NovelIndex {
    id: string;
    title: string;
    novel_slug: {
        slug: string;
    }
}

export type BlogIndex = {
    description: string;
    slug: string;
    title: string;
    publishedAt: Date;
}

export type Blog = {
    content: {
        html: string;
    }
    publishedAt: Date;
    title: string;
}

export async function getLatestPosts({ last=10, premium=false, skip=0 }: GetLatestPostsOptions): Promise<LatestPosts> {
    try {
        console.log("Request made for last chapters.")
        const response = await fetch(process.env.HYGRAPH_URL || "", {
            cache: "no-store",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'gcms-stage': 'PUBLISHED',
            },
            body: JSON.stringify({
                query: `query LastChapters {
                    chapters(first: ${last}, skip: ${skip}, where: {premium: ${premium}}, orderBy: createdAt_DESC) {
                      chapter
                      description
                      id
                      novel {
                        title
                        novel_slug {
                            slug
                        }
                      }
                      title
                      createdAt
                      publishedAt
                      volume {
                        number
                      }
                    }
                    chaptersConnection(where: {premium: ${premium}}) {
                        aggregate {
                          count
                        }
                      }
                  }
                  `,
            })
        })

        if(!response.ok) {
            console.error(response)
            throw "Something is wrong! Please try again."
        }

        const data = await response.json()
        return data.data

    } catch (error) {
        console.error(error)
        throw "Server closed."
    }
}

export async function getChapter(id: string): Promise<FullChapter> {
    try {
        console.log("Request made for chapter: ", id)
        const response = await fetch(process.env.HYGRAPH_URL || "", {
            cache: "no-store",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'gcms-stage': 'PUBLISHED',
            },
            body: JSON.stringify({
                query: `query Chapter {
                    chapter(where: {id: "${id}"}) {
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
                        novel_slug {
                          slug
                        }
                      }
                      next {
                        id
                      }
                      previous {
                        id
                      }
                    }
                  }`,
            })
        })

        if(!response.ok) {
            console.error(response)
            throw "Something is wrong! Please try again."
        }

        const data = await response.json()
        return data.data.chapter

    } catch (error) {
        console.error(error)
        throw "Server closed."
    }
}

export async function getVolume({ id, skip=0, last=15 }:{ id:string, skip?: number, last?: number }): Promise<GetVolume> {
    try {
        console.log("Request made for volume: ", id)
        const response = await fetch(process.env.HYGRAPH_URL || "", {
            cache: "no-store",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'gcms-stage': 'PUBLISHED',
            },
            body: JSON.stringify({
                query: `query Volume {
                    volume(where: {id: "${id}"}) {
                      chapters(first: ${last}, skip: ${skip}, orderBy: chapter_ASC) {
                        chapter
                        id
                        premium
                        title
                      }
                    }
                    chaptersConnection(where: {volume: {id: "${id}"}}) {
                        aggregate {
                          count
                        }
                    }
                  }`,
            })
        })

        if(!response.ok) {
            console.error(response)
            throw "Something is wrong! Please try again."
        }

        const data = await response.json()
        return data.data

    } catch (error) {
        console.error(error)
        throw "Server closed."
    }
}

export async function getNovel(slug: string): Promise<NovelSlug> {
    try {
        console.log("Request made for novel: ", slug)
        const response = await fetch(process.env.HYGRAPH_URL || "", {
            cache: "no-store",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'gcms-stage': 'PUBLISHED',
            },
            body: JSON.stringify({
                query: `query NovelIndex {
                    novelSlug(where: {slug: "${slug}"}) {
                      novel {
                        description
                        title
                        volumes(orderBy: number_ASC, first: 10) {
                          id
                          number
                          title
                        }
                      }
                    }
                  }`,
            })
        })

        if(!response.ok) {
            console.error(response)
            throw "Something is wrong! Please try again."
        }

        const data = await response.json()
        return data.data.novelSlug

    } catch (error) {
        console.error(error)
        throw "Server closed."
    }
}

export async function getNovels({ last = 10 }): Promise<NovelIndex[]> {
    try {
        console.log("Request made for novels")
        const response = await fetch(process.env.HYGRAPH_URL || "", {
            cache: "no-store",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'gcms-stage': 'PUBLISHED',
            },
            body: JSON.stringify({
                query: `query Novels {
                    novels(first: ${last}, orderBy: title_ASC) {
                      id
                      title
                      novel_slug {
                        slug
                      }
                    }
                  }`,
            })
        })

        if(!response.ok) {
            console.error(response)
            throw "Something is wrong! Please try again."
        }

        const data = await response.json()
        
        return data.data.novels

    } catch (error) {
        console.error(error)
        throw "Server closed."
    }
}

export async function getBlogs({ last = 15, skip=0 }): Promise<BlogIndex[]> {
    try {
        console.log("Request made for blogs")
        const response = await fetch(process.env.HYGRAPH_URL || "", {
            cache: "no-store",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'gcms-stage': 'PUBLISHED',
            },
            body: JSON.stringify({
                query: `query GetBlogs {
                            blogs(first: ${last}, skip: ${skip}, orderBy: createdAt_DESC) {
                                description
                                slug
                                title
                                publishedAt
                            }
                        }`,
            })
        })

        if(!response.ok) {
            console.error(response)
            throw "Something is wrong! Please try again."
        }

        const data = await response.json()
        
        return data.data.blogs

    } catch (error) {
        console.error(error)
        throw "Server closed."
    }
}

export async function getBlog(slug: string): Promise<Blog> {
    try {
        console.log("Request made for blog: ", slug)
        const response = await fetch(process.env.HYGRAPH_URL || "", {
            cache: "no-store",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'gcms-stage': 'PUBLISHED',
            },
            body: JSON.stringify({
                query: `query GetBlog {
                            blog(where: {slug: "${slug}"}) {
                                content {
                                    html
                                }
                                publishedAt
                                title
                            }
                        }`,
            })
        })

        if(!response.ok) {
            console.error(response)
            throw "Something is wrong! Please try again."
        }

        const data = await response.json()
        
        return data.data.blog

    } catch (error) {
        console.error(error)
        throw "Server closed."
    }
}