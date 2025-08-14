# Translation Pipeline

## Overview

The Quaslation translation pipeline is a sophisticated system designed to automate the process of fetching, translating, and importing web novel content. The pipeline integrates multiple AI translation services, web scraping capabilities, and robust error handling to ensure high-quality translations at scale.

## Pipeline Architecture

### High-Level Workflow
```
Source Content → Web Scraping → Content Processing → AI Translation → Quality Control → Database Import → Publishing
```

### Core Components
1. **Content Fetcher**: Web scraping tools for extracting novel content from source sites
2. **Translation Services**: AI-powered translation using Gemini API and Gradio
3. **Content Processor**: Data validation, formatting, and structure management
4. **Database Importer**: Automated content upload to PostgreSQL database
5. **Progress Tracker**: Resume functionality and error recovery

## Translation Services

### Gemini API Integration

#### Configuration
```typescript
// scripts/gemini/main.ts
export class GeminiTranslator {
  private client: GoogleGenerativeAI;
  
  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }
  
  async translateChapter(chapter: ChapterData): Promise<TranslatedChapter> {
    const model = this.client.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
      Translate the following Japanese text to English.
      Maintain the original formatting and style.
      Preserve character names and cultural references.
      
      Text: ${chapter.content}
    `;
    
    const result = await model.generateContent(prompt);
    return {
      ...chapter,
      content: result.response.text(),
      originalContent: chapter.content,
    };
  }
}
```

#### Translation Commands
```bash
# Translate all volumes with concurrency
npx tsx scripts/gemini/main.ts --volume all --concurrency 2

# Translate specific volume
npx tsx scripts/gemini/main.ts --volume 1 --concurrency 1

# Resume interrupted translation
npx tsx scripts/gemini/main.ts --resume --volume 1

# Clean up failed chapters and retry
npx tsx scripts/gemini/main.ts --cleanup --volume 1 --max-retries 5
```

### Gradio API Integration

#### Alternative Translation Service
```typescript
// scripts/translation/translate.ts
export class GradioTranslator {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  async translateText(text: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [text, 'Japanese', 'English']
      })
    });
    
    const result = await response.json();
    return result.data[0];
  }
}
```

#### Gradio Commands
```bash
# Translate using Gradio backend
npx tsx scripts/translation/translate.ts --baseDir ./content --work 1 --concurrency 2

# Process with custom Gradio endpoint
npx tsx scripts/translation/translate.ts --endpoint http://localhost:7860 --work 1
```

## Content Fetching

### Kakuyomu Integration

#### Web Scraper Implementation
```typescript
// scripts/translation/kakuyomu-fetcher.ts
export class KakuyomuFetcher {
  async fetchNovel(url: string): Promise<NovelData> {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    return {
      title: $('.novel-title').text().trim(),
      description: $('.novel-description').text().trim(),
      author: $('.author-name').text().trim(),
      chapters: await this.fetchChapters($),
    };
  }
  
  private async fetchChapters($: CheerioAPI): Promise<ChapterData[]> {
    const chapterLinks = $('.chapter-link').toArray();
    const chapters: ChapterData[] = [];
    
    for (const link of chapterLinks) {
      const chapterUrl = $(link).attr('href');
      const chapterData = await this.fetchChapter(chapterUrl);
      chapters.push(chapterData);
    }
    
    return chapters;
  }
  
  private async fetchChapter(url: string): Promise<ChapterData> {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    return {
      title: $('.chapter-title').text().trim(),
      content: $('.chapter-content').html(),
      publishedAt: $('.publish-date').text().trim(),
      url,
    };
  }
}
```

#### Fetching Commands
```bash
# Fetch novel from Kakuyomu
npm run fetch:kakuyomu -- --url https://kakuyomu.jp/works/123456 --pretty

# Fetch with custom output directory
npm run fetch:kakuyomu -- --url https://kakuyomu.jp/works/123456 --output ./custom-output
```

## Progress Tracking System

### Progress Data Structure
```typescript
// scripts/gemini/progress.ts
interface ProgressData {
  novelId: number;
  volumeNumber: number;
  lastUpdated: string;
  chapters: Record<string, ChapterProgress>;
}

