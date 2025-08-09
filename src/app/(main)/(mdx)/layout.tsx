import React from 'react'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <article className='prose dark:prose-invert lg:prose-lg py-10 max-w-none p-4 glass rounded-xl border border-white/15 bg-background/70 backdrop-blur-md'>
      {children}
    </article>
  )
}