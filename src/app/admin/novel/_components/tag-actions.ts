"use server";

import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { novelTag as novelTagTable, tag as tagTable } from "@/lib/db/schema";
import { slugify } from "@/lib/utils";
import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache";
import { invalidateSearchCaches } from "@/lib/search/invalidate";

const tagInputSchema = z
  .string()
  .trim()
  .min(1)
  .max(40)
  .regex(/^[a-z0-9][a-z0-9 _-]*$/i, "Tags may only contain letters, numbers, spaces, - and _");

/**
 * Finds a tag by name (case-insensitive) or creates it. Returns the tag row.
 * Slug collisions resolve to the existing row so a manual DB insert with the same
 * slug can never 500 the admin form.
 */
export async function upsertTag(rawName: string): Promise<{ id: number; slug: string; name: string }> {
  const parsed = tagInputSchema.safeParse(rawName);
  if (!parsed.success) {
    throw new Error("Invalid tag name.");
  }
  const name = parsed.data.replace(/\s+/g, " ").trim();
  const slug = slugify(name);

  const existing = await db
    .select({ id: tagTable.id, slug: tagTable.slug, name: tagTable.name })
    .from(tagTable)
    .where(sql`lower(${tagTable.name}) = lower(${name})`)
    .limit(1);

  if (existing.length > 0) return existing[0];

  try {
    const created = await db
      .insert(tagTable)
      .values({ name, slug })
      .returning({ id: tagTable.id, slug: tagTable.slug, name: tagTable.name });
    return created[0];
  } catch {
    // Lost a slug race with another admin: read the winner back.
    const winner = await db
      .select({ id: tagTable.id, slug: tagTable.slug, name: tagTable.name })
      .from(tagTable)
      .where(eq(tagTable.slug, slug))
      .limit(1);
    if (winner.length > 0) return winner[0];
    throw new Error("Could not create tag.");
  }
}

/** Replaces the tag set of a novel. Tag names that do not exist yet are created. */
export async function setNovelTags(novelId: number, tagIds: number[]): Promise<void> {
  const unique = Array.from(new Set(tagIds.filter((id) => Number.isInteger(id) && id > 0)));

  await db.delete(novelTagTable).where(eq(novelTagTable.novelId, novelId));
  if (unique.length > 0) {
    await db.insert(novelTagTable).values(
      unique.map((tagId) => ({ novelId, tagId }))
    );
  }

  updateTag(CACHE_TAGS.search.all);
  invalidateSearchCaches();
}

/** Returns full tag rows for the ids still referenced by other joins, when deleting. */
export async function deleteTag(tagId: number): Promise<void> {
  await db.delete(novelTagTable).where(eq(novelTagTable.tagId, tagId));
  await db.delete(tagTable).where(eq(tagTable.id, tagId));
  updateTag(CACHE_TAGS.search.all);
  invalidateSearchCaches();
}

export async function tagUsage(tagId: number): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(novelTagTable)
    .where(eq(novelTagTable.tagId, tagId));
  return rows[0]?.count ?? 0;
}

export async function getAllTagsWithUsage(): Promise<
  { id: number; slug: string; name: string; novels: number }[]
> {
  const rows = await db
    .select({
      id: tagTable.id,
      slug: tagTable.slug,
      name: tagTable.name,
      novels: sql<number>`count(${novelTagTable.novelId})::int`,
    })
    .from(tagTable)
    .leftJoin(novelTagTable, eq(novelTagTable.tagId, tagTable.id))
    .groupBy(tagTable.id, tagTable.slug, tagTable.name)
    .orderBy(tagTable.name);
  return rows;
}