interface ChapterProgress {
  status: 'pending' | 'completed' | 'failed';
  chapterNumber?: number;
  translatedAt?: string;
  filePath?: string;
  error?: string;
  retryCount?: number;
}
```

### Progress Management
```typescript
export class ProgressTracker {
  async initialize(): Promise<ProgressData> {
    const progressFile = path.join(this.progressDir, '.progress.json');
    
    if (await fs.pathExists(progressFile)) {
      return await this.load();
    }
    
    const initialProgress: ProgressData = {
      novelId: this.novelId,
      volumeNumber: this.volumeNumber,
      lastUpdated: new Date().toISOString(),
      chapters: {},
    };
    
    await this.save(initialProgress);
    return initialProgress;
  }
  
  async markAsCompleted(
    progress: ProgressData, 
    url: string, 
    chapterNumber: number, 
    filePath: string
  ): Promise<ProgressData> {
    progress.chapters[url] = {
      status: 'completed',
      chapterNumber,
      translatedAt: new Date().toISOString(),
      filePath,
    };
    
    progress.lastUpdated = new Date().toISOString();
    await this.save(progress);
    return progress;
  }
}
```

## Content Processing

### Data Validation
```typescript
// src/lib/validation/content.ts
export const chapterSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  chapterNumber: z.number().positive(),
  volumeNumber: z.number().positive(),
  novelId: z.number().positive(),
});

export async function validateChapterContent(content: string): Promise<ValidationResult> {
  const issues: string[] = [];
  
  // Check minimum length
  if (content.length < 100) {
    issues.push('Content too short (minimum 100 characters)');
  }
  
  // Check for untranslated content
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
  if (japaneseRegex.test(content)) {
    issues.push('Possible untranslated Japanese text detected');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
  };
}
```

### Content Formatting
```typescript
// scripts/gemini/content-processor.ts
export class ContentProcessor {
  async processChapter(rawChapter: RawChapterData): Promise<ProcessedChapter> {
    // Clean HTML content
    const cleanContent = this.cleanHtml(rawChapter.content);
    
    // Extract metadata
    const metadata = this.extractMetadata(rawChapter);
    
    // Generate markdown
    const markdown = this.generateMarkdown(cleanContent, metadata);
    
    return {
      title: rawChapter.title,
      content: cleanContent,
      markdown,
      metadata,
    };
  }
  
  private cleanHtml(html: string): string {
    const $ = cheerio.load(html);
    
    // Remove unwanted elements
    $('script, style, .ads, .navigation').remove();
    
    // Clean up formatting
    $('p').each((_, el) => {
      const text = $(el).text().trim();
      if (!text) $(el).remove();
    });
    
    return $.html();
  }
}
```

## Database Import System

### Upload Implementation
```typescript
// scripts/gemini/upload.ts
export class DatabaseUploader {
  async uploadChapter(chapterData: ChapterData): Promise<void> {
    return await db.transaction(async (tx) => {
      // Create rich text entry
      const [richTextResult] = await tx.insert(richText).values({
        text: chapterData.content.text,
        html: chapterData.content.html,
        markdown: chapterData.content.markdown,
      }).returning();
      
      // Create chapter entry
      await tx.insert(chapters).values({
        title: chapterData.title,
        slug: chapterData.slug,
        novelId: chapterData.novelId,
        volumeId: chapterData.volumeId,
        number: chapterData.number,
        serial: chapterData.serial,
        premium: chapterData.premium || false,
        richTextId: richTextResult.id,
        publishedAt: new Date(),
      });
    });
  }
}
```

### Upload Commands
```bash
# Upload all translated chapters
npx tsx scripts/gemini/upload.ts --novel-id 17 --verbose

# Upload specific volume
npx tsx scripts/gemini/upload.ts --novel-id 17 --volume 1

