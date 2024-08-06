import H2 from '@/components/typography/h2'
import H3 from '@/components/typography/h3'
import Muted from '@/components/typography/muted'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { getBlogs } from '@/lib/actions'
import { timeAgo } from '@/lib/utils'
import Link from 'next/link'
import React from 'react'

export default async function BlogList() {
  const blogs = await getBlogs({})
  return (
    <div className='p-4'>
      <H2>Blogs & Updates</H2>
      <Separator />
      <div className=''>
        {blogs.map(blog => (
          <div key={blog.slug} className='flex flex-col p-8 mt-4 border rounded-lg'>
            <H3 className='mb-2'>{blog.title}</H3>
            <p>{blog.description}</p>
            <div className='flex justify-between mt-4'>
              <Button>
                <Link href={`/blogs/${blog.slug}`}>Read Blog</Link>
              </Button>
              <Muted className='mt-4'>{timeAgo(blog.publishedAt)}</Muted>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
