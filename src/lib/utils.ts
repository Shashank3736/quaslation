import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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