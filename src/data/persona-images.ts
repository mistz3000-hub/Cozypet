import type { CurrentPet, HelperImages } from '@/lib/types';
import { getDistrict } from './districts';

/**
 * ภาพ persona ที่สร้างด้วย AI (Codex) ตาม CODEX_IMAGE_PROMPTS.md
 * ยังไม่มีไฟล์ภาพใน repo — เมื่อทีมสร้างภาพครบ batch ให้เพิ่ม id ลงชุดนี้และเพิ่มแถว CREDITS.md (`ai-personas-001-010` …)
 * ระหว่างนี้หน้าเว็บใช้ fallback (avatar ตัวอักษร / placeholder อุ้งเท้า) ตาม PROMPT.md 15
 */
export const AVAILABLE_PERSONA_IMAGES: ReadonlySet<string> = new Set<string>([]);

const HOME_TH: Record<string, string> = {
  condo: 'คอนโด', apartment: 'อพาร์ตเมนต์', townhouse: 'ทาวน์เฮาส์', house: 'บ้านเดี่ยว', shophouse: 'ตึกแถว', wooden_house: 'บ้านไม้',
};

export function creditIdForAdopter(id: string): string {
  const n = Number(id.slice(-3));
  const start = Math.floor((n - 1) / 10) * 10 + 1;
  const pad = (x: number) => String(x).padStart(3, '0');
  return `ai-personas-${pad(start)}-${pad(start + 9)}`;
}

export function personaImagesFor(id: string, name: string, districtId: string, homeType: string, pets: CurrentPet[]): HelperImages {
  if (!AVAILABLE_PERSONA_IMAGES.has(id)) return {};
  const creditId = creditIdForAdopter(id);
  const base = `/images/personas/${id}`;
  const district = getDistrict(districtId)?.nameTh ?? '';
  const images: HelperImages = {
    profile: { src: `${base}/profile.webp`, alt: `ภาพสร้างด้วย AI: คุณ${name} ผู้รับดูแลรายบุคคล เขต${district}`, creditId, aiGenerated: true },
    home: { src: `${base}/home.webp`, alt: `ภาพสร้างด้วย AI: ${HOME_TH[homeType] ?? 'บ้าน'}ของคุณ${name}`, creditId, aiGenerated: true },
  };
  if (pets.length) {
    images.pets = { src: `${base}/pets.webp`, alt: `ภาพสร้างด้วย AI: ${pets.map((p) => p.name).join(' และ ')} ที่คุณ${name}ดูแลอยู่`, creditId, aiGenerated: true };
  }
  return images;
}
