import type { DistrictId, FindingSession, GeoPoint } from './types';
import { DISTRICTS, getDistrict } from '@/data/districts';
import { pad3, rngFromKey, seededShuffle } from './seeded-random';
import { clampToBangkok, offsetPoint, round5 } from './geo';

export const RUN_MIN = 1;
export const RUN_MAX = 100;

export function isValidRun(n: unknown): n is number {
  return typeof n === 'number' && Number.isInteger(n) && n >= RUN_MIN && n <= RUN_MAX;
}

/** แปลงข้อความที่ผู้ใช้กรอก (1–3 หลัก) เป็นเลข Run หรือ null */
export function parseRunInput(raw: string): number | null {
  const t = raw.trim();
  if (!/^\d{1,3}$/.test(t)) return null;
  const n = Number(t);
  return isValidRun(n) ? n : null;
}

export function formatRun(n: number): string {
  return pad3(n);
}

/** persona หลักของ Run: adopter-<run> หนึ่งต่อหนึ่ง ห้าม modulo (PROMPT.md 11.1) */
export function personaIdForRun(run: number): string {
  if (!isValidRun(run)) throw new Error(`invalid run ${run}`);
  return `adopter-${pad3(run)}`;
}

/** ลำดับเขตที่สลับด้วย seed คงที่ (คำนวณครั้งเดียว) */
export const DISTRICT_ORDER: readonly DistrictId[] = seededShuffle(
  DISTRICTS.map((d) => d.id),
  rngFromKey('cozypet:v1:district-order'),
);

export function seedKeyFor(run: number, findingIndex: number): string {
  return `cozypet:v1:run=${pad3(run)}:finding=${findingIndex}`;
}

export function runSeedDistrict(run: number, findingIndex: number): DistrictId {
  return DISTRICT_ORDER[(run - 1 + (findingIndex - 1) * 37) % DISTRICT_ORDER.length];
}

export function searchPointFor(run: number, findingIndex: number, districtId: DistrictId): GeoPoint {
  const district = getDistrict(districtId);
  if (!district) throw new Error(`unknown district ${districtId}`);
  const rng = rngFromKey(seedKeyFor(run, findingIndex));
  const bearing = rng() * 360;
  const meters = 200 + rng() * 1000;
  return round5(clampToBangkok(offsetPoint(district.center, bearing, meters)));
}

export function buildFindingSession(
  run: number,
  findingIndex: number,
  origin: FindingSession['origin'],
  chosenDistrict: DistrictId | undefined,
  createdAt: string,
): FindingSession {
  const districtId = origin === 'district_choice' && chosenDistrict ? chosenDistrict : runSeedDistrict(run, findingIndex);
  return {
    id: `finding-${pad3(run)}-${pad3(findingIndex)}`,
    runNumber: run,
    findingIndex,
    origin,
    districtId,
    searchPoint: searchPointFor(run, findingIndex, districtId),
    seedKey: seedKeyFor(run, findingIndex),
    createdAt,
  };
}
