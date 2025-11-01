"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState, useRef } from "react"

interface GeometricCircleProps {
  size?: "sm" | "md" | "lg" | "xl"
  color?: "yellow" | "pink" | "cyan" | "purple" | "orange" | "blue"
  className?: string
  position?: "absolute" | "relative"
  style?: React.CSSProperties
  lazy?: boolean // Enable lazy loading for below-the-fold elements
}

const sizeMap = {
  sm: "w-12 h-12",
  md: "w-20 h-20",
  lg: "w-32 h-32",
  xl: "w-48 h-48",
}

const colorMap = {
  yellow: "bg-brutal-yellow",
  pink: "bg-brutal-pink",
  cyan: "bg-brutal-cyan",
  purple: "bg-brutal-purple",
  orange: "bg-brutal-orange",
  blue: "bg-brutal-blue",
}

export function GeometricCircle({
  size = "md",
  color = "yellow",
  className,
  position = "absolute",
  style,
  lazy = false,
}: GeometricCircleProps) {
  const [isVisible, setIsVisible] = useState(!lazy)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!lazy || !ref.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.disconnect()
          }
        })
      },
      { rootMargin: "100px" }
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [lazy])

  if (!isVisible) {
    return <div ref={ref} className={cn(sizeMap[size], position)} />
  }

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-full border-brutal border-black dark:border-white",
        sizeMap[size],
        colorMap[color],
        position,
        "pointer-events-none select-none",
        // GPU acceleration
        "transform-gpu will-change-auto",
        className
      )}
      style={style}
      aria-hidden="true"
    />
  )
}
