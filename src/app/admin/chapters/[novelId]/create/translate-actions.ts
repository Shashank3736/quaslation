"use server"

import { TranslationRequestSchema } from "@/lib/types/translation"
import { parseHtmlMetadata } from "@/lib/utils/html-parser"
import { translateChapter } from "@/lib/translation"

// Define the return type for our translation action
export type TranslationActionResult = {
  success: boolean;
  translatedContent?: string;
  metadata?: {
    title: string | null;
    number: number | null;
  };
  error?: string | { [key: string]: string[] };
};

// Translation server action
export async function translateHtmlContent(
  prevState: TranslationActionResult,
  formData: FormData
): Promise<TranslationActionResult> {
  try {
    // Extract data from form
    const html = formData.get('html') as string
    const targetLanguage = formData.get('targetLanguage') as string || 'en'
    
    // Validate input
    const validation = TranslationRequestSchema.safeParse({
      html,
      targetLanguage
    })
    
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.flatten().fieldErrors
      }
    }
    
    const { html: validatedHtml, targetLanguage: validatedTargetLanguage } = validation.data
    
    // Translate HTML to Markdown using our pipeline
    const { translatedContent, metadata } = await translateChapter(validatedHtml, validatedTargetLanguage, 'html')
    
    // Prepare response with metadata
    let numberValue: number | null = null;
    if (metadata.chapterNumber) {
      const num = parseInt(metadata.chapterNumber);
      if (!isNaN(num)) {
        numberValue = num;
      }
    }

    return {
      success: true,
      translatedContent,
      metadata: {
        title: metadata.title,
        number: numberValue
      }
    }
  } catch (error) {
    console.error("Translation error:", error)
    
    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      if (message.includes('rate limit') || message.includes('too many')) {
        return {
          success: false,
          error: "OpenRouter API rate limit exceeded. Please try again later."
        }
      }
      return {
        success: false,
        error: error.message
      }
    }
    
    return {
      success: false,
      error: "An unexpected error occurred during translation."
    }
  }
}