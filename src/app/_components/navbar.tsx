'use client'

import { ModeToggle } from '@/components/system/dark-mode-button'
import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

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
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className={cn(
      'flex justify-between items-center sticky top-0 z-50 bg-background border-b-brutal-lg border-black dark:border-white transition-shadow duration-300',
      scrolled && 'shadow-brutal-lg'
    )}>
      {/* Logo/Brand Area with brutal-yellow background */}
      <div className='flex items-center px-4 py-3'>
        <Image alt='logo' src={"/icon.jpg"} width={256} height={256} className='rounded-full w-10 h-10 border-brutal border-black hidden md:block' />
        <Sheet>
          <SheetTrigger className='md:hidden p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
            </svg>
          </SheetTrigger>
          <SheetContent 
            className='flex flex-col bg-background border-r-brutal border-black dark:border-white shadow-brutal-lg' 
            side={"left"}
          >
            <SheetHeader>
              <SheetTitle className='text-center font-bold text-xl uppercase'>
                Index
              </SheetTitle>
              <Separator className='bg-black dark:bg-white h-[3px]' />
              {navLinks.map((data) => (
                <SheetClose key={data.title} asChild>
                  <Button 
                    variant={"outline"} 
                    className='hover:bg-brutal-cyan hover:text-black hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal transition-all' 
                    asChild
                  >
                    <Link href={data.href}>{data.title}</Link>
                  </Button>
                </SheetClose>
              ))}
              <SheetClose key={"dark-mode"} asChild className='flex justify-center' data-inside-interaction="true">
                <ModeToggle showTheme />
              </SheetClose>
            </SheetHeader>
          </SheetContent>
        </Sheet>
        <Link href={"/"} className='ml-3 text-xl md:text-2xl font-bold tracking-tight hover:scale-105 transition-transform'>
          Quaslation
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className='hidden md:flex space-x-2 justify-center items-center px-4'>
        {navLinks.map((data) => (
          <Button 
            key={data.title} 
            variant={"outline"} 
            className='hover:bg-brutal-cyan hover:text-black hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal transition-all font-semibold' 
            asChild
          >
            <Link href={data.href}>{data.title}</Link>
          </Button>
        ))}
        <ModeToggle />
      </div>

      {/* Auth Section */}
      <div className='flex space-x-2 justify-center items-center px-4 py-3'>
        <SignedIn>
          <UserButton userProfileMode='navigation' userProfileUrl='/user-profile' />
        </SignedIn>
        <SignedOut>
          <SignInButton>
            <Button className='hover:cursor-pointer font-semibold' asChild>
              <span>Sign In</span>
            </Button>
          </SignInButton>
        </SignedOut>
      </div>
    </div>
  )
}
