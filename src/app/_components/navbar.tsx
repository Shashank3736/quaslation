import { ModeToggle } from '@/components/system/dark-mode-button'
import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { OrganizationSwitcher, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Separator } from '@/components/ui/separator'

export default function Navbar() {
  return (
    <div className='flex justify-between p-4'>
      <div className='flex justify-center items-center'>
        <Image alt='logo' src={"/logo/logo100x100.jpg"} width={100} height={100} className='rounded-full w-12 h-12 hidden md:block' />
        <Sheet>
          <SheetTrigger className='md:hidden'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
            </svg>
          </SheetTrigger>
          <SheetContent className='flex flex-col' side={"left"}>
            <SheetHeader>
              <SheetTitle className='text-center'>
                Index
              </SheetTitle>
              <Separator />
              <SheetClose asChild>
                <Button variant={"outline"} asChild><Link href={"/"}>Home</Link></Button>
              </SheetClose>
              <SheetClose asChild>
                <Button variant={"outline"} asChild><Link href={"/blogs/"}>Blogs</Link></Button>
              </SheetClose>
              <SheetClose asChild>
                <Button variant={"outline"} asChild><Link href={"/novels/"}>Novels</Link></Button>
              </SheetClose>
              <SheetClose className='flex justify-center'>
                <ModeToggle showTheme />
              </SheetClose>
            </SheetHeader>
          </SheetContent>
        </Sheet>
        <p className='ml-4 text-2xl font-semibold'>Quaslation</p>
      </div>
      <div className='hidden md:flex space-x-2 justify-center items-center'>
        <Button variant={"outline"} asChild><Link href={"/"}>Home</Link></Button>
        <Button variant={"outline"} asChild><Link href={"/blogs/"}>Blogs</Link></Button>
        <Button variant={"outline"} asChild><Link href={"/novels/"}>Novels</Link></Button>
        <ModeToggle />
      </div>
      <div className='flex space-x-2 justify-center items-center'>
        <SignedIn>
          <OrganizationSwitcher organizationProfileMode='navigation' organizationProfileUrl='/organization-profile' />
          <UserButton userProfileMode='navigation' userProfileUrl='/user-profile' />
        </SignedIn>
        <SignedOut>
          <SignInButton><Button>Sign In</Button></SignInButton>
        </SignedOut>
      </div>
    </div>
  )
}
