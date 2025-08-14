# Content Management System

## Overview

Quaslation features a comprehensive content management system that handles the entire lifecycle of novel content, from creation and editing to publishing and organization. The system is designed for both web-based administration and CLI-based bulk operations, providing flexibility for different content management workflows.

## Admin Interface Architecture

### Dashboard Overview

#### Admin Dashboard Components
```typescript
// src/app/admin/page.tsx
export default async function AdminDashboard() {
  const stats = await getContentStats();
  
  return (
    <div className="admin-dashboard">
      <DashboardHeader />
      <MetricsGrid stats={stats} />
      <RecentActivity />
      <QuickActions />
    </div>
  );
}
```

#### Key Metrics Displayed
- **Content Statistics**: Total novels, volumes, chapters
- **Publishing Status**: Draft vs published content
- **User Engagement**: Reading statistics and user activity
- **System Health**: Database performance and error rates

### Novel Management

#### Novel Creation Workflow
```typescript
// src/app/admin/novels/page.tsx
export default function NovelManagement() {
  return (
    <div className="novel-management">
      <NovelHeader />
      <NovelFilters />
      <NovelDataTable />
      <CreateNovelDialog />
    </div>
  );
}
```

#### Novel Creation Form
```typescript
// src/components/admin/novel-form.tsx
export function NovelForm({ novel }: { novel?: Novel }) {
  const [form] = useForm({
    defaultValues: {
      title: novel?.title || '',
      slug: novel?.slug || '',
      thumbnail: novel?.thumbnail || '',
      description: novel?.richText?.text || '',
    },
  });
  
  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      {/* Additional form fields */}
    </Form>
  );
}
```

#### Novel Management Features
- **CRUD Operations**: Create, read, update, delete novels
- **Bulk Operations**: Import multiple novels from external sources
- **Status Management**: Draft, published, archived states
- **SEO Optimization**: Automatic slug generation and meta tag management
- **Thumbnail Management**: Image upload and optimization

### Volume Management

#### Volume Organization
```typescript
// src/app/admin/novels/[id]/volumes/page.tsx
export default async function VolumeManagement({ params }: { params: { id: string } }) {
  const novel = await getNovelById(params.id);
  const volumes = await getVolumesByNovelId(params.id);
  
  return (
    <div className="volume-management">
      <VolumeHeader novel={novel} />
      <VolumeList volumes={volumes} />
      <CreateVolumeDialog novelId={params.id} />
    </div>
  );
}
```

#### Volume Features
- **Hierarchical Organization**: Volumes within novels
- **Flexible Numbering**: Support for decimal numbering (1.5, 2.1, etc.)
- **Batch Operations**: Create multiple volumes simultaneously
- **Chapter Management**: Direct access to chapter management from volume view

### Chapter Management

#### Chapter Editor Interface
```typescript
// src/components/admin/chapter-editor.tsx
export function ChapterEditor({ chapter }: { chapter?: Chapter }) {
  const [content, setContent] = useState(chapter?.richText?.markdown || '');
  const [isPreview, setIsPreview] = useState(false);
  
  return (
    <div className="chapter-editor">
      <EditorToolbar 
        isPreview={isPreview}
        onTogglePreview={() => setIsPreview(!isPreview)}
      />
      {isPreview ? (
        <MarkdownPreview content={content} />
      ) : (
        <MarkdownEditor 
          value={content}
          onChange={setContent}
        />
      )}
    </div>
  );
}
```

#### Rich Text Management
```typescript
// src/lib/content/rich-text.ts
export async function createRichText(content: {
  text: string;
  markdown: string;
}) {
  // Convert markdown to HTML
  const html = await markdownToHtml(content.markdown);
  
  // Extract plain text for search
  const text = htmlToText(html);
  
  return await db.insert(richText).values({
    text,
    html,
    markdown: content.markdown,
  });
}
```

#### Chapter Management Features
- **Rich Text Editor**: Markdown-based editor with live preview
- **Multiple Format Support**: Automatic conversion between text, HTML, and Markdown
- **Premium Content Control**: Toggle premium status for monetization
- **Publishing Workflow**: Draft → Review → Published states
- **Bulk Operations**: Import chapters from external sources
- **Version Control**: Track changes and maintain edit history

## Content Import System

### Web Scraping (Kakuyomu Integration)

