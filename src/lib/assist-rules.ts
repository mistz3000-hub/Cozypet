/**
 * กฎคำสำคัญของ “เล่าให้ AI ช่วยสรุป” (PROMPT.md 12.9) — deterministic ใช้ได้ทั้ง server และ client ไม่เรียก network
 * ใช้เมื่อ AI ปิด/timeout/ผลไม่ผ่าน schema/โหมดบทสนทนาตัวอย่าง และใน autopilot ของทัวร์
 */
import type { AssistIntakeResult, AssistSignal, FallbackReason, HelpType, Locale, Species, Urgency } from './types';
import { DISTRICTS } from '@/data/districts';

const has = (text: string, words: readonly string[]) => words.some((w) => text.includes(w));
/** คำอังกฤษตรวจแบบทั้งคำ */
const hasWord = (text: string, words: readonly string[]) =>
  words.some((w) => new RegExp(`(^|[^a-z])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`, 'i').test(text));

const CAT_TH = ['แมว', 'เหมียว'];
const CAT_EN = ['cat', 'cats', 'kitten', 'kittens', 'kitty'];
const DOG_TH = ['หมา', 'สุนัข'];
const DOG_EN = ['dog', 'dogs', 'puppy', 'puppies', 'pup'];
const OTHER_TH = ['กระต่าย', 'นก', 'เต่า', 'หนูแฮมสเตอร์'];
const OTHER_EN = ['rabbit', 'bunny', 'bird', 'turtle', 'hamster'];

const YOUNG_TH = ['ลูกแมว', 'ลูกหมา', 'ลูกสุนัข', 'ตัวเล็ก', 'ลูกกระต่าย'];
const YOUNG_EN = ['kitten', 'kittens', 'puppy', 'puppies', 'tiny', 'baby'];
const ADULT_TH = ['ตัวโต', 'โตแล้ว', 'แมวโต', 'หมาโต'];
const ADULT_EN = ['adult', 'grown'];

const EMERGENCY_TH = ['เลือด', 'รถชน', 'โดนรถ', 'ขาหัก', 'หายใจไม่ออก', 'หายใจลำบาก', 'ชัก', 'ติดอยู่', 'ติดในท่อ'];
const EMERGENCY_EN = ['bleeding', 'blood', 'hit by a car', 'hit by car', 'broken leg', 'seizure', 'seizures', "can't breathe", 'cannot breathe', 'trapped', 'stuck'];
const SOON_TH = ['ป่วย', 'ตาแฉะ', 'ผอม', 'ไม่กิน', 'อาเจียน', 'ท้องเสีย', 'ตัวสั่น', 'อ่อนแรง'];
const SOON_EN = ['sick', 'ill', 'thin', 'not eating', 'vomiting', 'vomit', 'diarrhea', 'diarrhoea', 'shivering', 'shaking', 'weak'];

const INJURED_TH = ['เลือด', 'รถชน', 'โดนรถ', 'ขาหัก', 'บาดเจ็บ', 'แผล'];
const INJURED_EN = ['bleeding', 'blood', 'injured', 'wound', 'hurt', 'hit by a car', 'hit by car', 'broken leg'];
const SICK_TH = ['ป่วย', 'ตาแฉะ', 'ผอม', 'ไม่กิน', 'อาเจียน', 'ท้องเสีย', 'อ่อนแรง'];
const SICK_EN = ['sick', 'ill', 'thin', 'not eating', 'vomiting', 'vomit', 'diarrhea', 'diarrhoea', 'weak'];
const TRAPPED_TH = ['ติดอยู่', 'ติดในท่อ', 'ติดบน', 'ลงไม่ได้'];
const TRAPPED_EN = ['trapped', 'stuck'];
const HUNGRY_TH = ['หิว'];
const HUNGRY_EN = ['hungry', 'starving'];
const ALONE_TH = ['ตัวเดียว', 'คนเดียว', 'ลำพัง', 'ไม่มีแม่'];
const ALONE_EN = ['alone', 'on its own', 'no mother', 'abandoned'];
const AGGRESSIVE_TH = ['ดุ', 'กัดคน', 'ขู่'];
const AGGRESSIVE_EN = ['aggressive', 'biting', 'growling'];

