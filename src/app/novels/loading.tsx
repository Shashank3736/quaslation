import H2 from '@/components/typography/h2'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function loading() {
  return (
    <div className='p-4'>
      <H2 className='text-center'>List of Novels</H2>
      <Separator />
      <div className='flex flex-col mt-4 space-y-2'>
        <Skeleton className="h-6 w-full"></Skeleton>
        <Skeleton className="h-6 w-full"></Skeleton>
        <Skeleton className="h-6 w-full"></Skeleton>
        <Skeleton className="h-6 w-full"></Skeleton>
        <Skeleton className="h-6 w-full"></Skeleton>
        <Skeleton className="h-6 w-full"></Skeleton>
        <Skeleton className="h-6 w-full"></Skeleton>
        <Skeleton className="h-6 w-full"></Skeleton>
        <Skeleton className="h-6 w-full"></Skeleton>
        <Skeleton className="h-6 w-full"></Skeleton>
        <Skeleton className="h-6 w-full"></Skeleton>
        <Skeleton className="h-6 w-full"></Skeleton>
        <Skeleton className="h-6 w-full"></Skeleton>
        <Skeleton className="h-6 w-full"></Skeleton>
        <Skeleton className="h-6 w-full"></Skeleton>
      </div>
    </div>
  )
}
