import { GeometricCircle } from "./geometric-circle"
import { GeometricSquare } from "./geometric-square"
import { GeometricTriangle } from "./geometric-triangle"
import { cn } from "@/lib/utils"

interface DecorativeEmptyStateProps {
  children: React.ReactNode
  className?: string
}

/**
 * DecorativeEmptyState component adds playful geometric decorations to empty states
 * Uses smaller, more subtle decorations than hero sections
 */
export function DecorativeEmptyState({
  children,
  className,
}: DecorativeEmptyStateProps) {
  return (
    <div className={cn("relative py-12 px-4", className)}>
      {/* Top circle */}
      <GeometricCircle
        size="sm"
        color="cyan"
        style={{ top: "10px", left: "50%", transform: "translateX(-50%)", zIndex: 0 }}
      />
      
      {/* Left triangle */}
      <GeometricTriangle
        size="sm"
        color="yellow"
        direction="right"
        style={{ top: "50%", left: "20px", transform: "translateY(-50%)", zIndex: 0 }}
      />
      
      {/* Right square */}
      <GeometricSquare
        size="sm"
        color="pink"
        rotate
        style={{ top: "50%", right: "20px", transform: "translateY(-50%)", zIndex: 0 }}
      />
      
      {/* Bottom triangle */}
      <GeometricTriangle
        size="sm"
        color="purple"
        direction="down"
        style={{ bottom: "10px", left: "50%", transform: "translateX(-50%)", zIndex: 0 }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
