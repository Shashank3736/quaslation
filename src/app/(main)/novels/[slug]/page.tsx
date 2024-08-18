import H2 from '@/components/typography/h2';
import { Separator } from '@/components/ui/separator';
import { getNovel } from '@/lib/actions'
import VolumeChapters from './_components/volume';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

export default async function NovelPage({ params }:{ params: { slug: string} }) {
  const novel = await getNovel(params.slug);
  return (
    <div className='p-4'>
      <H2 className='text-center'>{novel.novel.title}</H2>
      <article className={cn("my-4 prose dark:prose-invert", "max-w-none")} dangerouslySetInnerHTML={{ __html: novel.novel.fullDescription.html }} />
      <Separator />
      <div className='mt-4'>
        {novel.novel.volumes.map((volume) => (
          <Accordion type='single' collapsible key={volume.id} className='mb-2 rounded-lg border bg-background shadow-sm p-4'>
            {/* <Muted className={cn({"hidden": (volume.number === -1)})}>Volume {volume.number}{volume.title ? `: ${volume.title}`:""}</Muted> */}
            {volume.number === -1 ? (
            <VolumeChapters volumeId={volume.id} />
            ):(
              <AccordionItem value={`volume${volume.number}`} className='border-0'>
                <AccordionTrigger className="flex items-center justify-between gap-4 px-6 py-4">
                  <h3 className="text-lg font-medium">Volume {volume.number}{volume.title ? `: ${volume.title}`:""}</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <VolumeChapters volumeId={volume.id} />
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        ))}
      </div>
    </div>
  )
}
