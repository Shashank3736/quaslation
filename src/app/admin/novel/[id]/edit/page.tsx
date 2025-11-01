import { notFound } from 'next/navigation';
import React from 'react'
import { getNovel } from './server';
import H1 from '@/components/typography/h1';
import EditNovelForm from './edit-novel-form';
import { markdownToHtml } from '@/lib/utils';

const AdminNovelEdit = async ({ params }: { params: Promise<{ id: string }>}) => {
  const paramsResolved = await params;
  const id = parseInt(paramsResolved.id);

  if(isNaN(id)) notFound();
  
  const novel = await getNovel(id).catch(() => {
    notFound();
  });

  if (!novel) notFound();

  return (
    <div className='mx-4'>
      <H1>Edit Novel ({novel.title})</H1>
      <EditNovelForm data={novel} html={await markdownToHtml(novel.richText.markdown)} />
    </div>
  );
}

export default AdminNovelEdit