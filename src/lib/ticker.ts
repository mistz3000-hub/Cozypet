/**
 * “ความเคลื่อนไหวล่าสุด (จำลอง)” — ข้อความอธิบายข้อมูลปัจจุบันแบบ seeded ตามช่วงเวลา 120 วินาที (PROMPT.md 11.6)
 * ไม่เปลี่ยนข้อมูล และไม่พูดถึงองค์กรจริง (ใช้เฉพาะผู้รับดูแลรายบุคคลและประกาศตัวอย่าง)
 */
import { ADOPTERS, LISTINGS } from '@/data';
import { getSupplies } from '@/data/supplies';
import { availableSlots } from './capacity';
import { rngFromKey } from './seeded-random';

export type TickerEvent =
  | { kind: 'supplies'; id: string; districtId: string; days: number }
  | { kind: 'capacity'; id: string; districtId: string; slots: number }
  | { kind: 'full'; id: string; districtId: string }
  | { kind: 'found'; id: string; districtId: string; species: 'cat' | 'dog' | 'other' }
  | { kind: 'adoption'; id: string; districtId: string; name: string };

export const TICKER_BUCKET_MS = 120_000;

export function tickerAt(bucket: number, count = 5): TickerEvent[] {
  const rng = rngFromKey(`cozypet:v1:ticker:${bucket}`);
  const pool: TickerEvent[] = [];
  for (const a of ADOPTERS) {
    const sup = getSupplies(a.id);
    if (a.availability === 'unavailable') continue;
    if (availableSlots(a) === 0) pool.push({ kind: 'full', id: a.id, districtId: a.districtId });
    else pool.push({ kind: 'capacity', id: a.id, districtId: a.districtId, slots: availableSlots(a) });
    if (sup) pool.push({ kind: 'supplies', id: a.id, districtId: a.districtId, days: Math.min(sup.foodDays, sup.litterDays ?? sup.foodDays) });
  }
  for (const l of LISTINGS) {
    if (l.status !== 'open') continue;
    if (l.type === 'found' && l.careHolderId?.startsWith('adopter-')) pool.push({ kind: 'found', id: l.id, districtId: l.districtId, species: l.species });
    if (l.type === 'adoption' && l.name && l.careHolderId?.startsWith('adopter-')) pool.push({ kind: 'adoption', id: l.id, districtId: l.districtId, name: l.name });
  }
  const out: TickerEvent[] = [];
  const used = new Set<number>();
  while (out.length < Math.min(count, pool.length)) {
    const i = Math.floor(rng() * pool.length);
    if (used.has(i)) continue;
    used.add(i);
    out.push(pool[i]);
  }
  return out;
}
