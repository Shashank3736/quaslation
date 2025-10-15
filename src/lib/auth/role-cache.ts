import "server-only";
import { kv } from "@vercel/kv";
import { getUserRole as getUserRoleFromDb } from "../db/query";

/**
 * Role cache interface for managing user role lookups
 */
export interface RoleCache {
  /**
   * Get user role from cache
   * @param userId - User identifier (email or clerk ID)
   * @returns User role or null if not found
   */
  get(userId: string): Promise<string | null>;

  /**
   * Set user role in cache
   * @param userId - User identifier (email or clerk ID)
   * @param role - User role (ADMIN, SUBSCRIBER, MEMBER)
   * @param ttl - Time to live in seconds (default: 3600 = 1 hour)
   */
  set(userId: string, role: string, ttl?: number): Promise<void>;

  /**
   * Invalidate user role cache
   * @param userId - User identifier (email or clerk ID)
   */
  invalidate(userId: string): Promise<void>;
}

/**
 * Default TTL for role cache: 1 hour (3600 seconds)
 * Roles don't change frequently, so this is a reasonable cache duration
 */
const DEFAULT_ROLE_CACHE_TTL = 3600;

/**
 * Generate cache key for user role
 * @param userId - User identifier
 * @returns Cache key in format: role:${userId}
 */
function getRoleCacheKey(userId: string): string {
  return `role:${userId}`;
}

/**
 * KV-based role cache implementation
 */
export const roleCache: RoleCache = {
  async get(userId: string): Promise<string | null> {
    try {
      const cacheKey = getRoleCacheKey(userId);
      const cachedRole = await kv.get<string>(cacheKey);
      return cachedRole;
    } catch (error) {
      console.error("Role cache get error:", error);
      // Return null on error to trigger fallback to database
      return null;
    }
  },

  async set(userId: string, role: string, ttl: number = DEFAULT_ROLE_CACHE_TTL): Promise<void> {
    try {
      const cacheKey = getRoleCacheKey(userId);
      await kv.set(cacheKey, role, { ex: ttl });
    } catch (error) {
      console.error("Role cache set error:", error);
      // Don't throw error - cache failures should not break the application
    }
  },

  async invalidate(userId: string): Promise<void> {
    try {
      const cacheKey = getRoleCacheKey(userId);
      await kv.del(cacheKey);
    } catch (error) {
      console.error("Role cache invalidate error:", error);
      // Don't throw error - cache failures should not break the application
    }
  },
};

/**
 * Get user role with caching
 * This function checks the cache first, then falls back to database query
 * 
 * @param userId - User identifier (email or clerk ID)
 * @returns User role (ADMIN, SUBSCRIBER, MEMBER)
 * 
 * @example
 * ```ts
 * const role = await getCachedUserRole(user.emailAddresses[0].emailAddress);
 * if (role === "ADMIN") {
 *   // Allow access to admin routes
 * }
 * ```
 */
export async function getCachedUserRole(userId: string): Promise<string> {
  try {
    // Try to get from cache first
    const cachedRole = await roleCache.get(userId);
    
    if (cachedRole) {
      return cachedRole;
    }

    // Cache miss - query database
    const role = await getUserRoleFromDb(userId);
    
    // Store in cache for future requests
    await roleCache.set(userId, role);
    
    return role;
  } catch (error) {
    console.error("Error getting cached user role:", error);
    
    // Fallback to direct database query on any error
    try {
      return await getUserRoleFromDb(userId);
    } catch (dbError) {
      console.error("Database fallback error:", dbError);
      // Return default role if everything fails
      return "MEMBER";
    }
  }
}
