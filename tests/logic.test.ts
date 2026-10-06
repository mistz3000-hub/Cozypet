import { describe, expect, it } from 'vitest';
import { LISTINGS } from '@/data';
import { findCandidates } from '@/lib/matching';
import { computeActivities, kindnessLevel, totalPoints, bangkokDay } from '@/lib/kindness';
import { orderStepIndex, orderStepTime, canCancelOrder } from '@/lib/orders';
import { ORDER_STEP_SECONDS } from '@/lib/balancer-config';
import { runSimulation } from '@/lib/simulation';
import { handoffBlock, handoffModeFor } from '@/lib/handoff';
import { getHelper } from '@/data';
import type { CareRequest, DonationOrder, Handoff, PetListing } from '@/lib/types';

describe('สแกนจำลอง (AC-18)', () => {
  it('กรณีมาตรฐาน: แมว ส้มขาว ปลอกคอแดง พระโขนง → มะม่วงอันดับแรก ไม่มีตัวเลขคะแนน', () => {
    const r = findCandidates({ species: 'cat', colors: ['orange', 'white'], collar: { status: 'yes', detail: 'red' }, districtId: 'phra-khanong', foundAt: '2026-09-23T10:00:00+07:00' }, LISTINGS);
    expect(r[0].listing.id).toBe('listing-001');
    expect(r.length).toBeGreaterThanOrEqual(1);
    expect(r.length).toBeLessThanOrEqual(3);
    expect(JSON.stringify(r[0].reasons)).not.toMatch(/score|%/);
    const codes = r[0].reasons.map((x) => x.code);
    expect(codes).toEqual(expect.arrayContaining(['same_species', 'shared_colors', 'collar_both', 'nearby', 'after_lost']));
  });

  it('เหตุผลมาจากฟิลด์ที่ตรงจริงเท่านั้น', () => {
    const r = findCandidates({ species: 'other', colors: [], collar: { status: 'unknown' }, districtId: 'nong-chok', foundAt: '2026-12-31T00:00:00+07:00' }, LISTINGS);
    expect(r[0].listing.species).toBe('other');
    expect(r[0].reasons.map((x) => x.code)).toEqual(['same_species', 'needs_more_checks']);
  });

  it('ใช้เฉพาะประกาศสัตว์หายที่เปิดอยู่ ชนิดเดียวกัน', () => {
    const r = findCandidates({ species: 'dog', colors: ['black'], collar: { status: 'no' }, districtId: 'chatuchak', foundAt: '2026-09-27T10:00:00+07:00' }, LISTINGS);
    for (const c of r) expect([c.listing.type, c.listing.species, c.listing.status]).toEqual(['lost', 'dog', 'open']);
  });
});

describe('แต้มน้ำใจ (AC-71)', () => {
  const at = (h: number) => new Date(Date.UTC(2026, 9, 6, h)).toISOString();
  const listing = (id: string, type: 'found' | 'lost', createdAt: string) => ({ id, type, createdAt } as PetListing);
  it('คิดตามตาราง ไม่นับที่ยกเลิก', () => {
    const r = {
      userListings: [listing('l1', 'found', at(1)), listing('l2', 'lost', at(2))],
      careRequests: [
        { id: 'r1', type: 'intake', status: 'pending_contact', createdAt: at(3) } as CareRequest,
        { id: 'r2', type: 'adopt', status: 'pending_contact', createdAt: at(3) } as CareRequest,
        { id: 'r3', type: 'foster', status: 'cancelled', createdAt: at(3) } as CareRequest,
      ],
      handoffs: [{ id: 'h1', createdAt: at(4) } as Handoff],
      donationOrders: [
        { id: 'o1', quantity: 1, unitPriceTHB: 299, status: 'active', createdAt: at(5) } as DonationOrder,
        { id: 'o2', quantity: 1, unitPriceTHB: 990, status: 'cancelled', createdAt: at(5) } as DonationOrder,
      ],
    };
    expect(totalPoints(r)).toBe(10 + 5 + 5 + 10 + 30 + 29);
  });
  it('เพดาน 200 แต้ม/วัน (เวลาไทย)', () => {
    const orders = Array.from({ length: 5 }, (_, i) => ({ id: `o${i}`, quantity: 5, unitPriceTHB: 990, status: 'active', createdAt: at(1 + i) } as DonationOrder));
    expect(totalPoints({ userListings: [], careRequests: [], handoffs: [], donationOrders: orders })).toBe(200);
    expect(bangkokDay('2026-10-05T18:00:00Z')).toBe('2026-10-06');
    const nextDay = [...orders, { id: 'oz', quantity: 1, unitPriceTHB: 290, status: 'active', createdAt: '2026-10-07T03:00:00Z' } as DonationOrder];
    expect(totalPoints({ userListings: [], careRequests: [], handoffs: [], donationOrders: nextDay })).toBe(229);
    expect(computeActivities({ userListings: [], careRequests: [], handoffs: [], donationOrders: nextDay })[0].refId).toBe('oz');
  });
  it('ระดับป้าย', () => {
    expect([kindnessLevel(0), kindnessLevel(49), kindnessLevel(50), kindnessLevel(199), kindnessLevel(200)]).toEqual(['friend', 'friend', 'helper', 'helper', 'hero']);
  });
});