const DONATE_TH = ['บริจาค', 'ส่งของ', 'ส่งอาหาร', 'ส่งแพ็กเกจ', 'ซื้ออาหาร', 'สนับสนุน', 'ช่วยคนเลี้ยง'];
const DONATE_EN = ['donate', 'donation', 'supplies', 'send food', 'support'];
const ADOPT_TH = ['รับเลี้ยง', 'อยากเลี้ยง', 'อุปถัมภ์'];
const ADOPT_EN = ['adopt', 'adoption', 'foster'];
const INTAKE_TH = ['เจอ', 'พบ', 'ฝาก', 'หาที่รับ', 'ส่งน้อง'];
const INTAKE_EN = ['found', 'find', 'saw', 'rescue', 'shelter for'];

function detectSpecies(t: string, lower: string): Species | 'unknown' {
  // ลูกแมว/ลูกหมา ก็มีคำว่า แมว/หมา อยู่แล้ว
  if (has(t, CAT_TH) || hasWord(lower, CAT_EN)) return 'cat';
  if (has(t, DOG_TH) || hasWord(lower, DOG_EN)) return 'dog';
  if (has(t, OTHER_TH) || hasWord(lower, OTHER_EN)) return 'other';
  return 'unknown';
}

export function detectDistrict(text: string): string | null {
  const lower = text.toLowerCase();
  // ชื่อยาวก่อน เพื่อไม่ให้ “บางกอก” ชนะ “บางกอกน้อย”
  const sorted = [...DISTRICTS].sort((a, b) => b.nameTh.length - a.nameTh.length);
  for (const d of sorted) if (text.includes(d.nameTh)) return d.id;
  const sortedEn = [...DISTRICTS].sort((a, b) => b.nameEn.length - a.nameEn.length);
  for (const d of sortedEn) if (hasWord(lower, [d.nameEn.toLowerCase()])) return d.id;
  return null;
}

/** ข้อความภาษาอังกฤษเป็นหลัก (ตัวอักษรละตินมากกว่าไทย) */
export function isMostlyLatin(text: string): boolean {
  const latin = (text.match(/[a-z]/gi) ?? []).length;
  const thai = (text.match(/[฀-๿]/g) ?? []).length;
  return latin > thai;
}

const SPECIES_TH: Record<Species, string> = { cat: 'แมว', dog: 'สุนัข', other: 'สัตว์' };
const SPECIES_EN: Record<Species, string> = { cat: 'cat', dog: 'dog', other: 'animal' };
const SIGNAL_TH: Record<AssistSignal, string> = { injured: 'บาดเจ็บ', sick: 'ไม่สบาย', trapped: 'ติดอยู่', hungry: 'หิว', young_alone: 'อยู่ลำพัง', aggressive: 'ตื่นกลัว/ดุ' };
const SIGNAL_EN: Record<AssistSignal, string> = { injured: 'injured', sick: 'unwell', trapped: 'trapped', hungry: 'hungry', young_alone: 'alone', aggressive: 'defensive' };
const HELP_TH: Record<HelpType, string> = { intake: 'หาที่รับดูแล', donate: 'อยากส่งของใช้', adopt: 'อยากรับเลี้ยง' };
const HELP_EN: Record<HelpType, string> = { intake: 'needs care', donate: 'wants to send supplies', adopt: 'wants to adopt' };

