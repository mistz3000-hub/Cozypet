/**
 * คำตอบสำรอง (บทสนทนาตัวอย่าง) — GEMINI_ROLEPLAY.md หัวข้อ 4
 * deterministic ใช้ได้ทั้ง server และ client ไม่มี secret ทำตามกติกาเดียวกับ AI (ไม่แต่งข้อมูล ไม่รับปาก ไม่มีช่องทางเงิน)
 */
import type { ChatContext } from './chat-context';
import { getHelper, getSeedListing } from '@/data';
import { DISTRICTS, getDistrict } from '@/data/districts';
import { coatColor, collarColor } from '@/data/colors';
import { isMostlyLatin } from './assist-rules';

export type FallbackIntent =
  | 'system' | 'personal' | 'health' | 'ai_or_human' | 'identity' | 'request_status' | 'handoff'
  | 'current_pets' | 'donate' | 'capacity' | 'appointment' | 'location' | 'markings' | 'general';

const PROVINCES = [
  'เชียงใหม่', 'เชียงราย', 'ลพบุรี', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'ขอนแก่น', 'ภูเก็ต', 'ชลบุรี', 'พัทยา', 'นครราชสีมา', 'โคราช',
  'อยุธยา', 'สงขลา', 'หาดใหญ่', 'อุดรธานี', 'อุบลราชธานี', 'พิษณุโลก', 'นครปฐม', 'ระยอง', 'สุราษฎร์ธานี', 'กระบี่', 'ต่างจังหวัด',
];
const PROVINCES_EN = ['chiang mai', 'chiang rai', 'lopburi', 'nonthaburi', 'pathum thani', 'samut prakan', 'khon kaen', 'phuket', 'chonburi', 'pattaya', 'korat', 'ayutthaya', 'hat yai', 'udon thani'];

interface IntentRule { intent: FallbackIntent; th: string[]; en: string[]; re?: RegExp }

const RULES: IntentRule[] = [
  { intent: 'system', th: ['คำสั่งระบบ', 'ลืมคำสั่ง', 'ลืมกติกา'], en: ['system prompt', 'ignore previous', 'ignore all', 'api key', 'your instructions', 'prompt'] },
  { intent: 'personal', th: ['เบอร์', 'โทรหา', 'ที่อยู่', 'บ้านเลขที่', 'ไลน์', 'อีเมล'], en: ['phone number', 'my number', 'call me', 'address', 'email', 'line id'] },
  { intent: 'health', th: ['เจ็บ', 'เลือด', 'ป่วย', 'รถชน', 'ไม่กินข้าว', 'กัด', 'ข่วน', 'อาเจียน', 'ชัก'], en: ['hurt', 'injured', 'bleeding', 'blood', 'sick', 'ate', 'bite', 'bitten', 'scratched', 'vomit', 'poison'], re: /กิน.+เข้าไป/ },
  { intent: 'ai_or_human', th: ['เอไอ', 'บอท', 'คนจริง', 'เป็นคนไหม', 'หุ่นยนต์'], en: ['ai', 'bot', 'human', 'real person', 'robot'] },
  { intent: 'identity', th: ['คุณคือใคร', 'ชื่ออะไร', 'เป็นใคร', 'เจ้าหน้าที่', 'ทางมูลนิธิ', 'แทนทาง'], en: ['who are you', 'your name', 'staff', 'on behalf'] },
  { intent: 'request_status', th: ['อนุมัติ', 'ผ่านไหม', 'คำขอ'], en: ['approve', 'approved', 'request status', 'my request'] },
  { intent: 'handoff', th: ['ตกลง', 'รับน้องไหม', 'ฝากน้อง', 'ส่งต่อ', 'รับไปดูแล', 'รับน้องไปดูแล'], en: ['take the pet', 'take her', 'take him', 'hand over', 'handoff', 'agree to take'] },
  { intent: 'current_pets', th: ['ที่บ้านมี', 'เลี้ยงอะไร', 'น้องที่บ้าน', 'บ้านเป็นแบบไหน'], en: ['your pets', 'pets at home', 'what pets', 'your home'] },
  { intent: 'donate', th: ['บริจาค', 'โอน', 'บัญชี', 'พร้อมเพย์', 'ขาดอะไร', 'ของใช้', 'แพ็กเกจ', 'อาหารเหลือ', 'เงิน'], en: ['donate', 'donation', 'money', 'transfer', 'bank', 'qr', 'supplies', 'package', 'need anything'] },
  { intent: 'capacity', th: ['รับเพิ่ม', 'ว่าง', 'เต็ม', 'กี่ตัว', 'รับได้ไหม', 'วิกฤต'], en: ['space', 'full', 'how many', 'capacity', 'room for'] },
  { intent: 'appointment', th: ['นัด', 'ไปรับ', 'ไปส่ง', 'กี่โมง', 'พรุ่งนี้', 'ค่าเดินทาง', 'ค่ารถ', 'รางวัล'], en: ['meet', 'pick up', 'drop off', 'tomorrow', 'travel cost', 'reward', 'appointment', 'what time'] },
  { intent: 'location', th: ['อยู่ตรงไหน', 'ตำแหน่ง', 'จังหวัด', ...PROVINCES], en: ['gps', 'where am i', 'location', 'province', ...PROVINCES_EN] },
  { intent: 'markings', th: ['จุดสังเกต', 'ปลอกคอ', 'สี', 'ลาย', 'ใช่น้อง', 'ใช่ไหม'], en: ['marks', 'collar', 'color', 'colour', 'is it', 'same pet'] },
];

