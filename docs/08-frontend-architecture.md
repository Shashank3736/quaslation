# Frontend Architecture

## Overview

Quaslation's frontend is built with Next.js 15 and React 19, leveraging modern patterns like Server Components, Server Actions, and the App Router. The architecture emphasizes performance, accessibility, and maintainability through a component-driven approach with shadcn/ui and Tailwind CSS.

## Component Architecture

### Component Hierarchy
```
src/components/
├── ui/                     # Base UI components (shadcn/ui)
├── shared/                 # Reusable business components
├── system/                 # System-level components
└── typography/             # Text rendering components
```

### Base UI Components (shadcn/ui)
```typescript
// src/components/ui/button.tsx
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
```

### Shared Business Components
```typescript
// src/components/shared/novel-card.tsx
interface NovelCardProps {
  novel: Novel & { richText: RichText | null };
  priority?: boolean;
}

export function NovelCard({ novel, priority = false }: NovelCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="aspect-[3/4] relative">
        <Image
          src={novel.thumbnail || '/placeholder-novel.jpg'}
          alt={novel.title}
          fill
          className="object-cover"
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardContent className="p-4">
        <CardTitle className="line-clamp-2 mb-2">
          <Link href={`/novels/${novel.slug}`} className="hover:underline">
            {novel.title}
          </Link>
        </CardTitle>
        {novel.richText?.text && (
          <CardDescription className="line-clamp-3">
            {novel.richText.text}
          </CardDescription>
        )}
      </CardContent>
    </Card>
  );
}
```

### System Components
```typescript
// src/components/system/analytics.tsx
'use client'

import { Analytics } from '@vercel/analytics/react'
import { GoogleAnalytics } from '@next/third-parties/google'

export function AnalyticsProvider() {
  return (
    <>
      <Analytics />
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </>
  )
}
```

## Layout System

### Root Layout
```typescript
// src/app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { AnalyticsProvider } from '@/components/system/analytics'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <AnalyticsProvider />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
```

### Main Layout with Navigation
```typescript
// src/app/(main)/layout.tsx
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { AdSense } from '@/components/system/adsense'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <AdSense />
      <Footer />
    </div>
  )
}
```

## State Management

### Server State with React Query
```typescript
// src/lib/hooks/use-novels.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { getPublishedNovels } from '@/lib/db/query'

export function useNovels() {
  return useQuery({
    queryKey: ['novels'],
    queryFn: () => getPublishedNovels(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

### Client State with Zustand
```typescript
// src/lib/stores/reading-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ReadingState {
  fontSize: number
  theme: 'light' | 'dark' | 'sepia'
  bookmarks: number[]
  readingProgress: Record<number, number>
  setFontSize: (size: number) => void
  setTheme: (theme: 'light' | 'dark' | 'sepia') => void
  addBookmark: (chapterId: number) => void
  removeBookmark: (chapterId: number) => void
  updateProgress: (chapterId: number, progress: number) => void
}

export const useReadingStore = create<ReadingState>()(
  persist(
    (set, get) => ({
      fontSize: 16,
      theme: 'light',
      bookmarks: [],
      readingProgress: {},
      setFontSize: (fontSize) => set({ fontSize }),
      setTheme: (theme) => set({ theme }),
      addBookmark: (chapterId) => 
        set((state) => ({ 
          bookmarks: [...state.bookmarks, chapterId] 
        })),
      removeBookmark: (chapterId) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter(id => id !== chapterId)
        })),
      updateProgress: (chapterId, progress) =>
        set((state) => ({
          readingProgress: {
            ...state.readingProgress,
            [chapterId]: progress
          }
        })),
    }),
    {
      name: 'reading-preferences',
    }
  )
)
```

## Theme System

### Theme Configuration
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
}

export default config
```

### Theme Provider
```typescript
// src/components/theme-provider.tsx
'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

## Reading Experience

### Chapter Reader Component
```typescript
// src/components/shared/chapter-reader.tsx
'use client'

import { useReadingStore } from '@/lib/stores/reading-store'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

interface ChapterReaderProps {
  chapter: Chapter & { richText: RichText }
  navigation: {
    previous?: Chapter
    next?: Chapter
  }
}

