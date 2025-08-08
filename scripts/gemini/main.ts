import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';
import { novel16, ChapterConfig, VolumeConfig } from './data';
import { ProgressTracker, ProgressData } from './progress';


// Load environment variables
dotenv.config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface TranslationResult {
  chapterNumber: string | number;
  chapterTitle: string;
  chapterContent: string;
  originalLanguage?: string;
}

interface CLIArgs {
  novelId: number;
  volume?: number | 'all';
  concurrency: number;
  delayMs: number;
  resume: boolean;
  cleanup: boolean;
  outputDir: string;
  maxRetries: number;
}

function parseArgs(argv: string[]): CLIArgs {
  const args: any = {
    novelId: 16, // Default novel ID
    volume: undefined,
    concurrency: 1,
    delayMs: 1000,
    resume: false,
    cleanup: false,
    outputDir: './scripts/output/gemini',
    maxRetries: 3
  };

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--novel-id') args.novelId = parseInt(argv[++i], 10);
    else if (a === '--volume') {
      const vol = argv[++i];
      args.volume = vol === 'all' ? 'all' : parseInt(vol, 10);
    }
    else if (a === '--concurrency') args.concurrency = parseInt(argv[++i], 10);
    else if (a === '--delayMs') args.delayMs = parseInt(argv[++i], 10);
    else if (a === '--resume') args.resume = true;
    else if (a === '--cleanup') args.cleanup = true;
    else if (a === '--output-dir') args.outputDir = argv[++i];
    else if (a === '--max-retries') args.maxRetries = parseInt(argv[++i], 10);
  }

  return args as CLIArgs;
}

