import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, SearchX } from "lucide-react";
import H2 from "@/components/typography/h2";
import { Button } from "@/components/ui/button";
import { DecorativeEmptyState } from "@/components/ui/decorative";
import { Separator } from "@/components/ui/separator";
import { getSearchEngine } from "@/lib/search/engine";
import { FALLBACK_LIMIT } from "@/lib/search/constants";
import {
  buildPagedHref,
  isSearchableQuery,
  normalizeQuery,
  parseSearchParams,
} from "@/lib/search/normalize";
import { canSeePremium, getSearchAccess } from "@/lib/search/viewer";
import { SearchFilters } from "./search-filters";
import { PremiumNotice, SearchHitCard } from "./search-hit-card";

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 60) : "";

  if (!q) {
    return {
      title: "Search",
      description: "Search fan-translated Asian web novels and chapters on Quaslation.",
    };
  }

  return {
    title: `Search: ${q}`,
    description: `Search results for "${q}" across Quaslation novels and chapters.`,
    robots: { index: false, follow: true },
  };
}

/** Pager keeps every active filter; only the cursor changes. The "Page" label is a
 * display-only depth hint ("Page 2 of these filters") since keyset pagination has no
 * offsets and arbitrary deep-links are intentionally unsupported. */
function Pager({ href }: { href: string | null }) {
  if (!href) return null;
  return (
    <nav aria-label="Search result pages" className="flex items-center justify-center gap-3 pt-2">
      <Button asChild variant="secondary">
        <Link href={href}>
          Next results
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>
    </nav>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const raw = await searchParams;
  const access = await getSearchAccess();
  const includePremium = canSeePremium(access);
  const params = parseSearchParams(raw, { includePremium });
  const normalized = normalizeQuery(params.q);
  const hasQuery = isSearchableQuery(normalized);

  const engine = getSearchEngine();
  const [result, facets] = await Promise.all([
    hasQuery
      ? engine.search(params)
      : engine.fallback(FALLBACK_LIMIT),
    engine.facets(),
  ]);

  const nextHref = result.nextCursor ? buildPagedHref(params, result.nextCursor) : null;

  return (
    <div className="space-y-6 p-4">
      <div className="text-center">
        <H2 className="text-gradient-indigo-violet mb-2 text-3xl font-bold">
          {result.isFallback ? "Browse the catalogue" : "Search results"}
        </H2>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          {result.isFallback
            ? "Type at least two characters to search titles, descriptions and chapter text — or start from the latest novels below."
            : normalized
              ? <>
                  {result.count} result{result.count === 1 ? "" : "s"} for{" "}
                  <q className="font-semibold text-foreground">{normalized}</q>
                </>
              : "Refine the filters to narrow the catalogue."}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside
          aria-label="Search filters"
          className="h-fit rounded-lg border-brutal border-black bg-background p-4 shadow-brutal dark:border-white lg:sticky lg:top-20"
        >
          <SearchFilters
            canSeePremium={includePremium}
            facets={facets}
            params={params}
            totalForQuery={hasQuery ? result.count : null}
          />
        </aside>

        <section aria-label="Search results" className="min-w-0 space-y-4">
          {!includePremium && hasQuery && <PremiumNotice />}

          {result.hits.length === 0 ? (
            <DecorativeEmptyState className="text-center">
              <SearchX className="mx-auto mb-4 h-10 w-10 text-muted-foreground" aria-hidden="true" />
              <H2 className="mb-2 text-2xl font-bold">No matches found</H2>
              <p className="mx-auto max-w-md text-muted-foreground">
                {normalized ? (
                  <>
                    Nothing matched <q className="font-semibold">{normalized}</q>. Check the
                    spelling, try a shorter query, or drop a filter.
                  </>
                ) : (
                  "Try a different combination of filters."
                )}
              </p>
            </DecorativeEmptyState>
          ) : (
            <>
              <ol className="space-y-4">
                {result.hits.map((hit) => (
                  <li key={`${hit.docType}:${hit.id}`}>
                    <SearchHitCard hit={hit} />
                  </li>
                ))}
              </ol>
              {nextHref && (
                <>
                  <Separator />
                  <Pager href={nextHref} />
                </>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