function wordRe(w: string) {
  return new RegExp(`(^|[^a-z])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`, 'i');
}

export function detectIntent(message: string, personaKind: 'owner' | 'shelter' | 'individual'): FallbackIntent {
  const text = message.trim();
  const lower = text.toLowerCase();
  for (const r of RULES) {
    if (r.intent === 'handoff' && personaKind === 'owner') continue;
    if (r.intent === 'current_pets' && personaKind !== 'individual') continue;
    if (r.intent === 'markings' && personaKind !== 'owner') continue;
    if (r.th.some((w) => text.includes(w)) || r.en.some((w) => wordRe(w).test(lower)) || (r.re && r.re.test(text))) return r.intent;
  }
  return 'general';
}

export function replyLocale(ctx: ChatContext, message: string): 'th' | 'en' {
  const t = message.trim();
  if (!t) return ctx.ui.locale;
  if (isMostlyLatin(t)) return 'en';
  if (/[฀-๿]/.test(t)) return 'th';
  return ctx.ui.locale;
}

interface Vars {
  name: string; p: string; q: string; district: string; petName: string; petDistrict: string; species: string; colors: string;
  collarText: string; current: number; total: number; slots: number; searchDistrict: string; handoffReason: string;
  petsList: string; homeSummary: string; altName: string | null; altKm: number | null; altSlots: number | null; foodDays: number | null; pronoun: string;
  statusLabel: string;
}

