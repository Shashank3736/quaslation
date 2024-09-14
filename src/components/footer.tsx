'use client'

import { DISCORD_INVITE_URL } from "@/lib/config"
import Link from "next/link"

export function FooterComponent() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-lg font-bold">Quaslation</span>
          </Link>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Quaslation. All rights reserved.
          </p>
        </div>
        <nav className="flex gap-4 sm:gap-6">
          <Link
            href={DISCORD_INVITE_URL}
            className="text-sm font-medium hover:underline underline-offset-4 flex items-center"
          >
            <span>Discord</span>
          </Link>
          <Link
            href="/blogs/who-are-we"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            About Us
          </Link>
          <Link
            href="/blogs/privacy-policy"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Privacy Policy
          </Link>
          <Link
            href="/blogs/terms-of-service"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Terms of Service
          </Link>
        </nav>
      </div>
    </footer>
  )
}