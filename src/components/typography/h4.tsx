import { cn } from '@/lib/utils'
import React from 'react'

export default function H4({ children, className }:{ children: React.ReactNode, className?: string }) {
  return (
    <h4 className={cn("scroll-m-20 text-xl font-semibold tracking-tight", className)}>{children}</h4>
  )
}