/**
 * แผนช็อต C3 (DEMO_VIDEO.md หัวข้อ 4.3): หาเขตที่ “ที่ใกล้สุดที่เต็ม” เป็นผู้รับดูแลรายบุคคลหรือมูลนิธิสมมติ
 * ไม่ใช่สถานสงเคราะห์จริง (D10) โดยใช้ฟังก์ชันเดียวกับหน้า /nearby — ห้ามปรับข้อมูลเพื่อให้ตรงกับเรื่อง
 */
import type { DistrictId, HelperProfile, Species, Urgency } from '@/lib/types';
import { HELPERS } from '@/data';
import { DISTRICTS, getDistrict } from '@/data/districts';
import { assistByRules } from '@/lib/assist-rules';
import { helperBlocker, rankHelpers } from '@/lib/balancer';
import { distanceKm } from '@/lib/geo';
import { buildFindingSession, personaIdForRun } from '@/lib/run';
import { statusInfo } from '@/lib/status';

export interface CapturePlan {
  run: number;
  findingIndex: number;
  districtId: string;
  species: Species;
  urgency: Urgency;
  fullId: string;
  fullName: string;
  topId: string;
  topName: string;
  /** อันดับ 1 เป็น persona ของ Run (คุณใบเตย adopter-001) หรือไม่ */
  topIsPersona: boolean;
  districtName: string;
  candidatesTried: number;
}

const RADIUS_KM = 5;
const isRealOrg = (h: HelperProfile) => h.kind === 'shelter' && !h.isFictionalFoundation;

export function capturePlan(assistText: string, locale: 'th' | 'en' = 'th', run = 1, findingIndex = 2): CapturePlan | null {
  const intake = assistByRules(assistText, locale);
  const species: Species = intake.species === 'unknown' ? 'cat' : intake.species;
  const urgency: Urgency = intake.urgency === 'unknown' ? 'normal' : intake.urgency;
  const persona = personaIdForRun(run);
  const preferred: DistrictId[] = ['lat-phrao', 'chatuchak', 'huai-khwang', 'bang-kapi', 'din-daeng', 'wang-thonglang', 'bang-sue', 'phaya-thai'];
  const order = [...preferred, ...DISTRICTS.map((d) => d.id).filter((id) => !preferred.includes(id))];
  let fallback: CapturePlan | null = null;
  let tried = 0;
  for (const districtId of order) {
    tried += 1;
    const ses = buildFindingSession(run, findingIndex, 'district_choice', districtId, '');
    const rows = HELPERS
      .map((h) => ({ h, d: distanceKm(ses.searchPoint, h.location) }))
      .filter((r) => r.d <= RADIUS_KM && r.h.speciesAccepted.includes(species))
      .sort((a, b) => a.d - b.d || a.h.id.localeCompare(b.h.id));
    const nearestFull = rows.find((r) => statusInfo(r.h).level === 'full' && helperBlocker(r.h, species, urgency) === 'full');
    if (!nearestFull || isRealOrg(nearestFull.h)) continue;
    // ที่ที่เต็มซึ่งใกล้กว่านี้ต้องไม่ใช่องค์กรจริง
    if (rows.some((r) => r.d < nearestFull.d && statusInfo(r.h).level === 'full' && isRealOrg(r.h))) continue;
    const ranking = rankHelpers({ candidates: HELPERS, species, urgency, searchPoint: ses.searchPoint, radiusKm: null, excludeId: nearestFull.h.id });
    const top = ranking.items[0];
    if (!top) continue;
    const topHelper = HELPERS.find((h) => h.id === top.id)!;
    if (isRealOrg(topHelper)) continue;
    const plan: CapturePlan = {
      run, findingIndex, districtId, species, urgency,
      fullId: nearestFull.h.id, fullName: nearestFull.h.displayName,
      topId: top.id, topName: topHelper.displayName, topIsPersona: top.id === persona, candidatesTried: tried,
      districtName: (locale === 'en' ? getDistrict(districtId)?.nameEn : getDistrict(districtId)?.nameTh) ?? districtId,
    };
    if (plan.topIsPersona) return plan;
    fallback ??= plan;
  }
  return fallback;
}
