# Performance & SEO

## Overview

Quaslation is optimized for performance and search engine visibility through Next.js 15's advanced features, strategic caching, image optimization, and comprehensive SEO implementation. The focus is on delivering fast, accessible content while maximizing discoverability.

## Performance Optimization

### Core Web Vitals Optimization

#### Largest Contentful Paint (LCP)
```typescript
// src/components/optimized-image.tsx
import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  priority?: boolean
  className?: string
  width?: number
  height?: number
}

export function OptimizedImage({ 
  src, 
  alt, 
  priority = false, 
  className,
  width,
  height 
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setIsLoading(false)}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </div>
  )
}
```

#### First Input Delay (FID) & Interaction to Next Paint (INP)
```typescript
// src/lib/performance/interaction-tracking.ts
'use client'

import { useEffect } from 'react'

export function useInteractionTracking() {
  useEffect(() => {
    // Track long tasks that might affect INP
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn('Long task detected:', entry.duration, 'ms')
          }
        }
      })
      
      observer.observe({ entryTypes: ['longtask'] })
      
      return () => observer.disconnect()
    }
  }, [])
}
```

#### Cumulative Layout Shift (CLS)
```css
/* src/app/_css/layout-stability.css */
.novel-card {
  aspect-ratio: 3/4;
  contain: layout style paint;
}

.chapter-content {
  min-height: 400px;
  contain: layout;
}

.skeleton-loader {
  width: 100%;
  height: 200px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Caching Strategy

#### Server-Side Caching
```typescript
// src/lib/cache/server-cache.ts
import { unstable_cache } from 'next/cache'
import { cache } from 'react'

// React cache for request deduplication
export const getNovelData = cache(async (slug: string) => {
  return await db.query.novels.findFirst({
    where: eq(novels.slug, slug),
    with: { richText: true, volumes: true },
  })
})

// Next.js cache for long-term storage
export const getCachedNovelData = unstable_cache(
  async (slug: string) => getNovelData(slug),
  ['novel-data'],
  {
    revalidate: 3600, // 1 hour
    tags: ['novels'],
  }
)

// Cache with dynamic revalidation
export const getCachedChapterData = unstable_cache(
  async (slug: string) => {
    return await db.query.chapters.findFirst({
      where: eq(chapters.slug, slug),
      with: { richText: true, novel: true },
    })
  },
  ['chapter-data'],
  {
    revalidate: 1800, // 30 minutes
    tags: ['chapters'],
  }
)
```

#### Client-Side Caching
```typescript
// src/lib/cache/client-cache.ts
'use client'

import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes('404')) {
          return false
        }
        return failureCount < 3
      },
    },
  },
})

// Prefetch strategy
export function usePrefetchChapter(chapterSlug: string) {
  const queryClient = useQueryClient()
  
  return useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ['chapter', chapterSlug],
      queryFn: () => fetchChapter(chapterSlug),
      staleTime: 5 * 60 * 1000,
    })
  }, [chapterSlug, queryClient])
}
```

### Code Splitting & Lazy Loading

#### Dynamic Imports
```typescript
// src/components/lazy-components.tsx
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// Heavy components loaded on demand
export const AdminDashboard = dynamic(
  () => import('@/components/admin/dashboard'),
  {
    loading: () => <Skeleton className="h-96 w-full" />,
    ssr: false,
  }
)

export const ChapterEditor = dynamic(
  () => import('@/components/admin/chapter-editor'),
  {
    loading: () => <div>Loading editor...</div>,
    ssr: false,
  }
)

```

#### Route-Based Code Splitting
```typescript
// src/app/(main)/novels/[slug]/loading.tsx
export default function NovelLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Skeleton className="aspect-[3/4] w-full mb-4" />
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="md:col-span-2">
          <Skeleton className="h-12 w-1/2 mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

### Bundle Optimization

#### Webpack Configuration
```javascript
// next.config.mjs
const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimize bundle splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          ui: {
            test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 20,
          },
          shared: {
            test: /[\\/]src[\\/]components[\\/]shared[\\/]/,
            name: 'shared',
            chunks: 'all',
            priority: 15,
          },
        },
      }
    }
    
    return config
  },
  
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'date-fns',
    ],
  },
}
```

#### Tree Shaking Optimization
```typescript
// src/lib/utils/optimized-imports.ts
// Instead of importing entire libraries
// import * as dateFns from 'date-fns'

// Import only what you need
import { format } from 'date-fns'
import { Calendar, ChevronRight } from 'lucide-react'

// Use barrel exports carefully
export { Button } from './button'
export { Input } from './input'
export { Card } from './card'
// Instead of export * from './components'
```

## SEO Implementation

### Metadata Generation

