import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { FallbackReason } from '@/lib/types';
import { buildChatContext } from '@/lib/chat-context';
import { fallbackReply } from '@/lib/fallback-chat';
import { aiConfig } from '@/server/ai/config';
import { readRules } from '@/server/ai/rules';
import { buildChatSystem, MESSAGE_MAX, trimHistory } from '@/server/ai/build-prompt';
import { generate } from '@/server/ai/providers';
import { clientKey, takeToken } from '@/server/ai/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TIMEOUT_MS = 15_000;
const PROVIDER_LABEL = { gemini: 'Gemini', groq: 'Groq', openrouter: 'OpenRouter' } as const;

const str = (max: number) => z.string().max(max);
/** ประกาศที่ผู้ทดลองสร้าง — รับเฉพาะฟิลด์ที่จำเป็น และถือเป็นข้อมูลไม่น่าเชื่อถือ */
const UserListing = z.object({
  type: z.enum(['lost', 'found']).optional(),
  species: z.enum(['cat', 'dog', 'other']).optional(),
  speciesOther: str(60).optional(),
  name: str(60).optional(),
  colors: z.array(str(40)).max(8).optional(),
  markings: str(300).optional(),
  districtId: str(40).optional(),
  description: str(500).optional(),
  urgency: z.enum(['normal', 'soon', 'emergency']).optional(),
}).partial();

const ChatReq = z.object({
  conversationId: str(160).optional(),
  persona: z.object({ kind: z.enum(['owner', 'shelter', 'individual']), id: str(40) }),
  listingId: str(80).nullable().optional(),
  runNumber: z.number().int().min(1).max(100),
  findingIndex: z.number().int().min(1).max(999),
  searchDistrictId: str(40).nullable().optional(),
  history: z.array(z.object({ role: z.enum(['user', 'assistant']), text: z.string().max(4000) })).max(200),
  message: z.string().trim().min(1),
  userListing: UserListing.nullable().optional(),
  handoffCompleted: z.boolean().optional(),
  locale: z.string().optional(),
});

/** POST /api/chat (PROMPT.md 12.2–12.5) — ตอบ 200 ทุกกรณีที่ input ถูกต้อง ผิดพลาดแล้วใช้บทสนทนาตัวอย่าง ไม่สลับ provider */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
  }
  const msg = (body as { message?: unknown } | null)?.message;
  if (typeof msg === 'string' && msg.trim().length > MESSAGE_MAX) {
    return NextResponse.json({ error: `ข้อความยาวเกิน ${MESSAGE_MAX} ตัวอักษร` }, { status: 413 });
  }
  const parsed = ChatReq.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
  const input = parsed.data;
  const locale = input.locale === 'en' ? 'en' : 'th';

  const cfg = aiConfig();
  const ctx = buildChatContext({
    persona: input.persona,
    listingId: input.listingId ?? null,
    runNumber: input.runNumber,
    findingIndex: input.findingIndex,
    searchDistrictId: input.searchDistrictId ?? null,
    locale,
    modelLabel: cfg.ok ? `${PROVIDER_LABEL[cfg.provider]} · ${cfg.model}` : null,
  });
  if (!ctx) return NextResponse.json({ error: 'ไม่พบบทสนทนาหรือประกาศนี้' }, { status: 404 });

  const fallback = (reason: FallbackReason, retryAfterSec: number | null = null) =>
    NextResponse.json({ reply: fallbackReply(ctx, input.message), source: 'fallback', provider: null, model: null, fallbackReason: reason, retryAfterSec });

  if (!cfg.ok) return fallback(cfg.reason);
  const rate = takeToken('chat', clientKey(req.headers));
  if (!rate.ok) return fallback(rate.reason, rate.retryAfterSec);
  const rules = readRules('COZYPET_SYSTEM_INSTRUCTION');
  if (!rules) return fallback('upstream_error');

  const { messages, truncated, omittedCount } = trimHistory(input.history);
  ctx.history = { truncated, omittedCount };
  const userProvided = input.userListing || input.handoffCompleted
    ? { userListing: input.userListing ?? null, handoffCompleted: !!input.handoffCompleted }
    : null;

  const result = await generate(cfg.provider, {
    system: buildChatSystem(rules, ctx, userProvided),
    messages: [...messages, { role: 'user', text: input.message }],
    model: cfg.model,
    key: cfg.key,
    temperature: 0.7,
    maxTokens: 300,
  }, TIMEOUT_MS);
  if (!result.ok) return fallback(result.reason === 'model_not_allowed' ? 'model_not_allowed' : result.reason, result.retryAfterSec);
  return NextResponse.json({ reply: result.text, source: 'ai', provider: cfg.provider, model: cfg.model, fallbackReason: null, retryAfterSec: null });
}
