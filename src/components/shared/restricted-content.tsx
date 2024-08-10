/**
 * v0 by Vercel.
 * @see https://v0.dev/t/SssAURYGzoD
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { SignInButton } from "@clerk/nextjs"
import { Button } from "../ui/button"
import { ReactNode } from "react"

export default function RestrictedContent({ children }: { children: ReactNode }) {
  return (
    <div className="flex relative flex-col bg-background">
      <div className="mx-auto absolute text-center backdrop-blur-sm h-full w-full">
        <div className="inline-block rounded-lg mt-48 bg-muted px-3 py-1 text-sm">Restricted Content</div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Access Restricted</h1>
        <p className="mt-4 text-muted-foreground">This content is restricted. Please log in to access it.</p>
        <div className="mt-6">
          <SignInButton>
            <Button>
              <LogInIcon className="mr-2 h-4 w-4" />
              Login
            </Button>
          </SignInButton>
        </div>
      </div>
      <div className="px-3 overflow-auto max-h-[700px]">
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