#### Dynamic Metadata
```typescript
// src/app/(main)/novels/[slug]/page.tsx
import { Metadata } from 'next'
import { getNovelBySlug } from '@/lib/db/query'
import { notFound } from 'next/navigation'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const novel = await getNovelBySlug(params.slug)
  
  if (!novel) {
    return {
      title: 'Novel Not Found',
    }
  }

  const description = novel.richText?.text?.slice(0, 160) || 'Read this amazing novel on Quaslation'
  
  return {
    title: `${novel.title} | Quaslation`,
    description,
    keywords: ['novel', 'translation', 'asian literature', novel.title],
    authors: [{ name: 'Quaslation Team' }],
    openGraph: {
      title: novel.title,
      description,
      type: 'book',
      url: `https://quaslation.com/novels/${novel.slug}`,
      images: [
        {
          url: novel.thumbnail || '/og-default.jpg',
          width: 1200,
          height: 630,
          alt: novel.title,
        },
      ],
      siteName: 'Quaslation',
    },
    twitter: {
      card: 'summary_large_image',
      title: novel.title,
      description,
      images: [novel.thumbnail || '/og-default.jpg'],
    },
    alternates: {
      canonical: `https://quaslation.com/novels/${novel.slug}`,
    },
  }
}
```

#### Structured Data
```typescript
// src/components/seo/structured-data.tsx
interface NovelStructuredDataProps {
  novel: Novel & { richText: RichText | null }
}

export function NovelStructuredData({ novel }: NovelStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: novel.title,
    description: novel.richText?.text,
    image: novel.thumbnail,
    url: `https://quaslation.com/novels/${novel.slug}`,
    publisher: {
      '@type': 'Organization',
      name: 'Quaslation',
      url: 'https://quaslation.com',
    },
    datePublished: novel.publishedAt?.toISOString(),
    dateModified: novel.updatedAt?.toISOString(),
    inLanguage: 'en',
    translationOfWork: {
      '@type': 'Book',
      inLanguage: 'ja',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

// Chapter structured data
export function ChapterStructuredData({ 
  chapter, 
  novel 
}: { 
  chapter: Chapter
  novel: Novel 
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Chapter',
    name: chapter.title,
    url: `https://quaslation.com/novels/${novel.slug}/${chapter.slug}`,
    isPartOf: {
      '@type': 'Book',
      name: novel.title,
      url: `https://quaslation.com/novels/${novel.slug}`,
    },
    position: chapter.serial,
    datePublished: chapter.publishedAt?.toISOString(),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
```

### Sitemap Generation

#### Dynamic Sitemap
```typescript
// src/app/sitemap.ts
import { MetadataRoute } from 'next'
import { getPublishedNovels, getPublishedChapters } from '@/lib/db/query'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://quaslation.com'
  
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/novels`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Novel routes
  const novels = await getPublishedNovels()
  const novelRoutes: MetadataRoute.Sitemap = novels.map((novel) => ({
    url: `${baseUrl}/novels/${novel.slug}`,
    lastModified: novel.updatedAt || novel.createdAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Chapter routes
  const chapters = await getPublishedChapters()
  const chapterRoutes: MetadataRoute.Sitemap = chapters.map((chapter) => ({
    url: `${baseUrl}/novels/${chapter.novel.slug}/${chapter.slug}`,
    lastModified: chapter.updatedAt || chapter.createdAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...novelRoutes, ...chapterRoutes]
}
```

### RSS Feed Optimization

#### SEO-Optimized RSS
```typescript
// src/app/rss.xml/route.ts
import { NextResponse } from 'next/server'
import { getPublishedNovels } from '@/lib/db/query'

export async function GET() {
  const novels = await getPublishedNovels()
  
  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Quaslation - Latest Novel Translations</title>
    <description>High-quality fan translations of Asian web novels</description>
    <link>https://quaslation.com</link>
    <atom:link href="https://quaslation.com/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>60</ttl>
    <image>
      <url>https://quaslation.com/logo.png</url>
      <title>Quaslation</title>
      <link>https://quaslation.com</link>
    </image>
    ${novels.map(novel => `
    <item>
      <title><![CDATA[${novel.title}]]></title>
      <description><![CDATA[${novel.richText?.text || ''}]]></description>
      <link>https://quaslation.com/novels/${novel.slug}</link>
      <guid isPermaLink="true">https://quaslation.com/novels/${novel.slug}</guid>
      <pubDate>${novel.publishedAt?.toUTCString()}</pubDate>
      <dc:creator>Quaslation Team</dc:creator>
      <category>Novel Translation</category>
      ${novel.thumbnail ? `<enclosure url="${novel.thumbnail}" type="image/jpeg"/>` : ''}
    </item>
    `).join('')}
  </channel>
</rss>`

  return new NextResponse(rssXml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
```

### Internal Linking Strategy

#### Automated Internal Links
```typescript
// src/components/seo/internal-links.tsx
interface InternalLinksProps {
  currentNovel: Novel
  relatedNovels: Novel[]
}

export function InternalLinks({ currentNovel, relatedNovels }: InternalLinksProps) {
  return (
    <section className="mt-8 p-6 bg-muted rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Related Novels</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {relatedNovels.map((novel) => (
          <Link
            key={novel.id}
            href={`/novels/${novel.slug}`}
            className="flex items-center space-x-3 p-3 rounded-md hover:bg-background transition-colors"
          >
            <Image
              src={novel.thumbnail || '/placeholder.jpg'}
              alt={novel.title}
              width={48}
              height={64}
              className="rounded"
            />
            <div>
              <h4 className="font-medium line-clamp-1">{novel.title}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {novel.richText?.text}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
```

#### Breadcrumb Navigation
```typescript
// src/components/seo/breadcrumbs.tsx
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? `https://quaslation.com${item.href}` : undefined,
    })),
  }

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
              {item.href ? (
                <Link href={item.href} className="hover:text-foreground">
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  )
}
```

## Analytics & Monitoring

### Performance Monitoring
```typescript
// src/lib/analytics/performance.ts
'use client'

export function trackWebVitals() {
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    // Track Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const metricName = entry.name
        const value = Math.round(entry.value)
        
        // Send to analytics
        if (window.gtag) {
          window.gtag('event', metricName, {
            event_category: 'Web Vitals',
            value: value,
            non_interaction: true,
          })
        }
        
        console.log(`${metricName}: ${value}`)
      }
    })
    
    observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] })
  }
}

