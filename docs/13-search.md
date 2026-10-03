# Search

Implements `.kilo/plans/1790984064324-search-functionality-plan.md` (P1 + P2; P3 is a
documented upgrade path only).

## Engine

PostgreSQL-native, zero new infrastructure:

- `tsvector` columns on `Novel` / `Chapter` (migration `0006_search.sql`), maintained by
  BEFORE triggers in `0008_search_functions.sql`. Weights: A = title, B = description /
  body, C = author + language + status (+ novel title/slug for chapters), D = tags.
- Changes to `RichText.text` or `NovelTag` push no-op writes back into the owning rows,
  so the vectors stay correct without application code.
- `pg_trgm` GIN indexes on titles (+ `author`) give typo-tolerant `ILIKE '%…%'` and the
  `%` similarity operator used by autocomplete and the fuzzy rank term.
- `RichText.wordCount` (migration `0007_search_meta.sql`) is maintained by a trigger and
  exposed as a `minWords` / `maxWords` filter.

P2 metadata (all additive, migration `0007_search_meta.sql`): `Tag` + `NovelTag` join,
`Novel.status` (`ONGOING`/`COMPLETED`/`HIATUS`, default `ONGOING`), `Novel.language`,
`Novel.author`.

## Query layer (`src/lib/search/`)

| File | Responsibility |
|---|---|
| `constants.ts` | Query budget: 2-char minimum, 120-char cap, 20/50 page size, 8 autocomplete hits, 30/60 qpm rate limits |
| `schemas.ts` | Zod validation of URL params (single source; routes and the SSR page share it) |
| `normalize.ts` | Whitespace collapsing, LIKE-escaping, cache-key fingerprinting, base64url keyset cursors over `(rank, docType, id)` |
| `query.ts` | `searchContent` (UNION novel+chapter, `ts_rank_cd` + exact/prefix/trigram/recency boosts), `searchAutocomplete`, `getSearchFacets`, `searchFallback`, tag helpers for admin |
| `engine.ts` | `SearchEngine` adapter + `getSearchEngine()`; P3 swaps this, nothing else |
| `viewer.ts` | Clerk → cached access level; premium rows need SUBSCRIBER/ADMIN (decision D5) |
| `rate-limit.ts` | Upstash sliding window with in-memory fallback; `Retry-After` on 429 |
| `kv.ts` | Conditional `@vercel/kv` client (no-op without env, same pattern as `role-cache.ts`) |
| `invalidate.ts` | `invalidateSearchCaches()` — safe in any server context |

Ranking (per hit): `0.6·ts_rank_cd` + 0.5 exact-title + 0.25 prefix + `0.3·similarity` +
recency decay (1-year half-ish exponential, capped) + 0.02 novel tiebreak. The cursor
orders by `rank DESC, doc_type ASC, id ASC`, so pages never duplicate or skip rows on a
static index.

Premium rule: anonymous/MEMBER viewers never see premium chapter rows; their search
cache entries are keyed separately (`includePremium` is part of the fingerprint). Snippets
come from `ts_headline` over plain text only — chapter HTML is never selected.

## Surfaces

- `GET /api/search` — JSON results + `nextCursor`; 503 when the DB is unreachable.
- `GET /api/search/autocomplete` — `{ hits, cached }`; quiet below 2 chars; 300 s KV
  cache namespaced by premium access.
- `/(main)/search` — SSR page: GET-driven filter sidebar (type, tags, status, language,
  translator, word count, premium toggle for subscribers) + keyset pager. Short/empty
  queries render the recent-novels fallback instead of erroring.
- `SearchCombobox` in the navbar — 300 ms debounced typeahead, ArrowUp/Down/Enter/Esc,
  ARIA listbox; mobile gets a Search link (sheet + icon).

## Keeping the index correct

1. Triggers handle `search_vector`/`wordCount` on every write path automatically.
2. Every Server Action that touches searchable data calls `invalidateSearchCaches()`
   (already wired into: `createNovel`, `updateNovel`, `createChapter`,
   `updateChapterContent`, `publishChapters`, `freeChapters`, tag actions). Direct DB
   edits only need the tag Actions in the admin cache UI ("Search Index & Results").
3. After deploying migrations or bulk imports: `npm run search:reindex` (supports
   `--dry`, `--novels-only`, `--chapters-only`).

## Smoke checklist (from the plan's validation section)

Run `npm run search:validate` — it boots an in-memory Postgres (PGlite), applies
migrations `0006`–`0008` verbatim, seeds novels/chapters/tags, and asserts the whole
smoke suite below plus the pure-helper unit tests (normalisation, LIKE-escaping,
cursor round-trips, cache-key stability):

- Exact title match ranks the novel first; partial substring matches.
- Typo `dungen` finds "Dungeon…" via trigram similarity.
- Premium chapter rows are hidden for anonymous viewers, visible for subscribers.
- Second page (via `cursor`) returns stable, non-overlapping rows.
- A new novel appears on `/search` after the 60 s result cache expires (or after using
  the admin cache reset).
- `npm run lint` and `npm run build` pass.
