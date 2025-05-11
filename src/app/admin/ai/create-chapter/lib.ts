"server only"

import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function fetchWebsite(url: string) {
  if (!url) {
    throw new Error("URL is required");
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  const text = await response.text();
  const bodyRegex = /<body[^>]*>([\s\S]*)<\/body>/i;
  const match = text.match(bodyRegex);
  if (!match) {
    throw new Error("Could not find body tag");
  }
  return match[1];
}

export type TranslateChapterUsingGeminiReturnType = {
  next_chapter: string;
  chapter_title: string;
  chapter_content: string;
}

export async function translateChapterUsingGemini({ text, targetLang }:{ text: string, targetLang: string }):Promise<TranslateChapterUsingGeminiReturnType> {
  if (!text) {
    throw new Error("Text is required");
  }
  
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `I will provide you html body you have to do these stuff. you have to return 3 stuff in json format.

      1. "next_chapter": Next chapter url parameter

      2. "chapter_title": Chapter title translated in ${targetLang}

      3. "chapter_content": Chapter content translated in ${targetLang}
      
      HTML Body: ${text}`
  });

  const json = response.text?.slice(3, -3) || '';
  try {
    const data = JSON.parse(json);
    return data;
  } catch (error) {
    console.error(error);
    console.log(json)
    throw new Error("Something went wrong while parsing the json.")
  }
}