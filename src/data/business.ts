import { ADOPTERS } from './adopters';
import { DEMO_FOUNDATIONS, FOUNDATION_SUPPLIES } from './demo-foundations';
import { SUPPLIES } from './supplies';
import type { LocalizedText } from '@/lib/types';

export const DONATION_TARGETS = [...DEMO_FOUNDATIONS, ...ADOPTERS];
export const DONATION_SUPPLY_MAP = new Map([...SUPPLIES, ...FOUNDATION_SUPPLIES].map((s) => [s.helperId, s]));
export const AD_PLANS = [
  { id: 'home-week', placement: 'home' as const, days: 7, feeTHB: 700 },
  { id: 'dashboard-week', placement: 'dashboard' as const, days: 7, feeTHB: 500 },
  { id: 'home-month', placement: 'home' as const, days: 30, feeTHB: 2400 },
];
export const CSR_CAMPAIGNS: { id: string; helperId: string; packageId: string; goalPackages: number; promotionFeeTHB: number; title: LocalizedText }[] = [
  { id: 'csr-warm-home', helperId: 'foundation-demo-001', packageId: 'pkg-dog-food-7d', goalPackages: 10, promotionFeeTHB: 1000, title: { th: 'เติมมื้ออุ่นให้บ้านอุ่นใจ', en: 'Warm meals for Warm Home' } },
  { id: 'csr-gentle-paws', helperId: 'foundation-demo-002', packageId: 'pkg-cat-food-7d', goalPackages: 10, promotionFeeTHB: 1000, title: { th: 'ไม่ให้น้องแมวขาดมื้อ', en: 'A meal for every cat' } },
  { id: 'csr-four-paws', helperId: 'foundation-demo-003', packageId: 'pkg-dog-food-7d', goalPackages: 12, promotionFeeTHB: 1200, title: { th: 'ช่วยเพื่อนสี่ขาที่บ้านเต็ม', en: 'Support a full home for four paws' } },
];
