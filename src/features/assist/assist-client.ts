'use client';
/** เรียก /api/assist (เฉพาะเมื่อไม่ใช่โหมดบทสนทนาตัวอย่างและไม่ใช่ autopilot) — timeout 8 วินาที */
import type { AssistIntakeResult, Locale, Species, Urgency } from '@/lib/types';
import { assistByRules } from '@/lib/assist-rules';
import { isAutopilot } from '@/lib/tour/runtime';
import { getValue } from '@/lib/store';

const TIMEOUT_MS = 8000;

export async function requestIntake(text: string, locale: Locale): Promise<AssistIntakeResult> {
  const demoOnly = getValue('demoSession').chatMode === 'demo_only';
  if (demoOnly || isAutopilot()) return assistByRules(text, locale, demoOnly ? 'demo_only' : undefined);
  const ctrl = new AbortController();
  const t = window.setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch('/api/assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: 'intake', text, locale }),
      signal: ctrl.signal,
    });
    if (!res.ok) return assistByRules(text, locale, 'network');
    return (await res.json()) as AssistIntakeResult;
  } catch {
    return assistByRules(text, locale, ctrl.signal.aborted ? 'timeout' : 'network');
  } finally {
    window.clearTimeout(t);
  }
}

export interface ExplainResult { text: string; source: 'ai' | 'fallback'; provider?: string | null }

export async function requestExplain(input: { helperId: string; runNumber: number; findingIndex: number; searchDistrictId?: string; species: Species; urgency: Urgency; locale: Locale }): Promise<ExplainResult | null> {
  const demoOnly = getValue('demoSession').chatMode === 'demo_only';
  if (demoOnly || isAutopilot()) return null;
  const ctrl = new AbortController();
  const t = window.setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch('/api/assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: 'explain', ...input }),
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { text: string; source: 'ai' | 'fallback'; provider?: string | null };
    return data.source === 'ai' ? data : null;
  } catch {
    return null;
  } finally {
    window.clearTimeout(t);
  }
}
