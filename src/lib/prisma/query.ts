import "server-only";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export const getLatestReleases = async ({ premium=false, take=10, skip=0 }) => {
  const chapters = await prisma.chapter.findMany({
    take,
    skip,
    orderBy: [
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
  console.log(`Fetchded ${chapters.length} chapters.`)
  return chapters;
}

export const getNovels = async () => {
  return await prisma.novel.findMany({
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
}