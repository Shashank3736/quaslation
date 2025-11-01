import { GeometricCircle } from "./geometric-circle"
import { GeometricSquare } from "./geometric-square"
import { GeometricTriangle } from "./geometric-triangle"
import { PatternBackground } from "./pattern-background"
import { DecorativeHero } from "./decorative-hero"
import { DecorativeEmptyState } from "./decorative-empty-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * DecorativeShowcase component demonstrates all available decorative elements
 * This is useful for documentation and testing purposes
 */
export function DecorativeShowcase() {
  return (
    <div className="space-y-12 p-8">
      {/* Hero Example */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Decorative Hero</h2>
        <DecorativeHero pattern="grid">
          <div className="text-center py-12">
            <h1 className="text-4xl font-bold mb-4">Hero Section</h1>
            <p className="text-lg text-muted-foreground">
              This hero section includes geometric decorations and a grid pattern background
            </p>
          </div>
        </DecorativeHero>
      </section>

      {/* Empty State Example */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Decorative Empty State</h2>
        <DecorativeEmptyState>
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">No Items Found</h3>
            <p className="text-muted-foreground">
              This empty state includes subtle geometric decorations
            </p>
          </div>
        </DecorativeEmptyState>
      </section>

      {/* Geometric Shapes */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Geometric Shapes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Circles</CardTitle>
            </CardHeader>
            <CardContent className="relative h-40">
              <GeometricCircle size="sm" color="yellow" style={{ top: "10px", left: "10px" }} />
              <GeometricCircle size="md" color="pink" style={{ top: "20px", right: "20px" }} />
              <GeometricCircle size="lg" color="cyan" style={{ bottom: "10px", left: "50%", transform: "translateX(-50%)" }} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Squares</CardTitle>
            </CardHeader>
            <CardContent className="relative h-40">
              <GeometricSquare size="sm" color="purple" style={{ top: "10px", left: "10px" }} />
              <GeometricSquare size="md" color="orange" rotate style={{ top: "20px", right: "20px" }} />
              <GeometricSquare size="lg" color="blue" style={{ bottom: "10px", left: "50%", transform: "translateX(-50%)" }} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Triangles</CardTitle>
            </CardHeader>
            <CardContent className="relative h-40">
              <GeometricTriangle size="sm" color="yellow" direction="up" style={{ top: "10px", left: "20px" }} />
              <GeometricTriangle size="md" color="pink" direction="right" style={{ top: "50%", right: "20px", transform: "translateY(-50%)" }} />
              <GeometricTriangle size="sm" color="cyan" direction="down" style={{ bottom: "10px", left: "50%", transform: "translateX(-50%)" }} />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pattern Backgrounds */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Pattern Backgrounds</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PatternBackground pattern="dots" color="yellow" className="h-40 rounded-lg border-brutal border-black shadow-brutal">
            <div className="flex items-center justify-center h-full">
              <p className="font-bold">Dots Pattern</p>
            </div>
          </PatternBackground>

          <PatternBackground pattern="grid" color="pink" className="h-40 rounded-lg border-brutal border-black shadow-brutal">
            <div className="flex items-center justify-center h-full">
              <p className="font-bold">Grid Pattern</p>
            </div>
          </PatternBackground>

          <PatternBackground pattern="diagonal" color="cyan" className="h-40 rounded-lg border-brutal border-black shadow-brutal">
            <div className="flex items-center justify-center h-full">
              <p className="font-bold">Diagonal Pattern</p>
            </div>
          </PatternBackground>
        </div>
      </section>

      {/* Color Variants */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Color Variants</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {["yellow", "pink", "cyan", "purple", "orange", "blue"].map((color) => (
            <div key={color} className="text-center">
              <div className="relative h-24 mb-2">
                <GeometricCircle
                  size="md"
                  color={color as any}
                  position="relative"
                  className="mx-auto"
                />
              </div>
              <p className="text-sm font-medium capitalize">{color}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Custom Layout Example */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Custom Layout</h2>
        <PatternBackground pattern="dots" color="purple" className="relative rounded-lg border-brutal border-black shadow-brutal-lg p-8 min-h-[300px]">
          <GeometricCircle size="xl" color="yellow" style={{ top: "-60px", right: "-60px" }} />
          <GeometricSquare size="lg" color="pink" rotate style={{ bottom: "-40px", left: "-40px" }} />
          <GeometricTriangle size="lg" color="cyan" direction="right" style={{ top: "50%", left: "20px", transform: "translateY(-50%)" }} />
          
          <div className="relative z-10 text-center">
            <h3 className="text-3xl font-bold mb-4">Custom Decorated Section</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              You can combine geometric shapes, pattern backgrounds, and custom positioning
              to create unique decorative layouts for your content.
            </p>
          </div>
        </PatternBackground>
      </section>
    </div>
  )
}
