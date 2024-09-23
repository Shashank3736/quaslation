import { ChapterPage } from '@/components/shared/chapter-page';
import { getChapterBySlug, getChapterSlugMany } from '@/lib/db/query';
import { shortifyString } from '@/lib/utils';
import { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import React from 'react'

export async function generateStaticParams() {
  return await getChapterSlugMany();
}


export async function generateMetadata({ params }:{ params: { chapter: string }}): Promise<Metadata> {
  const getCacheData = unstable_cache(getChapterBySlug, ["chapter"], {
    tags: [`chapter:update:content:${params.chapter}`],
    revalidate: 7*24*3600
  });
  const chapter = await getCacheData(params.chapter);
  return {
    title: `${chapter.volumeNumber < 0 ? "":`Vol. ${chapter.volumeNumber} `}Chapter ${chapter.number} - ${chapter.novelTitle} | Quaslation`,
    description: chapter.title+"\n"+shortifyString(chapter.textContent, 400)
  }
}

export default async function Page({ params }: { params: { slug: string, chapter: string }}) {
  const getCacheData = unstable_cache(getChapterBySlug, ["chapter"], {
    tags: [`chapter:update:${params.chapter}`],
    revalidate: 24*3600
  });
  const chapter = await getCacheData(params.chapter);
  return (
    <ChapterPage chapter={chapter} novelSlug={params.slug} />
  )
}