import LimitedContent from '@/components/shared/limited-content';
import RestrictedContent from '@/components/shared/restricted-content';
import H3 from '@/components/typography/h3';
import { Button } from '@/components/ui/button';
import { getChapter } from '@/lib/actions'
import { Protect, SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';
import React from 'react'

export default async function ChapterPage({ params }: { params: { id: string }}) {
  const chapter = await getChapter(params.id);
  
  return (
    <div className='p-4'>
      <H3 className='mb-4'>Chapter {chapter.chapter}: {chapter.title}</H3>
      <SignedIn>
        {(chapter.premium) ? 
        <Protect role='org:member'
        fallback={
          (
            <RestrictedContent type={"premium"}>
              <LimitedContent htmlContent={chapter.content.html} />
            </RestrictedContent>
          )}
        >
          <article className='space-y-2 prose lg:prose-xl dark:prose-invert' dangerouslySetInnerHTML={{__html: chapter.content.html}} />
        </Protect>
        :(
          <article className='space-y-2 prose lg:prose-xl dark:prose-invert' dangerouslySetInnerHTML={{__html: chapter.content.html}} />
        )}
      </SignedIn>
      <SignedOut>
        <RestrictedContent>
          <LimitedContent htmlContent={chapter.content.html} />
        </RestrictedContent>
      </SignedOut>
      <div className='flex justify-between mt-4'>
        {chapter.previous ? (
          <Link href={`/chapter/${chapter.previous.id}`}><Button>Previous</Button></Link>
        ):(
          <Button disabled>Previous</Button>
        )}
        <Link href={`/novels/${chapter.novel.novel_slug.slug}`}>
          <Button variant={"secondary"}>
            Index
          </Button>
        </Link>
        {chapter.next ? (
          <Link href={`/chapter/${chapter.next.id}`}><Button>Next</Button></Link>
        ):(
          <Button disabled>Next</Button>
        )}
      </div>
    </div>
  )
}
