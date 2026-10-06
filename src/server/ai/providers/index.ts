import 'server-only';
import type { ProviderId } from '@/lib/types';
import { geminiGenerate } from './gemini';
import { groqGenerate } from './groq';
import { openrouterGenerate, openrouterModelIsFree } from './openrouter';
import { ProviderError, type GenerateInput } from './types';

export { ProviderError } from './types';
export type { ProviderMessage } from './types';

const ADAPTERS: Record<ProviderId, (i: GenerateInput) => Promise<{ text: string }>> = {
  gemini: geminiGenerate,
  groq: groqGenerate,
  openrouter: openrouterGenerate,
};

export type GenerateResult =
  | { ok: true; text: string }
  | { ok: false; reason: 'timeout' | 'upstream_error' | 'blocked' | 'quota_exceeded' | 'model_not_allowed'; retryAfterSec: number | null };

/**
 * เรียก provider ที่ตั้งไว้ “เจ้าเดียว” พร้อม timeout — ผิดพลาดแล้วคืนเหตุผล ห้ามสลับ provider อัตโนมัติ
 */
export async function generate(provider: ProviderId, input: Omit<GenerateInput, 'signal'>, timeoutMs: number): Promise<GenerateResult> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    if (provider === 'openrouter' && !(await openrouterModelIsFree(input.model, ctrl.signal))) {
      return { ok: false, reason: 'model_not_allowed', retryAfterSec: null };
    }
    const { text } = await ADAPTERS[provider]({ ...input, signal: ctrl.signal });
    return { ok: true, text };
  } catch (e) {
    if (ctrl.signal.aborted) return { ok: false, reason: 'timeout', retryAfterSec: null };
    if (e instanceof ProviderError) return { ok: false, reason: e.kind, retryAfterSec: e.retryAfterSec };
    return { ok: false, reason: 'upstream_error', retryAfterSec: null };
  } finally {
    clearTimeout(timer);
  }
}
