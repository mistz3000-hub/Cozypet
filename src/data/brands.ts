import type { PartnerBrand } from '@/lib/types';

/** แบรนด์พันธมิตรสมมติ (ไม่ใช่แบรนด์จริง) — PROMPT.md D14 */
export const BRANDS: readonly PartnerBrand[] = [
  { id: 'brand-a', name: { th: 'พันธมิตร A', en: 'Partner A' }, isFictional: true },
  { id: 'brand-b', name: { th: 'พันธมิตร B', en: 'Partner B' }, isFictional: true },
  { id: 'brand-c', name: { th: 'พันธมิตร C', en: 'Partner C' }, isFictional: true },
];
