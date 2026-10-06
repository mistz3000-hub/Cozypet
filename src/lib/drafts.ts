'use client';
/**
 * ร่างข้อมูลจากหน้าสแกนที่ส่งต่อให้ฟอร์มลงประกาศ (อยู่ในหน่วยความจำของแท็บนี้เท่านั้น ไม่เขียน storage)
 */
import type { CollarStatus, MediaRef, Species, Urgency } from './types';

export interface ScanDraft {
  photo: MediaRef | null;
  species: Species | null;
  speciesOther: string;
  colors: string[];
  markings: string;
  collar: { status: CollarStatus; color?: string; detail?: string };
  districtId: string;
  foundAt: string;
  urgency?: Urgency;
}

let draft: ScanDraft | null = null;

export function setScanDraft(d: ScanDraft | null) {
  draft = d;
}
export function getScanDraft(): ScanDraft | null {
  return draft;
}