function buildVars(ctx: ChatContext, lang: 'th' | 'en'): Vars {
  const f = ctx.facts as Record<string, unknown>;
  const p = ctx.persona.politeParticle;
  const ref = ctx.persona.ref;
  const helper = ref.kind !== 'owner' ? getHelper(ref.id) : undefined;
  const listingId = (ctx.topic.listing?.id as string | undefined) ?? undefined;
  const listing = getSeedListing(listingId);
  const alt = ctx.alternatives[0];
  const altHelper = alt ? getHelper(alt.id) : undefined;
  const en = lang === 'en';
  const districtOf = (id?: string) => (id ? (en ? getDistrict(id)?.nameEn : getDistrict(id)?.nameTh) ?? '' : '');
  const speciesWord = listing
    ? (en ? (listing.species === 'cat' ? 'cat' : listing.species === 'dog' ? 'dog' : 'pet') : (ctx.topic.listing?.species as string) ?? '')
    : '';
  const colors = listing ? listing.colors.map((c) => (en ? coatColor(c)?.label.en : coatColor(c)?.label.th) ?? c).join(en ? ' and ' : 'และ') : '';
  const collar = listing && listing.collar.status === 'yes' ? collarColor(listing.collar.detail) : undefined;
  const collarText = listing?.collar.status === 'yes'
    ? (en ? ` and a ${collar ? `${collar.label.en} ` : ''}collar` : ` ใส่ปลอกคอ${collar ? `สี${collar.label.th}` : ''}`)
    : '';
  const searchDistrictId = districtIdByName(ctx.location.searchDistrict);
  return {
    name: en && helper?.displayNameEn ? helper.displayNameEn : ctx.persona.displayName,
    p,
    q: p === 'ค่ะ' ? 'คะ' : 'ครับ',
    district: helper ? districtOf(helper.districtId) : (f.districtName as string) ?? '',
    petName: listing?.name ?? (en ? 'the pet' : 'น้อง'),
    petDistrict: listing ? districtOf(listing.districtId) : '',
    species: speciesWord,
    colors,
    collarText,
    current: Number(f.currentCount ?? 0),
    total: Number(f.capacityTotal ?? 0),
    slots: Number(f.availableSlots ?? 0),
    searchDistrict: en && searchDistrictId ? (getDistrict(searchDistrictId)?.nameEn ?? ctx.location.searchDistrict) : ctx.location.searchDistrict,
    handoffReason: en ? handoffReasonEn(ctx.handoff?.reason ?? null) : (ctx.handoff?.reason ?? ''),
    petsList: helper?.currentPets?.length
      ? helper.currentPets.map((x) => (en ? `${x.name} (${x.species === 'cat' ? 'cat' : x.species === 'dog' ? 'dog' : 'pet'}, ${x.color})` : `${x.name} (${x.breed} สี${x.color})`)).join(en ? ' and ' : ' กับ ')
      : '',
    homeSummary: helper?.home?.summary ?? '',
    altName: alt ? (en && altHelper?.displayNameEn ? altHelper.displayNameEn : alt.displayName) : null,
    altKm: alt ? alt.distanceKm : null,
    altSlots: alt ? alt.availableSlots : null,
    foodDays: (f.supplies as { foodDays?: number } | undefined)?.foodDays ?? null,
    pronoun: listing?.sex === 'male' ? 'He' : listing?.sex === 'female' ? 'She' : 'They',
    statusLabel: String(f.statusLabel ?? ''),
  };
}

/** ค้น id จากชื่อไทย (ใช้กับ searchDistrict ใน context) */
function districtIdByName(nameTh: string): string | undefined {
  return DISTRICTS.find((d) => d.nameTh === nameTh)?.id;
}

function handoffReasonEn(reason: string | null): string {
  if (!reason) return '';
  if (reason === 'เต็มแล้ว') return 'it is full';
  if (reason === 'ปิดรับชั่วคราว') return 'it is temporarily closed';
  if (reason.startsWith('รับเฉพาะ')) return 'it only accepts other species';
  return 'it does not match the conditions';
}

export function fallbackReply(ctx: ChatContext, message: string): string {
  const lang = replyLocale(ctx, message);
  const kind = ctx.persona.ref.kind;
  const intent = detectIntent(message, kind);
  const v = buildVars(ctx, lang);
  return lang === 'en' ? templateEn(intent, ctx, v) : templateTh(intent, ctx, v, message);
}

