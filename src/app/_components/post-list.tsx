"use client"

import { getLatestPosts, LatestPosts } from "@/lib/actions"
import { useState } from "react"

export default function PostList({ posts }:{ posts: LatestPosts}) {
  const [chapters, setChapters] = useState<LatestPosts>(posts)

  const loadMore = ({ skip }:{ skip: number }) => {
    getLatestPosts({ skip }).then(posts => setChapters(chap => ({
      chapters: chap.chapters.concat(posts.chapters),
      chaptersConnection: posts.chaptersConnection
    })))
  }
  return (
    <div>
      {chapters.chapters.map((chapter) => (
        <div key={chapter.id}>
          <h3>Chapter {chapter.chapter}: {chapter.title}</h3>
          <p>{chapter.description}</p>
        </div>
      ))}
      {chapters.chapters.length !== chapters.chaptersConnection.aggregate.count && (
        <button onClick={() => loadMore({ skip: chapters.chapters.length })}>Load More</button>
      )}
    </div>
  )
}
