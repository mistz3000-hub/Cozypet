/**
 * การจำลองสถานการณ์ 30 วัน (PROMPT.md 11.7) — “การจำลองด้วยข้อมูลสมมติ เพื่ออธิบายหลักการ ไม่ใช่ผลจริง”
 * สถานที่สมมติ sim-a … sim-t อยู่ในพิกัดนามธรรม (รอบจุด 0,0) ไม่มีชื่อหรือพิกัดขององค์กรจริง
 * นโยบาย B ใช้ rankHelpers() ของ Smart Load Balancer ตัวเดียวกับแอป
 */
import type { GeoPoint, Species, Urgency } from './types';
import { rankHelpers, type BalancerCandidate } from './balancer';
import { rngFromKey } from './seeded-random';
import { distanceKm, offsetPoint } from './geo';

export type SimScenario = 'normal' | 'rainy' | 'big_full';
export const SIM_SCENARIOS: readonly SimScenario[] = ['normal', 'rainy', 'big_full'];
export const SIM_LAMBDAS = [8, 12, 16] as const;
export const SIM_DEFAULT = { scenario: 'normal' as SimScenario, lambda: 12, days: 30 };
const MAX_CALLS = 5;
const ADOPT_PER_DAY = 0.03;

export interface SimPlace {
  id: string;
  label: string; // 'A'…'T'
  size: 'large' | 'medium' | 'individual';
  capacity: number;
  start: number;
  speciesAccepted: Species[];
  acceptsEmergency: boolean;
  location: GeoPoint;
}

const ORIGIN: GeoPoint = { lat: 0, lng: 0 };
const LETTERS = 'abcdefghijklmnopqrst'.split('');

export function buildSimPlaces(scenario: SimScenario): SimPlace[] {
  const rng = rngFromKey(`cozypet:v1:sim-places:${scenario}`);
  const places: SimPlace[] = [];
  const pos = () => offsetPoint(offsetPoint(ORIGIN, 90, rng() * 20_000), 0, rng() * 20_000);
  const big = [80, 60, 50];
  big.forEach((cap) => {
    const ratio = scenario === 'big_full' ? 0.98 + rng() * 0.02 : 0.85 + rng() * 0.1;
    places.push({ id: '', label: '', size: 'large', capacity: cap, start: Math.min(cap, Math.round(cap * ratio)), speciesAccepted: ['cat', 'dog'], acceptsEmergency: true, location: pos() });
  });
  for (let i = 0; i < 5; i++) {
    const cap = 15 + Math.floor(rng() * 11);
    places.push({ id: '', label: '', size: 'medium', capacity: cap, start: Math.round(cap * (0.3 + rng() * 0.4)), speciesAccepted: ['cat', 'dog'], acceptsEmergency: i % 2 === 0, location: pos() });
  }
  for (let i = 0; i < 12; i++) {
    const cap = 2 + Math.floor(rng() * 5);
    places.push({ id: '', label: '', size: 'individual', capacity: cap, start: Math.round(cap * (0.3 + rng() * 0.4)), speciesAccepted: i % 2 === 0 ? ['cat', 'dog'] : ['cat'], acceptsEmergency: i % 3 === 0, location: pos() });
  }
  return places.map((p, i) => ({ ...p, id: `sim-${LETTERS[i]}`, label: LETTERS[i].toUpperCase() }));
}

export interface Arrival { species: Species; urgency: Urgency; location: GeoPoint }

function poisson(rng: () => number, lambda: number): number {
  const l = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k += 1;
    p *= rng();
  } while (p > l);
  return k - 1;
}

export function buildArrivals(scenario: SimScenario, lambda: number, days: number): Arrival[][] {
  const rng = rngFromKey(`cozypet:v1:sim-arrivals:${scenario}:${lambda}`);
  const effLambda = scenario === 'rainy' ? lambda * 1.35 : lambda;
  const emergencyP = scenario === 'rainy' ? 0.15 : 0.1;
  const out: Arrival[][] = [];
  for (let d = 0; d < days; d++) {
    const n = poisson(rng, effLambda);
    const today: Arrival[] = [];
    for (let i = 0; i < n; i++) {
      const species: Species = rng() < 0.65 ? 'cat' : 'dog';
      const u = rng();
      const urgency: Urgency = u < emergencyP ? 'emergency' : u < emergencyP + 0.2 ? 'soon' : 'normal';
      const location = offsetPoint(offsetPoint(ORIGIN, 90, rng() * 20_000), 0, rng() * 20_000);
      today.push({ species, urgency, location });
    }
    out.push(today);
  }
  return out;
}

export interface DayStat {
  day: number;
  maxRatio: number;
  spread: number; // p90 − p10 ของสัดส่วนความแออัด
  calls: number;
  unplaced: number;
  placed: number;
  distanceSum: number;
  over95: number; // จำนวนสถานที่ที่แออัด ≥ 95% ในวันนั้น
}

export interface PolicyResult {
  days: DayStat[];
  finalRatios: { id: string; label: string; ratio: number }[];
  totals: { calls: number; arrivals: number; unplaced: number; avgCallsPerPet: number; avgDistanceKm: number; peakRatio: number; avgSpread: number; placeDaysOver95: number };
}

