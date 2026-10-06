import type { CaretakerPlace, HelperProfile, HelperSupplies } from '@/lib/types';

export type DisplayHelper = HelperProfile & { isUserPlace?: boolean };

/** แปลงสถานที่ของฉัน (ทดลอง) เป็นรูปแบบเดียวกับผู้ช่วยดูแล เพื่อแสดงผลบนแผนที่/การ์ด (เห็นเฉพาะเจ้าของ) */
export function placeToHelper(p: CaretakerPlace): DisplayHelper {
  return {
    id: p.id, kind: 'individual', displayName: p.displayName, districtId: p.districtId, location: p.location,
    speciesAccepted: p.speciesAccepted, careModes: p.careModes, capacityTotal: p.capacityTotal, currentCount: p.currentCount,
    availability: 'available', acceptsEmergency: p.acceptsEmergency, hours: '', conditions: [], description: '', images: {},
    demoVerified: false, donationsEnabled: false, acceptsSupplyPackages: false,
    persona: { speakerLabel: '', politeParticle: 'ค่ะ', tone: '', facts: [] }, isDemo: true, isUserPlace: true,
  };
}

export function placeSupplies(p: CaretakerPlace): HelperSupplies {
  return { helperId: p.id, foodDays: p.foodDays, litterDays: p.litterDays, recentPackages30d: 0, updatedAt: p.updatedAt };
}
