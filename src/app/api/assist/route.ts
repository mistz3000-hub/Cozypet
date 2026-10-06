import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { AssistIntakeResult, FallbackReason, Locale } from '@/lib/types';
import { DISTRICTS, getDistrict } from '@/data/districts';
import { getHelper } from '@/data';
import { assistByRules } from '@/lib/assist-rules';
import { availableSlots } from '@/lib/capacity';
import { alternativesFor, helperDisplayName, searchPointForContext } from '@/lib/chat-context';
import { statusInfo } from '@/lib/status';
import { format, getMessages } from '@/i18n';
import { factorLabel, factorRawText, reasonText } from '@/features/balancer/reason-text';
import { aiConfig } from '@/server/ai/config';
import { readRules } from '@/server/ai/rules';
import { buildAssistSystem } from '@/server/ai/build-prompt';
import { generate } from '@/server/ai/providers';
import { clientKey, takeToken } from '@/server/ai/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TIMEOUT_MS = 8000;
const SPECIES = ['cat', 'dog', 'other'] as const;
const URGENCY = ['normal', 'soon', 'emergency'] as const;

const IntakeReq = z.object({ task: z.literal('intake'), text: z.string().trim().min(1).max(300), locale: z.string().optional() });
const ExplainReq = z.object({
  task: z.literal('explain'),
  helperId: z.string().max(40),
  runNumber: z.number().int().min(1).max(100),
  findingIndex: z.number().int().min(1).max(999),
  searchDistrictId: z.string().max(40).optional().nullable(),
  species: z.enum(SPECIES),
  urgency: z.enum(URGENCY),
  locale: z.string().optional(),
});

/** schema ของผลจากโมเดล (ตรวจฝั่ง server — enum ต้องตรง, districtId ต้องมีจริง, summary ≤ 80) */
const IntakeModel = z.object({
  helpType: z.enum(['intake', 'donate', 'adopt', 'unknown']),
  species: z.enum(['cat', 'dog', 'other', 'unknown']),
  ageGroup: z.enum(['young', 'adult', 'unknown']),
  urgency: z.enum(['normal', 'soon', 'emergency', 'unknown']),
  signals: z.array(z.enum(['injured', 'sick', 'trapped', 'hungry', 'young_alone', 'aggressive'])).max(6),
  districtId: z.string().nullable().refine((v) => v === null || !!getDistrict(v)),
  needsVet: z.boolean(),
  summary: z.string().trim().min(1).max(80),
});

const INTAKE_SCHEMA = {
  type: 'object',
  required: ['helpType', 'species', 'ageGroup', 'urgency', 'signals', 'districtId', 'needsVet', 'summary'],
  properties: {
    helpType: { enum: ['intake', 'donate', 'adopt', 'unknown'] },
    species: { enum: ['cat', 'dog', 'other', 'unknown'] },
    ageGroup: { enum: ['young', 'adult', 'unknown'] },
    urgency: { enum: ['normal', 'soon', 'emergency', 'unknown'] },
    signals: { type: 'array', items: { enum: ['injured', 'sick', 'trapped', 'hungry', 'young_alone', 'aggressive'] } },
    districtId: { type: ['string', 'null'], description: 'id จากรายการ districts เท่านั้น' },
    needsVet: { type: 'boolean' },
    summary: { type: 'string', maxLength: 80 },
  },
  additionalProperties: false,
};

const toLocale = (v: unknown): Locale => (v === 'en' ? 'en' : 'th');

function parseJsonLoose(text: string): unknown {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
  }
  const task = (body as { task?: unknown } | null)?.task;
  if (task === 'intake') return intake(req, body);
  if (task === 'explain') return explain(req, body);
  return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
}

async function intake(req: Request, body: unknown) {
  const raw = body as { text?: unknown };
  if (typeof raw.text === 'string' && raw.text.length > 300) return NextResponse.json({ error: 'ข้อความยาวเกิน 300 ตัวอักษร' }, { status: 413 });
  const parsed = IntakeReq.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
  const { text } = parsed.data;
  const locale = toLocale(parsed.data.locale);
  const rules = (reason: FallbackReason) => NextResponse.json(assistByRules(text, locale, reason));

  const cfg = aiConfig();
  if (!cfg.ok) return rules(cfg.reason);
  const rate = takeToken('assist', clientKey(req.headers));
  if (!rate.ok) return rules(rate.reason);
  const instruction = readRules('COZYPET_ASSIST_INTAKE');
  if (!instruction) return rules('upstream_error');

  const context = { locale, districts: DISTRICTS.map((d) => ({ id: d.id, th: d.nameTh, en: d.nameEn })), schema: INTAKE_SCHEMA };
  const result = await generate(cfg.provider, {
    system: buildAssistSystem(instruction, context, text),
    messages: [{ role: 'user', text: locale === 'en' ? 'Summarise USER_PROVIDED_DATA as JSON.' : 'สรุป USER_PROVIDED_DATA เป็น JSON' }],
    model: cfg.model,
    key: cfg.key,
    temperature: 0.2,
    maxTokens: 200,
    json: true,
  }, TIMEOUT_MS);
  if (!result.ok) return rules(result.reason);
  const check = IntakeModel.safeParse(parseJsonLoose(result.text));
  if (!check.success) return rules('upstream_error');
  const out: AssistIntakeResult = { ...check.data, source: 'ai', provider: cfg.provider };
  return NextResponse.json(out);
}

