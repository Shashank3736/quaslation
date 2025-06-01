import { getNovelFromId } from '@/lib/db/query';
import { notFound } from 'next/navigation';
import React from 'react'
import CreateVolumeForm from './create-volume-form';
import H2 from '@/components/typography/h2';

const CreateVolume = async({ params }:{ params: Promise<{ novelId: string }>}) => {
  const paramsResolved = await params;
  const novelId = parseInt(paramsResolved.novelId);
  if(isNaN(novelId)) notFound();
  const novel = await getNovelFromId(novelId);
  return (
    <div>
      <H2>Create Volume</H2>
      <CreateVolumeForm novel={novel} />
    </div>
  )
}

export default CreateVolume