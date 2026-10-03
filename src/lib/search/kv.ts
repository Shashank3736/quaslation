import "server-only";

/**
 * Conditional Upstash KV client.
 *
 * Mirrors the `role-cache.ts` pattern: when `KV_REST_API_URL`/`KV_REST_API_TOKEN` are
 * absent (local dev, preview deployments without a KV store) every helper here becomes
 * a no-op and the caller falls back to `unstable_cache` or a direct database read.
 */

type KvClient = {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown, options?: { ex?: number }): Promise<unknown>;
  del(key: string): Promise<unknown>;
};

let kv: KvClient | null = null;

if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  try {
    kv = require("@vercel/kv").kv as KvClient;
  } catch (error) {
    console.error("Failed to initialise @vercel/kv, continuing without it:", error);
    kv = null;
  }
}

export function isKvEnabled(): boolean {
  return kv !== null;
}

/** Raw Redis handle, or null when KV is not configured. Used by the rate limiter. */
export function getKvClient(): KvClient | null {
  return kv;
}

export async function kvGetJson<T>(key: string): Promise<T | null> {
  if (!kv) return null;
  try {
    const value = await kv.get(key);
    return value === null || value === undefined ? null : (value as T);
  } catch (error) {
    console.error("KV get failed:", key, error);
    return null;
  }
}

export async function kvSetJson(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  if (!kv) return;
  try {
    await kv.set(key, value, { ex: ttlSeconds });
  } catch (error) {
    console.error("KV set failed:", key, error);
  }
}

export async function kvDel(key: string): Promise<void> {
  if (!kv) return;
  try {
    await kv.del(key);
  } catch (error) {
    console.error("KV del failed:", key, error);
  }
}
