import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border-brutal-mobile md:border-brutal border-black dark:border-white bg-background px-2 py-2 md:px-3 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:shadow-brutal-mobile focus-visible:dark:shadow-brutal-mobile-dark md:focus-visible:shadow-brutal md:focus-visible:dark:shadow-brutal-dark focus-visible:border-brutal-blue disabled:cursor-not-allowed disabled:opacity-50 transition-shadow min-h-[44px]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
