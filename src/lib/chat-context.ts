/**
 * ประกอบ COZYPET_CONTEXT (GEMINI_ROLEPLAY.md 1.3) จากข้อมูลฝั่ง server/seed เท่านั้น
 * ใช้ร่วมกันระหว่าง /api/chat (server) และคำตอบสำรองในเครื่อง (client) — ไม่มี secret
 * ห้ามรับข้อเท็จจริงของ persona ความจุ หรือสถานะบริจาคจาก browser
 */
import type { HelperProfile, Locale, PersonaRef, PetListing, Species, Urgency } from './types';
import { HELPERS, getHelper, getOwner, getSeedListing } from '@/data';
import { getDistrict } from '@/data/districts';
import { coatColor, collarColor } from '@/data/colors';
import { getSupplies } from '@/data/supplies';
import { availableSlots } from './capacity';
import { distanceKm } from './geo';
import { rankHelpers } from './balancer';
import { buildFindingSession } from './run';
import { statusInfo, supplyLevel } from './status';
import { handoffBlock, handoffModeFor } from './handoff';
import type { GeoPoint } from './types';

const SPECIES_TH: Record<Species, string> = { cat: 'แมว', dog: 'สุนัข', other: 'อื่น ๆ' };
const MODE_TH = { foster: 'อุปถัมภ์ชั่วคราว', adopt: 'รับเลี้ยงถาวร' } as const;
const AVAIL_TH = { available: 'พร้อมรับ', limited: 'รับได้จำกัด', unavailable: 'ปิดรับชั่วคราว' } as const;
const STATUS_TH = { open: 'รับได้', tight: 'ใกล้เต็ม', full: 'เต็ม' } as const;
const SUPPLY_TH = { ok: 'พอ', low: 'ใกล้หมด', critical: 'ขาดแคลน' } as const;
const TYPE_TH = { lost: 'สัตว์หาย', found: 'พบสัตว์', adoption: 'หาบ้าน' } as const;
const HANDOFF_MODE_TH = { intake: 'ส่งน้องเข้าดูแล', foster: 'อุปถัมภ์ชั่วคราว', adopt: 'รับเลี้ยงถาวร' } as const;

export interface ChatAlternative { id: string; displayName: string; districtName: string; availableSlots: number; distanceKm: number }

export interface ChatContext {
  contextVersion: 1;
  ui: { locale: Locale };
  persona: {
    ref: PersonaRef;
    displayName: string;
    roleLabel: string;
    speakerLabel: string;
    politeParticle: 'ค่ะ' | 'ครับ';
    tone: string;
    isFictional: boolean;
    isRealOrganization: boolean;
  };
  facts: Record<string, unknown>;
  topic: { listing: Record<string, unknown> | null };
  alternatives: ChatAlternative[];
  handoff: { available: boolean; modeLabel: string; reason: string | null } | null;
  location: { demoRegion: 'Bangkok'; searchDistrict: string; locationSource: 'mock'; distanceKm?: number };
  assistant: { disclosure: string; modelLabel: string | null };
  history: { truncated: boolean; omittedCount: number };
}

export interface ChatContextInput {
  persona: PersonaRef;
  listingId?: string | null;
  runNumber: number;
  findingIndex: number;
  /** เขตของรอบค้นหาที่ผู้ใช้เลือกเอง (ตัวระบุ ตรวจกับรายการ 50 เขต) */
  searchDistrictId?: string | null;
  locale: Locale;
  modelLabel?: string | null;
}

export function searchPointForContext(runNumber: number, findingIndex: number, searchDistrictId?: string | null): { point: GeoPoint; districtId: string } {
  const valid = searchDistrictId && getDistrict(searchDistrictId) ? searchDistrictId : undefined;
  const session = buildFindingSession(runNumber, Math.max(1, findingIndex), valid ? 'district_choice' : 'run_seed', valid, '1970-01-01T00:00:00Z');
  return { point: session.searchPoint, districtId: session.districtId };
}

/** ชนิดสัตว์ของหัวข้อแชต: จากประกาศ หรือชนิดแรกที่ผู้ช่วยดูแลรับ */
export function topicSpecies(listing: PetListing | undefined, helper: HelperProfile | undefined): Species {
  if (listing) return listing.species;
  if (helper?.speciesAccepted.includes('cat')) return 'cat';
  return helper?.speciesAccepted[0] ?? 'cat';
}

/** “ที่อื่นที่ยังรับได้” — ชุดเดียวกันทั้งหน้าจอ pop-up และบริบทแชต (AC-65) */
export function alternativesFor(excludeId: string, species: Species, searchPoint: GeoPoint, urgency: Urgency = 'normal', limit = 3) {
  return rankHelpers({ candidates: HELPERS, species, urgency, searchPoint, radiusKm: null, excludeId }).items.slice(0, limit);
}

function listingTopic(l: PetListing) {
  const collar = l.collar.status === 'yes'
    ? `มีปลอกคอ${collarColor(l.collar.detail)?.label.th ? `สี${collarColor(l.collar.detail)!.label.th}` : l.collar.detail ? ` (${l.collar.detail})` : ''}`
    : l.collar.status === 'no' ? 'ไม่มีปลอกคอ' : 'ไม่แน่ใจเรื่องปลอกคอ';
  return {
    id: l.id,
    type: TYPE_TH[l.type],
    petName: l.name ?? null,
    species: l.species === 'other' ? (l.speciesOther ?? SPECIES_TH.other) : SPECIES_TH[l.species],
    colors: l.colors.map((c) => coatColor(c)?.label.th ?? c),
    markings: l.markings ?? null,
    collar,
    districtName: getDistrict(l.districtId)?.nameTh ?? null,
    eventDate: l.eventAt.slice(0, 10),
    status: l.status === 'open' ? 'เปิดอยู่' : 'ปิดแล้ว',
  };
}

