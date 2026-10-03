import "server-only";
import { eq, isNotNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { novel, novelTag, richText, tag } from "@/lib/db/schema";
import { CACHE_TAGS, createCachedQuery, CACHE_PRESETS } from "@/lib/cache";
import { AUTOCOMPLETE_LIMIT, FALLBACK_LIMIT } from "./constants";
import {
  buildHitHref,
  buildLikePattern,
  buildSearchCacheKey,
  decodeSearchCursor,
  encodeSearchCursor,
  isSearchableQuery,
  normalizeQuery,
} from "./normalize";
import type {
  AutocompleteHit,
  NovelStatus,
  SearchFacets,
  SearchHit,
  SearchHitType,
  SearchParams,
  SearchResultSet,
} from "./types";
import { NOVEL_STATUSES } from "./types";

/**
 * Raw row shape returned by the UNION search query. Column order is irrelevant: rows
 * are read by name (see `toRecord`), with positional fallback for array rows.
 */
interface SearchRow {
  doc_type: SearchHitType;
  id: number;
  title: string;
  novel_slug: string;
  chapter_slug: string | null;
  thumbnail: string | null;
  chapter_number: number | null;
  volume_number: number | null;
  sort_date: Date | string | null;
  author: string | null;
  language: string | null;
  status: string | null;
  tags: string[] | null;
  word_count: number | null;
  snippet: string | null;
  rank: number;
}

interface AutocompleteRow {
  doc_type: SearchHitType;
  title: string;
  novel_title: string | null;
  novel_slug: string;
  chapter_slug: string | null;
  chapter_number: number | null;
  volume_number: number | null;
  thumbnail: string | null;
}

/**
 * Normalises a driver row into a plain object. `postgres-js` (via `db.execute`) hands
 * back array-like rows, but the named properties are what the mappers read, so the row
 * is carried through as-is.
 */
function toRecord<T>(row: unknown): T {
  return row as T;
}

const HIGHLIGHT_OPTIONS =
  "MaxFragments=1, MaxWords=24, MinWords=8, StartSel=<mark>, StopSel=</mark>";

function asIsoDate(value: Date | string | null): string | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.toISOString();
  return value;
}

function asStatus(value: string | null): NovelStatus | null {
  if (value === "ONGOING" || value === "COMPLETED" || value === "HIATUS") return value;
  return null;
}

function mapSearchRow(row: SearchRow): SearchHit {
  const hit: SearchHit = {
    docType: row.doc_type,
    id: row.id,
    title: row.title,
    novelSlug: row.novel_slug,
    chapterSlug: row.chapter_slug,
    thumbnail: row.thumbnail,
    chapterNumber:
      row.chapter_number === null ? null : Number(row.chapter_number),
    volumeNumber: row.volume_number === null ? null : Number(row.volume_number),
    sortDate: asIsoDate(row.sort_date),
    author: row.author,
    language: row.language,
    status: asStatus(row.status),
    tags: Array.isArray(row.tags) ? row.tags : [],
    wordCount: row.word_count === null ? 0 : Number(row.word_count),
    snippet: row.snippet,
    rank: Number(row.rank),
    href: "",
  };
  hit.href = buildHitHref(hit);
  return hit;
}

function mapAutocompleteRow(row: AutocompleteRow): AutocompleteHit {
  const hit: AutocompleteHit = {
    docType: row.doc_type,
    title: row.title,
    novelTitle: row.novel_title,
    novelSlug: row.novel_slug,
    chapterSlug: row.chapter_slug,
    chapterNumber:
      row.chapter_number === null ? null : Number(row.chapter_number),
    volumeNumber: row.volume_number === null ? null : Number(row.volume_number),
    thumbnail: row.thumbnail,
    href: "",
  };
  hit.href = buildHitHref(hit);
  return hit;
}

