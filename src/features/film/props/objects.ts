/**
 * คลัง prop 3 มิติที่ใช้ซ้ำทั้งเรื่อง (D34) — ออกแบบให้สวยตั้งแต่ต้น: วัสดุมันวาวแบบดินปั้น/แก้ว มุมมน และ animation ในตัว
 * MapPin · CapacityTank · SupplyBox · ChatBubble · ReadCheck · HeartCoin · ScanFrame · NoticeCard
 * ไม่มีตัวอักษรใน WebGL — ป้าย/ตัวเลขทั้งหมดเป็น DOM ที่วางด้วย project()
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { GLKit } from '../gl';
import { clamp, ease } from '../timeline';
import { rngFromKey } from '@/lib/seeded-random';
import { C, drawIcon, goldMaterial, icon3d, pawGeometry, roundedShape, shapeGeo, softMaterial, type IconName } from '../scenes/stage';

const prog = (p: number, a: number, b: number) => clamp((p - a) / (b - a));

export const STATUS = { open: '#2e8b62', tight: '#d08a12', full: '#d0402f' } as const;
export type Status = keyof typeof STATUS;

/** วัสดุดินปั้นมันวาว */
export function clay(color: string, rough = 0.42): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({ color, roughness: rough, clearcoat: 0.6, clearcoatRoughness: 0.25, envMapIntensity: 0.5 });
}

/** หมุดแผนที่ทรงหยดน้ำ + แผ่นไอคอน + วงคลื่นบนพื้น */
export class MapPin {
  group = new THREE.Group();
  private head: THREE.Group;
  private ring: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  private body: THREE.Mesh<THREE.LatheGeometry, THREE.MeshPhysicalMaterial>;
  private halo: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>;

  constructor(color: string, face: THREE.Texture | null, size = 0.6) {
    // โปรไฟล์หยดน้ำ (หมุนรอบแกน y): ปลายแหลมที่พื้น → ทรงกลมด้านบน
    const R = size * 0.5;
    const cy = size * 1.15;
    const pts: THREE.Vector2[] = [new THREE.Vector2(0, 0)];
    for (let i = 0; i <= 28; i++) {
      const a = (-60 + (150 * i) / 28) * (Math.PI / 180);
      pts.push(new THREE.Vector2(Math.max(0.0001, R * Math.cos(a)), cy + R * Math.sin(a)));
    }
    const lathe = new THREE.LatheGeometry(pts, 48);
    this.body = new THREE.Mesh(lathe, clay(color, 0.32));
    this.head = new THREE.Group();
    this.head.add(this.body);
    if (face) {
      const disc = new THREE.Mesh(new THREE.CircleGeometry(size * 0.3, 40), new THREE.MeshBasicMaterial({ map: face, toneMapped: false }));
      disc.position.set(0, cy, size * 0.505);
      this.head.add(disc);
    }
    this.group.add(this.head);
    this.ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 64), new THREE.MeshBasicMaterial({ color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide }));
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.position.y = 0.01;
    this.group.add(this.ring);
    this.halo = new THREE.Mesh(new THREE.CircleGeometry(size * 0.9, 40), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.25, depthWrite: false, toneMapped: false }));
    this.halo.rotation.x = -Math.PI / 2;
    this.halo.position.y = 0.005;
    this.group.add(this.halo);
  }

  setColor(color: string) {
    this.body.material.color.set(color);
    this.ring.material.color.set(color);
    this.halo.material.color.set(color);
  }

  /** pop 0..1 (หล่นลงพร้อมเด้ง), t สำหรับวงคลื่นและลอยตัว, cam ให้แผ่นไอคอนหันหากล้อง */
  update(t: number, pop: number, cam?: THREE.Camera, pulse = 1) {
    const k = ease.spring(clamp(pop), 6, 1.6);
    this.head.position.y = (1 - clamp(pop * 1.4)) * 2.5 + 0.06 * Math.sin(t * 2.2);
    this.head.scale.setScalar(Math.max(0.001, k));
    if (cam) this.head.rotation.y = Math.atan2(cam.position.x - this.group.position.x, cam.position.z - this.group.position.z);
    const ph = (t * 0.9) % 1;
    this.ring.scale.setScalar(0.2 + ph * 1.6);
    this.ring.material.opacity = (1 - ph) * 0.8 * pulse * clamp(pop);
    this.halo.material.opacity = 0.25 * clamp(pop);
  }
}

