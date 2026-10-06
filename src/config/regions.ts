import { DISTRICTS, BANGKOK_BOUNDS } from '@/data/districts';

/** ตั้งค่าตามพื้นที่ (PROMPT.md 7.17) — มีเฉพาะกรุงเทพฯ ที่ใช้งานจริงในเดโม ที่เหลือเป็นแผน (roadmap) เท่านั้น */
export interface RegionConfig {
  id: string;
  name: { th: string; en: string };
  status: 'active' | 'planned';
  currency?: string;
  locales?: readonly string[];
  bounds?: typeof BANGKOK_BOUNDS;
  districtCount?: number;
}

export const REGIONS: readonly RegionConfig[] = [
  { id: 'bangkok', name: { th: 'กรุงเทพมหานคร', en: 'Bangkok' }, status: 'active', currency: 'THB', locales: ['th', 'en'], bounds: BANGKOK_BOUNDS, districtCount: DISTRICTS.length },
  { id: 'thailand', name: { th: 'ทั่วประเทศไทย', en: 'All of Thailand' }, status: 'planned' },
  { id: 'asean', name: { th: 'อาเซียน', en: 'ASEAN' }, status: 'planned' },
];
