import { ChapterPage } from '@/components/shared/chapter-page';
import { getChapter } from '@/lib/prisma/query';
import { notFound } from 'next/navigation';
import React from 'react'

export default async function Page({ params }: { params: { slug: string, chapter: string }}) {
  try {
    const chapter = await getChapter(params.chapter);
    return (
      <ChapterPage chapter={chapter} />
    )
  } catch (error) {
    notFound()
  }
}
