import "server-only";
import { db } from "."
import { chapter, novel, richText, user as userTable, volume } from "./schema";
import { and, desc, eq, gte, isNotNull, isNull, lte, sql, } from "drizzle-orm";
import {
  createCachedQuery,
  CACHE_PRESETS,
  CACHE_TAGS
} from "@/lib/cache";
import { revalidateTag } from "next/cache";

// Internal query function for releases
async function _getReleases({ skip = 0, premium = false }) {
  return db.select({
    number: chapter.number,
    title: chapter.title,
    novel: {
      title: novel.title,
      slug: novel.slug,
    },
    slug: chapter.slug,
    description: richText.text,
    publishedAt: chapter.publishedAt,
    createdAt: chapter.createdAt,
  }).from(chapter)
    .where(
      and(
        eq(chapter.premium, premium),
        isNotNull(chapter.publishedAt)
      )
    ).orderBy(
      desc(chapter.publishedAt),
      desc(chapter.createdAt)
    ).innerJoin(novel, eq(chapter.novelId, novel.id))
    .innerJoin(richText, eq(chapter.richTextId, richText.id)
    ).offset(skip).limit(10);
}

// Cached version with frequent preset (1 hour)
export const getReleases = createCachedQuery(
  _getReleases,
  {
    revalidate: CACHE_PRESETS.frequent.revalidate,
    tags: [CACHE_TAGS.releases.all, CACHE_TAGS.chapter.all],
  },
  ['releases']
);

// Internal query function for chapter slugs
async function _getChapterSlugMany() {
  return await db.select({
    chapter: chapter.slug,
    slug: novel.slug,
  }).from(chapter)
    .where(isNotNull(chapter.publishedAt))
    .orderBy(desc(chapter.publishedAt), desc(chapter.createdAt))
    .innerJoin(novel, eq(novel.id, chapter.novelId))
}

// Cached version with dynamic preset (12 hours)
export const getChapterSlugMany = createCachedQuery(
  _getChapterSlugMany,
  {
    revalidate: CACHE_PRESETS.dynamic.revalidate,
    tags: [CACHE_TAGS.chapter.all],
  },
  ['chapter-slugs']
);

// Internal query function for novel by ID
async function _getNovel(id: number) {
  return db.query.novel.findFirst({
    where: eq(novel.id, id)
  });
}

// Cached version with dynamic preset (12 hours)
export const getNovel = createCachedQuery(
  _getNovel,
  {
    revalidate: CACHE_PRESETS.dynamic.revalidate,
    tags: [CACHE_TAGS.novel.all],
  },
  ['novel-by-id']
);

// Internal query function for novel list
async function _getNovelList() {
  return db.select({
    slug: novel.slug,
    title: novel.title,
    id: novel.id,
  }).from(novel).orderBy(novel.title)
}

// Cached version with dynamic preset (12 hours)
export const getNovelList = createCachedQuery(
  _getNovelList,
  {
    revalidate: CACHE_PRESETS.dynamic.revalidate,
    tags: [CACHE_TAGS.novel.list],
  },
  ['novel-list']
);

// Internal query function for novel by slug
async function _getNovelBySlug(slug: string) {
  const data = await db.select({
    id: novel.id,
    description: {
      html: richText.html,
      text: richText.text
    },
    title: novel.title,
    thumbnail: novel.thumbnail,
  }).from(novel).where(eq(novel.slug, slug)).innerJoin(richText, eq(novel.richTextId, richText.id))
  return data[0]
}

// Cached version with dynamic preset (12 hours)
export const getNovelBySlug = createCachedQuery(
  _getNovelBySlug,
  {
    revalidate: CACHE_PRESETS.dynamic.revalidate,
    tags: [CACHE_TAGS.novel.all],
  },
  ['novel-by-slug']
);

// Internal query function for novel volumes
async function _getNovelVolumes(novelId: number) {
  return db.select().from(volume).where(eq(volume.novelId, novelId))
}

