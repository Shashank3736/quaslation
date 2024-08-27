import { ChapterPage } from '@/components/shared/chapter-page';
import { getChapter } from '@/lib/hygraph/query'
import React from 'react'

export default async function Page({ params }: { params: { slug: string, chapter: string }}) {
  const chapter = await getChapter(params.chapter);
  return (
    <ChapterPage chapter={chapter} />
  )
}
