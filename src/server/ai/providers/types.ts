import type { FallbackReason } from '@/lib/types';

export interface ProviderMessage { role: 'user' | 'assistant'; text: string }

export interface GenerateInput {
  system: string;
  messages: ProviderMessage[];
  model: string;
  key: string;
  signal: AbortSignal;
  temperature: number;
  maxTokens: number;
  json?: boolean;
}

export type ProviderErrorKind = Extract<FallbackReason, 'quota_exceeded' | 'timeout' | 'upstream_error' | 'blocked'>;

export class ProviderError extends Error {
  constructor(public kind: ProviderErrorKind, public retryAfterSec: number | null = null) {
    super(kind);
  }
}

export function retryAfter(res: Response): number | null {
  const v = Number(res.headers.get('retry-after'));
  return Number.isFinite(v) && v > 0 ? Math.ceil(v) : null;
}

/** แปลง HTTP status เป็นชนิดข้อผิดพลาดกลาง (ไม่ log เนื้อหา) */
export function errorFromStatus(res: Response): ProviderError {
  if (res.status === 429 || res.status === 402) return new ProviderError('quota_exceeded', retryAfter(res));
  return new ProviderError('upstream_error');
}