function templateTh(intent: FallbackIntent, ctx: ChatContext, v: Vars, message: string): string {
  const { p, q } = v;
  const kind = ctx.persona.ref.kind;
  const real = ctx.persona.isRealOrganization;
  const f = ctx.facts as Record<string, unknown>;
  switch (intent) {
    case 'system':
      return `ขอโทษ${p} ข้อนี้บอกไม่ได้ ถ้ามีเรื่องน้องที่อยากให้ช่วย บอกได้เลยนะ${q}`;
    case 'personal':
      return `ไม่ต้องใส่เบอร์โทรหรือที่อยู่จริงในเดโมนะ${q} ตอนนี้ยังโทรหรือติดต่อนอกแชตนี้ไม่ได้${p}`;
    case 'health':
      return `ถ้าน้องบาดเจ็บหรือไม่สบาย แนะนำให้พาไปสัตวแพทย์โดยเร็วที่สุด อย่าให้ยาเองนะ${q} ถ้าคุณถูกกัดหรือข่วน ให้ล้างแผลด้วยน้ำสะอาดและพบแพทย์${p}`;
    case 'ai_or_human':
      return `ตอนนี้เป็นบทสนทนาตัวอย่างของ Cozypet ที่ตอบในบท${v.name}${p} ไม่ใช่คนจริงพิมพ์ตอบ และข้อความนี้ยังไม่ได้ใช้ผู้ช่วย AI${p}`;
    case 'identity':
      if (kind === 'owner') return `ฉันชื่อ${v.name}${p} เป็นเจ้าของ${v.petName}ที่หายแถว${v.petDistrict}${p}`;
      if (real) return `ฉันเป็นผู้ช่วย AI ของ Cozypet ที่ให้ข้อมูลสาธิตเกี่ยวกับ${v.name} ไม่ใช่เจ้าหน้าที่ของที่นี่${p} ติดต่อจริงได้จากลิงก์ทางการในหน้าสถานที่${p}`;
      return `ฉันชื่อ${v.name} เป็นผู้รับดูแลรายบุคคลในเขต${v.district}${p}`;
    case 'request_status':
      return `คำขอทุกชนิดใน Cozypet เดโมอยู่ในสถานะรอการติดต่อ (demo) เท่านั้น ยังไม่มีการอนุมัติจริง${p}`;
    case 'handoff':
      if (ctx.handoff?.available) {
        return real
          ? `ตามข้อมูลสาธิต${v.name}ยังรับได้${p} กด “ยืนยันส่งต่อน้อง (จำลอง)” เพื่อดูผลลัพธ์จำลองได้เลย โดยไม่ได้ติดต่อ${v.name}จริง${p}`
          : `ยินดีรับดูแลน้องตามเงื่อนไขในข้อมูลตัวอย่าง${p} ถ้าพร้อม กดปุ่ม “ยืนยันส่งต่อน้อง (จำลอง)” ได้เลยนะ${q}`;
      }
      return `ตอนนี้ยังรับน้องไม่ได้ เพราะ${v.handoffReason}${p} ${v.altName ? `ลองดู${v.altName}ที่ยังรับได้นะ${q}` : `ลองดูรายการในหน้า “ค้นหา” นะ${q}`}`;
    case 'current_pets':
      return v.petsList
        ? `ตอนนี้ดูแล${v.petsList}อยู่${p} ที่บ้านเป็น${v.homeSummary}${p}`
        : `ตอนนี้ยังไม่มีน้องในความดูแล ที่บ้านเป็น${v.homeSummary}${p}`;
    case 'donate': {
      if (kind === 'owner') return `เดโมนี้ไม่มีการรับหรือโอนเงิน และ Cozypet จะไม่ขอให้โอนเงินเพื่อรับน้องคืน${p}`;
      if (kind === 'shelter') {
        const status = /วิกฤต|สถานะ|ด่วน/.test(message) ? `ตามข้อมูลสาธิต ที่นี่อยู่ในสถานะ “${v.statusLabel}”${p} ` : '';
        return f.donationsEnabled
          ? `${status}ป้าย “เปิดรับบริจาค” เป็นสถานะสาธิต${p} Cozypet เดโมไม่มีเลขบัญชี QR หรือช่องทางรับเงิน ถ้าอยากสนับสนุนจริง ดูช่องทางทางการของ${v.name}จากลิงก์ในหน้าสถานที่${p}`
          : `${status}ตอนนี้ไม่มีการรับบริจาค และเดโมนี้ไม่มีช่องทางรับเงินจริง${p} ข้อมูลจริงดูได้จากลิงก์ทางการในหน้าสถานที่${p}`;
      }
      if (f.acceptsSupplyPackages && v.foodDays !== null) {
        return `ไม่รับเงินหรือการโอนนะ${q} ถ้าอยากช่วย กดปุ่ม “ส่งแพ็กเกจของใช้ (จำลอง)” ในหน้าโปรไฟล์ได้ ตอนนี้อาหารเหลือประมาณ ${v.foodDays} วัน (ข้อมูลสาธิต)${p}`;
      }
      return `ตอนนี้ไม่มีการรับบริจาค และเดโมนี้ไม่มีช่องทางรับเงินจริง${p}`;
    }
    case 'capacity':
      if (kind === 'owner') return `ข้อนี้ไม่มีข้อมูลในเดโม${p}`;
      if (v.slots > 0 && f.availability !== 'ปิดรับชั่วคราว') {
        return real
          ? `ตามข้อมูลสาธิตใน Cozypet ที่นี่ดูแลอยู่ ${v.current} จาก ${v.total} ตัว รับเพิ่มได้อีก ${v.slots} ตัว${p} (ไม่ใช่ข้อมูลจริงขององค์กร)`
          : `ตอนนี้ดูแลอยู่ ${v.current} จาก ${v.total} ตัว รับเพิ่มได้อีก ${v.slots} ตัว${p} (ข้อมูลสาธิต ไม่ใช่ข้อมูลจริงของสถานที่)`;
      }
      return `${real ? 'ตามข้อมูลสาธิต ที่นี่' : 'ตอนนี้'}${v.slots > 0 ? 'ปิดรับชั่วคราว' : 'เต็มแล้ว'}${p} ${v.altName ? `ลองดู${v.altName} ห่างจากจุดค้นหาตัวอย่างประมาณ ${v.altKm} กม. ยังรับได้ ${v.altSlots} ตัว${p}` : `ลองดูรายการในหน้า “ค้นหา” นะ${q}`}`;
    case 'appointment':
      return `ยังยืนยันนัดหรือค่าใช้จ่ายผ่านแชตนี้ไม่ได้${p} ใช้ปุ่มส่งคำขอในเว็บได้ แล้วสถานะจะเป็นรอการติดต่อ (demo) และถ้าจะนัดเจอ แนะนำเป็นที่สาธารณะนะ${q}`;
    case 'location':
      return `เดโมนี้ค้นหาได้เฉพาะในกรุงเทพฯ${p} ตอนนี้จุดค้นหาในแอปอยู่เขต${v.searchDistrict} ซึ่งเป็นตำแหน่งตัวอย่าง ไม่ใช่ GPS จริง${p}`;
    case 'markings':
      return `${v.petName}เป็น${v.species}สี${v.colors}${v.collarText}${p} น้องที่คุณเจออาจเป็น${v.petName} แต่ยังบอกไม่ได้ว่าใช่แน่นอน ช่วยบอกจุดสังเกตอื่นเพิ่มได้ไหม${q} ถ้าจะนัดเจอ แนะนำเป็นที่สาธารณะนะ${q}`;
    default:
      return kind === 'owner'
        ? `ขอบคุณที่ทักมานะ${q} ตอนนี้เป็นบทสนทนาตัวอย่าง ช่วยได้เฉพาะเรื่องน้อง ๆ ใน Cozypet${p} ถ้าเห็นน้องที่คล้าย${v.petName} ช่วยเล่าจุดสังเกตหน่อยได้ไหม${q}`
        : `ขอบคุณที่ทักมานะ${q} ตอนนี้เป็นบทสนทนาตัวอย่าง ช่วยได้เฉพาะเรื่องน้อง ๆ ใน Cozypet${p} ถามเรื่องความพร้อม เงื่อนไข หรือการส่งคำขอดูแลน้องได้เลย${p}`;
  }
}

