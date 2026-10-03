/**
 * Shared types for the search stack (`/search`, `/api/search`, `/api/search/autocomplete`).
 *
 * The shapes here are the contract between the query layer, the route handlers and the
 * UI, so they are intentionally serialisable: no `Date` objects cross the API boundary.
 */

export const SEARCH_DOC_TYPES = ["all", "novel", "chapter"] as const;
export type SearchDocType = (typeof SEARCH_DOC_TYPES)[number];

export const SEARCH_HIT_TYPES = ["novel", "chapter"] as const;
export type SearchHitType = (typeof SEARCH_HIT_TYPES)[number];

export const NOVEL_STATUSES = ["ONGOING", "COMPLETED", "HIATUS"] as const;
export type NovelStatus = (typeof NOVEL_STATUSES)[number];

export const NOVEL_STATUS_LABELS: Record<NovelStatus, string> = {
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
  HIATUS: "Hiatus",
};

export interface SearchParams {
  /** Raw (unnormalised) user query. */
  q: string;
  type: SearchDocType;
  /** True for SUBSCRIBER/ADMIN viewers: unlocks premium chapter rows. */
  includePremium: boolean;
  tagIds: number[];
  statuses: NovelStatus[];
  language: string | null;
  author: string | null;
  minWordCount: number | null;
  maxWordCount: number | null;
  /** Opaque keyset cursor produced by the previous page. */
  cursor: string | null;
  limit: number;
}

export interface SearchHit {
  docType: SearchHitType;
  id: number;
  title: string;
  novelSlug: string;
  chapterSlug: string | null;
  thumbnail: string | null;
  chapterNumber: number | null;
  volumeNumber: number | null;
  /** ISO timestamp used for the recency tiebreak and the "x ago" label. */
  sortDate: string | null;
  author: string | null;
  language: string | null;
  status: NovelStatus | null;
  tags: string[];
  wordCount: number;
  /** Highlighted plain-text fragment. Never contains chapter HTML. */
  snippet: string | null;
  rank: number;
  href: string;
}

export interface SearchResultSet {
  hits: SearchHit[];
  nextCursor: string | null;
  /** Display-only count of the current page. */
  count: number;
  /** Whitespace/case collapsed query actually sent to Postgres. */
  normalizedQuery: string;
  /** True when the query was too short to search and the fallback list was served. */
  isFallback: boolean;
}

export interface AutocompleteHit {
  docType: SearchHitType;
  title: string;
  novelTitle: string | null;
  novelSlug: string;
  chapterSlug: string | null;
  chapterNumber: number | null;
  volumeNumber: number | null;
  thumbnail: string | null;
  href: string;
}

export interface SearchFacets {
  tags: { id: number; name: string; slug: string }[];
  languages: string[];
  statuses: NovelStatus[];
}

export type SearchAccess = "anonymous" | "member" | "subscriber" | "admin";
