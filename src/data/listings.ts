import type { PersonaRef, PetListing, Species, Urgency } from '@/lib/types';
import { petArt } from './pet-art';
import { VARIETY_LISTINGS } from './variety-listings';

/**
 * ประกาศ seed (ข้อมูลสมมติ วันที่ตัวอย่าง) — สัตว์หาย 13 · พบสัตว์ 9 · หาบ้าน 38 (D23)
 * - ประกาศพบสัตว์/หาบ้านของสถานสงเคราะห์ผูกกับช่องที่รอข้อมูลองค์กรจริงเท่านั้น (ไม่สร้างกิจกรรมแทนองค์กรจริง)
 * - กรณีมาตรฐานของหน้าสแกน: แมว ส้ม+ขาว ปลอกคอแดง พระโขนง → listing-001 “มะม่วง” (PROMPT.md 7.2)
 */

interface Seed {
  id: string;
  type: PetListing['type'];
  species: Species;
  speciesOther?: string;
  breed?: string;
  name?: string;
  sex?: PetListing['sex'];
  colors: string[];
  markings?: string;
  collar: PetListing['collar'];
  districtId: string;
  eventAt: string;
  description?: string;
  postedBy: PersonaRef;
  careHolderId?: string;
  urgency?: Urgency;
  status?: PetListing['status'];
  closedReason?: PetListing['closedReason'];
}

function make(s: Seed): PetListing {
  return {
    id: s.id,
    type: s.type,
    source: 'seed',
    species: s.species,
    speciesOther: s.speciesOther,
    breed: s.breed ?? (s.species === 'cat' ? (s.id === 'listing-005' ? 'แมวไทยพันทางขนยาว' : 'แมวไทยพันทาง') : s.species === 'dog' ? (s.id === 'listing-013' ? 'พุดเดิลผสม' : 'สุนัขไทยพันทาง') : undefined),
    name: s.name,
    sex: s.sex ?? 'unknown',
    colors: s.colors,
    markings: s.markings,
    collar: s.collar,
    districtId: s.districtId,
    eventAt: s.eventAt,
    photo: petArt(s.species, s.colors, { collar: s.collar.status === 'yes' ? s.collar.detail : undefined, seed: s.id, speciesLabelTh: s.speciesOther }),
    description: s.description,
    postedBy: s.postedBy,
    careHolderId: s.careHolderId,
    urgency: s.urgency,
    status: s.status ?? 'open',
    closedReason: s.closedReason,
    createdAt: s.eventAt,
    updatedAt: s.eventAt,
    isDemo: true,
  };
}

const own = (id: string): PersonaRef => ({ kind: 'owner', id });
const ind = (id: string): PersonaRef => ({ kind: 'individual', id });
const shel = (id: string): PersonaRef => ({ kind: 'shelter', id });

