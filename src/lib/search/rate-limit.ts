import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { RATE_LIMITS } from "./constants";
import { getKvClient } from "./kv";

export type SearchRateLimitKind = "results" | "autocomplete";

export interface SearchRateLimitDecision {
  success: boolean;
  limit: number;
  remaining: number;
  /** Milliseconds after which the caller may retry. */
  retryAfterMs: number;
}

/**
 * Best-effort in-memory sliding window. Used when KV is not configured (local dev,
 * previews) and as a last-resort fallback if Upstash is unreachable. On serverless it
 * only limits per warm instance, which is good enough for a graceful degradation path.
 */
const memoryBuckets = new Map<string, number[]>();

function memoryLimit(
  key: string,
  requests: number,
  windowMs: number
): SearchRateLimitDecision {
  const now = Date.now();
  const cutoff = now - windowMs;
  const stamps = (memoryBuckets.get(key) ?? []).filter((stamp) => stamp > cutoff);
  if (stamps.length >= requests) {
    return {
      success: false,
      limit: requests,
      remaining: 0,
      retryAfterMs: Math.max(stamps[0] + windowMs - now, 0),
    };
  }
  stamps.push(now);
  memoryBuckets.set(key, stamps);
  // Bound the map so a burst of distinct IPs cannot grow it forever.
  if (memoryBuckets.size > 10_000) {
    const oldest = memoryBuckets.keys().next();
    if (!oldest.done) memoryBuckets.delete(oldest.value);
  }
  return { success: true, limit: requests, remaining: requests - stamps.length, retryAfterMs: 0 };
}

let resultsLimiter: Ratelimit | null = null;
let autocompleteLimiter: Ratelimit | null = null;
let limitersInitialised = false;

function getLimiter(kind: SearchRateLimitKind): Ratelimit | null {
  if (!limitersInitialised) {
    limitersInitialised = true;
    const redis = getKvClient();
    if (redis) {
      try {
        resultsLimiter = new Ratelimit({
          redis: redis as never,
          limiter: Ratelimit.slidingWindow(
            RATE_LIMITS.results.requests,
            `${RATE_LIMITS.results.windowMs} ms`
          ),
          prefix: "search:ratelimit:results",
        });
        autocompleteLimiter = new Ratelimit({
          redis: redis as never,
          limiter: Ratelimit.slidingWindow(
            RATE_LIMITS.autocomplete.requests,
            `${RATE_LIMITS.autocomplete.windowMs} ms`
          ),
          prefix: "search:ratelimit:autocomplete",
        });
      } catch (error) {
        console.error("Failed to initialise search rate limiters:", error);
        resultsLimiter = null;
        autocompleteLimiter = null;
      }
    }
  }
  return kind === "results" ? resultsLimiter : autocompleteLimiter;
}

/**
 * Extracts the client IP for rate-limit bucketing. Route handlers run behind Vercel's
 * edge, so `x-forwarded-for` carries the real client first.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp?.trim()) return realIp.trim();
  return "anonymous";
}

export async function checkSearchRateLimit(
  identifier: string,
  kind: SearchRateLimitKind
): Promise<SearchRateLimitDecision> {
  const { requests, windowMs } = RATE_LIMITS[kind];
  const key = `${kind}:${identifier || "anonymous"}`;
  const limiter = getLimiter(kind);

  if (!limiter) {
    return memoryLimit(key, requests, windowMs);
  }

  try {
    const { success, limit, remaining, reset } = await limiter.limit(key);
    return {
      success,
      limit,
      remaining,
      retryAfterMs: success ? 0 : Math.max(reset - Date.now(), 0),
    };
  } catch (error) {
    console.error("Search rate limit check failed, falling back to memory limiter:", error);
    return memoryLimit(key, requests, windowMs);
  }
}
