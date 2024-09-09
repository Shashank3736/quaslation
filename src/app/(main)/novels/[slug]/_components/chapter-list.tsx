"use client"
import Muted from '@/components/typography/muted'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'
import { getData } from './actions'
import { Volume } from '../loading'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type Chapters = Awaited<ReturnType<typeof getData>>

export default function ChapterList({ novelId, novelSlug }:{ novelId: number, novelSlug: string }) {
  const [chapters, setChapters] = useState<Chapters|null>(null)
  const [loading, setLoading] = useState(false)
  const [more, setMore] = useState(true)

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

  useEffect(() => {
    console.log("Fetching chapter in useEffect.")
    fetchChapters({})
  },[fetchChapters])

  if(chapters === null) {
    return (
      <Volume />
    )
  }
  return (
    <div className='flex flex-col'>
      {chapters.map((chap, i) => (
        <>
        {(chap.volume && chap.volume.number !== -1 && (i === 0 || chap.volume.number !== chapters[i-1].volume?.number)) ? (
          <Muted>Volume {chap.volume.number}{chap.volume.title ? `: ${chap.volume.title}`:""}</Muted>
        ):null}
        <Link className='hover:underline' href={`/novels/${novelSlug}/${chap.slug}`}>{`${chap.number}. ${chap.title}`} {chap.premium ? (<Badge>Coming Soon</Badge>):null}</Link>
        </>
      ))}
      {more ? (
        <Button className='m-4 w-fit' disabled={loading} onClick={() => fetchChapters({ skip: chapters.length })}>{loading ? "Loading":"Load More"}</Button>
      ): null}
    </div>
  )
}
