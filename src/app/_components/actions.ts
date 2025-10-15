"use server";

import { getReleases } from "@/lib/db/query";
import { createFrequentCachedQuery, CACHE_TAGS } from "@/lib/cache";

// Create cached query for pagination with 1 hour revalidation
const getCachedReleases = createFrequentCachedQuery(
  getReleases,
  [CACHE_TAGS.releases.all, CACHE_TAGS.chapter.all],
  ['releases-pagination']
);

export const action = async ({ skip, premium }:{ skip?: number, premium: boolean }) => {
  return getCachedReleases({ skip, premium })
}