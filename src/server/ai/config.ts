import 'server-only';
import type { FallbackReason, ProviderId } from '@/lib/types';

type Env = Record<string, string | undefined>;

export type AiConfig =
  | { ok: true; provider: ProviderId; model: string; key: string }
  | { ok: false; reason: Extract<FallbackReason, 'ai_disabled' | 'misconfigured' | 'model_not_allowed'> };

const KEY_ENV: Record<ProviderId, string> = { gemini: 'GEMINI_API_KEY', groq: 'GROQ_API_KEY', openrouter: 'OPENROUTER_API_KEY' };

/** ชื่อรุ่นที่ให้ provider เลือกเอง (router/auto) — ห้ามใช้ตามงบ 0 บาท */
const AUTO_MODELS = /(^|\/)(auto|router)(:|$)/i;

/**
 * อ่านการตั้งค่า provider ฝั่ง server (PROMPT.md 12.6) — ไม่มีชื่อรุ่น default ในโค้ด
 * OpenRouter: ต้องลงท้าย `:free` เท่านั้น (ด่านแรก ก่อนเรียก API)
 */
export function aiConfig(env: Env = process.env): AiConfig {
  const provider = (env.AI_PROVIDER ?? '').trim().toLowerCase();
  if (!provider || provider === 'demo') return { ok: false, reason: 'ai_disabled' };
  if (provider !== 'gemini' && provider !== 'groq' && provider !== 'openrouter') return { ok: false, reason: 'misconfigured' };
  const model = (env.AI_MODEL ?? '').trim();
  const key = (env[KEY_ENV[provider]] ?? '').trim();
  if (!model || !key) return { ok: false, reason: 'misconfigured' };
  if (AUTO_MODELS.test(model) || model.includes(',')) return { ok: false, reason: 'model_not_allowed' };
  if (provider === 'openrouter' && !model.endsWith(':free')) return { ok: false, reason: 'model_not_allowed' };
  return { ok: true, provider, model, key };
}

export function intEnv(name: string, fallback: number, env: Env = process.env): number {
  const n = Number(env[name]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}
