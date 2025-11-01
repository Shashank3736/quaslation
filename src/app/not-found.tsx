/**
 * v0 by Vercel.
 * @see https://v0.dev/t/bI1OUCK0WTS
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-brutal-yellow/10 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative geometric shapes */}
      <div className="absolute top-10 left-10 w-20 h-20 border-brutal border-black dark:border-white bg-brutal-pink rotate-45 opacity-50" />
      <div className="absolute bottom-20 right-20 w-32 h-32 border-brutal border-black dark:border-white bg-brutal-cyan rounded-full opacity-40" />
      <div className="absolute top-1/3 right-10 w-16 h-16 border-brutal border-black dark:border-white bg-brutal-purple opacity-30" />
      
      <div className="mx-auto max-w-md text-center relative z-10 bg-background border-brutal border-black dark:border-white shadow-brutal-xl p-8 rounded-lg">
        <div className="mx-auto h-32 w-32 text-brutal-orange mb-6 relative">
          <div className="absolute inset-0 border-brutal border-black dark:border-white bg-brutal-orange/20 rounded-lg transform rotate-6" />
          <PuzzleIcon className="h-full w-full relative z-10" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl mb-4 uppercase">
          404
        </h1>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Oops, page not found!
        </h2>
        <p className="text-base text-foreground/80 mb-8">
          The page you&apos;re looking for doesn&apos;t exist. Let&apos;s get you back on track.
        </p>
        <Link href="/" prefetch={false}>
          <Button 
            size="lg"
            className="w-full sm:w-auto font-bold uppercase"
          >
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}

function PuzzleIcon(props: { className: string }) {
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
      <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z" />
    </svg>
  )
}