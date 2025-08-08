# Enhanced Novel Translation System

A powerful CLI tool for translating web novels from Japanese to English using Google's Gemini AI. This system supports multiple volumes, progress tracking, resume functionality, concurrent processing, and database-based upload capabilities.

## Features

### Translation Features
- ✅ **Multi-volume support** - Handle multiple volumes with different novel IDs
- 📊 **Progress tracking** - Track translation progress and resume from where you left off
- 🔄 **Resume functionality** - Continue failed or interrupted translations
- ⚡ **Concurrent processing** - Process multiple chapters simultaneously
- 🛡️ **Error handling** - Robust retry mechanisms with exponential backoff
- 📁 **Organized output** - Files organized by novel ID and volume number
- 🧹 **Cleanup mode** - Reset failed chapters for retry
- 📝 **Rich metadata** - Comprehensive frontmatter in generated markdown files

### Upload Features
- ✅ **Database-based upload** - Upload chapters directly to PostgreSQL database
- 🔄 **Resume by default** - Skip already uploaded chapters automatically
- 📊 **Advanced filtering** - Filter by novel ID, volume number
- 📝 **Enhanced logging** - Detailed progress tracking and error reporting
- 🔍 **Duplicate prevention** - Skip chapters that already exist in database
- 📁 **Flexible base directories** - Support custom output directories
- 🛡️ **Error recovery** - Graceful handling of upload failures

## Installation

1. Ensure you have Node.js 18+ installed
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Add your Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

## Usage

### Translation Tool (`main.ts`)

#### Basic Usage

```bash
# Translate all volumes for novel ID 16 (default)
npx tsx main.ts

# Translate a specific volume
npx tsx main.ts --volume 7

# Translate multiple specific volumes
npx tsx main.ts --volume 7 --volume 8
```

#### Advanced Options

```bash
# Use custom novel ID
npx tsx main.ts --novel-id 25

# Process with higher concurrency
npx tsx main.ts --concurrency 3 --delayMs 500

# Resume from previous progress
npx tsx main.ts --resume

# Clean up failed chapters and retry
npx tsx main.ts --cleanup

# Use custom output directory
npx tsx main.ts --output-dir ./my-translations

# Set maximum retry attempts per chapter
npx tsx main.ts --max-retries 5
```

#### Translation Command Line Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `--novel-id` | Novel ID to process | 16 |
| `--volume` | Volume number to process (use 'all' for all volumes) | all |
| `--concurrency` | Number of concurrent chapter translations | 1 |
| `--delayMs` | Delay between requests in milliseconds | 1000 |
| `--resume` | Resume from previous progress | false |
| `--cleanup` | Reset failed chapters to pending | false |
| `--output-dir` | Output directory for translated files | ./scripts/output/gemini |
| `--max-retries` | Maximum retry attempts per chapter | 3 |

### Upload Tool (`upload.ts`)

#### Basic Usage

```bash
# Upload all chapters (skips already uploaded by default)
npx tsx upload.ts

# Upload chapters for specific novel
npx tsx upload.ts --novel-id 16

# Upload chapters for specific novel and volume
npx tsx upload.ts --novel-id 16 --volume 8

# Process all chapters, including already uploaded ones
npx tsx upload.ts --no-resume --novel-id 16 --volume 8

# Enable verbose logging for detailed output
npx tsx upload.ts --verbose

# Use custom base directory
npx tsx upload.ts --base-dir ./my-translations
```

#### Upload Command Line Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `--base-dir PATH` | Base directory containing chapter files | ./scripts/output/gemini |
| `--novel-id ID` | Filter by specific novel ID | none |
| `--volume NUMBER` | Filter by specific volume number | none |
| `--no-resume` | Process all chapters, including already uploaded ones | false |
| `--verbose, -v` | Enable verbose logging | false |
| `--help, -h` | Show help message | false |

## Output Structure

### Translation Output

The system creates organized output directories:

