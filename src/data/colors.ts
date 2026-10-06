import type { LocalizedText } from '@/lib/types';

/**
 * คำควบคุมสี/ลายของสัตว์ (chip ในฟอร์มและข้อมูลประกาศ) — PetListing.colors เก็บเป็น id
 * swatch ใช้วาดภาพประกอบสัตว์ (ภาพวาดในโค้ด ไม่ใช่ภาพถ่าย)
 */
export interface ColorTerm { id: string; label: LocalizedText; swatch: string; pattern?: 'calico' | 'tabby' | 'spots' }

export const COAT_COLORS: readonly ColorTerm[] = [
  { id: 'orange', label: { th: 'ส้ม', en: 'orange' }, swatch: '#E8913A' },
  { id: 'white', label: { th: 'ขาว', en: 'white' }, swatch: '#FBF8F2' },
  { id: 'black', label: { th: 'ดำ', en: 'black' }, swatch: '#2E2A27' },
  { id: 'gray', label: { th: 'เทา', en: 'grey' }, swatch: '#8E8F96' },
  { id: 'brown', label: { th: 'น้ำตาล', en: 'brown' }, swatch: '#8A5A3C' },
  { id: 'cream', label: { th: 'ครีม', en: 'cream' }, swatch: '#EAD7B5' },
  { id: 'golden', label: { th: 'ทอง', en: 'golden' }, swatch: '#D6A04A' },
  { id: 'calico', label: { th: 'สามสี', en: 'calico' }, swatch: '#E8913A', pattern: 'calico' },
  { id: 'tabby', label: { th: 'ลายสลิด', en: 'tabby' }, swatch: '#B98A5A', pattern: 'tabby' },
  { id: 'spotted', label: { th: 'ลายจุด', en: 'spotted' }, swatch: '#FBF8F2', pattern: 'spots' },
];

/** สีปลอกคอ — PetListing.collar.detail เก็บเป็น id นี้เมื่อผู้ใช้เลือกสี (หรือข้อความอิสระ) */
export const COLLAR_COLORS: readonly ColorTerm[] = [
  { id: 'red', label: { th: 'แดง', en: 'red' }, swatch: '#D2423A' },
  { id: 'blue', label: { th: 'น้ำเงิน', en: 'blue' }, swatch: '#3A6FD2' },
  { id: 'green', label: { th: 'เขียว', en: 'green' }, swatch: '#3A9A5B' },
  { id: 'pink', label: { th: 'ชมพู', en: 'pink' }, swatch: '#E58FB0' },
  { id: 'yellow', label: { th: 'เหลือง', en: 'yellow' }, swatch: '#E8C23A' },
  { id: 'black', label: { th: 'ดำ', en: 'black' }, swatch: '#2E2A27' },
  { id: 'purple', label: { th: 'ม่วง', en: 'purple' }, swatch: '#8A5AC9' },
];

const COAT_BY_ID = new Map(COAT_COLORS.map((c) => [c.id, c]));
const COLLAR_BY_ID = new Map(COLLAR_COLORS.map((c) => [c.id, c]));

export function coatColor(id: string): ColorTerm | undefined {
  return COAT_BY_ID.get(id);
}
export function collarColor(id: string | undefined): ColorTerm | undefined {
  return id ? COLLAR_BY_ID.get(id) : undefined;
}