async function _searchContent(params: SearchParams): Promise<SearchResultSet> {
  const normalized = normalizeQuery(params.q);

  if (!isSearchableQuery(normalized)) {
    return searchFallback(FALLBACK_LIMIT);
  }

  const like = buildLikePattern(normalized);
  const cursor = decodeSearchCursor(params.cursor);
  const fetchLimit = params.limit + 1;

  const tagFilter =
    params.tagIds.length > 0
      ? sql`AND "novelId" IN (
        SELECT nt."novelId" FROM "NovelTag" nt
        WHERE nt."tagId" IN ${sql.join(
          params.tagIds.map((id) => sql`${id}`),
          sql`, `
        )}
      )`
      : sql``;

  const statusFilter =
    params.statuses.length > 0
      ? sql`AND COALESCE("novelStatus", 'ONGOING') IN ${sql.join(
          params.statuses.map((status) => sql`${status}`),
          sql`, `
        )}`
      : sql``;

  const languageFilter = params.language
    ? sql`AND lower("novelLanguage") = ${params.language.toLowerCase()}`
    : sql``;

  const authorFilter = params.author
    ? sql`AND "novelAuthor" ILIKE ${buildLikePattern(params.author)}`
    : sql``;

  const wordCountFilter =
    params.minWordCount !== null || params.maxWordCount !== null
      ? sql`AND COALESCE("richWordCount", 0) >= ${params.minWordCount ?? 0}
            AND COALESCE("richWordCount", 0) <= ${params.maxWordCount ?? 2_147_483_647}`
      : sql``;

  const novelSide = sql`
    SELECT
      'novel'::text AS doc_type,
      n."id" AS id,
      n."title" AS title,
      n."slug" AS novel_slug,
      NULL::text AS chapter_slug,
      n."thumbnail" AS thumbnail,
      NULL::double precision AS chapter_number,
      NULL::double precision AS volume_number,
      COALESCE(n."publishedAt", n."createdAt") AS sort_date,
      n."author" AS author,
      n."language" AS language,
      n."status"::text AS status,
      COALESCE((
        SELECT array_agg(t."name" ORDER BY t."name")
        FROM "NovelTag" nt JOIN "Tag" t ON t."id" = nt."tagId"
        WHERE nt."novelId" = n."id"
      ), ARRAY[]::text[]) AS tags,
      COALESCE(rt."wordCount", 0) AS word_count,
      ts_headline('english', COALESCE(rt."text", ''), p.tsq, '${sql.raw(HIGHLIGHT_OPTIONS)}') AS snippet,
      n."id" AS "novelId",
      n."status"::text AS "novelStatus",
      n."language" AS "novelLanguage",
      n."author" AS "novelAuthor",
      rt."wordCount" AS "richWordCount",
      ts_rank_cd(n."search_vector", p.tsq) AS base_rank
    FROM "Novel" n
    JOIN "RichText" rt ON rt."id" = n."richTextId"
    CROSS JOIN params p
    WHERE (
      COALESCE(n."search_vector" @@ p.tsq, FALSE)
      OR n."title" ILIKE ${like}
      OR word_similarity(p.q, n."title") > 0.45
      OR word_similarity(p.q, COALESCE(n."author", '')) > 0.6
    )
    ${tagFilter}
    ${statusFilter}
    ${languageFilter}
    ${authorFilter}
    ${wordCountFilter}
  `;

  const chapterSide = sql`
    SELECT
      'chapter'::text AS doc_type,
      c."id" AS id,
      c."title" AS title,
      n."slug" AS novel_slug,
      c."slug" AS chapter_slug,
      NULL::text AS thumbnail,
      c."number" AS chapter_number,
      v."number" AS volume_number,
      COALESCE(c."publishedAt", c."createdAt") AS sort_date,
      n."author" AS author,
      n."language" AS language,
      n."status"::text AS status,
      COALESCE((
        SELECT array_agg(t."name" ORDER BY t."name")
        FROM "NovelTag" nt JOIN "Tag" t ON t."id" = nt."tagId"
        WHERE nt."novelId" = n."id"
      ), ARRAY[]::text[]) AS tags,
      COALESCE(rt."wordCount", 0) AS word_count,
      ts_headline('english', COALESCE(rt."text", ''), p.tsq, '${sql.raw(HIGHLIGHT_OPTIONS)}') AS snippet,
      c."novelId" AS "novelId",
      n."status"::text AS "novelStatus",
      n."language" AS "novelLanguage",
      n."author" AS "novelAuthor",
      rt."wordCount" AS "richWordCount",
      ts_rank_cd(c."search_vector", p.tsq) AS base_rank
    FROM "Chapter" c
    JOIN "Novel" n ON n."id" = c."novelId"
    JOIN "RichText" rt ON rt."id" = c."richTextId"
    JOIN "Volume" v ON v."id" = c."volumeId"
    CROSS JOIN params p
    WHERE c."publishedAt" IS NOT NULL
      AND (${params.includePremium} OR c."premium" = FALSE)
      AND (
        COALESCE(c."search_vector" @@ p.tsq, FALSE)
        OR c."title" ILIKE ${like}
        OR word_similarity(p.q, c."title") > 0.45
      )
      ${tagFilter}
      ${statusFilter}
      ${languageFilter}
      ${authorFilter}
      ${wordCountFilter}
  `;

  const sides =
    params.type === "novel"
      ? novelSide
      : params.type === "chapter"
        ? chapterSide
        : sql`${novelSide} UNION ALL ${chapterSide}`;

  const cursorFilter = cursor
    ? sql`WHERE (scored.rank, scored.doc_type, scored.id) < (${cursor.rank}, ${cursor.docType}, ${cursor.id})`
    : sql``;

  const query = sql`
    WITH params AS (
      SELECT
        websearch_to_tsquery('english', ${normalized}) AS tsq,
        ${normalized}::text AS q,
        lower(${normalized}::text) AS lq
    ),
    docs AS (${sides}),
    scored AS (
      SELECT
        d.doc_type,
        d.id,
        d.title,
        d.novel_slug,
        d.chapter_slug,
        d.thumbnail,
        d.chapter_number,
        d.volume_number,
        d.sort_date,
        d.author,
        d.language,
        d.status,
        d.tags,
        d.word_count,
        d.snippet,
        (
          d.base_rank::double precision * 0.6
          + (CASE WHEN lower(d.title) = p.lq THEN 0.5 ELSE 0.0 END)::double precision
          + (CASE WHEN starts_with(lower(d.title), p.lq) THEN 0.25 ELSE 0.0 END)::double precision
          + (similarity(d.title, p.q))::double precision * 0.3
          + 0.15::double precision * least(
              exp(extract(epoch FROM (localtimestamp - COALESCE(d.sort_date, localtimestamp))) / 31536000.0)::double precision,
              1::double precision
            )
          + (CASE WHEN d.doc_type = 'novel' THEN 0.02 ELSE 0.0 END)::double precision
        )::double precision AS rank
      FROM docs d
      CROSS JOIN params p
    )
    SELECT
      s.doc_type, s.id, s.title, s.novel_slug, s.chapter_slug, s.thumbnail,
      s.chapter_number, s.volume_number, s.sort_date, s.author, s.language,
      s.status, s.tags, s.word_count, s.snippet, s.rank
    FROM scored s
    ${cursorFilter}
    ORDER BY s.rank DESC, s.doc_type ASC, s.id ASC
    LIMIT ${fetchLimit}
  `;

  const rows = await db.execute<Record<string, unknown>>(query);
  const hits = rows.map((row) => mapSearchRow(toRecord<SearchRow>(row)));

  const hasMore = hits.length > params.limit;
  const page = hasMore ? hits.slice(0, params.limit) : hits;
  const last = page[page.length - 1];

  return {
    hits: page,
    nextCursor:
      hasMore && last
        ? encodeSearchCursor({ rank: last.rank, docType: last.docType, id: last.id })
        : null,
    count: page.length,
    normalizedQuery: normalized,
    isFallback: false,
  };
}

