"use server";

import { freeChapters, getNovelLastChapter, publishChapters } from "@/lib/db/query";
import { revalidatePath, updateTag } from "next/cache";
import { postChapterDiscord } from "./server";

export const freeChapter = async (novelId: number, serial: number, novelSlug: string) => {
  const data = await freeChapters({ novelId, first: serial, last: serial });
  revalidatePath(`/admin/chapters/${novelId}`);
  updateTag("chapter");
  updateTag("chapter:update");
  updateTag("chapter:update:free");
  updateTag(`novel:update:${novelSlug}`);
  for (const { slug } of data) {
    await postChapterDiscord(slug);
    updateTag(`chapter:update:${slug}`);
  }
}

export const publish = async ({ novelId, serial, novelSlug }:{ novelId: number, serial: number, novelSlug: string }) => {
  const previousChapter = await getNovelLastChapter(novelId);
  const data = await publishChapters({ novelId, serial });
  revalidatePath(`/admin/chapters/${novelId}`);
  updateTag("chapter");
  updateTag("chapter:update");
  updateTag("chapter:update:publish");
  updateTag(`novel:update:${novelSlug}`)

  for (const { slug } of data) {
    updateTag(`chapter:update:${slug}`)
  }

  if(previousChapter) {
    updateTag(`chapter:update:${previousChapter.slug}`);
  }
};

export async function revalidate(slug: string) {
  return updateTag(`chapter:update:${slug}`);
}