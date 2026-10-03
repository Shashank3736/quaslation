import { z } from "zod";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MAX_QUERY_LENGTH,
  MIN_QUERY_LENGTH,
} from "./constants";

/**
 * Validated view over `?` params. Accepts `string | string[] | undefined` (App Router
 * hands over repeated params as arrays) so the same schema can validate a URL, a
 * `URLSearchParams` and a fetch query string.
 */
export const searchQuerySchema = z.object({
  q: z.string().trim().max(MAX_QUERY_LENGTH).optional().default(""),
  type: z.enum(["all", "novel", "chapter"]).optional().default("all"),
  premium: z
    .enum(["1", "true", "on", "yes"])
    .optional()
    .transform((value) => value !== undefined),
  tags: z.string().optional().default(""),
  status: z.string().optional().default(""),
  language: z.string().trim().max(60).optional().default(""),
  author: z.string().trim().max(120).optional().default(""),
  minWords: z.string().optional().default(""),
  maxWords: z.string().optional().default(""),
  cursor: z.string().max(400).optional().default(""),
  limit: z.string().optional().default(""),
});

export const autocompleteQuerySchema = z.object({
  q: z.string().trim().max(MAX_QUERY_LENGTH).optional().default(""),
  type: z.enum(["all", "novel", "chapter"]).optional().default("all"),
  limit: z.string().optional().default(""),
});

export type SearchQueryInput = z.input<typeof searchQuerySchema>;
export type AutocompleteQueryInput = z.input<typeof autocompleteQuerySchema>;

/** Accepts both a raw query object and the first value of a repeated param. */
export type RawParams = Record<string, string | string[] | undefined>;

export function firstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function toRawParams(params: RawParams): Record<string, string> {
  const raw: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    const first = firstValue(value);
    if (first !== undefined) raw[key] = first;
  }
  return raw;
}

export function parseNumberList(raw: string): number[] {
  return raw
    .split(/[\s,]+/)
    .map((part) => Number.parseInt(part, 10))
    .filter((value) => Number.isInteger(value) && value > 0)
    .slice(0, 25);
}

export function parseWordCount(raw: string): number | null {
  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value < 0) return null;
  return value;
}

export function parseLimit(raw: string): number {
  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(value, MAX_PAGE_SIZE);
}

export { MIN_QUERY_LENGTH };
