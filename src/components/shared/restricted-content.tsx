/**
 * v0 by Vercel.
 * @see https://v0.dev/t/SssAURYGzoD
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { SignInButton } from "@clerk/nextjs"
import { Button } from "../ui/button"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { DISCORD_INVITE_URL } from "@/lib/config"
import Link from "next/link"

const MESSAGE = {
  login: {
    title: "Login Required",
    message: "This content is restricted. Please log in to access it."
  },
  premium: { 
    title: "Premium Content",
    message: "We apologize, but this content is exclusive to our premium subscribers. However, we're pleased to inform you that it will be made available to all users free of charge in the near future. Thank you for your patience and continued interest in the novel."
  },
  upcoming: {
    title: "Coming Soon",
    message: "This chapter will be available soon. Keep Reading!"
  }
}

export default function RestrictedContent({ children, type="login" }: { children: ReactNode, type?: "login" | "premium" | "upcoming" }) {
  return (
    <div className="flex relative flex-col bg-background">
      <div className="mx-auto absolute text-center backdrop-blur-sm h-full w-full flex flex-col items-center justify-center z-10">
        {/* Premium lock indicator with neobrutalism styling */}
        <div className="bg-brutal-pink border-brutal border-black dark:border-white rounded-lg shadow-brutal-lg px-4 py-2 text-sm font-bold text-white">
          Restricted Content
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{MESSAGE[type].title}</h1>
        <p className="mt-4 text-muted-foreground max-w-md">{MESSAGE[type].message}</p>
        <div className={cn("mt-6")}>
        {type === "login"?(
          <SignInButton>
            <Button className="shadow-brutal border-brutal border-black dark:border-white">
              <LogInIcon className="mr-2 h-4 w-4 drop-shadow-[2px_2px_0px_rgba(0,0,0,0.3)]" />
              Login
            </Button>
          </SignInButton>
        ): (
          <Button asChild className="shadow-brutal border-brutal border-black dark:border-white">
            <Link href={DISCORD_INVITE_URL}>Join Discord</Link>
          </Button>
        )}
        </div>
      </div>
      <div className="px-3 overflow-hidden max-h-[700px]">
        {children}
      </div>
    </div>
  )
}

function LogInIcon(props: { className: string }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" x2="3" y1="12" y2="12" />
    </svg>
  )
}