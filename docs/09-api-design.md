# API Design

## Overview

Quaslation's API architecture leverages Next.js App Router's Server Actions and Server Components for type-safe, performant data operations. The design emphasizes server-side rendering, optimistic updates, and seamless client-server communication without traditional REST endpoints.

## Server Actions

### Novel Management Actions
```typescript
// src/lib/actions/novel-actions.ts
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs'
import { db } from '@/lib/db'
import { novels, richText } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function createNovel(formData: FormData) {
  const { userId } = auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const thumbnail = formData.get('thumbnail') as string
  const description = formData.get('description') as string

  // Validate input
  if (!title || !slug || !description) {
    throw new Error('Missing required fields')
  }

  try {
    await db.transaction(async (tx) => {
      // Create rich text entry
      const [richTextResult] = await tx.insert(richText).values({
        text: description,
        html: description,
        markdown: description,
      }).returning()

      // Create novel
      await tx.insert(novels).values({
        title,
        slug,
        thumbnail,
        richTextId: richTextResult.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    })

    revalidateTag('novels')
    revalidatePath('/admin/novels')
    revalidatePath('/novels')
  } catch (error) {
    throw new Error('Failed to create novel')
  }

  redirect('/admin/novels')
}

export async function updateNovel(novelId: number, formData: FormData) {
  const { userId } = auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const thumbnail = formData.get('thumbnail') as string

  try {
    await db.update(novels)
      .set({
        title,
        slug,
        thumbnail,
        updatedAt: new Date(),
      })
      .where(eq(novels.id, novelId))

    revalidateTag('novels')
    revalidatePath('/admin/novels')
    revalidatePath(`/novels/${slug}`)
  } catch (error) {
    throw new Error('Failed to update novel')
  }
}

export async function deleteNovel(novelId: number) {
  const { userId } = auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  try {
    await db.delete(novels).where(eq(novels.id, novelId))
    
    revalidateTag('novels')
    revalidatePath('/admin/novels')
    revalidatePath('/novels')
  } catch (error) {
    throw new Error('Failed to delete novel')
  }
}
```

### Chapter Management Actions
```typescript
// src/lib/actions/chapter-actions.ts
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { auth } from '@clerk/nextjs'
import { db } from '@/lib/db'
import { chapters, richText } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function createChapter(formData: FormData) {
  const { userId } = auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const content = formData.get('content') as string
  const novelId = parseInt(formData.get('novelId') as string)
  const volumeId = parseInt(formData.get('volumeId') as string)
  const number = parseFloat(formData.get('number') as string)
  const serial = parseInt(formData.get('serial') as string)
  const premium = formData.get('premium') === 'true'

  try {
    await db.transaction(async (tx) => {
      // Create rich text entry
      const [richTextResult] = await tx.insert(richText).values({
        text: content,
        html: content, // Would be processed from markdown
        markdown: content,
      }).returning()

      // Create chapter
      await tx.insert(chapters).values({
        title,
        slug,
        novelId,
        volumeId,
        number,
        serial,
        premium,
        richTextId: richTextResult.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    })

    revalidateTag('chapters')
    revalidatePath('/admin/chapters')
    revalidatePath(`/novels/${slug}`)
  } catch (error) {
    throw new Error('Failed to create chapter')
  }
}

export async function publishChapter(chapterId: number) {
  const { userId } = auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  try {
    await db.update(chapters)
      .set({
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(chapters.id, chapterId))

    revalidateTag('chapters')
    revalidatePath('/admin/chapters')
  } catch (error) {
    throw new Error('Failed to publish chapter')
  }
}
```

### User Management Actions
```typescript
// src/lib/actions/user-actions.ts
'use server'

import { auth, clerkClient } from '@clerk/nextjs'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function updateUserRole(userId: string, role: 'ADMIN' | 'SUBSCRIBER' | 'MEMBER') {
  const { userId: currentUserId } = auth()
  
  if (!currentUserId) {
    throw new Error('Unauthorized')
  }

  // Check if current user is admin
  const currentUser = await db.query.users.findFirst({
    where: eq(users.clerkId, currentUserId)
  })

  if (currentUser?.role !== 'ADMIN') {
    throw new Error('Insufficient permissions')
  }

  try {
    await db.update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.clerkId, userId))

    // Update Clerk metadata
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { role }
    })
  } catch (error) {
    throw new Error('Failed to update user role')
  }
}

export async function syncUserWithClerk(clerkUser: any) {
  try {
    await db.insert(users).values({
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      role: clerkUser.publicMetadata?.role || 'MEMBER',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: users.clerkId,
      set: {
        email: clerkUser.emailAddresses[0]?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        updatedAt: new Date(),
      }
    })
  } catch (error) {
    console.error('Failed to sync user with Clerk:', error)
  }
}
```