// Cached version with dynamic preset (12 hours)
export const getNovelVolumes = createCachedQuery(
  _getNovelVolumes,
  {
    revalidate: CACHE_PRESETS.dynamic.revalidate,
    tags: [CACHE_TAGS.volume.all],
  },
  ['novel-volumes']
);

// Internal query function for novel chapters
async function _getNovelChapters({ novelId, skip = 0, limit = 50 }: { novelId: number, skip?: number, limit?: number }) {
  return db.select({
    slug: chapter.slug,
    title: chapter.title,
    volume: {
      number: volume.number,
      title: volume.title
    },
    number: chapter.number,
    premium: chapter.premium,
  }).from(chapter)
    .where(and(eq(chapter.novelId, novelId), isNotNull(chapter.publishedAt)))
    .innerJoin(volume, eq(chapter.volumeId, volume.id))
    .orderBy(chapter.serial)
    .offset(skip).limit(limit)
}

// Cached version with dynamic preset (12 hours)
export const getNovelChapters = createCachedQuery(
  _getNovelChapters,
  {
    revalidate: CACHE_PRESETS.dynamic.revalidate,
    tags: [CACHE_TAGS.chapter.all],
  },
  ['novel-chapters']
);

// Internal query function for chapter by slug
async function _getChapterBySlug(slug: string) {
  const previousChapterSubquery = db
    .select({
      title: chapter.title,
      nextSerial: sql<typeof chapter.serial>`${chapter.serial} + 1`.as('next_serial'),
      novelId: chapter.novelId,
      slug: chapter.slug,
    })
    .from(chapter)
    .where(isNotNull(chapter.publishedAt))
    .as('previous_chapter');

  const nextChapterSubquery = db
    .select({
      title: chapter.title,
      prevSerial: sql<typeof chapter.serial>`${chapter.serial} - 1`.as('prev_serial'),
      novelId: chapter.novelId,
      slug: chapter.slug,
    })
    .from(chapter)
    .where(isNotNull(chapter.publishedAt))
    .as('next_chapter');

  const data = await db.select({
    number: chapter.number,
    title: chapter.title,
    premium: chapter.premium,
    content: richText.html,
    textContent: richText.text,
    serial: chapter.serial,
    novelId: chapter.novelId,
    novelTitle: novel.title,
    volumeNumber: volume.number,
    slug: chapter.slug,
    previous: {
      slug: previousChapterSubquery.slug,
      title: previousChapterSubquery.title
    },
    next: {
      slug: nextChapterSubquery.slug,
      title: nextChapterSubquery.title
    }
  })
    .from(chapter)
    .where(and(eq(chapter.slug, slug), isNotNull(chapter.publishedAt)))
    .innerJoin(richText, eq(chapter.richTextId, richText.id))
    .innerJoin(novel, eq(novel.id, chapter.novelId))
    .innerJoin(volume, eq(volume.id, chapter.volumeId))
    .leftJoin(
      previousChapterSubquery,
      and(
        eq(chapter.serial, previousChapterSubquery.nextSerial),
        eq(chapter.novelId, previousChapterSubquery.novelId),
      )
    )
    .leftJoin(
      nextChapterSubquery,
      and(
        eq(chapter.serial, nextChapterSubquery.prevSerial),
        eq(chapter.novelId, nextChapterSubquery.novelId)
      )
    )
  return data[0]
}

// Cached version with dynamic preset (12 hours)
export const getChapterBySlug = createCachedQuery(
  _getChapterBySlug,
  {
    revalidate: CACHE_PRESETS.dynamic.revalidate,
    tags: [CACHE_TAGS.chapter.all],
  },
  ['chapter-by-slug']
);

// Internal query function for chapters between serial numbers
async function _getNovelChaptersBetweenSerial({ novelId, first, last }: { novelId: number, first: number, last: number }) {
  return db.select({
    slug: chapter.slug
  }).from(chapter)
    .where(and(gte(chapter.serial, first), lte(chapter.serial, last), eq(chapter.novelId, novelId), isNotNull(chapter.publishedAt)))
}

