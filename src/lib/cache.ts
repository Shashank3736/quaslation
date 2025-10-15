import "server-only";
import { unstable_cache } from "next/cache";

/**
 * Cache configuration interface
 */
export interface CacheConfig {
  revalidate?: number;
  tags?: string[];
}

/**
 * Standardized cache configuration presets
 */
export const CACHE_PRESETS = {
  /** Static content - 7 days (604800 seconds) */
  static: {
    revalidate: 604800,
  },
  /** Dynamic content - 12 hours (43200 seconds) */
  dynamic: {
    revalidate: 43200,
  },
  /** Frequently updated content - 1 hour (3600 seconds) */
  frequent: {
    revalidate: 3600,
  },
  /** Real-time content - 30 seconds */
  realtime: {
    revalidate: 30,
  },
} as const;

/**
 * Cache tag constants for consistent cache invalidation
 */
export const CACHE_TAGS = {
  // Novel-related tags
  novel: {
    all: "novel:all",
    byId: (id: number) => `novel:${id}`,
    bySlug: (slug: string) => `novel:slug:${slug}`,
    list: "novel:list",
    update: (id: number) => `novel:update:${id}`,
    create: "novel:create",
  },
  // Chapter-related tags
  chapter: {
    all: "chapter:all",
    byId: (id: number) => `chapter:${id}`,
    bySlug: (slug: string) => `chapter:slug:${slug}`,
    byNovel: (novelId: number) => `chapter:novel:${novelId}`,
    update: (id: number) => `chapter:update:${id}`,
    updateFree: "chapter:update:free",
    updatePublish: "chapter:update:publish",
    updateContent: (id: number) => `chapter:update:content:${id}`,
  },
  // Release-related tags
  releases: {
    all: "releases:all",
    free: "releases:free",
    premium: "releases:premium",
    byPage: (skip: number, premium: boolean) => 
      `releases:${skip}:${premium}`,
  },
  // Volume-related tags
  volume: {
    all: "volume:all",
    byNovel: (novelId: number) => `volume:novel:${novelId}`,
  },
  // User role tags
  role: {
    byUser: (userId: string) => `role:${userId}`,
  },
} as const;

/**
 * Creates a cached query function with consistent configuration
 * 
 * @param queryFn - The async function to cache
 * @param config - Cache configuration (revalidate time and tags)
 * @param keyParts - Additional key parts for cache key uniqueness
 * @returns Cached version of the query function
 * 
 * @example
 * ```ts
 * const getCachedNovel = createCachedQuery(
 *   async (slug: string) => getNovelBySlug(slug),
 *   { 
 *     revalidate: CACHE_PRESETS.dynamic.revalidate,
 *     tags: [CACHE_TAGS.novel.all]
 *   },
 *   ['novel-by-slug']
 * );
 * ```
 */
export function createCachedQuery<TArgs extends unknown[], TResult>(
  queryFn: (...args: TArgs) => Promise<TResult>,
  config: CacheConfig,
  keyParts: string[] = []
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs) => {
    // Create a unique cache key based on function name, key parts, and arguments
    const cacheKey = [
      queryFn.name || "anonymous",
      ...keyParts,
      ...args.map((arg) => JSON.stringify(arg)),
    ];

    // Wrap the query function with unstable_cache
    const cachedFn = unstable_cache(
      async () => queryFn(...args),
      cacheKey,
      {
        revalidate: config.revalidate,
        tags: config.tags,
      }
    );

    return cachedFn();
  };
}

/**
 * Helper to create a cached query with static preset
 */
export function createStaticCachedQuery<TArgs extends unknown[], TResult>(
  queryFn: (...args: TArgs) => Promise<TResult>,
  tags: string[] = [],
  keyParts: string[] = []
) {
  return createCachedQuery(queryFn, { ...CACHE_PRESETS.static, tags }, keyParts);
}

/**
 * Helper to create a cached query with dynamic preset
 */
export function createDynamicCachedQuery<TArgs extends unknown[], TResult>(
  queryFn: (...args: TArgs) => Promise<TResult>,
  tags: string[] = [],
  keyParts: string[] = []
) {
  return createCachedQuery(queryFn, { ...CACHE_PRESETS.dynamic, tags }, keyParts);
}

/**
 * Helper to create a cached query with frequent preset
 */
export function createFrequentCachedQuery<TArgs extends unknown[], TResult>(
  queryFn: (...args: TArgs) => Promise<TResult>,
  tags: string[] = [],
  keyParts: string[] = []
) {
  return createCachedQuery(queryFn, { ...CACHE_PRESETS.frequent, tags }, keyParts);
}

/**
 * Helper to create a cached query with realtime preset
 */
export function createRealtimeCachedQuery<TArgs extends unknown[], TResult>(
  queryFn: (...args: TArgs) => Promise<TResult>,
  tags: string[] = [],
  keyParts: string[] = []
) {
  return createCachedQuery(queryFn, { ...CACHE_PRESETS.realtime, tags }, keyParts);
}
