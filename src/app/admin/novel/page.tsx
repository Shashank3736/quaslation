import React from 'react'
import { getNovelList } from './server'
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const NovelPage = async () => {
  const novels = await getNovelList();
  return (
    <div className='mx-4 space-y-4'>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {novels.map(novel => (
          <Link
            key={novel.id}
            href={`novel/${novel.id}/edit`}
            className='glass p-6 rounded-lg border border-white/15 hover:bg-accent/50 transition-colors block'
          >
            <h3 className="font-medium text-lg">{novel.title}</h3>
          </Link>
        ))}
      </div>
      <Button asChild className="bg-gradient-to-r-indigo-violet text-white hover:opacity-90 transition-opacity">
        <Link href={"novel/create"}>+ Create Novel</Link>
      </Button>
    </div>
  )
}

export default NovelPage