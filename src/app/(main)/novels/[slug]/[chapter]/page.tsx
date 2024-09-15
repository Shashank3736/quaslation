import { ChapterPage } from '@/components/shared/chapter-page';
import { getChapterBySlug, getChapterSlugMany } from '@/lib/db/query';
import { shortifyString } from '@/lib/utils';
import { Metadata } from 'next';
import React from 'react'

export async function generateStaticParams() {
  return await getChapterSlugMany();
}

export async function generateMetadata({ params }:{ params: { chapter: string }}): Promise<Metadata> {
  const chapter = await getChapterBySlug(params.chapter);
  return {
    title: `${chapter.volumeNumber < 0 ? "":`Vol. ${chapter.volumeNumber} `}Chapter ${chapter.number} - ${chapter.novelTitle} | Quaslation`,
    description: `${chapter.title}\n${shortifyString(chapter.textContent, 400)}`
  }
}

export default async function Page({ params }: { params: { slug: string, chapter: string }}) {
  const chapter = await getChapterBySlug(params.chapter);
  return (
    <ChapterPage chapter={chapter} novelSlug={params.slug} />
  )
}

export const revalidate = 3600;

export const dynamicParams = true;