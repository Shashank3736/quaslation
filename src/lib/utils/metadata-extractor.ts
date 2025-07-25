import * as cheerio from 'cheerio';
import axios from 'axios';

// Environment configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4-turbo';
const API_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Enhanced metadata extraction with edge case handling
 */
export interface ChapterMetadata {
  title: string | null;
  chapterNumber: string | null;
  confidence: number;
  source: 'ai' | 'parser' | 'fallback';
}

/**
 * Extracts metadata from HTML content using AI with enhanced edge case handling
 */
export async function extractMetadataWithAI(
  html: string,
  options: { maxTitleLength?: number } = {}
): Promise<ChapterMetadata> {
  const { maxTitleLength = 200 } = options;
  
  try {
    // Create a more robust prompt for the AI
    const prompt = `Extract the chapter title and chapter number from the following HTML content. 
Handle these edge cases:
- Multiple title candidates: choose the most prominent/main one
- Non-numeric chapter numbers: return as-is (e.g., "Prologue", "Epilogue", "1.5")
- Long titles: truncate intelligently at sentence boundaries
- Missing data: return null for missing fields
- Partial matches: extract whatever is available

Respond ONLY with a JSON object in this exact format:
{
  "title": "string or null (max ${maxTitleLength} chars)",
  "chapterNumber": "string or null",
  "confidence": 0.0-1.0
}

HTML content:
${html.substring(0, 3000)}`; // Increased limit for better context

    const response = await axios.post(
      API_ENDPOINT,
      {
        model: OPENROUTER_MODEL,
        messages: [
          { 
            role: 'system', 
            content: 'You are a metadata extraction specialist. Extract chapter titles and numbers accurately, handling edge cases gracefully.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1 // Very low for consistency
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
      throw new Error('Invalid response from AI API');
    }

    // Extract JSON from the response
    const content = response.data.choices[0].message.content;
    const jsonMatch = content.match(/\{[^}]*\}/);
    
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }

    const metadata = JSON.parse(jsonMatch[0]);
    
    // Validate and sanitize the response
    const result: ChapterMetadata = {
      title: validateAndSanitizeTitle(metadata.title, maxTitleLength),
      chapterNumber: validateAndSanitizeChapterNumber(metadata.chapterNumber),
      confidence: Math.max(0, Math.min(1, parseFloat(metadata.confidence) || 0.8)),
      source: 'ai'
    };

    return result;
  } catch (error) {
    console.warn('AI metadata extraction failed:', error);
    throw error; // Let caller handle fallback
  }
}

/**
 * Enhanced HTML parser with better edge case handling
 */
export function parseHtmlMetadataEnhanced(
  html: string,
  options: { maxTitleLength?: number } = {}
): ChapterMetadata {
  const { maxTitleLength = 200 } = options;
  const $ = cheerio.load(html);
  
  // Extract title with multiple fallback strategies
  let title: string | null = null;
  let confidence = 0.0;
  
  // Strategy 1: Look for h1 tags
  const h1 = $('h1').first();
  if (h1.length > 0) {
    title = sanitizeText(h1.text());
    confidence = 0.9;
  }
  
  // Strategy 2: Look for h2 tags if no h1
  if (!title) {
    const h2 = $('h2').first();
    if (h2.length > 0) {
      title = sanitizeText(h2.text());
      confidence = 0.7;
    }
  }
  
  // Strategy 3: Look for title tag
  if (!title) {
    const titleTag = $('title').first();
    if (titleTag.length > 0) {
      title = sanitizeText(titleTag.text());
      confidence = 0.5;
    }
  }
  
  // Strategy 4: Look for any heading-like structure
  if (!title) {
    const headings = $('h1, h2, h3, h4, h5, h6');
    if (headings.length > 0) {
      title = sanitizeText(headings.first().text());
      confidence = 0.3;
    }
  }
  
  // Extract chapter number with enhanced regex
  let chapterNumber: string | null = null;
  if (title) {
    // Multiple patterns for chapter number extraction
    const patterns = [
      /(?:chapter|ch\.?)\s*([0-9]+(?:\.[0-9]+)?)/i,  // "Chapter 1", "Ch. 2.5"
      /(?:第\s*)?([0-9]+(?:\.[0-9]+)?)\s*(?:章|话|话)/,  // Chinese/Japanese
      /(?:episode|ep\.?)\s*([0-9]+(?:\.[0-9]+)?)/i,  // "Episode 1"
      /(?:part|pt\.?)\s*([0-9]+(?:\.[0-9]+)?)/i,  // "Part 1"
      /(?:vol\.?|volume)\s*([0-9]+(?:\.[0-9]+)?)/i,  // "Volume 1"
      /^(?:prologue|epilogue|interlude|afterword|preface)$/i  // Special chapters
    ];
    
    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match) {
        chapterNumber = match[1] || match[0];
        break;
      }
    }
  }
  
  // If no chapter number found in title, search in content
  if (!chapterNumber) {
    const contentText = $('body').text();
    const chapterPatterns = [
      /(?:chapter|ch\.?)\s*([0-9]+(?:\.[0-9]+)?)/i,
      /(?:第\s*)?([0-9]+(?:\.[0-9]+)?)\s*(?:章|话)/,
    ];
    
    for (const pattern of chapterPatterns) {
      const match = contentText.match(pattern);
      if (match) {
        chapterNumber = match[1] || match[0];
        confidence = Math.max(confidence, 0.4);
        break;
      }
    }
  }
  
  return {
    title: validateAndSanitizeTitle(title, maxTitleLength),
    chapterNumber: validateAndSanitizeChapterNumber(chapterNumber),
    confidence,
    source: 'parser'
  };
}

