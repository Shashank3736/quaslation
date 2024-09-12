import { ChapterPage } from '@/components/shared/chapter-page';
import { getChapterBySlug, getChapterSlugMany } from '@/lib/db/query';
import React from 'react'

export async function generateStaticParams() {
  return await getChapterSlugMany();
}

export const revalidate = 3600;

export const dynamicParams = true;

export default async function Page({ params }: { params: { slug: string, chapter: string }}) {
  const chapter = await getChapterBySlug(params.chapter);
  return (
    <ChapterPage chapter={chapter} novelSlug={params.slug} />
  )
}