export function buildRulesSummary(r: Omit<AssistIntakeResult, 'summary' | 'source' | 'provider' | 'fallbackReason'>, locale: Locale): string {
  const district = r.districtId ? DISTRICTS.find((d) => d.id === r.districtId) : undefined;
  if (locale === 'en') {
    const who = r.species === 'unknown' ? 'Animal' : `${r.ageGroup === 'young' ? 'Young ' : ''}${SPECIES_EN[r.species]}`;
    const parts = [who.charAt(0).toUpperCase() + who.slice(1), ...r.signals.map((s) => SIGNAL_EN[s])];
    if (r.helpType !== 'unknown') parts.push(HELP_EN[r.helpType]);
    const text = parts.join(', ') + (district ? ` · ${district.nameEn}` : '');
    return text.slice(0, 80);
  }
  const who = r.species === 'unknown' ? 'สัตว์' : `${r.ageGroup === 'young' ? 'ลูก' : ''}${SPECIES_TH[r.species]}`;
  const parts = [who, ...r.signals.map((s) => SIGNAL_TH[s])];
  if (r.helpType !== 'unknown') parts.push(HELP_TH[r.helpType]);
  const text = parts.join(' ') + (district ? ` · เขต${district.nameTh}` : '');
  return text.slice(0, 80);
}

export function assistByRules(text: string, locale: Locale, fallbackReason?: FallbackReason): AssistIntakeResult {
  const t = text.slice(0, 300);
  const lower = t.toLowerCase();
  const species = detectSpecies(t, lower);
  const young = has(t, YOUNG_TH) || hasWord(lower, YOUNG_EN);
  const adult = has(t, ADULT_TH) || hasWord(lower, ADULT_EN);
  const ageGroup: AssistIntakeResult['ageGroup'] = young ? 'young' : adult ? 'adult' : 'unknown';

  const signals: AssistSignal[] = [];
  if (has(t, INJURED_TH) || hasWord(lower, INJURED_EN)) signals.push('injured');
  if (has(t, SICK_TH) || hasWord(lower, SICK_EN)) signals.push('sick');
  if (has(t, TRAPPED_TH) || hasWord(lower, TRAPPED_EN)) signals.push('trapped');
  if (has(t, HUNGRY_TH) || hasWord(lower, HUNGRY_EN)) signals.push('hungry');
  if (young && (has(t, ALONE_TH) || hasWord(lower, ALONE_EN))) signals.push('young_alone');
  if (has(t, AGGRESSIVE_TH) || hasWord(lower, AGGRESSIVE_EN)) signals.push('aggressive');

  let urgency: Urgency | 'unknown' = 'unknown';
  if (has(t, EMERGENCY_TH) || hasWord(lower, EMERGENCY_EN)) urgency = 'emergency';
  else if (has(t, SOON_TH) || hasWord(lower, SOON_EN) || signals.includes('young_alone')) urgency = 'soon';
  else if (species !== 'unknown') urgency = 'normal';

  let helpType: AssistIntakeResult['helpType'] = 'unknown';
  if (has(t, DONATE_TH) || hasWord(lower, DONATE_EN)) helpType = 'donate';
  else if (has(t, ADOPT_TH) || hasWord(lower, ADOPT_EN)) helpType = 'adopt';
  else if (has(t, INTAKE_TH) || hasWord(lower, INTAKE_EN) || (species !== 'unknown' && signals.length > 0)) helpType = 'intake';

  if (helpType === 'donate' && urgency === 'unknown') urgency = 'normal';

  const base = {
    helpType,
    species,
    ageGroup,
    urgency,
    signals,
    districtId: detectDistrict(t),
    needsVet: signals.includes('injured') || signals.includes('sick'),
  };
  return { ...base, summary: buildRulesSummary(base, locale), source: 'rules', ...(fallbackReason ? { fallbackReason } : {}) };
}

/** ผลที่ไม่มีข้อมูลพอให้สรุป */
export function isEmptyIntake(r: AssistIntakeResult): boolean {
  return r.species === 'unknown' && r.helpType === 'unknown' && r.signals.length === 0 && !r.districtId;
}
