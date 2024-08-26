import { Skeleton } from '@/components/ui/skeleton';
import { getNovels } from '@/lib/hygraph/query'
import Link from 'next/link';
import React from 'react'

export const NovelList = async () => {
  const novels = await getNovels({});
  return (
    <div className='flex flex-wrap'>
      {novels.map((novel) => (
        <Link key={novel.slug} href={`/admin/premium/${novel.slug}/`}>
          <div key={novel.slug} className='text-lg p-4 border m-4 rounded-lg hover:bg-accent hover:text-accent-foreground hover:underline'>{novel.title}</div>
        </Link>
      ))}
    </div>
  )
}

export const NovelListSkeleton = () => {
  return (
    <Skeleton className='h-32 w-72 rounded-lg' />
  )
}