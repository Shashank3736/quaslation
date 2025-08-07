# Kakuyomu Fetcher and Translation CLI

Fetches novel chapters from Kakuyomu and writes per-volume JSON files plus an index.json summary, aligned to the app schema. Provides a translation CLI that mirrors this layout and writes translated outputs alongside the fetcher outputs.

Output layout:
- scripts/output/translation/<work-id-or-slug>/
  - index.json
  - volume-001.json
  - volume-002.json
  - ...
  - translated/
    - .progress.json
    - index.json
    - volume-001.json
    - volume-002.json
    - ...

Usage:
- Fetch: npx tsx scripts/translation/kakuyomu-fetch.ts --url https://kakuyomu.jp/works/16818093090655323692 --out scripts/output/translation --concurrency 2 --delayMs 1000 --pretty
- Translate: npx tsx scripts/translation/translate.ts --baseDir scripts/output/translation --work 16818093090655323692 --concurrency 2 --delayMs 1000 --pretty

CLI flags (fetch):
- --url: required Kakuyomu work URL
- --out: base output directory (default: scripts/output/translation)
- --concurrency: number of parallel episode requests (default: 2)
- --delayMs: delay between requests per worker in ms (default: 1000)
- --maxChapters: optional cap for testing
- --pretty: pretty-print JSON (default: true)
- --slug: optional custom slug

CLI flags (translate):
- --baseDir: base directory of fetch outputs (default: scripts/output/translation)
- --work: specific work slug/id directory to translate; if omitted, processes all works
- --volumes: comma-separated list of volume numbers to process (e.g., 1,2,5)
- --skip-chapters: comma-separated list of chapter serial numbers to exclude (e.g., 1,5,10,12-15)
- --concurrency: parallel translation requests (default: 2)
- --delayMs: delay between requests per worker in ms (default: 1000)
- --pretty: pretty-print JSON outputs (default: false)
- --overwrite: force re-translation even if source content unchanged (default: false)
- --maxChapters: per-volume cap for testing

Environment:
- GRADIO_API_URL: Required. Gradio backend URL hosting /translate_text. Example: http://127.0.0.1:7860

Translation behavior:
- Translates only chapter title and richText.text fields.
- Leaves richText.markdown and richText.html unchanged.
- For index.json, writes translated/index.json with title preserved; synopsis is not translated.
- Writes outputs to <work>/translated/, mirroring file names from source (index.json, volume-XXX.json).
- Progress is tracked in translated/.progress.json.

Resume and skip:
- The translator stores a SHA-256 hash derived from chapter.title + richText.text in translated/.progress.json per chapter slug.
- On subsequent runs, if --overwrite is not provided and the source hash matches a completed entry, the chapter is skipped.
- On failures, status is recorded as failed, and the script continues.

Concurrency and rate limiting:
- Worker pool with configurable concurrency and per-worker delay (--concurrency and --delayMs).
- Default concurrency 2 and delayMs 1000 to be gentle to the API.
- Retries with exponential backoff for transient translation failures.

Examples:
- Translate one work all volumes pretty printed:
  - npx tsx scripts/translation/translate.ts --work 16818093090655323692 --pretty
- Translate selected volumes 1 and 2:
  - npx tsx scripts/translation/translate.ts --work 16818093090655323692 --volumes 1,2
- Force re-translation of everything for a work:
  - npx tsx scripts/translation/translate.ts --work 16818093090655323692 --overwrite
- Skip specific chapters by their global serial number (supports ranges):
  - npx tsx scripts/translation/translate.ts --work 16818093090655323692 --skip-chapters 1,3,5-10
- Smoke test first 3 chapters of each selected volume with higher concurrency:
  - npx tsx scripts/translation/translate.ts --work 16818093090655323692 --volumes 1,2 --maxChapters 3 --concurrency 4 --delayMs 500

Data schemas:
- See scripts/translation/types.ts for IndexJson, VolumeJson, ChapterEntry, and RichTextPayload interfaces.
- The translator preserves the same shapes in outputs written to the translated directory.

Notes:
- Ensure GRADIO_API_URL is reachable before running translate.
- If you rename or move source files, previously recorded progress hashes will no longer match. Use --overwrite to force new translations when needed.
- The translator logs per-volume progress and writes progress frequently to avoid losing state on interruptions.