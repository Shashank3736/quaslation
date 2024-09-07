import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export const Volume = () => {
  return (
    <div className='mt-2'>
      <Skeleton className='h-3 w-32' />
      <div className='mt-4 space-y-3'>
        <Skeleton className="h-6 w-64"></Skeleton>
        <Skeleton className="h-6 w-64"></Skeleton>
        <Skeleton className="h-6 w-64"></Skeleton>
        <Skeleton className="h-6 w-64"></Skeleton>
        <Skeleton className="h-6 w-64"></Skeleton>
        <Skeleton className="h-6 w-64"></Skeleton>
        <Skeleton className="h-6 w-64"></Skeleton>
        <Skeleton className="h-6 w-64"></Skeleton>
        <Skeleton className="h-6 w-64"></Skeleton>
        <Skeleton className="h-6 w-64"></Skeleton>
        <Skeleton className="h-6 w-64"></Skeleton>
        <Skeleton className="h-6 w-64"></Skeleton>
        <Skeleton className="h-6 w-64"></Skeleton>
        <Skeleton className="h-6 w-64"></Skeleton>
        <Skeleton className="h-6 w-64"></Skeleton>
      </div>
    </div>
  )
}
export default function loading() {
  return (
    <div className='p-4 space-y-3'>
      <Skeleton className='h-12 w-full' />
      <Skeleton className='h-32 w-full' />
      <Separator />
      <div className="mt-4">
        <Volume></Volume>
        <Volume></Volume>
        <Volume></Volume>
        <Volume></Volume>
        <Volume></Volume>
      </div>
    </div>
  )
}