## Data Fetching Patterns

### Server Components Data Fetching
```typescript
// src/lib/db/query.ts
import { db } from '@/lib/db'
import { novels, chapters, volumes, richText } from '@/lib/db/schema'
import { eq, desc, asc, and, isNotNull } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'

export const getPublishedNovels = unstable_cache(
  async () => {
    return await db.query.novels.findMany({
      where: isNotNull(novels.publishedAt),
      with: {
        richText: true,
      },
      orderBy: desc(novels.publishedAt),
    })
  },
  ['published-novels'],
  {
    revalidate: 3600, // 1 hour
    tags: ['novels'],
  }
)

export const getNovelBySlug = unstable_cache(
  async (slug: string) => {
    return await db.query.novels.findFirst({
      where: eq(novels.slug, slug),
      with: {
        richText: true,
        volumes: {
          with: {
            chapters: {
              where: isNotNull(chapters.publishedAt),
              with: {
                richText: true,
              },
              orderBy: asc(chapters.number),
            },
          },
          orderBy: asc(volumes.number),
        },
      },
    })
  },
  ['novel-by-slug'],
  {
    revalidate: 1800, // 30 minutes
    tags: ['novels', 'chapters'],
  }
)

export const getChapterBySlug = unstable_cache(
  async (novelSlug: string, chapterSlug: string) => {
    return await db.query.chapters.findFirst({
      where: eq(chapters.slug, chapterSlug),
      with: {
        richText: true,
        novel: {
          where: eq(novels.slug, novelSlug),
        },
        volume: true,
      },
    })
  },
  ['chapter-by-slug'],
  {
    revalidate: 1800, // 30 minutes
    tags: ['chapters'],
  }
)

export async function getChapterNavigation(chapterId: number) {
  const chapter = await db.query.chapters.findFirst({
    where: eq(chapters.id, chapterId),
    with: { novel: true },
  })

  if (!chapter) return null

  const [previousChapter, nextChapter] = await Promise.all([
    db.query.chapters.findFirst({
      where: and(
        eq(chapters.novelId, chapter.novelId),
        lt(chapters.serial, chapter.serial),
        isNotNull(chapters.publishedAt)
      ),
      orderBy: desc(chapters.serial),
    }),
    db.query.chapters.findFirst({
      where: and(
        eq(chapters.novelId, chapter.novelId),
        gt(chapters.serial, chapter.serial),
        isNotNull(chapters.publishedAt)
      ),
      orderBy: asc(chapters.serial),
    }),
  ])

  return { previousChapter, currentChapter: chapter, nextChapter }
}
```

### Client-Side Data Fetching
```typescript
// src/lib/hooks/use-chapter-navigation.ts
'use client'

import { useQuery } from '@tanstack/react-query'

export function useChapterNavigation(chapterId: number) {
  return useQuery({
    queryKey: ['chapter-navigation', chapterId],
    queryFn: async () => {
      const response = await fetch(`/api/chapters/${chapterId}/navigation`)
      if (!response.ok) throw new Error('Failed to fetch navigation')
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

## Route Handlers (API Routes)

### Contact Form API
```typescript
// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(5),
  message: z.string().min(10),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = contactSchema.parse(body)

    // Send email or save to database
    await sendContactEmail({ name, email, subject, message })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function sendContactEmail(data: {
  name: string
  email: string
  subject: string
  message: string
}) {
  // Implementation for sending email
  // Could use services like Resend, SendGrid, etc.
}
```

### Search API
```typescript
// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { novels, chapters } from '@/lib/db/schema'
import { ilike, or, and, isNotNull } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const type = searchParams.get('type') || 'all'
  const limit = parseInt(searchParams.get('limit') || '10')

  if (!query || query.length < 2) {
    return NextResponse.json({ error: 'Query too short' }, { status: 400 })
  }

  try {
    const results = await searchContent(query, type, limit)
    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}

