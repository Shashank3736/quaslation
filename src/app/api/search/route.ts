import { NextRequest, NextResponse } from "next/server";
import { getSearchEngine } from "@/lib/search/engine";
import { parseSearchParams } from "@/lib/search/normalize";
import {
  checkSearchRateLimit,
  getClientIp,
} from "@/lib/search/rate-limit";
import { canSeePremium, getSearchAccess } from "@/lib/search/viewer";

/**
 * Ranked results for the search page. The SSR page calls the query layer directly;
 * this endpoint exists for shareable JSON (and for the client filter sidebar).
 *
 * Sliding window: 30 qpm/IP for results. Premium chapter rows are only included for
 * SUBSCRIBER/ADMIN viewers (the `premium` flag can narrow, never widen).
 */
export async function GET(request: NextRequest) {
  const startedAt = Date.now();

  const ip = getClientIp(request);
  const rateLimit = await checkSearchRateLimit(ip, "results");
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many requests. Slow down and try again in a moment." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rateLimit.retryAfterMs / 1000)),
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      }
    );
  }

  const raw: Record<string, string> = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    raw[key] = value;
  });

  const access = await getSearchAccess();
  const params = parseSearchParams(raw, { includePremium: canSeePremium(access) });

  try {
    const engine = getSearchEngine();
    const result = await engine.search(params);
    return NextResponse.json(
      {
        ...result,
        includePremium: params.includePremium,
      },
      { headers: { "Server-Timing": `search;dur=${Date.now() - startedAt}` } }
    );
  } catch (error) {
    console.error("Search request failed:", error);
    return NextResponse.json(
      { error: "Search is temporarily unavailable." },
      { status: 503 }
    );
  }
}
