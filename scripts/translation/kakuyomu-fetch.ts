import path from 'path';
import { fetchWithRetry, sleep } from './utils/http';
import { parseWorkPage, parseEpisodePage } from './utils/parse';
import { sanitizeHtml, htmlToText, htmlToMarkdown } from './utils/convert';
import { ensureDir, joinOut, safeSlug, volumeFileName, writeJsonPretty } from './utils/io';
import type { ChapterEntry, IndexJson, VolumeJson, VolumeMeta } from './types';

// Simple CLI args parsing
type Args = {
  url: string;
  out: string;
  concurrency: number;
  delayMs: number;
  maxChapters?: number;
  pretty: boolean;
  slug?: string;
};

function parseArgs(argv: string[]): Args {
  const args: any = { out: 'scripts/output/translation', concurrency: 2, delayMs: 1000, pretty: true };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--url') args.url = argv[++i];
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--concurrency') args.concurrency = parseInt(argv[++i], 10);
    else if (a === '--delayMs') args.delayMs = parseInt(argv[++i], 10);
    else if (a === '--maxChapters') args.maxChapters = parseInt(argv[++i], 10);
    else if (a === '--pretty') args.pretty = true;
    else if (a === '--slug') args.slug = argv[++i];
  }
  if (!args.url) {
    console.error('Usage: tsx scripts/translation/kakuyomu-fetch.ts --url <work-url> [--out dir] [--concurrency N] [--delayMs ms] [--maxChapters N] [--slug custom]');
    process.exit(1);
  }
  return args as Args;
}

async function withConcurrency<T, R>(items: T[], limit: number, delayMs: number, worker: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length) as any;
  let i = 0;
  const runners = new Array(Math.min(limit, items.length)).fill(0).map(async (_, ridx) => {
    while (i < items.length) {
      const myIndex = i++;
      const item = items[myIndex];
      try {
        const res = await worker(item, myIndex);
        results[myIndex] = res;
      } finally {
        // throttle per worker
        if (delayMs > 0) await sleep(delayMs);
      }
    }
  });
  await Promise.all(runners);
  return results;
}

async function main() {
  const args = parseArgs(process.argv);
  const { url, out, concurrency, delayMs, maxChapters, slug: customSlug } = args;

  console.log('▶ Fetching work page:', url);
  const workHtml = await fetchWithRetry(url);
  const work = parseWorkPage(workHtml, url);

  const slug = customSlug || safeSlug(work.title) || work.workId;
  const baseOut = path.join(out, slug || work.workId);

  await ensureDir(baseOut);

  // Prepare synopsis rich text
  const synopsisHtml = work.synopsisHtml ? sanitizeHtml(work.synopsisHtml) : '';
  const synopsisText = synopsisHtml ? htmlToText(synopsisHtml) : '';
  const synopsisMarkdown = synopsisHtml ? htmlToMarkdown(synopsisHtml) : '';

  // Build episode tasks preserving volume structure
  type EpisodeTask = { volumeIdx: number; volumeNumber: number; volumeTitle: string; episodeId: string; url: string; titleFromToc: string; };
  const tasks: EpisodeTask[] = [];
  work.volumes.forEach((v, vIdx) => {
    v.episodes.forEach(ep => {
      tasks.push({
        volumeIdx: vIdx,
        volumeNumber: v.number,
        volumeTitle: v.title,
        episodeId: ep.episodeId,
        url: ep.url,
        titleFromToc: ep.title,
      });
    });
  });

  const totalToProcess = typeof maxChapters === 'number' ? Math.min(maxChapters, tasks.length) : tasks.length;
  const slice = tasks.slice(0, totalToProcess);

  console.log(`▶ Episodes to fetch: ${slice.length} (concurrency=${concurrency}, delayMs=${delayMs})`);

  let counterGlobalSerial = 0;
  const perVolumeAccumulator = new Map<number, ChapterEntry[]>();

  await withConcurrency(slice, concurrency, delayMs, async (task, idx) => {
    const epHtml = await fetchWithRetry(task.url);
    const parsed = parseEpisodePage(epHtml);

    const htmlClean = sanitizeHtml(parsed.html);
    const text = htmlToText(htmlClean);
    const md = htmlToMarkdown(htmlClean);

    // assign serial global and number per volume
    counterGlobalSerial += 1;
    const currentList = perVolumeAccumulator.get(task.volumeNumber) || [];
    const chapterNumber = currentList.length + 1;

    const entry: ChapterEntry = {
      premium: false,
      slug: `episode-${task.episodeId}`,
      serial: counterGlobalSerial,
      number: chapterNumber,
      title: parsed.title || task.titleFromToc,
      createdAt: parsed.publishedAt || new Date().toISOString(),
      publishedAt: parsed.publishedAt || new Date().toISOString(),
      updatedAt: parsed.updatedAt || parsed.publishedAt || new Date().toISOString(),
      richText: { text, html: htmlClean, markdown: md },
      source: {
        url: task.url,
        episodeId: task.episodeId,
      }
    };

    currentList.push(entry);
    perVolumeAccumulator.set(task.volumeNumber, currentList);

    console.log(`   ✓ [v${String(task.volumeNumber).padStart(2,'0')}] ${entry.title}`);
    return entry;
  });

  // Write per-volume files and build volumes meta
  const volumeMetas: VolumeMeta[] = [];
  for (const v of work.volumes) {
    const chapters = perVolumeAccumulator.get(v.number) || [];
    const volJson: VolumeJson = {
      workId: work.workId,
      volume: { number: v.number, title: v.title },
      chapters
    };
    const fileName = volumeFileName(v.number);
    const filePath = joinOut(baseOut, fileName);
    await writeJsonPretty(filePath, volJson);
    volumeMetas.push({
      number: v.number,
      title: v.title,
      chapters: chapters.length,
      file: fileName
    });
  }

  // Build and write index.json
  const indexJson: IndexJson = {
    workUrl: url,
    workId: work.workId,
    slug,
    title: work.title,
    thumbnail: null,
    synopsis: {
      text: synopsisText,
      html: synopsisHtml,
      markdown: synopsisMarkdown,
    },
    volumes: volumeMetas.sort((a, b) => a.number - b.number),
    totalChapters: volumeMetas.reduce((sum, v) => sum + (v.chapters || 0), 0),
    generatedAt: new Date().toISOString()
  };
  await writeJsonPretty(joinOut(baseOut, 'index.json'), indexJson);

  console.log('\n✅ Done.');
  console.log('   Output:', baseOut);
  console.log('   Files:');
  console.log('   - index.json');
  volumeMetas.forEach(v => console.log(`   - ${v.file}`));
}

main().catch(err => {
  console.error('❌ Failed:', err?.message || err);
  process.exit(1);
});