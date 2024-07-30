"use client"

import H3 from "@/components/typography/h3"
import Muted from "@/components/typography/muted"
import { Button } from "@/components/ui/button"
import { getLatestPosts, LatestPosts } from "@/lib/actions"
import { timeAgo } from "@/lib/utils"
import Link from "next/link"
import { useState } from "react"

export default function PostList({ posts }:{ posts: LatestPosts}) {
  const [chapters, setChapters] = useState<LatestPosts>(posts)
  const [loading, setLoading] = useState(false)

  const loadMore = ({ skip }:{ skip: number }) => {
    setLoading(true)
    getLatestPosts({ skip }).then(posts => setChapters(chap => ({
      chapters: chap.chapters.concat(posts.chapters),
      chaptersConnection: posts.chaptersConnection
    }))).finally(() => setLoading(false))
  }
  return (
    <div className="flex flex-col p-4">
      {chapters.chapters.map((chapter) => (
        <div key={chapter.id} className="p-4 mb-4 border rounded-lg cursor-pointer" onClick={() => window.location.href=`/chapter/${chapter.id}`}>
          <H3 className="mb-2">Chapter {chapter.chapter}: {chapter.title}</H3>
          <p className="mb-2">{chapter.description}<Link className="text-blue-600 dark:text-blue-400 hover:underline" href={`/chapter/${chapter.id}`}> Read More {">>"}</Link></p>
          <div className="flex justify-between">
            <Muted>Novel: {chapter.novel.title}</Muted>
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