async function fetchAndTranslate(
  url: string,
  maxRetries: number,
  serial: number,
  chapter: number = 0,
  progressTracker: ProgressTracker,
  progress: ProgressData,
  args: CLIArgs
): Promise<void> {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      console.log(`Attempt ${attempt + 1}: Fetching HTML from: ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch HTML: ${response.statusText}`);
      }
      const html = await response.text();
      console.log('Successfully fetched HTML.');

      // Clean HTML content to reduce token usage
      const cleanedHtml = cleanHtmlContent(html);

      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-pro',
        generationConfig: {
          temperature: 0.3,
        }
      });

      const prompt = createTranslationPrompt(cleanedHtml);

      console.log('Sending content to Gemini for translation...');
      const result = await model.generateContent(prompt);
      const geminiResponse = await result.response;
      const text = geminiResponse.text();
      console.log('Received response from Gemini.');

      // Parse and validate the response
      const parsedResult = parseAndValidateResponse(text, chapter);

      // Create markdown file
      const filePath = await createMarkdownFile(parsedResult, serial, progress, args);
      console.log('Translation completed successfully!');

      // Update progress
      const updatedProgress = await progressTracker.markAsCompleted(
        progress,
        url,
        parsedResult.chapterNumber as number,
        filePath
      );
      await progressTracker.save(updatedProgress);

      return; // Success - exit retry loop

    } catch (error) {
      attempt++;
      console.error(`Attempt ${attempt} failed:`, error);

      if (attempt >= maxRetries) {
        console.error(`All ${maxRetries} attempts failed. Marking as failed.`);
        const updatedProgress = await progressTracker.markAsFailed(
          progress,
          url,
          error instanceof Error ? error.message : 'Unknown error'
        );
        await progressTracker.save(updatedProgress);
        throw error;
      }

      // Wait before retrying (exponential backoff)
      const waitTime = Math.pow(2, attempt) * 1000;
      console.log(`Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

function cleanHtmlContent(html: string): string {
  // Remove script tags, style tags, and comments
  let cleaned = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // If still too long, try to extract main content area
  if (cleaned.length > 50000) {
    // Look for common content containers
    const contentSelectors = [
      /<main[^>]*>[\s\S]*?<\/main>/i,
      /<article[^>]*>[\s\S]*?<\/article>/i,
      /<div[^>]*class="[^"]*content[^"]*"[^>]*>[\s\S]*?<\/div>/i,
      /<div[^>]*class="[^"]*chapter[^"]*"[^>]*>[\s\S]*?<\/div>/i
    ];

    for (const selector of contentSelectors) {
      const match = cleaned.match(selector);
      if (match) {
        cleaned = match[0];
        break;
      }
    }
  }

  return cleaned;
}

function createTranslationPrompt(html: string): string {
  return `You are a professional translator specializing in web novels. Your task is to extract and translate content from the provided HTML.

CRITICAL REQUIREMENTS:
1. **TRANSLATE EVERYTHING TO ENGLISH** - Every single word, phrase, and sentence must be in English
2. **NO UNTRANSLATED TEXT** - Do not leave any Japanese, Chinese, Korean, or other non-English text
3. **Translate terms in context** - Even specialized terms should be translated or explained in English
4. **Detect the source language** (Japanese, Chinese, Korean, etc.)
5. **Preserve formatting** including line breaks, dialogue markers, and paragraph structure
6. **Maintain literary quality** - use natural, engaging English prose
7. **Keep character names consistent** throughout the translation

TRANSLATION RULES:
- ALL content must be in English - no exceptions
- Specialized terms like "看板息子" should be translated (e.g., "poster boy" or "flagship son")
- Japanese honorifics (-san, -kun, -chan) can be kept but should be explained in context
- Sound effects should be adapted to English equivalents
- Cultural references should be translated with brief explanations if needed

INSTRUCTIONS:
- Extract the chapter number (if present)
- Extract and translate the chapter title to English
- Extract and translate ALL chapter content to English
- Convert Japanese quotation marks (「」, 『』) to English quotation marks ("")
- Maintain paragraph breaks and narrative flow
- If no clear chapter number exists, use "unknown"

EXAMPLE TRANSLATIONS:
- 看板息子 → "poster boy" or "flagship son"
- お疲れ様 → "good work" or "thank you for your hard work"
- いらっしゃいませ → "welcome" or "may I help you"

Return your response in this EXACT JSON format - ensure ALL content is in English:
{
  "chapterNumber": "number or 'unknown'",
  "chapterTitle": "English translation of title",
  "chapterContent": "Complete English translation of all chapter content - NO UNTRANSLATED TEXT - NO HTML TAGS - NO AUTHOR's NOTE ONLY CHAPTER CONTENT",
  "originalLanguage": "detected language (e.g., Japanese, Chinese, Korean)"
}

HTML Content:
${html}`;
}

function parseAndValidateResponse(text: string, chapter: number): TranslationResult {
  try {
    // Clean the response text
    let cleanedText = text.trim();

    // Remove code block markers
    cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // Try to find JSON content if there's extra text
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedText = jsonMatch[0];
    }

    const parsed = JSON.parse(cleanedText);

    // Validate required fields
    if (!parsed.chapterTitle || !parsed.chapterContent) {
      throw new Error('Missing required fields: chapterTitle or chapterContent');
    }

    // Check if content appears to be translated (basic heuristic)
    if (isContentNotTranslated(parsed.chapterContent, parsed.originalLanguage)) {
      throw new Error('Content appears to not be translated to English');
    }

    return {
      chapterNumber: parsed.chapterNumber || chapter,
      chapterTitle: parsed.chapterTitle,
      chapterContent: parsed.chapterContent,
      originalLanguage: parsed.originalLanguage
    };
  } catch (error) {
    console.log(text)
    console.error('Failed to parse response:', text);
    throw new Error(`Response parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function isContentNotTranslated(content: string, originalLanguage?: string): boolean {
  // Basic heuristics to check if content is translated
  const totalChars = content.length;
  if (totalChars === 0) return true;

  // Count non-ASCII characters (likely indicates untranslated Asian text)
  const nonAsciiChars = (content.match(/[^\x00-\x7F]/g) || []).length;
  const nonAsciiRatio = nonAsciiChars / totalChars;

  // More lenient threshold - allow up to 5% non-ASCII characters
  // This accounts for occasional untranslated terms or proper nouns
  if (nonAsciiRatio > 0.05) {
    console.warn(`High non-ASCII character ratio: ${(nonAsciiRatio * 100).toFixed(1)}%`);
    return true;
  }

  // Check for large blocks of untranslated text (more than 10 consecutive CJK characters)
  const largeCJKBlocks = content.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uAC00-\uD7AF]{10,}/g);
  if (largeCJKBlocks && largeCJKBlocks.length > 0) {
    console.warn('Found large untranslated CJK blocks:', largeCJKBlocks);
    return true;
  }

  // Count sentences that are predominantly in Asian languages
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 5);
  let untranslatedSentences = 0;

  for (const sentence of sentences) {
    const asianChars = (sentence.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uAC00-\uD7AF]/g) || []).length;
    const sentenceLength = sentence.trim().length;

    // If more than 50% of a sentence is Asian characters, consider it untranslated
    if (sentenceLength > 0 && (asianChars / sentenceLength) > 0.5) {
      untranslatedSentences++;
    }
  }

  // If more than 30% of sentences are untranslated, reject the content
  const untranslatedRatio = sentences.length > 0 ? untranslatedSentences / sentences.length : 0;
  if (untranslatedRatio > 0.3) {
    console.warn(`High untranslated sentence ratio: ${(untranslatedRatio * 100).toFixed(1)}%`);
    return true;
  }

  return false;
}

