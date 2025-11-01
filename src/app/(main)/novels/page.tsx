import H2 from '@/components/typography/h2'
import Muted from '@/components/typography/muted'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { DecorativeEmptyState } from '@/components/ui/decorative'
import { db } from '@/lib/db'
import { timeAgo } from '@/lib/utils'
import { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export const metadata: Metadata = {
  title: "Novels",
  description: "A list of asian web novels fan translated by the translators of Quaslation."
}

export const revalidate = 43200; // 12 hours

const getNovelList = async () => {
  const novels = await db.query.novel.findMany({
    columns: {
      title: true,
      slug: true,
      thumbnail: true,
    },
    with: {
      chapters: {
        columns: {
          number: true,
          slug: true,
          publishedAt: true,
          premium: true
        },
        with: {
          volume: {
            columns: {
              number: true
            }
          }
        },
        orderBy: (chapter, { desc }) => desc(chapter.serial),
        where: (chapter, { isNotNull }) => isNotNull(chapter.publishedAt),
        limit: 100
      }
    },
    orderBy: (novel) => novel.title
  })
  
  // Filter and transform to include premium status and latest free chapters
  return novels.map(novel => ({
    ...novel,
    hasPremium: novel.chapters.some(ch => ch.premium),
    chapters: novel.chapters.filter(ch => !ch.premium).slice(0, 2)
  }))
}

const getCacheData = unstable_cache(getNovelList, ["novels"], {
  tags: ["chapter:update:free", "novel:update", "novel:create"],
  revalidate: 12*3600
});

export default async function NovelList() {
  const novels = await getCacheData()
  return (
    <div className='p-4'>
      <div className="text-center mb-12">
        <H2 className="text-3xl font-bold text-gradient-indigo-violet mb-4">Discover Amazing Novels</H2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore our collection of fan-translated Asian web novels. Each story is carefully translated and edited by passionate fans.
        </p>
      </div>
      
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {novels.map(novel => novel.chapters.length > 0 ? (
          <Card key={novel.slug} className="border-brutal border-black shadow-brutal-lg hover:shadow-brutal-xl hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all duration-200 relative overflow-hidden bg-background group">
            {/* Colorful accent corner - top-right triangle */}
            <div className="absolute top-0 right-0 w-0 h-0 border-l-[60px] border-l-transparent border-t-[60px] border-t-brutal-cyan z-10" />
            
            <CardHeader className="pb-4">
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg mb-4 border-brutal border-black shadow-brutal-sm">
                <Image
                  src={novel.thumbnail || "/dummy/NoImageFound_light_400x600.png"}
                  alt={novel.title}
                  className="object-cover w-full h-full"
                  width={400}
                  height={600}
                />
                {/* Premium badge on thumbnail */}
                {novel.hasPremium && (
                  <div className="absolute top-2 left-2 z-20">
                    <Badge className="bg-brutal-pink text-white border-2 border-black shadow-brutal-sm font-bold">
                      PREMIUM
                    </Badge>
                  </div>
                )}
              </div>
              <CardTitle className="text-xl text-center font-bold">
                <Link href={`/novels/${novel.slug}`} title={novel.title} className="hover:underline">
                  {novel.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="text-center text-sm text-muted-foreground font-semibold">
                  Latest Chapters:
                </div>
                {novel.chapters.slice(0, 2).map(chap => (
                  <div key={chap.slug} className="flex items-center justify-between">
                    <Link
                      href={`/novels/${novel.slug}/${chap.slug}`}
                      className="text-sm font-medium hover:text-primary transition-colors"
                    >
                      <span className="truncate">
                        {chap.volume.number < 0 ? "" : `Vol. ${chap.volume.number} `}Chapter {chap.number}
                      </span>
                    </Link>
                    <Muted className="text-xs">{timeAgo(chap.publishedAt || new Date())}</Muted>
                  </div>
                ))}
                {novel.chapters.length > 2 && (
                  <div className="text-center">
                    <Link
                      href={`/novels/${novel.slug}`}
                      className="text-sm text-primary hover:underline font-medium"
                    >
                      View all {novel.chapters.length} chapters →
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ): null)}
      </div>
      
      {novels.length === 0 && (
        <DecorativeEmptyState className="text-center">
          <H2 className="text-2xl font-bold mb-4">No novels available yet</H2>
          <p className="text-muted-foreground">
            Check back later for new translations!
          </p>
        </DecorativeEmptyState>
      )}
    </div>
  )
}
