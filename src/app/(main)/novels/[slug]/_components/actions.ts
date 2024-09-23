"use server";

import { getNovelChapters } from "@/lib/db/query";
import { unstable_cache } from "next/cache";

export const getData = async ({ novelId, skip, limit, slug}:{ novelId: number, skip?: number, limit?: number, slug: string }) => {
  const data = unstable_cache(getNovelChapters, [], {
    revalidate: 12*3600,
    tags: [`novel:update:${slug}`]
  });

  return data({ novelId, skip, limit });
}