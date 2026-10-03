import "server-only";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getCachedUserRole } from "@/lib/auth/role-cache";
import { ACCESS_CACHE_TTL_SECONDS } from "./constants";
import { kvGetJson, kvSetJson } from "./kv";
import type { SearchAccess } from "./types";

const accessCacheKey = (userId: string) => `search:access:${userId}`;

function mapRole(role: string): SearchAccess {
  if (role === "ADMIN") return "admin";
  if (role === "SUBSCRIBER") return "subscriber";
  return "member";
}

/**
 * Resolves how much of the catalogue the current viewer may see.
 *
 * Per decision D5 of the search plan, premium chapter rows are only searchable by
 * SUBSCRIBER and ADMIN viewers; everyone else (including signed-in MEMBERS) gets the
 * public-only result set. Signed-in users are cached in KV so the navbar typeahead does
 * not pay for a Clerk round trip on every keystroke.
 */
export async function getSearchAccess(): Promise<SearchAccess> {
  try {
    const { userId } = await auth();
    if (!userId) return "anonymous";

    const cached = await kvGetJson<SearchAccess>(accessCacheKey(userId));
    if (cached) return cached;

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) return "member";

    const access = mapRole(await getCachedUserRole(email));
    await kvSetJson(accessCacheKey(userId), access, ACCESS_CACHE_TTL_SECONDS);
    return access;
  } catch (error) {
    // Never fail a search because of an auth hiccup: fall back to the public catalogue.
    console.error("Failed to resolve search access level:", error);
    return "member";
  }
}

/** True when the viewer may see premium chapter rows. */
export function canSeePremium(access: SearchAccess): boolean {
  return access === "subscriber" || access === "admin";
}
