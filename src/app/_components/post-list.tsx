"use client"

import H3 from "@/components/typography/h3"
import Muted from "@/components/typography/muted"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ToastAction } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { ChapterDetail, getLatestPosts, LatestPosts } from "@/lib/actions"
import { shortifyString, timeAgo } from "@/lib/utils"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function PostList({ premium=false }) {
  const [chapters, setChapters] = useState<LatestPosts>({ chaptersConnection: { aggregate: { count: 0 }}, chapters: [] })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const removeDuplicateKeys = (items: ChapterDetail[]) => {
    const seenKeys = new Set();
    return items.filter(item => {
      const key = item.id; // or any other property used as the key
      if (seenKeys.has(key)) {
        toast({
          title: "New Content available",
          description: "Wow! it seems like new webnovel chapter is available for free. Refresh the page to see new free chapter at the top.",
          action: <ToastAction altText="Refresh" onClick={() => window.location.reload()}>Refresh</ToastAction>
        })
        return false;
      } else {
        seenKeys.add(key);
        return true;
      }
    });
  };

  const loadMore = ({ skip }:{ skip: number }) => {
    setLoading(true)
    getLatestPosts({ skip, premium }).then(posts => setChapters(chap => {
      const set = new Set();
      chap.chapters.forEach(ch => set.add(ch.id))
      return {
      chapters: removeDuplicateKeys(chap.chapters.concat(posts.chapters)),
      chaptersConnection: posts.chaptersConnection
    }})).finally(() => setLoading(false))
  }

  useEffect(() => {
    getLatestPosts({ premium }).then(data => setChapters(data))
  },[premium])
  
  return (
    <div className="flex flex-col">
      {chapters.chapters.length > 0 ? chapters.chapters.map((chapter) => (
        <div key={chapter.id} className="p-4 mb-4 border rounded-lg">
          {premium ? (
          <div className="flex items-center mb-2">
            <H3 className="mr-2">Chapter {chapter.chapter}: {chapter.title}</H3>
            <Badge>Premium</Badge>
          </div>
          ):(
            <H3 className="mb-2">Chapter {chapter.chapter}: {chapter.title}</H3>
          )}
          <p className="mb-2">{chapter.description}<Link className="text-blue-600 dark:text-blue-400 hover:underline" href={`/chapter/${chapter.id}`}> Read More {">>"}</Link></p>
          <div className="flex justify-between">
            <Muted><Link className="hover:underline" href={`/novels/${chapter.novel.novel_slug.slug}`} title={chapter.novel.title}>{shortifyString(chapter.novel.title, 20)}</Link></Muted>
            <Muted>{timeAgo(chapter.publishedAt)}</Muted>
          </div>
        </div>
      )):(
        <div>
          {Array.from({ length: 10 }, (_, index) => (
            <div key={index} className="p-4 mb-4 space-y-2 border rounded-lg">
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
      {chapters.chapters.length !== chapters.chaptersConnection.aggregate.count && (
        <Button className="center self-center" disabled={loading} onClick={() => loadMore({ skip: chapters.chapters.length })}>{loading? "Loading...": "Load More"}</Button>
      )}
    </div>
  )
}
