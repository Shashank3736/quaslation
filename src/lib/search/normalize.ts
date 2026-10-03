import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MAX_QUERY_LENGTH,
  MIN_QUERY_LENGTH,
} from "./constants";
import {
  NovelStatus,
  NOVEL_STATUSES,
  SearchDocType,
  SearchHit,
  SearchParams,
  SEARCH_HIT_TYPES,
} from "./types";
import {
  parseLimit,
  parseNumberList,
  parseWordCount,
  searchQuerySchema,
  toRawParams,
  type RawParams,
} from "./schemas";

/**
 * Collapses whitespace, strips control characters and caps the length. The result is
 * what gets sent to Postgres *and* what the cache key is built from, so two visitors
 * typing the same query with different spacing share one cache entry.
 */
export function normalizeQuery(raw: string): string {
  return raw
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_QUERY_LENGTH);
}

/** Lowercased, punctuation-trimmed form used for equality/prefix rank boosts. */
export function normalizeQueryForCompare(raw: string): string {
  return normalizeQuery(raw).toLowerCase();
}

export function isSearchableQuery(normalized: string): boolean {
  return normalized.length >= MIN_QUERY_LENGTH;
}

export function buildLikePattern(normalized: string): string {
  // Escape the LIKE metacharacters so a literal % in a query cannot widen the scan.
  const escaped = normalized.replace(/[\\%_]/g, (match) => `\\${match}`);
  return `%${escaped}%`;
}

export interface ParsedSearchOptions {
  /** Whether the viewer is entitled to premium chapter rows. */
  includePremium: boolean;
}

/**
 * Turns raw URL params into a fully defaulted, clamped `SearchParams`.
 *
 * `premium=1` can never escalate: it is ANDed with the viewer's access level, so an
 * anonymous visitor asking for premium hits still gets the public-only result set.
 */
export function parseSearchParams(
  params: RawParams,
  options: ParsedSearchOptions
): SearchParams {
  const raw = toRawParams(params);
  const parsed = searchQuerySchema.parse(raw);

  const statuses = parsed.status
    .toUpperCase()
    .split(/[\s,]+/)
    .filter((value): value is NovelStatus =>
      (NOVEL_STATUSES as readonly string[]).includes(value)
    );

  const minWordCount = parseWordCount(parsed.minWords);
  const maxWordCount = parseWordCount(parsed.maxWords);
  // Tolerate a reversed range instead of silently returning nothing.
  const orderedMin =
    minWordCount !== null && maxWordCount !== null && minWordCount > maxWordCount
      ? maxWordCount
      : minWordCount;
  const orderedMax =
    minWordCount !== null && maxWordCount !== null && minWordCount > maxWordCount
      ? minWordCount
      : maxWordCount;

  return {
    q: parsed.q,
    type: parsed.type as SearchDocType,
    includePremium: options.includePremium && parsed.premium,
    tagIds: Array.from(new Set(parseNumberList(parsed.tags))),
    statuses: Array.from(new Set(statuses)),
    language: parsed.language ? parsed.language.slice(0, 60) : null,
    author: parsed.author ? parsed.author.slice(0, 120) : null,
    minWordCount: orderedMin,
    maxWordCount: orderedMax,
    cursor: parsed.cursor || null,
    limit: Math.min(parseLimit(parsed.limit) || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
  };
}

export function buildSearchHref(params: SearchParams): string {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.type !== "all") search.set("type", params.type);
  if (params.includePremium) search.set("premium", "1");
  if (params.tagIds.length) search.set("tags", params.tagIds.join(","));
  if (params.statuses.length) search.set("status", params.statuses.join(","));
  if (params.language) search.set("language", params.language);
  if (params.author) search.set("author", params.author);
  if (params.minWordCount !== null) search.set("minWords", String(params.minWordCount));
  if (params.maxWordCount !== null) search.set("maxWords", String(params.maxWordCount));
  return `/search${search.toString() ? `?${search.toString()}` : ""}`;
}

/** Page link that keeps every active filter and swaps in the next keyset cursor. */
export function buildPagedHref(params: SearchParams, cursor: string | null): string {
  const base = buildSearchHref(params);
  if (!cursor) return base;
  return `${base}${base.includes("?") ? "&" : "?"}cursor=${encodeURIComponent(cursor)}`;
}

export interface SearchCacheKeyInput {
  normalized: string;
  type: SearchDocType;
  includePremium: boolean;
  tagIds: number[];
  statuses: string[];
  language: string | null;
  author: string | null;
  minWordCount: number | null;
  maxWordCount: number | null;
  limit: number;
}

/**
 * Short, stable fingerprint of a query. Field order is fixed and arrays are sorted so
 * `tags=1,2` and `tags=2,1` share a cache entry (and therefore a cache tag). Callers
 * pass the already-normalised query; the key additionally trims and lowercases so
 * cosmetic differences cannot fork the cache.
 */
export function buildSearchCacheKey(input: SearchCacheKeyInput): string {
  const signature = JSON.stringify([
    input.normalized.trim().toLowerCase(),
    input.type,
    input.includePremium ? 1 : 0,
    [...input.tagIds].sort((a, b) => a - b),
    [...input.statuses].sort(),
    (input.language ?? "").trim().toLowerCase(),
    (input.author ?? "").trim().toLowerCase(),
    input.minWordCount ?? "",
    input.maxWordCount ?? "",
    input.limit,
  ]);

  return fnv1a(signature).toString(36);
}

/** FNV-1a: 32 bit, dependency free, and plenty for a cache key. */
function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

export interface SearchCursor {
  rank: number;
  docType: (typeof SEARCH_HIT_TYPES)[number];
  id: number;
}

/**
 * Keyset cursor: base64url of `(rank, docType, id)`. Stable across inserts because the
 * boundary is the last row's sort key, not an offset.
 */
export function encodeSearchCursor(cursor: SearchCursor): string {
  return Buffer.from(
    JSON.stringify({
      r: cursor.rank,
      t: cursor.docType,
      i: cursor.id,
    }),
    "utf8"
  ).toString("base64url");
}

export function decodeSearchCursor(raw: string | null): SearchCursor | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(raw, "base64url").toString("utf8")
    ) as { r?: unknown; t?: unknown; i?: unknown };

    const rank = typeof parsed.r === "number" && Number.isFinite(parsed.r) ? parsed.r : null;
    const docType = SEARCH_HIT_TYPES.includes(parsed.t as never)
      ? (parsed.t as SearchCursor["docType"])
      : null;
    const id =
      typeof parsed.i === "number" && Number.isInteger(parsed.i) ? parsed.i : null;

    if (rank === null || docType === null || id === null) return null;
    return { rank, docType, id };
  } catch {
    return null;
  }
}

export function buildHitHref(hit: Pick<SearchHit, "docType" | "novelSlug" | "chapterSlug">): string {
  return hit.docType === "novel"
    ? `/novels/${hit.novelSlug}`
    : `/novels/${hit.novelSlug}/${hit.chapterSlug}`;
}
