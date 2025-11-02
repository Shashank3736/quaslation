"use client"

import React, { useState, useCallback, useRef } from "react"
import H3 from "@/components/typography/h3"
import Muted from "@/components/typography/muted"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ToastAction } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { action as getLatestPosts } from "./actions"
import { shortifyString, timeAgo } from "@/lib/utils"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { DISCORD_INVITE_URL } from "@/lib/config"

type LatestPosts = Awaited<ReturnType<typeof getLatestPosts>>
type ChapterDetail = LatestPosts[number]

const ChapterItem: React.FC<{ chapter: ChapterDetail; premium: boolean }> = React.memo(({ chapter, premium }) => (
  <Card className="mb-4 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-xl hover:dark:shadow-brutal-xl-dark transition-all">
    <CardContent className="pt-4">
      {premium ? (
        <div className="flex items-center mb-2">
          <H3 className="mr-2">Chapter {chapter.number}: {chapter.title}</H3>
          <Badge>Coming Soon</Badge>
        </div>
      ) : (
        <H3 className="mb-2">Chapter {chapter.number}: {chapter.title}</H3>
      )}
      <p className="mb-2">
        {shortifyString(chapter.description, 255)}
        <Link 
          className="text-brutal-blue font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-brutal-blue focus:ring-offset-2" 
          href={`/novels/${chapter.novel.slug}/${chapter.slug}`}
          aria-label={`Read more about Chapter ${chapter.number}: ${chapter.title}`}
        > 
          {" "}Read More {">>"}
        </Link>
      </p>
    </CardContent>
    <CardFooter className="flex justify-between">
      <Muted>
        <Link 
          className="hover:underline focus:outline-none focus:ring-2 focus:ring-brutal-blue focus:ring-offset-2" 
          href={`/novels/${chapter.novel.slug}`} 
          title={chapter.novel.title}
          aria-label={`View novel: ${chapter.novel.title}`}
        >
          {shortifyString(chapter.novel.title, 20)}
        </Link>
      </Muted>
      <Muted>
        <time dateTime={new Date(chapter.publishedAt || chapter.createdAt).toISOString()}>
          {timeAgo(new Date(chapter.publishedAt || chapter.createdAt))}
        </time>
      </Muted>
    </CardFooter>
  </Card>
))

ChapterItem.displayName = 'ChapterItem'

interface PostListClientProps {
  initialChapters: LatestPosts
  premium: boolean
}

export function PostListClient({ initialChapters, premium }: PostListClientProps) {
  const [chapters, setChapters] = useState<LatestPosts>(initialChapters)
  const [loading, setLoading] = useState(false)
  const [more, setMore] = useState(initialChapters.length >= 10)
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

  const fetchLatestPosts = useCallback(async (skip: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getLatestPosts({ skip, premium })
      if(data.length < 10) {
        setMore(false)
      }
      if (skip > 0) {
        setChapters(chaps => {
          const updatedChapters = removeDuplicateKeys(chaps.concat(data))
          if (updatedChapters.length !== chaps.length + data.length) {
            toast({
              title: "New Content available",
              description: `Wow! it seems like new webnovel chapter is available for ${premium ? "premium" : "free"}. Refresh the page to see new ${premium ? "premium" : "free"} chapter at the top.`,
              action: <ToastAction altText="Refresh" onClick={() => window.location.reload()}>Reload</ToastAction>
            })
          }
          return updatedChapters
        })
      } else {
        setChapters(data)
        mainDivRef.current?.scrollIntoView({ behavior: "smooth" })
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
    }
  }, [premium, toast, removeDuplicateKeys])

  const loadMore = useCallback(() => {
    fetchLatestPosts(chapters.length)
  }, [fetchLatestPosts, chapters.length])

  if (error) {
    console.error('PostListClient error:', error)
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          <p>
            Something went wrong. Join our <a href={DISCORD_INVITE_URL} className="underline">Discord Server</a> and report it, please.
          </p>
          <Button variant="outline" className="mt-2" onClick={() => fetchLatestPosts(0)}>
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="flex flex-col" ref={mainDivRef} role="feed" aria-busy={loading} aria-live="polite">
      <h2 className="sr-only">{premium ? "Upcoming" : "Latest"} Webnovel Chapters</h2>
      {chapters.map((chapter) => (
        <ChapterItem key={chapter.slug} chapter={chapter} premium={premium} />
      ))}
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
