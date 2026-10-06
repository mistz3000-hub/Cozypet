import type { Availability, CareMode, CurrentPet, HelperProfile, HomeInfo, Species } from '@/lib/types';
import { ADOPTER_SOURCE } from './adopters.generated';
import { personaImagesFor } from './persona-images';

/**
 * ผู้รับดูแลรายบุคคล 100 ราย (บุคคลสมมติ) — ถอดจาก CODEX_IMAGE_PROMPTS.md หัวข้อ 5
 * acceptsSupplyPackages คำนวณครั้งเดียวตามกฎ PROMPT.md 10.4 ข้อ 10
 */
function toProfile(src: (typeof ADOPTER_SOURCE)[number]): HelperProfile {
  const careModes = src.careModes as CareMode[];
  const availability = src.availability as Availability;
  const speciesAccepted = src.speciesAccepted as Species[];
  const currentPets = src.currentPets as CurrentPet[];
  const home = src.home as HomeInfo;
  const particle = src.politeParticle === 'ครับ' ? 'ครับ' : 'ค่ะ';
  const conditions: string[] = [];
  if (careModes.includes('foster')) conditions.push('อุปถัมภ์ชั่วคราวระหว่างรอเจ้าของหรือรอบ้าน');
  if (careModes.includes('adopt')) conditions.push('รับเลี้ยงถาวรเฉพาะน้องที่ผ่านขั้นตามหาเจ้าของแล้ว');
  conditions.push('นัดคุยและดูความพร้อมก่อนรับน้อง (ตัวอย่าง)');
  return {
    id: src.id,
    kind: 'individual',
    displayName: src.displayName,
    districtId: src.districtId,
    location: src.location,
    speciesAccepted,
    careModes,
    capacityTotal: src.capacityTotal,
    currentCount: src.currentCount,
    availability,
    acceptsEmergency: src.acceptsEmergency,
    hours: src.hours,
    conditions,
    description: `${src.occupation} · ${home.summary}`,
    images: personaImagesFor(src.id, src.displayName, src.districtId, home.type, currentPets),
    age: src.age,
    sex: src.sex,
    occupation: src.occupation,
    home,
    currentPets,
    preferences: src.preferences,
    demoVerified: false,
    donationsEnabled: false,
    acceptsSupplyPackages: availability !== 'unavailable' && src.currentCount > 0,
    persona: {
      speakerLabel: 'ผู้รับดูแลรายบุคคล',
      politeParticle: particle,
      tone: 'อบอุ่น เป็นกันเอง ตอบสั้นและตรงไปตรงมา',
      facts: [
        `อาชีพ/ไลฟ์สไตล์: ${src.occupation}`,
        `ที่พัก: ${home.summary}`,
        currentPets.length
          ? `น้องที่ดูแลอยู่: ${currentPets.map((p) => `${p.name} (${p.breed} สี${p.color} ${p.ageYears} ปี)`).join(', ')}`
          : 'ตอนนี้ยังไม่มีน้องในความดูแล',
        `สนใจเป็นพิเศษ: สี ${src.preferences.colors.join('/')} · พันธุ์ ${src.preferences.breeds.join('/')} — ${src.preferences.reason}`,
        `เวลาติดต่อ (ตัวอย่าง): ${src.hours}`,
      ],
    },
    isDemo: true,
  };
}

export const ADOPTERS: readonly HelperProfile[] = ADOPTER_SOURCE.map(toProfile);
