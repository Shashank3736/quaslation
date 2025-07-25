# AI-Powered Metadata Extraction

This document provides a comprehensive overview of the AI-powered metadata extraction system used to automatically identify and extract chapter titles and numbers from HTML content.

## 1. System Architecture Overview

The metadata extraction process is designed to be robust and resilient, employing a multi-layered approach that prioritizes accuracy while ensuring a result is always returned. The system architecture can be summarized as follows:

1.  **Primary Extractor (AI)**: The system first attempts to extract metadata using a sophisticated AI model via the OpenRouter API. This is the preferred method due to its ability to understand context and handle complex HTML structures.

2.  **Secondary Extractor (HTML Parser)**: If the AI extraction fails, or if its confidence in the result is below a predefined threshold (`minConfidence`), the system falls back to an enhanced HTML parser. This parser uses a series of deterministic rules and regular expressions to find the metadata.

3.  **Ultimate Fallback**: In the rare event that both the AI and the parser fail to produce a result with sufficient confidence, a default "Untitled Chapter" title is assigned, ensuring system stability.

This tiered architecture is orchestrated by the `extractChapterMetadata` function in [`src/lib/utils/metadata-extractor.ts`](src/lib/utils/metadata-extractor.ts:276).

```typescript
// Simplified flow from extractChapterMetadata
async function extractChapterMetadata(html) {
  // 1. Try AI first
  try {
    const aiResult = await extractMetadataWithAI(html);
    if (aiResult.confidence >= minConfidence) {
      return aiResult; // Success
    }
  } catch (error) {
    // Log error and proceed to fallback
  }

  // 2. Fallback to Parser
  const parserResult = parseHtmlMetadataEnhanced(html);
  if (parserResult.confidence >= minConfidence) {
    return parserResult;
  }

  // 3. Ultimate Fallback
  return {
    title: 'Untitled Chapter',
    chapterNumber: null,
    confidence: 0.0,
    source: 'fallback'
  };
}
```

## 2. AI Extraction Methodology

The core of the extraction system is the `extractMetadataWithAI` function, which leverages a powerful language model to analyze HTML content.

### API and Model

-   **API Endpoint**: `https://openrouter.ai/api/v1/chat/completions`
-   **Default Model**: `openai/gpt-4-turbo`

### Prompt Engineering

The AI is guided by a carefully crafted prompt that instructs it to act as a "metadata extraction specialist." The prompt includes specific instructions for handling common edge cases, ensuring consistent and accurate output.

Key instructions in the prompt include:
-   Choosing the most prominent title from multiple candidates.
-   Handling non-numeric chapter numbers (e.g., "Prologue", "1.5").
-   Intelligently truncating long titles.
-   Returning `null` for missing fields.
-   Responding exclusively in a predefined JSON format.

The AI is also provided with the first 3000 characters of the HTML content for context.

## 3. Fallback Trigger Conditions

The system is designed to gracefully degrade to the HTML parser under the following conditions:

1.  **AI API Failure**: If the request to the OpenRouter API fails for any reason (e.g., network error, API key issue, timeout), the `try...catch` block in `extractChapterMetadata` will trigger the fallback to `parseHtmlMetadataEnhanced`.

2.  **Invalid AI Response**: If the AI returns a response that is not valid JSON or does not match the expected structure, an error is thrown, and the system falls back to the parser.

3.  **Low Confidence Score**: The AI is asked to provide a `confidence` score (from 0.0 to 1.0) for its extraction. If this score is below the `minConfidence` threshold (defaulting to `0.3`), the system discards the AI result and proceeds with the parser, assuming the AI's result is not reliable enough.

## 4. Edge Case Resolution Strategies

Both the AI and the parser have strategies for handling difficult edge cases.

### AI-Based Resolution

The AI is explicitly prompted to handle:
-   **Multiple Titles**: "choose the most prominent/main one"
-   **Non-Numeric Chapters**: "return as-is (e.g., "Prologue", "Epilogue", "1.5")"
-   **Long Titles**: "truncate intelligently at sentence boundaries"
-   **Missing Data**: "return null for missing fields"

### Parser-Based Resolution

The `parseHtmlMetadataEnhanced` function uses a multi-strategy approach:

-   **Title Extraction**: It searches for a title in the following order of priority:
    1.  `<h1>` tag
    2.  `<h2>` tag
    3.  `<title>` tag
    4.  Any other heading tag (`<h3>` to `<h6>`)

-   **Chapter Number Extraction**: It uses a comprehensive list of regex patterns to find chapter numbers within the extracted title or the body text. These patterns cover various formats, including:
    -   `Chapter 1`, `Ch. 2.5`
    -   Chinese/Japanese characters (第, 章, 话)
    -   `Episode 1`, `Part 1`, `Volume 1`
    -   Special names like `Prologue`, `Epilogue`, etc.

-   **Sanitization and Validation**: All extracted data is passed through validation functions (`validateAndSanitizeTitle`, `validateAndSanitizeChapterNumber`) to remove HTML tags, normalize whitespace, and ensure the data conforms to expected formats. The title is also intelligently truncated if it exceeds the `maxTitleLength`.

## 5. Examples of Metadata Extraction Results

The system returns a `ChapterMetadata` object. Here are some examples of potential outputs.

**Example 1: Successful AI Extraction**
```json
{
  "title": "The Awakening",
  "chapterNumber": "1",
  "confidence": 0.95,
  "source": "ai"
}
```

**Example 2: Parser Extraction with Non-Numeric Chapter**
```json
{
  "title": "A New Beginning - Prologue",
  "chapterNumber": "Prologue",
  "confidence": 0.9,
  "source": "parser"
}
```

**Example 3: AI Extraction with Low Confidence (Fallback would be triggered)**
```json
{
  "title": "Chapter 3",
  "chapterNumber": "3",
  "confidence": 0.2,
  "source": "ai"
}
```

**Example 4: Ultimate Fallback**
```json
{
  "title": "Untitled Chapter",
  "chapterNumber": null,
  "confidence": 0.0,
  "source": "fallback"
}