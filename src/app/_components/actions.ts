"use server";

import { getLatestPosts } from "@/lib/hygraph/query";

export const action = getLatestPosts