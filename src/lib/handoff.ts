/**
 * เงื่อนไข “ยืนยันส่งต่อน้อง (จำลอง)” — แอปคำนวณจาก record ไม่ใช่ AI ตัดสิน (PROMPT.md 7.6)
 */
import type { HelperProfile, Species } from './types';
import { availableSlots } from './capacity';

export type HandoffBlock = 'full' | 'species' | 'unavailable';
export type HandoffMode = 'intake' | 'foster' | 'adopt';

export function handoffModeFor(h: Pick<HelperProfile, 'kind' | 'careModes'>): HandoffMode {
  if (h.kind === 'shelter') return 'intake';
  return h.careModes.includes('foster') ? 'foster' : 'adopt';
}

export function handoffBlock(h: Pick<HelperProfile, 'capacityTotal' | 'currentCount' | 'speciesAccepted' | 'availability'>, species: Species | null): HandoffBlock | null {
  if (h.availability === 'unavailable') return 'unavailable';
  if (availableSlots(h) <= 0) return 'full';
  if (species && !h.speciesAccepted.includes(species)) return 'species';
  return null;
}

/** ต้องติ๊กยืนยันว่ารอเจ้าของมาแล้ว (ผู้รับดูแลที่มีเฉพาะโหมด adopt) */
export function handoffNeedsWaitConfirm(h: Pick<HelperProfile, 'kind' | 'careModes'>): boolean {
  return handoffModeFor(h) === 'adopt';
}
