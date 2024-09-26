import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";
import "server-only";

export const getNovelList = unstable_cache(async () => {
  return await db.query.novel.findMany({
    columns: {
      id: true,
      title: true,
    },
    orderBy: (novelTable) => novelTable.title
  })
}, [], {
  revalidate: 7*24*3600,
  tags: ["novel:update"]
});