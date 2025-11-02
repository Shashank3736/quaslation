import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border-brutal-mobile md:border-2 border-black px-2 py-0.5 md:px-2.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-brutal-mobile md:shadow-brutal-sm dark:border-white min-h-[28px]",
  {
    variants: {
      variant: {
        default:
          "bg-brutal-yellow text-black hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_0px_#000] md:hover:shadow-[3px_3px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#fff] md:dark:hover:shadow-[3px_3px_0px_0px_#fff]",
        secondary:
          "bg-brutal-cyan text-black hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_0px_#000] md:hover:shadow-[3px_3px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#fff] md:dark:hover:shadow-[3px_3px_0px_0px_#fff]",
        destructive:
          "bg-red-500 text-white hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_0px_#000] md:hover:shadow-[3px_3px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#fff] md:dark:hover:shadow-[3px_3px_0px_0px_#fff]",
        outline: "bg-transparent text-foreground hover:bg-brutal-yellow hover:text-black",
        pink: "bg-brutal-pink text-white hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_0px_#000] md:hover:shadow-[3px_3px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#fff] md:dark:hover:shadow-[3px_3px_0px_0px_#fff]",
        purple: "bg-brutal-purple text-black hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_0px_#000] md:hover:shadow-[3px_3px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#fff] md:dark:hover:shadow-[3px_3px_0px_0px_#fff]",
        orange: "bg-brutal-orange text-black hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_0px_#000] md:hover:shadow-[3px_3px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#fff] md:dark:hover:shadow-[3px_3px_0px_0px_#fff]",
        blue: "bg-brutal-blue text-white hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_0px_#000] md:hover:shadow-[3px_3px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#fff] md:dark:hover:shadow-[3px_3px_0px_0px_#fff]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
