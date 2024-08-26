import H1 from '@/components/typography/h1'
import React, { Suspense } from 'react'
import { NovelListSkeleton, NovelList } from './novel-list'

const AdminPage = () => {
  return (
    <div className='m-8'>
      <H1 className='text-center mb-4'>Novels</H1>
      <Suspense fallback={<NovelListSkeleton />}>
        <NovelList />
      </Suspense>
    </div>
  )
}

export default AdminPage