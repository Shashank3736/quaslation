import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Volume } from '@/lib/hygraph/query'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function VolumeChapters({ data }: { data: Volume }) {
  const volume = data
  return (
    <div className='flex flex-col space-y-1 lg:text-lg'>
      {volume.chapters.length > 0 ? volume.chapters.map((chapter) => (
        <div  key={chapter.slug}>
          <Link href={`/novels/${volume.novel.slug}/${chapter.slug}`} className='hover:underline'>
          {chapter.chapter}. {chapter.title}
          <Badge className={cn("ml-2", {"hidden": !chapter.premium})}>Premium</Badge>
          </Link>
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
  )
}