export function ChapterReader({ chapter, navigation }: ChapterReaderProps) {
  const { fontSize, theme, setFontSize, setTheme } = useReadingStore()
  
  return (
    <div className={`reading-theme-${theme}`}>
      <div className="reading-controls mb-6 p-4 border rounded-lg">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Font Size:</label>
          <Slider
            value={[fontSize]}
            onValueChange={([value]) => setFontSize(value)}
            min={12}
            max={24}
            step={1}
            className="w-32"
          />
          <span className="text-sm">{fontSize}px</span>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button
            variant={theme === 'light' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('light')}
          >
            Light
          </Button>
          <Button
            variant={theme === 'dark' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('dark')}
          >
            Dark
          </Button>
          <Button
            variant={theme === 'sepia' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('sepia')}
          >
            Sepia
          </Button>
        </div>
      </div>
      
      <article 
        className="prose prose-lg max-w-none"
        style={{ fontSize: `${fontSize}px` }}
      >
        <h1>{chapter.title}</h1>
        <div 
          dangerouslySetInnerHTML={{ 
            __html: chapter.richText.html || chapter.richText.text 
          }} 
        />
      </article>
      
      <nav className="flex justify-between mt-8">
        {navigation.previous && (
          <Button asChild variant="outline">
            <Link href={`/novels/${chapter.novel.slug}/${navigation.previous.slug}`}>
              ← Previous Chapter
            </Link>
          </Button>
        )}
        {navigation.next && (
          <Button asChild>
            <Link href={`/novels/${chapter.novel.slug}/${navigation.next.slug}`}>
              Next Chapter →
            </Link>
          </Button>
        )}
      </nav>
    </div>
  )
}
```

### Reading Themes CSS
```css
/* src/app/_css/reading-themes.css */
.reading-theme-light {
  --reading-bg: #ffffff;
  --reading-text: #1a1a1a;
  --reading-accent: #f5f5f5;
}

.reading-theme-dark {
  --reading-bg: #1a1a1a;
  --reading-text: #e5e5e5;
  --reading-accent: #2a2a2a;
}

.reading-theme-sepia {
  --reading-bg: #f4f1ea;
  --reading-text: #5c4b37;
  --reading-accent: #ede4d3;
}

.reading-theme-light,
.reading-theme-dark,
.reading-theme-sepia {
  background-color: var(--reading-bg);
  color: var(--reading-text);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.reading-theme-light .prose,
.reading-theme-dark .prose,
.reading-theme-sepia .prose {
  color: var(--reading-text);
}
```

## Form Handling

### Form Components with React Hook Form
```typescript
// src/components/forms/contact-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactFormData = z.infer<typeof contactSchema>

export function ContactForm() {
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  })

  async function onSubmit(data: ContactFormData) {
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        form.reset()
        // Show success message
      }
    } catch (error) {
      // Handle error
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="your@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input placeholder="What's this about?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Your message..."
                  className="min-h-[120px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Sending...' : 'Send Message'}
        </Button>
      </form>
    </Form>
  )
}
```

## Error Handling

### Error Boundaries
```typescript
// src/components/error-boundary.tsx
'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4 text-center">
            We're sorry, but something unexpected happened. Please try again.
          </p>
          <Button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
```

### Global Error Page
```typescript
// src/app/error.tsx
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <AlertTriangle className="h-16 w-16 text-destructive mb-6" />
      <h1 className="text-2xl font-bold mb-4">Oops! Something went wrong</h1>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        We encountered an unexpected error. This has been logged and we'll look into it.
      </p>
      <div className="flex gap-4">
        <Button onClick={reset}>Try Again</Button>
        <Button variant="outline" onClick={() => window.location.href = '/'}>
          Go Home
        </Button>
      </div>
    </div>
  )
}
```

## Performance Optimization

### Image Optimization
```typescript
// src/components/optimized-image.tsx
import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-muted text-muted-foreground",
        className
      )}>
        <span className="text-sm">Failed to load image</span>
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        priority={priority}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => setError(true)}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </div>
  )
}
```

### Lazy Loading Components
```typescript
// src/components/lazy-components.tsx
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy load heavy components
export const CommentSection = dynamic(
  () => import('@/components/shared/comment-section'),
  {
    loading: () => <Skeleton className="h-64 w-full" />,
    ssr: false,
  }
)

export const ChapterNavigation = dynamic(
  () => import('@/components/shared/chapter-navigation'),
  {
    loading: () => <Skeleton className="h-12 w-full" />,
  }
)
```

## Accessibility

### Accessible Components
```typescript
// src/components/accessible/skip-link.tsx
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
    >
      Skip to main content
    </a>
  )
}
```

### ARIA Labels and Roles
```typescript
// src/components/shared/navbar.tsx
export function Navbar() {
  return (
    <nav role="navigation" aria-label="Main navigation">
      <div className="container mx-auto px-4">
        <ul className="flex items-center space-x-6">
          <li>
            <Link 
              href="/" 
              aria-label="Go to homepage"
              className="font-bold text-xl"
            >
              Quaslation
            </Link>
          </li>
          <li>
            <Link 
              href="/novels" 
              aria-current={pathname === '/novels' ? 'page' : undefined}
            >
              Novels
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
```

---

This frontend architecture provides a solid foundation for building scalable, performant, and accessible React applications with Next.js, emphasizing modern patterns and best practices.