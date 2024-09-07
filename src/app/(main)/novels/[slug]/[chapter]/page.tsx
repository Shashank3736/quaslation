import { ChapterPage } from '@/components/shared/chapter-page';
import { getChapterBySlug } from '@/lib/db/query';
import React from 'react'

export default async function Page({ params }: { params: { slug: string, chapter: string }}) {
  const chapter = await getChapterBySlug(params.chapter);
  return (
    <ChapterPage chapter={chapter} novelSlug={params.slug} />
  )
}
