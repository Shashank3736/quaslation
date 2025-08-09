"use server"
import H2 from '@/components/typography/h2'
import { getLatestChapter } from '@/lib/db/query'
import { notFound } from 'next/navigation'
import React from 'react'
import { CreateChapterForm } from './create-chapter-form'

const CreateChapter = async({ params }:{ params: Promise<{ novelId: string }>}) => {
  const paramsResolved = await params;
  const novelId = parseInt(paramsResolved.novelId);
  if(isNaN(novelId)) notFound()
  const previousChapter = await getLatestChapter(novelId);
  return (
    <div className='m-4'>
      <H2>Create Chapter ({previousChapter?.novel})</H2>
      <CreateChapterForm previousChapter={previousChapter} novelId={novelId} />
    </div>
  )
}

export default CreateChapter