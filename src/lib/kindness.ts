/**
 * แต้มน้ำใจ — คำนวณจาก records ทุกครั้ง ไม่เก็บเป็นตัวเลขแยก ไม่มีมูลค่า (PROMPT.md 7.13)
 */
import type { ActivityEntry, CaretakerPlace, CareRequest, DonationOrder, Handoff, PetListing } from './types';
import { orderTotalTHB } from './orders';

export const POINTS = {
  listing_found: 10,
  listing_lost: 5,
  request_intake: 5,
  request_care: 10,
  handoff: 30,
  place_update: 2,
} as const;
export const DAILY_CAP = 200;

export interface KindnessRecords {
  userListings: readonly PetListing[];
  careRequests: readonly CareRequest[];
  handoffs: readonly Handoff[];
  donationOrders: readonly DonationOrder[];
  microDonations?: readonly import('./types').MicroDonation[];
  caretakerPlace?: CaretakerPlace | null;
}

/** วันที่ตามเวลาไทย (YYYY-MM-DD) */
export function bangkokDay(iso: string): string {
  const d = new Date(new Date(iso).getTime() + 7 * 3_600_000);
  return d.toISOString().slice(0, 10);
}

export function computeActivities(r: KindnessRecords): ActivityEntry[] {
  const raw: ActivityEntry[] = [];
  for (const l of r.userListings) {
    if (l.type === 'found') raw.push({ kind: 'listing_found', refId: l.id, at: l.createdAt, points: POINTS.listing_found });
    else if (l.type === 'lost') raw.push({ kind: 'listing_lost', refId: l.id, at: l.createdAt, points: POINTS.listing_lost });
  }
  for (const q of r.careRequests) {
    if (q.status === 'cancelled') continue;
    raw.push(q.type === 'intake'
      ? { kind: 'request_intake', refId: q.id, at: q.createdAt, points: POINTS.request_intake }
      : { kind: 'request_care', refId: q.id, at: q.createdAt, points: POINTS.request_care });
  }
  for (const h of r.handoffs) raw.push({ kind: 'handoff', refId: h.id, at: h.createdAt, points: POINTS.handoff });
  for (const o of r.donationOrders) {
    if (o.status === 'cancelled') continue;
    raw.push({ kind: 'order', refId: o.id, at: o.createdAt, points: Math.floor(orderTotalTHB(o) / 10) });
  }
  for (const d of r.microDonations ?? []) raw.push({ kind: 'micro', refId: d.id, at: d.createdAt, points: Math.floor(d.amountTHB / 10) });
  const place = r.caretakerPlace;
  if (place) {
    const days = new Set(place.updateDays ?? [bangkokDay(place.updatedAt)]);
    for (const day of [...days].sort()) {
      raw.push({ kind: 'place_update', refId: place.id, at: `${day}T12:00:00+07:00`, points: POINTS.place_update });
    }
  }
  // เพดาน 200 แต้มต่อวัน (เวลาไทย) ตามลำดับเวลา
  raw.sort((a, b) => a.at.localeCompare(b.at) || a.refId.localeCompare(b.refId));
  const usedByDay = new Map<string, number>();
  const capped = raw.map((e) => {
    const day = bangkokDay(e.at);
    const used = usedByDay.get(day) ?? 0;
    const points = Math.max(0, Math.min(e.points, DAILY_CAP - used));
    usedByDay.set(day, used + points);
    return { ...e, points };
  });
  return capped.sort((a, b) => b.at.localeCompare(a.at) || a.refId.localeCompare(b.refId));
}

export function totalPoints(r: KindnessRecords): number {
  return computeActivities(r).reduce((s, e) => s + e.points, 0);
}

export type KindnessLevel = 'friend' | 'helper' | 'hero';
export function kindnessLevel(points: number): KindnessLevel {
  if (points >= 200) return 'hero';
  if (points >= 50) return 'helper';
  return 'friend';
}