/**
 * Ranked, premium-aware full-text search with keyset pagination.
 *
 * Wrapped in `unstable_cache` (60 s, `search:all` + per-fingerprint tag). Premium
 * gating is baked into the cache key via `includePremium`, so subscriber and public
 * result sets never share an entry.
 */
export const searchContent = createCachedQuery(
  _searchContent,
  (params: SearchParams) => {
    const fingerprint = buildSearchCacheKey({
      normalized: normalizeQuery(params.q),
      type: params.type,
      includePremium: params.includePremium,
      tagIds: params.tagIds,
      statuses: params.statuses,
      language: params.language,
      author: params.author,
      minWordCount: params.minWordCount,
      maxWordCount: params.maxWordCount,
      limit: params.limit,
    });
    return {
      revalidate: CACHE_PRESETS.search.revalidate,
      tags: [CACHE_TAGS.search.all, CACHE_TAGS.search.query(fingerprint)],
    };
  },
  ["search-content"]
);

export interface AutocompleteOptions {
  q: string;
  type: "all" | "novel" | "chapter";
  includePremium: boolean;
  limit?: number;
}

async function _autocomplete(options: AutocompleteOptions): Promise<AutocompleteHit[]> {
  const normalized = normalizeQuery(options.q);
  if (!isSearchableQuery(normalized)) return [];

  const limit = Math.min(
    Math.max(options.limit ?? AUTOCOMPLETE_LIMIT, 1),
    AUTOCOMPLETE_LIMIT
  );
  const prefix = `${normalized.replace(/[\\%_]/g, (match) => `\\${match}`)}%`;

  const novelSide = sql`
    SELECT
      'novel'::text AS doc_type,
      n."title" AS title,
      NULL::text AS novel_title,
      n."slug" AS novel_slug,
      NULL::text AS chapter_slug,
      NULL::double precision AS chapter_number,
      NULL::double precision AS volume_number,
      n."thumbnail" AS thumbnail,
      (starts_with(lower(n."title"), p.lq))::int AS is_prefix,
      similarity(n."title", p.q) AS sim
    FROM "Novel" n
    CROSS JOIN params p
    WHERE n."title" ILIKE ${prefix} OR n."title" % p.q
  `;

  const chapterSide = sql`
    SELECT
      'chapter'::text AS doc_type,
      c."title" AS title,
      n."title" AS novel_title,
      n."slug" AS novel_slug,
      c."slug" AS chapter_slug,
      c."number" AS chapter_number,
      v."number" AS volume_number,
      NULL::text AS thumbnail,
      (starts_with(lower(c."title"), p.lq))::int AS is_prefix,
      similarity(c."title", p.q) AS sim
    FROM "Chapter" c
    JOIN "Novel" n ON n."id" = c."novelId"
    JOIN "Volume" v ON v."id" = c."volumeId"
    CROSS JOIN params p
    WHERE c."publishedAt" IS NOT NULL
      AND (${options.includePremium} OR c."premium" = FALSE)
      AND (c."title" ILIKE ${prefix} OR c."title" % p.q)
  `;

  const sides =
    options.type === "novel"
      ? novelSide
      : options.type === "chapter"
        ? chapterSide
        : sql`${novelSide} UNION ALL ${chapterSide}`;

  const query = sql`
    WITH params AS (
      SELECT ${normalized}::text AS q, lower(${normalized}::text) AS lq
    ),
    hits AS (${sides})
    SELECT
      h.doc_type, h.title, h.novel_title, h.novel_slug, h.chapter_slug,
      h.chapter_number, h.volume_number, h.thumbnail
    FROM hits h
    ORDER BY h.is_prefix DESC, h.sim DESC, h.title ASC
    LIMIT ${limit}
  `;

  const rows = await db.execute<Record<string, unknown>>(query);
  return rows.map((row) => mapAutocompleteRow(toRecord<AutocompleteRow>(row)));
}

