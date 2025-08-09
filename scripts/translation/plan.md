# Translation CLI: Architectural Plan

This document outlines the architecture for a Node.js/TypeScript CLI script to translate raw novel data fetched from Kakuyomu.

## 1. Core Objective

The primary goal is to create a script, `scripts/translation/translate.ts`, that processes JSON files located in `scripts/output/translation/<work-id>`. It will translate specific text fields using a Gradio backend and write the results to a new `translated` subdirectory, preserving the original data structure.

The script must be resilient, efficient, and support resuming from interruptions.

## 2. Key Features & Confirmed Logic

- **Translation Target**: Translate `title` and `richText.text` fields within each chapter of `volume-XXX.json` files. The `index.json`'s `title` will also be translated, but its `synopsis` will be skipped.
- **HTML/Markdown Handling**: The original `richText.html` and `richText.markdown` fields will be preserved as-is in the output. No regeneration from translated text will occur.
- **Output Location**: Translated files will be written to `scripts/output/translation/<work-id>/translated/`. The output will mirror the input structure (e.g., `translated/index.json`, `translated/volume-001.json`).
- **Persistence & Resume**: Progress will be tracked in a `scripts/output/translation/<work-id>/translated/.progress.json` file. This allows the script to be stopped and resumed.
- **Skip Unchanged**: A content hash of the original `title` and `richText.text` will be stored. If the source content hasn't changed since the last successful translation, the chapter will be skipped unless the `--overwrite` flag is used.
- **Concurrency**: The script will use a worker pool to make concurrent requests to the Gradio API, with configurable limits.
- **Defaults**: Default settings will be `concurrency: 2` and `delayMs: 1000` to align with the existing fetcher script's behavior.

## 3. Workflow Diagram

Here is a Mermaid diagram illustrating the end-to-end process for a single work.

```mermaid
graph TD
    A[Start CLI: node translate.ts --work <work-id>] --> B{Load Config};
    B --> C[Discover Volumes for <work-id>];
    C --> D{Load <work-id>/index.json};
    D --> E{Translate index.json title};
    E --> F[Write translated/index.json];
    F --> G{For each volume-XXX.json};
    G --> H{Load volume-XXX.json};
    H --> I{Load or Create translated/.progress.json};
    I --> J{For each chapter in volume};
    J --> K{Calculate Content Hash (title + richText.text)};
    K --> L{Skip if hash exists in .progress.json AND --overwrite is false?};
    L -- Yes --> J;
    L -- No --> M[Add to Translation Queue];
    M --> N[Process Queue with Worker Pool];
    N --> O{Translate Text via Gradio API};
    O --> P{Update Volume JSON in memory};
    P --> Q{Update .progress.json with hash & status};
    Q --> J;
    J -- All chapters done --> R[Write translated/volume-XXX.json];
    R --> G;
    G -- All volumes done --> S[End];

    subgraph "Gradio API Interaction"
        direction LR
        O -- Request: text --> O1[translate_text endpoint];
        O1 -- Response: translated_text --> O;
    end

    subgraph "File System I/O"
        direction TB
        C -- reads --> FS1[scripts/output/translation/<work-id>/];
        D -- reads --> FS2[.../<work-id>/index.json];
        F -- writes --> FS3[.../<work-id>/translated/index.json];
        H -- reads --> FS4[.../<work-id>/volume-XXX.json];
        I -- reads/writes --> FS5[.../<work-id>/translated/.progress.json];
        R -- writes --> FS6[.../<work-id>/translated/volume-XXX.json];
    end
```

## 4. CLI Interface

The script will be executed via `ts-node` and accept the following command-line arguments:

| Flag            | Description                                                                 | Default                            |
|-----------------|-----------------------------------------------------------------------------|------------------------------------|
| `--baseDir`     | The base directory for translation input/output.                            | `scripts/output/translation`       |
| `--work`        | A specific work ID to process. If not provided, all works are processed.    | `null` (all)                       |
| `--volumes`     | A comma-separated list of volume numbers to process (e.g., "1,2,5").        | `null` (all)                       |
| `--concurrency` | The number of parallel translation requests.                                | `2`                                |
| `--delayMs`     | The delay in milliseconds between requests per worker.                      | `1000`                             |
| `--pretty`      | Output JSON files in a human-readable (pretty-printed) format.              | `false`                            |
| `--overwrite`   | Force re-translation of chapters that have already been processed.          | `false`                            |
| `--maxChapters` | For testing. Limits the total number of chapters to process per volume.     | `null` (unlimited)                 |

**Environment Variables:**

- `GRADIO_API_URL`: **Required**. The URL for the Gradio API endpoint.

## 5. Data Structures

The script will adhere to the schemas defined in `scripts/translation/types.ts`.

### `.progress.json` Schema

This file is critical for resume and skip functionality.

```typescript
// Example structure for translated/.progress.json
interface ProgressData {
  workId: string;
  lastUpdated: string; // ISO 8601 timestamp
  chapters: {
    [chapterId: string]: {
      sourceHash: string; // SHA-256 hash of original title + richText.text
      status: 'completed' | 'failed';
      translatedAt: string; // ISO 8601 timestamp
    };
  };
}
```

## 6. Error Handling and Retries

The Gradio API client will include a retry mechanism with exponential backoff to handle transient network errors or API rate limits. If a chapter consistently fails translation after several retries, its status will be marked as `failed` in `.progress.json`, and the script will move on to the next chapter.

---

This plan provides a comprehensive blueprint for the implementation phase.