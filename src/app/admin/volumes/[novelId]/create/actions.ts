"use server";

import { db } from "@/lib/db";
import { volume as volumeTable } from "@/lib/db/schema";

export const createVolume = async ({ novelId, number, title }:{ novelId: number, number: number, title?: string}) => {
  try {
    await db.insert(volumeTable).values({
      novelId,
      number,
      title,
    })
  } catch (error) {
    throw new Error("Something went wrong while creating the volume.")
  }
}