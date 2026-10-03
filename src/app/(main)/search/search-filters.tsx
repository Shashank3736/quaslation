"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NOVEL_STATUS_LABELS } from "@/lib/search/types";
import type { SearchFacets, SearchParams } from "@/lib/search/types";
import { cn } from "@/lib/utils";

interface SearchFiltersProps {
  params: SearchParams;
  facets: SearchFacets;
  canSeePremium: boolean;
  totalForQuery: number | null;
}

const DOC_TYPE_OPTIONS = [
  { value: "all", label: "Novels + chapters" },
  { value: "novel", label: "Novels only" },
  { value: "chapter", label: "Chapters only" },
] as const;

/**
 * Filter sidebar for `/search`. Server-rendered inputs + a GET form, so the page works
 * with JS disabled and every filter combination stays a shareable URL.
 */
export function SearchFilters({ params, facets, canSeePremium, totalForQuery }: SearchFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(params.q);
  const [selectedTags, setSelectedTags] = useState<number[]>(params.tagIds);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(params.statuses);
  const [docType, setDocType] = useState<SearchParams["type"]>(params.type);
  const [language, setLanguage] = useState(params.language ?? "");
  const [author, setAuthor] = useState(params.author ?? "");
  const [minWords, setMinWords] = useState(
    params.minWordCount === null ? "" : String(params.minWordCount)
  );
  const [maxWords, setMaxWords] = useState(
    params.maxWordCount === null ? "" : String(params.maxWordCount)
  );
  const [includePremium, setIncludePremium] = useState(params.includePremium);

  const activeFilterCount =
    selectedTags.length +
    selectedStatuses.length +
    (language ? 1 : 0) +
    (author ? 1 : 0) +
    (minWords || maxWords ? 1 : 0) +
    (docType !== "all" ? 1 : 0);

  function toggleTag(tagId: number) {
    const next = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];
    setSelectedTags(next);
    startTransition(() => router.push(buildHref({ tags: next })));
  }

  function toggleStatus(status: string) {
    const next = selectedStatuses.includes(status)
      ? selectedStatuses.filter((value) => value !== status)
      : [...selectedStatuses, status];
    setSelectedStatuses(next);
    startTransition(() => router.push(buildHref({ statuses: next })));
  }

  function buildHref(next: {
    q?: string;
    type?: SearchParams["type"];
    tags?: number[];
    statuses?: string[];
    language?: string;
    author?: string;
    minWords?: string;
    maxWords?: string;
    premium?: boolean;
  }): string {
    const search = new URLSearchParams();
    const q = next.q ?? query;
    if (q.trim()) search.set("q", q.trim());
    const type = next.type ?? docType;
    if (type !== "all") search.set("type", type);
    if (next.premium ?? includePremium) search.set("premium", "1");
    const tags = next.tags ?? selectedTags;
    if (tags.length) search.set("tags", tags.join(","));
    const statuses = next.statuses ?? selectedStatuses;
    if (statuses.length) search.set("status", statuses.join(","));
    const lang = next.language ?? language;
    if (lang.trim()) search.set("language", lang.trim());
    const auth = next.author ?? author;
    if (auth.trim()) search.set("author", auth.trim());
    const min = next.minWords ?? minWords;
    if (min.trim()) search.set("minWords", min.trim());
    const max = next.maxWords ?? maxWords;
    if (max.trim()) search.set("maxWords", max.trim());
    return `/search${search.toString() ? `?${search.toString()}` : ""}`;
  }

  return (
    <form
      aria-label="Search filters"
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(() => router.push(buildHref({})));
      }}
    >
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Search novels and chapters"
            className="pl-9"
            minLength={0}
            name="q"
            placeholder="Titles, descriptions, chapter text…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        {query && (
          <Button
            aria-label="Clear search query"
            size="icon"
            type="button"
            variant="ghost"
            onClick={() => {
              setQuery("");
              startTransition(() => router.push(buildHref({ q: "" })));
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <fieldset>
        <legend className="mb-2 text-xs font-bold uppercase tracking-wide">
          Showing
        </legend>
        <Select
          value={docType}
          onValueChange={(value) => {
            const next = value as SearchParams["type"];
            setDocType(next);
            startTransition(() => router.push(buildHref({ type: next })));
          }}
        >
          <SelectTrigger aria-label="Result type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DOC_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </fieldset>

      {canSeePremium && (
        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
          <input
            checked={includePremium}
            className="h-4 w-4 accent-current"
            type="checkbox"
            onChange={(event) => {
              setIncludePremium(event.target.checked);
              startTransition(() =>
                router.push(buildHref({ premium: event.target.checked }))
              );
            }}
          />
          Include premium chapters
        </label>
      )}

      {facets.tags.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-xs font-bold uppercase tracking-wide">
            Tags{selectedTags.length > 0 && ` (${selectedTags.length})`}
          </legend>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Tags">
            {facets.tags.map((tag) => {
              const active = selectedTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  aria-pressed={active}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                >
                  <Badge
                    className={cn(!active && "opacity-60")}
                    variant={active ? "default" : "outline"}
                  >
                    {tag.name}
                  </Badge>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="mb-2 text-xs font-bold uppercase tracking-wide">Status</legend>
        <div className="space-y-1.5">
          {facets.statuses.map((status) => {
            const active = selectedStatuses.includes(status);
            return (
              <label
                key={status}
                className="flex cursor-pointer items-center gap-2 text-sm font-semibold"
              >
                <input
                  checked={active}
                  className="h-4 w-4 accent-current"
                  type="checkbox"
                  onChange={() => toggleStatus(status)}
                />
                {NOVEL_STATUS_LABELS[status]}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide" htmlFor="search-language">
            Language
          </label>
          <Input
            id="search-language"
            list="search-language-options"
            placeholder="Any"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            onBlur={(event) =>
              startTransition(() => router.push(buildHref({ language: event.target.value })))
            }
          />
          <datalist id="search-language-options">
            {facets.languages.map((value) => (
              <option key={value} value={value} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide" htmlFor="search-author">
            Translator
          </label>
          <Input
            id="search-author"
            placeholder="Any"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            onBlur={(event) =>
              startTransition(() => router.push(buildHref({ author: event.target.value })))
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide" htmlFor="search-min-words">
            Min words
          </label>
          <Input
            id="search-min-words"
            inputMode="numeric"
            min={0}
            placeholder="0"
            type="number"
            value={minWords}
            onChange={(event) => setMinWords(event.target.value)}
            onBlur={(event) =>
              startTransition(() => router.push(buildHref({ minWords: event.target.value })))
            }
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide" htmlFor="search-max-words">
            Max words
          </label>
          <Input
            id="search-max-words"
            inputMode="numeric"
            min={0}
            placeholder="∞"
            type="number"
            value={maxWords}
            onChange={(event) => setMaxWords(event.target.value)}
            onBlur={(event) =>
              startTransition(() => router.push(buildHref({ maxWords: event.target.value })))
            }
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button className="flex-1" disabled={isPending} type="submit" variant="secondary">
          {isPending ? "Searching…" : "Search"}
        </Button>
        {(params.q || activeFilterCount > 0) && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setQuery("");
              setSelectedTags([]);
              setSelectedStatuses([]);
              setDocType("all");
              setLanguage("");
              setAuthor("");
              setMinWords("");
              setMaxWords("");
              setIncludePremium(false);
              startTransition(() => router.push("/search"));
            }}
          >
            Reset
          </Button>
        )}
      </div>

      {typeof totalForQuery === "number" && (
        <p aria-live="polite" className="text-xs text-muted-foreground">
          Showing {totalForQuery} result{totalForQuery === 1 ? "" : "s"} on this page.
        </p>
      )}
    </form>
  );
}
