"use server";

import { getNovelChapters } from "@/lib/db/query";
import { unstable_cache } from "next/cache";

export const getData = unstable_cache(getNovelChapters, [], {
  tags: ["chapter_update"],
  revalidate: 12*3600
})