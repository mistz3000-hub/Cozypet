/**
 * Smart Load Balancer (PROMPT.md 11.5–11.6) — pure functions, deterministic
 * ไม่มี Math.random ไม่อ่านเวลาเอง (รับ now เป็นพารามิเตอร์) ทุก flow ที่แนะนำสถานที่/ผู้รับต้องเรียกฟังก์ชันชุดนี้
 */
import type {
  CaretakerPlace, DonationOrder, DonationPackage, ExclusionKey, GeoPoint, HelperProfile, HelperSupplies,
  PetListing, RankingResult, Reason, Recommendation, ScoreFactor, SearchHistoryEntry, Species, UrgentCase, Urgency,
} from './types';
import { availableSlots, occupancyRatio } from './capacity';
import { distanceKm } from './geo';
import {
  ADOPTION_WEIGHTS, ALL_BANGKOK_REFERENCE_KM, DONATION_WEIGHTS, FAIRNESS_CAP_PACKAGES, HELPER_WEIGHTS,
  SCARCITY_CAP_DAYS, TIGHT_RATIO, WAITING_CAP_DAYS,
} from './balancer-config';
import { supplyLevel, supplyReasons } from './status';
import { effectiveSupplies, userOrdersToHelperWithin30d } from './orders';

// ---------------------------------------------------------------------------
// 1) rankHelpers — ส่งน้องเข้าดูแล
// ---------------------------------------------------------------------------

export interface BalancerCandidate {
  id: string;
  kind: 'shelter' | 'individual';
  speciesAccepted: Species[];
  careModes: HelperProfile['careModes'];
  capacityTotal: number;
  currentCount: number;
  availability: HelperProfile['availability'];
  acceptsEmergency: boolean;
  location: GeoPoint;
  /** สถานที่ของฉัน (ทดลอง) — จัดอันดับเฉพาะในเครื่องของผู้ใช้คนนั้น */
  isUserPlace?: boolean;
}

export function placeToCandidate(p: CaretakerPlace): BalancerCandidate {
  return {
    id: p.id, kind: 'individual', speciesAccepted: p.speciesAccepted, careModes: p.careModes,
    capacityTotal: p.capacityTotal, currentCount: p.currentCount, availability: 'available',
    acceptsEmergency: p.acceptsEmergency, location: p.location, isUserPlace: true,
  };
}

export interface RankHelpersInput {
  candidates: readonly BalancerCandidate[];
  species: Species;
  urgency: Urgency;
  searchPoint: GeoPoint;
  /** null = ทั้งกรุงเทพฯ */
  radiusKm: number | null;
  excludeId?: string;
}

export function emptyExcluded(): Record<ExclusionKey, number> {
  return { full: 0, species: 0, unavailable: 0, emergency: 0, mode: 0 };
}

/** เหตุผลที่ผู้ช่วยดูแลรายนี้รับน้องไม่ได้ (เงื่อนไขบังคับ) หรือ null ถ้าผ่าน */
export function helperBlocker(c: Pick<BalancerCandidate, 'kind' | 'speciesAccepted' | 'careModes' | 'capacityTotal' | 'currentCount' | 'availability' | 'acceptsEmergency'>, species: Species, urgency: Urgency): ExclusionKey | null {
  if (!c.speciesAccepted.includes(species)) return 'species';
  if (c.availability === 'unavailable') return 'unavailable';
  if (availableSlots(c) === 0) return 'full';
  if (urgency === 'emergency' && !c.acceptsEmergency) return 'emergency';
  if (c.kind === 'individual' && !c.careModes.includes('foster')) return 'mode';
  return null;
}

function urgencyValue(urgency: Urgency, acceptsEmergency: boolean): number {
  if (urgency === 'soon') return acceptsEmergency ? 1 : 0.5;
  return 1;
}

