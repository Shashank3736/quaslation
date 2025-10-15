import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import {remark} from 'remark'
import strip from 'strip-markdown'
import {unified} from 'unified'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface EmbedFooter {
  text: string;
  icon_url?: string;
}

export interface EmbedAuthor {
  name: string;
  icon_url?: string;
  url?: string;
}

export interface EmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbedOptions {
  title?: string;
  description?: string;
  url?: string;
  timestamp?: string | Date;
  color?: string;
  footer?: EmbedFooter;
  image?: string;
  thumbnail?: string;
  author?: EmbedAuthor;
  fields?: EmbedField[];
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  footer?: EmbedFooter;
  image?: { url: string };
  thumbnail?: { url: string };
  author?: EmbedAuthor;
  fields?: EmbedField[];
}

export function slugify(str: string) {
  str = str.replace(/^\s+|\s+$/g, ''); // trim leading/trailing white space
  str = str.toLowerCase(); // convert string to lowercase
  str = str.replace(/[^a-z0-9 -]/g, '') // remove any non-alphanumeric characters
           .replace(/\s+/g, '-') // replace spaces with hyphens
           .replace(/-+/g, '-'); // remove consecutive hyphens
  return str;
}

export function createDiscordEmbed({
  title,
  description,
  url,
  timestamp = new Date(),
  color,
  footer,
  image,
  thumbnail,
  author,
  fields = []
}: DiscordEmbedOptions = {}): DiscordEmbed {
  const embed: DiscordEmbed = {};

  if (title) embed.title = title;
  if (description) embed.description = description;
  if (url) embed.url = url;
  if (timestamp) embed.timestamp = timestamp instanceof Date ? timestamp.toISOString() : timestamp;
  if (color) embed.color = hexToDecimal(color);

  if (footer) {
    embed.footer = { text: footer.text };
    if (footer.icon_url) embed.footer.icon_url = footer.icon_url;
  }

  if (image) embed.image = { url: image };
  if (thumbnail) embed.thumbnail = { url: thumbnail };

  if (author) {
    embed.author = { name: author.name };
    if (author.icon_url) embed.author.icon_url = author.icon_url;
    if (author.url) embed.author.url = author.url;
  }

  if (fields.length > 0) embed.fields = fields;

  return embed;
}

export async function sendDiscordEmbed(options: DiscordEmbedOptions) {
  const embed = createDiscordEmbed(options);
  try {
    const response = await fetch(process.env.DISCORD_WEBHOOK_URL || "", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ embeds: [embed] }),
    })
    return await response.text()
  } catch (error) {
    throw new Error("Network Error")
  }
}

export function hexToDecimal(hex:string) {
  return parseInt(hex.replace("#",""), 16)
}

export function shortifyString(input: string, size = 15): string {
  // Remove extra spaces from the input string
  const trimmedInput = input.trim().replace(/\s+/g, ' ');

  // Check the length and format accordingly
  if (trimmedInput.length <= size) {
      return trimmedInput;
  } else {
      return trimmedInput.slice(0, size-3) + "...";
  }
}

export function timeAgo(dateString: Date) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 }
  ];

  for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
          return count === 1 ? `1 ${interval.label} ago` : `${count} ${interval.label}s ago`;
      }
  }
  return 'just now';
}

export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  };

  return new Intl.DateTimeFormat('en-US', options).format(date);
}

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const markdownToHtml = async (markdown: string) => {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown.replace(/\r\n/g, '\n').replace(/\n/g, '  \n'));

  return String(file).replace(/\n/g, "");
}

export const markdownToText = async (markdown: string) => {
  const file = await remark()
  .use(strip)
  .process(markdown)

  return String(file);
}

export function truncateText(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}