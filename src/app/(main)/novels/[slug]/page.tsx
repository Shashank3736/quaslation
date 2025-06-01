import H2 from '@/components/typography/h2';
import { Separator } from '@/components/ui/separator';
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
        limit: 50,
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
      <div className='flex p-4 items-center'>
        <div className='hidden md:block'>
          <Image
            alt='thumbnail'
            src={novel.thumbnail ?? "/dummy/NoImageFound_light_400x600.png"}
            className='rounded-xl hover:rounded object-cover max-w-[200px] h-auto'
            width={400}
            height={600}
          />
        </div>
        <div className='p-4'>
          <H2 className='text-center'>{novel.title}</H2>
          {chapters.at(0) ? (
          <div className='flex space-x-4 mt-8'>
            <Button asChild>
              <Link href={`${paramsResolved.slug}/${chapters[0].slug}`}>Read Now</Link>
            </Button>
          </div>
          ):null}
        </div>
      </div>
      <article
        className={cn("my-4 prose dark:prose-invert", "max-w-none")}
        dangerouslySetInnerHTML={{ __html: novel.richText.html }}
      />
      <Separator />
      <div className='mt-4'>
        <ChapterList novelId={novel.id} novelSlug={paramsResolved.slug} data={chapters} />
      </div>
    </div>
  )
}
