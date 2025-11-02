import path from 'path';
import { promises as fs } from 'fs';
import crypto from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Client } from '@gradio/client';
import dotenv from 'dotenv';

import type { ChapterEntry, IndexJson, VolumeJson } from './types';
import { ensureDir, joinOut, volumeFileName, writeJson, writeJsonPretty } from './utils/io';

// Load .env.local
dotenv.config({ path: '.env.local' });

type Args = {
  baseDir: string;          // scripts/output/translation
  work?: string;            // specific work slug/id
  volumes?: number[];       // specific volumes to process
  skipChapters?: number[];  // specific chapter serials to skip
  concurrency: number;      // default 2
  delayMs: number;          // default 1000
  pretty: boolean;          // default false
  overwrite: boolean;       // default false
  maxChapters?: number;     // per volume cap for testing
};

type ProgressChapterStatus = 'completed' | 'failed' | 'skipped';

interface ProgressData {
  workId: string;
  lastUpdated: string;
  chapters: {
    [chapterSlug: string]: {
      sourceHash: string;
      status: ProgressChapterStatus;
      translatedAt: string;
    };
  };
}

function parseArgs(argv: string[]): Args {
  const args: any = { baseDir: 'scripts/output/translation', concurrency: 2, delayMs: 1000, pretty: false, overwrite: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--baseDir') args.baseDir = argv[++i];
    else if (a === '--work') args.work = argv[++i];
    else if (a === '--volumes') {
      const list = (argv[++i] || '').split(',').map(s => parseInt(s.trim(), 10)).filter(n => !Number.isNaN(n));
      args.volumes = list.length ? list : undefined;
    }
    else if (a === '--skip-chapters') {
      const listStr = argv[++i] || '';
      const list = listStr.split(',').flatMap(s => {
        const trimmed = s.trim();
        if (trimmed.includes('-')) {
          const [start, end] = trimmed.split('-').map(n => parseInt(n, 10));
          if (!Number.isNaN(start) && !Number.isNaN(end) && start <= end) {
            return Array.from({ length: end - start + 1 }, (_, k) => start + k);
          }
        }
        const num = parseInt(trimmed, 10);
        return Number.isNaN(num) ? [] : [num];
      });
      args.skipChapters = list.length > 0 ? [...new Set(list)] : undefined;
    }
    else if (a === '--concurrency') args.concurrency = parseInt(argv[++i], 10);
    else if (a === '--delayMs') args.delayMs = parseInt(argv[++i], 10);
    else if (a === '--pretty') args.pretty = true;
    else if (a === '--overwrite') args.overwrite = true;
    else if (a === '--maxChapters') args.maxChapters = parseInt(argv[++i], 10);
  }
  return args as Args;
}

async function listWorks(baseDir: string): Promise<string[]> {
  const entries = await fs.readdir(baseDir, { withFileTypes: true });
  return entries.filter(e => e.isDirectory()).map(e => e.name);
}

async function loadJson<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw) as T;
}

function sha256(input: string): string {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

function chapterSourceHash(ch: ChapterEntry): string {
  return sha256(`${ch.title}\n---\n${ch.richText.text}`);
}

async function withConcurrency<T, R>(items: T[], limit: number, delayMs: number, worker: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length) as any;
  let i = 0;
  const runners = new Array(Math.min(limit, items.length)).fill(0).map(async () => {
    while (i < items.length) {
      const myIndex = i++;
      const item = items[myIndex];
      try {
        const res = await worker(item, myIndex);
        results[myIndex] = res;
      } finally {
        if (delayMs > 0) await sleep(delayMs);
      }
    }
  });
  await Promise.all(runners);
  return results;
}

