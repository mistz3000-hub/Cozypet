/**
 * คลัง prop 3 มิติที่ใช้ซ้ำทั้งเรื่อง (D34) — ออกแบบให้สวยตั้งแต่ต้น: วัสดุมันวาวแบบดินปั้น/แก้ว มุมมน และ animation ในตัว
 * MapPin · CapacityTank · SupplyBox · ChatBubble · ReadCheck · HeartCoin · ScanFrame · NoticeCard
 * ไม่มีตัวอักษรใน WebGL — ป้าย/ตัวเลขทั้งหมดเป็น DOM ที่วางด้วย project()
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { GLKit } from '../gl';
import { clamp, ease } from '../timeline';
import { C, drawIcon, goldMaterial, pawGeometry, roundedShape, shapeGeo, softMaterial, type IconName } from '../scenes/stage';

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
export class SupplyBox {
  group = new THREE.Group();
  private flaps: THREE.Group[] = [];
  readonly size: number;

  constructor(kit: GLKit, size = 1.0, sticker?: THREE.Texture) {
    this.size = size;
    const w = size;
    const h = size * 0.75;
    const d = size * 0.8;
    const kraft = clay('#c99a5f', 0.8);
    const inside = clay('#a77a45', 0.9);
    const body = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, size * 0.03), kraft);
    body.position.y = h / 2;
    this.group.add(body);
    const hole = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.94, d * 0.94), inside);
    hole.rotation.x = -Math.PI / 2;
    hole.position.y = h - 0.002;
    this.group.add(hole);
    const tape = new THREE.Mesh(new THREE.BoxGeometry(w * 0.22, h * 1.002, d * 1.004), clay('#e9d4a8', 0.45));
    tape.position.y = h / 2;
    this.group.add(tape);
    if (sticker) {
      const st = new THREE.Mesh(new THREE.CircleGeometry(size * 0.16, 32), new THREE.MeshBasicMaterial({ map: sticker, toneMapped: false }));
      st.position.set(w * 0.3, h * 0.5, d / 2 + 0.003);
      this.group.add(st);
    }
    // ฝา 4 แผ่น (หมุนรอบขอบบน)
    const mk = (fw: number, fd: number, px: number, pz: number, axis: 'x' | 'z', sign: number) => {
      const pivot = new THREE.Group();
      pivot.position.set(px, h, pz);
      const m = new THREE.Mesh(new THREE.BoxGeometry(fw, size * 0.02, fd), kraft);
      if (axis === 'x') m.position.z = (sign * fd) / 2;
      else m.position.x = (sign * fw) / 2;
      pivot.add(m);
      pivot.userData = { axis, sign };
      this.group.add(pivot);
      this.flaps.push(pivot);
    };
    mk(w, d / 2, 0, d / 2, 'x', -1);
    mk(w, d / 2, 0, -d / 2, 'x', 1);
    mk(w / 2, d * 0.98, w / 2, 0, 'z', -1);
    mk(w / 2, d * 0.98, -w / 2, 0, 'z', 1);
    void kit;
  }

  /** open 0..1 */
  setOpen(open: number) {
    this.flaps.forEach((p, i) => {
      const k = ease.backOut(clamp(open * 1.3 - i * 0.08));
      const a = k * (Math.PI * 0.72);
      const { axis, sign } = p.userData as { axis: 'x' | 'z'; sign: number };
      if (axis === 'x') p.rotation.x = sign * a;
      else p.rotation.z = -sign * a;
    });
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
  return kit.canvasTex(256, 256, (c) => {
    c.fillStyle = bg;
    c.beginPath();
    c.arc(128, 128, 128, 0, Math.PI * 2);
    c.fill();
    drawIcon(c, name, 128, 128, 150, ink, accent);
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
