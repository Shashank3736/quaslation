import React from 'react'
import H3 from '../typography/h3'
import { SignedIn, SignedOut } from '@clerk/nextjs'
import RestrictedContent from './restricted-content'
import LimitedContent from './limited-content'
import { Button } from '../ui/button'
import Link from 'next/link'
import { ChapterNavigation } from './chapter-navigation'
import { getChapterBySlug } from '@/lib/db/query'
import JoinDiscord from './join-discord'
import NovelSuggestions from './novel-suggestions'

export const ChapterPage = async ({ 
  chapter, 
  novelSlug,
commentSection 
}: { 
  chapter: Awaited<ReturnType<typeof getChapterBySlug>>, 
  novelSlug: string,
  commentSection?: React.ReactNode
}) => {
  const previous = chapter.previous
  const next = chapter.next
  return (
    <div className='p-4 space-y-6'>
      {/* Reading container with neobrutalism styling */}
      <div className='max-w-4xl mx-auto bg-background border-brutal border-black dark:border-white rounded-lg shadow-brutal-lg p-6 md:p-12'>
        <H3 className='border-b-4 border-brutal-cyan pb-2 mb-6'>Chapter {chapter.number}: {chapter.title}</H3>
        {(chapter.premium) ? 
        <>
        <SignedIn>
          <article className='space-y-2 prose lg:prose-xl dark:prose-invert max-w-none chapter-content' dangerouslySetInnerHTML={{__html: chapter.content}} />
        </SignedIn>
        <SignedOut>
          <RestrictedContent type={"login"}>
            <LimitedContent htmlContent={chapter.content} />
          </RestrictedContent>
        </SignedOut>
        </>
        :(
          <article className='space-y-2 prose lg:prose-xl dark:prose-invert max-w-none chapter-content' dangerouslySetInnerHTML={{__html: chapter.content}} />
        )}
      </div>

      {/* Chapter navigation with neobrutalism styling */}
      <div className='max-w-4xl mx-auto flex flex-wrap gap-3 justify-center items-center'>
        {previous ? (
          <Link href={`/novels/${novelSlug}/${previous.slug}`}>
            <Button className='bg-brutal-yellow hover:bg-brutal-yellow text-black border-brutal border-black dark:border-white shadow-brutal hover:shadow-brutal-lg hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all'>
              ← Previous
            </Button>
          </Link>
        ):(
          <Button disabled className='border-brutal border-black dark:border-white shadow-brutal opacity-50'>
            ← Previous
          </Button>
        )}
        <Link href={`/novels/${novelSlug}`}>
          <Button variant={"secondary"} className='bg-brutal-cyan hover:bg-brutal-cyan text-black border-brutal border-black dark:border-white shadow-brutal hover:shadow-brutal-lg hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all font-semibold'>
            📑 All Chapters
          </Button>
        </Link>
        {next ? (
          <Link href={`/novels/${novelSlug}/${next.slug}`}>
            <Button className='bg-brutal-yellow hover:bg-brutal-yellow text-black border-brutal border-black dark:border-white shadow-brutal hover:shadow-brutal-lg hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all'>
              Next →
            </Button>
          </Link>
        ):(
          <Button disabled className='border-brutal border-black dark:border-white shadow-brutal opacity-50'>
            Next →
          </Button>
        )}
        <ChapterNavigation previousLink={previous ? `/novels/${novelSlug}/${previous.slug}` : undefined} nextLink={next ? `/novels/${novelSlug}/${next.slug}` : undefined} />
      </div>

      <NovelSuggestions currentNovelId={chapter.novelId} count={3} />
      <JoinDiscord />
      {commentSection}
      {/* <ScrollToTop /> */}
    </div>
  )
}