# Force upload (skip resume check)
npx tsx scripts/gemini/upload.ts --no-resume --novel-id 17
```

## Error Handling & Recovery

### Retry Mechanisms
```typescript
export class RetryHandler {
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) break;
        
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }
}
```

### Error Recovery
```typescript
export async function recoverFromFailure(
  progress: ProgressData,
  failedUrl: string
): Promise<void> {
  const chapterProgress = progress.chapters[failedUrl];
  
  if (chapterProgress?.status === 'failed') {
    // Reset to pending for retry
    chapterProgress.status = 'pending';
    chapterProgress.retryCount = (chapterProgress.retryCount || 0) + 1;
    delete chapterProgress.error;
  }
}
```

## Performance Optimization

### Concurrent Processing
```typescript
export class ConcurrentProcessor {
  async processChapters(
    chapters: ChapterData[],
    concurrency: number = 2
  ): Promise<ProcessedChapter[]> {
    const results: ProcessedChapter[] = [];
    const semaphore = new Semaphore(concurrency);
    
    const promises = chapters.map(async (chapter) => {
      await semaphore.acquire();
      
      try {
        const processed = await this.processChapter(chapter);
        results.push(processed);
      } finally {
        semaphore.release();
      }
    });
    
    await Promise.all(promises);
    return results;
  }
}
```

### Rate Limiting
```typescript
export class RateLimiter {
  private lastRequest: number = 0;
  private minInterval: number;
  
  constructor(requestsPerSecond: number) {
    this.minInterval = 1000 / requestsPerSecond;
  }
  
  async throttle(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;
    
    if (timeSinceLastRequest < this.minInterval) {
      const delay = this.minInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequest = Date.now();
  }
}
```

## Quality Control

### Translation Quality Checks
```typescript
export class QualityController {
  async validateTranslation(
    original: string,
    translated: string
  ): Promise<QualityReport> {
    const issues: string[] = [];
    
    // Check for untranslated segments
    if (this.hasUntranslatedText(translated)) {
      issues.push('Contains untranslated text');
    }
    
    // Check length ratio
    const lengthRatio = translated.length / original.length;
    if (lengthRatio < 0.5 || lengthRatio > 3) {
      issues.push('Unusual length ratio detected');
    }
    
    // Check for formatting preservation
    if (!this.preservesFormatting(original, translated)) {
      issues.push('Formatting not preserved');
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      score: this.calculateQualityScore(original, translated),
    };
  }
}
```

## Monitoring & Logging

### Progress Reporting
```typescript
export class ProgressReporter {
  reportProgress(
    completed: number,
    total: number,
    currentChapter?: string
  ): void {
    const percentage = Math.round((completed / total) * 100);
    const progressBar = this.generateProgressBar(percentage);
    
    console.log(`\n📊 Translation Progress: ${percentage}%`);
    console.log(`${progressBar} ${completed}/${total} chapters`);
    
    if (currentChapter) {
      console.log(`🔄 Currently processing: ${currentChapter}`);
    }
  }
  
  private generateProgressBar(percentage: number): string {
    const filled = Math.round(percentage / 5);
    const empty = 20 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }
}
```

### Error Logging
```typescript
export class ErrorLogger {
  async logError(
    operation: string,
    error: Error,
    context?: Record<string, any>
  ): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      operation,
      error: {
        message: error.message,
        stack: error.stack,
      },
      context,
    };
    
    const logFile = path.join(this.logDir, 'errors.log');
    await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n');
  }
}
```

## Configuration Management

### Environment Variables
```bash
# Required for Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Optional for Gradio
GRADIO_ENDPOINT=http://localhost:7860

# Database connection
DATABASE_URL=postgresql://user:pass@host:port/db
```

### Configuration Files
```typescript
// scripts/gemini/config.ts
export interface TranslationConfig {
  concurrency: number;
  delayMs: number;
  maxRetries: number;
  outputDir: string;
  batchSize: number;
}

export const defaultConfig: TranslationConfig = {
  concurrency: 1,
  delayMs: 1000,
  maxRetries: 3,
  outputDir: './scripts/output/gemini',
  batchSize: 10,
};
```

---

This translation pipeline provides a comprehensive solution for automated content translation, from initial fetching through final database import, with robust error handling and quality control measures throughout the process.