function templateEn(intent: FallbackIntent, ctx: ChatContext, v: Vars): string {
  const kind = ctx.persona.ref.kind;
  const real = ctx.persona.isRealOrganization;
  const f = ctx.facts as Record<string, unknown>;
  switch (intent) {
    case 'system':
      return 'Sorry, I can’t share that. If there’s a pet you’d like help with, just tell me.';
    case 'personal':
      return 'Please don’t share your real phone number or address in this demo. I can’t call or contact anyone outside this chat.';
    case 'health':
      return 'If the animal is hurt or unwell, please take it to a vet as soon as possible and don’t give it medicine yourself. If you were bitten or scratched, wash the wound with clean water and see a doctor.';
    case 'ai_or_human':
      return `This is a sample Cozypet conversation answering as ${v.name}. It’s not a real person typing, and this message didn’t use the AI assistant.`;
    case 'identity':
      if (kind === 'owner') return `I’m ${v.name}, ${v.petName}’s owner. ${v.pronoun} went missing around ${v.petDistrict}.`;
      if (real) return `I’m Cozypet’s AI assistant sharing demo information about ${v.name}. I’m not their staff; please use the official link on the place page to contact them.`;
      return `I’m ${v.name}, an individual caregiver in ${v.district}.`;
    case 'request_status':
      return 'Every request in the Cozypet demo stays “waiting for contact (demo)”. Nothing is actually approved.';
    case 'handoff':
      if (ctx.handoff?.available) {
        return real
          ? `According to the demo data, ${v.name} can still take one. Tap “Confirm handoff (simulated)” to see a simulated result; ${v.name} isn’t actually contacted.`
          : 'I’d be happy to care for the pet under the conditions in the sample data. When you’re ready, tap “Confirm handoff (simulated)”.';
      }
      return `I can’t take the pet right now because ${v.handoffReason}. ${v.altName ? `You could try ${v.altName}, which still has space.` : 'Please check the list on the “Search” tab.'}`;
    case 'current_pets':
      return v.petsList
        ? `I’m caring for ${v.petsList} right now. My home is: ${v.homeSummary}.`
        : `I’m not caring for any pets right now. My home is: ${v.homeSummary}.`;
    case 'donate':
      if (kind === 'owner') return 'This demo has no payments, and Cozypet will never ask you to transfer money to get a pet back.';
      if (kind === 'shelter') {
        return f.donationsEnabled
          ? `The “accepting donations” label is demo data. Cozypet’s demo has no bank account, QR code, or payment channel. To support them for real, please use ${v.name}’s official link on the place page.`
          : 'There are no donations right now, and this demo has no real payment channel.';
      }
      if (f.acceptsSupplyPackages && v.foodDays !== null) {
        return `I don’t accept money or transfers. If you’d like to help, tap “Send a supply package (simulated)” on my profile. Food lasts about ${v.foodDays} more days (demo data).`;
      }
      return 'There are no donations right now, and this demo has no real payment channel.';
    case 'capacity':
      if (kind === 'owner') return 'That isn’t in the demo data.';
      if (v.slots > 0 && f.availability !== 'ปิดรับชั่วคราว') {
        return `${real ? 'According to Cozypet’s demo data, this place is' : 'I’m'} caring for ${v.current} of ${v.total} right now and can take ${v.slots} more (demo data, not the real figures).`;
      }
      return `${real ? 'According to the demo data, this place is' : 'I’m'} ${v.slots > 0 ? 'temporarily closed' : 'full'} right now. ${v.altName ? `You could try ${v.altName}, about ${v.altKm} km from the sample search point, which can take ${v.altSlots} more.` : 'Please check the list on the “Search” tab.'}`;
    case 'appointment':
      return 'I can’t confirm meetings or costs in this chat. You can send a request in the app, and it will show “waiting for contact (demo)”. If you meet, please choose a public place.';
    case 'location':
      return `This demo only searches within Bangkok. The app’s search point is currently in ${v.searchDistrict}, a sample location, not your real GPS.`;
    case 'markings':
      return `${v.petName} is a ${v.species} with ${v.colors} fur${v.collarText}. The pet you found might be ${v.petName}, but I can’t be sure yet. Could you tell me any other distinctive marks? If you meet, please choose a public place.`;
    default:
      return kind === 'owner'
        ? `Thanks for reaching out! This is a sample conversation, and I can only help with pets on Cozypet. If you’ve seen a pet like ${v.petName}, could you describe its marks?`
        : 'Thanks for reaching out! This is a sample conversation, and I can only help with pets on Cozypet. Feel free to ask about availability, conditions, or how to send a care request.';
  }
}
