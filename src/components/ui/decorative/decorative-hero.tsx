import { GeometricCircle } from "./geometric-circle"
import { GeometricSquare } from "./geometric-square"
import { GeometricTriangle } from "./geometric-triangle"
import { PatternBackground } from "./pattern-background"
import { cn } from "@/lib/utils"

interface DecorativeHeroProps {
  children: React.ReactNode
  pattern?: "dots" | "grid" | "diagonal"
  className?: string
}

/**
 * DecorativeHero component adds neobrutalism geometric decorations to hero sections
 * Includes circles, squares, triangles positioned around the content
 */
export function DecorativeHero({
  children,
  pattern = "dots",
  className,
}: DecorativeHeroProps) {
  return (
    <PatternBackground pattern={pattern} color="yellow" className={cn("relative overflow-hidden", className)}>
      {/* Top left circle */}
      <GeometricCircle
        size="lg"
        color="pink"
        style={{ top: "-40px", left: "-40px", zIndex: 0 }}
      />
      
      {/* Top right square */}
      <GeometricSquare
        size="md"
        color="cyan"
        rotate
        style={{ top: "20px", right: "40px", zIndex: 0 }}
      />
      
      {/* Bottom left triangle */}
      <GeometricTriangle
        size="lg"
        color="purple"
        direction="right"
        style={{ bottom: "40px", left: "60px", zIndex: 0 }}
      />
      
      {/* Bottom right circle */}
      <GeometricCircle
        size="md"
        color="orange"
        style={{ bottom: "-20px", right: "100px", zIndex: 0 }}
      />
      
      {/* Middle left small square */}
      <GeometricSquare
        size="sm"
        color="blue"
        style={{ top: "50%", left: "20px", transform: "translateY(-50%)", zIndex: 0 }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </PatternBackground>
  )
}