/**
 * Navbar typeahead source. Cached inline (60 s) and additionally in KV by the route
 * handler (300 s). The cache key carries the premium flag for the same reason as
 * `searchContent`.
 */
export const searchAutocomplete = createCachedQuery(
  _autocomplete,
  (options: AutocompleteOptions) => {
    const fingerprint = buildSearchCacheKey({
      normalized: `auto:${normalizeQuery(options.q)}`,
      type: options.type,
      includePremium: options.includePremium,
      tagIds: [],
      statuses: [],
      language: null,
      author: null,
      minWordCount: null,
      maxWordCount: null,
      limit: options.limit ?? AUTOCOMPLETE_LIMIT,
    });
    return {
      revalidate: CACHE_PRESETS.search.revalidate,
      tags: [CACHE_TAGS.search.all, CACHE_TAGS.search.autocomplete(fingerprint)],
    };
  },
  ["search-autocomplete"]
);

async function _searchFacets(): Promise<SearchFacets> {
  const [tagRows, languageRows] = await Promise.all([
    db.select({ id: tag.id, slug: tag.slug, name: tag.name }).from(tag).orderBy(tag.name),
    db
      .selectDistinct({ language: novel.language })
      .from(novel)
      .where(isNotNull(novel.language)),
  ]);

  return {
    tags: tagRows,
    languages: languageRows
      .map((row) => row.language)
      .filter((language): language is string => Boolean(language))
      .sort((a, b) => a.localeCompare(b)),
    statuses: [...NOVEL_STATUSES],
  };
}

