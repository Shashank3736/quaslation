import * as React from "react"
import { Badge } from "./badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: "published" | "draft" | "premium" | "free"
}

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const variantMap = {
    published: "secondary", // brutal-cyan
    draft: "default", // brutal-yellow
    premium: "pink", // brutal-pink
    free: "outline", // transparent with border
  } as const

  const labelMap = {
    published: "Published",
    draft: "Draft",
    premium: "Premium",
    free: "Free",
  }

  return (
    <Badge
      variant={variantMap[status]}
      className={cn("uppercase text-xs font-bold", className)}
      {...props}
    >
      {labelMap[status]}
    </Badge>
  )
}
