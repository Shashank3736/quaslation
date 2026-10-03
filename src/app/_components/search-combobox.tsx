"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, FileText, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { AutocompleteHit } from "@/lib/search/types";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 300;

interface AutocompleteResponse {
  hits: AutocompleteHit[];
  cached?: boolean;
}

function hitLabel(hit: AutocompleteHit): string {
  if (hit.docType === "chapter" && hit.chapterNumber !== null) {
    const volume =
      hit.volumeNumber !== null && hit.volumeNumber >= 0
        ? `Vol. ${hit.volumeNumber} `
        : "";
    return `${volume}Ch. ${hit.chapterNumber}: ${hit.title}`;
  }
  return hit.title;
}

/**
 * Navbar typeahead. Debounced fetch against `/api/search/autocomplete` with full
 * keyboard navigation (↑/↓/Enter/Esc) and an ARIA listbox. Mounts nothing when idle —
 * the dropdown only renders while the input is focused and has ≥2 characters.
 */
export function SearchCombobox({ className }: { className?: string }) {
  const router = useRouter();
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<AutocompleteHit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [failed, setFailed] = useState(false);

  const trimmed = query.trim();
  const searchable = trimmed.length >= 2;

  function scheduleFetch(nextQuery: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    if (nextQuery.length < 2) {
      // No fetch is in flight for a non-searchable prefix; clear the panel.
      setHits([]);
      setLoading(false);
      setActiveIndex(-1);
      setFailed(false);
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search/autocomplete?q=${encodeURIComponent(nextQuery)}`,
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error(`autocomplete ${response.status}`);
        const data = (await response.json()) as AutocompleteResponse;
        setHits(Array.isArray(data.hits) ? data.hits : []);
        setFailed(false);
      } catch (error) {
        if ((error as Error)?.name === "AbortError") return;
        setHits([]);
        setFailed(true);
      } finally {
        if (abortRef.current === controller) {
          setLoading(false);
          setActiveIndex(-1);
        }
      }
    }, DEBOUNCE_MS);
  }

  // Abort any in-flight request when the panel unmounts.
  useEffect(() => {
    const timer = debounceRef.current;
    const inFlight = abortRef.current;
    return () => {
      if (timer) clearTimeout(timer);
      inFlight?.abort();
    };
  }, []);

  // Close on outside click.
  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown" && hits.length > 0) {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => (index + 1) % hits.length);
    } else if (event.key === "ArrowUp" && hits.length > 0) {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => (index - 1 + hits.length) % hits.length);
    } else if (event.key === "Enter") {
      if (open && activeIndex >= 0 && hits[activeIndex]) {
        event.preventDefault();
        go(hits[activeIndex].href);
      } else if (searchable) {
        event.preventDefault();
        go(`/search?q=${encodeURIComponent(trimmed)}`);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  const showDropdown = open && (loading || failed || hits.length > 0);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={showDropdown}
          aria-label="Quick search novels and chapters"
          autoComplete="off"
          className="w-44 pl-9 transition-[width] focus:w-64 lg:w-52 lg:focus:w-72"
          placeholder="Search novels…"
          role="combobox"
          spellCheck={false}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            scheduleFetch(event.target.value.trim());
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {loading && searchable && (
          <Loader2
            aria-hidden="true"
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
          />
        )}
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-md border-brutal border-black bg-background shadow-brutal-lg dark:border-white">
          {loading && hits.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              Searching…
            </p>
          ) : failed ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              Search is unavailable right now. Press Enter for the full page.
            </p>
          ) : (
            <ul
              aria-label="Search suggestions"
              className="max-h-80 overflow-y-auto py-1"
              id={listId}
              role="listbox"
            >
              {hits.map((hit, index) => (
                <li key={`${hit.docType}:${hit.novelSlug}:${hit.chapterSlug ?? "novel"}`}
                  role="option"
                  aria-selected={index === activeIndex}
                >
                  <button
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-brutal-yellow hover:text-black",
                      index === activeIndex && "bg-brutal-yellow text-black"
                    )}
                    type="button"
                    onMouseDown={(event) => {
                      // Fire before the blur closes the dropdown.
                      event.preventDefault();
                      go(hit.href);
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    {hit.docType === "chapter" ? (
                      <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />
                    ) : (
                      <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
                    )}
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {hitLabel(hit)}
                      </span>
                      {hit.docType === "chapter" && hit.novelTitle && (
                        <span className="block truncate text-xs opacity-70">
                          {hit.novelTitle}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  className="flex w-full items-center gap-2 border-t-2 border-black px-3 py-2 text-left text-sm font-bold hover:bg-brutal-cyan hover:text-black dark:border-white"
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    go(`/search?q=${encodeURIComponent(trimmed)}`);
                  }}
                >
                  <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
                  See all results for “{trimmed}”
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
