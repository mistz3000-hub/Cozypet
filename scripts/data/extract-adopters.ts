/**
 * ถอดข้อมูลผู้รับดูแลรายบุคคล 100 ราย จาก CODEX_IMAGE_PROMPTS.md หัวข้อ 5 → src/data/adopters.generated.ts
 * รันครั้งเดียวด้วย seed คงที่แล้ว commit ผลลัพธ์ (PROMPT.md 10.4 ข้อ 7, M2.5)
 *   node --experimental-strip-types scripts/data/extract-adopters.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { rngFromKey } from '../../src/lib/seeded-random.ts';

const md = readFileSync('CODEX_IMAGE_PROMPTS.md', 'utf8');
const section = md.slice(md.indexOf('### 5.2'), md.indexOf('## 6.'));
const blocks = section.split(/\n#### /).slice(1);

const districtsSrc = readFileSync('src/data/districts.ts', 'utf8');
const centers = new Map<string, { lat: number; lng: number }>();
for (const m of districtsSrc.matchAll(/id: '([a-z-]+)'.*?center: \{ lat: ([\d.]+), lng: ([\d.]+) \}/g)) {
  centers.set(m[1], { lat: Number(m[2]), lng: Number(m[3]) });
}

const HOME: Record<string, string> = {
  'คอนโด': 'condo', 'ตึกแถว': 'shophouse', 'ทาวน์เฮาส์': 'townhouse', 'บ้านเดี่ยว': 'house',
  'บ้านไม้': 'wooden_house', 'อพาร์ตเมนต์/ห้องเช่า': 'apartment',
};
const SPECIES: Record<string, string> = { 'แมว': 'cat', 'สุนัข': 'dog', 'กระต่าย': 'other' };

function row(block: string, label: string): string {
  const re = new RegExp(`^\\| ${label.replace(/[()/]/g, (c) => `\\${c}`)}[^|]*\\| (.*) \\|$`, 'm');
  const m = block.match(re);
  if (!m) throw new Error(`missing ${label} in ${block.slice(0, 40)}`);
  return m[1].trim();
}

function offsetPoint(id: string, center: { lat: number; lng: number }) {
  const rng = rngFromKey(`cozypet:v1:helper-location:${id}`);
  const bearing = rng() * Math.PI * 2;
  const meters = 250 + rng() * 1250;
  const dLat = (meters * Math.cos(bearing)) / 111_320;
  const dLng = (meters * Math.sin(bearing)) / (111_320 * Math.cos((center.lat * Math.PI) / 180));
  const r5 = (n: number) => Math.round(n * 1e5) / 1e5;
  return { lat: r5(center.lat + dLat), lng: r5(center.lng + dLng) };
}

const out: unknown[] = [];
for (const block of blocks) {
  const head = block.split('\n')[0];
  const hm = head.match(/^(adopter-\d{3}) · (.+?) · (หญิง|ชาย) (\d+) ปี · เขต(.+?) \(`([a-z-]+)`\)/);
  if (!hm) throw new Error(`bad header: ${head}`);
  const [, id, name, sexTh, age, , districtId] = hm;
  const center = centers.get(districtId);
  if (!center) throw new Error(`unknown district ${districtId}`);

  const homeLabel = block.match(/^\| บ้าน \(([^)]+)\) \| (.*) \|$/m);
  if (!homeLabel) throw new Error(`no home ${id}`);
  const occupation = row(block, 'อาชีพ / ไลฟ์สไตล์');
  const petsRaw = row(block, 'น้องที่ดูแลอยู่');
  const prefRaw = row(block, 'สนใจเป็นพิเศษ');
  const contactRaw = row(block, 'เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย');
  const dataRaw = row(block, 'ข้อมูลสำหรับ `src/data`');

  const pets = petsRaw === 'ยังไม่มี' ? [] : petsRaw.split('<br>').map((p) => {
    const m = p.match(/^(.+?): (\S+) · (.+?) · (.+?) · (ผู้|เมีย) (\d+) ปี$/);
    if (!m) throw new Error(`bad pet ${id}: ${p}`);
    return {
      name: m[1], species: SPECIES[m[2]] ?? (() => { throw new Error(`species ${m[2]}`); })(),
      breed: m[3], color: m[4], sex: m[5] === 'ผู้' ? 'male' : 'female', ageYears: Number(m[6]),
    };
  });

  const pm = prefRaw.match(/^สี: (.+?) · พันธุ์: (.+?) — (.+)$/);
  if (!pm) throw new Error(`bad pref ${id}: ${prefRaw}`);
  const [hours, particle] = contactRaw.split(' · ');

  const careModes = [...dataRaw.matchAll(/'(foster|adopt)'/g)].map((m) => m[1]);
  const speciesAccepted = [...(dataRaw.match(/speciesAccepted: \[([^\]]+)\]/)?.[1] ?? '').matchAll(/'(\w+)'/g)].map((m) => m[1]);
  const num = (k: string) => Number(dataRaw.match(new RegExp(`${k}: (\\d+)`))?.[1]);
  const availability = dataRaw.match(/availability: '(\w+)'/)?.[1];
  const acceptsEmergency = /acceptsEmergency: true/.test(dataRaw);
  const capacityTotal = num('capacityTotal');
  const currentCount = num('currentCount');
  if (pets.length !== currentCount) throw new Error(`pets mismatch ${id}`);

  out.push({
    id,
    displayName: name,
    sex: sexTh === 'หญิง' ? 'female' : 'male',
    age: Number(age),
    districtId,
    location: offsetPoint(id, center),
    occupation,
    home: { type: HOME[homeLabel[1]], summary: homeLabel[2] },
    currentPets: pets,
    preferences: { colors: pm[1].split(' / '), breeds: pm[2].split(' / '), reason: pm[3] },
    hours,
    politeParticle: particle,
    careModes,
    speciesAccepted,
    capacityTotal,
    currentCount,
    availability,
    acceptsEmergency,
  });
}

if (out.length !== 100) throw new Error(`expected 100, got ${out.length}`);

const header = `// สร้างอัตโนมัติจาก CODEX_IMAGE_PROMPTS.md หัวข้อ 5 ด้วย scripts/data/extract-adopters.ts (ห้ามแก้มือ)
// ผู้รับดูแลรายบุคคลทุกคนเป็นบุคคลสมมติ · พิกัด = จุดกึ่งกลางเขต + offset seeded ('cozypet:v1:helper-location:<id>')
import type { AdopterSource } from './adopter-source';

export const ADOPTER_SOURCE: readonly AdopterSource[] = `;
writeFileSync('src/data/adopters.generated.ts', `${header}${JSON.stringify(out, null, 2)};\n`);
console.log(`wrote ${out.length} adopters`);