/** ถังแก้วบอกความจุ: ของเหลวสีตามสถานะ + ผิวน้ำกระเพื่อม + ขีดระดับ */
export class CapacityTank {
  group = new THREE.Group();
  private liquid: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshPhysicalMaterial>;
  private surface: THREE.Mesh<THREE.CircleGeometry, THREE.MeshPhysicalMaterial>;
  private glow: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial>;
  readonly height: number;
  private r: number;

  constructor(r = 0.42, h = 1.8) {
    this.height = h;
    this.r = r;
    const glass = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.05, transparent: true, opacity: 0.2, clearcoat: 1, depthWrite: false, envMapIntensity: 1.2, side: THREE.DoubleSide });
    const shell = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 48, 1, true), glass);
    shell.position.y = h / 2;
    shell.renderOrder = 3;
    this.group.add(shell);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.12, r * 1.18, 0.12, 48), goldMaterial());
    base.position.y = 0.06;
    this.group.add(base);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(r * 1.02, 0.03, 8, 48), goldMaterial());
    rim.rotation.x = Math.PI / 2;
    rim.position.y = h;
    this.group.add(rim);
    for (let i = 1; i < 4; i++) {
      const tick = new THREE.Mesh(new THREE.TorusGeometry(r * 1.005, 0.006, 4, 48), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.45, toneMapped: false }));
      tick.rotation.x = Math.PI / 2;
      tick.position.y = (h * i) / 4;
      this.group.add(tick);
    }
    const liq = new THREE.MeshPhysicalMaterial({ color: STATUS.open, roughness: 0.25, transmission: 0, transparent: true, opacity: 0.92, clearcoat: 1, emissive: STATUS.open, emissiveIntensity: 0.25 });
    this.liquid = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.92, r * 0.92, 1, 40, 1, true), liq);
    this.group.add(this.liquid);
    this.surface = new THREE.Mesh(new THREE.CircleGeometry(r * 0.92, 40), liq.clone());
    this.surface.rotation.x = -Math.PI / 2;
    this.group.add(this.surface);
    this.glow = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.4, r * 1.4, h * 1.05, 32, 1, true), new THREE.MeshBasicMaterial({ color: STATUS.full, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.BackSide }));
    this.glow.position.y = h / 2;
    this.group.add(this.glow);
  }

  /** level 0..1 (เกิน 1 = ล้น), status สี, t สำหรับคลื่นผิวน้ำ */
  set(level: number, status: Status, t: number, alarm = 0) {
    const h = Math.max(0.02, Math.min(level, 1.04) * this.height * 0.96);
    this.liquid.scale.y = h;
    this.liquid.position.y = 0.12 + h / 2;
    this.surface.position.y = 0.12 + h;
    this.surface.rotation.set(-Math.PI / 2 + 0.06 * Math.sin(t * 3.1), 0.05 * Math.sin(t * 2.3), 0);
    const col = STATUS[status];
    this.liquid.material.color.set(col);
    this.liquid.material.emissive.set(col);
    this.surface.material.color.set(col);
    this.surface.material.emissive.set(col);
    this.glow.material.opacity = alarm * (0.25 + 0.15 * Math.sin(t * 9));
  }

  get radius() {
    return this.r;
  }
}

/** กล่องพัสดุคราฟต์: ฝา 4 แผ่นเปิดได้ เทปกาว สติกเกอร์หัวใจ */
let kraftCache: THREE.Texture | null = null;
/** โหลดภาพพื้นผิวกระดาษลังจริง (ภาพสร้างด้วย AI ต่อกันไร้รอย) ก่อนสร้างกล่อง — ถ้าโหลดไม่ได้ใช้แบบวาดด้วยโค้ด */
export async function preloadKraft(kit: GLKit) {
  if (kraftCache) return;
  try {
    const t = await kit.tex('/images/film/tex-kraft.jpg');
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 8;
    t.needsUpdate = true;
    kraftCache = t;
  } catch {
    /* ใช้แบบวาด */
  }
}

