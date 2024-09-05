"use server";

import { getLatestReleases } from "@/lib/prisma/query";

export const action = getLatestReleases;