export interface SimulationResult {
  scenario: SimScenario;
  lambda: number;
  places: SimPlace[];
  a: PolicyResult;
  b: PolicyResult;
  /** {sim} = round((callsA − callsB) / callsA × 100) */
  reductionPct: number;
}

function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.round(p * (sorted.length - 1))));
  return sorted[idx];
}

function canTake(place: SimPlace, count: number, a: Arrival): boolean {
  if (!place.speciesAccepted.includes(a.species)) return false;
  if (count >= place.capacity) return false;
  if (a.urgency === 'emergency' && !place.acceptsEmergency) return false;
  return true;
}

function runPolicy(policy: 'a' | 'b', places: SimPlace[], arrivals: Arrival[][], scenario: SimScenario, lambda: number): PolicyResult {
  const counts = new Map(places.map((p) => [p.id, p.start]));
  const rng = rngFromKey(`cozypet:v1:sim-adopt:${scenario}:${lambda}:${policy}`);
  const bySize = [...places].sort((x, y) => y.capacity - x.capacity || x.id.localeCompare(y.id));
  const famous = bySize.filter((p) => p.size === 'large');
  const days: DayStat[] = [];

  arrivals.forEach((today, dayIdx) => {
    // น้องได้บ้าน 3% ต่อวันต่อตัว
    for (const p of places) {
      let c = counts.get(p.id)!;
      let leave = 0;
      for (let i = 0; i < c; i++) if (rng() < ADOPT_PER_DAY) leave += 1;
      c -= leave;
      counts.set(p.id, c);
    }
    let calls = 0;
    let unplaced = 0;
    let placed = 0;
    let distanceSum = 0;
    for (const a of today) {
      let order: SimPlace[];
      if (policy === 'a') {
        const rest = places.filter((p) => p.size !== 'large').sort((x, y) => distanceKm(a.location, x.location) - distanceKm(a.location, y.location) || x.id.localeCompare(y.id));
        order = [...famous, ...rest];
      } else {
        const candidates: BalancerCandidate[] = places.map((p) => ({
          id: p.id, kind: p.size === 'individual' ? 'individual' : 'shelter', speciesAccepted: p.speciesAccepted, careModes: ['foster'],
          capacityTotal: p.capacity, currentCount: counts.get(p.id)!, availability: 'available', acceptsEmergency: p.acceptsEmergency, location: p.location,
        }));
        const ranked = rankHelpers({ candidates, species: a.species, urgency: a.urgency, searchPoint: a.location, radiusKm: null }).items;
        const byId = new Map(places.map((p) => [p.id, p]));
        order = ranked.map((r) => byId.get(r.id)!);
      }
      let done = false;
      for (const p of order.slice(0, MAX_CALLS)) {
        calls += 1;
        const c = counts.get(p.id)!;
        if (canTake(p, c, a)) {
          counts.set(p.id, c + 1);
          placed += 1;
          distanceSum += distanceKm(a.location, p.location);
          done = true;
          break;
        }
      }
      if (!done) unplaced += 1;
    }
    const ratios = places.map((p) => counts.get(p.id)! / p.capacity).sort((x, y) => x - y);
    days.push({
      day: dayIdx + 1,
      maxRatio: ratios[ratios.length - 1],
      spread: percentile(ratios, 0.9) - percentile(ratios, 0.1),
      calls,
      unplaced,
      placed,
      distanceSum,
      over95: ratios.filter((r) => r >= 0.95).length,
    });
  });

  const totalCalls = days.reduce((s, d) => s + d.calls, 0);
  const totalArrivals = arrivals.reduce((s, d) => s + d.length, 0);
  const totalPlaced = days.reduce((s, d) => s + d.placed, 0);
  return {
    days,
    finalRatios: places.map((p) => ({ id: p.id, label: p.label, ratio: counts.get(p.id)! / p.capacity })),
    totals: {
      calls: totalCalls,
      arrivals: totalArrivals,
      unplaced: days.reduce((s, d) => s + d.unplaced, 0),
      avgCallsPerPet: totalArrivals ? totalCalls / totalArrivals : 0,
      avgDistanceKm: totalPlaced ? days.reduce((s, d) => s + d.distanceSum, 0) / totalPlaced : 0,
      peakRatio: Math.max(...days.map((d) => d.maxRatio)),
      avgSpread: days.reduce((s, d) => s + d.spread, 0) / Math.max(1, days.length),
      placeDaysOver95: days.reduce((s, d) => s + d.over95, 0),
    },
  };
}

export function runSimulation(scenario: SimScenario = SIM_DEFAULT.scenario, lambda: number = SIM_DEFAULT.lambda, days = SIM_DEFAULT.days): SimulationResult {
  const places = buildSimPlaces(scenario);
  const arrivals = buildArrivals(scenario, lambda, days);
  const a = runPolicy('a', places, arrivals, scenario, lambda);
  const b = runPolicy('b', places, arrivals, scenario, lambda);
  const reductionPct = a.totals.calls > 0 ? Math.round(((a.totals.calls - b.totals.calls) / a.totals.calls) * 100) : 0;
  return { scenario, lambda, places, a, b, reductionPct };
}