/** พื้นผิวกระดาษลังคราฟต์ — ภาพจริงถ้าโหลดไว้แล้ว ไม่อย่างนั้นวาดด้วยโค้ด (ค่าสุ่มคงที่) */
export function kraftTexture(): THREE.Texture {
  if (kraftCache) return kraftCache;
  const N = 512;
  const cv = document.createElement('canvas');
  cv.width = N;
  cv.height = N;
  const c = cv.getContext('2d')!;
  c.fillStyle = '#c69a62';
  c.fillRect(0, 0, N, N);
  const rnd = rngFromKey('cozypet:v1:film:kraft');
  // ลอนลูกฟูกจาง ๆ
  for (let x = 0; x < N; x += 6) {
    c.fillStyle = `rgba(90,60,30,${0.025 + 0.02 * Math.sin(x * 0.9)})`;
    c.fillRect(x, 0, 3, N);
  }
  // จุดและเส้นใย
  for (let i = 0; i < 2600; i++) {
    const x = rnd() * N;
    const y = rnd() * N;
    const dark = rnd() < 0.55;
    c.fillStyle = dark ? `rgba(80,50,22,${0.08 + rnd() * 0.18})` : `rgba(255,236,200,${0.06 + rnd() * 0.14})`;
    c.fillRect(x, y, 1 + rnd() * 1.5, 1 + rnd() * 1.5);
  }
  c.lineCap = 'round';
  for (let i = 0; i < 500; i++) {
    const x = rnd() * N;
    const y = rnd() * N;
    const a = rnd() * Math.PI;
    const l = 4 + rnd() * 14;
    c.strokeStyle = rnd() < 0.5 ? `rgba(95,62,28,${0.07 + rnd() * 0.1})` : `rgba(250,225,185,${0.06 + rnd() * 0.1})`;
    c.lineWidth = 0.6 + rnd() * 0.8;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    c.stroke();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  kraftCache = tex;
  return tex;
}

/**
 * กล่องลังของบริจาคแบบ RSC จริง: ผนัง 4 ด้าน + ก้น, ฝานอก 2 แผ่น (ด้านยาว) ปิดชนกันกลางกล่องแล้วคาดเทป,
 * ฝาใน 2 แผ่น (ด้านสั้น) อยู่ใต้ฝานอก · เปิด: ฝานอกพับออกก่อน แล้วฝาใน ของข้างในยกตัวโผล่ขอบ
 */
export class SupplyBox {
  group = new THREE.Group();
  private outer: THREE.Group[] = [];
  private inner: THREE.Group[] = [];
  private goods = new THREE.Group();
  readonly size: number;
  private h: number;

  constructor(kit: GLKit, size = 1.0, sticker?: THREE.Texture) {
    this.size = size;
    const w = size;
    const h = size * 0.72;
    const d = size * 0.78;
    const th = size * 0.022;
    this.h = h;
    const tex = kraftTexture();
    const kraft = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.86, bumpMap: tex, bumpScale: 0.6 });
    const inside = new THREE.MeshStandardMaterial({ map: tex, color: '#b48552', roughness: 0.92 });
    const edge = new THREE.MeshStandardMaterial({ color: '#d9b27c', roughness: 0.9 });
    const tapeMat = new THREE.MeshPhysicalMaterial({ color: '#b98a4e', roughness: 0.22, clearcoat: 0.8, transparent: true, opacity: 0.86 });
    const wall = (gw: number, gh: number, gd: number, x: number, y: number, z: number) => {
      // ด้านนอก/ใน/ขอบใช้วัสดุต่างกัน (ลำดับหน้าของ BoxGeometry: +x −x +y −y +z −z)
      const m = new THREE.Mesh(new THREE.BoxGeometry(gw, gh, gd), [kraft, kraft, edge, edge, kraft, kraft]);
      m.position.set(x, y, z);
      this.group.add(m);
      return m;
    };
    wall(w, th, d, 0, th / 2, 0);
    wall(w, h, th, 0, h / 2, d / 2 - th / 2);
    wall(w, h, th, 0, h / 2, -d / 2 + th / 2);
    wall(th, h, d - 2 * th, w / 2 - th / 2, h / 2, 0);
    wall(th, h, d - 2 * th, -w / 2 + th / 2, h / 2, 0);
    // ผนังด้านในสีเข้มกว่า + เงาก้นกล่อง
    const lining = new THREE.Mesh(new THREE.BoxGeometry(w - 2 * th - 0.002, h - th, d - 2 * th - 0.002), inside);
    (lining.material as THREE.Material).side = THREE.BackSide;
    lining.position.y = th + (h - th) / 2;
    this.group.add(lining);
    // เทปแนวตั้งที่ผนังซ้าย/ขวา (ปลายเทปที่ถูกตัดตอนเปิด)
    for (const sx of [-1, 1]) {
      const t = new THREE.Mesh(new THREE.BoxGeometry(0.004, h * 0.32, d * 0.16), tapeMat);
      t.position.set(sx * (w / 2 + 0.002), h - h * 0.16, 0);
      this.group.add(t);
    }
    if (sticker) {
      const st = new THREE.Mesh(new THREE.CircleGeometry(size * 0.15, 40), new THREE.MeshBasicMaterial({ map: sticker, toneMapped: false }));
      st.position.set(w * 0.27, h * 0.5, d / 2 + 0.003);
      this.group.add(st);
    }
    // ของข้างใน: ถุงอาหาร + กระป๋อง (ยกขึ้นตอนเปิด)
    const bag = new THREE.Mesh(new RoundedBoxGeometry(w * 0.42, h * 0.95, d * 0.34, 3, size * 0.04), softMaterial('#f4b400', 0.4));
    bag.position.set(-w * 0.16, h * 0.475, -d * 0.12);
    bag.rotation.z = 0.06;
    const label = new THREE.Mesh(new THREE.CircleGeometry(size * 0.08, 32), new THREE.MeshBasicMaterial({ color: '#fff8ec', toneMapped: false }));
    label.position.set(0, h * 0.12, d * 0.171);
    bag.add(label);
    const paw = new THREE.Mesh(pawGeometry(size * 0.12, size * 0.004), new THREE.MeshBasicMaterial({ color: '#2b2118', toneMapped: false }));
    paw.position.set(0, h * 0.12, d * 0.172);
    bag.add(paw);
    const can = new THREE.Mesh(new THREE.CylinderGeometry(size * 0.11, size * 0.11, h * 0.62, 32), new THREE.MeshPhysicalMaterial({ color: '#e9e2d6', metalness: 0.7, roughness: 0.25 }));
    can.position.set(w * 0.2, h * 0.31, d * 0.08);
    const canLabel = new THREE.Mesh(new THREE.CylinderGeometry(size * 0.112, size * 0.112, h * 0.34, 32, 1, true), softMaterial('#d0402f', 0.45));
    can.add(canLabel);
    this.goods.add(bag, can);
    this.group.add(this.goods);
    // ฝา: ฝานอกด้านยาว (หน้า/หลัง) ลึกครึ่งกล่อง ชนกันกลาง · ฝาในด้านสั้น (ซ้าย/ขวา) อยู่ต่ำกว่าหนึ่งความหนา
    const flap = (fw: number, fd: number, px: number, py: number, pz: number, dirX: number, dirZ: number, list: THREE.Group[], taped: boolean) => {
      const pivot = new THREE.Group();
      pivot.position.set(px, py, pz);
      const m = new THREE.Mesh(new THREE.BoxGeometry(fw, th, fd), [edge, edge, kraft, inside, edge, edge]);
      m.position.set((dirX * fw) / 2, th / 2, (dirZ * fd) / 2);
      pivot.add(m);
      if (taped) {
        // เทปครึ่งหนึ่งอยู่บนฝาแต่ละแผ่น ชิดขอบที่ชนกัน
        const tw = d * 0.08;
        const tp = new THREE.Mesh(new THREE.BoxGeometry(fw * 1.0, 0.004, tw), tapeMat);
        tp.position.set(0, th + 0.002, dirZ * (fd - tw / 2));
        pivot.add(tp);
      }
      pivot.userData = { dirX, dirZ };
      this.group.add(pivot);
      list.push(pivot);
    };
    flap(w, d / 2, 0, h, d / 2, 0, -1, this.outer, true);
    flap(w, d / 2, 0, h, -d / 2, 0, 1, this.outer, true);
    flap(d / 2, d - 2 * th, -w / 2 + th, h - th, 0, 1, 0, this.inner, false);
    flap(d / 2, d - 2 * th, w / 2 - th, h - th, 0, -1, 0, this.inner, false);
    void kit;
  }

  /** open 0..1 — 0 = ปิดสนิทคาดเทป · 1 = ฝาทั้ง 4 พับออก ของข้างในโผล่ */
  setOpen(open: number) {
    const ko = ease.backOut(clamp(open * 1.7));
    const ki = ease.backOut(clamp(open * 1.7 - 0.55));
    const a = (k: number) => k * Math.PI * 0.68;
    this.outer.forEach((p) => {
      const { dirZ } = p.userData as { dirZ: number };
      // ฝาหน้าชี้เข้า −z: หมุนรอบแกน x บวก = พับขึ้นแล้วออกด้านหน้า
      p.rotation.x = dirZ < 0 ? a(ko) : -a(ko);
    });
    this.inner.forEach((p) => {
      const { dirX } = p.userData as { dirX: number };
      p.rotation.z = dirX > 0 ? a(ki) : -a(ki);
    });
    const lift = ease.out(clamp(open * 1.4 - 0.5));
    this.goods.position.y = this.h * 0.22 * lift;
    this.goods.visible = open > 0.02;
  }
}

