import { Skeleton } from '@/components/ui/skeleton';
import { getNovels, NovelIndex } from '@/lib/hygraph/query'
import React from 'react'
import { FreeNovelChapterDialog } from './novel-box-dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

async function NovelBoxAdmin({ novel }:{ novel: NovelIndex }) {
  return (
    <div className={cn('border m-4 p-4 rounded-lg lg:text-lg')}>
      <p className='mb-2'>{novel.title}</p>
      <div className='flex justify-between'>
        <FreeNovelChapterDialog novel={novel} />
        <Button variant={"outline"} asChild>
          <Link href={`/novels/${novel.slug}`} target='_blank'>
            Novel
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 ml-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </Link>
        </Button>
      </div>
    </div>
  )
}


export const NovelList = async () => {
  const novels = await getNovels({});
  return (
    <div className='flex flex-wrap'>
      {novels.map((novel) => (
        <NovelBoxAdmin key={novel.slug} novel={novel} />
      ))}
    </div>
  )
}

export const NovelListSkeleton = () => {
  return (
    <Skeleton className='h-32 w-72 rounded-lg' />
  )
}