export function rankHelpers(input: RankHelpersInput): RankingResult {
  const excluded = emptyExcluded();
  const reference = input.radiusKm ?? ALL_BANGKOK_REFERENCE_KM;
  const seen = new Set<string>();
  const scored: Array<{ c: BalancerCandidate; rec: Recommendation }> = [];

  for (const c of input.candidates) {
    if (seen.has(c.id) || c.id === input.excludeId) continue;
    seen.add(c.id);
    const d = distanceKm(input.searchPoint, c.location);
    if (input.radiusKm !== null && d > input.radiusKm) continue;
    const blocker = helperBlocker(c, input.species, input.urgency);
    if (blocker) {
      excluded[blocker] += 1;
      continue;
    }
    const slots = availableSlots(c);
    const space = slots / c.capacityTotal;
    const proximity = Math.max(0, 1 - d / reference);
    const urg = urgencyValue(input.urgency, c.acceptsEmergency);
    const factors: ScoreFactor[] = [
      { key: 'space', weight: HELPER_WEIGHTS.space, value: space, rawLabel: `${slots}/${c.capacityTotal}` },
      { key: 'proximity', weight: HELPER_WEIGHTS.proximity, value: proximity, rawLabel: `${d}` },
      { key: 'urgency', weight: HELPER_WEIGHTS.urgency, value: urg, rawLabel: input.urgency },
    ];
    const score = factors.reduce((s, f) => s + f.weight * f.value, 0);
    scored.push({ c, rec: { id: c.id, score, factors, reasons: [], distanceKm: d } });
  }

  scored.sort((a, b) => b.rec.score - a.rec.score || (a.rec.distanceKm ?? 0) - (b.rec.distanceKm ?? 0) || a.rec.id.localeCompare(b.rec.id));

  // เหตุผลเชิงเปรียบเทียบ (จากค่าจริงในรายการนี้เท่านั้น)
  let closestId: string | null = null;
  let closestKm = Infinity;
  for (const s of scored) {
    if ((s.rec.distanceKm ?? Infinity) < closestKm || ((s.rec.distanceKm ?? Infinity) === closestKm && closestId !== null && s.rec.id < closestId)) {
      closestKm = s.rec.distanceKm ?? Infinity;
      closestId = s.rec.id;
    }
  }
  let mostSpaceId: string | null = null;
  let mostSpace = -1;
  for (const s of scored.slice(0, 5)) {
    const ratio = availableSlots(s.c) / s.c.capacityTotal;
    if (ratio > mostSpace) {
      mostSpace = ratio;
      mostSpaceId = s.rec.id;
    }
  }

  for (const s of scored) {
    const reasons: Reason[] = [];
    if (s.rec.id === closestId) reasons.push({ code: 'closest_with_space', params: { km: s.rec.distanceKm ?? 0 } });
    if (s.rec.id === mostSpaceId && scored.length > 1) reasons.push({ code: 'most_space_nearby', params: { slots: availableSlots(s.c), total: s.c.capacityTotal } });
    reasons.push({ code: 'has_space', params: { slots: availableSlots(s.c) } });
    if (input.urgency !== 'normal' && s.c.acceptsEmergency) reasons.push({ code: 'accepts_emergency', params: {} });
    reasons.push({ code: 'accepts_species', params: { species: input.species } });
    if (s.c.isUserPlace) reasons.unshift({ code: 'your_place', params: {} });
    s.rec.reasons = reasons;
  }

  return { items: scored.map((s) => s.rec), excluded };
}

// ---------------------------------------------------------------------------
// 2) rankDonationTargets — ส่งแพ็กเกจของใช้
// ---------------------------------------------------------------------------

export interface RankDonationInput {
  helpers: readonly HelperProfile[];
  supplies: ReadonlyMap<string, HelperSupplies>;
  orders: readonly DonationOrder[];
  packages: ReadonlyMap<string, DonationPackage>;
  now: Date;
  species?: Species | null;
}

