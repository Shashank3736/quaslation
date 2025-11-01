"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState, useRef } from "react"

interface PatternBackgroundProps {
  pattern?: "dots" | "grid" | "diagonal"
  color?: "yellow" | "pink" | "cyan" | "purple" | "orange" | "blue" | "none"
  className?: string
  children?: React.ReactNode
  lazy?: boolean // Enable lazy loading for below-the-fold patterns
}

const patternMap = {
  dots: "bg-pattern-dots",
  grid: "bg-pattern-grid",
  diagonal: "bg-pattern-diagonal",
}

const colorMap = {
  yellow: "bg-pattern-brutal-yellow",
  pink: "bg-pattern-brutal-pink",
  cyan: "bg-pattern-brutal-cyan",
  purple: "bg-pattern-brutal-purple",
  orange: "bg-pattern-brutal-orange",
  blue: "bg-pattern-brutal-blue",
  none: "",
}

export function PatternBackground({
  pattern = "dots",
  color = "none",
  className,
  children,
  lazy = false,
}: PatternBackgroundProps) {
  const [isVisible, setIsVisible] = useState(!lazy)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!lazy) return

    // Lazy load pattern using Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: "50px", // Load slightly before entering viewport
      }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [lazy, pattern, color])

  return (
    <div
      ref={elementRef}
      className={cn(
        "relative",
        colorMap[color],
        className
      )}
    >
      {isVisible && (
        <div
          className={cn(
            "absolute inset-0",
            patternMap[pattern],
            "pointer-events-none select-none",
            // GPU acceleration for better performance
            "transform-gpu will-change-auto"
          )}
          aria-hidden="true"
        />
      )}
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  )
}
