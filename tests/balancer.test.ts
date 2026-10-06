import { describe, expect, it } from 'vitest';
import { HELPERS, LISTINGS, getHelper } from '@/data';
import { SUPPLIES } from '@/data/supplies';
import { PACKAGES } from '@/data/packages';
import { helperBlocker, placeToCandidate, rankAdoptions, rankDonationTargets, rankHelpers, rankUrgentCases } from '@/lib/balancer';
import { HELPER_WEIGHTS, DONATION_WEIGHTS, ADOPTION_WEIGHTS, ORDER_STEP_SECONDS } from '@/lib/balancer-config';
import { statusInfo, statusLevel, supplyLevel } from '@/lib/status';
import { buildFindingSession } from '@/lib/run';
import { alternativesFor } from '@/lib/chat-context';
import { buildChatContext } from '@/lib/chat-context';
import type { CaretakerPlace, DonationOrder, GeoPoint } from '@/lib/types';

const NOW = new Date('2026-10-06T10:00:00+07:00');
const supplies = new Map(SUPPLIES.map((s) => [s.helperId, s]));
const packages = new Map(PACKAGES.map((p) => [p.id, p]));
const helpersMap = new Map(HELPERS.map((h) => [h.id, h]));
const point: GeoPoint = { lat: 13.702, lng: 100.601 };

describe('น้ำหนัก', () => {
  it('รวมเป็น 1 ทุกชุด', () => {
    for (const w of [HELPER_WEIGHTS, DONATION_WEIGHTS, ADOPTION_WEIGHTS]) {
      expect(Object.values(w).reduce((s, x) => s + x, 0)).toBeCloseTo(1, 10);
    }
  });
});

describe('statusLevel / supplyLevel (11.6)', () => {
  it('ตามเกณฑ์', () => {
    expect(statusLevel({ capacityTotal: 10, currentCount: 10 })).toBe('full');
    expect(statusLevel({ capacityTotal: 10, currentCount: 8 })).toBe('tight');
    expect(statusLevel({ capacityTotal: 10, currentCount: 7 })).toBe('open');
    expect(statusInfo({ capacityTotal: 10, currentCount: 1, availability: 'unavailable' })).toEqual({ level: 'full', closed: true });
    expect(supplyLevel(2)).toBe('critical');
    expect(supplyLevel(10, 2)).toBe('critical');
    expect(supplyLevel(6, 20)).toBe('low');
    expect(supplyLevel(7, 7)).toBe('ok');
  });
});

describe('rankHelpers (AC-64)', () => {
  const base = { candidates: HELPERS, species: 'cat' as const, urgency: 'normal' as const, searchPoint: point, radiusKm: 5 };

  it('ตัดตามเงื่อนไขบังคับและนับ excluded', () => {
    const r = rankHelpers(base);
    for (const item of r.items) {
      const h = getHelper(item.id)!;
      expect(helperBlocker(h, 'cat', 'normal')).toBeNull();
      expect(item.distanceKm!).toBeLessThanOrEqual(5);
    }
    const total = Object.values(r.excluded).reduce((s, n) => s + n, 0);
    expect(total).toBeGreaterThan(0);
    expect(new Set(r.items.map((i) => i.id)).size).toBe(r.items.length);
  });

  it('คะแนน = Σ น้ำหนัก × ค่า และเรียงมากไปน้อย (เท่ากันเรียงตามระยะแล้ว id)', () => {
    const r = rankHelpers({ ...base, radiusKm: null });
    for (const item of r.items) {
      const s = item.factors.reduce((acc, f) => acc + f.weight * f.value, 0);
      expect(item.score).toBeCloseTo(s, 12);
      for (const f of item.factors) expect(f.value >= 0 && f.value <= 1).toBe(true);
    }
    for (let i = 1; i < r.items.length; i++) {
      const a = r.items[i - 1];
      const b = r.items[i];
      expect(a.score > b.score || (a.score === b.score && ((a.distanceKm ?? 0) < (b.distanceKm ?? 0) || ((a.distanceKm ?? 0) === (b.distanceKm ?? 0) && a.id < b.id)))).toBe(true);
    }
  });

  it('ฉุกเฉินตัดที่ไม่รับฉุกเฉิน และ foster-only สำหรับบุคคล', () => {
    const r = rankHelpers({ ...base, urgency: 'emergency', radiusKm: null });
    for (const item of r.items) expect(getHelper(item.id)!.acceptsEmergency).toBe(true);
    const r2 = rankHelpers({ ...base, radiusKm: null });
    for (const item of r2.items) {
      const h = getHelper(item.id)!;
      if (h.kind === 'individual') expect(h.careModes).toContain('foster');
    }
  });

  it('reasons มาจากค่าจริงของ record', () => {
    const r = rankHelpers({ ...base, radiusKm: null });
    for (const item of r.items) {
      const h = getHelper(item.id)!;
      const has = item.reasons.find((x) => x.code === 'has_space');
      expect(has?.params.slots).toBe(h.capacityTotal - h.currentCount);
    }
    expect(r.items.filter((i) => i.reasons.some((x) => x.code === 'closest_with_space'))).toHaveLength(1);
  });

  it('deterministic', () => {
    expect(rankHelpers(base)).toEqual(rankHelpers(base));
  });

  it('สถานที่ของฉัน (ทดลอง) เข้าร่วมจัดอันดับได้ และได้เหตุผล your_place', () => {
    const place: CaretakerPlace = {
      id: 'place-test', runNumber: 1, displayName: 'บ้านทดลอง', districtId: 'phra-khanong', location: point,
      speciesAccepted: ['cat'], careModes: ['foster'], capacityTotal: 10, currentCount: 0, acceptsEmergency: true, foodDays: 10, updatedAt: NOW.toISOString(), isDemo: true,
    };
    const r = rankHelpers({ ...base, candidates: [...HELPERS, placeToCandidate(place)] });
    expect(r.items[0].id).toBe('place-test');
    expect(r.items[0].reasons[0].code).toBe('your_place');
  });

  it('AC-65: ที่อื่นที่ยังรับได้ = บริบทแชต สำหรับ Run/รอบ/ชนิดเดียวกัน', () => {
    const s = buildFindingSession(42, 1, 'run_seed', undefined, 't');
    const alts = alternativesFor('shelter-007', 'cat', s.searchPoint).map((x) => x.id);
    const ctx = buildChatContext({ persona: { kind: 'shelter', id: 'shelter-007' }, runNumber: 42, findingIndex: 1, locale: 'th' })!;
    expect(ctx.alternatives.map((a) => a.id)).toEqual(alts);
    expect(alts.length).toBeGreaterThan(0);
    expect(alts).not.toContain('shelter-007');
  });

  it('fixture: ผู้รับดูแลที่เต็มมีที่ว่างรับชนิดเดียวกันภายใน 3 กม.', () => {
    const full = HELPERS.filter((h) => h.kind === 'individual' && h.currentCount === h.capacityTotal);
    const ok = full.some((f) => rankHelpers({ candidates: HELPERS, species: f.speciesAccepted[0], urgency: 'normal', searchPoint: f.location, radiusKm: 3, excludeId: f.id }).items.some((i) => getHelper(i.id)!.kind === 'individual'));
    expect(ok).toBe(true);
  });
});

