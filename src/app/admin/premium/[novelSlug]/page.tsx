import H1 from '@/components/typography/h1'
import { getPremiumChaptersByNovel } from '@/lib/hygraph/query'
import React from 'react'
import { ChapterBox } from './chapter-box'

const NovelSlug = async ({ params }: { params: { novelSlug: string }}) => {
  const chapters = await getPremiumChaptersByNovel({ novelSlug: params.novelSlug })
  return (
    <div className='m-4 p-4'>
      <H1 className='text-center mb-4'>Chapters!</H1>
      {chapters.map(chapter => (
        <ChapterBox key={chapter.slug} chapter={chapter} novelSlug={params.novelSlug} />
      ))}
      {chapters.length === 0 ? (
        <p>All chapters are free.</p>
      ):null}
    </div>
  )
}

export default NovelSlug