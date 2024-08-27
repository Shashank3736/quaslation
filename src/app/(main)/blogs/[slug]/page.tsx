import H1 from '@/components/typography/h1';
import Muted from '@/components/typography/muted';
import { Separator } from '@/components/ui/separator';
import { getBlog } from '@/lib/hygraph/query'
import { formatDate } from '@/lib/utils';
import React from 'react'

export default async function Blog({ params }: { params: { slug: string }}) {
  const blog = await getBlog(params.slug);
  return (
    <div className='p-4 flex flex-col'>
      <H1>{blog.title}</H1>
      <Separator className='my-4' />
      <div className='prose dark:prose-invert lg:prose-lg max-w-none' dangerouslySetInnerHTML={{__html: blog.content.html}} />
      <Muted className="mt-4 self-end">{formatDate(new Date(blog.publishedAt))}</Muted>
    </div>
  )
}
