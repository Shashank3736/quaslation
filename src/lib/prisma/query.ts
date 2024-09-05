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
      premium,
      publishedAt: {
        not: null,
      }
    }
  })
  console.log(`Fetched ${chapters.length} chapters from "getLatestReleases".`)
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
      Volume: {
        where: {
          publishedAt: { not: null }
        }
      },
    }
  });

  const [first, last] = await prisma.$transaction([
    prisma.chapter.findMany({
      where: {
        novelId: novel.id,
        publishedAt: { not: null }
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
        publishedAt: { not: null }
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
        },
        where: {
          publishedAt: { not: null }
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
      slug: slug,
      publishedAt: { not: null }
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
        },
        publishedAt: { not: null }
      }
    }),
    prisma.chapter.findUnique({
      where: {
        novelSerial: {
          serial: chapter.serial+1,
          novelId: chapter.novelId
        },
        publishedAt: { not: null }
      }
    })
  ])

  return { ...chapter, previous, next }
}

export const getPremiumChapters = async () => {
  return await prisma.novel.findMany({
    select: {
      title: true,
      slug: true,
      Chapter: {
        where: {
          premium: true,
          publishedAt: { not: null },
        },
        select: {
          volume: {
            select: {
              number: true,
            }
          },
          number: true,
          title: true,
          slug: true,
        },
        take: 3,
      },
    }
  })
}

export const putFreeChapter = async (slug: string) => {
  const release = await prisma.chapter.update({
    where: {
      slug
    },
    data: {
      premium: false,
      publishedAt: new Date(),
    },
    select: {
      number: true,
      title: true,
      volume: {
        select: {
          number: true
        }
      },
      novel: {
        select: {
          title: true
        }
      }
    }
  });

  return release;
}