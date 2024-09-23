"use server";

import { freeChapters, getNovelLastChapter, publishChapters } from "@/lib/db/query";
import { revalidatePath, revalidateTag } from "next/cache";

export const freeChapter = async (novelId: number, serial: number, novelSlug: string) => {
  const data = await freeChapters({ novelId, first: serial, last: serial });
  revalidatePath(`/admin/chapters/${novelId}`);
  revalidateTag("chapter");
  revalidateTag("chapter:update");
  revalidateTag("chapter:update:free");
  revalidateTag(`novel:update:${novelSlug}`);
  for (const { slug } of data) {
    revalidateTag(`chapter:update:${slug}`);
  }
}

export const publish = async ({ novelId, serial, novelSlug }:{ novelId: number, serial: number, novelSlug: string }) => {
  const data = await publishChapters({ novelId, serial });
  const previousChapter = await getNovelLastChapter(novelId);
  revalidatePath(`/admin/chapters/${novelId}`);
  revalidateTag("chapter");
  revalidateTag("chapter:update");
  revalidateTag("chapter:update:publish");
  revalidateTag(`novel:update:${novelSlug}`)

  for (const { slug } of data) {
    revalidateTag(`chapter:update:${slug}`)
  }

  if(previousChapter) {
    revalidateTag(`chapter:update:${previousChapter.slug}`);
  }
};