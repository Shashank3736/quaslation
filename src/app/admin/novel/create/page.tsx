import H2 from '@/components/typography/h2'
import React from 'react'
import CreateNovelForm from './create-novel-form'
import { getAllTags } from '@/lib/search/query'

const AdminNovelCreate = async () => {
  const initialTags = await getAllTags()
  return (
    <div className='mx-4'>
      <H2>Create New Novel</H2>
      <CreateNovelForm initialTags={initialTags} />
    </div>
  )
}

export default AdminNovelCreate