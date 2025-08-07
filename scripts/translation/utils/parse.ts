import { load, Cheerio, CheerioAPI } from 'cheerio';

export type TocEpisode = {
  episodeId: string;
  url: string;
  title: string;
  publishedAt?: string;
};

export type TocVolume = {
  number: number;
  title: string;
  episodes: TocEpisode[];
};

export type WorkParseResult = {
  workId: string;
  title: string;
  synopsisHtml: string | null;
  synopsisText: string | null;
  synopsisMarkdown: string | null; // to be filled by convert util later if needed
  volumes: TocVolume[];
};

export type EpisodeParseResult = {
  title: string;
  html: string;        // cleaned inner HTML
  publishedAt?: string;
  updatedAt?: string;
};

export function extractWorkIdFromUrl(url: string): string {
  const m = url.match(/works\/(\d+)/);
  if (!m) throw new Error('Unable to determine workId from URL');
  return m[1];
}

export function parseWorkPage(html: string, workUrl: string): WorkParseResult {
  const $ = load(html);
  const workId = extractWorkIdFromUrl(workUrl);

  // Title from og:title or main heading
  const title = $('meta[property="og:title"]').attr('content')
    || $('h1').first().text().trim()
    || $('title').text().trim()
    || 'Unknown Title';

  // Synopsis: prioritize long-form introduction blocks; exclude catchphrases/short blurbs
  let synopsisHtml: string | null = null;

  // Remove known short tagline/catchphrase blocks to avoid false synopsis
  $('.catchphrase, .work-catchphrase, .tagline, .lead, .summary-short').remove();

  // Common Kakuyomu introduction containers (long-form)
  const introCandidates: string[] = [
    '#work-introduction',
    '.work-introduction',
    '.widget-work-introduction',
    'section#introduction',
    'section.work-introduction',
    'article .introduction',
    'article .work-introduction',
    // Sometimes inside main content
    'main .work-introduction',
    'main [class*="introduction"]'
  ];

  function cleanIntro(node: Cheerio<any>) {
    node.find('script, style, noscript, iframe, link, meta').remove();
    node.find(
      [
        '.share','.social','.footer','.next','.prev','.ad','.ads','.advertisement',
        '.widget-ad', '#worksBottomAd', '[id^="js-ad-"]', '[id^="ad-"]'
      ].join(',')
    ).remove();
  }

  for (const sel of introCandidates) {
    const node = $(sel).first();
    if (node.length) {
      cleanIntro(node);
      // Require some minimum length to ensure we didn't pick a short blurb
      const html = (node.html() || '').trim();
      const textLen = node.text().trim().length;
      if (html && textLen >= 80) {
        synopsisHtml = html;
        break;
      }
    }
  }

  // If not found, try a "概要" or "あらすじ" header section capturing until next header
  if (!synopsisHtml) {
    const overviewHeader = $('h1,h2,h3,h4')
      .filter((_, el) => {
        const t = $(el).text().trim();
        return /概要|あらすじ|紹介|イントロダクション/.test(t);
      })
      .first();
    if (overviewHeader.length) {
      let content = '';
      let cur = overviewHeader.next();
      while (cur.length && !/^(H1|H2|H3|H4)$/i.test(cur.prop('tagName') || '')) {
        // stop if we hit obvious non-content widgets
        if (cur.is('.share, .social, .footer, .ad, .ads, .advertisement')) break;
        content += $.html(cur);
        cur = cur.next();
      }
      const html = (content || '').trim();
      const txt = load(`<div>${html}</div>`)('div').text().trim();
      synopsisHtml = txt.length >= 80 ? html : null;
    }
  }

  // Meta description fallbacks (og:description preferred) if still missing
  if (!synopsisHtml) {
    const ogDesc = $('meta[property="og:description"]').attr('content') || '';
    const metaDesc = $('meta[name="description"]').attr('content') || '';
    const desc = ogDesc || metaDesc;
    synopsisHtml = desc ? `<p>${desc}</p>` : null;
  }

  // Preserve multi-paragraph text by reading block elements with breaks
  let synopsisText: string | null = null;
  if (synopsisHtml) {
    const _$ = load(`<div id="synopsis-root">${synopsisHtml}</div>`);
    const blocks: string[] = [];
    _$('#synopsis-root')
      .find('p, h1, h2, h3, h4, h5, h6, li, pre, blockquote, div, section, article')
      .each((_, el) => {
        const txt = _$(el).text().replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
        if (txt) blocks.push(txt);
      });
    synopsisText = blocks.length ? blocks.join('\n\n') : _$('#synopsis-root').text().trim();
  }

  // TOC parsing: sections under "目次" that group chapters by volumes like "第一章 ..."
  // Strategy: find links matching /works/{workId}/episodes/{episodeId} and group them by the nearest preceding chapter header containing "章"
  const allEpisodeLinks = $(`a[href*="/works/${workId}/episodes/"]`).toArray();

  type Group = { headerTitle: string; episodes: TocEpisode[] };
  const groups: Group[] = [];

  // Build a map of header positions
  const headers = $('h2, h3, h4').filter((_, el) => $(el).text().includes('章')).toArray();

  function findNearestHeaderTitle(el: any): string {
    // Walk backwards to find the closest header above this link
    let node: any = el;
    while (node && node.prev) {
      node = node.prev;
      if (node.type === 'tag' && ['h2', 'h3', 'h4'].includes((node.tagName || '').toLowerCase())) {
        const txt = $(node).text().trim();
        if (txt.includes('章')) return txt;
      }
    }
    // If not found in siblings, walk up to parent and repeat
    let parent: any = el.parent;
    while (parent) {
      // Check previous siblings at this level
      let sibling = parent.prev;
      while (sibling) {
        if (sibling.type === 'tag' && ['h2', 'h3', 'h4'].includes((sibling.tagName || '').toLowerCase())) {
          const txt = $(sibling).text().trim();
          if (txt.includes('章')) return txt;
        }
        sibling = sibling.prev;
      }
      parent = parent.parent;
    }
    return '未分類';
  }

  const seenEpisodeIds = new Set<string>();
  for (const a of allEpisodeLinks) {
    const href = $(a).attr('href')!;
    const em = href.match(/episodes\/(\d+)/);
    if (!em) continue;
    const episodeId = em[1];

    // Skip if we've already processed this episode ID
    if (seenEpisodeIds.has(episodeId)) {
      continue;
    }
    seenEpisodeIds.add(episodeId);

    const url = new URL(href, 'https://kakuyomu.jp').toString();
    const epTitle = $(a).text().trim() || `Episode ${episodeId}`;

    const headerTitle = headers.length ? findNearestHeaderTitle(a) : '未分類';

    // find or create group
    let group = groups.find(g => g.headerTitle === headerTitle);
    if (!group) {
      group = { headerTitle, episodes: [] };
      groups.push(group);
    }
    group.episodes.push({ episodeId, url, title: epTitle });
  }

  // Normalize groups order as they appear on page: using the index in DOM by first episode appearance
  groups.sort((g1, g2) => {
    const first1 = g1.episodes[0]?.episodeId || '';
    const first2 = g2.episodes[0]?.episodeId || '';
    return first1.localeCompare(first2);
  });

  // Assign volume numbers incrementally; attempt to parse "第NN章" numeric
  function parseVolumeNumber(title: string, idx: number): number {
    const m = title.match(/第\s*([一二三四五六七八九十百\d]+)\s*章/);
    if (!m) return idx + 1;
    const token = m[1];
    if (/^\d+$/.test(token)) return parseInt(token, 10);
    // Basic kanji numerals conversion for 1-10 and combinations up to 20
    const map: Record<string, number> = { '一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10 };
    let val = 0;
    if (token.length === 1 && map[token]) return map[token];
    // simple forms like 十一, 十二, 二十, 二十一
    if (token.includes('十')) {
      const parts = token.split('十');
      const tens = parts[0] === '' ? 1 : (map[parts[0]] || 0);
      const ones = parts[1] === '' ? 0 : (map[parts[1]] || 0);
      val = tens * 10 + ones;
      if (val > 0) return val;
    }
    return idx + 1;
  }

  const volumes = groups.map((g, idx) => ({
    number: parseVolumeNumber(g.headerTitle, idx),
    title: g.headerTitle,
    episodes: g.episodes
  }));

  return {
    workId,
    title,
    synopsisHtml,
    synopsisText,
    synopsisMarkdown: null,
    volumes
  };
}

export function parseEpisodePage(html: string): EpisodeParseResult {
  const $ = load(html);

  const title =
    $('#contentMain-header .chapter-title').first().text().trim() || // Kakuyomu specific
    $('#contentMain-header .js-episode-title').first().text().trim() || // Kakuyomu specific
    $('#contentMain-header').first().text().trim() || // Kakuyomu specific
    $('meta[property="og:title"]').attr('content') ||
    $('h1').first().text().trim() ||
    $('title').text().trim() ||
    'Untitled';

  // timestamps
  const published = $('meta[property="article:published_time"]').attr('content')
    || $('time[datetime]').first().attr('datetime')
    || undefined;

  const updated = $('meta[property="article:modified_time"]').attr('content')
    || $('time[datetime]').eq(1).attr('datetime')
    || undefined;

  // article body: try most specific inner content first, then widen
  let container = $('#contentMain-inner .widget-episodeBody, #contentMain-inner [class*="episodeBody"]').first();
  if (!container.length) container = $('#contentMain-inner').first();
  if (!container.length) container = $('article [itemprop="articleBody"]').first();
  if (!container.length) container = $('article').first();
  if (!container.length) container = $('[itemprop="articleBody"]').first();
  if (!container.length) container = $('[role="main"]').first();
  if (!container.length) container = $('main').first();

  function stripFurniture(scope: Cheerio<any>) {
    scope.find('script, style, noscript, iframe, link, meta').remove();
    // Remove Kakuyomu furniture IDs/classes
    scope.find([
      '#episodeFooter',
      '#episode-bottomAd-PC',
      '#contentMain-previousEpisode',
      '#contentMain-nextEpisode',
      '.widget-work-episodeNavigation',
      '.widget-ad', '.widget-ad-pcDoubleRectangle',
      '[id^="js-ad-"]', '[id^="ad-"]',
      '.ad', '.ads', '.advertisement',
      '.share', '.social', '.footer',
      '.comments', '.comment', '.signup', '.loginPrompt',
      '.related-works', '.related', '.recommend', '.pager'
    ].join(',')).remove();
  }

  let innerHtml = '';
  if (container.length) {
    // Clone to avoid mutating original DOM
    const clone = container.clone();
    stripFurniture(clone);
    innerHtml = clone.html() || '';
  } else {
    // fallback to body content
    const body = $('body').clone();
    stripFurniture(body);
    innerHtml = body.html() || '';
  }

  return {
    title,
    html: innerHtml.trim(),
    publishedAt: published,
    updatedAt: updated
  };
}