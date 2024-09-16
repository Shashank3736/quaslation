import H2 from '@/components/typography/h2'
import { Separator } from '@/components/ui/separator'
import { getNovelList } from '@/lib/db/query'
import { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import Link from 'next/link'
import React from 'react'

export const metadata: Metadata = {
  title: "Novels | Quaslation",
  description: "A list of asian web novels fan translated by the translators of Quaslation."
}

const getCacheData = unstable_cache(getNovelList, ["novels"], {
  tags: ["novelList"],
  revalidate: false
});

export default async function NovelList() {
  const novels = await getCacheData()
  return (
    <div className='p-4'>
      <H2 className='text-center'>List of Novels</H2>
      <Separator />
      <div className='flex flex-col mt-4'>
      {novels.map(novel => (
        <Link className='mb-2 hover:underline text-blue-600 dark:text-primary' key={novel.id} href={`/novels/${novel.slug}`}>{novel.title}</Link>
      ))}
      </div>
    </div>
  )
}
