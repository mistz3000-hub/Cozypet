import type { PartnerBrand } from '@/lib/types';

/** แบรนด์พันธมิตรสมมติ (ไม่ใช่แบรนด์จริง) — PROMPT.md D14 */
export const BRANDS: readonly PartnerBrand[] = [
  { id: 'brand-a', name: { th: 'พันธมิตร A (แบรนด์สมมติ)', en: 'Partner A (fictional brand)' }, isFictional: true },
  { id: 'brand-b', name: { th: 'พันธมิตร B (แบรนด์สมมติ)', en: 'Partner B (fictional brand)' }, isFictional: true },
  { id: 'brand-c', name: { th: 'พันธมิตร C (แบรนด์สมมติ)', en: 'Partner C (fictional brand)' }, isFictional: true },
];