// Cached version with dynamic preset (12 hours)
export const getNovelChaptersBetweenSerial = createCachedQuery(
  _getNovelChaptersBetweenSerial,
  {
    revalidate: CACHE_PRESETS.dynamic.revalidate,
    tags: [CACHE_TAGS.chapter.all],
  },
  ['chapters-between-serial']
);

// Internal query function for novel first chapter
async function _getNovelFirstChapter(novelId: number) {
  const data = await db.select({
    slug: chapter.slug,
    novel: novel.slug,
  }).from(chapter)
    .where(and(eq(chapter.novelId, novelId), isNotNull(chapter.publishedAt)))
    .innerJoin(novel, eq(chapter.novelId, novel.id))
    .orderBy(chapter.serial)
    .limit(1)

  return data[0]
}

// Cached version with dynamic preset (12 hours)
export const getNovelFirstChapter = createCachedQuery(
  _getNovelFirstChapter,
  {
    revalidate: CACHE_PRESETS.dynamic.revalidate,
    tags: [CACHE_TAGS.chapter.all],
  },
  ['novel-first-chapter']
);

// Internal query function for novel last chapter
async function _getNovelLastChapter(novelId: number) {
  const data = await db.select({
    slug: chapter.slug,
    novel: novel.slug,
  }).from(chapter)
    .where(and(eq(chapter.novelId, novelId), isNotNull(chapter.publishedAt)))
    .innerJoin(novel, eq(chapter.novelId, novel.id))
    .orderBy(desc(chapter.serial))
    .limit(1);

  return data.at(0)
}

// Cached version with dynamic preset (12 hours)
export const getNovelLastChapter = createCachedQuery(
  _getNovelLastChapter,
  {
    revalidate: CACHE_PRESETS.dynamic.revalidate,
    tags: [CACHE_TAGS.chapter.all],
  },
  ['novel-last-chapter']
);

// Internal query function for chapters (admin)
async function _getChapters({ novelId, skip = 0, limit = 25 }: { novelId?: number, skip?: number, limit?: number }) {
  const data = db.select({
    id: chapter.id,
    serial: chapter.serial,
    slug: chapter.slug,
    number: chapter.number,
    title: chapter.title,
    publishedAt: chapter.publishedAt,
    premium: chapter.premium,
    novel: {
      title: novel.title,
      id: novel.id,
      slug: novel.slug,
    }
  }).from(chapter).innerJoin(novel, eq(chapter.novelId, novel.id))
  if (novelId) data.where(eq(chapter.novelId, novelId)).orderBy(desc(chapter.serial))
  else data.orderBy(desc(chapter.createdAt))

  return await data.limit(limit).offset(skip);
}

// Cached version with realtime preset (30 seconds) for admin
export const getChapters = createCachedQuery(
  _getChapters,
  {
    revalidate: CACHE_PRESETS.realtime.revalidate,
    tags: [CACHE_TAGS.chapter.all],
  },
  ['chapters-admin']
);

export const freeChapters = async ({ novelId, first, last }: { novelId: number, first: number, last: number }) => {
  const result = await db.update(chapter).set({
    premium: false,
    publishedAt: new Date()
  })
    .where(
      and(
        eq(chapter.novelId, novelId),
        gte(chapter.serial, first),
        lte(chapter.serial, last)
      )
    )
    .returning({
      slug: chapter.slug
    });

  // Invalidate caches after successful update
  try {
    revalidateTag(CACHE_TAGS.chapter.all);
    revalidateTag(CACHE_TAGS.releases.all);
    revalidateTag(CACHE_TAGS.releases.free);
    revalidateTag(CACHE_TAGS.releases.premium);
  } catch (error) {
    console.error('Cache invalidation failed:', error);
    // Continue execution - cache invalidation failure shouldn't break the mutation
  }

  return result;
}

