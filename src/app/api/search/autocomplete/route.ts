import { NextRequest, NextResponse } from "next/server";
import { getSearchEngine } from "@/lib/search/engine";
import {
  AUTOCOMPLETE_CACHE_TTL_SECONDS,
  AUTOCOMPLETE_LIMIT,
} from "@/lib/search/constants";
import { kvGetJson, kvSetJson } from "@/lib/search/kv";
import { normalizeQuery } from "@/lib/search/normalize";
import { autocompleteQuerySchema } from "@/lib/search/schemas";
import {
  checkSearchRateLimit,
  getClientIp,
} from "@/lib/search/rate-limit";
import type { AutocompleteHit } from "@/lib/search/types";
import { canSeePremium, getSearchAccess } from "@/lib/search/viewer";

const autocompleteKey = (normalized: string, includePremium: boolean, type: string, limit: number) =>
  `search:auto:${includePremium ? "sub" : "pub"}:${type}:${limit}:${normalized.toLowerCase()}`;

export async function GET(request: NextRequest) {
  const startedAt = Date.now();

  // Sliding window: 60 qpm/IP for autocomplete.
  const ip = getClientIp(request);
  const rateLimit = await checkSearchRateLimit(ip, "autocomplete");
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many requests. Slow down and try again in a moment." },
      {
        status: 429,
        headers: retryHeaders(rateLimit),
      }
    );
  }

  const raw: Record<string, string> = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    raw[key] = value;
  });

  const parsed = autocompleteQuerySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters." }, { status: 400 });
  }

  const normalized = normalizeQuery(parsed.data.q);
  const access = await getSearchAccess();
  const includePremium = canSeePremium(access);
  const type = parsed.data.type;
  const limit = Math.min(
    Math.max(Number.parseInt(parsed.data.limit, 10) || AUTOCOMPLETE_LIMIT, 1),
    AUTOCOMPLETE_LIMIT
  );

  // Short prefixes never hit Postgres; the typeahead just stays quiet.
  if (normalized.length < 2) {
    return NextResponse.json({ hits: [], cached: false });
  }

  const key = autocompleteKey(normalized, includePremium, type, limit);
  const cached = await kvGetJson<AutocompleteHit[]>(key);
  if (cached) {
    return NextResponse.json(
      { hits: cached, cached: true },
      { headers: timingHeaders(startedAt) }
    );
  }

  try {
    const engine = getSearchEngine();
    const hits = await engine.autocomplete({ q: normalized, type, includePremium, limit });
    await kvSetJson(key, hits, AUTOCOMPLETE_CACHE_TTL_SECONDS);
    return NextResponse.json(
      { hits, cached: false },
      { headers: timingHeaders(startedAt) }
    );
  } catch (error) {
    console.error("Autocomplete request failed:", error);
    return NextResponse.json(
      { error: "Search is temporarily unavailable." },
      { status: 503 }
    );
  }
}

function retryHeaders(rateLimit: { retryAfterMs: number; limit: number; remaining: number }) {
  return {
    "Retry-After": String(Math.ceil(rateLimit.retryAfterMs / 1000)),
    "X-RateLimit-Limit": String(rateLimit.limit),
    "X-RateLimit-Remaining": String(rateLimit.remaining),
  };
}

function timingHeaders(startedAt: number): HeadersInit {
  return { "Server-Timing": `search;dur=${Date.now() - startedAt}` };
}
