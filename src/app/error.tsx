"use client";

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ExternalLink, Home } from "lucide-react"
import { DISCORD_INVITE_URL } from "@/lib/config"

export default function Component() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <svg
            className="mx-auto h-24 w-24 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="mt-6 text-3xl font-extrabold">Oops! Something went wrong</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {`We're sorry, but it seems like we've encountered an error.`}
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Please help us improve by reporting this issue on our Discord server, or return to the home page.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">
              <Button className="w-full" variant="default">
                <ExternalLink className="mr-2 h-4 w-4" />
                Join Discord
              </Button>
            </Link>
            <Link href="/home">
              <Button className="w-full" variant="outline">
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