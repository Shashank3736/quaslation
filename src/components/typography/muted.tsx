import { cn } from '@/lib/utils'
import React from 'react'

export default function Muted({ children, className }:{ children: React.ReactNode, className?: string }) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
  )
}