#### Kakuyomu Fetcher
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
}
```

#### Content Processing Pipeline
1. **URL Validation**: Verify source URL and accessibility
2. **Content Extraction**: Parse HTML and extract structured data
3. **Content Cleaning**: Remove unwanted elements and normalize formatting
4. **Structure Detection**: Identify chapters, volumes, and metadata
5. **Data Validation**: Ensure content meets quality standards
6. **Database Import**: Store processed content in database

### Translation Integration

#### Gemini API Translation
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
    const translatedText = result.response.text();
    
    return {
      ...chapter,
      content: translatedText,
      originalContent: chapter.content,
    };
  }
}
```

#### Translation Workflow
1. **Source Content Fetching**: Retrieve original content from source
2. **Content Preparation**: Clean and format content for translation
3. **AI Translation**: Process content through Gemini API
4. **Quality Review**: Manual or automated quality checks
5. **Post-Processing**: Format and optimize translated content
6. **Database Import**: Store translated content with metadata

### Bulk Operations

#### CLI Tools
```bash
# Fetch content from Kakuyomu
npm run fetch:kakuyomu -- --url https://kakuyomu.jp/works/123 --pretty

# Translate using Gemini API
npx tsx scripts/gemini/main.ts --volume all --concurrency 2

# Upload translated content
npx tsx scripts/gemini/upload.ts --novel-id 1 --verbose

# Alternative translation using Gradio
npx tsx scripts/translation/translate.ts --baseDir ./content --work 1 --concurrency 2
```

#### Batch Processing Features
- **Concurrent Processing**: Multiple chapters processed simultaneously
- **Progress Tracking**: Real-time progress updates and logging
- **Error Handling**: Robust error recovery and retry mechanisms
- **Resume Capability**: Continue interrupted operations
- **Validation**: Comprehensive content validation before import

## Content Organization

### Hierarchical Structure

#### Novel → Volume → Chapter Hierarchy
```typescript
// Content organization model
interface ContentHierarchy {
  novel: {
    id: number;
    title: string;
    slug: string;
    volumes: Volume[];
  };
  volume: {
    id: number;
    number: number;
    title?: string;
    chapters: Chapter[];
  };
  chapter: {
    id: number;
    serial: number;  // Global chapter number
    number: number;  // Volume-specific chapter number
    title: string;
    content: RichText;
  };
}
```

#### Navigation Generation
```typescript
// src/lib/content/navigation.ts
export async function generateChapterNavigation(chapterId: number) {
  const chapter = await getChapterById(chapterId);
  const novel = await getNovelById(chapter.novelId);
  
  const previousChapter = await db.query.chapter.findFirst({
    where: and(
      eq(chapter.novelId, novel.id),
      lt(chapter.serial, chapter.serial)
    ),
    orderBy: desc(chapter.serial),
  });
  
  const nextChapter = await db.query.chapter.findFirst({
    where: and(
      eq(chapter.novelId, novel.id),
      gt(chapter.serial, chapter.serial)
    ),
    orderBy: asc(chapter.serial),
  });
  
  return { previousChapter, currentChapter: chapter, nextChapter };
}
```

### Content Status Management

#### Publishing Workflow
```typescript
// src/lib/content/publishing.ts
export enum ContentStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export async function publishContent(contentId: number, type: 'novel' | 'chapter') {
  const now = new Date();
  
  if (type === 'novel') {
    await db.update(novels)
      .set({ publishedAt: now, updatedAt: now })
      .where(eq(novels.id, contentId));
  } else {
    await db.update(chapters)
      .set({ publishedAt: now, updatedAt: now })
      .where(eq(chapters.id, contentId));
  }
  
  // Revalidate relevant pages
  revalidatePath('/novels');
  revalidatePath(`/novels/${novel.slug}`);
}
```

## Data Management

### Content Validation

#### Input Validation Schemas
```typescript
// src/lib/validation/content.ts
export const novelSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  thumbnail: z.string().url().optional(),
  description: z.string().min(1),
});

export const chapterSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  content: z.string().min(1),
  premium: z.boolean().default(false),
  volumeId: z.number().int().positive(),
  number: z.number().positive(),
});
```

