/**
 * Backfills the search index for every novel and chapter.
 *
 * With the Postgres-native engine (search plan P1) this re-fires the BEFORE triggers
 * from migration 0008, rebuilding `search_vector` (title weight A, description weight
 * B, author/language/status/slug weight C, tags weight D) and `RichText.wordCount`.
 *
 * Usage:
 *   npm run search:reindex                  # everything
 *   npm run search:reindex -- --dry          # count rows without touching them
 *   npm run search:reindex -- --novels-only  # skip chapters
 *   npm run search:reindex -- --chapters-only  # skip novels
 *
 * Safe to run while the app is live: writes are done with batched no-op updates, one
 * transaction per batch, so an editor's concurrent write can only win, never lose.
 */
import { config } from "dotenv";

config({ path: ".env.local" });

import postgres from "postgres";

const connectionString = process.env.POSTGRES_URL || process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error(
    "Missing database connection string. Set POSTGRES_URL or DIRECT_URL in .env.local."
  );
}

const DRY = process.argv.includes("--dry");
const NOVELS_ONLY = process.argv.includes("--novels-only");
const CHAPTERS_ONLY = process.argv.includes("--chapters-only");
const BATCH = 500;

type Sql = ReturnType<typeof postgres>;

async function reindexTable(
  sql: Sql,
  label: string,
  table: "Novel" | "Chapter",
  total: number
): Promise<void> {
  let processed = 0;
  for (let offset = 0; offset < total; offset += BATCH) {
    // No-op writes re-fire the search_vector BEFORE triggers for the batch.
    await sql`
      UPDATE ${sql(table)} t SET "title" = "title"
      WHERE t."id" IN (
        SELECT inner_tbl."id" FROM ${sql(table)} AS inner_tbl
        ORDER BY inner_tbl."id" LIMIT ${BATCH} OFFSET ${offset}
      )
    `;
    processed = Math.min(offset + BATCH, total);
    if (processed % 2000 === 0 || processed === total) {
      console.log(`${label}: ${processed}/${total}`);
    }
  }
  console.log(`${label}: done (${processed} rows).`);
}

async function main() {
  const sql = postgres(connectionString as string, { max: 1 });

  try {
    const preflight = await sql`
      SELECT
        (SELECT count(*)::int FROM "Novel") AS novels,
        (SELECT count(*)::int FROM "Chapter") AS chapters,
        (SELECT count(*)::int FROM "RichText") AS rich_texts,
        (SELECT count(*)::int FROM "Novel" WHERE "search_vector" IS NULL) AS novels_missing_vector,
        (SELECT count(*)::int FROM "Chapter" WHERE "search_vector" IS NULL) AS chapters_missing_vector,
        (SELECT count(*)::int FROM "RichText" WHERE "wordCount" IS NULL OR "wordCount" = 0) AS rich_texts_missing_words
    `;
    console.log("Current search index state:", preflight[0]);

    if (DRY) {
      console.log("Dry run: nothing was written.");
      return;
    }

    if (!CHAPTERS_ONLY) {
      await reindexTable(sql, "Novel", "Novel", preflight[0].novels as number);
    }
    if (!NOVELS_ONLY) {
      await reindexTable(sql, "Chapter", "Chapter", preflight[0].chapters as number);
    }

    // RichText rows referenced by a novel or chapter already went through the AFTER
    // trigger above; touch orphan rows (if any) directly for their word count.
    await sql`UPDATE "RichText" rt SET "text" = "text" WHERE NOT EXISTS (
      SELECT 1 FROM "Novel" n WHERE n."richTextId" = rt."id"
    ) AND NOT EXISTS (
      SELECT 1 FROM "Chapter" c WHERE c."richTextId" = rt."id"
    )`;
    console.log("Rebuilt word counts for orphaned RichText rows (if any).");

    const postflight = await sql`
      SELECT
        (SELECT count(*)::int FROM "Novel" WHERE "search_vector" IS NULL) AS novels_missing_vector,
        (SELECT count(*)::int FROM "Chapter" WHERE "search_vector" IS NULL) AS chapters_missing_vector,
        (SELECT count(*)::int FROM "RichText" WHERE "wordCount" IS NULL) AS rich_texts_missing_words
    `;
    console.log("Search index state after reindex:", postflight[0]);
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error("Reindex failed:", error);
  process.exit(1);
});
