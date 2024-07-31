import H2 from '@/components/typography/h2'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function loading() {
  return (
    <div className='p-4'>
      <H2>Blogs & Updates</H2>
      <Separator className='my-4' />
      <div className='mt-4'>
        {Array.from({ length: 10 }, (_, index) => (
          <div key={index} className='flex flex-col space-y-2 p-8 mt-4 border rounded-lg'>
            <Skeleton className='h-4 w-32 mb-2' />
            <Skeleton className='h-28 w-full' />
            <div className="flex justify-between mt-4">
              <Skeleton className='h-6 w-16' />
              <Skeleton className='h-3 w-16' />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