export interface DonationTargetDetail { foodDays: number; litterDays?: number; recentTotal: number }

export function donationTargetDetail(helperId: string, base: HelperSupplies, input: Pick<RankDonationInput, 'orders' | 'packages' | 'now'>): DonationTargetDetail {
  const eff = effectiveSupplies(base, helperId, input.orders, input.packages, input.now);
  return { ...eff, recentTotal: base.recentPackages30d + userOrdersToHelperWithin30d(helperId, input.orders, input.now) };
}

export function rankDonationTargets(input: RankDonationInput): RankingResult {
  const items: Recommendation[] = [];
  for (const h of input.helpers) {
    if (h.kind !== 'individual' || !h.acceptsSupplyPackages) continue; // สถานสงเคราะห์จริงไม่เป็นปลายทางเด็ดขาด
    if (input.species && !h.speciesAccepted.includes(input.species)) continue;
    const base = input.supplies.get(h.id);
    if (!base) continue;
    const det = donationTargetDetail(h.id, base, input);
    const effDays = Math.min(det.foodDays, det.litterDays ?? det.foodDays);
    const ratio = occupancyRatio(h);
    const factors: ScoreFactor[] = [
      { key: 'scarcity', weight: DONATION_WEIGHTS.scarcity, value: 1 - Math.min(effDays, SCARCITY_CAP_DAYS) / SCARCITY_CAP_DAYS, rawLabel: `${effDays}` },
      { key: 'crowding', weight: DONATION_WEIGHTS.crowding, value: ratio, rawLabel: `${h.currentCount}/${h.capacityTotal}` },
      { key: 'fairness', weight: DONATION_WEIGHTS.fairness, value: 1 - Math.min(det.recentTotal, FAIRNESS_CAP_PACKAGES) / FAIRNESS_CAP_PACKAGES, rawLabel: `${det.recentTotal}` },
    ];
    const reasons: Reason[] = supplyReasons(det.foodDays, det.litterDays);
    if (ratio >= TIGHT_RATIO) reasons.push({ code: 'nearly_full', params: { current: h.currentCount, total: h.capacityTotal } });
    if (det.recentTotal <= 1) reasons.push({ code: 'few_recent_packages', params: { count: det.recentTotal } });
    items.push({ id: h.id, score: factors.reduce((s, f) => s + f.weight * f.value, 0), factors, reasons });
  }
  items.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return { items, excluded: emptyExcluded() };
}

// ---------------------------------------------------------------------------
// 3) rankAdoptions — อยากรับเลี้ยง
// ---------------------------------------------------------------------------

export interface RankAdoptionInput {
  listings: readonly PetListing[];
  helpers: ReadonlyMap<string, Pick<HelperProfile, 'capacityTotal' | 'currentCount'>>;
  now: Date;
  history: readonly SearchHistoryEntry[];
}

export function favouriteSpecies(history: readonly SearchHistoryEntry[]): Species | null {
  const recent = [...history].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 10);
  if (!recent.length) return null;
  const counts = new Map<Species, number>();
  for (const h of recent) counts.set(h.species, (counts.get(h.species) ?? 0) + 1);
  let best: Species | null = null;
  let bestN = 0;
  for (const sp of ['cat', 'dog', 'other'] as Species[]) {
    const n = counts.get(sp) ?? 0;
    if (n > bestN) {
      best = sp;
      bestN = n;
    }
  }
  return best;
}