describe('rankDonationTargets (AC-64, AC-70)', () => {
  it('มีเฉพาะผู้รับดูแลรายบุคคลที่ acceptsSupplyPackages', () => {
    const r = rankDonationTargets({ helpers: HELPERS, supplies, orders: [], packages, now: NOW });
    expect(r.items.length).toBe(SUPPLIES.length);
    for (const i of r.items) {
      const h = getHelper(i.id)!;
      expect(h.kind).toBe('individual');
      expect(h.acceptsSupplyPackages).toBe(true);
    }
  });

  it('ผู้รับที่ได้แพ็กเกจลดอันดับหลังขั้น “ถึงผู้ดูแล”', () => {
    const before = rankDonationTargets({ helpers: HELPERS, supplies, orders: [], packages, now: NOW });
    const top = before.items[0].id;
    const order: DonationOrder = { id: 'order-x', runNumber: 1, helperId: top, packageId: 'pkg-bundle-30d', quantity: 2, unitPriceTHB: 990, status: 'active', createdAt: NOW.toISOString(), isDemo: true };
    const immediately = rankDonationTargets({ helpers: HELPERS, supplies, orders: [order], packages, now: NOW });
    const afterArrive = rankDonationTargets({ helpers: HELPERS, supplies, orders: [order], packages, now: new Date(NOW.getTime() + 3 * ORDER_STEP_SECONDS * 1000) });
    const idx = (r: typeof before) => r.items.findIndex((i) => i.id === top);
    expect(idx(afterArrive)).toBeGreaterThan(idx(immediately));
    expect(idx(immediately)).toBeGreaterThanOrEqual(idx(before));
  });

  it('กรองชนิดสัตว์', () => {
    const r = rankDonationTargets({ helpers: HELPERS, supplies, orders: [], packages, now: NOW, species: 'dog' });
    for (const i of r.items) expect(getHelper(i.id)!.speciesAccepted).toContain('dog');
  });
});

describe('rankAdoptions', () => {
  it('ใช้เฉพาะประกาศหาบ้านที่เปิดอยู่ และ matches_history ตามประวัติ', () => {
    const r = rankAdoptions({ listings: LISTINGS, helpers: helpersMap, now: NOW, history: [{ at: NOW.toISOString(), helpType: 'adopt', species: 'dog', urgency: 'normal' }] });
    expect(r.items.length).toBe(LISTINGS.filter((l) => l.type === 'adoption' && l.status === 'open').length);
    for (const i of r.items) {
      const l = LISTINGS.find((x) => x.id === i.id)!;
      expect(i.reasons.some((x) => x.code === 'matches_history')).toBe(l.species === 'dog');
    }
  });
});

describe('rankUrgentCases (11.6)', () => {
  it('≤ 5 รายการ ไม่มีสถานสงเคราะห์ ฉุกเฉินมาก่อน', () => {
    const r = rankUrgentCases({ listings: LISTINGS, helpers: helpersMap, supplies, orders: [], packages, now: NOW });
    expect(r.length).toBeLessThanOrEqual(5);
    expect(r.length).toBeGreaterThan(0);
    expect(r[0]).toMatchObject({ kind: 'listing', urgency: 'emergency' });
    for (const c of r) {
      if (c.kind === 'supplies') expect(getHelper(c.helperId)!.kind).toBe('individual');
      else expect(getHelper(LISTINGS.find((l) => l.id === c.listingId)!.careHolderId)!.kind).not.toBe('shelter');
    }
  });
});
