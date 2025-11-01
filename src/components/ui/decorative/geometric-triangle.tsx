"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState, useRef } from "react"

interface GeometricTriangleProps {
  size?: "sm" | "md" | "lg" | "xl"
  color?: "yellow" | "pink" | "cyan" | "purple" | "orange" | "blue"
  direction?: "up" | "down" | "left" | "right"
  className?: string
  position?: "absolute" | "relative"
  style?: React.CSSProperties
  lazy?: boolean // Enable lazy loading for below-the-fold elements
}

const sizeMap = {
  sm: { base: 30, height: 26 },
  md: { base: 50, height: 43 },
  lg: { base: 80, height: 69 },
  xl: { base: 120, height: 104 },
}

const colorMap = {
  yellow: "#FFD93D",
  pink: "#FF6B9D",
  cyan: "#6BCF7F",
  purple: "#C996FF",
  orange: "#FF8C42",
  blue: "#4D96FF",
}

export function GeometricTriangle({
  size = "md",
  color = "cyan",
  direction = "up",
  className,
  position = "absolute",
  style,
  lazy = false,
}: GeometricTriangleProps) {
  const [isVisible, setIsVisible] = useState(!lazy)
  const ref = useRef<HTMLDivElement>(null)
  const { base, height } = sizeMap[size]
  const colorValue = colorMap[color]

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

  const getBorderStyle = () => {
    switch (direction) {
      case "up":
        return {
          borderWidth: `0 ${base / 2}px ${height}px ${base / 2}px`,
          borderColor: `transparent transparent ${colorValue} transparent`,
        }
      case "down":
        return {
          borderWidth: `${height}px ${base / 2}px 0 ${base / 2}px`,
          borderColor: `${colorValue} transparent transparent transparent`,
        }
      case "right":
        return {
          borderWidth: `${base / 2}px 0 ${base / 2}px ${height}px`,
          borderColor: `transparent transparent transparent ${colorValue}`,
        }
      case "left":
        return {
          borderWidth: `${base / 2}px ${height}px ${base / 2}px 0`,
          borderColor: `transparent ${colorValue} transparent transparent`,
        }
    }
  }

  if (!isVisible) {
    return <div ref={ref} className={cn(position)} style={{ width: base, height }} />
  }

  return (
    <div
      ref={ref}
      className={cn(
        position,
        "pointer-events-none select-none",
        // GPU acceleration
        "transform-gpu will-change-auto",
        className
      )}
      style={{
        width: 0,
        height: 0,
        borderStyle: "solid",
        ...getBorderStyle(),
        ...style,
      }}
      aria-hidden="true"
    />
  )
}
