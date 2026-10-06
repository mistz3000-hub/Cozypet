import type { DonationPackage } from '@/lib/types';

/** แพ็กเกจของใช้ (จำลอง) — ราคาตัวอย่าง ส่วนแบ่งแพลตฟอร์มจากแบรนด์ 10% (ตัวอย่าง) · PROMPT.md 10.3, S14 */
export const PACKAGES: readonly DonationPackage[] = [
  {
    id: 'pkg-cat-food-7d', brandId: 'brand-a', species: ['cat'], priceTHB: 290, platformSharePct: 10,
    name: { th: 'อาหารแมว 7 วัน', en: 'Cat food for 7 days' },
    items: [{ th: 'อาหารเม็ดแมว 1.2 กก.', en: 'Dry cat food 1.2 kg' }, { th: 'อาหารเปียก 4 ซอง', en: '4 wet food pouches' }],
    effect: { foodDays: 7 },
  },
  {
    id: 'pkg-dog-food-7d', brandId: 'brand-b', species: ['dog'], priceTHB: 350, platformSharePct: 10,
    name: { th: 'อาหารสุนัข 7 วัน', en: 'Dog food for 7 days' },
    items: [{ th: 'อาหารเม็ดสุนัข 2 กก.', en: 'Dry dog food 2 kg' }, { th: 'ขนมขัดฟัน 1 ห่อ', en: '1 pack of dental chews' }],
    effect: { foodDays: 7 },
  },
  {
    id: 'pkg-cat-litter', brandId: 'brand-a', species: ['cat'], priceTHB: 250, platformSharePct: 10,
    name: { th: 'ทรายแมว 2 ถุง', en: 'Cat litter, 2 bags' },
    items: [{ th: 'ทรายแมว 10 ลิตร 2 ถุง', en: '2 × 10 L bags of cat litter' }],
    effect: { litterDays: 14 },
  },
  {
    id: 'pkg-care-basic', brandId: 'brand-c', species: ['cat', 'dog', 'other'], priceTHB: 390, platformSharePct: 10,
    name: { th: 'ชุดดูแลพื้นฐาน', en: 'Basic care kit' },
    items: [{ th: 'แชมพูอ่อนโยน', en: 'Gentle shampoo' }, { th: 'แปรงขน', en: 'Grooming brush' }, { th: 'ชามอาหารและน้ำ', en: 'Food and water bowls' }, { th: 'อาหาร 3 วัน', en: '3 days of food' }],
    effect: { foodDays: 3 },
  },
  {
    id: 'pkg-bundle-30d', brandId: 'brand-b', species: ['cat', 'dog'], priceTHB: 990, platformSharePct: 10,
    name: { th: 'ชุดใหญ่ 30 วัน', en: 'Big 30-day bundle' },
    items: [{ th: 'อาหาร 30 วัน', en: '30 days of food' }, { th: 'ทรายแมว (สำหรับผู้ดูแลแมว)', en: 'Cat litter (for cat carers)' }, { th: 'ขนม 2 ห่อ', en: '2 packs of treats' }],
    effect: { foodDays: 30, litterDays: 14 },
  },
];

const BY_ID = new Map(PACKAGES.map((p) => [p.id, p]));
export function getPackage(id: string) {
  return BY_ID.get(id);
}
