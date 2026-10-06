import type { GeoPoint } from '@/lib/types';

/**
 * 50 เขตของกรุงเทพฯ — ชื่อไทย/อังกฤษตามชื่อทางการ และจุดกึ่งกลางโดยประมาณ
 * (ปัดทศนิยม 3 ตำแหน่ง ใช้เพื่อ mock ตำแหน่งเท่านั้น ไม่ใช่ขอบเขตจริง · PROMPT.md S3, CREDITS.md `data-districts`)
 */
export interface District {
  id: string;
  nameTh: string;
  nameEn: string;
  center: GeoPoint;
}

export const DISTRICTS: readonly District[] = [
  { id: 'phra-nakhon', nameTh: 'พระนคร', nameEn: 'Phra Nakhon', center: { lat: 13.756, lng: 100.499 } },
  { id: 'dusit', nameTh: 'ดุสิต', nameEn: 'Dusit', center: { lat: 13.777, lng: 100.521 } },
  { id: 'nong-chok', nameTh: 'หนองจอก', nameEn: 'Nong Chok', center: { lat: 13.855, lng: 100.862 } },
  { id: 'bang-rak', nameTh: 'บางรัก', nameEn: 'Bang Rak', center: { lat: 13.731, lng: 100.524 } },
  { id: 'bang-khen', nameTh: 'บางเขน', nameEn: 'Bang Khen', center: { lat: 13.873, lng: 100.596 } },
  { id: 'bang-kapi', nameTh: 'บางกะปิ', nameEn: 'Bang Kapi', center: { lat: 13.766, lng: 100.648 } },
  { id: 'pathum-wan', nameTh: 'ปทุมวัน', nameEn: 'Pathum Wan', center: { lat: 13.744, lng: 100.533 } },
  { id: 'pom-prap-sattru-phai', nameTh: 'ป้อมปราบศัตรูพ่าย', nameEn: 'Pom Prap Sattru Phai', center: { lat: 13.758, lng: 100.513 } },
  { id: 'phra-khanong', nameTh: 'พระโขนง', nameEn: 'Phra Khanong', center: { lat: 13.702, lng: 100.601 } },
  { id: 'min-buri', nameTh: 'มีนบุรี', nameEn: 'Min Buri', center: { lat: 13.814, lng: 100.749 } },
  { id: 'lat-krabang', nameTh: 'ลาดกระบัง', nameEn: 'Lat Krabang', center: { lat: 13.723, lng: 100.759 } },
  { id: 'yan-nawa', nameTh: 'ยานนาวา', nameEn: 'Yan Nawa', center: { lat: 13.696, lng: 100.543 } },
  { id: 'samphanthawong', nameTh: 'สัมพันธวงศ์', nameEn: 'Samphanthawong', center: { lat: 13.731, lng: 100.514 } },
  { id: 'phaya-thai', nameTh: 'พญาไท', nameEn: 'Phaya Thai', center: { lat: 13.780, lng: 100.543 } },
  { id: 'thon-buri', nameTh: 'ธนบุรี', nameEn: 'Thon Buri', center: { lat: 13.725, lng: 100.486 } },
  { id: 'bangkok-yai', nameTh: 'บางกอกใหญ่', nameEn: 'Bangkok Yai', center: { lat: 13.723, lng: 100.476 } },
  { id: 'huai-khwang', nameTh: 'ห้วยขวาง', nameEn: 'Huai Khwang', center: { lat: 13.777, lng: 100.579 } },
  { id: 'khlong-san', nameTh: 'คลองสาน', nameEn: 'Khlong San', center: { lat: 13.731, lng: 100.509 } },
  { id: 'taling-chan', nameTh: 'ตลิ่งชัน', nameEn: 'Taling Chan', center: { lat: 13.777, lng: 100.457 } },
  { id: 'bangkok-noi', nameTh: 'บางกอกน้อย', nameEn: 'Bangkok Noi', center: { lat: 13.771, lng: 100.468 } },
  { id: 'bang-khun-thian', nameTh: 'บางขุนเทียน', nameEn: 'Bang Khun Thian', center: { lat: 13.630, lng: 100.440 } },
  { id: 'phasi-charoen', nameTh: 'ภาษีเจริญ', nameEn: 'Phasi Charoen', center: { lat: 13.715, lng: 100.437 } },
  { id: 'nong-khaem', nameTh: 'หนองแขม', nameEn: 'Nong Khaem', center: { lat: 13.705, lng: 100.349 } },
  { id: 'rat-burana', nameTh: 'ราษฎร์บูรณะ', nameEn: 'Rat Burana', center: { lat: 13.682, lng: 100.506 } },
  { id: 'bang-phlat', nameTh: 'บางพลัด', nameEn: 'Bang Phlat', center: { lat: 13.794, lng: 100.505 } },
  { id: 'din-daeng', nameTh: 'ดินแดง', nameEn: 'Din Daeng', center: { lat: 13.770, lng: 100.553 } },
  { id: 'bueng-kum', nameTh: 'บึงกุ่ม', nameEn: 'Bueng Kum', center: { lat: 13.785, lng: 100.669 } },
  { id: 'sathon', nameTh: 'สาทร', nameEn: 'Sathon', center: { lat: 13.708, lng: 100.526 } },
  { id: 'bang-sue', nameTh: 'บางซื่อ', nameEn: 'Bang Sue', center: { lat: 13.809, lng: 100.537 } },
  { id: 'chatuchak', nameTh: 'จตุจักร', nameEn: 'Chatuchak', center: { lat: 13.829, lng: 100.560 } },
  { id: 'bang-kho-laem', nameTh: 'บางคอแหลม', nameEn: 'Bang Kho Laem', center: { lat: 13.693, lng: 100.503 } },
  { id: 'prawet', nameTh: 'ประเวศ', nameEn: 'Prawet', center: { lat: 13.717, lng: 100.695 } },
  { id: 'khlong-toei', nameTh: 'คลองเตย', nameEn: 'Khlong Toei', center: { lat: 13.708, lng: 100.584 } },
  { id: 'suan-luang', nameTh: 'สวนหลวง', nameEn: 'Suan Luang', center: { lat: 13.730, lng: 100.651 } },
  { id: 'chom-thong', nameTh: 'จอมทอง', nameEn: 'Chom Thong', center: { lat: 13.678, lng: 100.484 } },
  { id: 'don-mueang', nameTh: 'ดอนเมือง', nameEn: 'Don Mueang', center: { lat: 13.914, lng: 100.590 } },
  { id: 'ratchathewi', nameTh: 'ราชเทวี', nameEn: 'Ratchathewi', center: { lat: 13.759, lng: 100.534 } },
  { id: 'lat-phrao', nameTh: 'ลาดพร้าว', nameEn: 'Lat Phrao', center: { lat: 13.803, lng: 100.607 } },
  { id: 'watthana', nameTh: 'วัฒนา', nameEn: 'Watthana', center: { lat: 13.742, lng: 100.586 } },
  { id: 'bang-khae', nameTh: 'บางแค', nameEn: 'Bang Khae', center: { lat: 13.696, lng: 100.409 } },
  { id: 'lak-si', nameTh: 'หลักสี่', nameEn: 'Lak Si', center: { lat: 13.887, lng: 100.579 } },
  { id: 'sai-mai', nameTh: 'สายไหม', nameEn: 'Sai Mai', center: { lat: 13.919, lng: 100.646 } },
  { id: 'khan-na-yao', nameTh: 'คันนายาว', nameEn: 'Khan Na Yao', center: { lat: 13.827, lng: 100.680 } },
  { id: 'saphan-sung', nameTh: 'สะพานสูง', nameEn: 'Saphan Sung', center: { lat: 13.769, lng: 100.685 } },
  { id: 'wang-thonglang', nameTh: 'วังทองหลาง', nameEn: 'Wang Thonglang', center: { lat: 13.788, lng: 100.609 } },
  { id: 'khlong-sam-wa', nameTh: 'คลองสามวา', nameEn: 'Khlong Sam Wa', center: { lat: 13.860, lng: 100.704 } },
  { id: 'bang-na', nameTh: 'บางนา', nameEn: 'Bang Na', center: { lat: 13.680, lng: 100.605 } },
  { id: 'thawi-watthana', nameTh: 'ทวีวัฒนา', nameEn: 'Thawi Watthana', center: { lat: 13.773, lng: 100.352 } },
  { id: 'thung-khru', nameTh: 'ทุ่งครุ', nameEn: 'Thung Khru', center: { lat: 13.611, lng: 100.509 } },
  { id: 'bang-bon', nameTh: 'บางบอน', nameEn: 'Bang Bon', center: { lat: 13.663, lng: 100.369 } },
];

const BY_ID = new Map(DISTRICTS.map((d) => [d.id, d]));

export function getDistrict(id: string): District | undefined {
  return BY_ID.get(id);
}

export function isDistrictId(id: string | null | undefined): id is string {
  return !!id && BY_ID.has(id);
}

/** กรอบพิกัดกรุงเทพฯ ที่ใช้ตรวจข้อมูลและ clamp จุดค้นหา (PROMPT.md 10.4 ข้อ 4) */
export const BANGKOK_BOUNDS = { minLat: 13.49, maxLat: 13.96, minLng: 100.32, maxLng: 100.94 } as const;
