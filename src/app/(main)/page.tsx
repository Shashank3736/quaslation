import { Button } from '@/components/ui/button'
import { MoveRightIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const MainPage = () => {
  return (
    <main className="flex-1">
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Welcome to Quaslation
              </h1>
              <p className="mx-auto max-w-[700px] md:text-xl">
                Discover the best fan translations of Asian web novels. Immerse yourself in captivating stories from
                across Asia.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Latest Releases</h2>
              <p className="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Stay up to date with our most recent translations. New chapters added regularly!
              </p>
            </div>
            <Button asChild><Link href={"/home"}>View Latest Releases <MoveRightIcon className='w-4 h-4 ml-2' /></Link></Button>
          </div>
        </div>
      </section>
    </main>
  )
}

export default MainPage