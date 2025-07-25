# AI Chapter Translation Feature

## Overview

The AI Chapter Translation feature enables content administrators to automatically translate web novel chapters from source HTML to English using the OpenRouter API. This feature streamlines the content creation process by eliminating manual copy-pasting and translation work.

## Features

- HTML import section in chapter creation form
- Automatic metadata extraction (title, chapter number)
- AI-powered translation using OpenRouter API
- HTML to Markdown conversion
- Error handling with user-friendly messages
- Rate limiting to prevent API abuse
- Secure API key management

## Implementation Details

### Frontend

The translation UI is integrated into the chapter creation form:

- Textarea for pasting raw HTML content
- "Translate" button that triggers AI processing
- Loading state during translation
- Automatic population of title and chapter fields
- Markdown editor population with translated content

### Backend

The backend consists of several components:

- API route at `/api/translate` for handling translation requests
- HTML parser utility for metadata extraction
- Content processing pipeline for HTML-to-Markdown conversion
- Translation service for OpenRouter API integration
- Enhanced error handling with retry logic

### Security

- API keys stored in environment variables
- HTML sanitization to prevent XSS attacks
- Rate limiting to prevent abuse
- Input validation to prevent malformed requests

## Setup

1. Add the following environment variables to your `.env` file:
   ```
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   OPENROUTER_MODEL=openai/gpt-4-turbo
   TRANSLATION_MAX_RETRIES=3
   ```

2. Install required dependencies:
   ```bash
   npm install rehype-parse rehype-remark remark-stringify
   ```

## Usage

1. Navigate to the chapter creation form in the admin panel
2. Paste HTML content into the "Import HTML" textarea
3. Click the "Translate" button
4. Wait for the translation to complete
5. Review and edit the translated content as needed
6. Save the chapter

## Documentation

- [Architecture](./ARCHITECTURE.md) - System architecture and design decisions
- [Translation Pipeline](./TRANSLATION_PIPELINE.md) - Detailed implementation of the translation pipeline
- [API Documentation](./API.md) - API endpoints and usage

## Testing

Unit tests are available for the HTML parser utility:

```bash
npm test __tests__/html-parser.test.ts
```

## Future Enhancements

- Caching of translation results
- Support for additional languages
- Batch translation of multiple chapters
- Translation memory for consistent terminology
- Integration with translation management systems