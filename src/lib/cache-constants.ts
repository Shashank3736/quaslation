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
    updateGeneral: "novel:update",
    create: "novel:create",
  },
  // Chapter-related tags
  chapter: {
    all: "chapter:all",
    byId: (id: number) => `chapter:${id}`,
    bySlug: (slug: string) => `chapter:slug:${slug}`,
    byNovel: (novelId: number) => `chapter:novel:${novelId}`,
    update: (id: number) => `chapter:update:${id}`,
    updateGeneral: "chapter:update",
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
 * Invalidation preset definitions for 1-click admin cache resets
 */
export const CACHE_INVALIDATION_PRESETS = {
  novels: {
    id: "novels",
    name: "All Novels",
    description: "Invalidates novel list, admin novel table, and novel discovery pages",
    tags: [
      CACHE_TAGS.novel.all,
      CACHE_TAGS.novel.list,
      CACHE_TAGS.novel.create,
      CACHE_TAGS.novel.updateGeneral,
      CACHE_TAGS.chapter.updateFree,
    ],
    paths: ["/novels", "/admin/novel", "/admin/chapters", "/"],
  },
  chapters: {
    id: "chapters",
    name: "All Chapters",
    description: "Invalidates chapter queries, admin chapter views, and chapter listings",
    tags: [
      CACHE_TAGS.chapter.all,
      CACHE_TAGS.chapter.updateGeneral,
      CACHE_TAGS.chapter.updateFree,
      CACHE_TAGS.chapter.updatePublish,
    ],
    paths: ["/admin/chapters", "/novels"],
  },
  releases: {
    id: "releases",
    name: "Home & Latest Releases",
    description: "Invalidates latest free/premium releases and home page feed",
    tags: [
      CACHE_TAGS.releases.all,
      CACHE_TAGS.releases.free,
      CACHE_TAGS.releases.premium,
      CACHE_TAGS.chapter.all,
      CACHE_TAGS.chapter.updateFree,
    ],
    paths: ["/home", "/"],
  },
  sitemaps: {
    id: "sitemaps",
    name: "Sitemaps & RSS Feeds",
    description: "Invalidates novel/chapter sitemaps and RSS XML feeds",
    tags: [
      CACHE_TAGS.novel.create,
      CACHE_TAGS.chapter.updatePublish,
      CACHE_TAGS.chapter.updateFree,
    ],
    paths: ["/novels/sitemap", "/chapters/sitemap", "/rss.xml"],
  },
  all: {
    id: "all",
    name: "Full Cache Reset",
    description: "Purges all known cache tags and revalidates all main routes",
    tags: [
      CACHE_TAGS.novel.all,
      CACHE_TAGS.novel.list,
      CACHE_TAGS.novel.create,
      CACHE_TAGS.novel.updateGeneral,
      CACHE_TAGS.chapter.all,
      CACHE_TAGS.chapter.updateGeneral,
      CACHE_TAGS.chapter.updateFree,
      CACHE_TAGS.chapter.updatePublish,
      CACHE_TAGS.releases.all,
      CACHE_TAGS.releases.free,
      CACHE_TAGS.releases.premium,
      CACHE_TAGS.volume.all,
    ],
    paths: [
      "/",
      "/home",
      "/novels",
      "/admin",
      "/admin/novel",
      "/admin/chapters",
      "/rss.xml",
      "/novels/sitemap",
      "/chapters/sitemap",
    ],
  },
} as const;

export type PresetKey = keyof typeof CACHE_INVALIDATION_PRESETS;

/**
 * Detailed documentation of cache tags used across the application
 */
export const CACHE_TAG_DOCUMENTATION = [
  {
    tag: "novel:create",
    description: "Novel catalog discovery page and novel sitemap",
    usedIn: ["/novels", "/novels/sitemap"],
    recommendedFor: "After inserting a new novel directly into the DB",
  },
  {
    tag: "novel:update",
    description: "Novel list in admin dashboard and public novel catalog",
    usedIn: ["/admin/novel", "/novels"],
    recommendedFor: "After editing title, thumbnail, or description of novels in DB",
  },
  {
    tag: "novel:all",
    description: "Cached database queries for all novel entries",
    usedIn: ["@/lib/db/query getNovel, getNovelBySlug"],
    recommendedFor: "After any database changes to the novel table",
  },
  {
    tag: "novel:list",
    description: "Cached database query for novel list dropdowns and navigation",
    usedIn: ["@/lib/db/query getNovelList", "/admin/chapters"],
    recommendedFor: "When novels do not show in admin chapter selection or lists",
  },
  {
    tag: "novel:update:[slug]",
    description: "Novel detail page, chapter list, novel metadata, and novel RSS feed",
    usedIn: ["/novels/[slug]", "/novels/[slug]/rss.xml"],
    recommendedFor: "When updating a specific novel (replace [slug] with novel slug)",
  },
  {
    tag: "chapter:all",
    description: "All chapter query caches across the application",
    usedIn: ["@/lib/db/query chapter queries", "/home"],
    recommendedFor: "After inserting or altering chapters in DB",
  },
  {
    tag: "chapter:update:free",
    description: "Free chapter updates, homepage latest releases, novel list, and RSS feed",
    usedIn: ["/novels", "/home", "/rss.xml"],
    recommendedFor: "After adding or releasing free chapters",
  },
  {
    tag: "chapter:update:publish",
    description: "Published chapters query and chapter sitemap",
    usedIn: ["/chapters/sitemap"],
    recommendedFor: "After publishing new chapters",
  },
  {
    tag: "chapter:update:[slug]",
    description: "Individual chapter content page and comments",
    usedIn: ["/novels/[slug]/[chapter]"],
    recommendedFor: "When a specific chapter text or title was edited",
  },
  {
    tag: "releases:all",
    description: "Home page latest releases feed (both free and premium)",
    usedIn: ["/home", "/"],
    recommendedFor: "After releasing new chapters or upcoming chapters",
  },
] as const;
