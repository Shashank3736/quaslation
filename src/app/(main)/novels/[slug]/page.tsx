import H2 from '@/components/typography/h2';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getNovelBySlug, getNovelChapters, getNovelList } from '@/lib/db/query';
import ChapterList from './_components/chapter-list';

export async function generateStaticParams() {
  const novels = await getNovelList();

  return novels.map((novel) => ({
    slug: novel.slug,
  }))
}

export const revalidate = 30*60;
export const dynamicParams = true;

export default async function NovelPage({ params }:{ params: { slug: string }}) {
  const novel = await getNovelBySlug(params.slug);
  const chapters = await getNovelChapters({ novelId: novel.id });

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
          <div className='flex space-x-4 mt-8'>
            <Button asChild>
              <Link href={`/_series/${novel.id}/0`}>Read First</Link>
            </Button>
            <Button variant={"secondary"} asChild>
              <Link href={`/_series/${novel.id}/-1`}>Read Last</Link>
            </Button>
          </div>
        </div>
      </div>
      <article
        className={cn("my-4 prose dark:prose-invert", "max-w-none")}
        dangerouslySetInnerHTML={{ __html: novel.description }}
      />
      <Separator />
      <div className='mt-4'>
        <ChapterList novelId={novel.id} novelSlug={params.slug} data={chapters} />
      </div>
    </div>
  )
}
