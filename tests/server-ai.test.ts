import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it, beforeEach } from 'vitest';
import { extractMarkerBlock } from '@/server/ai/markers';
import { readRules } from '@/server/ai/rules';
import { aiConfig } from '@/server/ai/config';
import { bangkokDate, resetRateLimits, takeToken } from '@/server/ai/rate-limit';
import { buildAssistSystem, buildChatSystem, trimHistory } from '@/server/ai/build-prompt';
import { buildChatContext } from '@/lib/chat-context';

const ROLEPLAY = readFileSync(path.join(import.meta.dirname, '..', 'GEMINI_ROLEPLAY.md'), 'utf8');

describe('GEMINI_ROLEPLAY.md markers (1.6, 8.2)', () => {
  for (const name of ['COZYPET_SYSTEM_INSTRUCTION', 'COZYPET_ASSIST_INTAKE', 'COZYPET_ASSIST_EXPLAIN'] as const) {
    it(`${name}: marker อย่างละหนึ่งบรรทัดและข้อความไม่ว่าง`, () => {
      const lines = ROLEPLAY.split(/\r?\n/).map((l) => l.trim());
      expect(lines.filter((l) => l === `<!-- ${name}:START -->`)).toHaveLength(1);
      expect(lines.filter((l) => l === `<!-- ${name}:END -->`)).toHaveLength(1);
      const text = extractMarkerBlock(ROLEPLAY, name);
      expect(text && text.length).toBeGreaterThan(100);
      expect(readRules(name)).toBe(text);
    });
  }
  it('ไม่พบ marker หรือซ้ำ → null', () => {
    expect(extractMarkerBlock('no markers', 'COZYPET_ASSIST_INTAKE')).toBeNull();
    const dup = '<!-- COZYPET_ASSIST_INTAKE:START -->\na\n<!-- COZYPET_ASSIST_INTAKE:END -->\n<!-- COZYPET_ASSIST_INTAKE:START -->';
    expect(extractMarkerBlock(dup, 'COZYPET_ASSIST_INTAKE')).toBeNull();
    expect(extractMarkerBlock('<!-- COZYPET_ASSIST_INTAKE:START -->\n  \n<!-- COZYPET_ASSIST_INTAKE:END -->', 'COZYPET_ASSIST_INTAKE')).toBeNull();
  });
});

describe('aiConfig — งบ 0 บาท (12.6)', () => {
  it('ไม่ตั้งหรือ demo → ai_disabled', () => {
    expect(aiConfig({})).toEqual({ ok: false, reason: 'ai_disabled' });
    expect(aiConfig({ AI_PROVIDER: 'demo' })).toEqual({ ok: false, reason: 'ai_disabled' });
  });
  it('provider ไม่รู้จัก / ไม่มี model / ไม่มี key → misconfigured', () => {
    expect(aiConfig({ AI_PROVIDER: 'openai', AI_MODEL: 'x', OPENAI_API_KEY: 'k' })).toEqual({ ok: false, reason: 'misconfigured' });
    expect(aiConfig({ AI_PROVIDER: 'groq', GROQ_API_KEY: 'k' })).toEqual({ ok: false, reason: 'misconfigured' });
    expect(aiConfig({ AI_PROVIDER: 'gemini', AI_MODEL: 'm' })).toEqual({ ok: false, reason: 'misconfigured' });
  });
  it('OpenRouter ต้องลงท้าย :free และห้าม auto/router', () => {
    expect(aiConfig({ AI_PROVIDER: 'openrouter', AI_MODEL: 'vendor/model', OPENROUTER_API_KEY: 'k' })).toEqual({ ok: false, reason: 'model_not_allowed' });
    expect(aiConfig({ AI_PROVIDER: 'openrouter', AI_MODEL: 'openrouter/auto', OPENROUTER_API_KEY: 'k' })).toEqual({ ok: false, reason: 'model_not_allowed' });
    expect(aiConfig({ AI_PROVIDER: 'openrouter', AI_MODEL: 'a:free,b:free', OPENROUTER_API_KEY: 'k' })).toEqual({ ok: false, reason: 'model_not_allowed' });
    const ok = aiConfig({ AI_PROVIDER: 'openrouter', AI_MODEL: 'vendor/model:free', OPENROUTER_API_KEY: 'k' });
    expect(ok.ok).toBe(true);
  });
});

describe('rate limit (12.5)', () => {
  beforeEach(() => resetRateLimits());
  it('ต่อผู้ใช้ 6 ครั้ง/นาที แล้ว rate_limited พร้อม retryAfterSec', () => {
    const t0 = Date.UTC(2026, 9, 6, 3, 0, 0);
    for (let i = 0; i < 6; i++) expect(takeToken('chat', 'u1', t0 + i).ok).toBe(true);
    const r = takeToken('chat', 'u1', t0 + 10);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.reason).toBe('rate_limited');
      expect(r.retryAfterSec).toBeGreaterThan(0);
    }
    expect(takeToken('chat', 'u2', t0 + 10).ok).toBe(true);
    expect(takeToken('chat', 'u1', t0 + 61_000).ok).toBe(true);
  });
  it('assist แยก bucket จากแชต', () => {
    const t0 = Date.UTC(2026, 9, 6, 3, 0, 0);
    for (let i = 0; i < 6; i++) takeToken('chat', 'u1', t0 + i);
    expect(takeToken('assist', 'u1', t0 + 7).ok).toBe(true);
  });
  it('วันนับตามเวลาไทย', () => {
    expect(bangkokDate(Date.UTC(2026, 9, 5, 17, 30))).toBe('2026-10-06');
    expect(bangkokDate(Date.UTC(2026, 9, 5, 16, 30))).toBe('2026-10-05');
  });
});

describe('build-prompt (1.2, 1.5)', () => {
  it('ตัด history ≤ 20 ข้อความ ≤ 1,000 ตัวอักษร และบอก truncated', () => {
    const many = Array.from({ length: 30 }, (_, i) => ({ role: (i % 2 ? 'assistant' : 'user') as 'user' | 'assistant', text: `m${i}` }));
    const r = trimHistory(many);
    expect(r.messages).toHaveLength(20);
    expect(r.truncated).toBe(true);
    expect(r.omittedCount).toBe(10);
    const long = trimHistory([{ role: 'user', text: 'x'.repeat(1500) }]);
    expect(long.messages[0].text).toHaveLength(1000);
    expect(long.truncated).toBe(true);
    const total = trimHistory(Array.from({ length: 20 }, () => ({ role: 'user' as const, text: 'y'.repeat(1000) })));
    expect(total.messages.reduce((n, h) => n + h.text.length, 0)).toBeLessThanOrEqual(12000);
  });
  it('system instruction มีกติกา + COZYPET_CONTEXT และแยก USER_PROVIDED_DATA', () => {
    const ctx = buildChatContext({ persona: { kind: 'owner', id: 'owner-001' }, listingId: 'listing-001', runNumber: 42, findingIndex: 1, locale: 'th' })!;
    const sys = buildChatSystem('RULES', ctx, { userListing: { name: 'x' } });
    expect(sys.startsWith('RULES')).toBe(true);
    expect(sys).toContain('=== COZYPET_CONTEXT');
    expect(sys).toContain('=== USER_PROVIDED_DATA');
    expect(buildChatSystem('RULES', ctx, null)).not.toContain('USER_PROVIDED_DATA');
    expect(buildAssistSystem('R', { a: 1 }, 'hello')).toContain('hello\n=== END USER_PROVIDED_DATA ===');
  });
});
