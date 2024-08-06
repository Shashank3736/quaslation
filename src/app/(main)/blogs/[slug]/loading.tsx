import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function loading() {
  return (
    <div className="p-4 flex flex-col space-y-3">
      <Skeleton className='h-8 w-64' />
      <Separator className='my-4' />
      <Skeleton className='h-[500px] w-full' />
      <Skeleton className='h-3 w-32 mt-4 self-end' />
    </div>
  )
}
