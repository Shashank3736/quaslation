import "server-only";
import {
  searchAutocomplete,
  searchContent,
  searchFallback,
  getSearchFacets,
} from "./query";
import type {
  AutocompleteHit,
  SearchFacets,
  SearchParams,
  SearchResultSet,
} from "./types";
import type { AutocompleteOptions } from "./query";

/**
 * P3 seam for a dedicated engine (Meilisearch / Typesense).
 *
 * Everything ships behind this interface, so the upgrade path in §5/P3 of the search
 * plan only swaps `getSearchEngine()`; routes and pages never touch the engine type
 * directly. PostgreSQL-native (`tsvector` + `pg_trgm`) is the P1 default and the
 * fallback whenever no dedicated engine is configured.
 */
export interface SearchEngine {
  readonly name: "postgres";
  search(params: SearchParams): Promise<SearchResultSet>;
  autocomplete(options: AutocompleteOptions): Promise<AutocompleteHit[]>;
  facets(): Promise<SearchFacets>;
  fallback(limit: number): Promise<SearchResultSet>;
}

const postgresSearchEngine: SearchEngine = {
  name: "postgres",
  search: (params) => searchContent(params),
  autocomplete: (options) => searchAutocomplete(options),
  facets: () => getSearchFacets(),
  fallback: (limit) => searchFallback(limit),
};

/**
 * Engine selector. `MEILISEARCH_HOST`/`TYPESENSE_*` are documented in `.env.example`
 * for P3; until a dedicated engine is wired, the Postgres implementation is returned
 * (with a one-time warning so a half-configured deploy is loud, not silent).
 */
let warned = false;

export function getSearchEngine(): SearchEngine {
  if (
    !warned &&
    (process.env.MEILISEARCH_HOST || process.env.TYPESENSE_HOST)
  ) {
    warned = true;
    console.warn(
      "A dedicated search engine is configured but only the Postgres engine is " +
        "implemented (search plan P3 not deployed); falling back to PostgreSQL-native search."
    );
  }
  return postgresSearchEngine;
}

export type { AutocompleteOptions } from "./query";
