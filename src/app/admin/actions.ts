"use server"

import { getPremiumChaptersByNovel } from "@/lib/hygraph/query"

export const action = getPremiumChaptersByNovel