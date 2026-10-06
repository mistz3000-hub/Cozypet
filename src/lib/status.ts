import type { HelperProfile, Reason, StatusLevel, SupplyLevel } from './types';
import { availableSlots, occupancyRatio } from './capacity';
import { SUPPLY_CRITICAL_DAYS, SUPPLY_LOW_DAYS, TIGHT_RATIO } from './balancer-config';

export interface StatusInfo {
  level: StatusLevel;
  /** availability === 'unavailable' → ป้าย “ปิดรับชั่วคราว” */
  closed: boolean;
}

type CapacityLike = Pick<HelperProfile, 'capacityTotal' | 'currentCount'> & { availability?: HelperProfile['availability'] };

/** ระดับสถานะ (PROMPT.md 11.6) ใช้กับทุก record ได้ องค์กรจริงแสดงพร้อมป้ายข้อมูลสาธิต */
export function statusInfo(h: CapacityLike): StatusInfo {
  if (h.availability === 'unavailable') return { level: 'full', closed: true };
  if (availableSlots(h) === 0) return { level: 'full', closed: false };
  if (occupancyRatio(h) >= TIGHT_RATIO) return { level: 'tight', closed: false };
  return { level: 'open', closed: false };
}

export function statusLevel(h: CapacityLike): StatusLevel {
  return statusInfo(h).level;
}

export function supplyLevel(foodDays: number, litterDays?: number): SupplyLevel {
  const min = Math.min(foodDays, litterDays ?? foodDays);
  if (min < SUPPLY_CRITICAL_DAYS) return 'critical';
  if (min < SUPPLY_LOW_DAYS) return 'low';
  return 'ok';
}

export function supplyReasons(foodDays: number, litterDays?: number): Reason[] {
  const out: Reason[] = [];
  if (foodDays < SUPPLY_CRITICAL_DAYS) out.push({ code: 'food_critical', params: { days: foodDays } });
  else if (foodDays < SUPPLY_LOW_DAYS) out.push({ code: 'food_low', params: { days: foodDays } });
  if (litterDays !== undefined && litterDays < SUPPLY_LOW_DAYS) out.push({ code: 'litter_low', params: { days: litterDays } });
  return out;
}
