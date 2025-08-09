import fetch, { HeadersInit } from 'node-fetch';

export type FetchOptions = {
  retries?: number;
  backoffMs?: number;
  headers?: HeadersInit;
  timeoutMs?: number;
};

export const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export function defaultHeaders(): HeadersInit {
  return {
    'User-Agent': 'QuaslationFetcher/1.0 (+https://quaslation.xyz) KakuyomuScraper',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'ja,en;q=0.8',
  };
}

export async function fetchWithRetry(url: string, opts: FetchOptions = {}): Promise<string> {
  const {
    retries = 2,
    backoffMs = 1000,
    headers = {},
    timeoutMs = 30000,
  } = opts;

  let attempt = 0;
  let lastErr: any;

  const mergedHeaders: HeadersInit = { ...defaultHeaders(), ...headers };

  while (attempt <= retries) {
    try {
      const controller = new AbortController();
      const to = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(url, {
        headers: mergedHeaders,
        signal: controller.signal,
      } as any);

      clearTimeout(to);

      if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
        const retryAfter = res.headers.get('retry-after');
        const wait = retryAfter ? Math.min(Number(retryAfter) * 1000, 15000) : backoffMs * Math.pow(2, attempt);
        if (attempt < retries) {
          await sleep(wait);
          attempt++;
          continue;
        }
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${url}`);
      }

      return await res.text();
    } catch (err: any) {
      lastErr = err;
      if (attempt < retries) {
        await sleep(backoffMs * Math.pow(2, attempt));
        attempt++;
        continue;
      }
      break;
    }
  }
  throw lastErr ?? new Error(`Failed to fetch ${url}`);
}