import "server-only";
import { CACHE_TAGS } from "@/lib/cache-constants";
import { invalidatePathSafe, invalidateTagSafe } from "@/lib/cache";

/**
 * Single invalidation point for every content mutation that touches search-relevant
 * data (novel/chapter title or body, publish/free flow, tags, status...). The native
 * `search_vector` stays correct through the DB triggers in migration 0008; this
 * helper only purges the cached result sets so the next request re-reads.
 *
 * Mirrors the existing mutation pattern (`invalidateTagSafe` + `invalidatePathSafe`)
 * and never throws: a cache hiccup must not break a content mutation.
 */
export function invalidateSearchCaches(): void {
  try {
    invalidateTagSafe(CACHE_TAGS.search.all);
    invalidatePathSafe("/search", "page");
  } catch (error) {
    console.error("Search cache invalidation failed:", error);
  }
}
