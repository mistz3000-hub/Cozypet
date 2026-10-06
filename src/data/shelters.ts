import type { HelperProfile, Species } from '@/lib/types';

/**
 * สถานสงเคราะห์ 20 ช่อง (PROMPT.md D10, CODEX_IMAGE_PROMPTS.md หัวข้อ 6)
 *
 * - ช่องที่มี `verification` คือองค์กรจริงในกรุงเทพฯ ที่ยืนยันชื่อ/เขต/ชนิดสัตว์ได้จากผลค้นหาเว็บ (6 ต.ค. 2026)
 *   แต่ session นี้เปิดหน้าเว็บทางการไม่ได้ (egress ถูกบล็อก) ทีมต้องตรวจซ้ำกับช่องทางทางการก่อนนำเสนอ
 * - ช่องที่ `isPlaceholder: true` ยังหาองค์กรจริงไม่ได้ **ห้ามแต่งองค์กรเติม** — แสดงเป็น “ช่องที่รอทีมเติมข้อมูล”
 *   พร้อมตำแหน่งและตัวเลขสาธิต เพื่อให้ flow ทดสอบได้ครบ
 * - ความจุ บริจาค ฉุกเฉิน Verified ทุกช่องเป็น **ค่าสาธิต** จากตารางใน CODEX_IMAGE_PROMPTS.md (ไม่ใช่ข้อมูลจริงขององค์กร)
 *   fixture: 001 = 95/100 เปิดรับบริจาค · 002 = 37/40 · 007 เต็ม (เป็นช่องรอข้อมูล ไม่ให้องค์กรจริงอยู่ในสถานะเต็ม)
 * - ไม่มีภาพจากช่องทางทางการใน repo ยัง (ใช้ placeholder อุ้งเท้า + ชื่อองค์กร ตาม PROMPT.md 15)
 */

interface ShelterSlot {
  id: string;
  districtId: string;
  location: { lat: number; lng: number };
  capacityTotal: number;
  currentCount: number;
  donationsEnabled: boolean;
  acceptsEmergency: boolean;
  demoVerified: boolean;
  real?: {
    displayName: string;
    displayNameEn?: string;
    officialUrl?: string;
    speciesAccepted: Species[];
    summary: string;
    verification: string;
  };
}

const SEARCH_NOTE = 'ยืนยันจากผลค้นหาเว็บ 6 ต.ค. 2026 — รอทีมตรวจกับช่องทางทางการ';

