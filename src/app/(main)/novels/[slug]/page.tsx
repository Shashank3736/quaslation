import H2 from '@/components/typography/h2';
import { cn, shortifyString } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getNovelList } from '@/lib/db/query';
import ChapterList from './_components/chapter-list';
import { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export async function generateStaticParams() {
  const novels = await getNovelList();

  return novels.map((novel) => ({
    slug: novel.slug,
  }))
}


export async function generateMetadata({ params }:{ params: Promise<{ slug: string }>}): Promise<Metadata> {
  const paramsResolved = await params;
  const getNovelMetadata = unstable_cache(async (slug) => {
      return await db.query.novel.findFirst({
        columns: {
          title: true,
        },
        where: (novel, { eq }) => eq(novel.slug, slug),
        with: {
          richText: {
            columns: {
              text: true,
            }
          }
        }
      })
    }, 
    [], 
    {
      revalidate: 24*3600,
      tags: [`novel:update:${paramsResolved.slug}`]
    }
  );
  const novel = await getNovelMetadata(paramsResolved.slug);
  if(!novel) return {
    title: "Not Found",
  }
  return {
    title: novel.title,
    description: shortifyString(novel.richText.text, 512)
  }
}

const getNovel = async (slug: string) => {
  return await db.query.novel.findFirst({
    columns: {
      id: true,
      title: true,
      thumbnail: true
    },
    where: (novel, { eq }) => eq(novel.slug, slug),
    with: {
      richText: {
        columns: {
          html: true,
        }
      },
      chapters: {
        columns: {
          slug: true,
          title: true,
          number: true,
          premium: true,
        },
        where: (chapter, { isNotNull }) => isNotNull(chapter.publishedAt),
        orderBy: (chapter) => chapter.serial,
        limit: 5000,
        with: {
          volume: {
            columns: {
              number: true,
              title: true
            }
          }
        }
      }
    }
  });
}


export default async function NovelPage({ params }:{ params: Promise<{ slug: string }>}) {
  const paramsResolved = await params;
  const getNovelCache = unstable_cache(getNovel, [], {
    tags: [`novel:update:${paramsResolved.slug}`],
    revalidate: 12*3600
  });

  const novel = await getNovelCache(paramsResolved.slug);
  
  if(!novel) notFound();
  
  const chapters = novel.chapters;
  return (
    <div className='p-4'>
      {/* Hero Section with Cover and Info */}
      <div className='mb-8'>
        <div className='flex flex-col lg:flex-row items-center gap-8'>
          {/* Cover Image */}
          <div className='flex-shrink-0'>
            <div className='relative group'>
              <Image
                alt='thumbnail'
                src={novel.thumbnail ?? "/dummy/NoImageFound_light_400x600.png"}
                className='rounded-2xl shadow-lg object-cover w-64 h-96 lg:w-80 lg:h-[480px] transition-transform duration-300 group-hover:scale-105'
                width={400}
                height={600}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            </div>
          </div>

          {/* Info Panel */}
          <div className='flex-grow max-w-2xl'>
            <Card className="glass">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <H2 className="text-3xl font-bold text-gradient-indigo-violet mb-2">
                      {novel.title}
                    </H2>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gradient-to-r-indigo-violet text-white">
                        {chapters.length} Chapters
                      </Badge>
                      {chapters.some(c => c.premium) && (
                        <Badge variant="secondary">
                          Premium Content
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    {chapters.at(0) && (
                      <Button size="lg" className="bg-gradient-to-r-indigo-violet text-white px-8" asChild>
                        <Link href={`${paramsResolved.slug}/${chapters[0].slug}`}>
                          Read Now
                        </Link>
                      </Button>
                    )}
                    <Button variant="outline" size="lg" asChild>
                      <Link href="/novels">
                        Browse All Novels
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Latest Chapter</div>
                    {chapters.length > 0 && (
                      <div className="font-medium">
                        Vol. {chapters[chapters.length - 1].volume.number} Chapter {chapters[chapters.length - 1].number}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Status</div>
                    <div className="font-medium">Ongoing</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Novel Description */}
      <div className="mb-8">
        <Card className="glass">
          <CardContent className="p-6">
            <div
              className={cn("prose prose-lg dark:prose-invert max-w-none", "prose-headings:text-gradient-indigo-violet prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl")}
              dangerouslySetInnerHTML={{ __html: novel.richText.html }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Chapters Section */}
      <div className='mt-8'>
        <div className="flex items-center justify-between mb-6">
          <H2 className="text-2xl font-bold text-gradient-indigo-violet">Chapters</H2>
          <div className="text-sm text-muted-foreground">
            {chapters.length} total chapters
          </div>
        </div>
        <ChapterList novelId={novel.id} novelSlug={paramsResolved.slug} data={chapters} />
      </div>
    </div>
  )
}
