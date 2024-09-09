import { getChapters } from '@/lib/db/query';
import React from 'react'
import { ChaptersTable } from '../chapters-table';

const AdminChapters = async ({ searchParams }:{ searchParams: { novelId?:string, page?:string }}) => {
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const novelId = searchParams.novelId ? parseInt(searchParams.novelId) : undefined;
  const chapters = await getChapters({ novelId, skip: (page-1)*25, limit: 25 })
  return (
    <div className='m-4'>
      <ChaptersTable data={chapters} />
    </div>
  )
}

export default AdminChapters