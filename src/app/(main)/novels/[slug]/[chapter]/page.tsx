import { ChapterPage } from '@/components/shared/chapter-page';
import { getChapterBySlug, getChapterSlugMany } from '@/lib/db/query';
import { shortifyString } from '@/lib/utils';
import { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import React from 'react'

export async function generateStaticParams() {
  return await getChapterSlugMany();
}


export async function generateMetadata({ params }:{ params: Promise<{ chapter: string }>}): Promise<Metadata> {
  const paramsResolved = await params;
  const getCacheData = unstable_cache(getChapterBySlug, [], {
    tags: [`chapter:update:content:${paramsResolved.chapter}`],
    revalidate: 7*24*3600
  });
  const chapter = await getCacheData(paramsResolved.chapter);
  return {
    title: `${chapter.volumeNumber < 0 ? "":`Vol. ${chapter.volumeNumber} `}Chapter ${chapter.number} - ${chapter.novelTitle}`,
    description: chapter.title+"\n"+shortifyString(chapter.textContent, 400)
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string, chapter: string }>}) {
  const paramsResolved = await params;
  const getCacheData = unstable_cache(getChapterBySlug, [], {
    tags: [`chapter:update:${paramsResolved.chapter}`],
    revalidate: 24*3600
  });
  const chapter = await getCacheData(paramsResolved.chapter);
  return (
    <ChapterPage chapter={chapter} novelSlug={paramsResolved.slug} />
  )
}