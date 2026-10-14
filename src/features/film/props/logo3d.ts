/**
 * โลโก้ 3 มิติ (ตัว C หางแมวขดรอบหน้าแมว บนช่องสี่เหลี่ยมมนสีทอง) สร้างจากตัวเลขชุดเดียวกับ SVG ในแอป (src/lib/brand.ts)
 * หางเป็นท่อกลมความหนาไม่เท่ากัน (โคนหนา ปลายเรียว) · ประกอบทีละชิ้นด้วย setBuild(0..1): ช่องทอง → หางวาดตัวเองจากโคนถึงปลาย → ตา → จมูก
 */
import * as THREE from 'three';
import { LOGO, logoTail } from '@/lib/brand';
import { clamp, ease } from '../timeline';

const prog = (p: number, a: number, b: number) => clamp((p - a) / (b - a));

/** รูปหลายเหลี่ยมนูนขยายออกด้วยมุมมน (เหมือน stroke-linejoin: round) */
function roundedPolygon(pts: [number, number][], r: number): THREE.Shape {
  // ให้เรียงทวนเข็ม (ในพิกัดโลก y ขึ้น)
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    area += x1 * y2 - x2 * y1;
  }
  const P = area < 0 ? [...pts].reverse() : pts;
  const s = new THREE.Shape();
  const n = P.length;
  for (let i = 0; i < n; i++) {
    const prev = P[(i + n - 1) % n];
    const cur = P[i];
    const next = P[(i + 1) % n];
    const a0 = Math.atan2(cur[1] - prev[1], cur[0] - prev[0]) - Math.PI / 2;
    let a1 = Math.atan2(next[1] - cur[1], next[0] - cur[0]) - Math.PI / 2;
    while (a1 < a0) a1 += Math.PI * 2;
    const sx = cur[0] + Math.cos(a0) * r;
    const sy = cur[1] + Math.sin(a0) * r;
    if (i === 0) s.moveTo(sx, sy);
    else s.lineTo(sx, sy);
    s.absarc(cur[0], cur[1], r, a0, a1, false);
  }
  s.closePath();
  return s;
}

