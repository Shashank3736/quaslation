"use server"

import { Client } from "@gradio/client"

export async function translateText(text: string, sourceLanguageName: string, targetLanguageName: string) {
  try {
    if (!text.trim()) {
      throw new Error("Text is required")
    }

    if (sourceLanguageName === targetLanguageName) {
      throw new Error("Source and target languages must be different")
    }

    // Connect to Gradio translation API
    const client = await Client.connect(process.env.GRADIO_API_URL!);
    const result = await client.predict("/translate_text", {
      text,
      source_lang: sourceLanguageName,
      target_lang: targetLanguageName,
    });

    if (!result?.data || (result.data as string[]).length === 0) {
      throw new Error("Translation returned no data");
    }

    const translatedText = (result.data as string[]).map(str => str.trim()).join("");

    return {
      success: true,
      translatedText,
      sourceLanguage: sourceLanguageName,
      targetLanguage: targetLanguageName,
    }
  } catch (error) {
    throw new Error("Translation failed")
  }
}
