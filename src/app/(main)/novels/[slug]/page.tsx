import H2 from '@/components/typography/h2';
import Muted from '@/components/typography/muted';
import { Separator } from '@/components/ui/separator';
import { getNovel } from '@/lib/actions'
import { cn } from '@/lib/utils';
import VolumeChapters from './_components/volume';

export default async function NovelPage({ params }:{ params: { slug: string} }) {
  const novel = await getNovel(params.slug);
  return (
    <div className='p-4'>
      <H2 className='text-center'>{novel.novel.title}</H2>
      <p className='my-4'>{novel.novel.description}</p>
      <Separator />
      <div className='mt-4'>
        {novel.novel.volumes.map((volume) => (
          <div key={volume.id} className='mb-2'>
            <Muted className={cn({"hidden": (volume.number === -1)})}>Volume {volume.number}{volume.title ? `: ${volume.title}`:""}</Muted>
            <VolumeChapters volumeId={volume.id} />
          </div>
        ))}
      </div>
    </div>
  )
}
