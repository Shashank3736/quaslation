import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function loading() {
  return (
    <div className='p-4 space-y-3'>
      <Skeleton className='h-8 w-48' />
      <Skeleton className='h-[500px] w-full' />
      <div className="flex justify-between mt-4 space-y-3">
        <Skeleton className="h-6 w-32"></Skeleton>
        <Skeleton className="h-6 w-32"></Skeleton>
        <Skeleton className="h-6 w-32"></Skeleton>
      </div>
    </div>
  )
}
