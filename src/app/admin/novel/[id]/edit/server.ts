import "server-only";

import { db } from "@/lib/db";

export type Novel = Awaited<ReturnType<typeof getNovel>>

export const getNovel = async(id: number) => {
  const data = await db.query.novel.findFirst({
    where: (novelTable, { eq }) => eq(novelTable.id, id),
    columns: {
      title: true,
      thumbnail: true,
      id: true,
      slug: true,
    },
    with: {
      richText: {
        columns: {
          id: true,
          markdown: true,
        }
      }
    }
  });

  if(!data) throw Error("Not Found!")
  return data;
}