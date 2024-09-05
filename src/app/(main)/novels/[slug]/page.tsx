import H2 from '@/components/typography/h2';
import { Separator } from '@/components/ui/separator';
import { VolumeChapters } from './_components/volume';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LockIcon } from 'lucide-react';
import { getNovel } from '@/lib/prisma/query';

export default async function NovelPage({ params }:{ params: { slug: string} }) {
  const { novel, first, last } = await getNovel(params.slug);

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
            {first ? (
            <Button title={first.volume.number > -1 ? `Volume ${first.volume.number} Chapter ${first.number}` : `Chapter ${first.number}`} asChild>
              <Link href={`${params.slug}/${first.slug}`}>
                {first.premium ? (<LockIcon className='mr-2 h-4 w-4' />):""} Read First
              </Link>
            </Button>
            ):null}
            {last ? (
            <Button title={last.volume.number > -1 ? `Volume ${last.volume.number} Chapter ${last.number}` : `Chapter ${last.number}`} variant={"secondary"} asChild>
              <Link href={`${params.slug}/${last.slug}`}>
                {last.premium ? (<LockIcon className='mr-2 h-4 w-4' />):""} Read Last
              </Link>
            </Button>            
            ):null}
          </div>
        </div>
      </div>
      <article
        className={cn("my-4 prose dark:prose-invert", "max-w-none")}
        dangerouslySetInnerHTML={{ __html: novel.description.html }}
      />
      <Separator />
      <div className='mt-4'>
        {novel.Volume.map((volume) => (
          <Accordion type='single' collapsible key={volume.id} className='mb-2 rounded-lg border bg-background shadow-sm p-4'>
            {volume.number === -1 ? (
            <VolumeChapters id={volume.id} />
            ):(
              <AccordionItem value={`volume${volume.number}`} className='border-0'>
                <AccordionTrigger className="flex items-center justify-between gap-4 px-6 py-4">
                  <h3 className="text-lg font-medium">Volume {volume.number}{volume.title ? `: ${volume.title}`:""}</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <VolumeChapters id={volume.id} />
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        ))}
      </div>
    </div>
  )
}