/**
 * Validates and sanitizes title text
 */
function validateAndSanitizeTitle(title: any, maxLength: number): string | null {
  if (!title || typeof title !== 'string') {
    return null;
  }
  
  let sanitized = title
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  if (!sanitized || sanitized.length === 0) {
    return null;
  }
  
  // Intelligent truncation
  if (sanitized.length > maxLength) {
    // Try to truncate at sentence boundary
    const sentenceEnd = sanitized.lastIndexOf('.', maxLength);
    if (sentenceEnd > maxLength * 0.7) {
      sanitized = sanitized.substring(0, sentenceEnd + 1);
    } else {
      // Truncate at word boundary
      const lastSpace = sanitized.lastIndexOf(' ', maxLength);
      if (lastSpace > maxLength * 0.8) {
        sanitized = sanitized.substring(0, lastSpace) + '...';
      } else {
        sanitized = sanitized.substring(0, maxLength - 3) + '...';
      }
    }
  }
  
  return sanitized;
}

/**
 * Validates and sanitizes chapter number
 */
function validateAndSanitizeChapterNumber(chapterNumber: any): string | null {
  if (!chapterNumber) {
    return null;
  }
  
  if (typeof chapterNumber === 'number') {
    return String(chapterNumber);
  }
  
  if (typeof chapterNumber === 'string') {
    const sanitized = chapterNumber.trim();
    
    // Check for valid formats
    const validPatterns = [
      /^\d+$/,                    // "123"
      /^\d+\.\d+$/,              // "1.5"
      /^\d+[a-zA-Z]?$/,          // "1a", "2b"
      /^(prologue|epilogue|interlude|afterword|preface)$/i  // Special chapters
    ];
    
    for (const pattern of validPatterns) {
      if (pattern.test(sanitized)) {
        return sanitized;
      }
    }
  }
  
  return null;
}

/**
 * Sanitizes text by removing HTML tags and trimming whitespace
 */
function sanitizeText(text: string | null): string | null {
  if (!text) return null;
  return text.replace(/<[^>]*>/g, '').trim();
}

/**
 * Combines AI and parser results with fallback logic
 */
export async function extractChapterMetadata(
  html: string,
  options: { 
    maxTitleLength?: number;
    minConfidence?: number;
    preferAI?: boolean;
  } = {}
): Promise<ChapterMetadata> {
  const { 
    maxTitleLength = 200, 
    minConfidence = 0.3,
    preferAI = true 
  } = options;

  let result: ChapterMetadata;

  if (preferAI) {
    try {
      result = await extractMetadataWithAI(html, { maxTitleLength });
      if (result.confidence >= minConfidence) {
        return result;
      }
    } catch (error) {
      console.warn('AI extraction failed, falling back to parser:', error);
    }
  }

  // Use parser as fallback
  result = parseHtmlMetadataEnhanced(html, { maxTitleLength });
  
  // If parser confidence is too low, use basic fallback
  if (result.confidence < minConfidence) {
    const basic = parseHtmlMetadataEnhanced(html, { maxTitleLength });
    if (basic.title || basic.chapterNumber) {
      return basic;
    }
    
    // Ultimate fallback
    return {
      title: 'Untitled Chapter',
      chapterNumber: null,
      confidence: 0.0,
      source: 'fallback'
    };
  }

  return result;
}