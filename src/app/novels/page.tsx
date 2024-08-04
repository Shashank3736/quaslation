import H2 from '@/components/typography/h2'
import { Separator } from '@/components/ui/separator'
import { getNovels } from '@/lib/actions'
import Link from 'next/link'
import React from 'react'

export default async function NovelList() {
  const novels = await getNovels({})
  return (
    <div className='p-4'>
      <H2 className='text-center'>List of Novels</H2>
      <Separator />
      <div className='flex flex-col mt-4'>
      {novels.map(novel => (
        <Link className='mb-2 hover:underline md:text-lg' key={novel.id} href={`/novels/${novel.novel_slug.slug}`}>{novel.title}</Link>
      ))}
      </div>
    </div>
  )
}