/** ฟองแชต 3 มิติ: กล่องมนมีหาง + จุดกำลังพิมพ์ (ซ้าย = ขาว / ขวา = ทอง) */
export class ChatBubble {
  group = new THREE.Group();
  private dots: THREE.Mesh[] = [];
  private lines: THREE.Mesh[] = [];

  constructor(w = 1.6, h = 0.8, side: 'left' | 'right' = 'left') {
    const s = roundedShape(w, h, h * 0.4);
    const tail = new THREE.Shape();
    const tx = side === 'left' ? -w / 2 + h * 0.35 : w / 2 - h * 0.35;
    const dir = side === 'left' ? -1 : 1;
    tail.moveTo(tx, -h / 2 + 0.02);
    tail.quadraticCurveTo(tx + dir * h * 0.15, -h / 2 - h * 0.22, tx + dir * h * 0.42, -h / 2 - h * 0.3);
    tail.quadraticCurveTo(tx + dir * h * 0.2, -h / 2 - h * 0.08, tx + dir * -h * 0.25, -h / 2 + 0.02);
    const geo = new THREE.ExtrudeGeometry([s, tail], { depth: h * 0.18, bevelEnabled: true, bevelThickness: h * 0.08, bevelSize: h * 0.06, bevelSegments: 6, curveSegments: 16 });
    geo.translate(0, 0, -h * 0.09);
    const mat = side === 'left' ? clay('#ffffff', 0.35) : clay('#f4b400', 0.32);
    this.group.add(new THREE.Mesh(geo, mat));
    const dotMat = clay(side === 'left' ? '#b9a993' : '#2b2118', 0.4);
    for (let i = 0; i < 3; i++) {
      const d = new THREE.Mesh(new THREE.SphereGeometry(h * 0.09, 16, 12), dotMat);
      d.position.set((i - 1) * h * 0.3, 0, h * 0.2);
      this.dots.push(d);
      this.group.add(d);
    }
    for (let i = 0; i < 2; i++) {
      const l = new THREE.Mesh(new RoundedBoxGeometry(w * (i ? 0.45 : 0.7), h * 0.13, 0.02, 2, h * 0.06), clay(side === 'left' ? '#d9cdbb' : '#7a5200', 0.5));
      l.position.set(-w * (i ? 0.125 : 0) + (side === 'left' ? -w * 0.05 : 0), (0.5 - i) * h * 0.28, h * 0.17);
      this.lines.push(l);
      this.group.add(l);
    }
  }

