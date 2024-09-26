import H2 from '@/components/typography/h2'
import React from 'react'
import CreateNovelForm from './create-novel-form'

const AdminNovelCreate = () => {
  return (
    <div className='mx-4'>
      <H2>Create New Novel</H2>
      <CreateNovelForm />
    </div>
  )
}

export default AdminNovelCreate