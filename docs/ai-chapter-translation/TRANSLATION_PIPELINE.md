# AI Chapter Translation Pipeline

## Overview

This document describes the implementation of the AI-powered chapter translation feature for the Quaslation platform. The feature allows content administrators to automatically translate web novel chapters from source HTML to English using the OpenRouter API.

## Architecture

The translation pipeline consists of several components working together:

1. **Frontend UI** - Provides the interface for importing HTML content
2. **API Route** - Handles translation requests and orchestrates the pipeline
3. **HTML Parser** - Extracts metadata from HTML content
4. **Content Processor** - Converts HTML to Markdown and processes content
5. **Translation Service** - Interfaces with OpenRouter API
6. **Error Handler** - Manages failures and retries

## Components

### Frontend Implementation

The translation UI is integrated into the chapter creation form at `src/app/admin/chapters/[novelId]/create/create-chapter-form.tsx`. It includes:

- HTML import section with textarea
- Translate button with loading state
- Automatic population of title/chapter fields
- Markdown editor population with translated content

### API Route

The translation API endpoint is implemented at `src/app/api/translate/route.ts`:

- POST endpoint for translation requests
- Rate limiting using Upstash Redis
- Input validation with Zod schemas
- Metadata extraction from HTML
- Response with translated content and metadata

### HTML Parser Utility

The HTML parser at `src/lib/utils/html-parser.ts` extracts:

- Title from H1/H2 tags
- Chapter numbers using regex patterns
- Sanitization of HTML tags from extracted text
- Handling of multiple encoding formats

### Content Processing Pipeline

The content processing pipeline in `src/lib/translation.ts` handles:

- HTML to Markdown conversion using rehype/remark
- Content sanitization to remove unsafe elements
- Content segmentation for large documents
- Metadata extraction from Markdown content
- Translation using OpenRouter API with retry logic

### Error Handling

The error handling system includes:

- Rate limit detection and extended backoff
- Network error detection and retries
- Timeout handling (30 seconds default)
- User-friendly error messages
- Logging of translation errors

## Environment Configuration

The following environment variables are required:

- `OPENROUTER_API_KEY` - API key for OpenRouter
- `OPENROUTER_MODEL` - Model to use for translation (default: openai/gpt-4-turbo)
- `TRANSLATION_MAX_RETRIES` - Maximum retry attempts (default: 3)

## Usage

1. Navigate to the chapter creation form
2. Paste HTML content into the "Import HTML" textarea
3. Click the "Translate" button
4. Wait for translation to complete
5. Review and edit the translated content as needed
6. Save the chapter

## Security Considerations

- API keys are stored in environment variables
- HTML content is sanitized before processing
- Rate limiting prevents abuse of the translation service
- Input validation prevents malformed requests

## Performance Optimization

- Content segmentation for large documents
- Exponential backoff for retry logic
- Streaming responses for better UX
- Caching of translation results (future enhancement)

## Future Enhancements

- Caching of translation results
- Support for additional languages
- Batch translation of multiple chapters
- Translation memory for consistent terminology
- Integration with translation management systems