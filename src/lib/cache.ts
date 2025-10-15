import "server-only";
import { unstable_cache } from "next/cache";

/**
 * Cache configuration interface
 */
export interface CacheConfig {
  revalidate?: number;
  tags?: string[] | ((...args: any[]) => string[]);
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
 * Creates a cached query function with consistent configuration.
 * 
 * This utility wraps Next.js's unstable_cache to provide a standardized caching interface
 * with support for both static and dynamic cache tag generation. Cache tags enable precise
 * cache invalidation using Next.js's revalidateTag function.
 * 
 * @param queryFn - The async function to cache
 * @param configOrFactory - Cache configuration object or factory function
 * @param keyParts - Additional key parts for cache key uniqueness (optional)
 * @returns Cached version of the query function
 * 
 * @example Static configuration (for queries with static tags)
 * Use this approach when cache tags don't depend on function arguments.
 * This is the simplest pattern and works for most queries that invalidate entire categories.
 * 
 * ```ts
 * // Query that fetches all novels - invalidate with CACHE_TAGS.novel.all
 * const getNovelList = createCachedQuery(
 *   async () => db.select().from(novel),
 *   { 
 *     revalidate: CACHE_PRESETS.dynamic.revalidate,
 *     tags: [CACHE_TAGS.novel.all]
 *   },
 *   ['novel-list']
 * );
 * 
 * // Query with multiple static tags
 * const getReleases = createCachedQuery(
 *   async (skip: number, premium: boolean) => {
 *     return db.query.chapter.findMany({ ... });
 *   },
 *   {
 *     revalidate: CACHE_PRESETS.dynamic.revalidate,
 *     tags: [CACHE_TAGS.releases.all, CACHE_TAGS.chapter.all]
 *   },
 *   ['releases']
 * );
 * ```
 * 
 * @example Dynamic configuration with config factory (recommended for argument-derived tags)
 * Use this approach when cache tags need to include specific resource identifiers from arguments.
 * This enables precise cache invalidation for individual resources without affecting others.
 * 
 * ```ts
 * // Query that fetches a specific user's role - invalidate with CACHE_TAGS.role.byUser(userId)
 * const getUserRole = createCachedQuery(
 *   async (userId: string) => {
 *     return db.query.user.findFirst({ where: eq(user.id, userId) });
 *   },
 *   (userId: string) => ({
 *     revalidate: CACHE_PRESETS.frequent.revalidate,
 *     tags: [CACHE_TAGS.role.byUser(userId)]  // Tag includes actual userId
 *   }),
 *   ['user-role']
 * );
 * 
 * // Query with multiple dynamic tags
 * const getChapterWithNovel = createCachedQuery(
 *   async (chapterId: number, novelId: number) => {
 *     return db.query.chapter.findFirst({ ... });
 *   },
 *   (chapterId: number, novelId: number) => ({
 *     revalidate: CACHE_PRESETS.dynamic.revalidate,
 *     tags: [
 *       CACHE_TAGS.chapter.byId(chapterId),
 *       CACHE_TAGS.novel.byId(novelId)
 *     ]
 *   }),
 *   ['chapter-with-novel']
 * );
 * ```
 * 
 * @example Dynamic tags with tags function (alternative approach)
 * Use this approach when only the tags need to be dynamic, but revalidate time is static.
 * This is more concise than a config factory when you don't need to compute other config values.
 * 
 * ```ts
 * // Same functionality as config factory, but more concise
 * const getUserRole = createCachedQuery(
 *   async (userId: string) => {
 *     return db.query.user.findFirst({ where: eq(user.id, userId) });
 *   },
 *   {
 *     revalidate: CACHE_PRESETS.frequent.revalidate,
 *     tags: (userId: string) => [CACHE_TAGS.role.byUser(userId)]
 *   },
 *   ['user-role']
 * );
 * 
 * // Conditional tags based on arguments
 * const getNovelData = createCachedQuery(
 *   async (novelId: number, includeChapters: boolean) => {
 *     return db.query.novel.findFirst({ ... });
 *   },
 *   {
 *     revalidate: CACHE_PRESETS.dynamic.revalidate,
 *     tags: (novelId: number, includeChapters: boolean) => {
 *       const tags = [CACHE_TAGS.novel.byId(novelId)];
 *       if (includeChapters) {
 *         tags.push(CACHE_TAGS.chapter.byNovel(novelId));
 *       }
 *       return tags;
 *     }
 *   },
 *   ['novel-data']
 * );
 * ```
 * 
 * @remarks
 * **When to use each approach:**
 * 
 * - **Static config**: Use when tags don't depend on arguments (e.g., `CACHE_TAGS.novel.all`)
 *   - Simplest approach
 *   - Best for queries that invalidate entire categories
 *   - Example: List all novels, get all releases
 * 
 * - **Config factory**: Use when tags need argument values AND you might compute other config
 *   - Most flexible approach
 *   - Best for resource-specific invalidation
 *   - Example: Get user by ID, get novel by ID
 *   - Enables precise cache invalidation: `revalidateTag(CACHE_TAGS.role.byUser('user-123'))`
 * 
 * - **Tags function**: Use when only tags need to be dynamic
 *   - More concise than config factory
 *   - Best when revalidate time is static but tags are dynamic
 *   - Example: Get user role, get chapter by ID
 * 
 * **Cache invalidation:**
 * Cache tags must match exactly between caching and invalidation:
 * ```ts
 * // Caching with dynamic tag
 * const role = await getUserRole('user-123');  // Creates cache with tag 'role:user-123'
 * 
 * // Invalidation must use same tag
 * revalidateTag(CACHE_TAGS.role.byUser('user-123'));  // ✅ Matches 'role:user-123'
 * revalidateTag('role:user-123');                      // ✅ Also works
 * revalidateTag(CACHE_TAGS.role.byUser('{userId}'));  // ❌ Won't match (placeholder string)
 * ```
 * 
 * **Type safety:**
 * TypeScript ensures config factories and tags functions receive the correct argument types:
 * ```ts
 * const getUserRole = createCachedQuery(
 *   async (userId: string) => { ... },
 *   (userId: number) => ({ ... })  // ❌ Type error: number vs string
 * );
 * ```
 */
// Overload 1: Config factory (new - for dynamic tags)
export function createCachedQuery<TArgs extends unknown[], TResult>(
  queryFn: (...args: TArgs) => Promise<TResult>,
  configFactory: (...args: TArgs) => CacheConfig,
  keyParts?: string[]
): (...args: TArgs) => Promise<TResult>;

// Overload 2: Static config (existing - for backward compatibility)
export function createCachedQuery<TArgs extends unknown[], TResult>(
  queryFn: (...args: TArgs) => Promise<TResult>,
  config: CacheConfig,
  keyParts?: string[]
): (...args: TArgs) => Promise<TResult>;

// Implementation
export function createCachedQuery<TArgs extends unknown[], TResult>(
  queryFn: (...args: TArgs) => Promise<TResult>,
  configOrFactory: CacheConfig | ((...args: TArgs) => CacheConfig),
  keyParts: string[] = []
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs) => {
    // Determine if config is a factory or static object
    const isFactory = typeof configOrFactory === 'function';
    
    // Get config (either by calling factory or using static config)
    const config = isFactory ? configOrFactory(...args) : configOrFactory;
    
    // Resolve tags (either by calling tags function or using static array)
    const tags = typeof config.tags === 'function' 
      ? config.tags(...args) 
      : config.tags;
    
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
        tags: tags,
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