/** ท่อกลมตามเส้นโค้งระนาบ XY ความหนาเปลี่ยนตามจุด (squashZ = แบนลงตามแกน z) */
function tailTube(pts: THREE.Vector3[], radii: number[], radial: number, squashZ = 1): THREE.BufferGeometry {
  const pos: number[] = [];
  const nor: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const t = new THREE.Vector3().subVectors(b, a).normalize();
    const n = new THREE.Vector3(-t.y, t.x, 0);
    const bz = new THREE.Vector3(0, 0, 1);
    for (let j = 0; j <= radial; j++) {
      const ang = (j / radial) * Math.PI * 2;
      const dir = n.clone().multiplyScalar(Math.cos(ang)).add(bz.clone().multiplyScalar(Math.sin(ang)));
      const p = pts[i].clone().add(new THREE.Vector3(dir.x * radii[i], dir.y * radii[i], dir.z * radii[i] * squashZ));
      pos.push(p.x, p.y, p.z);
      nor.push(dir.x, dir.y, dir.z / Math.max(0.3, squashZ));
    }
  }
  for (let i = 0; i < pts.length - 1; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j;
      const b = a + radial + 1;
      idx.push(a, a + 1, b, b, a + 1, b + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  g.normalizeNormals();
  return g;
}

export class Logo3D {
  group = new THREE.Group();
  private tile: THREE.Mesh;
  private ring: THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>;
  private ringCount = 0;
  private caps: THREE.Mesh[] = [];
  private eyes: THREE.Mesh[] = [];
  private nose: THREE.Mesh;
  private markZ: number;
  readonly size: number;

  /** size = ความกว้างของช่องทองในหน่วยโลก */
  constructor(size = 2.4, opts: { tile?: boolean; inkColor?: string; tileColor?: string } = {}) {
    this.size = size;
    const k = size / LOGO.tile.size;
    const X = (x: number) => (x - LOGO.view / 2) * k;
    const Y = (y: number) => -(y - LOGO.view / 2) * k;
    const depth = size * 0.11;
    const ink = new THREE.MeshPhysicalMaterial({ color: opts.inkColor ?? '#2b2118', roughness: 0.5, clearcoat: 0.45, clearcoatRoughness: 0.35, envMapIntensity: 0.22 });
    const tileShape = (() => {
      const w = LOGO.tile.size * k;
      const r = LOGO.tile.radius * k;
      const s = new THREE.Shape();
      const x = -w / 2;
      const y = -w / 2;
      s.moveTo(x + r, y);
      s.lineTo(x + w - r, y);
      s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
      s.lineTo(x + w, y + w - r);
      s.absarc(x + w - r, y + w - r, r, 0, Math.PI / 2, false);
      s.lineTo(x + r, y + w);
      s.absarc(x + r, y + w - r, r, Math.PI / 2, Math.PI, false);
      s.lineTo(x, y + r);
      s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
      return s;
    })();
    const bevel = size * 0.045;
    const tileGeo = new THREE.ExtrudeGeometry(tileShape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 10, curveSegments: 32 });
    tileGeo.translate(0, 0, -depth);
    this.tile = new THREE.Mesh(tileGeo, new THREE.MeshPhysicalMaterial({ color: opts.tileColor ?? '#e9a300', roughness: 0.42, metalness: 0.05, clearcoat: 0.7, clearcoatRoughness: 0.2, envMapIntensity: 0.55 }));
    this.tile.visible = opts.tile !== false;
    this.group.add(this.tile);
    this.markZ = bevel * 0.9;

    // หาง (ตัว C): ท่อกลมความหนาตามจุดใน brand.ts — index เรียงจากโคนไปปลาย จึงวาดตัวเองด้วย drawRange ได้
    const samples = logoTail(120);
    const pts = samples.map((p) => new THREE.Vector3(X(p.x), Y(p.y), this.markZ));
    const radii = samples.map((p) => (p.w / 2) * k);
    const tube = tailTube(pts, radii, 24, 0.82);
    this.ringCount = tube.index!.count;
    this.ring = new THREE.Mesh(tube, ink);
    this.group.add(this.ring);
    [0, pts.length - 1].forEach((i) => {
      const cap = new THREE.Mesh(new THREE.SphereGeometry(radii[i], 24, 16), ink);
      cap.position.copy(pts[i]);
      cap.scale.z = 0.82;
      this.caps.push(cap);
      this.group.add(cap);
    });

    // ตา: ทรงรีมันวาว
    for (const [ex, ey] of LOGO.eyes) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(LOGO.eyeR * k, 24, 16), ink);
      m.position.set(X(ex), Y(ey), this.markZ);
      m.scale.set(1, 1.1, 0.55);
      this.eyes.push(m);
      this.group.add(m);
    }
    // จมูกชมพู
    const n = LOGO.nose;
    const nosePts: [number, number][] = [[X(n.x), Y(n.y)], [X(n.x + n.w), Y(n.y)], [X(n.x + n.w / 2), Y(n.y + n.h)]];
    const ncx = (nosePts[0][0] + nosePts[1][0] + nosePts[2][0]) / 3;
    const ncy = (nosePts[0][1] + nosePts[1][1] + nosePts[2][1]) / 3;
    const ng = new THREE.ExtrudeGeometry(roundedPolygon(nosePts.map(([x, y]) => [x - ncx, y - ncy]), 0.7 * k), { depth: 0.6 * k, bevelEnabled: true, bevelThickness: 0.5 * k, bevelSize: 0.4 * k, bevelSegments: 4, curveSegments: 8 });
    this.nose = new THREE.Mesh(ng, new THREE.MeshPhysicalMaterial({ color: '#f0707a', roughness: 0.45, clearcoat: 0.6, envMapIntensity: 0.4 }));
    this.nose.position.set(ncx, ncy, this.markZ);
    this.group.add(this.nose);
    this.setBuild(1);
  }

  /** ประกอบโลโก้ทีละชิ้น 0..1 */
  setBuild(p: number) {
    const tileK = ease.backOut(prog(p, 0, 0.28));
    this.tile.scale.setScalar(Math.max(0.001, tileK));
    const draw = ease.inOut(prog(p, 0.16, 0.7));
    this.ring.geometry.setDrawRange(0, Math.floor((this.ringCount * draw) / 6) * 6);
    this.ring.visible = draw > 0.001;
    this.caps[0].visible = draw > 0.001;
    this.caps[1].visible = draw > 0.985;
    this.eyes.forEach((m) => {
      const k = ease.backOut(prog(p, 0.72, 0.86));
      m.scale.set(Math.max(0.001, k), Math.max(0.001, k * 1.1), 0.55);
    });
    const nk = ease.backOut(prog(p, 0.84, 0.98));
    this.nose.scale.setScalar(Math.max(0.001, nk));
  }

  /** กะพริบตา (0 = ลืม, 1 = หลับ) */
  blink(b: number) {
    this.eyes.forEach((m) => {
      m.scale.y = Math.max(0.08, m.scale.x * 1.1 * (1 - b));
    });
  }

  /** จุดตัวอย่างบนรูปโลโก้ (ใช้เป็นเป้าหมายให้ฝูงการ์ดรวมตัว) — พิกัดในกรอบของ group */
  samplePoints(n: number, seed = 'logo'): THREE.Vector3[] {
    const k = this.size / LOGO.tile.size;
    const out: THREE.Vector3[] = [];
    const tail = logoTail(200);
    let s = 0;
    for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
    const rnd = () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
    for (let i = 0; i < n; i++) {
      const u = rnd();
      let x: number;
      let y: number;
      if (u < 0.86) {
        // จุดบนหาง กระจายตามความหนา
        const p = tail[Math.floor(rnd() * tail.length)];
        const a = rnd() * Math.PI * 2;
        const rr = Math.sqrt(rnd()) * p.w * 0.45;
        x = p.x + Math.cos(a) * rr;
        y = p.y + Math.sin(a) * rr;
      } else {
        const [ex, ey] = LOGO.eyes[rnd() < 0.5 ? 0 : 1];
        const a = rnd() * Math.PI * 2;
        const rr = Math.sqrt(rnd()) * LOGO.eyeR;
        x = ex + Math.cos(a) * rr;
        y = ey + Math.sin(a) * rr;
      }
      out.push(new THREE.Vector3((x - LOGO.view / 2) * k, -(y - LOGO.view / 2) * k, this.markZ + (rnd() - 0.5) * 0.05));
    }
    return out;
  }
}
