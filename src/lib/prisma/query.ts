import "server-only";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient()

export const getLatestReleases = async ({ premium=false, take=10, skip=0 }) => {
  const chapters = await prisma.chapter.findMany({
    take,
    skip,
    orderBy: [
      {
        publishedAt: "desc"
      },
      {
        createdAt: "desc"
      }
    ],
    select: {
      publishedAt: true,
      createdAt: true,
      slug: true,
      title: true,
      number: true,
      novel: {
        select: {
          title: true,
          slug: true,
        }
      },
      volume: {
        select: {
          number: true,
          title: true,
        }
      },
      content: {
        select: {
          text: true
        }
      }
    },
    where: {
      premium
    }
  })
  console.log(`Fetchded ${chapters.length} chapters from "getLatestReleases".`)
  return chapters;
}

export const getNovels = async () => {
  const novels = await prisma.novel.findMany({
    select: {
      slug: true,
      title: true,
      thumbnail: true,
      Chapter: {
        take: 2,
        where: {
          premium: false
        },
        orderBy: [
          {
            createdAt: "desc"
          }
        ],
        select: {
          volume: {
            select: {
              number: true
            }
          },
          number: true,
          title: true
        }
      }
    },
    orderBy: [
      {
        updatedAt: "desc"
      }
    ]
  })

  console.log(`Fetched ${novels.length} novels by "getNovels" method.`)
  return novels
}

export const getNovel = async (slug: string) => {
  const novel = await prisma.novel.findUniqueOrThrow({
    where: {
      slug
    },
    include: {
      Volume: true,
    }
  });

  const [first, last] = await prisma.$transaction([
    prisma.chapter.findMany({
      where: {
        novelId: novel.id,
      },
      take: 1,
      select: {
        volume: {
          select: {
            number: true
          }
        },
        number: true,
        slug: true,
        premium: true,
      }
    }),
    prisma.chapter.findMany({
      where: {
        novelId: novel.id,
      },
      take: -1,
      select: {
        volume: {
          select: {
            number: true
          }
        },
        number: true,
        slug: true,
        premium: true,
      }
    })
  ])

  console.log(`Fetched ${novel.title} info from "getNovel"`)

  return { novel, first: first[0], last: last[0] }
}

export const getVolume = async(id: string) => {
  const volume = await prisma.volume.findUniqueOrThrow({
    where: {
      id
    },
    select: {
      number: true,
      title: true,
      Chapter: {
        select: {
          number: true,
          title: true,
          slug: true,
          premium: true,
        }
      },
      novel: {
        select: {
          slug: true
        }
      }
    }
  })

  console.log(`Fetched Volume ${volume.number} of ${volume.novel.slug} and ${volume.Chapter.length} chapters.`)
  return volume
}

export const getChapter = async (slug: string) => {
  const chapter = await prisma.chapter.findUniqueOrThrow({
    where: {
      slug: slug
    },
    select: {
      number: true,
      title: true,
      premium: true,
      serial: true,
      novelId: true,
      content: {
        select: {
          html: true
        }
      },
      novel: {
        select: {
          slug: true,
        }
      }
    }
  })

  const [previous, next] = await prisma.$transaction([
    prisma.chapter.findUnique({
      where: {
        novelSerial: {
          serial: chapter.serial-1,
          novelId: chapter.novelId
        }
      }
    }),
    prisma.chapter.findUnique({
      where: {
        novelSerial: {
          serial: chapter.serial+1,
          novelId: chapter.novelId
        }
      }
    })
  ])

  return { ...chapter, previous, next }
}
