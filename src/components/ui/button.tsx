import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-bold border-brutal-mobile border md:border-brutal border-black dark:border-white transition-all focus-visible:outline-none focus-visible:ring-brutal focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white disabled:pointer-events-none disabled:opacity-50 brutal-touch-target",
  {
    variants: {
      variant: {
        default: "bg-brutal-yellow text-black shadow-brutal-mobile dark:shadow-brutal-mobile-dark md:shadow-brutal md:dark:shadow-brutal-dark hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-sm hover:dark:shadow-brutal-sm-dark md:hover:shadow-brutal-lg md:hover:dark:shadow-brutal-lg-dark active:translate-x-0 active:translate-y-0 active:shadow-brutal-mobile active:dark:shadow-brutal-mobile-dark",
        primary: "bg-brutal-pink text-white shadow-brutal-mobile-pink md:shadow-brutal-pink hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#FF6B9D] md:hover:shadow-[6px_6px_0px_0px_#FF6B9D] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_0px_#FF6B9D]",
        secondary: "bg-brutal-cyan text-black shadow-brutal-mobile-cyan md:shadow-brutal-cyan hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#6BCF7F] md:hover:shadow-[6px_6px_0px_0px_#6BCF7F] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_0px_#6BCF7F]",
        destructive: "bg-red-500 text-white shadow-brutal-mobile dark:shadow-brutal-mobile-dark md:shadow-brutal md:dark:shadow-brutal-dark hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-sm hover:dark:shadow-brutal-sm-dark md:hover:shadow-brutal-lg md:hover:dark:shadow-brutal-lg-dark active:translate-x-0 active:translate-y-0 active:shadow-brutal-mobile active:dark:shadow-brutal-mobile-dark",
        outline: "border-brutal-mobile md:border-brutal border-black dark:border-white bg-transparent text-foreground shadow-brutal-mobile dark:shadow-brutal-mobile-dark md:shadow-brutal md:dark:shadow-brutal-dark hover:bg-brutal-yellow hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-sm hover:dark:shadow-brutal-sm-dark md:hover:shadow-brutal-lg md:hover:dark:shadow-brutal-lg-dark active:translate-x-0 active:translate-y-0 active:shadow-brutal-mobile active:dark:shadow-brutal-mobile-dark",
        ghost: "border-0 shadow-none hover:bg-brutal-yellow hover:shadow-brutal-mobile hover:dark:shadow-brutal-mobile-dark md:hover:shadow-brutal-sm md:hover:dark:shadow-brutal-sm-dark",
        link: "border-0 shadow-none text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-3 py-2 md:px-4",
        sm: "h-9 rounded-md px-2 md:px-3",
        lg: "h-11 rounded-md px-6 md:px-8",
        icon: "h-10 w-10 min-w-[44px] min-h-[44px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
