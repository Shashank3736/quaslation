import { notFound } from 'next/navigation';
import React from 'react'
import { getNovel } from './server';
import H1 from '@/components/typography/h1';
import EditNovelForm from './edit-novel-form';
import { markdownToHtml } from '@/lib/utils';

const AdminNovelEdit = async ({ params }: { params: { id: string }}) => {
  const id = parseInt(params.id);
  if(isNaN(id)) notFound();
  try {
    const novel = await getNovel(id);
  
    return (
      <div className='mx-4'>
        <H1>Edit Novel ({novel.title})</H1>
        <EditNovelForm data={novel} html={await markdownToHtml(novel.richText.markdown)} />
      </div>
    )
  } catch (error) {
    notFound()    
  }
}

export default AdminNovelEdit