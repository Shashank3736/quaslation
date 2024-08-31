import H2 from '@/components/typography/h2';
import { Separator } from '@/components/ui/separator';
import { getNovel } from '@/lib/hygraph/query'
import VolumeChapters from './_components/volume';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LockIcon } from 'lucide-react';

export default async function NovelPage({ params }:{ params: { slug: string} }) {
  const novel = await getNovel(params.slug);
  const firstVolume = novel.volumes.at(0)
  const firstChapter = firstVolume?.chapters.at(0)
  const lastVolume = novel.volumes.at(-1)
  const lastChapter = lastVolume?.chapters.at(-1)

  return (
    <div className='p-4'>
      <div className='flex p-4 items-center'>
        <div className='hidden md:block'>
          <Image
            alt='thumbnail'
            src={novel.thumbnail?.url ?? "/dummy/NoImageFound_light_400x600.png"}
            className='rounded-xl hover:rounded object-cover max-w-[200px] h-auto'
            width={400}
            height={600}
          />
        </div>
        <div className='p-4'>
          <H2 className='text-center'>{novel.title}</H2>
          <div className='flex space-x-4 mt-8'>
            {firstVolume && firstChapter ? (
            <Button title={firstVolume.number > -1 ? `Volume ${firstVolume.number} Chapter ${firstChapter.chapter}` : `Chapter ${firstChapter.chapter}`} asChild>
              <Link href={`${params.slug}/${firstChapter.slug}`}>
                {firstChapter.premium ? (<LockIcon className='mr-2 h-4 w-4' />):""} Read First
              </Link>
            </Button>
            ):null}
            {lastVolume && lastChapter ? (
            <Button title={lastVolume.number > -1 ? `Volume ${lastVolume.number} Chapter ${lastChapter.chapter}` : `Chapter ${lastChapter.chapter}`} variant={"secondary"} asChild>
              <Link href={`${params.slug}/${lastChapter.slug}`}>
                {lastChapter.premium ? (<LockIcon className='mr-2 h-4 w-4' />):""} Read Last
              </Link>
            </Button>            
            ):null}
          </div>
        </div>
      </div>
      <article
        className={cn("my-4 prose dark:prose-invert", "max-w-none")}
        dangerouslySetInnerHTML={{ __html: novel.fullDescription.html }}
      />
      <Separator />
      <div className='mt-4'>
        {novel.volumes.map((volume) => (
          <Accordion type='single' collapsible key={volume.id} className='mb-2 rounded-lg border bg-background shadow-sm p-4'>
            {volume.number === -1 ? (
            <VolumeChapters data={volume} />
            ):(
              <AccordionItem value={`volume${volume.number}`} className='border-0'>
                <AccordionTrigger className="flex items-center justify-between gap-4 px-6 py-4">
                  <h3 className="text-lg font-medium">Volume {volume.number}{volume.title ? `: ${volume.title}`:""}</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <VolumeChapters data={volume} />
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        ))}
      </div>
    </div>
  )
}
