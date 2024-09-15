import React from 'react'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <article className='prose dark:prose-invert lg:prose-lg py-10 max-w-none'>
      {children}
    </article>
  )
}