function sleep(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

// Gradio translation wrapper mirroring app translateText
async function translateViaGradio(text: string): Promise<string> {
  const url = process.env.GRADIO_API_URL;
  if (!url) throw new Error('GRADIO_API_URL is not set');
  const client = await Client.connect(url);
  const result = await client.predict('/translate_text', {
    text,
    source_lang: 'Auto Detect',
    target_lang: 'English',
  });
  if (!result?.data || (result.data as string[]).length === 0) {
    throw new Error('Translation Failed.');
  }
  return (result.data as string[]).map(str => str.trim()).join('');
}

// Gemini translation wrapper
async function translateViaGemini(text: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `Translate the following Japanese text to English. Do not add any extra commentary, formatting, or notes. Just provide the raw translated text.\n\n${text}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const translatedText = response.text();
  return translatedText.trim();
}

async function translateWithRetry(text: string, retries = 3, baseDelayMs = 1000): Promise<string> {
  let attempt = 0;
  while (true) {
    try {
      // Default to Gemini, but could swap to translateViaGradio if needed
      return await translateViaGemini(text);
    } catch (err) {
      attempt += 1;
      if (attempt > retries) throw err;
      const wait = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(`   ⚠ translate retry ${attempt}/${retries} after ${wait}ms`);
      await sleep(wait);
    }
  }
}

async function processWork(baseDir: string, work: string, args: Args): Promise<void> {
  const workDir = path.join(baseDir, work);
  const indexPath = path.join(workDir, 'index.json');
  const translatedDir = path.join(workDir, 'translated');
  await ensureDir(translatedDir);

  // Load index.json for workId and volume metadata
  const indexJson = await loadJson<IndexJson>(indexPath);

  // Prepare progress file
  const progressPath = path.join(translatedDir, '.progress.json');
  let progress: ProgressData = {
    workId: indexJson.workId,
    lastUpdated: new Date().toISOString(),
    chapters: {}
  };
  try {
    const existing = await loadJson<ProgressData>(progressPath);
    if (existing && existing.workId === indexJson.workId) {
      progress = existing;
    }
  } catch {
    // ignore, will create fresh
  }

  // Translate index title only (per requirements)
  const translatedIndex: IndexJson = {
    ...indexJson,
    title: indexJson.title,
  };

  try {
    translatedIndex.title = args.overwrite ? await translateWithRetry(indexJson.title) : translatedIndex.title;
  } catch {
    // If overwrite is false, keep original. If true and translation fails, keep original too.
    translatedIndex.title = indexJson.title;
  }

  // write translated/index.json
  const writeIndex = args.pretty ? writeJsonPretty : writeJson;
  await writeIndex(path.join(translatedDir, 'index.json'), translatedIndex);

  // Determine volumes to process
  const allVolumes = indexJson.volumes.map(v => v.number);
  const selectedVolumes = args.volumes && args.volumes.length ? allVolumes.filter(n => args.volumes!.includes(n)) : allVolumes;

  for (const volNum of selectedVolumes) {
    const fileName = volumeFileName(volNum);
    const volPath = joinOut(workDir, fileName);

    // Check file existence (volume file may not exist)
    try { await fs.access(volPath); } catch { continue; }

    const volJson = await loadJson<VolumeJson>(volPath);

    // Prepare chapters list with optional cap
    const chapters = Array.isArray(volJson.chapters) ? volJson.chapters.slice(0, typeof args.maxChapters === 'number' ? args.maxChapters : volJson.chapters.length) : [];

    console.log(`▶ Translating ${work}/${fileName} chapters=${chapters.length} (concurrency=${args.concurrency}, delayMs=${args.delayMs})`);

    // Build tasks
    type Task = { chapter: ChapterEntry; idx: number; };
    const tasks: Task[] = chapters.map((ch, idx) => ({ chapter: ch, idx }));

    // Process with concurrency
    await withConcurrency(tasks, args.concurrency, args.delayMs, async (task) => {
      const ch = task.chapter;
      const sourceHash = chapterSourceHash(ch);

      // Handle --skip-chapters flag
      if (args.skipChapters?.includes(ch.serial)) {
        progress.chapters[ch.slug] = {
          sourceHash,
          status: 'skipped',
          translatedAt: new Date().toISOString(),
        };
        return; // skip via explicit flag
      }

      // Skip logic based on hash unless overwrite
      if (!args.overwrite) {
        const existing = progress.chapters[ch.slug];
        if (existing && existing.sourceHash === sourceHash && existing.status === 'completed') {
          return; // skip unchanged
        }
      }

      // Translate title and richText.text only
      try {
        const newTitle = await translateWithRetry(ch.title);
        const newText = await translateWithRetry(ch.richText.text);

        // Mutate in place
        ch.title = newTitle;
        ch.richText.text = newText;
        // html and markdown left unchanged by requirement

        progress.chapters[ch.slug] = {
          sourceHash,
          status: 'completed',
          translatedAt: new Date().toISOString(),
        };
      } catch (err) {
        console.error(`   ❌ Failed to translate chapter ${ch.slug}:`, (err as Error)?.message || err);
        progress.chapters[ch.slug] = {
          sourceHash,
          status: 'failed',
          translatedAt: new Date().toISOString(),
        };
      } finally {
        progress.lastUpdated = new Date().toISOString();
        await writeJson(progressPath, progress); // persist frequently
      }
    });

    // Filter for completed chapters
    const translatedVolJson: VolumeJson = {
      ...volJson,
      chapters: volJson.chapters.filter(ch => progress.chapters[ch.slug]?.status === 'completed'),
    };

    // Write translated volume file
    const outVolPath = path.join(translatedDir, fileName);
    const writeVol = args.pretty ? writeJsonPretty : writeJson;
    await writeVol(outVolPath, translatedVolJson);
    console.log(`   ✓ Wrote ${outVolPath} with ${translatedVolJson.chapters.length} translated chapters`);
  }
}

async function main() {
  const args = parseArgs(process.argv);

  // Discover works
  const works = args.work ? [args.work] : await listWorks(args.baseDir);
  if (!works.length) {
    console.error('No works found in baseDir:', args.baseDir);
    process.exit(1);
  }

  console.log(`Works to process: ${works.join(', ')}`);

  for (const work of works) {
    try {
      await processWork(args.baseDir, work, args);
    } catch (err) {
      console.error(`❌ Work failed ${work}:`, (err as Error)?.message || err);
    }
  }

  console.log('✅ Done.');
}

if (require.main === module) {
  main().catch(err => {
    console.error('❌ Failed:', err?.message || err);
    process.exit(1);
  });
}