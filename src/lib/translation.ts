import axios from 'axios';
import { remark } from 'remark';
import { visit } from 'unist-util-visit';
import type { Node } from 'unist';
import { htmlToMarkdown, sanitizeHtml, truncateContent } from './utils/html-to-markdown';

// Environment configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const API_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const MAX_RETRIES = parseInt(process.env.TRANSLATION_MAX_RETRIES || '3');
const SEGMENT_SIZE = 2000;

if (!OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY environment variable is not set');
}

interface TranslationResult {
  content: string;
  tokensUsed: number;
  sourceLanguage?: string;
}

/**
 * Extracts metadata from markdown content
 * @param markdown - The markdown content to analyze
 * @returns Object containing metadata
 */
export function extractMetadata(markdown: string): {
  title: string;
  characters: string[];
  terms: string[];
} {
  let title = '';
  const characters: string[] = [];
  const terms: string[] = [];
  const characterSet = new Set<string>();
  
  const tree = remark().parse(markdown);
  
  visit(tree, 'heading', (node: any) => {
    if (node.depth === 1 && !title && node.children?.[0]?.value) {
      title = node.children[0].value;
    }
  });
  
  // Simple heuristic for character names (proper nouns in all caps)
  visit(tree, 'text', (node: Node) => {
    // @ts-ignore
    const text = node.value as string;
    const words = text.split(/\s+/);
    
    words.forEach(word => {
      if (word.length > 2 && word === word.toUpperCase()) {
        characterSet.add(word);
      }
    });
  });
  
  return {
    title,
    characters: Array.from(characterSet),
    terms // Placeholder for actual term extraction
  };
}

/**
 * Splits content into segments while preserving HTML tags and structure
 * @param content - Markdown content to segment
 * @param maxLength - Maximum segment length in characters
 * @returns Array of content segments
 */
export function segmentContent(content: string, maxLength: number = SEGMENT_SIZE): string[] {
  const segments: string[] = [];
  let currentSegment = '';
  let inTag = false;
  let tagBuffer = '';

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    
    if (char === '<') {
      inTag = true;
      tagBuffer = char;
    } else if (char === '>' && inTag) {
      tagBuffer += char;
      currentSegment += tagBuffer;
      tagBuffer = '';
      inTag = false;
      
      // Check if we need to start a new segment
      if (currentSegment.length >= maxLength) {
        segments.push(currentSegment);
        currentSegment = '';
      }
    } else if (inTag) {
      tagBuffer += char;
    } else {
      currentSegment += char;
      
      // Natural break points (paragraphs, headings, etc.)
      if (char === '\n' && currentSegment.length >= maxLength * 0.8) {
        segments.push(currentSegment);
        currentSegment = '';
      }
    }
  }

  if (currentSegment) segments.push(currentSegment);
  return segments;
}

/**
 * Translates text using OpenRouter API
 * @param text - Text to translate
 * @param targetLang - Target language code (e.g., 'es', 'fr')
 * @param metadata - Contextual metadata for better translation
 * @param retries - Current retry count
 * @returns Translated text
 */
export async function translateSegment(
  text: string,
  targetLang: string,
  metadata: any = {},
  retries: number = 0
): Promise<TranslationResult> {
  try {
    const systemMessage = `You are a professional translator. Translate the following content to ${targetLang} while preserving:
- HTML tags and structure
- Code blocks and technical terms
- Character names: ${metadata.characters?.join(', ') || 'none'}
- Cultural context and nuance
- Special formatting and markdown`;

    const response = await axios.post(
      API_ENDPOINT,
      {
        model: 'openai/gpt-4',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: text }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    if (!response.data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from translation API');
    }

    return {
      content: response.data.choices[0].message.content,
      tokensUsed: response.data.usage?.total_tokens || 0
    };
  } catch (error) {
    console.error(`Translation error (attempt ${retries + 1}):`, error);
    
    // Check for specific error types
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      // Handle rate limiting
      if (message.includes('rate limit') || message.includes('429')) {
        // Wait longer for rate limit errors
        const delay = 5000 * Math.pow(2, retries);
        await new Promise(resolve => setTimeout(resolve, delay));
        if (retries < MAX_RETRIES) {
          return translateSegment(text, targetLang, metadata, retries + 1);
        }
      }
      
      // Handle network errors
      if (message.includes('network') || message.includes('timeout') || message.includes('econn')) {
        const delay = 2000 * Math.pow(2, retries);
        await new Promise(resolve => setTimeout(resolve, delay));
        if (retries < MAX_RETRIES) {
          return translateSegment(text, targetLang, metadata, retries + 1);
        }
      }
    }
    
    // Default retry logic
    if (retries < MAX_RETRIES) {
      // Exponential backoff
      const delay = 1000 * Math.pow(2, retries);
      await new Promise(resolve => setTimeout(resolve, delay));
      return translateSegment(text, targetLang, metadata, retries + 1);
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Translation failed after ${MAX_RETRIES} attempts: ${errorMessage}`);
  }
}

/**
 * Main translation function for chapter content
 * @param content - Chapter content in HTML or markdown format
 * @param targetLang - Target language code
 * @param sourceFormat - Source format ('html' or 'markdown')
 * @returns Translated markdown content
 */
export async function translateChapter(
  content: string,
  targetLang: string,
  sourceFormat: 'html' | 'markdown' = 'html'
): Promise<string> {
  try {
    // Convert HTML to Markdown if needed
    let markdownContent = content;
    if (sourceFormat === 'html') {
      // Sanitize HTML before conversion
      const sanitizedHtml = sanitizeHtml(content);
      markdownContent = await htmlToMarkdown(sanitizedHtml);
    }
    
    // Truncate content if too long (prevent API errors)
    const maxLength = 50000; // Adjust based on API limits
    const truncatedContent = truncateContent(markdownContent, maxLength);
    
    const metadata = extractMetadata(truncatedContent);
    const segments = segmentContent(truncatedContent);
    let translatedContent = '';
    let totalTokens = 0;

    for (const segment of segments) {
      const result = await translateSegment(segment, targetLang, metadata);
      translatedContent += result.content;
      totalTokens += result.tokensUsed;
    }

    console.log(`Translation completed. Tokens used: ${totalTokens}`);
    return translatedContent;
  } catch (error) {
    console.error('Translation pipeline error:', error);
    throw new Error(`Failed to translate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}