/** Filter sidebar options: every tag and every language currently in use. */
export const getSearchFacets = createCachedQuery(
  _searchFacets,
  {
    revalidate: CACHE_PRESETS.search.revalidate,
    tags: [CACHE_TAGS.search.all, CACHE_TAGS.novel.all],
  },
  ["search-facets"]
);

async function _searchFallback(limit: number): Promise<SearchResultSet> {
  const novels = await db.query.novel.findMany({
    columns: {
      id: true,
      slug: true,
      title: true,
      thumbnail: true,
    },
    with: {
      richText: { columns: { text: true } },
      chapters: {
        columns: { slug: true, number: true, publishedAt: true, premium: true },
        where: (chapter, { isNotNull: notNull }) => notNull(chapter.publishedAt),
        orderBy: (chapter, { desc }) => desc(chapter.serial),
        limit: 1,
      },
    },
    orderBy: (novelTable, { desc }) => desc(novelTable.updatedAt),
    limit: Math.min(Math.max(limit, 1), FALLBACK_LIMIT * 2),
  });

  const hits: SearchHit[] = novels
    .filter((candidate) => candidate.chapters.length > 0)
    .slice(0, limit)
    .map((candidate) => {
      const description = candidate.richText?.text ?? "";
      const hit: SearchHit = {
        docType: "novel",
        id: candidate.id,
        title: candidate.title,
        novelSlug: candidate.slug,
        chapterSlug: null,
        thumbnail: candidate.thumbnail,
        chapterNumber: null,
        volumeNumber: null,
        sortDate: null,
        author: null,
        language: null,
        status: null,
        tags: [],
        wordCount: 0,
        snippet:
          description.length > 180 ? `${description.slice(0, 180).trimEnd()}…` : description || null,
        rank: 0,
        href: "",
      };
      hit.href = buildHitHref(hit);
      return hit;
    });

  return {
    hits,
    nextCursor: null,
    count: hits.length,
    normalizedQuery: "",
    isFallback: true,
  };
}

/**
 * "Recently updated" list served when the query is empty or a single character.
 * Per the plan, the search UX never 400s on a short query.
 */
export const searchFallback = createCachedQuery(
  _searchFallback,
  {
    revalidate: CACHE_PRESETS.search.revalidate,
    tags: [CACHE_TAGS.search.all, CACHE_TAGS.novel.all, CACHE_TAGS.chapter.all],
  },
  ["search-fallback"]
);

/** Tag rows for the admin tag picker. */
export async function getAllTags(): Promise<{ id: number; slug: string; name: string }[]> {
  return db
    .select({ id: tag.id, slug: tag.slug, name: tag.name })
    .from(tag)
    .orderBy(tag.name);
}

/** Tag ids currently attached to a novel, for the admin edit form. */
export async function getNovelTagIds(novelId: number): Promise<number[]> {
  const rows = await db
    .select({ tagId: novelTag.tagId })
    .from(novelTag)
    .where(eq(novelTag.novelId, novelId));
  return rows.map((row) => row.tagId);
}
