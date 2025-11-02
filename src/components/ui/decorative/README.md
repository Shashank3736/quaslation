# Neobrutalism Decorative Components

This directory contains decorative geometric components and pattern utilities for the neobrutalism design system.

## Components

### GeometricCircle

A circular decorative element with thick borders and vibrant colors.

```tsx
import { GeometricCircle } from "@/components/ui/decorative"

<GeometricCircle
  size="lg"
  color="pink"
  position="absolute"
  style={{ top: "20px", left: "40px" }}
/>
```

**Props:**
- `size`: "sm" | "md" | "lg" | "xl" (default: "md")
- `color`: "yellow" | "pink" | "cyan" | "purple" | "orange" | "blue" (default: "yellow")
- `position`: "absolute" | "relative" (default: "absolute")
- `className`: Additional CSS classes
- `style`: Inline styles for positioning

### GeometricSquare

A square decorative element with thick borders, optionally rotated 45°.

```tsx
import { GeometricSquare } from "@/components/ui/decorative"

<GeometricSquare
  size="md"
  color="cyan"
  rotate
  position="absolute"
  style={{ top: "20px", right: "40px" }}
/>
```

**Props:**
- `size`: "sm" | "md" | "lg" | "xl" (default: "md")
- `color`: "yellow" | "pink" | "cyan" | "purple" | "orange" | "blue" (default: "pink")
- `rotate`: boolean - rotates 45° (default: false)
- `position`: "absolute" | "relative" (default: "absolute")
- `className`: Additional CSS classes
- `style`: Inline styles for positioning

### GeometricTriangle

A triangular decorative element pointing in any direction.

```tsx
import { GeometricTriangle } from "@/components/ui/decorative"

<GeometricTriangle
  size="lg"
  color="purple"
  direction="right"
  position="absolute"
  style={{ bottom: "40px", left: "60px" }}
/>
```

**Props:**
- `size`: "sm" | "md" | "lg" | "xl" (default: "md")
- `color`: "yellow" | "pink" | "cyan" | "purple" | "orange" | "blue" (default: "cyan")
- `direction`: "up" | "down" | "left" | "right" (default: "up")
- `position`: "absolute" | "relative" (default: "absolute")
- `className`: Additional CSS classes
- `style`: Inline styles for positioning

### PatternBackground

A container with pattern backgrounds (dots, grid, or diagonal stripes).

```tsx
import { PatternBackground } from "@/components/ui/decorative"

<PatternBackground pattern="dots" color="yellow">
  <div>Your content here</div>
</PatternBackground>
```

**Props:**
- `pattern`: "dots" | "grid" | "diagonal" (default: "dots")
- `color`: "yellow" | "pink" | "cyan" | "purple" | "orange" | "blue" | "none" (default: "none")
- `className`: Additional CSS classes
- `children`: Content to render inside

### DecorativeHero

A pre-composed hero section with multiple geometric decorations and pattern background.

```tsx
import { DecorativeHero } from "@/components/ui/decorative"

<DecorativeHero pattern="dots">
  <h1>Welcome to Quaslation</h1>
  <p>Your content here</p>
</DecorativeHero>
```

**Props:**
- `pattern`: "dots" | "grid" | "diagonal" (default: "dots")
- `className`: Additional CSS classes
- `children`: Content to render inside

**Includes:**
- Top left: Large pink circle
- Top right: Medium cyan square (rotated)
- Bottom left: Large purple triangle
- Bottom right: Medium orange circle
- Middle left: Small blue square

### DecorativeEmptyState

A pre-composed empty state with subtle geometric decorations.

```tsx
import { DecorativeEmptyState } from "@/components/ui/decorative"

<DecorativeEmptyState>
  <p>No items found</p>
</DecorativeEmptyState>
```

**Props:**
- `className`: Additional CSS classes
- `children`: Content to render inside

**Includes:**
- Top: Small cyan circle
- Left: Small yellow triangle
- Right: Small pink square (rotated)
- Bottom: Small purple triangle

## CSS Utilities

The following CSS utilities are available in `globals.css`:

### Pattern Backgrounds

```tsx
<div className="bg-pattern-dots">Dots pattern</div>
<div className="bg-pattern-grid">Grid pattern</div>
<div className="bg-pattern-diagonal">Diagonal stripes</div>
```

### Colorful Pattern Backgrounds

```tsx
<div className="bg-pattern-brutal-yellow">Yellow tinted background</div>
<div className="bg-pattern-brutal-pink">Pink tinted background</div>
<div className="bg-pattern-brutal-cyan">Cyan tinted background</div>
<div className="bg-pattern-brutal-purple">Purple tinted background</div>
<div className="bg-pattern-brutal-orange">Orange tinted background</div>
<div className="bg-pattern-brutal-blue">Blue tinted background</div>
```

### Corner Accents

```tsx
<div className="brutal-corner-accent">Default cyan corner</div>
<div className="brutal-corner-accent brutal-corner-accent-yellow">Yellow corner</div>
<div className="brutal-corner-accent brutal-corner-accent-pink">Pink corner</div>
<div className="brutal-corner-accent brutal-corner-accent-purple">Purple corner</div>
```

## Accessibility

All decorative components include:
- `aria-hidden="true"` to hide from screen readers
- `pointer-events-none` to prevent interaction
- `select-none` to prevent text selection
- Proper z-index layering to keep content accessible

## Positioning Guidelines

When using decorative elements:

1. **Use absolute positioning** for most decorations
2. **Set appropriate z-index** (0 for decorations, 10+ for content)
3. **Position outside viewport** for partial visibility effects
4. **Use transform** for centering when needed
5. **Ensure content remains readable** - decorations should enhance, not obscure

## Examples

### Hero Section with Decorations

```tsx
import { DecorativeHero } from "@/components/ui/decorative"

export function Hero() {
  return (
    <DecorativeHero pattern="grid" className="py-20">
      <div className="container mx-auto text-center">
        <h1 className="text-5xl font-bold mb-4">
          Welcome to Quaslation
        </h1>
        <p className="text-xl">
          High-quality fan translations of Asian web novels
        </p>
      </div>
    </DecorativeHero>
  )
}
```

### Empty State with Decorations

```tsx
import { DecorativeEmptyState } from "@/components/ui/decorative"

export function NoResults() {
  return (
    <DecorativeEmptyState className="text-center">
      <h3 className="text-2xl font-bold mb-2">No novels found</h3>
      <p className="text-muted-foreground">
        Try adjusting your search criteria
      </p>
    </DecorativeEmptyState>
  )
}
```

### Custom Decoration Layout

```tsx
import { GeometricCircle, GeometricSquare, PatternBackground } from "@/components/ui/decorative"

export function CustomSection() {
  return (
    <PatternBackground pattern="dots" color="cyan" className="relative py-16">
      <GeometricCircle
        size="xl"
        color="yellow"
        style={{ top: "-60px", right: "-60px" }}
      />
      <GeometricSquare
        size="lg"
        color="pink"
        rotate
        style={{ bottom: "-40px", left: "-40px" }}
      />
      
      <div className="relative z-10 container mx-auto">
        {/* Your content */}
      </div>
    </PatternBackground>
  )
}
```

## Performance Considerations

- Decorative elements use CSS for rendering (no images)
- Pattern backgrounds use CSS gradients (GPU-accelerated)
- All decorations are static (no animations by default)
- Use sparingly to avoid visual clutter
- Consider lazy loading for below-the-fold decorations
