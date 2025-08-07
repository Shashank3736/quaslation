import TurndownService from 'turndown';
import { load } from 'cheerio';

// Configure Turndown to preserve paragraphs and <br> as newlines
const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
});

// Preserve single <br> as newline and consecutive <br> as double newline
turndown.addRule('preserveBr', {
  filter: 'br',
  replacement: function () {
    return '\n';
  }
});

// Ensure block elements are separated by blank lines to avoid paragraph collapse
const blockTags = [
  'p','div','section','article','header','footer','aside',
  'h1','h2','h3','h4','h5','h6','ul','ol','li','pre','blockquote','figure','figcaption'
];
turndown.addRule('blockSeparation', {
  filter: (node) => blockTags.includes(node.nodeName.toLowerCase()),
  replacement: function (content, node) {
    // Trim but keep internal newlines; add blank lines around blocks
    const text = content.replace(/\s+$/g, '');
    // For list items, avoid extra dashes; Turndown will add list markers separately
    if (node.nodeName.toLowerCase() === 'li') {
      return text + '\n';
    }
    return '\n\n' + text + '\n\n';
  }
});

export function sanitizeHtml(html: string): string {
  const $ = load(html);
  $('script, style, noscript, iframe, link, meta').remove();

  // Remove Kakuyomu site furniture and ads by ids/classes and prefixes
  const furnitureSelectors = [
    '.ad', '.ads', '.advertisement',
    '.widget-ad', '.widget-ad-pcDoubleRectangle',
    '#episodeFooter', '#episode-bottomAd-PC',
    '#contentMain-previousEpisode', '#contentMain-nextEpisode',
    '.widget-work-episodeNavigation',
    '.next', '.prev',
    '.share', '.social',
    '.footer', '#worksBottomAd',
    '.comments', '.comment', '.loginPrompt', '.signup',
    '.related-works', '.related', '.recommend', '.pager',
    '[id^="js-ad-"]', '[id^="ad-"]'
  ].join(',');
  $(furnitureSelectors).remove();

  // Remove inline event handlers
  $('[onload],[onclick],[onerror],[onmouseover],[onmouseout],[onchange],[onsubmit]').each((_, el) => {
    const attribs = el.attribs || {};
    for (const name of Object.keys(attribs)) {
      if (name.toLowerCase().startsWith('on')) {
        $(el).removeAttr(name);
      }
    }
  });

  // Normalize whitespace without collapsing paragraph boundaries
  $('p, div, li, section, article').each((_, el) => {
    const txt = $(el).text().replace(/\u00A0/g, ' ').replace(/[ \t]+/g, ' ').trim();
    if (txt.length) $(el).text(txt);
  });

  // Ensure <br> remain as explicit line breaks
  // no-op loop keeps them intact for downstream conversion
  $('br').each((_) => { /* keep */ });

  // Prefer body inner HTML if present
  return $('body').html() || html;
}

export function htmlToText(html: string): string {
  const $ = load(html);
  // Convert <br> to newline tokens, then gather block texts with blank lines
  $('br').replaceWith('\n');
  const blocks = $('p, h1, h2, h3, h4, h5, h6, li, pre, blockquote, div, section, article')
    .toArray()
    .map(el => $(el).text().replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim())
    .filter(Boolean);
  return blocks.join('\n\n');
}

export function htmlToMarkdown(html: string): string {
  // Let turndown handle with our rules; then normalize
  let md = turndown.turndown(html);

  // Convert stray <br> that may have serialized to <br> text into newlines (safety)
  md = md.replace(/<br\s*\/?>/gi, '\n');

  return md
    .replace(/\r\n/g, '\n')
    // collapse 3+ newlines to 2 to keep paragraph separation
    .replace(/\n{3,}/g, '\n\n')
    // trim excessive spaces on lines
    .split('\n').map(l => l.replace(/[ \t]+$/g, '')).join('\n')
    .trim();
}