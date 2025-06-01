import { getChapters } from '@/lib/db/query';
import React from 'react'
import { ChaptersTable } from '../chapters-table';

const AdminChapters = async ({ searchParams }:{ searchParams: Promise<{ novelId?:string, page?:string }>}) => {
  const searchParamsResolved = await searchParams;
  const page = searchParamsResolved.page ? parseInt(searchParamsResolved.page) : 1;
  const novelId = searchParamsResolved.novelId ? parseInt(searchParamsResolved.novelId) : undefined;
  const chapters = await getChapters({ novelId, skip: (page-1)*25, limit: 25 })
  return (
    <div className='m-4'>
      <ChaptersTable data={chapters} />
    </div>
  )
}

export default AdminChapters