```
scripts/output/gemini/
├── novel-16/
│   ├── volume-7/
│   │   ├── chapter_1_20240101_120000.md
│   │   ├── chapter_2_20240101_120500.md
│   │   └── .progress.json
│   ├── volume-8/
│   │   ├── chapter_19_20240101_121000.md
│   │   └── .progress.json
│   └── ...
```

### Progress Files

Each volume has a `.progress.json` file that tracks:

```json
{
  "novelId": 16,
  "volumeNumber": 7,
  "lastUpdated": "2024-01-01T12:00:00.000Z",
  "chapters": {
    "https://ncode.syosetu.com/n1976ey/104/": {
      "status": "completed",
      "chapterNumber": 1,
      "translatedAt": "2024-01-01T12:00:00.000Z",
      "filePath": "scripts/output/gemini/novel-16/volume-7/chapter_1_20240101_120000.md"
    },
    "https://ncode.syosetu.com/n1976ey/105/": {
      "status": "failed",
      "error": "Translation timeout",
      "translatedAt": "2024-01-01T12:05:00.000Z"
    }
  }
}
```

### Markdown File Format

Each translated chapter is saved with comprehensive frontmatter:

```markdown
---
chapter: 1
serial: 1
title: The Beginning of the Adventure
novel: 16
volume: 7
originalLanguage: Japanese
translatedAt: 2024-01-01T12:00:00.000Z
---

The translated content goes here...
```

### Database Schema

The upload tool works with the following database schema:

- **novels** - Stores novel information
- **volumes** - Stores volume information (linked to novels)
- **chapters** - Stores chapter information (linked to volumes and rich text content)
- **richText** - Stores the actual chapter content in markdown, text, and HTML formats

## Workflow Examples

### 1. First-time Translation and Upload

```bash
# 1. Start fresh translation of all volumes
npx tsx main.ts --novel-id 16 --volume all --concurrency 2

# 2. Upload all chapters (skips already uploaded by default)
npx tsx upload.ts --novel-id 16 --verbose
```

### 2. Resume Failed Translations

```bash
# Continue translation from where you left off
npx tsx main.ts --resume --volume 7

# Continue upload from where you left off (automatic)
npx tsx upload.ts --novel-id 16 --volume 8
```

### 3. Retry Failed Chapters

```bash
# Reset failed chapters and retry them
npx tsx main.ts --cleanup --volume 7 --max-retries 5

# Process all chapters including already uploaded ones
npx tsx upload.ts --no-resume --novel-id 16 --volume 7
```

### 4. High-Performance Processing

```bash
# Process with higher concurrency and shorter delays
npx tsx main.ts --concurrency 3 --delayMs 300 --volume all

# Upload with verbose logging
npx tsx upload.ts --novel-id 16 --volume all --verbose
```

## Progress Tracking

### Translation Progress

The translation system automatically tracks progress and can:

- **Resume** from interrupted translations using `.progress.json` files
- **Skip** already completed chapters
- **Retry** failed chapters with exponential backoff
- **Report** progress summaries for each volume

### Upload Progress

The upload system automatically tracks progress and can:

- **Resume** by default - skip already uploaded chapters (database-based)
- **Process** all chapters when `--no-resume` is specified
- **Report** detailed upload summaries with success/failure counts

### Status Types

- `pending` - Chapter not yet processed
- `completed` - Chapter successfully translated/uploaded
- `failed` - Chapter failed to translate/upload

## Error Handling

### Translation Error Handling

The translation system includes robust error handling:

- **Automatic retries** with exponential backoff
- **Graceful degradation** for network issues
- **Detailed error logging** for troubleshooting
- **Failed chapter tracking** for later retry

### Upload Error Handling

The upload system includes robust error handling:

- **Database transaction rollback** for failed uploads
- **Graceful error handling** with detailed error messages
- **Cleanup of orphaned rich text entries** on failure
- **Comprehensive error reporting** in summary