const SLOTS: ShelterSlot[] = [
  {
    id: 'shelter-001', districtId: 'chatuchak', location: { lat: 13.83058, lng: 100.55138 },
    capacityTotal: 100, currentCount: 95, donationsEnabled: true, acceptsEmergency: true, demoVerified: true,
    real: {
      displayName: 'มูลนิธิเพื่อสุนัขในซอย (Soi Dog Foundation) — คลินิกกรุงเทพฯ',
      displayNameEn: 'Soi Dog Foundation — Bangkok clinic',
      officialUrl: 'https://www.soidog.org',
      speciesAccepted: ['dog', 'cat'],
      summary: 'มูลนิธิช่วยเหลือสุนัขและแมวจรจัด คลินิกในกรุงเทพฯ ทำหมัน ฉีดวัคซีน และดูแลสัตว์บาดเจ็บ',
      verification: SEARCH_NOTE,
    },
  },
  {
    id: 'shelter-002', districtId: 'phra-khanong', location: { lat: 13.70112, lng: 100.59636 },
    capacityTotal: 40, currentCount: 37, donationsEnabled: true, acceptsEmergency: false, demoVerified: true,
    real: {
      displayName: 'PAWS Bangkok',
      displayNameEn: 'PAWS Bangkok',
      officialUrl: 'https://www.pawsbangkok.org',
      speciesAccepted: ['cat'],
      summary: 'องค์กรช่วยเหลือแมวจรในกรุงเทพฯ ศูนย์พักพิงรับเฉพาะแมว พร้อมโครงการทำหมันและหาบ้าน',
      verification: SEARCH_NOTE,
    },
  },
  {
    id: 'shelter-003', districtId: 'bang-kho-laem', location: { lat: 13.69229, lng: 100.50058 },
    capacityTotal: 50, currentCount: 44, donationsEnabled: true, acceptsEmergency: false, demoVerified: true,
    real: {
      displayName: 'Catsanova',
      displayNameEn: 'Catsanova',
      speciesAccepted: ['cat'],
      summary: 'คาเฟ่แมวไม่แสวงกำไรที่ช่วยหาบ้านถาวรให้แมวที่ถูกทิ้งและแมวจร',
      verification: `${SEARCH_NOTE} (ยังไม่พบลิงก์ทางการ)`,
    },
  },
  {
    id: 'shelter-004', districtId: 'khlong-toei', location: { lat: 13.71128, lng: 100.5831 },
    capacityTotal: 150, currentCount: 138, donationsEnabled: true, acceptsEmergency: true, demoVerified: true,
    real: {
      displayName: 'The Voice Foundation',
      displayNameEn: 'The Voice Foundation',
      speciesAccepted: ['dog', 'cat'],
      summary: 'มูลนิธิช่วยเหลือสัตว์ถูกทิ้งและบาดเจ็บ ให้ที่พักพิง หาบ้าน และรณรงค์การเลี้ยงอย่างรับผิดชอบ',
      verification: `${SEARCH_NOTE} (ยังไม่พบลิงก์ทางการ)`,
    },
  },
  {
    id: 'shelter-005', districtId: 'prawet', location: { lat: 13.71362, lng: 100.69785 },
    capacityTotal: 35, currentCount: 29, donationsEnabled: false, acceptsEmergency: false, demoVerified: true,
    real: {
      displayName: 'ศูนย์ควบคุมสุนัขกรุงเทพมหานคร (ประเวศ)',
      officialUrl: 'https://www.bangkok.go.th',
      speciesAccepted: ['dog', 'cat'],
      summary: 'ศูนย์ของกรุงเทพมหานครที่รับสุนัขและแมวเข้าพักดูแลชั่วคราว ตรวจสุขภาพ และส่งต่อให้ผู้รับเลี้ยง',
      verification: SEARCH_NOTE,
    },
  },
  { id: 'shelter-006', districtId: 'bang-khen', location: { lat: 13.88126, lng: 100.5916 }, capacityTotal: 80, currentCount: 71, donationsEnabled: true, acceptsEmergency: true, demoVerified: false },
  { id: 'shelter-007', districtId: 'bang-khae', location: { lat: 13.70488, lng: 100.40558 }, capacityTotal: 30, currentCount: 30, donationsEnabled: true, acceptsEmergency: false, demoVerified: true },
  { id: 'shelter-008', districtId: 'min-buri', location: { lat: 13.80625, lng: 100.73932 }, capacityTotal: 70, currentCount: 58, donationsEnabled: true, acceptsEmergency: true, demoVerified: true },
  { id: 'shelter-009', districtId: 'thon-buri', location: { lat: 13.72852, lng: 100.48357 }, capacityTotal: 45, currentCount: 38, donationsEnabled: false, acceptsEmergency: false, demoVerified: true },
  { id: 'shelter-010', districtId: 'bang-sue', location: { lat: 13.81169, lng: 100.52507 }, capacityTotal: 40, currentCount: 33, donationsEnabled: true, acceptsEmergency: false, demoVerified: true },
  { id: 'shelter-011', districtId: 'lat-krabang', location: { lat: 13.72016, lng: 100.76012 }, capacityTotal: 90, currentCount: 76, donationsEnabled: true, acceptsEmergency: true, demoVerified: true },
  { id: 'shelter-012', districtId: 'dusit', location: { lat: 13.76932, lng: 100.50996 }, capacityTotal: 45, currentCount: 40, donationsEnabled: false, acceptsEmergency: false, demoVerified: false },
  { id: 'shelter-013', districtId: 'huai-khwang', location: { lat: 13.7755, lng: 100.57443 }, capacityTotal: 40, currentCount: 31, donationsEnabled: true, acceptsEmergency: false, demoVerified: true },
  { id: 'shelter-014', districtId: 'sathon', location: { lat: 13.70899, lng: 100.52211 }, capacityTotal: 25, currentCount: 22, donationsEnabled: true, acceptsEmergency: false, demoVerified: true },
  { id: 'shelter-015', districtId: 'bang-na', location: { lat: 13.68568, lng: 100.60036 }, capacityTotal: 60, currentCount: 52, donationsEnabled: true, acceptsEmergency: true, demoVerified: true },
  { id: 'shelter-016', districtId: 'taling-chan', location: { lat: 13.76846, lng: 100.44761 }, capacityTotal: 50, currentCount: 43, donationsEnabled: false, acceptsEmergency: false, demoVerified: true },
  { id: 'shelter-017', districtId: 'sai-mai', location: { lat: 13.92999, lng: 100.6526 }, capacityTotal: 55, currentCount: 47, donationsEnabled: true, acceptsEmergency: true, demoVerified: true },
  { id: 'shelter-018', districtId: 'rat-burana', location: { lat: 13.68641, lng: 100.49859 }, capacityTotal: 35, currentCount: 30, donationsEnabled: true, acceptsEmergency: false, demoVerified: true },
  { id: 'shelter-019', districtId: 'nong-khaem', location: { lat: 13.69661, lng: 100.3537 }, capacityTotal: 30, currentCount: 24, donationsEnabled: false, acceptsEmergency: false, demoVerified: false },
  { id: 'shelter-020', districtId: 'bueng-kum', location: { lat: 13.77906, lng: 100.6649 }, capacityTotal: 65, currentCount: 55, donationsEnabled: true, acceptsEmergency: false, demoVerified: true },
];

