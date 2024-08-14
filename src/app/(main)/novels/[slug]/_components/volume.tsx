"use client"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { GetVolume, getVolume } from '@/lib/actions'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function VolumeChapters({ volumeId }: { volumeId: string }) {
  const [volume, setVolume] = useState<GetVolume>({ chaptersConnection: { aggregate: { count: 0 }}, volume: { chapters: []}})
  const [loading, setLoading] = useState(false)

  const loadMore = () => {
    setLoading(true)
    getVolume({ id: volumeId, skip: volume.volume.chapters.length })
    .then(data => setVolume(volume => (
      {
        chaptersConnection: data.chaptersConnection,
        volume: {
          chapters: volume.volume.chapters.concat(data.volume.chapters)
        }
      }
    )))
    .finally(() => setLoading(false))
  }

  useEffect(() => {
    getVolume({ id: volumeId }).then(data => setVolume(data))
  }, [volumeId])
  return (
    <div>
      <div className='flex flex-col space-y-1'>
        {volume.volume.chapters.length > 0 ? volume.volume.chapters.map((chapter) => (
          <div  key={chapter.id} className='flex'>
            <Link href={`/chapter/${chapter.id}`} className='hover:underline'>{chapter.chapter}. {chapter.title}</Link>
            <Badge className={cn("ml-3", {"hidden": !chapter.premium})}>Premium</Badge>
          </div>
        )):(
          <div>
            <Skeleton className='h-6 w-52 rounded mt-2' />
            <Skeleton className='h-6 w-52 rounded mt-2' />
            <Skeleton className='h-6 w-52 rounded mt-2' />
            <Skeleton className='h-6 w-52 rounded mt-2' />
            <Skeleton className='h-6 w-52 rounded mt-2' />
            <Skeleton className='h-6 w-52 rounded mt-2' />
            <Skeleton className='h-6 w-52 rounded mt-2' />
            <Skeleton className='h-6 w-52 rounded mt-2' />
            <Skeleton className='h-6 w-52 rounded mt-2' />
            <Skeleton className='h-6 w-52 rounded mt-2' />
          </div>
        )}
      </div>
      <Button 
        className={cn("my-4 ml-4", { "hidden": volume.volume.chapters.length === volume.chaptersConnection.aggregate.count })} 
        onClick={() => loadMore()}
        disabled={loading}
        >
          {loading? "Loading...":`Load More >>`}
      </Button>
    </div>
  )
}
