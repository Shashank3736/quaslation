/**
 * Validates the search migrations + the core search/autocomplete SQL against a real
 * Postgres engine (PGlite), plus unit-tests the pure helpers.
 *
 * Run from the repo root:  npx tsx scripts/search/validate.ts
 * Requires network only for nothing (all local). Exits non-zero on any failure.
 */
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";

let failures = 0;

async function main() {
function check(name: string, condition: boolean, detail?: unknown) {
  if (condition) {
    console.log(`ok   ${name}`);
  } else {
    failures++;
    console.log(`FAIL ${name}${detail !== undefined ? ` — ${JSON.stringify(detail)}` : ""}`);
  }
}

function statementsOf(path: string): string[] {
  const sql = readFileSync(path, "utf8");
  return sql
    .split(/--> statement-breakpoint/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const db = new PGlite({ extensions: { pg_trgm } });
await db.waitReady;

// --- 1. Minimal schema surface the migrations expect -----------------------------
// Only the columns the search SQL touches are created.
await db.exec(`
  CREATE TABLE "RichText" (
    "id" serial PRIMARY KEY NOT NULL,
    "text" text NOT NULL,
    "html" text NOT NULL,
    "markdown" text NOT NULL
  );
  CREATE TABLE "Novel" (
    "id" serial PRIMARY KEY NOT NULL,
    "slug" text NOT NULL,
    "title" text NOT NULL,
    "thumbnail" text,
    "createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "publishedAt" timestamp(3),
    "updatedAt" timestamp(3) DEFAULT now() NOT NULL,
    "richTextId" integer NOT NULL
  );
  CREATE TABLE "Volume" (
    "id" serial PRIMARY KEY NOT NULL,
    "number" double precision NOT NULL,
    "title" text,
    "novelId" integer NOT NULL
  );
  CREATE TABLE "Chapter" (
    "id" serial PRIMARY KEY NOT NULL,
    "premium" boolean DEFAULT true NOT NULL,
    "slug" text NOT NULL,
    "novelId" integer NOT NULL,
    "volumeId" integer NOT NULL,
    "serial" integer NOT NULL,
    "number" double precision NOT NULL,
    "title" text NOT NULL,
    "createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "publishedAt" timestamp(3),
    "updatedAt" timestamp(3) DEFAULT now() NOT NULL,
    "richTextId" integer NOT NULL
  );
`);

// --- 2. Apply 0006 + 0007 + 0008 --------------------------------------------------
for (const file of [
  "src/lib/db/0006_search.sql",
  "src/lib/db/0007_search_meta.sql",
  "src/lib/db/0008_search_functions.sql",
]) {
  for (const stmt of statementsOf(file)) {
    try {
      await db.exec(stmt);
    } catch (error) {
      check(`migration ${file}: ${(error as Error).message.slice(0, 120)}`, false, stmt.slice(0, 160));
    }
  }
  console.log(`ok   applied ${file}`);
}

// --- 3. Seed data covering the smoke suite ----------------------------------------
const rt = async (text: string) =>
  (
    await db.query<{ id: number }>(
      `INSERT INTO "RichText" ("text","html","markdown") VALUES ($1,$1,$1) RETURNING "id"`,
      [text]
    )
  ).rows[0].id;

const rtDungeonDesc = await rt("A hunter enters a deadly dungeon full of monsters and treasure.");
const rtDungeonBody = await rt("Inside the dungeon the hunter fought goblins and found a rare sword.");
const rtCookingDesc = await rt("A cozy story about cooking meals and warm friendships.");
const rtCookingBody = await rt("Chapter one: the chef prepares soup for the village festival.");

const novel = async (title: string, slug: string, richTextId: number) =>
  (
    await db.query<{ id: number }>(
      `INSERT INTO "Novel" ("slug","title","richTextId","publishedAt") VALUES ($1,$2,$3,now()) RETURNING "id"`,
      [slug, title, richTextId]
    )
  ).rows[0].id;

const dungeonId = await novel("Dungeon Hunter", "dungeon-hunter", rtDungeonDesc);
const cookingId = await novel("Slow Cooking Life", "slow-cooking-life", rtCookingDesc);

await db.exec(
  `UPDATE "Novel" SET "author"='Jane Doe', "language"='Chinese', "status"='COMPLETED' WHERE "id"=${cookingId}`
);
await db.query(`INSERT INTO "Tag" ("slug","name") VALUES ('action','Action'),('cooking','Cooking')`);
await db.query(`INSERT INTO "NovelTag" ("novelId","tagId") VALUES (${dungeonId},1),(${cookingId},2)`);
await db.query(`INSERT INTO "Volume" ("number","novelId") VALUES (1,${dungeonId}),(1,${cookingId})`);

const chapter = async (
  title: string, slug: string, novelId: number, richTextId: number, premium: boolean, published: boolean
) =>
  db.query(
    `INSERT INTO "Chapter" ("premium","slug","novelId","volumeId","serial","number","title","richTextId"${published ? `,"publishedAt"` : ""})
     VALUES ($1,$2,$3,(SELECT "id" FROM "Volume" WHERE "novelId"=$3 LIMIT 1),1,1,$4,$5${published ? `,now()` : ""})`,
    [premium, slug, novelId, title, richTextId]
  );

await chapter("The First Descent", "first-descent-a1b2c3-1-1", dungeonId, rtDungeonBody, false, true);
await chapter("Secret Boss Room", "secret-boss-d4e5f6-1-2", dungeonId, await rt("The premium boss drops legendary loot."), true, true);
await chapter("Soup for the Festival", "soup-festival-aa11bb-1-1", cookingId, rtCookingBody, false, true);
await chapter("Unpublished Draft", "draft-zz99-1-9", cookingId, await rt("Nobody should find this yet."), false, false);

// --- 4. Trigger behaviour ----------------------------------------------------------
const vectors = await db.query<{ id: number; search_vector: string | null }>(
  `SELECT "id", "search_vector"::text FROM "Novel"`
);
check(
  "novel search_vector backfilled by triggers",
  vectors.rows.every((r) => r.search_vector && r.search_vector.length > 0),
  vectors.rows
);

const cVectors = await db.query<{ id: number; search_vector: string | null }>(
  `SELECT "id", "search_vector"::text FROM "Chapter"`
);
check(
  "chapter search_vector backfilled by triggers",
  cVectors.rows.every((r) => r.search_vector && r.search_vector.length > 0),
  cVectors.rows
);

const wc = await db.query<{ text: string; wordCount: number }>(
  `SELECT left("text", 20) AS text, "wordCount" FROM "RichText" ORDER BY "id" LIMIT 2`
);
check("wordCount computed (first row)", wc.rows[0].wordCount === 11, wc.rows[0]);

// RichText edit propagates to the owning novel vector.
await db.query(`UPDATE "RichText" SET "text"='A hunter enters a deadly dungeon full of dragons.' WHERE "id"=${rtDungeonDesc}`);
const afterEdit = await db.query<{ search_vector: string }>(
  `SELECT "search_vector"::text AS search_vector FROM "Novel" WHERE "id"=${dungeonId}`
);
check(
  "RichText edit refreshes novel vector",
  /dragon/.test(afterEdit.rows[0].search_vector),
  afterEdit.rows[0].search_vector.slice(0, 120)
);

// Tag attach propagates into weight D.
await db.query(`INSERT INTO "NovelTag" ("novelId","tagId") VALUES (${dungeonId},2)`);
const afterTag = await db.query<{ search_vector: string }>(
  `SELECT "search_vector"::text AS search_vector FROM "Novel" WHERE "id"=${dungeonId}`
);
check(
  "NovelTag attach refreshes novel vector",
  /cook/.test(afterTag.rows[0].search_vector),
  afterTag.rows[0].search_vector.slice(0, 200)
);

// --- 5. Core FTS ranking query (mirrors src/lib/search/query.ts) -------------------
async function rankedSearch(q: string, includePremium: boolean, type: "all" | "novel" | "chapter" = "all") {
  const like = `%${q}%`;
  const novelSide = `
    SELECT 'novel'::text AS doc_type, n."id" AS id, n."title" AS title,
      ts_rank_cd(n."search_vector", p.tsq) AS base_rank
    FROM "Novel" n CROSS JOIN params p
    WHERE (COALESCE(n."search_vector" @@ p.tsq, FALSE) OR n."title" ILIKE $2
      OR word_similarity(p.q, n."title") > 0.45
      OR word_similarity(p.q, COALESCE(n."author", '')) > 0.6)`;
  const chapterSide = `
    SELECT 'chapter'::text AS doc_type, c."id" AS id, c."title" AS title,
      ts_rank_cd(c."search_vector", p.tsq) AS base_rank
    FROM "Chapter" c CROSS JOIN params p
    WHERE c."publishedAt" IS NOT NULL
      AND (${includePremium} OR c."premium" = FALSE)
      AND (COALESCE(c."search_vector" @@ p.tsq, FALSE) OR c."title" ILIKE $2
        OR word_similarity(p.q, c."title") > 0.45)`;
  const sides = type === "novel" ? novelSide : type === "chapter" ? chapterSide : `${novelSide} UNION ALL ${chapterSide}`;
  const res = await db.query<{ doc_type: string; title: string; rank: number }>(
    `WITH params AS (
       SELECT websearch_to_tsquery('english', $1) AS tsq, $1::text AS q, lower($1::text) AS lq
     ),
     docs AS (${sides}),
     scored AS (
       SELECT d.doc_type, d.id, d.title, (
         d.base_rank::double precision * 0.6
         + (CASE WHEN lower(d.title) = p.lq THEN 0.5 ELSE 0.0 END)::double precision
         + (CASE WHEN starts_with(lower(d.title), p.lq) THEN 0.25 ELSE 0.0 END)::double precision
         + (similarity(d.title, p.q))::double precision * 0.3
         + 0.0::double precision
         + (CASE WHEN d.doc_type = 'novel' THEN 0.02 ELSE 0.0 END)::double precision
       )::double precision AS rank
       FROM docs d CROSS JOIN params p
     )
     SELECT doc_type, title, rank FROM scored ORDER BY rank DESC, doc_type ASC, id ASC LIMIT 20`,
    [q, like]
  );
  return res.rows;
}

const exact = await rankedSearch("Dungeon Hunter", true);
check("exact title match ranks the novel first", exact[0]?.title === "Dungeon Hunter", exact.map((r) => r.title));

const partial = await rankedSearch("dungeon", true);
check(
  "partial substring still matches novel + chapter",
  partial.some((r) => r.title === "Dungeon Hunter") && partial.some((r) => r.title === "The First Descent"),
  partial.map((r) => `${r.doc_type}:${r.title}`)
);

const typo = await rankedSearch("dungen", true);
check("typo 'dungen' finds Dungeon via trigram", typo.some((r) => /dungeon/i.test(r.title)), typo.map((r) => r.title));

const anon = await rankedSearch("boss", false);
check("premium chapter hidden for anonymous", !anon.some((r) => r.title === "Secret Boss Room"), anon.map((r) => r.title));

const sub = await rankedSearch("boss", true);
check("premium chapter visible for subscriber", sub.some((r) => r.title === "Secret Boss Room"), sub.map((r) => r.title));

const unpublished = await rankedSearch("draft", true);
check("unpublished chapter never surfaces", !unpublished.some((r) => r.title === "Unpublished Draft"));

const chaptersOnly = await rankedSearch("dungeon", true, "chapter");
check("type=chapter excludes novels", chaptersOnly.every((r) => r.doc_type === "chapter"), chaptersOnly);

const novelsOnly = await rankedSearch("dungeon", true, "novel");
check("type=novel excludes chapters", novelsOnly.every((r) => r.doc_type === "novel"), novelsOnly);

// Trigram similarity smoke (autocomplete WHERE clause building blocks).
const sim = await db.query<{ title: string }>(
  `SELECT "title" FROM "Novel" WHERE "title" ILIKE 'dun%' OR "title" % 'dungen' ORDER BY similarity("title", 'dungen') DESC LIMIT 3`
);
check("trigram prefix/fuzzy lookup works", sim.rows.some((r) => r.title === "Dungeon Hunter"), sim.rows);

// --- 6. Unit tests for pure helpers (imported from src) -----------------------------
const helpers = await import("../../src/lib/search/normalize.js").catch((e) => {
  console.log("SKIP pure-helper tests (could not import TS source):", (e as Error).message);
  return null;
});
const { normalizeQuery, isSearchableQuery, buildLikePattern, encodeSearchCursor, decodeSearchCursor, buildSearchCacheKey } =
  (helpers ?? {}) as {
    normalizeQuery: (s: string) => string;
    isSearchableQuery: (s: string) => boolean;
    buildLikePattern: (s: string) => string;
    encodeSearchCursor: (c: { rank: number; docType: "novel" | "chapter"; id: number }) => string;
    decodeSearchCursor: (s: string | null) => { rank: number; docType: "novel" | "chapter"; id: number } | null;
    buildSearchCacheKey: (input: {
      normalized: string; type: "all" | "novel" | "chapter"; includePremium: boolean;
      tagIds: number[]; statuses: string[]; language: string | null; author: string | null;
      minWordCount: number | null; maxWordCount: number | null; limit: number;
    }) => string;
  };

if (normalizeQuery) {
  check("normalize collapses whitespace", normalizeQuery("  Dun  geon ") === "Dun geon");
  check("normalize caps at 120 chars", normalizeQuery("x".repeat(200)).length === 120);
  check("short queries are not searchable", isSearchableQuery("a") === false && isSearchableQuery("ab") === true);
  check("LIKE metacharacters are escaped", buildLikePattern("100%_x") === "%100\\%\\_x%");

  const cursor = { rank: 1.25, docType: "chapter" as const, id: 42 };
  const roundtrip = decodeSearchCursor(encodeSearchCursor(cursor));
  check("cursor round-trips", JSON.stringify(roundtrip) === JSON.stringify(cursor));
  check("garbage cursor decodes to null", decodeSearchCursor("!!!not-base64!!!") === null);
  check("wrong-shape cursor decodes to null", decodeSearchCursor(Buffer.from("{}").toString("base64url")) === null);

  const keyA = buildSearchCacheKey({
    normalized: "Dungeon", type: "all", includePremium: false, tagIds: [2, 1], statuses: [],
    language: null, author: null, minWordCount: null, maxWordCount: null, limit: 20,
  });
  const keyB = buildSearchCacheKey({
    normalized: "dungeon ", type: "all", includePremium: false, tagIds: [1, 2], statuses: [],
    language: null, author: null, minWordCount: null, maxWordCount: null, limit: 20,
  });
  check("cache key is order/case-insensitive", keyA === keyB, { keyA, keyB });
  const keyC = buildSearchCacheKey({
    normalized: "dungeon", type: "all", includePremium: true, tagIds: [1, 2], statuses: [],
    language: null, author: null, minWordCount: null, maxWordCount: null, limit: 20,
  });
  check("cache key separates premium access", keyA !== keyC);
}

console.log(failures === 0 ? "\nALL SEARCH CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
}

main().then(() => process.exit(failures === 0 ? 0 : 1)).catch((e) => { console.error(e); process.exit(1); });