describe('timeline คำสั่งจำลอง (AC-70)', () => {
  const order: DonationOrder = { id: 'o', runNumber: 1, helperId: 'adopter-001', packageId: 'pkg-cat-food-7d', quantity: 1, unitPriceTHB: 290, status: 'active', createdAt: '2026-10-06T00:00:00.000Z', isDemo: true };
  it('เวลาแต่ละขั้น = createdAt + k × ORDER_STEP_SECONDS', () => {
    expect(orderStepTime(order, 2).toISOString()).toBe(new Date(Date.parse(order.createdAt) + 2 * ORDER_STEP_SECONDS * 1000).toISOString());
    expect(orderStepIndex(order, new Date(Date.parse(order.createdAt) + 1000))).toBe(0);
    expect(orderStepIndex(order, new Date(Date.parse(order.createdAt) + 31_000))).toBe(2);
    expect(orderStepIndex(order, new Date(Date.parse(order.createdAt) + 999_000))).toBe(4);
    expect(orderStepIndex({ ...order, fastForwarded: true }, new Date(order.createdAt))).toBe(4);
    expect(orderStepIndex({ ...order, status: 'cancelled' }, new Date(order.createdAt))).toBe(-1);
    expect(canCancelOrder(order, new Date(Date.parse(order.createdAt) + 16_000))).toBe(true);
    expect(canCancelOrder(order, new Date(Date.parse(order.createdAt) + 31_000))).toBe(false);
  });
});

describe('ยืนยันส่งต่อน้อง (เงื่อนไขจาก record)', () => {
  it('เต็ม/ไม่รับชนิด/ปิดรับ', () => {
    expect(handoffBlock(getHelper('shelter-007')!, 'cat')).toBe('full');
    expect(handoffBlock(getHelper('shelter-002')!, 'dog')).toBe('species');
    expect(handoffBlock(getHelper('shelter-001')!, 'dog')).toBeNull();
    expect(handoffModeFor(getHelper('shelter-001')!)).toBe('intake');
    expect(handoffModeFor(getHelper('adopter-002')!)).toBe('adopt');
    expect(handoffModeFor(getHelper('adopter-001')!)).toBe('foster');
  });
});

describe('จำลองสถานการณ์ 30 วัน (AC-68)', () => {
  it('seed เริ่มต้น: callsB < callsA และช่วงความแออัดของ B แคบกว่า A · deterministic', () => {
    const r = runSimulation();
    expect(r.b.totals.calls).toBeLessThan(r.a.totals.calls);
    expect(r.b.totals.avgSpread).toBeLessThan(r.a.totals.avgSpread);
    expect(r.a.days).toHaveLength(30);
    expect(runSimulation()).toEqual(r);
    expect(r.reductionPct).toBe(Math.round(((r.a.totals.calls - r.b.totals.calls) / r.a.totals.calls) * 100));
  });
});
