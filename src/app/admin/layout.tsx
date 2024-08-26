import H2 from '@/components/typography/h2'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

const AdminLayout = ({ children }:{ children: React.ReactNode }) => {
  return (
    <div className='flex h-screen'>
      <aside className='border m-4 p-8 rounded-lg min-w-60 flex flex-col'>
        <H2 className='text-center mb-8'>Actions</H2>
        <Button className='mb-4' variant={"outline"} asChild>
          <Link href={"/"} className='flex items-center'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            <p>
              Back to Main
            </p>
          </Link>
        </Button>
        <Button asChild><Link href={"/admin"}>Premium</Link></Button>
      </aside>
      <section className='overflow-auto w-full'>
        {children}
      </section>
    </div>
  )
}

export default AdminLayout