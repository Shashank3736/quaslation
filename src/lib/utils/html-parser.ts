import * as cheerio from 'cheerio';

/**
 * Extracts metadata from HTML content
 * @param html HTML content string
 * @returns Object containing title and chapter number
 */
export function parseHtmlMetadata(html: string): {
  title: string | null;
  chapterNumber: number | null
} {
  const $ = cheerio.load(html);
  
  // Extract title from H1 or H2 tags
  let title: string | null = null;
  const h1 = $('h1').first();
  const h2 = $('h2').first();
  
  if (h1.length > 0) {
    title = sanitizeText(h1.text());
  } else if (h2.length > 0) {
    title = sanitizeText(h2.text());
  }
  
  // Extract chapter number using regex
  let chapterNumber: number | null = null;
  if (title) {
    const chapterRegex = /(chapter|ch\.?)\s*(\d+)/i;
    const match = title.match(chapterRegex);
    if (match && match[2]) {
      chapterNumber = parseInt(match[2], 10);
    }
  }
  
  return { title, chapterNumber };
}

/**
 * Sanitizes text by removing HTML tags and trimming whitespace
 * @param text Input text
 * @returns Sanitized text
 */
function sanitizeText(text: string | null): string | null {
  if (!text) return null;
  return text.replace(/<[^>]*>/g, '').trim();
}