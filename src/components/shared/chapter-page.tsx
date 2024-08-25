
import { FullChapter } from '@/lib/hygraph/query'
import React from 'react'
import H3 from '../typography/h3'
import { SignedIn, SignedOut } from '@clerk/nextjs'
import RestrictedContent from './restricted-content'
import LimitedContent from './limited-content'
import { Button } from '../ui/button'
import Link from 'next/link'
import { ChapterNavigation, ScrollToTop } from './chapter-navigation'

export const ChapterPage = ({ chapter }: { chapter: FullChapter }) => {
  return (
    <div className='p-4'>
      <H3 className='mb-4'>Chapter {chapter.chapter}: {chapter.title}</H3>
      {(chapter.premium) ? 
      <>
      <SignedIn>
        <article className='space-y-2 prose lg:prose-xl dark:prose-invert max-w-none' dangerouslySetInnerHTML={{__html: chapter.content.html}} />
      </SignedIn>
      <SignedOut>
        <RestrictedContent>
          <LimitedContent htmlContent={chapter.content.html} />
        </RestrictedContent>
      </SignedOut>
      </>
      :(
        <article className='space-y-2 prose lg:prose-xl dark:prose-invert max-w-none' dangerouslySetInnerHTML={{__html: chapter.content.html}} />
      )}
      <div className='flex justify-between pt-12 pb-4'>
        {chapter.previous ? (
          <Link href={`/novels/${chapter.novel.slug}/${chapter.previous.slug}`}><Button>Previous</Button></Link>
        ):(
          <Button disabled>Previous</Button>
        )}
        <Link href={`/novels/${chapter.novel.slug}`}>
          <Button variant={"secondary"}>
            Index
          </Button>
        </Link>
        {chapter.next ? (
          <Link href={`/novels/${chapter.novel.slug}/${chapter.next.slug}`}><Button>Next</Button></Link>
        ):(
          <Button disabled>Next</Button>
        )}
        <ChapterNavigation previousLink={chapter.previous ? `/novels/${chapter.novel.slug}/${chapter.previous.slug}` : undefined} nextLink={chapter.next ? `/novels/${chapter.novel.slug}/${chapter.next.slug}` : undefined} />
      </div>
      <ScrollToTop />
    </div>
  )
}