export const LISTINGS: readonly PetListing[] = [
  ...VARIETY_LISTINGS,
  // ---------- สัตว์หาย ----------
  make({ id: 'listing-001', type: 'lost', species: 'cat', name: 'มะม่วง', sex: 'female', colors: ['orange', 'white'], markings: 'ปลายหางสีขาว หางงอเล็กน้อย', collar: { status: 'yes', detail: 'red' }, districtId: 'phra-khanong', eventAt: '2026-09-20T18:30:00+07:00', description: 'มะม่วงเป็นแมวขี้อาย หายจากหน้าบ้านตอนเย็น ถ้าเจอช่วยทักผ่านแชตใน Cozypet นะคะ', postedBy: own('owner-001') }),
  make({ id: 'listing-002', type: 'lost', species: 'cat', name: 'ถั่วดำ', sex: 'male', colors: ['black'], markings: 'ตาสีเหลืองอำพัน มีขนขาวจุดเล็กที่อก', collar: { status: 'no' }, districtId: 'bang-kapi', eventAt: '2026-09-14T21:00:00+07:00', description: 'ออกไปเดินเล่นแล้วไม่กลับมา ชอบหลบใต้รถ', postedBy: own('owner-002') }),
  make({ id: 'listing-003', type: 'lost', species: 'cat', name: 'โมจิ', sex: 'female', colors: ['white'], markings: 'ตาสองสี ข้างหนึ่งฟ้า ข้างหนึ่งเหลือง', collar: { status: 'yes', detail: 'blue' }, districtId: 'watthana', eventAt: '2026-09-25T09:00:00+07:00', description: 'โมจิหูไม่ค่อยได้ยิน อาจไม่หันตามเสียงเรียก', postedBy: own('owner-003') }),
  make({ id: 'listing-004', type: 'lost', species: 'cat', name: 'เจ้าส้ม', sex: 'male', colors: ['orange', 'tabby'], markings: 'ตัวใหญ่ หูขวามีรอยบาก', collar: { status: 'no' }, districtId: 'suan-luang', eventAt: '2026-09-10T07:00:00+07:00', postedBy: own('owner-004') }),
  make({ id: 'listing-005', type: 'lost', species: 'cat', name: 'ลาเต้', sex: 'female', colors: ['cream'], markings: 'ขนยาว หางฟู', collar: { status: 'yes', detail: 'pink' }, districtId: 'bang-na', eventAt: '2026-09-22T19:00:00+07:00', postedBy: own('owner-005') }),
  make({ id: 'listing-006', type: 'lost', species: 'dog', name: 'ทองคำ', sex: 'male', colors: ['golden'], markings: 'หางม้วน ปลายหูพับ', collar: { status: 'yes', detail: 'red' }, districtId: 'lat-phrao', eventAt: '2026-09-18T17:00:00+07:00', description: 'ทองคำตกใจเสียงพลุแล้ววิ่งออกจากบ้าน เป็นหมาใจดี', postedBy: own('owner-006') }),
  make({ id: 'listing-007', type: 'lost', species: 'dog', name: 'ดำดี', sex: 'male', colors: ['black'], markings: 'ขาหลังซ้ายเดินกะเผลกเล็กน้อย', collar: { status: 'yes', detail: 'green' }, districtId: 'chatuchak', eventAt: '2026-09-26T06:30:00+07:00', postedBy: own('owner-007') }),
  make({ id: 'listing-008', type: 'lost', species: 'dog', name: 'บิสกิต', sex: 'female', colors: ['brown', 'white'], markings: 'ลายขาวที่หน้าเป็นรูปตัววี', collar: { status: 'no' }, districtId: 'don-mueang', eventAt: '2026-09-12T15:00:00+07:00', postedBy: own('owner-008') }),
  make({ id: 'listing-009', type: 'lost', species: 'other', speciesOther: 'กระต่าย', name: 'ปุยฝ้าย', sex: 'female', colors: ['white'], markings: 'หูตก จมูกสีชมพู', collar: { status: 'no' }, districtId: 'phaya-thai', eventAt: '2026-09-24T12:00:00+07:00', description: 'กระต่ายหูตก หลุดออกจากกรงตอนทำความสะอาด', postedBy: own('owner-009') }),
  make({ id: 'listing-010', type: 'lost', species: 'cat', name: 'ขนมครก', sex: 'female', colors: ['calico'], markings: 'แต้มส้มที่หูซ้าย', collar: { status: 'yes', detail: 'yellow' }, districtId: 'khlong-toei', eventAt: '2026-09-21T20:00:00+07:00', postedBy: own('owner-010') }),
  make({ id: 'listing-011', type: 'lost', species: 'cat', name: 'ซูชิ', sex: 'male', colors: ['gray', 'white'], markings: 'หางสั้น', collar: { status: 'yes', detail: 'red' }, districtId: 'sathon', eventAt: '2026-09-16T08:00:00+07:00', postedBy: own('owner-011') }),
  make({ id: 'listing-012', type: 'lost', species: 'cat', name: 'ขนุน', sex: 'male', colors: ['orange', 'white'], markings: 'จมูกมีจุดสีดำเล็ก ๆ', collar: { status: 'no' }, districtId: 'bang-na', eventAt: '2026-09-23T18:00:00+07:00', postedBy: own('owner-012') }),
  make({ id: 'listing-013', type: 'lost', species: 'dog', name: 'เมฆ', sex: 'male', colors: ['white'], markings: 'ตัวเล็ก ขนหยิก', collar: { status: 'yes', detail: 'blue' }, districtId: 'nong-chok', eventAt: '2026-09-19T10:00:00+07:00', postedBy: own('owner-013') }),

  // ---------- พบสัตว์ (ผู้รับดูแลรายบุคคลรับไว้ชั่วคราว) ----------
  make({ id: 'listing-014', type: 'found', species: 'cat', sex: 'male', colors: ['orange', 'tabby'], markings: 'หางยาว ขี้อ้อน', collar: { status: 'no' }, districtId: 'huai-khwang', eventAt: '2026-09-27T19:00:00+07:00', description: 'เจอนั่งอยู่หน้าร้านสะดวกซื้อ ตอนนี้อยู่ในความดูแลชั่วคราว', postedBy: ind('adopter-066'), careHolderId: 'adopter-066', urgency: 'normal' }),
  make({ id: 'listing-015', type: 'found', species: 'cat', sex: 'female', colors: ['calico'], markings: 'ลูกแมวตัวเล็ก ตาแฉะเล็กน้อย', collar: { status: 'no' }, districtId: 'lat-phrao', eventAt: '2026-09-29T17:30:00+07:00', description: 'ลูกแมวอยู่ปากซอยตัวเดียว รับไว้ก่อนระหว่างรอเจ้าของ', postedBy: ind('adopter-061'), careHolderId: 'adopter-061', urgency: 'soon' }),
  make({ id: 'listing-016', type: 'found', species: 'dog', sex: 'female', colors: ['brown'], markings: 'ปลอกคอหนังเก่า ไม่มีป้ายชื่อ', collar: { status: 'yes', detail: 'red' }, districtId: 'bang-khen', eventAt: '2026-09-25T07:00:00+07:00', postedBy: ind('adopter-083'), careHolderId: 'adopter-083', urgency: 'normal' }),
  make({ id: 'listing-017', type: 'found', species: 'dog', sex: 'male', colors: ['black'], markings: 'ขาหลังขวาบาดเจ็บ', collar: { status: 'no' }, districtId: 'min-buri', eventAt: '2026-09-30T21:00:00+07:00', description: 'เจอข้างถนน ขาหลังบาดเจ็บ (ข้อมูลตัวอย่าง ไม่ใช่การวินิจฉัย)', postedBy: ind('adopter-043'), careHolderId: 'adopter-043', urgency: 'emergency' }),
  make({ id: 'listing-018', type: 'found', species: 'cat', sex: 'unknown', colors: ['white', 'black'], markings: 'ผอม ไม่ค่อยกินอาหาร', collar: { status: 'no' }, districtId: 'bang-kapi', eventAt: '2026-09-28T13:00:00+07:00', postedBy: ind('adopter-034'), careHolderId: 'adopter-034', urgency: 'soon' }),
  make({ id: 'listing-019', type: 'found', species: 'cat', sex: 'male', colors: ['gray'], markings: 'ตัวโต ขนสั้นเงา', collar: { status: 'yes', detail: 'blue' }, districtId: 'din-daeng', eventAt: '2026-09-26T18:00:00+07:00', postedBy: ind('adopter-082'), careHolderId: 'adopter-082', urgency: 'normal' }),
  make({ id: 'listing-020', type: 'found', species: 'dog', sex: 'female', colors: ['white'], markings: 'มีบาดแผลที่ไหล่', collar: { status: 'no' }, districtId: 'khlong-sam-wa', eventAt: '2026-10-01T06:00:00+07:00', description: 'มีแผลที่ไหล่ พาไปสัตวแพทย์แล้ว (ข้อมูลตัวอย่าง)', postedBy: ind('adopter-053'), careHolderId: 'adopter-053', urgency: 'emergency' }),
  make({ id: 'listing-021', type: 'found', species: 'other', speciesOther: 'กระต่าย', sex: 'unknown', colors: ['brown'], markings: 'หูตั้ง ตัวเล็ก', collar: { status: 'no' }, districtId: 'thung-khru', eventAt: '2026-09-27T10:00:00+07:00', postedBy: ind('adopter-055'), careHolderId: 'adopter-055', urgency: 'normal' }),
  make({ id: 'listing-028', type: 'found', species: 'cat', sex: 'female', colors: ['orange'], markings: 'หางขอดเล็กน้อย', collar: { status: 'no' }, districtId: 'bang-rak', eventAt: '2026-09-08T19:00:00+07:00', description: 'เจ้าของมารับกลับแล้ว (ตัวอย่างประกาศที่ปิดแล้ว)', postedBy: ind('adopter-085'), careHolderId: 'adopter-085', urgency: 'normal', status: 'closed', closedReason: 'reunited' }),

  // ---------- หาบ้าน ----------
  make({ id: 'listing-022', type: 'adoption', species: 'cat', name: 'วุ้นกะทิ', sex: 'female', colors: ['cream'], markings: 'ทำหมันแล้ว (ตัวอย่าง) นิสัยเรียบร้อย', collar: { status: 'no' }, districtId: 'bang-khen', eventAt: '2026-07-28T10:00:00+07:00', postedBy: shel('shelter-006'), careHolderId: 'shelter-006' }),
  make({ id: 'listing-023', type: 'adoption', species: 'dog', name: 'ข้าวโพด', sex: 'male', colors: ['golden'], markings: 'ชอบวิ่งเล่น เข้ากับเด็กได้ (ตัวอย่าง)', collar: { status: 'no' }, districtId: 'min-buri', eventAt: '2026-08-15T10:00:00+07:00', postedBy: shel('shelter-008'), careHolderId: 'shelter-008' }),
  make({ id: 'listing-024', type: 'adoption', species: 'cat', name: 'โอริโอ้', sex: 'male', colors: ['black', 'white'], markings: 'ขี้อ้อน ชอบนอนตัก', collar: { status: 'no' }, districtId: 'lat-krabang', eventAt: '2026-07-05T10:00:00+07:00', postedBy: shel('shelter-011'), careHolderId: 'shelter-011' }),
  make({ id: 'listing-025', type: 'adoption', species: 'cat', name: 'ส้มจี๊ด', sex: 'female', colors: ['orange', 'white'], markings: 'ซน ชอบของเล่นขนนก', collar: { status: 'no' }, districtId: 'dusit', eventAt: '2026-09-02T10:00:00+07:00', description: 'ผ่านการลงประกาศรอเจ้าของมาแล้ว กำลังหาบ้านถาวร', postedBy: ind('adopter-005'), careHolderId: 'adopter-005' }),
  make({ id: 'listing-026', type: 'adoption', species: 'dog', name: 'ถั่วแดง', sex: 'female', colors: ['brown', 'white'], markings: 'ขนาดกลาง เดินสายจูงได้', collar: { status: 'no' }, districtId: 'thawi-watthana', eventAt: '2026-08-20T10:00:00+07:00', postedBy: ind('adopter-023'), careHolderId: 'adopter-023' }),
  make({ id: 'listing-027', type: 'adoption', species: 'cat', name: 'ทับทิม', sex: 'female', colors: ['calico'], markings: 'ลูกแมวอายุประมาณ 4 เดือน', collar: { status: 'no' }, districtId: 'lat-phrao', eventAt: '2026-09-12T10:00:00+07:00', postedBy: ind('adopter-089'), careHolderId: 'adopter-089' }),
];
