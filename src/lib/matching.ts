/**
 * เทียบสัตว์ที่พบกับประกาศสัตว์หาย (สแกนจำลอง — ไม่ใช่ AI vision) PROMPT.md 7.2
 * คะแนนใช้เรียงภายในเท่านั้น ห้ามแสดงคะแนนหรือเปอร์เซ็นต์ เหตุผลสร้างจากฟิลด์ที่ตรงกันจริงเท่านั้น
 */
import type { CollarStatus, PetListing, Species } from './types';
import { getDistrict } from '@/data/districts';
import { distanceKm } from './geo';

export interface ScanInput {
  species: Species;
  colors: string[];
  collar: { status: CollarStatus; detail?: string };
  districtId: string;
  foundAt: string;
}

export type MatchReason =
  | { code: 'same_species'; species: Species }
  | { code: 'shared_colors'; colors: string[] }
  | { code: 'collar_both'; color?: string }
  | { code: 'nearby'; km: number }
  | { code: 'after_lost'; days: number }
  | { code: 'needs_more_checks' };

export interface MatchCandidate { listing: PetListing; reasons: MatchReason[] }

const MAX_KM = 8;
const MAX_DAYS = 30;

function evaluate(input: ScanInput, l: PetListing): { score: number; reasons: MatchReason[] } {
  const reasons: MatchReason[] = [{ code: 'same_species', species: l.species }];
  let score = 0;
  const shared = l.colors.filter((c) => input.colors.includes(c));
  if (shared.length) {
    score += shared.length;
    reasons.push({ code: 'shared_colors', colors: shared });
  }
  if (input.collar.status === 'yes' && l.collar.status === 'yes') {
    score += 1;
    const sameColor = !!input.collar.detail && input.collar.detail === l.collar.detail;
    if (sameColor) score += 1;
    reasons.push({ code: 'collar_both', color: sameColor ? l.collar.detail : undefined });
  }
  const a = getDistrict(input.districtId);
  const b = getDistrict(l.districtId);
  if (a && b) {
    const km = distanceKm(a.center, b.center);
    if (km <= MAX_KM) {
      score += 1;
      reasons.push({ code: 'nearby', km });
    }
  }
  const days = Math.floor((new Date(input.foundAt).getTime() - new Date(l.eventAt).getTime()) / 86_400_000);
  if (days >= 0 && days <= MAX_DAYS) {
    score += 1;
    reasons.push({ code: 'after_lost', days });
  }
  if (reasons.length === 1) reasons.push({ code: 'needs_more_checks' });
  return { score, reasons };
}

/** คืน 1–3 ประกาศที่อาจตรง (ประกาศ lost ที่เปิดอยู่ ชนิดเดียวกัน) เรียงตามคะแนนภายใน แล้วตาม id */
export function findCandidates(input: ScanInput, listings: readonly PetListing[], limit = 3): MatchCandidate[] {
  const pool = listings.filter((l) => l.type === 'lost' && l.status === 'open' && l.species === input.species);
  const scored = pool.map((l) => ({ l, ...evaluate(input, l) }));
  scored.sort((x, y) => y.score - x.score || x.l.id.localeCompare(y.l.id));
  const positive = scored.filter((s) => s.score > 0);
  const chosen = (positive.length ? positive : scored).slice(0, limit);
  return chosen.map((s) => ({ listing: s.l, reasons: s.reasons }));
}
