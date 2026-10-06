'use client';

import type { FallbackReason, Locale, PersonaRef, ProviderId } from '@/lib/types';
import { buildChatContext } from '@/lib/chat-context';
import { fallbackReply } from '@/lib/fallback-chat';
import { isAutopilot } from '@/lib/tour/runtime';
import { getValue } from '@/lib/store';

export interface ChatReply {
  reply: string;
  source: 'ai' | 'fallback';
  provider: ProviderId | null;
  model: string | null;
  fallbackReason: FallbackReason | null;
  retryAfterSec: number | null;
}

export interface ChatSendInput {
  conversationId: string;
  persona: PersonaRef;
  listingId?: string | null;
  runNumber: number;
  findingIndex: number;
  searchDistrictId?: string | null;
  history: { role: 'user' | 'assistant'; text: string }[];
  message: string;
  userListing: Record<string, unknown> | null;
  handoffCompleted: boolean;
  locale: Locale;
}

export type ChatSendResult = { ok: true; data: ChatReply } | { ok: false; error: string | null };

const CLIENT_TIMEOUT_MS = 20_000;

function localReply(input: ChatSendInput, reason: FallbackReason): ChatSendResult {
  const ctx = buildChatContext({
    persona: input.persona, listingId: input.listingId, runNumber: input.runNumber, findingIndex: input.findingIndex,
    searchDistrictId: input.searchDistrictId, locale: input.locale,
  });
  if (!ctx) return { ok: false, error: null };
  return { ok: true, data: { reply: fallbackReply(ctx, input.message), source: 'fallback', provider: null, model: null, fallbackReason: reason, retryAfterSec: null } };
}

/** ส่งข้อความ: demo_only/autopilot → บทสนทนาตัวอย่างในเครื่อง · เรียก server ไม่ได้ → `network` */
export async function sendChat(input: ChatSendInput): Promise<ChatSendResult> {
  if (getValue('demoSession').chatMode === 'demo_only' || isAutopilot()) return localReply(input, 'demo_only');
  const ctrl = new AbortController();
  const t = window.setTimeout(() => ctrl.abort(), CLIENT_TIMEOUT_MS);
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: ctrl.signal,
    });
    if (res.status === 400 || res.status === 404 || res.status === 413) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      return { ok: false, error: data.error ?? null };
    }
    if (!res.ok) return localReply(input, 'network');
    return { ok: true, data: (await res.json()) as ChatReply };
  } catch {
    return localReply(input, ctrl.signal.aborted ? 'timeout' : 'network');
  } finally {
    window.clearTimeout(t);
  }
}

/** เวลาที่ลองถามผู้ช่วย AI ได้อีกครั้ง (ms) */
export function deadlineIn(sec: number | null): number | null {
  return sec ? Date.now() + sec * 1000 : null;
}
