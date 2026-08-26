"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { user as userTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCachedUserRole } from "@/lib/auth/role-cache";
import {
  invalidateTagSafe,
  invalidatePathSafe,
  CACHE_INVALIDATION_PRESETS,
  CACHE_TAGS,
  PresetKey,
} from "@/lib/cache";

export interface InvalidationResult {
  success: boolean;
  message: string;
  invalidatedTags: string[];
  invalidatedPaths: string[];
  timestamp: string;
}

/**
 * Verifies that the current user is an authenticated administrator
 */
async function verifyAdminAuth(): Promise<{ authorized: boolean; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { authorized: false, error: "Unauthorized: Please sign in." };
    }

    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const userEmail = clerkUser.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return { authorized: false, error: "Unauthorized: No email found for user." };
    }

    const role = await getCachedUserRole(userEmail);
    if (role === "ADMIN") {
      return { authorized: true };
    }

    // Direct database fallback check
    const currentUser = await db
      .select({ role: userTable.role })
      .from(userTable)
      .where(eq(userTable.clerkId, userEmail))
      .limit(1);

    if (currentUser.length > 0 && currentUser[0].role === "ADMIN") {
      return { authorized: true };
    }

    return { authorized: false, error: "Forbidden: Admin access required." };
  } catch (error) {
    console.error("Admin verification error:", error);
    return { authorized: false, error: "Authentication verification failed." };
  }
}

/**
 * Invalidate arbitrary custom cache tags and optional paths
 */
export async function invalidateCustomTagsAction({
  tags,
  paths = [],
}: {
  tags: string[];
  paths?: string[];
}): Promise<InvalidationResult> {
  const authCheck = await verifyAdminAuth();
  if (!authCheck.authorized) {
    return {
      success: false,
      message: authCheck.error || "Unauthorized",
      invalidatedTags: [],
      invalidatedPaths: [],
      timestamp: new Date().toISOString(),
    };
  }

  // Parse and clean tags (splitting comma/newline/space separated inputs)
  const cleanedTags: string[] = [];
  for (const rawTag of tags) {
    const parts = rawTag
      .split(/[\s,\n]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    cleanedTags.push(...parts);
  }

  // Remove duplicates
  const uniqueTags = Array.from(new Set(cleanedTags));

  if (uniqueTags.length === 0) {
    return {
      success: false,
      message: "No valid cache tags provided to reset.",
      invalidatedTags: [],
      invalidatedPaths: [],
      timestamp: new Date().toISOString(),
    };
  }

  // Clean paths
  const cleanedPaths: string[] = [];
  for (const rawPath of paths) {
    const parts = rawPath
      .split(/[\s,\n]+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    for (const p of parts) {
      const formatted = p.startsWith("/") ? p : `/${p}`;
      cleanedPaths.push(formatted);
    }
  }
  const uniquePaths = Array.from(new Set(cleanedPaths));

  // Invalidate each tag
  for (const tag of uniqueTags) {
    invalidateTagSafe(tag);
  }

  // Invalidate each path
  for (const path of uniquePaths) {
    invalidatePathSafe(path);
  }

  return {
    success: true,
    message: `Successfully reset cache for ${uniqueTags.length} tag(s)${
      uniquePaths.length > 0 ? ` and ${uniquePaths.length} route path(s)` : ""
    }.`,
    invalidatedTags: uniqueTags,
    invalidatedPaths: uniquePaths,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Invalidate a predefined preset group of tags and routes
 */
export async function invalidatePresetAction(
  presetKey: PresetKey
): Promise<InvalidationResult> {
  const authCheck = await verifyAdminAuth();
  if (!authCheck.authorized) {
    return {
      success: false,
      message: authCheck.error || "Unauthorized",
      invalidatedTags: [],
      invalidatedPaths: [],
      timestamp: new Date().toISOString(),
    };
  }

  const preset = CACHE_INVALIDATION_PRESETS[presetKey];
  if (!preset) {
    return {
      success: false,
      message: `Unknown preset: ${presetKey}`,
      invalidatedTags: [],
      invalidatedPaths: [],
      timestamp: new Date().toISOString(),
    };
  }

  const tags = [...preset.tags];
  const paths = [...preset.paths];

  for (const tag of tags) {
    invalidateTagSafe(tag);
  }

  for (const path of paths) {
    invalidatePathSafe(path);
  }

  return {
    success: true,
    message: `Successfully reset "${preset.name}" cache (${tags.length} tags, ${paths.length} routes).`,
    invalidatedTags: tags,
    invalidatedPaths: paths,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Invalidate all cache associated with a specific novel slug
 */
export async function invalidateNovelBySlugAction(
  rawSlug: string
): Promise<InvalidationResult> {
  const authCheck = await verifyAdminAuth();
  if (!authCheck.authorized) {
    return {
      success: false,
      message: authCheck.error || "Unauthorized",
      invalidatedTags: [],
      invalidatedPaths: [],
      timestamp: new Date().toISOString(),
    };
  }

  const slug = rawSlug.trim();
  if (!slug) {
    return {
      success: false,
      message: "Please provide a valid novel slug.",
      invalidatedTags: [],
      invalidatedPaths: [],
      timestamp: new Date().toISOString(),
    };
  }

  const tags = [
    `novel:update:${slug}`,
    CACHE_TAGS.novel.bySlug(slug),
    CACHE_TAGS.novel.updateGeneral,
    CACHE_TAGS.novel.list,
    CACHE_TAGS.novel.all,
    CACHE_TAGS.novel.create,
    CACHE_TAGS.chapter.updateFree,
  ];

  const paths = [
    `/novels/${slug}`,
    `/novels/${slug}/rss.xml`,
    "/novels",
    "/admin/novel",
    "/admin/chapters",
    "/",
  ];

  for (const tag of tags) {
    invalidateTagSafe(tag);
  }

  for (const path of paths) {
    invalidatePathSafe(path);
  }

  return {
    success: true,
    message: `Successfully reset cache for novel "${slug}".`,
    invalidatedTags: tags,
    invalidatedPaths: paths,
    timestamp: new Date().toISOString(),
  };
}
