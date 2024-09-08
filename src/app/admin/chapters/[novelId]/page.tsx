import { getChapters } from '@/lib/db/query';
import { notFound } from 'next/navigation';
import React from 'react'
import { ChaptersTable } from '../chapters-table';

const AdminNovelChapters = async({ params, searchParams }:{ params: { novelId: string }, searchParams: { page?: string }}) => {
  const novelId = parseInt(params.novelId);
  let page = searchParams.page ? parseInt(searchParams.page) : 1;
  if(isNaN(page) || page < 1) page = 1;
  if(isNaN(novelId)) notFound();
  const chapters = await getChapters({ novelId, skip: (page-1)*25, limit: 25 });
  return (
    <div className='m-4'>
      <ChaptersTable data={chapters} />
    </div>
  )
}

export default AdminNovelChapters