"use client"

import Link from 'next/link'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  const NOVEL_CHAPTERS_LIMIT = 50;
  const [chapters, setChapters] = useState<Chapters>(data)
  const [loading, setLoading] = useState(false)
  const [more, setMore] = useState<Boolean>(data.length === NOVEL_CHAPTERS_LIMIT)
  const loader = useRef(null);

  const volumes = useMemo(() => getVolumes(chapters, []), [chapters]);

  const fetchChapters = useCallback(async ({ skip=0 }:{ skip?: number}) => {
    if (loading || !more) return;
    setLoading(true)
    const data = await getData({ novelId, skip })
    if(data.length < NOVEL_CHAPTERS_LIMIT) {
      setMore(false)
    }
    setChapters(chaps => {
      if(chaps === null || skip === 0) return data;
      return chaps.concat(data);
    })
    setLoading(false)
  }, [novelId, loading, more])

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "20px",
      threshold: 1.0
    };

    const observer = new IntersectionObserver(handleObserver, options);
    if (loader.current) {
      observer.observe(loader.current)
    }

    return () => {
      if (loader.current) {
        observer.unobserve(loader.current)
      }
    }
  }, []);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting) {
      fetchChapters({ skip: chapters.length });
    }
  }, [fetchChapters, chapters.length]);
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
        <div ref={loader} className="h-10 flex items-center justify-center">
          {loading ? "Loading..." : ""}
        </div>
        ): null}
    </div>
  )
}
