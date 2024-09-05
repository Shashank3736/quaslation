import { ChapterPage } from '@/components/shared/chapter-page';
import { getChapterSlug } from '@/lib/hygraph/query'
import { getChapter } from '@/lib/prisma/query';
import React from 'react'

export default async function Page({ params }: { params: { id: string }}) {
  const slug = await getChapterSlug(params.id);
  const chapter = await getChapter(slug.slug);
  
  return (
    <ChapterPage chapter={chapter} />
  )
}
