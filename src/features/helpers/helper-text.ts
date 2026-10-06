import type { HelperProfile, Locale } from '@/lib/types';

/** ชื่อที่แสดงของผู้ช่วยดูแล (EN ใช้ชื่ออังกฤษทางการเฉพาะที่ตรวจแล้ว) */
export function helperName(h: HelperProfile, locale: Locale): string {
  return locale === 'en' && h.displayNameEn ? h.displayNameEn : h.displayName;
}
