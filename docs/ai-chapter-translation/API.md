# Translation Server Actions Documentation

## Overview

This document describes the server actions for the AI-powered chapter translation feature. The implementation uses Next.js Server Actions instead of traditional API routes for better integration with the admin panel forms.

## Server Actions

### translateHtmlContent
Server action for translating HTML content to English using AI.

#### Usage
```typescript
import { translateHtmlContent } from '@/app/admin/chapters/[novelId]/create/translate-actions';

const formData = new FormData();
formData.append('html', '<html>...</html>');
formData.append('targetLanguage', 'en');

const result = await translateHtmlContent(prevState, formData);
```

#### Response
```typescript
{
  success: true,
  translatedContent: "# Translated Chapter\n\nContent...",
  metadata: {
    title: "Chapter Title",
    number: 1
  }
}
```

#### Error Response
```typescript
{
  success: false,
  error: "Error message"
}
```

## Rate Limiting
- 10 requests per minute per IP address
- Uses Upstash Redis for distributed rate limiting

## Error Handling
All server actions include comprehensive error handling with descriptive error messages returned to the client.

## Security
- Server actions are protected by Next.js App Router security model
- API keys are stored server-side only
- Input validation using Zod schemas
- Rate limiting prevents abuse