async function createMarkdownFile(result: TranslationResult, serial: number, progress: ProgressData, args: CLIArgs): Promise<string> {
  const markdownContent = `---
chapter: ${result.chapterNumber}
serial: ${serial}
title: ${result.chapterTitle}
novel: ${progress.novelId}
volume: ${progress.volumeNumber}
originalLanguage: ${result.originalLanguage || 'unknown'}
translatedAt: ${new Date().toISOString()}
---

${result.chapterContent}
`;

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const fileName = `chapter_${result.chapterNumber}_${year}${month}${day}_${hours}${minutes}${seconds}.md`;

  const outputDir = path.resolve(args.outputDir, `novel-${progress.novelId}`, `volume-${progress.volumeNumber}`);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filePath = path.resolve(outputDir, fileName);
  await fsPromises.writeFile(filePath, markdownContent, 'utf8');
  console.log(`Successfully created markdown file at: ${filePath}`);

  return filePath;
}

async function processVolume(
  volumeConfig: VolumeConfig,
  args: CLIArgs,
  progressTracker: ProgressTracker
): Promise<void> {
  console.log(`\n📚 Processing Volume ${volumeConfig.volumeNumber}: ${volumeConfig.volumeTitle}`);
  console.log(`📖 ${volumeConfig.chapters.length} chapters to process`);

  let progress: ProgressData;
  let urlsToProcess: string[];

  if (args.resume) {
    const result = await progressTracker.resumeFromProgress(
      args.novelId,
      volumeConfig.volumeNumber,
      volumeConfig.chapters.map((ch: ChapterConfig) => ch.link)
    );
    progress = result.progress;
    urlsToProcess = result.urlsToProcess;
    console.log(`📊 Progress summary: ${progressTracker.getProgressSummary(progress).completed}/${progressTracker.getProgressSummary(progress).total} chapters completed`);
  } else {
    progress = await progressTracker.initialize();
    progress.novelId = args.novelId;
    progress.volumeNumber = volumeConfig.volumeNumber;
    urlsToProcess = volumeConfig.chapters.map((ch: ChapterConfig) => ch.link);
    await progressTracker.save(progress);
  }

  if (urlsToProcess.length === 0) {
    console.log('✅ All chapters already completed or no chapters to process');
    return;
  }

  console.log(`🔄 Processing ${urlsToProcess.length} chapters...`);

  // Process with concurrency control
  const processWithConcurrency = async () => {
    const results = new Array(urlsToProcess.length);
    let i = 0;

    const workers = new Array(Math.min(args.concurrency, urlsToProcess.length)).fill(0).map(async () => {
      while (i < urlsToProcess.length) {
        const myIndex = i++;
        const chapterConfig = volumeConfig.chapters.find(ch => ch.link === urlsToProcess[myIndex]);
        if (!chapterConfig) {
          console.error(`❌ Chapter not found in data: ${urlsToProcess[myIndex]}`);
          results[myIndex] = 'failed';
          continue;
        }

        const chapterNumber = volumeConfig.chapters.indexOf(chapterConfig) + 1;
        const serial = chapterConfig.serial_number; // Use serial number from data

        try {
          await fetchAndTranslate(
            chapterConfig.link,
            args.maxRetries,
            serial,
            chapterNumber,
            progressTracker,
            progress,
            args
          );
          results[myIndex] = 'success';
        } catch (error) {
          console.error(`❌ Failed to translate chapter ${chapterNumber}:`, error);
          results[myIndex] = 'failed';
        } finally {
          if (args.delayMs > 0) {
            await new Promise(resolve => setTimeout(resolve, args.delayMs));
          }
        }
      }
    });

    await Promise.all(workers);
    return results;
  };

  await processWithConcurrency();

  // Final progress summary
  const summary = progressTracker.getProgressSummary(progress);
  console.log(`\n📊 Volume ${volumeConfig.volumeNumber} Summary:`);
  console.log(`   ✅ Completed: ${summary.completed}`);
  console.log(`   ❌ Failed: ${summary.failed}`);
  console.log(`   ⏳ Pending: ${summary.pending}`);
  console.log(`   📝 Total: ${summary.total}`);
}

