import H2 from '@/components/typography/h2';
import { Separator } from '@/components/ui/separator';
import { cn, shortifyString } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getNovelBySlug, getNovelChapters, getNovelList } from '@/lib/db/query';
import ChapterList from './_components/chapter-list';
import { Metadata } from 'next';
import { unstable_cache } from 'next/cache';

export async function generateStaticParams() {
  const novels = await getNovelList();

  return novels.map((novel) => ({
    slug: novel.slug,
  }))
}

const getNovelCached = unstable_cache(getNovelBySlug, ["novel"], { tags:["novel"], revalidate: false });
const getChaptersCached = unstable_cache(getNovelChapters, ["chapters"], { tags:["chapters"], revalidate: 3600 });

export async function generateMetadata({ params }:{ params: { slug: string }}): Promise<Metadata> {
  const novel = await getNovelCached(params.slug);
  return {
    title: `${novel.title} | Quaslation`,
    description: shortifyString(novel.description.text, 512)
  }
}

export default async function NovelPage({ params }:{ params: { slug: string }}) {
  const novel = await getNovelCached(params.slug);
  const chapters = await getChaptersCached({ novelId: novel.id });

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
              <Link href={`${params.slug}/${chapters[0].slug}`}>Read Now</Link>
            </Button>
          </div>
          ):null}
        </div>
      </div>
      <article
        className={cn("my-4 prose dark:prose-invert", "max-w-none")}
        dangerouslySetInnerHTML={{ __html: novel.description.html }}
      />
      <Separator />
      <div className='mt-4'>
        <ChapterList novelId={novel.id} novelSlug={params.slug} data={chapters} />
      </div>
    </div>
  )
}
