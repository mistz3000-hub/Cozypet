/**
 * สร้างข้อมูลเสบียงสาธิตและยอดจำลองตั้งต้นครั้งเดียวด้วย seed คงที่ แล้ว commit ผลลัพธ์ (PROMPT.md 10.3, 10.4 ข้อ 7)
 *   node --experimental-strip-types scripts/data/generate-seeds.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { rngFromKey, seededInt, seededShuffle } from '../../src/lib/seeded-random.ts';

const src = readFileSync('src/data/adopters.generated.ts', 'utf8');
const adopters = JSON.parse(src.slice(src.indexOf('= [') + 2, src.lastIndexOf(']') + 1)) as Array<{
  id: string; availability: string; currentCount: number; speciesAccepted: string[];
}>;

const eligible = adopters.filter((a) => a.availability !== 'unavailable' && a.currentCount > 0);
const rng = rngFromKey('cozypet:v1:supplies');
const order = seededShuffle(eligible.map((a) => a.id), rng);
const byId = new Map(eligible.map((a) => [a.id, a]));

const CRITICAL = 12;
const LOW = 28;
const rows = order.map((id, i) => {
  const a = byId.get(id)!;
  const cats = a.speciesAccepted.includes('cat');
  let foodDays: number;
  let litterDays: number | undefined;
  if (i < CRITICAL) {
    foodDays = seededInt(rng, 1, 2);
    litterDays = cats ? seededInt(rng, 2, 9) : undefined;
  } else if (i < CRITICAL + LOW) {
    foodDays = seededInt(rng, 3, 6);
    litterDays = cats ? seededInt(rng, 3, 12) : undefined;
  } else {
    foodDays = seededInt(rng, 7, 30);
    litterDays = cats ? seededInt(rng, 7, 30) : undefined;
  }
  const recentPackages30d = i < CRITICAL ? seededInt(rng, 0, 2) : seededInt(rng, 0, 6);
  return { helperId: id, foodDays, ...(litterDays === undefined ? {} : { litterDays }), recentPackages30d, updatedAt: '2026-10-01T09:00:00+07:00' };
}).sort((x, y) => x.helperId.localeCompare(y.helperId));

writeFileSync('src/data/supplies.ts', `import type { HelperSupplies } from '@/lib/types';

/**
 * เสบียงสาธิตของผู้รับดูแลรายบุคคลที่ acceptsSupplyPackages (หนึ่ง record ต่อคน)
 * สร้างครั้งเดียวด้วย seed 'cozypet:v1:supplies' (scripts/data/generate-seeds.ts) — ไม่ใช่ข้อมูลจริง
 */
export const SUPPLIES: readonly HelperSupplies[] = ${JSON.stringify(rows, null, 2)};

const BY_ID = new Map(SUPPLIES.map((s) => [s.helperId, s]));
export function getSupplies(helperId: string): HelperSupplies | undefined {
  return BY_ID.get(helperId);
}
`);

const pkgSrc = readFileSync('src/data/packages.ts', 'utf8');
const pkgs = [...pkgSrc.matchAll(/id: '(pkg-[a-z0-9-]+)', brandId: '[^']+', species: \[[^\]]+\], priceTHB: (\d+)/g)].map((m) => ({ id: m[1], price: Number(m[2]) }));
const brng = rngFromKey('cozypet:v1:donation-baseline');
const baseline = pkgs.map((p) => ({ packageId: p.id, count: seededInt(brng, 20, 120), unitPriceTHB: p.price }));
const totalPackages = baseline.reduce((s, b) => s + b.count, 0);
const totalTHB = baseline.reduce((s, b) => s + b.count * b.unitPriceTHB, 0);

writeFileSync('src/data/donation-baseline.ts', `/**
 * ค่าตั้งต้นของ “ยอดแพ็กเกจที่ส่งถึงผู้ดูแล” บนแดชบอร์ด — **ยอดจำลองจากข้อมูลสมมติ** ไม่ใช่ตัวเลขที่ตั้งเองให้ดูดี
 * สร้างครั้งเดียวด้วย seed 'cozypet:v1:donation-baseline' จากแพ็กเกจและราคาตัวอย่าง (จำนวนแต่ละแบบ × ราคา)
 */
export const DONATION_BASELINE = {
  items: ${JSON.stringify(baseline, null, 2).replace(/\n/g, '\n  ')},
  totalPackages: ${totalPackages},
  totalTHB: ${totalTHB},
  /** เป้าตัวอย่างสำหรับแถบความคืบหน้า (สมมติ) */
  targetTHB: ${Math.ceil((totalTHB * 1.6) / 10000) * 10000},
} as const;
`);

console.log(`supplies: ${rows.length} (critical ${CRITICAL}, low ${LOW}) · baseline ${totalPackages} pkgs ฿${totalTHB}`);