// Track custom metrics
export function trackCustomMetric(name: string, value: number, category = 'Performance') {
  if (window.gtag) {
    window.gtag('event', name, {
      event_category: category,
      value: value,
      non_interaction: true,
    })
  }
}
```

### SEO Monitoring
```typescript
// src/lib/analytics/seo-tracking.ts
'use client'

export function trackPageView(url: string, title: string) {
  if (window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID!, {
      page_title: title,
      page_location: url,
    })
  }
}

export function trackSearchQuery(query: string, results: number) {
  if (window.gtag) {
    window.gtag('event', 'search', {
      search_term: query,
      event_category: 'Search',
      custom_parameter_1: results,
    })
  }
}

export function trackChapterRead(novelSlug: string, chapterSlug: string) {
  if (window.gtag) {
    window.gtag('event', 'chapter_read', {
      event_category: 'Content',
      novel_slug: novelSlug,
      chapter_slug: chapterSlug,
    })
  }
}
```

## Image Optimization

### Next.js Image Component Configuration
```typescript
// next.config.mjs
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kakuyomu.jp',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.quaslation.com',
        port: '',
        pathname: '/**',
      },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
}
```

### Responsive Images
```typescript
// src/components/responsive-image.tsx
interface ResponsiveImageProps {
  src: string
  alt: string
  priority?: boolean
  className?: string
}

export function ResponsiveImage({ 
  src, 
  alt, 
  priority = false, 
  className 
}: ResponsiveImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      className={className}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      style={{ objectFit: 'cover' }}
    />
  )
}
```

## Accessibility & SEO

### Semantic HTML Structure
```typescript
// src/components/semantic/article-structure.tsx
interface ArticleStructureProps {
  novel: Novel
  chapter: Chapter
  content: string
}

export function ArticleStructure({ novel, chapter, content }: ArticleStructureProps) {
  return (
    <article itemScope itemType="https://schema.org/Chapter">
      <header>
        <nav aria-label="Breadcrumb">
          <Breadcrumbs items={[
            { label: 'Home', href: '/' },
            { label: 'Novels', href: '/novels' },
            { label: novel.title, href: `/novels/${novel.slug}` },
            { label: chapter.title },
          ]} />
        </nav>
        
        <h1 itemProp="name">{chapter.title}</h1>
        
        <div className="text-sm text-muted-foreground">
          <span>Part of: </span>
          <Link 
            href={`/novels/${novel.slug}`}
            itemProp="isPartOf"
            itemScope
            itemType="https://schema.org/Book"
          >
            <span itemProp="name">{novel.title}</span>
          </Link>
        </div>
      </header>
      
      <main 
        itemProp="text"
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
      
      <footer>
        <ChapterNavigation novel={novel} currentChapter={chapter} />
      </footer>
    </article>
  )
}
```

---

This performance and SEO implementation ensures Quaslation delivers fast, discoverable content while maintaining excellent user experience and search engine visibility.