async function main() {
  const args = parseArgs(process.argv);

  console.log('🚀 Enhanced Novel Translation System');
  console.log(`📖 Novel ID: ${args.novelId}`);
  console.log(`📚 Volume: ${args.volume || 'all'}`);
  console.log(`🔄 Concurrency: ${args.concurrency}`);
  console.log(`⏱️  Delay: ${args.delayMs}ms`);
  console.log(`📁 Output: ${args.outputDir}`);
  console.log(`🔄 Resume: ${args.resume ? 'yes' : 'no'}`);
  console.log(`🧹 Cleanup: ${args.cleanup ? 'yes' : 'no'}`);

  try {
    // Get volumes to process
    const volumesToProcess = novel16.filter(vol => {
      if (args.volume === 'all') return true;
      if (typeof args.volume === 'number') return vol.volumeNumber === args.volume;
      return true;
    });

    if (volumesToProcess.length === 0) {
      console.error('❌ No volumes found matching the specified criteria');
      process.exit(1);
    }

    console.log(`📚 Found ${volumesToProcess.length} volume(s) to process`);

    for (const volumeConfig of volumesToProcess) {
      const progressTracker = new ProgressTracker(args.novelId, volumeConfig.volumeNumber, args.outputDir);

      if (args.cleanup) {
        console.log(`🧹 Cleaning up failed chapters for Volume ${volumeConfig.volumeNumber}...`);
        const progress = await progressTracker.initialize();
        progress.novelId = args.novelId;
        progress.volumeNumber = volumeConfig.volumeNumber;
        await progressTracker.cleanupFailedChapters(progress);
      }

      await processVolume(volumeConfig, args, progressTracker);
    }

    console.log('\n🎉 All volumes processed successfully!');

  } catch (error) {
    console.error('❌ Translation failed:', error);
    process.exit(1);
  }
}

// Export for testing
export { fetchAndTranslate, cleanHtmlContent, parseAndValidateResponse, createMarkdownFile };

// Run if called directly
if (require.main === module) {
  main().catch(err => {
    console.error('❌ Failed:', err?.message || err);
    process.exit(1);
  });
}