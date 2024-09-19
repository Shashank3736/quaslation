import React from 'react'
import H3 from '../typography/h3'
import { SignedIn, SignedOut } from '@clerk/nextjs'
import RestrictedContent from './restricted-content'
import LimitedContent from './limited-content'
import { Button } from '../ui/button'
import Link from 'next/link'
import { ChapterNavigation, ScrollToTop } from './chapter-navigation'
import { getChapterBySlug } from '@/lib/db/query'

export const ChapterPage = async ({ chapter, novelSlug }: { chapter: Awaited<ReturnType<typeof getChapterBySlug>>, novelSlug: string }) => {
  const previous = chapter.previous
  const next = chapter.next
  return (
    <div className='p-4'>
      <H3 className='mb-4'>Chapter {chapter.number}: {chapter.title}</H3>
      {(chapter.premium) ? 
      <>
      <SignedIn>
        <article className='space-y-2 prose lg:prose-xl dark:prose-invert max-w-none' dangerouslySetInnerHTML={{__html: chapter.content}} />
      </SignedIn>
      <SignedOut>
        <RestrictedContent type={"login"}>
          <LimitedContent htmlContent={chapter.content} />
        </RestrictedContent>
      </SignedOut>
      </>
      :(
        <article className='space-y-2 prose lg:prose-xl dark:prose-invert max-w-none' dangerouslySetInnerHTML={{__html: chapter.content}} />
      )}
      <div className='flex justify-between pt-12 pb-4'>
        {previous ? (
          <Link href={`/novels/${novelSlug}/${previous.slug}`}><Button>Previous</Button></Link>
        ):(
          <Button disabled>Previous</Button>
        )}
        <Link href={`/novels/${novelSlug}`}>
          <Button variant={"secondary"}>
            Index
          </Button>
        </Link>
        {next ? (
          <Link href={`/novels/${novelSlug}/${next.slug}`}><Button>Next</Button></Link>
        ):(
          <Button disabled>Next</Button>
        )}
        <ChapterNavigation previousLink={previous ? `/novels/${novelSlug}/${previous.slug}` : undefined} nextLink={next ? `/novels/${novelSlug}/${next.slug}` : undefined} />
      </div>
      <ScrollToTop />
    </div>
  )
}
