import { ModeToggle } from '@/components/system/dark-mode-button'
import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import React from 'react'

export default function Navbar() {
  return (
    <div className='flex justify-between p-4'>
      <div className='flex'>
        <p className='ml-2 text-2xl font-semibold'>Quaslation</p>
      </div>
      <div className='hidden md:flex space-x-2'>
        <Button variant={"outline"} asChild><Link href={"/"}>Home</Link></Button>
        <Button variant={"outline"} asChild><Link href={"/blogs/"}>Blogs</Link></Button>
        <Button variant={"outline"} asChild><Link href={"/novels/"}>Novels</Link></Button>
        <ModeToggle />
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton><Button>Sign In</Button></SignInButton>
        </SignedOut>
      </div>
      <Sheet>
        <SheetTrigger className='md:hidden'>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
          </svg>
        </SheetTrigger>
        <SheetContent className='flex flex-col'>
          <SheetClose asChild>
            <Button variant={"outline"} asChild><Link href={"/"}>Home</Link></Button>
          </SheetClose>
          <SheetClose asChild>
            <Button variant={"outline"} asChild><Link href={"/blogs/"}>Blogs</Link></Button>
          </SheetClose>
          <SheetClose asChild>
            <Button variant={"outline"} asChild><Link href={"/novels/"}>Novels</Link></Button>
          </SheetClose>
          <SheetClose asChild>
            <div className='self-center'>
              <ModeToggle />
            </div>
          </SheetClose>
        </SheetContent>
      </Sheet>
    </div>
  )
}
