import React from 'react'
import { getNovelList } from './server'
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const NovelPage = async () => {
  const novels = await getNovelList();
  return (
    <div className='mx-4 space-y-4 grid'>
      {novels.map(novel => (
        <Link 
          key={novel.id} 
          href={`novel/${novel.id}/edit`}
          className='p-4 border rounded-md hover:bg-primary-foreground'
        >
          {novel.title}
        </Link>
      ))}
      <Button asChild>
        <Link href={"novel/create"}>+ Create Novel</Link>
      </Button>
    </div>
  )
}

export default NovelPage