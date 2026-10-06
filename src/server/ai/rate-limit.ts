import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { intEnv } from './config';

/**
 * rate limit ฝั่ง server (PROMPT.md 12.5) — หน่วยความจำของ instance (best effort บน serverless)
 * key = hash ของ IP + salt ที่สุ่มต่อ process (ไม่เก็บ IP ดิบ) · วันนับตามเวลาไทย
 */
export type Bucket = 'chat' | 'assist' | 'auth';
export type RateResult = { ok: true } | { ok: false; reason: 'rate_limited' | 'quota_exceeded'; retryAfterSec: number };

const SALT = randomBytes(16).toString('hex');
const minute = new Map<string, number[]>();
const daily = new Map<string, number>();
const MAX_KEYS = 5000;

export function clientKey(headers: Headers): string {
  const ip = headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip')?.trim() || 'unknown';
  return createHash('sha256').update(SALT).update(ip).digest('hex').slice(0, 24);
}

export function bangkokDate(now: number): string {
  return new Date(now + 7 * 3_600_000).toISOString().slice(0, 10);
}

function secondsToBangkokMidnight(now: number): number {
  const local = now + 7 * 3_600_000;
  const next = Math.floor(local / 86_400_000 + 1) * 86_400_000;
  return Math.max(1, Math.ceil((next - local) / 1000));
}

function limits(bucket: Bucket) {
  if (bucket === 'chat') return { perMin: intEnv('CHAT_RATE_LIMIT_PER_MIN', 6), perDay: intEnv('CHAT_RATE_LIMIT_PER_DAY', 40), global: intEnv('CHAT_GLOBAL_DAILY_LIMIT', 300) };
  if (bucket === 'assist') return { perMin: intEnv('ASSIST_RATE_LIMIT_PER_MIN', 10), perDay: Number.POSITIVE_INFINITY, global: intEnv('ASSIST_GLOBAL_DAILY_LIMIT', 200) };
  // เข้าสู่ระบบ/สมัคร: 5 ครั้ง/นาทีต่อ IP (นอกเหนือจากที่ Supabase จำกัดเอง)
  return { perMin: 5, perDay: Number.POSITIVE_INFINITY, global: Number.POSITIVE_INFINITY };
}

function prune(now: number) {
  if (minute.size > MAX_KEYS) {
    for (const [k, v] of minute) if (!v.some((t) => now - t < 60_000)) minute.delete(k);
  }
  const today = bangkokDate(now);
  if (daily.size > MAX_KEYS * 2) {
    for (const k of daily.keys()) if (!k.includes(today)) daily.delete(k);
  }
}

/** ตรวจและนับ 1 ครั้งถ้าผ่าน (ไม่นับเมื่อถูกปฏิเสธ) */
export function takeToken(bucket: Bucket, key: string, now = Date.now()): RateResult {
  prune(now);
  const lim = limits(bucket);
  const day = bangkokDate(now);
  const gKey = `${bucket}:global:${day}`;
  const uDayKey = `${bucket}:${key}:${day}`;
  const mKey = `${bucket}:${key}`;
  const recent = (minute.get(mKey) ?? []).filter((t) => now - t < 60_000);
  if ((daily.get(gKey) ?? 0) >= lim.global) return { ok: false, reason: 'quota_exceeded', retryAfterSec: secondsToBangkokMidnight(now) };
  if ((daily.get(uDayKey) ?? 0) >= lim.perDay) return { ok: false, reason: 'rate_limited', retryAfterSec: secondsToBangkokMidnight(now) };
  if (recent.length >= lim.perMin) {
    return { ok: false, reason: 'rate_limited', retryAfterSec: Math.max(1, Math.ceil((60_000 - (now - recent[0])) / 1000)) };
  }
  recent.push(now);
  minute.set(mKey, recent);
  daily.set(gKey, (daily.get(gKey) ?? 0) + 1);
  daily.set(uDayKey, (daily.get(uDayKey) ?? 0) + 1);
  return { ok: true };
}

/** สำหรับ unit test เท่านั้น */
export function resetRateLimits() {
  minute.clear();
  daily.clear();
}
