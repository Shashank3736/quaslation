"use client"

import Link from 'next/link'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getData } from './actions'
import { Badge } from '@/components/ui/badge'
import H2 from '@/components/typography/h2'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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

  const fetchChapters = useCallback(async ({ skip }:{ skip: number }) => {
    if (loading || !more) return;
    setLoading(true)
    
    const data = await getData({ novelId, skip, slug: novelSlug });
    // console.log("Size of fetched data:", data.length)
    if(data.length < NOVEL_CHAPTERS_LIMIT) {
      setMore(false)
    }
    setChapters(chaps => {
      // console.log(chaps.length, skip);
      if(chaps.length !== skip) return chaps;
      if(chaps === null || skip === 0) return data;
      return chaps.concat(data);
    })
    setLoading(false)
  }, [novelId, loading, more, novelSlug])
  
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting) {
      fetchChapters({ skip: chapters.length });
    }
  }, [fetchChapters, chapters.length]);
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

    const current = loader.current

    return () => {
      if (current) {
        observer.unobserve(current)
      }
    }
  }, [handleObserver]);

  return (
    <div className='space-y-6'>
      {volumes.map(volume => (
        <Card key={volume.number} className="glass">
          <CardHeader>
            {volume.number >= 0 ? (
              <CardTitle className="text-xl text-gradient-indigo-violet">
                {`Volume ${volume.number}`+(volume.title ? `: ${volume.title}`:"")}
              </CardTitle>
            ):null}
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
              {volume.chapters.map(chap => (
                <Link
                  key={chap.slug}
                  href={`${novelSlug}/${chap.slug}`}
                  className="group flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/50 hover:border-primary/50 transition-all duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {chap.number}. {chap.title}
                    </div>
                  </div>
                  {chap.premium && (
                    <Badge className="ml-2 bg-gradient-to-r-indigo-violet text-white">
                      Premium
                    </Badge>
                  )}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      {more ? (
        <div ref={loader} className="h-12 flex items-center justify-center">
          <div className="text-muted-foreground">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Loading more chapters...
              </div>
            ) : (
              <div className="text-sm">Scroll to load more</div>
            )}
          </div>
        </div>
      ): null}
    </div>
  )
}
