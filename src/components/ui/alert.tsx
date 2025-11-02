import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border-brutal border-black dark:border-white p-4 shadow-brutal-sm dark:shadow-brutal-sm-dark [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",
  {
    variants: {
      variant: {
        default: "bg-brutal-cyan/20 text-foreground border-brutal-cyan [&>svg]:text-brutal-cyan",
        destructive:
          "bg-red-500/20 text-red-900 border-red-500 [&>svg]:text-red-600 dark:text-red-100",
        warning:
          "bg-brutal-orange/20 text-orange-900 border-brutal-orange [&>svg]:text-brutal-orange dark:text-orange-100",
        info:
          "bg-brutal-blue/20 text-blue-900 border-brutal-blue [&>svg]:text-brutal-blue dark:text-blue-100",
        success:
          "bg-brutal-cyan/20 text-green-900 border-brutal-cyan [&>svg]:text-brutal-cyan dark:text-green-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