  /** typing = จุดเด้งเป็นคลื่น · ไม่งั้นแสดงแถบข้อความ */
  set(t: number, typing: boolean) {
    this.dots.forEach((d, i) => {
      d.visible = typing;
      d.position.y = Math.max(0, Math.sin(t * 9 - i * 0.9)) * 0.08;
    });
    this.lines.forEach((l) => (l.visible = !typing));
  }
}

/** เครื่องหมายอ่านแล้ว (ถูก 2 ตัว) */
export function readCheck(color: string = C.gold, size = 0.4): THREE.Group {
  const g = new THREE.Group();
  const mk = (ox: number) => {
    const s = new THREE.Shape();
    s.moveTo(-0.5, 0.05);
    s.lineTo(-0.32, 0.23);
    s.lineTo(-0.12, 0.03);
    s.lineTo(0.38, 0.53);
    s.lineTo(0.56, 0.35);
    s.lineTo(-0.12, -0.33);
    s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 3 });
    geo.scale(size, size, size);
    const m = new THREE.Mesh(geo, goldMaterial(color));
    m.position.x = ox * size;
    g.add(m);
  };
  mk(-0.22);
  mk(0.22);
  return g;
}

/** หัวใจทองมีอุ้งเท้านูน (แต้มน้ำใจ/ส่งต่อน้องสำเร็จ) */
export function heartCoin(size = 1): THREE.Group {
  const g = new THREE.Group();
  const s = new THREE.Shape();
  s.moveTo(0, -0.42);
  s.bezierCurveTo(-0.15, -0.28, -0.62, 0.0, -0.5, 0.28);
  s.bezierCurveTo(-0.4, 0.55, -0.08, 0.55, 0, 0.3);
  s.bezierCurveTo(0.08, 0.55, 0.4, 0.55, 0.5, 0.28);
  s.bezierCurveTo(0.62, 0.0, 0.15, -0.28, 0, -0.42);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.06, bevelSegments: 8, curveSegments: 32 });
  geo.translate(0, 0, -0.08);
  geo.scale(size, size, size);
  g.add(new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color: C.heart, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 0.7 })));
  const paw = new THREE.Mesh(pawGeometry(0.4 * size, 0.04 * size), goldMaterial('#fff3d1'));
  paw.position.z = 0.17 * size;
  paw.position.y = 0.03 * size;
  g.add(paw);
  return g;
}

