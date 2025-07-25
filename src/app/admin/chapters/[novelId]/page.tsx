import { getChapters } from '@/lib/db/query';
import { notFound } from 'next/navigation';
import React from 'react'
import { ChaptersTable } from '../chapters-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const AdminNovelChapters = async({ params, searchParams }:{ params: Promise<{ novelId: string }>, searchParams: Promise<{ page?: string }>}) => {
  const paramsResolved = await params;
  const searchParamsResolved = await searchParams;

  const novelId = parseInt(paramsResolved.novelId);
  let page = searchParamsResolved.page ? parseInt(searchParamsResolved.page) : 1;
  const LIMIT = 25
  if(isNaN(page) || page < 1) page = 1;
  if(isNaN(novelId)) notFound();
  const chapters = await getChapters({ novelId, skip: (page-1)*25, limit: LIMIT });
  return (
    <div className='m-4'>
      <div className="flex gap-2 mb-4">
        <Button asChild>
          <Link href={`${novelId}/create`}>
            Create Chapter +
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/admin/volumes/${novelId}/create`}>
            Create Volume +
          </Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href={`/admin/chapters/${novelId}/translate`}>
            Translate Chapters
          </Link>
        </Button>
      </div>
      <ChaptersTable data={chapters} />
      <div className='flex space-x-4 mt-4'>
        <Button disabled={page === 1} asChild>
          <Link href={`?page=${page-1}`}>Previous</Link>
        </Button>
        <Button disabled={chapters.length < LIMIT} asChild>
          <Link href={`?page=${page+1}`}>Next</Link>
        </Button>
      </div>
    </div>
  )
}

export default AdminNovelChapters