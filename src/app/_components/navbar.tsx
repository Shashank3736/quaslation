import { ModeToggle } from '@/components/system/dark-mode-button'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

export default function Navbar() {
  return (
    <div className='flex justify-between p-4'>
      <div className='flex'>
        <p className='ml-2 text-2xl font-semibold'>Quaslation</p>
      </div>
      <div className='flex space-x-2'>
        <Button variant={"outline"} asChild><Link href={"/"}>Home</Link></Button>
        <Button variant={"outline"} asChild><Link href={"/blogs/"}>Blogs</Link></Button>
        <Button variant={"outline"} asChild><Link href={"/novels/"}>Novels</Link></Button>
        <ModeToggle />
      </div>
    </div>
  )
}