function slotNumber(id: string) {
  return id.slice(-3);
}

function toProfile(slot: ShelterSlot): HelperProfile {
  const real = slot.real;
  const species: Species[] = real?.speciesAccepted ?? ['dog', 'cat'];
  const displayName = real ? real.displayName : `ช่องสถานสงเคราะห์ ${slotNumber(slot.id)} (รอข้อมูลองค์กรจริง)`;
  return {
    id: slot.id,
    kind: 'shelter',
    displayName,
    displayNameEn: real?.displayNameEn ?? (real ? undefined : `Shelter slot ${slotNumber(slot.id)} (awaiting real organisation)`),
    districtId: slot.districtId,
    location: slot.location,
    speciesAccepted: species,
    careModes: ['foster', 'adopt'],
    capacityTotal: slot.capacityTotal,
    currentCount: slot.currentCount,
    availability: 'available',
    acceptsEmergency: slot.acceptsEmergency,
    hours: 'ทุกวัน 09:00–17:00 (ตัวอย่าง)',
    conditions: ['ขอประวัติการพบน้องคร่าว ๆ ก่อนรับเข้า (ตัวอย่าง)', 'ติดต่อผ่านช่องทางทางการขององค์กรก่อนพาน้องไปจริง'],
    description: real
      ? `${real.summary} · ตัวเลขความจุ สถานะบริจาค และป้าย Verified ใน Cozypet เป็นข้อมูลสาธิต`
      : 'ช่องนี้รอทีมเติมชื่อ ที่ตั้ง และลิงก์ทางการขององค์กรจริง ตำแหน่งและตัวเลขทั้งหมดเป็นข้อมูลสาธิตสำหรับทดสอบ flow',
    images: {},
    isRealOrganization: true,
    isPlaceholder: !real,
    verification: real?.verification,
    officialUrl: real?.officialUrl,
    demoVerified: slot.demoVerified,
    donationsEnabled: slot.donationsEnabled,
    donationNote: slot.donationsEnabled ? 'ต้องการอาหารสัตว์และทรายแมว (ข้อความตัวอย่าง)' : undefined,
    acceptsSupplyPackages: false,
    persona: {
      speakerLabel: 'ผู้ช่วย AI ของ Cozypet',
      politeParticle: 'ค่ะ',
      tone: 'อบอุ่น สุภาพ กระชับ',
      facts: [],
    },
    isDemo: true,
  };
}

export const SHELTERS: readonly HelperProfile[] = SLOTS.map(toProfile);
