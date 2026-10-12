import type { HelperProfile, HelperSupplies } from '@/lib/types';
import { GENERATED_MEDIA } from './generated-media';

/** Separate from the 20 real/placeholder shelter slots; invented for business demonstrations. */
const seeds = [
  { id: 'foundation-demo-001', th: 'มูลนิธิบ้านอุ่นใจ (สมมติ)', en: 'Warm Home Foundation (fictional)', district: 'din-daeng', lat: 13.770, lng: 100.552, count: 95, capacity: 100, food: 1, litter: 2, species: ['cat', 'dog'] as const },
  { id: 'foundation-demo-002', th: 'มูลนิธิอุ้งเท้าพักใจ (สมมติ)', en: 'Gentle Paws Foundation (fictional)', district: 'chatuchak', lat: 13.827, lng: 100.560, count: 48, capacity: 60, food: 2, litter: 3, species: ['cat'] as const },
  { id: 'foundation-demo-003', th: 'มูลนิธิเพื่อนสี่ขา (สมมติ)', en: 'Four Paws Foundation (fictional)', district: 'bang-kapi', lat: 13.766, lng: 100.648, count: 40, capacity: 40, food: 1, litter: undefined, species: ['dog'] as const },
];
export const DEMO_FOUNDATIONS: readonly HelperProfile[] = seeds.map((s, i) => ({
  id: s.id, kind: 'shelter', displayName: s.th, displayNameEn: s.en,
  districtId: s.district, location: { lat: s.lat, lng: s.lng }, speciesAccepted: [...s.species],
  capacityTotal: s.capacity, currentCount: s.count, careModes: ['foster', 'adopt'], availability: 'available',
  acceptsEmergency: false, hours: '09:00–17:00', conditions: [], description: 'องค์กรสมมติสำหรับสาธิตการส่งอาหารและแคมเปญ CSR',
  images: { profile: GENERATED_MEDIA[`shelters:shelter-00${i + 1}`], place: [GENERATED_MEDIA[`shelters:shelter-00${i + 1}`]] },
  isFictionalFoundation: true, isRealOrganization: false, demoVerified: false, donationsEnabled: true, acceptsSupplyPackages: true,
  persona: { speakerLabel: s.th, politeParticle: 'ค่ะ', tone: 'demo', facts: ['องค์กรสมมติ ไม่มีการรับเงินหรือส่งของจริง'] }, isDemo: true,
}));
export const FOUNDATION_SUPPLIES: readonly HelperSupplies[] = seeds.map((s) => ({
  helperId: s.id, foodDays: s.food, litterDays: s.litter, recentPackages30d: 0, updatedAt: '2026-10-12T00:00:00.000Z',
}));