export const publishChapters = async ({ novelId, serial }: { novelId: number, serial: number }) => {
  const result = await db.update(chapter).set({
    publishedAt: new Date()
  })
    .where(
      and(
        lte(chapter.serial, serial),
        isNull(chapter.publishedAt),
        eq(chapter.novelId, novelId)
      )
    )
    .returning({
      slug: chapter.slug
    });

  // Invalidate caches after successful update
  try {
    revalidateTag(CACHE_TAGS.chapter.all);
    revalidateTag(CACHE_TAGS.releases.all);
    revalidateTag(CACHE_TAGS.releases.free);
    revalidateTag(CACHE_TAGS.releases.premium);
  } catch (error) {
    console.error('Cache invalidation failed:', error);
    // Continue execution - cache invalidation failure shouldn't break the mutation
  }

  return result;
}

// Internal query function for latest chapter
async function _getLatestChapter(novelId: number) {
  try {
    const data = await db.select({
      serial: chapter.serial,
      number: chapter.number,
      volume: volume.number,
      novel: novel.title
    })
      .from(chapter)
      .where(eq(chapter.novelId, novelId))
      .innerJoin(volume, eq(chapter.volumeId, volume.id))
      .innerJoin(novel, eq(chapter.novelId, novel.id))
      .orderBy(desc(chapter.serial))
      .limit(1)

    return data.at(0);
  } catch (error) {
    console.error(error)
    throw new Error("Something seems wrong.");
  }
}

// Cached version with realtime preset (30 seconds) for admin
export const getLatestChapter = createCachedQuery(
  _getLatestChapter,
  {
    revalidate: CACHE_PRESETS.realtime.revalidate,
    tags: [CACHE_TAGS.chapter.all],
  },
  ['latest-chapter']
);

// Internal query function for novel from ID
async function _getNovelFromId(id: number) {
  return (await db.select().from(novel).where(eq(novel.id, id))).at(0)
}

// Cached version with dynamic preset (12 hours)
export const getNovelFromId = createCachedQuery(
  _getNovelFromId,
  {
    revalidate: CACHE_PRESETS.dynamic.revalidate,
    tags: [CACHE_TAGS.novel.all],
  },
  ['novel-from-id']
);

// Internal query function for user role
async function _getUserRole(id: string) {
  const data = await db.select().from(userTable).where(eq(userTable.clerkId, id));
  const userData = data.at(0);

  return userData ? userData.role : "MEMBER"
}

// Cached version with frequent preset (1 hour) using config factory for dynamic tags
export const getUserRole = createCachedQuery(
  _getUserRole,
  (id: string) => ({
    revalidate: CACHE_PRESETS.frequent.revalidate,
    tags: [CACHE_TAGS.role.byUser(id)],
  }),
  ['user-role']
);

// Internal query function for suggested novels
async function _getSuggestedNovels({ currentNovelId, count = 3 }: { currentNovelId: number, count?: number }) {
  return db.select({
    id: novel.id,
    slug: novel.slug,
    title: novel.title,
    thumbnail: novel.thumbnail,
    description: richText.text,
  })
    .from(novel)
    .innerJoin(richText, eq(novel.richTextId, richText.id))
    .where(
      and(
        sql`${novel.id} != ${currentNovelId}`,
        isNotNull(novel.publishedAt),
        sql`EXISTS (
          SELECT 1 FROM ${chapter} 
          WHERE ${chapter.novelId} = ${novel.id} 
          AND ${chapter.publishedAt} IS NOT NULL
        )`
      )
    )
    .orderBy(sql`RANDOM()`)
    .limit(count);
}

// Cached version with dynamic preset (12 hours)
export const getSuggestedNovels = createCachedQuery(
  _getSuggestedNovels,
  {
    revalidate: CACHE_PRESETS.dynamic.revalidate,
    tags: [CACHE_TAGS.novel.all, CACHE_TAGS.chapter.all],
  },
  ['suggested-novels']
);