import type { OwnerProfile } from '@/lib/types';
import { GENERATED_MEDIA } from './generated-media';

/** เจ้าของที่กำลังตามหาสัตว์ (บุคคลสมมติทั้งหมด) — หนึ่งคนต่อประกาศสัตว์หาย seed */
function owner(id: string, displayName: string, districtId: string, listingId: string, particle: 'ค่ะ' | 'ครับ', tone: string, facts: string[] = []): OwnerProfile {
  return {
    id,
    displayName,
    districtId,
    listingIds: [listingId],
    photo: GENERATED_MEDIA[`owners:${id}`],
    persona: { speakerLabel: 'เจ้าของน้อง', politeParticle: particle, tone, facts },
    isDemo: true,
  };
}

export const OWNERS: readonly OwnerProfile[] = [
  owner('owner-001', 'นารา', 'phra-khanong', 'listing-001', 'ค่ะ', 'อบอุ่น กังวลแต่สุภาพ', ['มะม่วงชอบนอนบนกล่องกระดาษ (ข้อมูลตัวอย่าง)']),
  owner('owner-002', 'ภูมิใจ', 'bang-kapi', 'listing-002', 'ครับ', 'สุภาพ กระชับ'),
  owner('owner-003', 'แพรว', 'watthana', 'listing-003', 'ค่ะ', 'สดใส เป็นกันเอง'),
  owner('owner-004', 'ต้นข้าว', 'suan-luang', 'listing-004', 'ครับ', 'เป็นกันเอง'),
  owner('owner-005', 'มีนา', 'bang-na', 'listing-005', 'ค่ะ', 'อ่อนโยน'),
  owner('owner-006', 'ธนกร', 'lat-phrao', 'listing-006', 'ครับ', 'ใจเย็น สุภาพ'),
  owner('owner-007', 'กุ้ง', 'chatuchak', 'listing-007', 'ค่ะ', 'ตรงไปตรงมา'),
  owner('owner-008', 'วิน', 'don-mueang', 'listing-008', 'ครับ', 'เป็นกันเอง'),
  owner('owner-009', 'ข้าวฟ่าง', 'phaya-thai', 'listing-009', 'ค่ะ', 'อบอุ่น'),
  owner('owner-010', 'ศิริ', 'khlong-toei', 'listing-010', 'ค่ะ', 'สุภาพ'),
  owner('owner-011', 'เจมส์', 'sathon', 'listing-011', 'ครับ', 'สุภาพ กระชับ'),
  owner('owner-012', 'ใบข้าว', 'bang-na', 'listing-012', 'ค่ะ', 'เป็นกันเอง'),
  owner('owner-013', 'บอย', 'nong-chok', 'listing-013', 'ครับ', 'ใจดี'),
];
