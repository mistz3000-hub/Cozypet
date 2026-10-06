import 'server-only';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { extractMarkerBlock, type MarkerName } from './markers';

/** อ่านกติกาจาก GEMINI_ROLEPLAY.md ฝั่ง server และ cache ใน module scope (ห้าม hard-code กติกาในโค้ด) */
const cache = new Map<MarkerName, string | null>();

export function readRules(name: MarkerName): string | null {
  if (cache.has(name)) return cache.get(name)!;
  let text: string | null = null;
  try {
    const src = readFileSync(path.join(process.cwd(), 'GEMINI_ROLEPLAY.md'), 'utf8');
    text = extractMarkerBlock(src, name);
  } catch {
    text = null;
  }
  if (!text) console.error(`[cozypet] rules_missing:${name}`);
  cache.set(name, text);
  return text;
}
