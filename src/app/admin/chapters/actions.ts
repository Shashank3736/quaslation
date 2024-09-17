"use server";

import { freeChapters, publishChapters } from "@/lib/db/query";
import { revalidatePath, revalidateTag } from "next/cache";

export const freeChapter = async (novelId: number, serial: number) => {
  await freeChapters({ novelId, first: serial, last: serial });
  revalidatePath(`/admin/chapters/${novelId}`);
  revalidateTag("chapter");
  revalidateTag("chapters");
  revalidateTag("chapter_update");
  revalidateTag("chapter_free");
}

export const publish = async ({ novelId, serial }:{ novelId: number, serial: number}) => {
  await publishChapters({ novelId, serial });
  revalidatePath(`/admin/chapters/${novelId}`);
  revalidateTag("chapter");
  revalidateTag("chapters");
  revalidateTag("chapter_update");
};