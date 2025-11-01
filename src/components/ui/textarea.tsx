import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border-brutal-mobile md:border-brutal border-black dark:border-white bg-background px-2 py-2 md:px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:shadow-brutal-mobile focus-visible:dark:shadow-brutal-mobile-dark md:focus-visible:shadow-brutal md:focus-visible:dark:shadow-brutal-dark focus-visible:border-brutal-blue disabled:cursor-not-allowed disabled:opacity-50 transition-shadow",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