export function rankAdoptions(input: RankAdoptionInput): RankingResult {
  const fav = favouriteSpecies(input.history);
  const items: Recommendation[] = [];
  for (const l of input.listings) {
    if (l.type !== 'adoption' || l.status !== 'open') continue;
    const holder = l.careHolderId ? input.helpers.get(l.careHolderId) : undefined;
    const ratio = holder ? occupancyRatio(holder) : 0;
    const days = Math.max(0, Math.floor((input.now.getTime() - new Date(l.createdAt).getTime()) / 86_400_000));
    const matches = fav !== null && l.species === fav ? 1 : 0;
    const factors: ScoreFactor[] = [
      { key: 'crowding', weight: ADOPTION_WEIGHTS.crowding, value: ratio, rawLabel: holder ? `${holder.currentCount}/${holder.capacityTotal}` : '-' },
      { key: 'waiting', weight: ADOPTION_WEIGHTS.waiting, value: Math.min(days, WAITING_CAP_DAYS) / WAITING_CAP_DAYS, rawLabel: `${days}` },
      { key: 'history', weight: ADOPTION_WEIGHTS.history, value: matches, rawLabel: fav ?? '-' },
    ];
    const reasons: Reason[] = [];
    if (holder && ratio >= TIGHT_RATIO) reasons.push({ code: 'crowded_holder', params: { current: holder.currentCount, total: holder.capacityTotal } });
    if (days >= 30) reasons.push({ code: 'long_wait', params: { days } });
    if (matches) reasons.push({ code: 'matches_history', params: { species: l.species } });
    items.push({ id: l.id, score: factors.reduce((s, f) => s + f.weight * f.value, 0), factors, reasons });
  }
  items.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return { items, excluded: emptyExcluded() };
}

// ---------------------------------------------------------------------------
// 4) rankUrgentCases — เคสเร่งด่วนบนแดชบอร์ด (ไม่รวมสถานสงเคราะห์จริงเด็ดขาด)
// ---------------------------------------------------------------------------

export interface UrgentInput {
  listings: readonly PetListing[];
  helpers: ReadonlyMap<string, HelperProfile>;
  supplies: ReadonlyMap<string, HelperSupplies>;
  orders: readonly DonationOrder[];
  packages: ReadonlyMap<string, DonationPackage>;
  now: Date;
  limit?: number;
}

export function rankUrgentCases(input: UrgentInput): UrgentCase[] {
  const limit = input.limit ?? 5;
  const heldByRealOrg = (l: PetListing) => {
    const h = l.careHolderId ? input.helpers.get(l.careHolderId) : undefined;
    return !!h && h.kind === 'shelter';
  };
  const foundOpen = input.listings.filter((l) => l.type === 'found' && l.status === 'open' && !heldByRealOrg(l));
  const byNewest = (a: PetListing, b: PetListing) => b.eventAt.localeCompare(a.eventAt) || a.id.localeCompare(b.id);

  const emergency = foundOpen.filter((l) => l.urgency === 'emergency').sort(byNewest)
    .map<UrgentCase>((l) => ({ kind: 'listing', listingId: l.id, urgency: 'emergency', reasons: [] }));

  const critical: Array<{ id: string; days: number; reasons: Reason[] }> = [];
  for (const h of input.helpers.values()) {
    if (h.kind !== 'individual' || !h.acceptsSupplyPackages) continue;
    const base = input.supplies.get(h.id);
    if (!base) continue;
    const eff = effectiveSupplies(base, h.id, input.orders, input.packages, input.now);
    if (supplyLevel(eff.foodDays, eff.litterDays) !== 'critical') continue;
    critical.push({ id: h.id, days: Math.min(eff.foodDays, eff.litterDays ?? eff.foodDays), reasons: supplyReasons(eff.foodDays, eff.litterDays) });
  }
  critical.sort((a, b) => a.days - b.days || a.id.localeCompare(b.id));
  const supplies = critical.map<UrgentCase>((c) => ({ kind: 'supplies', helperId: c.id, level: 'critical', reasons: c.reasons }));

  const soon = foundOpen.filter((l) => l.urgency === 'soon').sort(byNewest)
    .map<UrgentCase>((l) => ({ kind: 'listing', listingId: l.id, urgency: 'soon', reasons: [] }));

  return [...emergency, ...supplies, ...soon].slice(0, limit);
}
