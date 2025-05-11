"use server"

import { fetchWebsite, translateChapterUsingGemini } from "./lib"

export async function translateChapterAI({ url }:{ url: string }) {
  const body = await fetchWebsite(url);
  const response = await translateChapterUsingGemini({ text: body, targetLang: 'English' });

  return response;
}