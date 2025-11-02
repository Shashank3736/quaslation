import React from "react"
import H3 from "@/components/typography/h3"
import Muted from "@/components/typography/muted"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { shortifyString, timeAgo } from "@/lib/utils"
import Link from "next/link"
import { getReleases } from "@/lib/db/query"
import { createFrequentCachedQuery, CACHE_TAGS } from "@/lib/cache"
import { PostListClient } from "./post-list-client"

type ChapterDetail = Awaited<ReturnType<typeof getReleases>>[number]

const ChapterItem: React.FC<{ chapter: ChapterDetail; premium: boolean }> = React.memo(({ chapter, premium }) => (
  <Card accent={premium ? "pink" : "cyan"} className="mb-4 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-xl hover:dark:shadow-brutal-xl-dark transition-all">
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

// Create cached query for releases with 1 hour revalidation
const getCachedReleases = createFrequentCachedQuery(
  getReleases,
  [CACHE_TAGS.releases.all, CACHE_TAGS.chapter.all],
  ['releases']
)

interface PostListServerProps {
  premium?: boolean
}

export async function PostListServer({ premium = false }: PostListServerProps) {
  // Fetch initial data on the server with caching
  const initialChapters = await getCachedReleases({ skip: 0, premium })

  return (
    <PostListClient 
      initialChapters={initialChapters} 
      premium={premium}
    />
  )
}
