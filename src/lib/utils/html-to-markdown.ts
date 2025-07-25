import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkStringify from 'remark-stringify';
import { Node } from 'unist';

/**
 * Converts HTML content to Markdown
 * @param html - HTML content to convert
 * @returns Markdown content
 */
export async function htmlToMarkdown(html: string): Promise<string> {
  try {
    const file = await unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeRemark)
      .use(remarkStringify)
      .process(html);

    return String(file);
  } catch (error) {
    console.error('HTML to Markdown conversion error:', error);
    throw new Error('Failed to convert HTML to Markdown');
  }
}

/**
 * Sanitizes HTML content by removing unsafe elements
 * @param html - HTML content to sanitize
 * @returns Sanitized HTML content
 */
export function sanitizeHtml(html: string): string {
  // Remove script and style tags
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove event handlers (on* attributes)
  sanitized = sanitized.replace(/on\w+="[^"]*"/gi, '');
  sanitized = sanitized.replace(/on\w+='[^']*'/gi, '');
  sanitized = sanitized.replace(/on\w+=[^\s>]+/gi, '');
  
  // Remove dangerous attributes
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  return sanitized;
}

/**
 * Truncates content to a maximum length while preserving HTML structure
 * @param content - Content to truncate
 * @param maxLength - Maximum length in characters
 * @returns Truncated content
 */
export function truncateContent(content: string, maxLength: number): string {
  if (content.length <= maxLength) {
    return content;
  }
  
  // Try to truncate at a natural break point
  const truncated = content.substring(0, maxLength);
  const lastParagraph = truncated.lastIndexOf('\n\n');
  const lastSentence = truncated.lastIndexOf('. ');
  
  // Use the later of the two break points, but not too close to the beginning
  let breakPoint = Math.max(lastParagraph, lastSentence);
  if (breakPoint < maxLength * 0.8) {
    breakPoint = maxLength;
  }
  
  return content.substring(0, breakPoint) + '...';
}