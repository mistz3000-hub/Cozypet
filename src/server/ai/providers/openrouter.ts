import 'server-only';
import { chatCompletions } from './openai-compatible';
import type { GenerateInput } from './types';

const MODELS_URL = 'https://openrouter.ai/api/v1/models';
const CACHE_MS = 6 * 60 * 60 * 1000;
let freeCache: { at: number; ids: Set<string> } | null = null;

/**
 * ด่าน runtime (PROMPT.md 12.6 ข้อ 3): รุ่นต้องมีในรายการของ OpenRouter และราคา prompt/completion/request เป็น 0
 * ตรวจไม่ได้ → ถือว่าไม่ผ่าน (ไม่เรียก API)
 */
export async function openrouterModelIsFree(model: string, signal: AbortSignal): Promise<boolean> {
  if (!model.endsWith(':free')) return false;
  if (!freeCache || Date.now() - freeCache.at > CACHE_MS) {
    try {
      const res = await fetch(MODELS_URL, { signal });
      if (!res.ok) return false;
      const data = (await res.json()) as { data?: { id: string; pricing?: Record<string, string | undefined> }[] };
      const zero = (v: string | undefined) => v === undefined || Number(v) === 0;
      const ids = new Set(
        (data.data ?? [])
          .filter((d) => d.id.endsWith(':free') && d.pricing && zero(d.pricing.prompt) && zero(d.pricing.completion) && zero(d.pricing.request))
          .map((d) => d.id),
      );
      freeCache = { at: Date.now(), ids };
    } catch {
      return false;
    }
  }
  return freeCache.ids.has(model);
}

/** OpenRouter (https://openrouter.ai/docs) — model ID ลงท้าย `:free` เท่านั้น ไม่เติมเครดิต */
export function openrouterGenerate(input: GenerateInput) {
  return chatCompletions('https://openrouter.ai/api/v1/chat/completions', input, 'max_tokens', { 'X-Title': 'Cozypet prototype' });
}
