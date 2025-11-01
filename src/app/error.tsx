"use client";

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ExternalLink, Home, AlertTriangle } from "lucide-react"
import { DISCORD_INVITE_URL } from "@/lib/config"

export default function Component() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brutal-orange/10 text-foreground p-4 relative overflow-hidden">
      {/* Decorative geometric shapes */}
      <div className="absolute top-20 left-20 w-24 h-24 border-brutal border-black dark:border-white bg-brutal-yellow opacity-40" />
      <div className="absolute bottom-10 right-10 w-40 h-40 border-brutal border-black dark:border-white bg-brutal-pink rounded-full opacity-30" />
      <div className="absolute top-1/2 left-10 w-20 h-20 border-brutal border-black dark:border-white bg-brutal-cyan transform rotate-45 opacity-50" />
      
      <div className="max-w-md w-full space-y-8 relative z-10 bg-background border-brutal border-black dark:border-white shadow-brutal-xl p-8 rounded-lg">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 text-brutal-orange mb-6 relative inline-block">
            <div className="absolute inset-0 border-brutal border-black dark:border-white bg-brutal-orange/20 rounded-full transform -rotate-6" />
            <div className="relative z-10 flex items-center justify-center h-full">
              <AlertTriangle className="h-16 w-16" strokeWidth={3} />
            </div>
          </div>
          <h2 className="text-3xl font-black uppercase mb-4 text-foreground">
            Oops! Something went wrong
          </h2>
          <p className="text-base text-foreground/80 mb-6">
            {`We're sorry, but it seems like we've encountered an error.`}
          </p>
        </div>
        <div className="space-y-6">
          <p className="text-center text-sm text-foreground/70 border-l-brutal border-brutal-orange bg-brutal-orange/10 p-4 rounded">
            Please help us improve by reporting this issue on our Discord server, or return to the home page.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">
              <Button className="w-full font-bold" variant="default">
                <ExternalLink className="mr-2 h-4 w-4" />
                Join Discord
              </Button>
            </Link>
            <Link href="/home">
              <Button className="w-full font-bold" variant="outline">
                <Home className="mr-2 h-4 w-4" />
                Go to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}