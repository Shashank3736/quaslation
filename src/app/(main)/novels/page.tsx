import H2 from '@/components/typography/h2'
import Muted from '@/components/typography/muted'
import { Separator } from '@/components/ui/separator'
import { db } from '@/lib/db'
import { timeAgo } from '@/lib/utils'
import { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export const metadata: Metadata = {
  title: "Novels | Quaslation",
  description: "A list of asian web novels fan translated by the translators of Quaslation."
}

const getNovelList = async () => {
  return await db.query.novel.findMany({
    columns: {
      title: true,
      slug: true,
      thumbnail: true,
    },
    with: {
      chapters: {
        columns: {
          number: true,
          slug: true,
          publishedAt: true
        },
        with: {
          volume: {
            columns: {
              number: true
            }
          }
        },
        orderBy: (chapter, { desc }) => desc(chapter.serial),
        where: (chapter, { isNotNull, and, eq }) => and(isNotNull(chapter.publishedAt), eq(chapter.premium, false)),
        limit: 2
      }
    },
    orderBy: (novel) => novel.title
  })
}

const getCacheData = unstable_cache(getNovelList, ["novels"], {
  tags: ["chapter_free", "novel_update"],
  revalidate: 12*3600
});

export default async function NovelList() {
  const novels = await getCacheData()
  return (
    <div className='p-4'>
      <H2 className='text-center'>List of Novels</H2>
      <Separator />
      <div className='flex flex-wrap mt-4'>
      {novels.map(novel => novel.chapters.length > 0 ? (
        <div key={novel.slug} className='lg:w-1/2 w-full p-4'>
          <div className="border border-gray p-6 rounded-lg flex flex-col md:flex-row items-center w-full">
            <Image className='w-24 h-fit m-4' src={novel.thumbnail || "/dummy/NoImageFound_light_400x600.png"} alt='thumbnail' width={400} height={600} />
            <div className='flex flex-col space-y-2 w-full'>
              <h2 className='md:text-xl text-center'>
                <Link href={`/novels/${novel.slug}`} className='hover:underline'>{novel.title}</Link>
              </h2>
              <Separator />
              {novel.chapters.map(chap => (
                <div
                  key={chap.slug}
                  className='flex justify-between items-center' 
                >
                  <Link 
                  href={`/novels/${novel.slug}/${chap.slug}`}
                  className='p-2 border border-gray-200 rounded-full text-xs w-fit hover:bg-primary-foreground'
                  >
                    {chap.volume.number < 0 ? "": `Vol. ${chap.volume.number} `}Chapter {chap.number}
                  </Link>
                  <Muted>{timeAgo(chap.publishedAt || new Date())}</Muted>
                </div>
              ))}
            </div>
          </div>
        </div>
      ): null)}
      </div>
    </div>
  )
}
