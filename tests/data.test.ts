import { describe, expect, it } from 'vitest';
import { ADOPTERS, HELPERS, LISTINGS, OWNERS, SHELTERS, STORIES, getHelper, getOwner } from '@/data';
import { DISTRICTS, getDistrict } from '@/data/districts';
import { SUPPLIES } from '@/data/supplies';
import { BRANDS } from '@/data/brands';
import { PACKAGES } from '@/data/packages';
import { DONATION_BASELINE } from '@/data/donation-baseline';
import { inBangkok } from '@/lib/geo';
import { availableSlots } from '@/lib/capacity';
import { statusLevel, supplyLevel } from '@/lib/status';
import { buildSimPlaces, SIM_SCENARIOS } from '@/lib/simulation';
import { canReceivePackages } from '@/lib/balancer';
import { readFileSync } from 'node:fs';

describe('ข้อมูล seed (PROMPT.md 10.4)', () => {
  it('ข้อ 1: ID ไม่ซ้ำข้ามทุก collection และจำนวน/รูปแบบถูกต้อง', () => {
    const ids = [...HELPERS.map((h) => h.id), ...OWNERS.map((o) => o.id), ...LISTINGS.map((l) => l.id), ...STORIES.map((s) => s.id), ...BRANDS.map((b) => b.id), ...PACKAGES.map((p) => p.id)];
    expect(new Set(ids).size).toBe(ids.length);
    expect(SHELTERS).toHaveLength(20);
    expect(ADOPTERS).toHaveLength(100);
    SHELTERS.forEach((s, i) => expect(s.id).toBe(`shelter-${String(i + 1).padStart(3, '0')}`));
    ADOPTERS.forEach((a, i) => expect(a.id).toBe(`adopter-${String(i + 1).padStart(3, '0')}`));
    expect(OWNERS.length).toBeGreaterThanOrEqual(12);
    expect(LISTINGS.filter((l) => l.type === 'lost').length).toBeGreaterThanOrEqual(12);
    expect(LISTINGS.filter((l) => l.type === 'found').length).toBeGreaterThanOrEqual(8);
    expect(LISTINGS.filter((l) => l.type === 'adoption').length).toBeGreaterThanOrEqual(6);
    expect(STORIES.filter((s) => s.outcome === 'adopted').length).toBeGreaterThanOrEqual(2);
    expect(STORIES.filter((s) => s.outcome === 'reunited').length).toBeGreaterThanOrEqual(2);
  });

  it('ข้อ 2: 0 ≤ currentCount ≤ capacityTotal และ capacityTotal > 0 เป็นจำนวนเต็ม', () => {
    for (const h of HELPERS) {
      expect(Number.isInteger(h.capacityTotal) && h.capacityTotal > 0).toBe(true);
      expect(Number.isInteger(h.currentCount) && h.currentCount >= 0 && h.currentCount <= h.capacityTotal).toBe(true);
    }
  });

  it('ข้อ 3: individual ไม่รับเงิน และ donationNote ไม่มีเลขบัญชี/URL/QR/พร้อมเพย์', () => {
    for (const h of HELPERS) {
      if (h.kind === 'individual') expect(h.donationsEnabled).toBe(false);
      if (h.donationNote) expect(/\d{3,}|https?:|www\.|QR|พร้อมเพย์|promptpay/i.test(h.donationNote)).toBe(false);
    }
  });

  it('ข้อ 4: พิกัดอยู่ในกรอบกรุงเทพฯ และเขตมีจริง', () => {
    for (const h of HELPERS) {
      expect(inBangkok(h.location)).toBe(true);
      expect(getDistrict(h.districtId)).toBeDefined();
    }
    for (const l of LISTINGS) expect(getDistrict(l.districtId)).toBeDefined();
    for (const o of OWNERS) expect(getDistrict(o.districtId)).toBeDefined();
    for (const d of DISTRICTS) expect(inBangkok(d.center)).toBe(true);
  });

  it('ข้อ 5: ทุกเขตมี helper อย่างน้อย 1 record', () => {
    const covered = new Set(HELPERS.map((h) => h.districtId));
    for (const d of DISTRICTS) expect(covered.has(d.id)).toBe(true);
    expect(DISTRICTS).toHaveLength(50);
  });

  it('ข้อ 6: การอ้างอิงถูกต้อง', () => {
    const credits = readFileSync('CREDITS.md', 'utf8');
    for (const l of LISTINGS) {
      if (l.type === 'lost') {
        expect(l.postedBy.kind).toBe('owner');
        expect(getOwner((l.postedBy as { id: string }).id)).toBeDefined();
      } else {
        expect(['shelter', 'individual']).toContain(l.postedBy.kind);
        expect(l.careHolderId).toBe((l.postedBy as { id: string }).id);
        expect(getHelper(l.careHolderId)).toBeDefined();
      }
      if (l.photo?.creditId) expect(credits).toContain(`\`${l.photo.creditId}\``);
    }
    for (const o of OWNERS) for (const id of o.listingIds) expect(LISTINGS.some((l) => l.id === id)).toBe(true);
    for (const s of STORIES) {
      if (s.helperId) expect(getHelper(s.helperId)?.kind).toBe('individual');
      if (s.photo.creditId) expect(credits).toContain(`\`${s.photo.creditId}\``);
    }
  });

  it('ข้อ 9: currentPets.length === currentCount และภาพ AI มี alt + creditId', () => {
    for (const a of ADOPTERS) {
      expect(a.currentPets?.length).toBe(a.currentCount);
      for (const img of [a.images.profile, a.images.home, a.images.pets]) {
        if (img?.aiGenerated) expect(img.alt && img.creditId).toBeTruthy();
      }
    }
  });

  it('ข้อ 10: acceptsSupplyPackages สอดคล้องกับกฎผู้รับรายบุคคล มูลนิธิทดลอง และบ้านพักชุมชน', () => {
    for (const h of HELPERS) {
      expect(!!h.acceptsSupplyPackages).toBe(canReceivePackages(h));
    }
  });

  it('ข้อ 11: supplies หนึ่ง record ต่อผู้รับแพ็กเกจ ช่วงค่าและ litter เฉพาะผู้รับแมว', () => {
    const eligible = ADOPTERS.filter((a) => a.acceptsSupplyPackages).map((a) => a.id).sort();
    expect(SUPPLIES.map((s) => s.helperId).sort()).toEqual(eligible);
    for (const s of SUPPLIES) {
      const h = getHelper(s.helperId)!;
      expect(s.foodDays).toBeGreaterThanOrEqual(0);
      expect(s.foodDays).toBeLessThanOrEqual(30);
      expect(s.litterDays !== undefined).toBe(h.speciesAccepted.includes('cat'));
    }
    const levels = SUPPLIES.map((s) => supplyLevel(s.foodDays, s.litterDays));
    expect(levels.filter((l) => l === 'critical').length).toBeGreaterThanOrEqual(10);
    expect(levels.filter((l) => l === 'low').length).toBeGreaterThanOrEqual(25);
  });

  it('ข้อ 12: แบรนด์มี flag ระบุว่าเป็นข้อมูลสมมติ แยกจากชื่อที่แสดง', () => {
    for (const b of BRANDS) {
      expect(b.isFictional).toBe(true);
      expect(b.name.th.trim() && b.name.en.trim()).toBeTruthy();
    }
  });

  it('ข้อ 13: LocalizedText ไม่ว่าง และเขตมีชื่ออังกฤษครบ', () => {
    const texts = [...BRANDS.map((b) => b.name), ...PACKAGES.flatMap((p) => [p.name, ...p.items])];
    for (const t of texts) expect(t.th.trim() && t.en.trim()).toBeTruthy();
    for (const d of DISTRICTS) expect(d.nameEn.trim()).toBeTruthy();
  });

  it('ข้อ 14: สถานที่จำลอง sim-a…sim-t ไม่มีชื่อหรือพิกัดขององค์กรจริง', () => {
    for (const sc of SIM_SCENARIOS) {
      const places = buildSimPlaces(sc);
      expect(places.map((p) => p.id)).toEqual('abcdefghijklmnopqrst'.split('').map((c) => `sim-${c}`));
      for (const p of places) {
        expect(inBangkok(p.location)).toBe(false);
        for (const s of SHELTERS) expect(p.label).not.toContain(s.displayName);
      }
    }
  });

  it('fixture: shelter-001 95/100 เปิดรับบริจาค · shelter-002 37/40 · เต็ม/ปิดบริจาค/ฉุกเฉิน', () => {
    const s1 = getHelper('shelter-001')!;
    expect([s1.currentCount, s1.capacityTotal, availableSlots(s1), s1.donationsEnabled, s1.demoVerified]).toEqual([95, 100, 5, true, true]);
    const s2 = getHelper('shelter-002')!;
    expect([s2.currentCount, s2.capacityTotal]).toEqual([37, 40]);
    expect(SHELTERS.some((s) => availableSlots(s) === 0)).toBe(true);
    expect(SHELTERS.some((s) => !s.donationsEnabled)).toBe(true);
    expect(SHELTERS.filter((s) => s.acceptsEmergency).length).toBeGreaterThanOrEqual(3);
    // องค์กรจริง (ไม่ใช่ช่องที่รอข้อมูล) ต้องไม่อยู่ในสถานะเต็ม
    for (const s of SHELTERS.filter((x) => !x.isPlaceholder)) expect(statusLevel(s)).not.toBe('full');
  });

  it('fixture: owner-001 นารา / listing-001 มะม่วง และประกาศชนิดอื่น ๆ', () => {
    expect(getOwner('owner-001')?.displayName).toBe('นารา');
    const l1 = LISTINGS.find((l) => l.id === 'listing-001')!;
    expect([l1.type, l1.species, l1.name, l1.districtId, l1.collar.detail]).toEqual(['lost', 'cat', 'มะม่วง', 'phra-khanong', 'red']);
    expect(l1.colors).toEqual(['orange', 'white']);
    for (const sp of ['cat', 'dog', 'other']) expect(LISTINGS.some((l) => l.type === 'lost' && l.species === sp)).toBe(true);
    const adoption = LISTINGS.filter((l) => l.type === 'adoption');
    expect(adoption.filter((l) => getHelper(l.careHolderId)?.kind === 'shelter').length).toBeGreaterThanOrEqual(3);
    expect(adoption.filter((l) => getHelper(l.careHolderId)?.kind === 'individual').length).toBeGreaterThanOrEqual(2);
    // ประกาศของสถานสงเคราะห์ผูกกับช่องที่รอข้อมูลเท่านั้น (ไม่สร้างกิจกรรมแทนองค์กรจริง)
    for (const l of LISTINGS) {
      const h = getHelper(l.careHolderId);
      if (h?.kind === 'shelter') expect(h.isPlaceholder).toBe(true);
    }
    const urgentFound = LISTINGS.filter((l) => l.type === 'found' && (l.urgency === 'soon' || l.urgency === 'emergency') && getHelper(l.careHolderId)?.kind === 'individual');
    expect(urgentFound.length).toBeGreaterThanOrEqual(3);
  });

  it('fixture: การกระจายผู้รับดูแลตาม CODEX_IMAGE_PROMPTS.md 5.1', () => {
    const fosterOnly = ADOPTERS.filter((a) => a.careModes.length === 1 && a.careModes[0] === 'foster').length;
    const adoptOnly = ADOPTERS.filter((a) => a.careModes.length === 1 && a.careModes[0] === 'adopt').length;
    expect([fosterOnly, adoptOnly, 100 - fosterOnly - adoptOnly]).toEqual([32, 22, 46]);
    expect(ADOPTERS.filter((a) => a.availability === 'unavailable').length).toBe(6);
    expect(ADOPTERS.filter((a) => availableSlots(a) === 0).map((a) => a.id)).toEqual(['adopter-012', 'adopter-020', 'adopter-024', 'adopter-046', 'adopter-050', 'adopter-060', 'adopter-063']);
  });

  it('ยอดจำลองตั้งต้น = ผลรวมจำนวน × ราคาตัวอย่าง', () => {
    const sum = DONATION_BASELINE.items.reduce((s, i) => s + i.count * i.unitPriceTHB, 0);
    expect(sum).toBe(DONATION_BASELINE.totalTHB);
    for (const i of DONATION_BASELINE.items) expect(PACKAGES.find((p) => p.id === i.packageId)?.priceTHB).toBe(i.unitPriceTHB);
  });
});