## Data Configuration

### Adding New Novels

Edit `scripts/gemini/data.ts` to add new novel configurations:

```typescript
export const novel25: VolumeConfig[] = [
  {
    novelId: 25,
    volumeNumber: 1,
    volumeTitle: "Volume 1",
    chapters: [
      'https://ncode.syosetu.com/your-work/1/',
      'https://ncode.syosetu.com/your-work/2/',
      // ... more chapters
    ],
  },
];
```

### Volume Configuration

Each volume configuration includes:

- `novelId`: Unique identifier for the novel
- `volumeNumber`: Volume number (1-based)
- `volumeTitle`: Human-readable volume title
- `chapters`: Array of chapter URLs

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key |

## Troubleshooting

### Common Translation Issues

1. **API Key Not Found**
   - Ensure `GEMINI_API_KEY` is set in `.env.local`
   - Verify the key is valid and has sufficient quota

2. **Network Timeouts**
   - Increase `--delayMs` to reduce request frequency
   - Decrease `--concurrency` to make fewer simultaneous requests

3. **Translation Failures**
   - Use `--cleanup` to reset failed chapters
   - Increase `--max-retries` for more attempts
   - Check the progress file for specific error messages

4. **Memory Issues**
   - Reduce `--concurrency` for memory-intensive processing
   - Process volumes one at a time instead of using `--volume all`

### Common Upload Issues

1. **Database Connection Issues**
   - Ensure PostgreSQL is running and accessible
   - Verify database connection string in your database configuration

2. **Volume Not Found**
   - Ensure the volume exists in the database before uploading chapters
   - Check that the novel ID and volume number are correct

3. **Chapter Already Exists**
   - This is normal behavior when resume is enabled (default)
   - Use `--no-resume` to process all chapters regardless of upload status

4. **File Not Found**
   - Ensure the base directory is correct
   - Check that chapter files exist in the expected location

### Debug Mode

For detailed debugging, you can modify the script to add more logging:

```typescript
// Add this in main.ts for verbose logging
console.log('Debug: Raw args:', process.argv);
console.log('Debug: Parsed args:', args);

// Add this in upload.ts for verbose logging
console.log('Debug: Files found:', chapterFiles);
console.log('Debug: Already uploaded chapters:', Array.from(uploadedChapters));
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Upload Output Example

```
🚀 Starting chapter upload process...
📁 Base directory: ./scripts/output/gemini
📖 Filter by Novel ID: 16
📚 Filter by Volume: 8
📝 Verbose logging: true
🔄 Resume: yes
🔍 Checking database for already uploaded chapters...
📊 Found 15 already uploaded chapters
📄 Found 18 chapter files to process
📄 Processing file: ./scripts/output/gemini/novel-16/volume-8/chapter_16_20240101_120000.md
✅ Successfully uploaded chapter: "The Final Chapter" (Novel: 16, Volume: 8, Chapter: 16)

📊 Upload Summary:
   ✅ Successfully uploaded: 3 chapters
   ⏭️  Skipped (already uploaded): 15 chapters
   ❌ Failed to upload: 0 chapters
   📄 Total processed: 18 chapters

🎉 All chapters uploaded successfully!
```

## Complete Workflow Example

Here's a complete workflow from translation to upload:

```bash
# 1. Translate all volumes for novel 16
npx tsx main.ts --novel-id 16 --volume all --concurrency 2

# 2. Check progress
ls -la scripts/output/gemini/novel-16/volume-7/.progress.json

# 3. Upload all chapters for novel 16 (skips already uploaded by default)
npx tsx upload.ts --novel-id 16 --verbose

# 4. Upload only volume 8 chapters (process all including already uploaded)
npx tsx upload.ts --novel-id 16 --volume 8 --no-resume

# 5. Upload with custom directory
npx tsx upload.ts --base-dir ./my-translations --novel-id 16 --verbose
```

## License

This project is licensed under the MIT License.