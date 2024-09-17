"use server";

import { getReleases } from "@/lib/db/query";
import { unstable_cache } from "next/cache";

export const action = unstable_cache(getReleases, [], {
  tags: ["chapter_update"],
  revalidate: 3600
})