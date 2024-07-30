"use client"

import H3 from "@/components/typography/h3"
import { Button } from "@/components/ui/button"
import { getLatestPosts, LatestPosts } from "@/lib/actions"
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
    <div>
      {chapters.chapters.map((chapter) => (
        <div key={chapter.id}>
          <H3>Chapter {chapter.chapter}: {chapter.title}</H3>
          <p>{chapter.description}</p>
        </div>
      ))}
      {chapters.chapters.length !== chapters.chaptersConnection.aggregate.count && (
        <Button disabled={loading} onClick={() => loadMore({ skip: chapters.chapters.length })}>{loading? "Loading...": "Load More"}</Button>
      )}
    </div>
  )
}
