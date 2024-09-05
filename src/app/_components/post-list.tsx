"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import H3 from "@/components/typography/h3"
import Muted from "@/components/typography/muted"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ToastAction } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { action as getLatestPosts } from "./actions"
import { shortifyString, timeAgo } from "@/lib/utils"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

type LatestPosts = Awaited<ReturnType<typeof getLatestPosts>>
type ChapterDetail = LatestPosts[number]

const ChapterItem: React.FC<{ chapter: ChapterDetail; premium: boolean }> = React.memo(({ chapter, premium }) => (
  <article className="p-4 mb-4 border rounded-lg">
    {premium ? (
      <div className="flex items-center mb-2">
        <H3 className="mr-2">Chapter {chapter.number}: {chapter.title}</H3>
        <Badge>Coming Soon</Badge>
      </div>
    ) : (
      <H3 className="mb-2">Chapter {chapter.number}: {chapter.title}</H3>
    )}
    <p className="mb-2">
      {shortifyString(chapter.content.text, 255)}
      <Link 
        className="text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500" 
        href={`/novels/${chapter.novel.slug}/${chapter.slug}`}
        aria-label={`Read more about Chapter ${chapter.number}: ${chapter.title}`}
      > 
        Read More {">>"}
      </Link>
    </p>
    <div className="flex justify-between">
      <Muted>
        <Link 
          className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500" 
          href={`/novels/${chapter.novel.slug}`} 
          title={chapter.novel.title}
          aria-label={`View novel: ${chapter.novel.title}`}
        >
          {shortifyString(chapter.novel.title, 20)}
        </Link>
      </Muted>
      <Muted>
        <time dateTime={new Date(chapter.publishedAt || chapter.createdAt).toISOString()}>
          {timeAgo(chapter.publishedAt || chapter.createdAt)}
        </time>
      </Muted>
    </div>
  </article>
))

ChapterItem.displayName = 'ChapterItem'

export default function PostList({ premium = false }) {
  const [chapters, setChapters] = useState<LatestPosts|null>(null);
  const [loading, setLoading] = useState(false)
  const [more, setMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const mainDivRef = useRef<HTMLDivElement | null>(null)

  const removeDuplicateKeys = useCallback((items: ChapterDetail[]): ChapterDetail[] => {
    const seenKeys = new Set<string>();
    return items.filter(item => {
      const key = item.slug;
      if (seenKeys.has(key)) {
        return false;
      } else {
        seenKeys.add(key);
        return true;
      }
    });
  }, [])

  const fetchLatestPosts = useCallback(async (skip?: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getLatestPosts({ skip, premium })
      if(data.length === 0) {
        setMore(false)
      }
      if (skip) {
        setChapters(chaps => {
          if(chaps === null) return data;
          const updatedChapters = removeDuplicateKeys(chaps.concat(data))
          if (updatedChapters.length !== chaps.length + data.length) {
            toast({
              title: "New Content available",
              description: `Wow! it seems like new webnovel chapter is available for ${premium ? "premium" : "free"}. Refresh the page to see new ${premium ? "premium" : "free"} chapter at the top.`,
              action: <ToastAction altText="Refresh" onClick={() => fetchLatestPosts(0)}>Reload</ToastAction>
            })
          }
          return updatedChapters
        })
      } else {
        setChapters(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      toast({
        title: "Error",
        description: "Failed to fetch latest posts. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      if (skip === 0) {
        mainDivRef.current?.scrollIntoView({ behavior: "smooth" })
      }
    }
  }, [premium, toast, removeDuplicateKeys])

  const loadMore = useCallback(() => {
    fetchLatestPosts(chapters ? chapters.length:0)
  }, [fetchLatestPosts, chapters])

  useEffect(() => {
    fetchLatestPosts()
  }, [fetchLatestPosts])

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          <p>
          {error}
          </p>
          <Button variant="outline" className="mt-2" onClick={() => fetchLatestPosts()}>
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="flex flex-col" ref={mainDivRef} role="feed" aria-busy={loading} aria-live="polite">
      <h2 className="sr-only">{premium ? "Upcoming" : "Latest"} Webnovel Chapters</h2>
      {chapters ? chapters.map((chapter) => (
        <ChapterItem key={chapter.slug} chapter={chapter} premium={premium} />
      )) : (
        <div aria-label="Loading chapters">
          {Array.from({ length: 10 }, (_, index) => (
            <div key={index} className="p-4 mb-4 space-y-2 border rounded-lg" aria-hidden="true">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-28 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      )}
      {more ? (
        <Button 
          className="center self-center" 
          disabled={loading} 
          onClick={loadMore}
          aria-label={loading ? "Loading more chapters" : "Load more chapters"}
        >
          {loading ? "Loading..." : "Load More"}
        </Button>
      ):(
        <Muted>No more chapters.</Muted>
      )}
    </div>
  )
}