"use client"

import Link from 'next/link'
import React, { useCallback, useMemo, useState } from 'react'
import { getData } from './actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import H2 from '@/components/typography/h2'

type Chapters = Awaited<ReturnType<typeof getData>>
type Volumes = {
  number: number;
  title: string | null;
  chapters: {
    number: number;
    title: string;
    slug: string;
    premium: boolean;
  }[]
}[]

const getVolumes = (data: Chapters, volumes: Volumes) => {
  for(const chapter of data) {
    if(volumes.at(-1)?.number === chapter.volume.number) {
      volumes[volumes.length - 1].chapters.push(chapter);
    } else {
      volumes.push({
        ...chapter.volume,
        chapters: [chapter]
      })
    }
  }

  return volumes;
}

export default function ChapterList({ novelId, novelSlug, data }:{ novelId: number, novelSlug: string, data: Chapters }) {
  const [chapters, setChapters] = useState<Chapters>(data)
  const [loading, setLoading] = useState(false)
  const [more, setMore] = useState<Boolean>(data.length === 25)

  const volumes = useMemo(() => getVolumes(chapters, []), [chapters]);

  const fetchChapters = useCallback(async ({ skip=0 }:{ skip?: number}) => {
    setLoading(true)
    const data = await getData({ novelId, skip })
    if(data.length < 25) {
      setMore(false)
    }
    setChapters(chaps => {
      if(chaps === null || skip === 0) return data;
      return chaps.concat(data);
    })
    setLoading(false)
  }, [novelId])
  return (
    <div className='flex flex-col space-y-4'>
      {volumes.map(volume => (
        <section key={volume.number}>
          {volume.number >= 0 ? (
            <H2>{`Volume ${volume.number}`+(volume.title ? `: ${volume.title}`:"")}</H2>
          ):null}
          <div className='flex flex-col space-y-2'>
          {volume.chapters.map(chap => (
            <Link key={chap.slug} href={`${novelSlug}/${chap.slug}`} className='hover:underline'>
              <span>{chap.number}. {chap.title}</span>
              {chap.premium ? (
                <Badge className='ml-2'>Premium</Badge>
              ):null}
            </Link>
          ))}
          </div>
        </section>
      ))}
      {more ? (
        <Button className='m-4 w-fit' disabled={loading} onClick={() => fetchChapters({ skip: chapters.length })}>{loading ? "Loading":"Load More"}</Button>
      ): null}
    </div>
  )
}