/** กรอบสแกน: มุม 4 มุม + เส้นเลเซอร์เลื่อนขึ้นลง */
export class ScanFrame {
  group = new THREE.Group();
  private laser: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  private w: number;
  private h: number;

  constructor(kit: GLKit, w: number, h: number, laserTex: THREE.Texture) {
    this.w = w;
    this.h = h;
    const mat = new THREE.MeshBasicMaterial({ color: '#ffd23f', toneMapped: false });
    const L = Math.min(w, h) * 0.22;
    const th = Math.min(w, h) * 0.025;
    for (const [sx, sy] of [[-1, 1], [1, 1], [1, -1], [-1, -1]]) {
      const a = new THREE.Mesh(new THREE.BoxGeometry(L, th, th), mat);
      a.position.set(sx * (w / 2 - L / 2), sy * h / 2, 0);
      const b = new THREE.Mesh(new THREE.BoxGeometry(th, L, th), mat);
      b.position.set(sx * w / 2, sy * (h / 2 - L / 2), 0);
      this.group.add(a, b);
    }
    this.laser = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.08, h * 0.28), new THREE.MeshBasicMaterial({ map: laserTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    this.laser.position.z = 0.02;
    this.group.add(this.laser);
    void kit;
  }

  /** scan 0..1 (เลื่อนลงแล้วขึ้น), on 0..1 */
  set(scan: number, on: number) {
    const y = Math.cos(scan * Math.PI * 2) * this.h * 0.42;
    this.laser.position.y = y;
    this.laser.material.opacity = on;
    this.group.scale.setScalar(Math.max(0.001, ease.backOut(clamp(on))));
  }

  static async laserTexture(kit: GLKit): Promise<THREE.CanvasTexture> {
    return kit.canvasTex(256, 128, (c) => {
      const g = c.createLinearGradient(0, 0, 0, 128);
      g.addColorStop(0, 'rgba(255,210,63,0)');
      g.addColorStop(0.47, 'rgba(255,230,140,0.55)');
      g.addColorStop(0.5, 'rgba(255,255,255,1)');
      g.addColorStop(0.53, 'rgba(255,230,140,0.55)');
      g.addColorStop(1, 'rgba(255,210,63,0)');
      c.fillStyle = g;
      c.fillRect(0, 0, 256, 128);
    });
  }
}

/** หน้าประกาศพบสัตว์ (ภาพน้อง + แถบหัวสีทอง + ไอคอน) — ข้อความจริงเป็น DOM */
export async function noticeFace(kit: GLKit, photo: HTMLImageElement | null): Promise<THREE.CanvasTexture> {
  return kit.canvasTex(600, 800, (c) => {
    c.fillStyle = '#fffaf2';
    c.fillRect(0, 0, 600, 800);
    c.fillStyle = '#f4b400';
    c.beginPath();
    c.roundRect(28, 28, 544, 88, 22);
    c.fill();
    drawIcon(c, 'paw', 78, 72, 50, '#2b2118', '#2b2118');
    c.fillStyle = 'rgba(43,33,24,0.85)';
    c.beginPath();
    c.roundRect(120, 56, 220, 32, 16);
    c.fill();
    if (photo) {
      c.save();
      c.beginPath();
      c.roundRect(28, 136, 544, 440, 22);
      c.clip();
      const sc = Math.max(544 / photo.width, 440 / photo.height);
      c.drawImage(photo, (photo.width - 544 / sc) / 2, (photo.height - 440 / sc) / 2, 544 / sc, 440 / sc, 28, 136, 544, 440);
      c.restore();
    }
    c.fillStyle = '#e8dcc7';
    for (const [y, w] of [[610, 420], [652, 340], [694, 380]]) {
      c.beginPath();
      c.roundRect(40, y, w, 22, 11);
      c.fill();
    }
    c.fillStyle = '#2e8b62';
    c.beginPath();
    c.roundRect(40, 734, 150, 36, 18);
    c.fill();
  });
}

/** หมุดปักกระดาษ */
export function pushPin(color: string = C.full): THREE.Group {
  const g = new THREE.Group();
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 16), clay(color, 0.25));
  head.position.z = 0.12;
  g.add(head);
  const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 8), new THREE.MeshStandardMaterial({ color: '#d8d8d8', metalness: 0.9, roughness: 0.2 }));
  needle.rotation.x = Math.PI / 2;
  needle.position.z = 0.03;
  g.add(needle);
  return g;
}

/** ไอคอนบนแผ่นวงกลม (ใช้เป็นหน้าหมุด/เหรียญ) */
export async function iconDisc(kit: GLKit, name: IconName, bg = '#ffffff', ink: string = C.ink, accent: string = C.gold): Promise<THREE.CanvasTexture> {
  const img = await icon3d(kit, name);
  return kit.canvasTex(256, 256, (c) => {
    c.fillStyle = bg;
    c.beginPath();
    c.arc(128, 128, 128, 0, Math.PI * 2);
    c.fill();
    if (img) c.drawImage(img, 38, 38, 180, 180);
    else drawIcon(c, name, 128, 128, 150, ink, accent);
  });
}

/** การ์ดภาพมีความหนา (ใช้กับภาพน้อง/ภาพหน้าจอ) */
export function photoCard(tex: THREE.Texture, w: number, h: number): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new RoundedBoxGeometry(w + 0.08, h + 0.08, 0.05, 3, 0.04), softMaterial('#fffaf2', 0.4));
  g.add(body);
  const face = new THREE.Mesh(shapeGeo(roundedShape(w, h, 0.06), w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  face.position.z = 0.027;
  g.add(face);
  return g;
}

export { prog as propProg };
