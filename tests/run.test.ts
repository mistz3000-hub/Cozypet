import { describe, expect, it } from 'vitest';
import { fnv1a32, mulberry32, rngFromKey } from '@/lib/seeded-random';
import { buildFindingSession, DISTRICT_ORDER, parseRunInput, personaIdForRun, runSeedDistrict, searchPointFor, seedKeyFor } from '@/lib/run';
import { inBangkok, distanceKm } from '@/lib/geo';
import { DISTRICTS } from '@/data/districts';
import { HELPERS, getHelper } from '@/data';
import { availableSlots } from '@/lib/capacity';

describe('seeded-random', () => {
  it('FNV-1a 32-bit ตรงค่าอ้างอิง', () => {
    expect(fnv1a32('')).toBe(0x811c9dc5);
    expect(fnv1a32('a')).toBe(0xe40c292c);
    expect(fnv1a32('foobar')).toBe(0xbf9cf968);
  });
  it('mulberry32 ทำซ้ำได้และอยู่ในช่วง [0,1)', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 100; i++) {
      const x = a();
      expect(x).toBe(b());
      expect(x >= 0 && x < 1).toBe(true);
    }
    expect(rngFromKey('x')()).toBe(rngFromKey('x')());
  });
});

describe('RUN_NUMBER และจุดค้นหา (PROMPT.md 11)', () => {
  it('รับเลข 001–100 เท่านั้น', () => {
    expect(parseRunInput('7')).toBe(7);
    expect(parseRunInput('042')).toBe(42);
    expect(parseRunInput('100')).toBe(100);
    for (const bad of ['0', '101', 'abc', '', '1.5', '-3', '0001']) expect(parseRunInput(bad)).toBeNull();
  });

  it('AC-26: personaIdForRun 1–100 ไม่ซ้ำกันครบ 100 ค่า และมีอยู่จริง', () => {
    const ids = Array.from({ length: 100 }, (_, i) => personaIdForRun(i + 1));
    expect(new Set(ids).size).toBe(100);
    for (const id of ids) expect(getHelper(id)?.kind).toBe('individual');
    expect(() => personaIdForRun(101)).toThrow();
  });

  it('seedKey ตามรูปแบบ', () => {
    expect(seedKeyFor(42, 1)).toBe('cozypet:v1:run=042:finding=1');
  });

  it('AC-27: Run+รอบเดิมได้จุดเดิม · 100 จุดไม่ซ้ำ · ครอบคลุม 50 เขต · อยู่ในกรุงเทพฯ', () => {
    expect(DISTRICT_ORDER).toHaveLength(50);
    expect(new Set(DISTRICT_ORDER).size).toBe(50);
    const points = new Set<string>();
    const districts = new Set<string>();
    for (let run = 1; run <= 100; run++) {
      const d = runSeedDistrict(run, 1);
      const p = searchPointFor(run, 1, d);
      expect(searchPointFor(run, 1, d)).toEqual(p);
      expect(inBangkok(p)).toBe(true);
      points.add(`${p.lat.toFixed(5)},${p.lng.toFixed(5)}`);
      districts.add(d);
    }
    expect(points.size).toBe(100);
    expect(districts.size).toBe(DISTRICTS.length);
  });

  it('รอบใหม่ให้จุดใหม่ และเลือกเขตเองใช้เขตนั้น', () => {
    const s1 = buildFindingSession(42, 1, 'run_seed', undefined, 't');
    const s2 = buildFindingSession(42, 2, 'run_seed', undefined, 't');
    expect(s1.searchPoint).not.toEqual(s2.searchPoint);
    const s3 = buildFindingSession(42, 3, 'district_choice', 'phra-khanong', 't');
    expect(s3.districtId).toBe('phra-khanong');
    expect(s3.id).toBe('finding-042-003');
  });

  it('AC-24/25: availableSlots และพิกัดคงที่ทุก Run', () => {
    expect(availableSlots({ capacityTotal: 100, currentCount: 95 })).toBe(5);
    const before = HELPERS.map((h) => ({ ...h.location }));
    buildFindingSession(7, 1, 'run_seed', undefined, 't');
    expect(HELPERS.map((h) => h.location)).toEqual(before);
    expect(distanceKm({ lat: 13.7, lng: 100.5 }, { lat: 13.7, lng: 100.5 })).toBe(0);
  });
});