export function helperDisplayName(h: HelperProfile, locale: Locale): string {
  return locale === 'en' && h.displayNameEn ? h.displayNameEn : h.displayName;
}

/** คืน null เมื่อไม่พบ persona/listing (route ตอบ 404) */
export function buildChatContext(input: ChatContextInput): ChatContext | null {
  const { point, districtId: searchDistrictId } = searchPointForContext(input.runNumber, input.findingIndex, input.searchDistrictId);
  const searchDistrict = getDistrict(searchDistrictId)?.nameTh ?? '';
  const listing = input.listingId ? getSeedListing(input.listingId) : undefined;
  if (input.listingId && !listing && !input.listingId.startsWith('user-listing-')) return null;

  const base = {
    contextVersion: 1 as const,
    ui: { locale: input.locale },
    assistant: { disclosure: 'ผู้ช่วย AI ในเดโม Cozypet', modelLabel: input.modelLabel ?? null },
    history: { truncated: false, omittedCount: 0 },
  };

  if (input.persona.kind === 'owner') {
    const owner = getOwner(input.persona.id);
    if (!owner) return null;
    const own = getSeedListing(owner.listingIds[0]);
    return {
      ...base,
      persona: {
        ref: input.persona, displayName: owner.displayName, roleLabel: 'เจ้าของที่กำลังตามหาสัตว์', speakerLabel: owner.persona.speakerLabel,
        politeParticle: owner.persona.politeParticle, tone: owner.persona.tone, isFictional: true, isRealOrganization: false,
      },
      facts: { districtName: getDistrict(owner.districtId)?.nameTh ?? null, extraFacts: owner.persona.facts },
      topic: { listing: own ? listingTopic(own) : null },
      alternatives: [],
      handoff: null,
      location: { demoRegion: 'Bangkok', searchDistrict, locationSource: 'mock' },
    };
  }

  const helper = getHelper(input.persona.id);
  if (!helper || (input.persona.kind === 'shelter') !== (helper.kind === 'shelter')) return null;
  const species = topicSpecies(listing, helper);
  const slots = availableSlots(helper);
  const st = statusInfo(helper);
  const facts: Record<string, unknown> = {
    districtName: getDistrict(helper.districtId)?.nameTh ?? null,
    speciesAccepted: helper.speciesAccepted.map((s) => SPECIES_TH[s]),
    careModes: helper.careModes.map((m) => MODE_TH[m]),
    capacityTotal: helper.capacityTotal,
    currentCount: helper.currentCount,
    availableSlots: slots,
    isFull: slots === 0,
    availability: AVAIL_TH[helper.availability],
    acceptsEmergency: helper.acceptsEmergency,
    hours: helper.hours,
    conditions: helper.conditions,
    statusLabel: st.closed ? 'ปิดรับชั่วคราว' : STATUS_TH[st.level],
    demoVerified: helper.demoVerified,
    donationsEnabled: helper.donationsEnabled,
    extraFacts: helper.persona.facts,
  };
  if (helper.kind === 'shelter') {
    if (helper.donationNote) facts.donationNote = helper.donationNote;
  } else {
    facts.occupation = helper.occupation ?? null;
    facts.homeSummary = helper.home?.summary ?? null;
    facts.currentPets = (helper.currentPets ?? []).map((p) => `${p.name} — ${p.breed} สี${p.color} เพศ${p.sex === 'male' ? 'ผู้' : 'เมีย'} ${p.ageYears} ปี`);
    facts.preferences = helper.preferences ?? null;
    facts.acceptsSupplyPackages = !!helper.acceptsSupplyPackages;
    const sup = getSupplies(helper.id);
    if (helper.acceptsSupplyPackages && sup) {
      facts.supplies = { foodDays: sup.foodDays, litterDays: sup.litterDays ?? null, levelLabel: SUPPLY_TH[supplyLevel(sup.foodDays, sup.litterDays)] };
    }
  }

  const alternatives = alternativesFor(helper.id, species, point).map((r) => {
    const h = getHelper(r.id)!;
    return { id: h.id, displayName: h.displayName, districtName: getDistrict(h.districtId)?.nameTh ?? '', availableSlots: availableSlots(h), distanceKm: r.distanceKm ?? 0 };
  });

  const block = handoffBlock(helper, species);
  const reasonTh = block === 'full' ? 'เต็มแล้ว' : block === 'unavailable' ? 'ปิดรับชั่วคราว' : block === 'species' ? `รับเฉพาะ${helper.speciesAccepted.map((s) => SPECIES_TH[s]).join('และ')}` : null;

  return {
    ...base,
    persona: {
      ref: input.persona,
      displayName: helper.displayName,
      roleLabel: helper.kind === 'shelter' ? (helper.isPlaceholder ? 'สถานสงเคราะห์ (ช่องที่รอข้อมูลองค์กรจริง)' : 'สถานสงเคราะห์ (องค์กรจริง)') : 'ผู้รับดูแลรายบุคคล',
      speakerLabel: helper.persona.speakerLabel,
      politeParticle: helper.persona.politeParticle,
      tone: helper.persona.tone,
      isFictional: helper.kind !== 'shelter',
      isRealOrganization: helper.kind === 'shelter',
    },
    facts,
    topic: { listing: listing ? listingTopic(listing) : null },
    alternatives,
    handoff: { available: block === null, modeLabel: HANDOFF_MODE_TH[handoffModeFor(helper)], reason: reasonTh },
    location: { demoRegion: 'Bangkok', searchDistrict, locationSource: 'mock', distanceKm: distanceKm(point, helper.location) },
  };
}