#### Content Quality Checks
```typescript
// src/lib/content/validation.ts
export async function validateChapterContent(content: string): Promise<ValidationResult> {
  const issues: string[] = [];
  
  // Check minimum length
  if (content.length < 100) {
    issues.push('Content too short (minimum 100 characters)');
  }
  
  // Check for common formatting issues
  if (content.includes('  ')) {
    issues.push('Multiple consecutive spaces detected');
  }
  
  // Check for untranslated content (basic detection)
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

### Database Operations

#### Optimized Queries
```typescript
// src/lib/db/content-queries.ts
export async function getNovelWithChapters(slug: string) {
  return await db.query.novels.findFirst({
    where: eq(novels.slug, slug),
    with: {
      richText: true,
      volumes: {
        with: {
          chapters: {
            with: {
              richText: true,
            },
            orderBy: asc(chapters.number),
          },
        },
        orderBy: asc(volumes.number),
      },
    },
  });
}

export async function getChapterForReading(slug: string, userRole?: UserRole) {
  const chapter = await db.query.chapters.findFirst({
    where: eq(chapters.slug, slug),
    with: {
      richText: true,
      novel: true,
      volume: true,
    },
  });
  
  // Check premium access
  if (chapter?.premium && !canAccessPremiumContent(userRole)) {
    return { ...chapter, richText: null }; // Hide content
  }
  
  return chapter;
}
```

#### Bulk Operations
```typescript
// src/lib/db/bulk-operations.ts
export async function bulkInsertChapters(chapters: ChapterInsert[]) {
  return await db.transaction(async (tx) => {
    const results = [];
    
    for (const chapterData of chapters) {
      // Create rich text first
      const [richTextResult] = await tx.insert(richText).values({
        text: chapterData.content.text,
        html: chapterData.content.html,
        markdown: chapterData.content.markdown,
      }).returning();
      
      // Create chapter with rich text reference
      const [chapterResult] = await tx.insert(chapters).values({
        ...chapterData,
        richTextId: richTextResult.id,
      }).returning();
      
      results.push(chapterResult);
    }
    
    return results;
  });
}
```

## Performance Optimization

### Caching Strategy

#### Content Caching
```typescript
// src/lib/cache/content.ts
import { unstable_cache } from 'next/cache';

export const getCachedNovel = unstable_cache(
  async (slug: string) => {
    return await getNovelWithChapters(slug);
  },
  ['novel'],
  {
    revalidate: 3600, // 1 hour
    tags: ['novels'],
  }
);

export const getCachedChapter = unstable_cache(
  async (slug: string) => {
    return await getChapterForReading(slug);
  },
  ['chapter'],
  {
    revalidate: 1800, // 30 minutes
    tags: ['chapters'],
  }
);
```

#### Cache Invalidation
```typescript
// src/lib/actions/content-actions.ts
'use server';

export async function updateChapter(chapterId: number, data: ChapterUpdate) {
  await db.update(chapters)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(chapters.id, chapterId));
  
  // Invalidate relevant caches
  revalidateTag('chapters');
  revalidateTag('novels');
  revalidatePath('/admin/chapters');
}
```

### Database Optimization

#### Indexing Strategy
```sql
-- Indexes for content queries
CREATE INDEX idx_novels_slug ON novels(slug);
CREATE INDEX idx_novels_published ON novels(published_at) WHERE published_at IS NOT NULL;
CREATE INDEX idx_chapters_slug ON chapters(slug);
CREATE INDEX idx_chapters_novel_serial ON chapters(novel_id, serial);
CREATE INDEX idx_chapters_premium ON chapters(premium);
```

#### Query Optimization
- Use appropriate indexes for common query patterns
- Implement pagination for large result sets
- Use database-level filtering for premium content
- Optimize joins with proper foreign key relationships

## Monitoring & Analytics

### Content Metrics
- **Publishing Statistics**: Content creation and publishing rates
- **User Engagement**: Most popular novels and chapters
- **Translation Progress**: Status of translation workflows
- **Quality Metrics**: Content validation and error rates

### Performance Monitoring
- **Database Performance**: Query execution times and optimization opportunities
- **Import Performance**: Translation and import processing times
- **Cache Effectiveness**: Hit rates and invalidation patterns
- **User Experience**: Content loading times and error rates

---

This content management system provides a comprehensive solution for managing novel content at scale, from individual chapter editing to bulk import operations. The system balances ease of use for content creators with powerful automation capabilities for efficient content processing.