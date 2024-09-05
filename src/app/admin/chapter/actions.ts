"use server";

import { prisma } from "@/lib/prisma/query";
import { revalidatePath } from "next/cache";

export const unpublishMany = async(novelId: string, serial: number) => {
  const lastPublished = await prisma.chapter.findFirst({
    where: {
      publishedAt: { not: null },
      novelId
    },
    select: {
      serial: true,
    },
    orderBy: {
      serial: "desc"
    }
  });
  await prisma.chapter.updateMany({
    where: {
      novelId,
      serial: {
        gte: serial,
        lte: lastPublished?.serial
      }
    },
    data: {
      publishedAt: null,
    }
  })

  revalidatePath("/admin/chapter")
}

export const publishMany = async(novelId: string, serial: number) => {
  const lastPublished = await prisma.chapter.findFirst({
    where: {
      publishedAt: { not: null },
      novelId
    },
    select: {
      serial: true,
    },
    orderBy: {
      serial: "desc"
    }
  });

  await prisma.chapter.updateMany({
    where: {
      novelId,
      serial: {
        gt: lastPublished?.serial,
        lte: serial
      }
    },
    data: {
      publishedAt: new Date()
    }
  })

  revalidatePath("/admin/chapter")
}