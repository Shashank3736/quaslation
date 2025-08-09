import { ModeToggle } from '@/components/system/dark-mode-button'
import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Separator } from '@/components/ui/separator'

const navLinks = [
  {
    title: "Home",
    href: "/home"
  },{
    title: "Novels",
    href: "/novels"
  }, {
    title: "Contact Us",
    href: "/contact"
  }
]

export default function Navbar() {
  return (
    <div className='flex justify-between p-4 sticky top-0 z-50 glass border-b border-white/15 ring-1 ring-white/10'>
      <div className='flex justify-center items-center'>
        <Image alt='logo' src={"/icon.jpg"} width={256} height={256} className='rounded-full w-12 h-12 hidden md:block' />
        <Sheet>
          <SheetTrigger className='md:hidden'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
            </svg>
          </SheetTrigger>
          <SheetContent className='flex flex-col glass border-r border-white/15' side={"left"}>
            <SheetHeader>
              <SheetTitle className='text-center'>
                Index
              </SheetTitle>
              <Separator />
              {navLinks.map((data) => (
                <SheetClose key={data.title} asChild>
                  <Button variant={"outline"} asChild><Link href={data.href}>{data.title}</Link></Button>
                </SheetClose>
              ))}
              <SheetClose key={"dark-mode"} asChild className='flex justify-center' data-inside-interaction="true">
                <ModeToggle showTheme />
              </SheetClose>
            </SheetHeader>
          </SheetContent>
        </Sheet>
        <Link href={"/"} className='ml-4 text-2xl font-semibold'>Quaslation</Link>
      </div>
      <div className='hidden md:flex space-x-2 justify-center items-center'>
        {navLinks.map((data) => (
          <Button key={data.title} variant={"outline"} asChild><Link href={data.href}>{data.title}</Link></Button>
        ))}
        <ModeToggle />
      </div>
      <div className='flex space-x-2 justify-center items-center'>
        <SignedIn>
          <UserButton userProfileMode='navigation' userProfileUrl='/user-profile' />
        </SignedIn>
        <SignedOut>
          <SignInButton>
            <Button asChild>
              <span>Sign In</span>
            </Button>
          </SignInButton>
        </SignedOut>
      </div>
    </div>
  )
}