async function searchContent(query: string, type: string, limit: number) {
  const searchTerm = `%${query}%`
  
  if (type === 'novels' || type === 'all') {
    const novelResults = await db.query.novels.findMany({
      where: and(
        or(
          ilike(novels.title, searchTerm),
          ilike(novels.slug, searchTerm)
        ),
        isNotNull(novels.publishedAt)
      ),
      with: {
        richText: true,
      },
      limit: type === 'novels' ? limit : Math.floor(limit / 2),
    })

    if (type === 'novels') {
      return { novels: novelResults }
    }
  }

  if (type === 'chapters' || type === 'all') {
    const chapterResults = await db.query.chapters.findMany({
      where: and(
        ilike(chapters.title, searchTerm),
        isNotNull(chapters.publishedAt)
      ),
      with: {
        novel: true,
        richText: true,
      },
      limit: type === 'chapters' ? limit : Math.floor(limit / 2),
    })

    if (type === 'chapters') {
      return { chapters: chapterResults }
    }
  }

  // Return combined results for 'all' type
  const [novelResults, chapterResults] = await Promise.all([
    db.query.novels.findMany({
      where: and(
        or(
          ilike(novels.title, searchTerm),
          ilike(novels.slug, searchTerm)
        ),
        isNotNull(novels.publishedAt)
      ),
      with: { richText: true },
      limit: Math.floor(limit / 2),
    }),
    db.query.chapters.findMany({
      where: and(
        ilike(chapters.title, searchTerm),
        isNotNull(chapters.publishedAt)
      ),
      with: { novel: true, richText: true },
      limit: Math.floor(limit / 2),
    }),
  ])

  return { novels: novelResults, chapters: chapterResults }
}
```

## RSS Feed Generation

### Dynamic RSS Routes
```typescript
// src/app/rss.xml/route.ts
import { NextResponse } from 'next/server'
import { getPublishedNovels } from '@/lib/db/query'

export async function GET() {
  const novels = await getPublishedNovels()
  
  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Quaslation - Latest Novels</title>
    <description>High-quality fan translations of Asian web novels</description>
    <link>https://quaslation.com</link>
    <atom:link href="https://quaslation.com/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${novels.map(novel => `
    <item>
      <title>${escapeXml(novel.title)}</title>
      <description>${escapeXml(novel.richText?.text || '')}</description>
      <link>https://quaslation.com/novels/${novel.slug}</link>
      <guid>https://quaslation.com/novels/${novel.slug}</guid>
      <pubDate>${novel.publishedAt?.toUTCString()}</pubDate>
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

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '&': return '&amp;'
      case "'": return '&apos;'
      case '"': return '&quot;'
      default: return c
    }
  })
}
```

## Sitemap Generation

### Dynamic Sitemap
```typescript
// src/app/sitemap.ts
import { MetadataRoute } from 'next'
import { getPublishedNovels } from '@/lib/db/query'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const novels = await getPublishedNovels()
  
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: 'https://quaslation.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://quaslation.com/novels',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: 'https://quaslation.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://quaslation.com/contact',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  const novelRoutes: MetadataRoute.Sitemap = novels.map((novel) => ({
    url: `https://quaslation.com/novels/${novel.slug}`,
    lastModified: novel.updatedAt || novel.createdAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...novelRoutes]
}
```

## Error Handling

### Global Error Handler
```typescript
// src/lib/error-handler.ts
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export function handleApiError(error: unknown) {
  console.error('API Error:', error)

  if (error instanceof ZodError) {
    return NextResponse.json(
      { 
        error: 'Validation failed', 
        details: error.errors 
      },
      { status: 400 }
    )
  }

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (error.message === 'Insufficient permissions') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

## Type Safety

### API Response Types
```typescript
// src/lib/types/api.ts
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  details?: any
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface SearchResponse {
  novels?: Novel[]
  chapters?: Chapter[]
  total: number
}
```

### Server Action Types
```typescript
// src/lib/types/actions.ts
export interface ActionResult<T = any> {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[]>
}

export type NovelFormData = {
  title: string
  slug: string
  thumbnail?: string
  description: string
}

export type ChapterFormData = {
  title: string
  slug: string
  content: string
  novelId: number
  volumeId: number
  number: number
  serial: number
  premium: boolean
}
```

---

This API design provides a comprehensive, type-safe approach to data management in Next.js, leveraging Server Actions for mutations and optimized queries for data fetching, with proper error handling and caching strategies.