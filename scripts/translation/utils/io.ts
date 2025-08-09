import { promises as fs } from 'fs';
import path from 'path';

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

export function safeSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export async function writeJsonPretty(filePath: string, data: unknown): Promise<void> {
  await ensureDir(path.dirname(filePath));
  const content = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, content, 'utf8');
}

export async function writeJson(filePath: string, data: unknown): Promise<void> {
  await ensureDir(path.dirname(filePath));
  const content = JSON.stringify(data);
  await fs.writeFile(filePath, content, 'utf8');
}

export function volumeFileName(volumeNumber: number): string {
  return `volume-${String(volumeNumber).padStart(3, '0')}.json`;
}

export function joinOut(baseOut: string, ...parts: string[]): string {
  return path.join(baseOut, ...parts);
}