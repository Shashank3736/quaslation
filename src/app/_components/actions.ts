"use server";

import { getReleases } from "@/lib/db/query";
import { unstable_cache } from "next/cache";

export const action = async ({ skip, premium }:{ skip?: number, premium: boolean }) => {
  const cache =  unstable_cache(getReleases, [], {
    revalidate: 12*3600,
    tags: [`chapter:update:${premium ? "publish":"free"}`]
  });

  return cache({ skip, premium })
}