async function explain(req: Request, body: unknown) {
  const parsed = ExplainReq.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
  const { helperId, runNumber, findingIndex, searchDistrictId, species, urgency } = parsed.data;
  const locale = toLocale(parsed.data.locale);
  const helper = getHelper(helperId);
  if (!helper) return NextResponse.json({ error: 'ไม่พบผู้ช่วยดูแลนี้' }, { status: 404 });

  // server คำนวณอันดับเอง (ไม่รับคะแนน/เหตุผลจาก browser) — ชุดเดียวกับ pop-up และ “ที่อื่นที่ยังรับได้”
  const { point } = searchPointForContext(runNumber, findingIndex, searchDistrictId);
  const items = alternativesFor('__none__', species, point, urgency, 200);
  const rec = items.find((r) => r.id === helperId);
  const m = getMessages(locale);
  const f = (t: string, p: Record<string, string | number>) => format(t, p);
  const reasons = rec ? rec.reasons.map((r) => reasonText(r, m, f)) : [];
  const name = helperDisplayName(helper, locale);
  const template = rec
    ? `${format(locale === 'en' ? 'Suggested because: {reasons}.' : 'แนะนำเพราะ{reasons}', { reasons: reasons.join(locale === 'en' ? ', ' : ' · ') })}${helper.isRealOrganization ? (locale === 'en' ? ' (demo data)' : ' (ข้อมูลสาธิต)') : ''}`
    : '';
  const fallback = (reason: FallbackReason) => NextResponse.json({ text: template, source: 'fallback', provider: null, model: null, fallbackReason: reason });
  if (!rec) return fallback('upstream_error');

  const cfg = aiConfig();
  if (!cfg.ok) return fallback(cfg.reason);
  const rate = takeToken('assist', clientKey(req.headers));
  if (!rate.ok) return fallback(rate.reason);
  const instruction = readRules('COZYPET_ASSIST_EXPLAIN');
  if (!instruction) return fallback('upstream_error');

  const st = statusInfo(helper);
  const context = {
    locale,
    request: { species: m.species[species], urgency: m.urgency[urgency] },
    helper: {
      displayName: name,
      kindLabel: m.kind[helper.kind],
      isRealOrganization: !!helper.isRealOrganization,
      districtName: locale === 'en' ? getDistrict(helper.districtId)?.nameEn : getDistrict(helper.districtId)?.nameTh,
      statusLabel: st.closed ? m.status.closed : m.status[st.level],
      availableSlots: availableSlots(helper),
      capacityTotal: helper.capacityTotal,
      distanceKm: rec.distanceKm ?? null,
    },
    factors: rec.factors.map((fa) => ({ label: factorLabel(fa.key, m), weightPct: Math.round(fa.weight * 100), valueLabel: factorRawText(fa.key, fa.rawLabel, m, f, locale) })),
    reasons,
    alternativesCount: Math.max(0, Math.min(3, items.length) - 1),
  };
  const result = await generate(cfg.provider, {
    system: buildAssistSystem(instruction, context),
    messages: [{ role: 'user', text: locale === 'en' ? 'Explain this recommendation.' : 'อธิบายคำแนะนำนี้' }],
    model: cfg.model,
    key: cfg.key,
    temperature: 0.5,
    maxTokens: 200,
  }, TIMEOUT_MS);
  if (!result.ok) return fallback(result.reason);
  const text = result.text.replace(/[*_#`]/g, '').trim().slice(0, 320);
  // ด่านสุดท้าย: ห้ามเปอร์เซ็นต์/คะแนน และองค์กรจริงต้องมีป้ายข้อมูลสาธิต
  const demoWord = locale === 'en' ? 'demo data' : 'ข้อมูลสาธิต';
  if (/\d+\s*%|เปอร์เซ็นต์|แม่นยำ|รับประกัน|guarantee/i.test(text) || (helper.isRealOrganization && !text.toLowerCase().includes(demoWord))) {
    return fallback('upstream_error');
  }
  return NextResponse.json({ text, source: 'ai', provider: cfg.provider, model: cfg.model, fallbackReason: null });
}
