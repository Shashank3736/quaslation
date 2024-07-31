"use client"

import H3 from "@/components/typography/h3"
import Muted from "@/components/typography/muted"
import { Button } from "@/components/ui/button"
import { ChapterDetail, getLatestPosts, LatestPosts } from "@/lib/actions"
import { timeAgo } from "@/lib/utils"
import Link from "next/link"
import { useState } from "react"

export default function PostList({ posts }:{ posts: LatestPosts}) {
  const [chapters, setChapters] = useState<LatestPosts>(posts)
  const [loading, setLoading] = useState(false)

  const removeDuplicateKeys = (items: ChapterDetail[]) => {
    const seenKeys = new Set();
    return items.filter(item => {
      const key = item.id; // or any other property used as the key
      if (seenKeys.has(key)) {
        return false;
      } else {
        seenKeys.add(key);
        return true;
      }
    });
  };

  const loadMore = ({ skip }:{ skip: number }) => {
    setLoading(true)
    getLatestPosts({ skip }).then(posts => setChapters(chap => {
      const set = new Set();
      chap.chapters.forEach(ch => set.add(ch.id))
      return {
      chapters: removeDuplicateKeys(chap.chapters.concat(posts.chapters)),
      chaptersConnection: posts.chaptersConnection
    }})).finally(() => setLoading(false))
  }
  
  return (
    <div className="flex flex-col p-4">
      {chapters.chapters.map((chapter) => (
        <div key={chapter.id} className="p-4 mb-4 border rounded-lg">
          <H3 className="mb-2">Chapter {chapter.chapter}: {chapter.title}</H3>
          <p className="mb-2">{chapter.description}<Link className="text-blue-600 dark:text-blue-400 hover:underline" href={`/chapter/${chapter.id}`}> Read More {">>"}</Link></p>
          <div className="flex justify-between">
            <Muted><Link className="hover:underline" href={`/novels/${chapter.novel.novel_slug.slug}`}>{chapter.novel.title}</Link></Muted>
            <Muted>{timeAgo(chapter.publishedAt)}</Muted>
          </div>
        </div>
      ))}
      {chapters.chapters.length !== chapters.chaptersConnection.aggregate.count && (
        <Button className="center self-center" disabled={loading} onClick={() => loadMore({ skip: chapters.chapters.length })}>{loading? "Loading...": "Load More"}</Button>
      )}
    </div>
  )
}
