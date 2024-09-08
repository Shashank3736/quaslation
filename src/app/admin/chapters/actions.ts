"use server";

import { freeChapters } from "@/lib/db/query";
import { revalidatePath } from "next/cache";

export const freeChapter = async (novelId: number, serial: number) => {
  console.log("Free chapter")
  await freeChapters({ novelId, first: serial, last: serial });
  revalidatePath(`/admin/chapters/${novelId}`)
}