# Enhanced Novel Translation System

A powerful CLI tool for translating web novels from Japanese to English using Google's Gemini AI. This system supports multiple volumes, progress tracking, resume functionality, and concurrent processing.

## Features

- ✅ **Multi-volume support** - Handle multiple volumes with different novel IDs
- 📊 **Progress tracking** - Track translation progress and resume from where you left off
- 🔄 **Resume functionality** - Continue failed or interrupted translations
- ⚡ **Concurrent processing** - Process multiple chapters simultaneously
- 🛡️ **Error handling** - Robust retry mechanisms with exponential backoff
- 📁 **Organized output** - Files organized by novel ID and volume number
- 🧹 **Cleanup mode** - Reset failed chapters for retry
- 📝 **Rich metadata** - Comprehensive frontmatter in generated markdown files

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

### Basic Usage

```bash
# Translate all volumes for novel ID 16 (default)
npx tsx main.ts

# Translate a specific volume
npx tsx main.ts --volume 7

# Translate multiple specific volumes
npx tsx main.ts --volume 7 --volume 8
```

### Advanced Options

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

### Command Line Arguments

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

## Output Structure

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

## Workflow Examples

### 1. First-time Translation

```bash
# Start fresh translation of all volumes
npx tsx main.ts --novel-id 16 --volume all
```

### 2. Resume Failed Translations

```bash
# Continue from where you left off
npx tsx main.ts --resume --volume 7
```

### 3. Retry Failed Chapters

```bash
# Reset failed chapters and retry them
npx tsx main.ts --cleanup --volume 7 --max-retries 5
```

### 4. High-Performance Processing

```bash
# Process with higher concurrency and shorter delays
npx tsx main.ts --concurrency 3 --delayMs 300 --volume all
```

## Progress Tracking

The system automatically tracks progress and can:

- **Resume** from interrupted translations
- **Skip** already completed chapters
- **Retry** failed chapters with exponential backoff
- **Report** progress summaries for each volume

### Status Types

- `pending` - Chapter not yet processed
- `completed` - Chapter successfully translated
- `failed` - Chapter failed to translate

## Error Handling

The system includes robust error handling:

- **Automatic retries** with exponential backoff
- **Graceful degradation** for network issues
- **Detailed error logging** for troubleshooting
- **Failed chapter tracking** for later retry

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

### Common Issues

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

### Debug Mode

For detailed debugging, you can modify the script to add more logging:

```typescript
// Add this in main.ts for verbose logging
console.log('Debug: Raw args:', process.argv);
console.log('Debug: Parsed args:', args);
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Chapter Upload Tool

The enhanced upload tool (`upload.ts`) allows you to upload translated chapters to your database with advanced filtering and logging options.

### Upload Features

- ✅ **Recursive directory scanning** - Finds chapter files in nested directories
- 📊 **Advanced filtering** - Filter by novel ID, volume number, or skip existing chapters
- 📝 **Enhanced logging** - Detailed progress tracking and error reporting
- 🔍 **Duplicate prevention** - Skip chapters that already exist in database
- 📁 **Flexible base directories** - Support custom output directories
- 🛡️ **Error recovery** - Graceful handling of upload failures

### Upload Usage

```bash
# Upload all chapters from default directory
npx tsx upload.ts

# Upload chapters for specific novel
npx tsx upload.ts --novel-id 16

# Upload chapters for specific novel and volume
npx tsx upload.ts --novel-id 16 --volume 7

# Skip existing chapters to avoid duplicates
npx tsx upload.ts --skip-existing

# Enable verbose logging for detailed output
npx tsx upload.ts --verbose

# Use custom base directory
npx tsx upload.ts --base-dir ./my-translations
```

### Upload Command Line Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `--base-dir PATH` | Base directory containing chapter files | ./scripts/output/gemini |
| `--novel-id ID` | Filter by specific novel ID | none |
| `--volume NUMBER` | Filter by specific volume number | none |
| `--skip-existing` | Skip chapters that already exist in database | false |
| `--verbose, -v` | Enable verbose logging | false |
| `--help, -h` | Show help message | false |

### Upload Output Example

```
🚀 Starting chapter upload process...
📁 Base directory: ./scripts/output/gemini
📖 Filter by Novel ID: 16
📚 Filter by Volume: 7
⏭️  Skip existing: false
📝 Verbose logging: true
📄 Found 18 chapter files to process
📄 Processing file: ./scripts/output/gemini/novel-16/volume-7/chapter_1_20240101_120000.md
✅ Successfully uploaded chapter: "The Beginning" (Novel: 16, Volume: 7, Chapter: 1)

📊 Upload Summary:
   ✅ Successfully uploaded: 17 chapters
   ❌ Failed to upload: 1 chapters
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

# 3. Upload all chapters for novel 16
npx tsx upload.ts --novel-id 16 --verbose

# 4. Upload only volume 7 chapters
npx tsx upload.ts --novel-id 16 --volume 7 --skip-existing
```

## License

This project is licensed under the MIT License.