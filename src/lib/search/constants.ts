/**
 * Query budget for search. Kept in one place because the API routes, the SSR page and
 * the cache-key fingerprint must all agree on the limits.
 */

/** Queries shorter than this are not sent to Postgres; the fallback list is served. */
export const MIN_QUERY_LENGTH = 2;

/** Hard cap on user input, also enforced by the zod schemas. */
export const MAX_QUERY_LENGTH = 120;

/** Default number of hits per results page. */
export const DEFAULT_PAGE_SIZE = 20;

/** Hard cap on `limit`, so a crafted URL cannot ask for the whole table. */
export const MAX_PAGE_SIZE = 50;

/** Number of hits returned by the navbar typeahead. */
export const AUTOCOMPLETE_LIMIT = 8;

/** Number of hits returned by the "recently updated" fallback list. */
export const FALLBACK_LIMIT = 10;

/** Autocomplete entries live in Upstash KV for 5 minutes. */
export const AUTOCOMPLETE_CACHE_TTL_SECONDS = 300;

/** Access-level lookups are cached in KV to skip the Clerk round trip on every keystroke. */
export const ACCESS_CACHE_TTL_SECONDS = 300;

/** Sliding window rate limits, per IP. */
export const RATE_LIMITS = {
  results: { requests: 30, windowMs: 60_000 },
  autocomplete: { requests: 60, windowMs: 60_000 },
} as const;
