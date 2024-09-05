import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getVolume } from '@/lib/prisma/query'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Suspense } from 'react'

export async function GetVolume({ id }: { id: string }) {
  const volume = await getVolume(id);
  return (
    <div className='flex flex-col space-y-1 lg:text-lg'>
      {volume.Chapter.map((chapter) => (
        <div  key={chapter.slug}>
          <Link href={`/novels/${volume.novel.slug}/${chapter.slug}`} className='hover:underline'>
          {chapter.number}. {chapter.title}
          <Badge className={cn("ml-2", {"hidden": !chapter.premium})}>Coming Soon</Badge>
          </Link>
        </div>
      ))}
    </div>
  )
}

export const LoadingVolume = () => (
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
)

export const VolumeChapters = ({ id }: { id: string }) => (
  <Suspense fallback={<LoadingVolume />}>
    <GetVolume id={id} />
  </Suspense>
)
