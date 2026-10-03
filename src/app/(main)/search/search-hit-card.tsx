import Image from "next/image";
import Link from "next/link";
import { BookOpen, FileText, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Muted from "@/components/typography/muted";
import { NOVEL_STATUS_LABELS } from "@/lib/search/types";
import type { SearchHit } from "@/lib/search/types";
import { timeAgo } from "@/lib/utils";

function Snippet({ html }: { html: string | null }) {
  if (!html) return null;
  // `ts_headline` wraps matches in <mark>; everything else is plain DB text, and the
  // only markup we emit is our own <mark>. Strip any stray tags defensively anyway.
  const safe = html.replace(/<(?!\/?mark\b)[^>]*>/gi, "");
  return (
    <p
      className="text-sm text-muted-foreground [&_mark]:bg-brutal-yellow [&_mark]:px-0.5 [&_mark]:text-black dark:[&_mark]:text-black"
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}

export function SearchHitCard({ hit }: { hit: SearchHit }) {
  const isChapter = hit.docType === "chapter";

  return (
    <Card className="relative overflow-hidden border-brutal border-black bg-background shadow-brutal transition-all duration-200 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-lg dark:border-white">
      <div className="flex gap-4 p-4">
        {hit.thumbnail && !isChapter ? (
          <div className="relative hidden w-20 shrink-0 overflow-hidden rounded-md border-brutal border-black sm:block dark:border-white">
            <Image
              alt={hit.title}
              className="aspect-[2/3] w-full object-cover"
              height={120}
              src={hit.thumbnail}
              width={80}
            />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <CardHeader className="p-0 pb-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant={isChapter ? "secondary" : "default"}>
                <span className="flex items-center gap-1">
                  {isChapter ? (
                    <FileText className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    <BookOpen className="h-3 w-3" aria-hidden="true" />
                  )}
                  {isChapter ? "Chapter" : "Novel"}
                </span>
              </Badge>
              {hit.status && !isChapter && (
                <Badge variant="outline">{NOVEL_STATUS_LABELS[hit.status]}</Badge>
              )}
              {hit.language && (
                <Badge variant="outline">{hit.language}</Badge>
              )}
            </div>
            <CardTitle className="text-lg font-bold leading-snug">
              <Link className="hover:underline" href={hit.href}>
                {isChapter && hit.chapterNumber !== null && hit.volumeNumber !== null ? (
                  <>
                    {hit.volumeNumber >= 0 ? `Vol. ${hit.volumeNumber} ` : ""}
                    Ch. {hit.chapterNumber}: {hit.title}
                  </>
                ) : (
                  hit.title
                )}
              </Link>
            </CardTitle>
            {isChapter && hit.chapterNumber !== null && (
              <Muted className="text-xs">
                {hit.volumeNumber !== null && hit.volumeNumber >= 0
                  ? `Volume ${hit.volumeNumber} · `
                  : ""}
                Chapter {hit.chapterNumber}
                {hit.sortDate ? ` · ${timeAgo(new Date(hit.sortDate))}` : ""}
              </Muted>
            )}
          </CardHeader>
          <CardContent className="space-y-2 p-0">
            <Snippet html={hit.snippet} />
            {hit.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {hit.tags.slice(0, 5).map((tagName) => (
                  <Badge key={tagName} className="text-[11px]" variant="pink">
                    {tagName}
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {hit.author && <span>By {hit.author}</span>}
              {typeof hit.wordCount === "number" && hit.wordCount > 0 && (
                <span>{hit.wordCount.toLocaleString()} words</span>
              )}
              {isChapter && (
                <Link
                  className="font-semibold text-primary hover:underline"
                  href={`/novels/${hit.novelSlug}`}
                >
                  All chapters →
                </Link>
              )}
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}

export function PremiumNotice() {
  return (
    <div
      className="flex items-start gap-3 rounded-md border-brutal border-black bg-brutal-yellow/20 p-3 text-sm dark:border-white"
      role="note"
    >
      <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p>
        Premium chapter titles are hidden from these results.{" "}
        <Link className="font-semibold underline" href="/auth/sign-in">
          Sign in as a subscriber
        </Link>{" "}
        to search the full catalogue.
      </p>
    </div>
  );
}
