/**
 * ชุดเครื่องมือ 3 มิติของฉากเล่าเรื่อง (D33): สตูดิโอแสงอุ่น, การ์ด/ป้ายแบบมีความหนา, ลำแสงเชื่อม, อนุภาค
 * ทุกฉากคำนวณท่าทางจากฟังก์ชันบริสุทธิ์ของเวลา (rig) เพื่อให้ชั้น DOM วางข้อความตรงกับวัตถุ 3 มิติได้ (project)
 * ข้อความไทยไม่อยู่ใน WebGL — ภาพบนการ์ดเป็นไอคอน/ภาพถ่าย ส่วนข้อความเป็น DOM
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { GLKit } from '../gl';
import { W, H } from '../gl';
import { rngFromKey } from '@/lib/seeded-random';

/** สีของฉาก (ตรงกับ design tokens ใน src/app/tokens.css) */
export const C = {
  bg: '#fffdf8',
  butter: '#fff3d1',
  peach: '#ffe6d5',
  ink: '#2b2118',
  inkMuted: '#5e4f42',
  gold: '#f4b400',
  gold600: '#e5a800',
  gold700: '#9c6b00',
  heart: '#f0707a',
  open: '#2e8b62',
  tight: '#b26b00',
  full: '#c0392b',
  river: '#bcd7ea',
  land: '#f6efe1',
  wood: '#d9b98c',
  woodDark: '#b48a5a',
  night: '#1d1a2e',
} as const;

export interface CamRig { pos: [number, number, number]; look: [number, number, number]; fov: number; roll?: number }

export function makeCamera(): THREE.PerspectiveCamera {
  return new THREE.PerspectiveCamera(30, W / H, 0.1, 200);
}

export function applyCam(cam: THREE.PerspectiveCamera, r: CamRig) {
  cam.position.set(...r.pos);
  cam.fov = r.fov;
  cam.updateProjectionMatrix();
  cam.up.set(0, 1, 0);
  cam.lookAt(new THREE.Vector3(...r.look));
  if (r.roll) cam.rotateZ(r.roll);
  cam.updateMatrixWorld(true);
}

/** ตำแหน่งบนจอ (px ของเฟรม 1920×1080) ของจุดในโลก 3 มิติ — ใช้วางข้อความ DOM ให้ติดกับวัตถุ */
export function project(r: CamRig, p: [number, number, number] | THREE.Vector3): { x: number; y: number; z: number; behind: boolean } {
  const cam = projCam;
  applyCam(cam, r);
  const v = Array.isArray(p) ? new THREE.Vector3(...p) : p.clone();
  v.project(cam);
  return { x: ((v.x + 1) / 2) * W, y: ((1 - v.y) / 2) * H, z: v.z, behind: v.z > 1 };
}
const projCam = makeCamera();

/** ขนาด px ของความยาว 1 หน่วยที่ระยะห่าง d จากกล้อง */
export function pxPerUnit(fov: number, d: number): number {
  return H / (2 * d * Math.tan((fov / 2) * (Math.PI / 180)));
}

/** สตูดิโอพื้นฐาน: พื้นหลังไล่สี, แสงสามจุด, environment สำหรับวัสดุเงา */
export async function studio(kit: GLKit, scene: THREE.Scene, opts: { top?: string; mid?: string; bottom?: string; glow?: string; env?: number } = {}) {
  const bg = await kit.canvasTex(512, 288, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 288);
    g.addColorStop(0, opts.top ?? '#fffdf8');
    g.addColorStop(0.6, opts.mid ?? '#fff3d1');
    g.addColorStop(1, opts.bottom ?? '#ffe6d5');
    c.fillStyle = g;
    c.fillRect(0, 0, 512, 288);
    const r = c.createRadialGradient(256, 110, 10, 256, 110, 300);
    r.addColorStop(0, opts.glow ?? 'rgba(255,255,255,0.85)');
    r.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = r;
    c.fillRect(0, 0, 512, 288);
  });
  scene.background = bg;
  const pm = new THREE.PMREMGenerator(kit.renderer);
  const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  pm.dispose();
  scene.environment = env;
  scene.environmentIntensity = opts.env ?? 0.9;
  scene.add(new THREE.HemisphereLight('#fff6e0', '#c9a37a', 0.9));
  const key = new THREE.DirectionalLight('#ffffff', 1.5);
  key.position.set(-4, 6, 8);
  scene.add(key);
  const rim = new THREE.DirectionalLight('#ffcf6b', 1.2);
  rim.position.set(6, 2, -5);
  scene.add(rim);
  return { key, rim };
}

export function goldMaterial(color: string = C.gold): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({ color, metalness: 0.85, roughness: 0.26, clearcoat: 1, clearcoatRoughness: 0.15 });
}

export function softMaterial(color: string, rough = 0.5): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({ color, metalness: 0, roughness: rough, clearcoat: 0.6, clearcoatRoughness: 0.3, sheen: 0.4 });
}

export function roundedShape(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** ShapeGeometry ที่ UV เต็ม 0..1 ตามกรอบ */
export function shapeGeo(shape: THREE.Shape, w: number, h: number, seg = 12): THREE.ShapeGeometry {
  const g = new THREE.ShapeGeometry(shape, seg);
  const uv = g.attributes.uv as THREE.BufferAttribute;
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
  uv.needsUpdate = true;
  return g;
}

/** การ์ดมีความหนา: ตัวการ์ดมนสีครีม + หน้าการ์ดเป็นภาพ (ภาพ/ไอคอน ไม่ใช่ตัวอักษรไทย) */
export function card3d(w: number, h: number, opts: { depth?: number; radius?: number; color?: string; face?: THREE.Texture | null; faceInset?: number } = {}): THREE.Group {
  const g = new THREE.Group();
  const d = opts.depth ?? 0.08;
  const r = opts.radius ?? 0.14;
  const body = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, Math.min(r, d / 2)), softMaterial(opts.color ?? '#ffffff', 0.45));
  body.name = 'body';
  g.add(body);
  if (opts.face) {
    const ins = opts.faceInset ?? 0;
    const fw = w - ins * 2;
    const fh = h - ins * 2;
    const face = new THREE.Mesh(shapeGeo(roundedShape(fw, fh, Math.max(0.01, r - ins)), fw, fh), new THREE.MeshBasicMaterial({ map: opts.face, transparent: true, toneMapped: false }));
    face.position.z = d / 2 + 0.002;
    face.name = 'face';
    g.add(face);
  }
  return g;
}

/** แผ่นภาพวงกลม (ภาพบุคคล/สัตว์จาก atlas) พร้อมขอบทอง */
export function portraitDisc(tex: THREE.Texture, radius: number, ring: string = C.gold): THREE.Group {
  const g = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CircleGeometry(radius, 48), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, transparent: true }));
  disc.name = 'disc';
  g.add(disc);
  const torus = new THREE.Mesh(new THREE.TorusGeometry(radius, radius * 0.07, 12, 64), goldMaterial(ring));
  torus.name = 'ring';
  g.add(torus);
  const back = new THREE.Mesh(new THREE.CircleGeometry(radius * 1.02, 48), new THREE.MeshStandardMaterial({ color: '#fff7e6', roughness: 0.6 }));
  back.position.z = -0.01;
  back.rotation.y = Math.PI;
  g.add(back);
  return g;
}

/** ลำแสงโค้งที่ “วาด” ตัวเองได้ (setProgress 0..1) */
export class Beam {
  mesh: THREE.Mesh<THREE.TubeGeometry, THREE.MeshBasicMaterial>;
  private total = 0;
  constructor(color: string = C.gold, radius = 0.02, opacity = 0.9) {
    this.mesh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(), new THREE.Vector3(0, 0, 0.001)), 2, radius, 6), new THREE.MeshBasicMaterial({ color, transparent: true, opacity, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending }));
    this.mesh.frustumCulled = false;
  }
  set(from: THREE.Vector3, to: THREE.Vector3, lift = 0.6, radius = 0.02, seg = 40) {
    const mid = from.clone().lerp(to, 0.5);
    mid.y += lift;
    mid.z += lift * 0.4;
    this.mesh.geometry.dispose();
    this.mesh.geometry = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(from, mid, to), seg, radius, 6);
    this.total = this.mesh.geometry.index!.count;
  }
  /** วาดเส้นจาก a ถึง b (สัดส่วนตามความยาว) */
  progress(a: number, b = 1) {
    const s = Math.floor(Math.max(0, Math.min(1, a)) * this.total / 36) * 36;
    const e = Math.floor(Math.max(0, Math.min(1, b)) * this.total / 36) * 36;
    this.mesh.geometry.setDrawRange(Math.min(s, e), Math.max(0, e - s));
    this.mesh.visible = e > s;
  }
}

/** แสงฟุ้งทรงกลม (sprite แบบ additive) */
export async function glowTexture(kit: GLKit): Promise<THREE.CanvasTexture> {
  return kit.canvasTex(128, 128, (c) => {
    const g = c.createRadialGradient(64, 64, 2, 64, 64, 63);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,255,255,0.55)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 128, 128);
  });
}

export function glowSprite(tex: THREE.Texture, color: string, size: number, opacity = 1): THREE.Sprite {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  s.scale.set(size, size, 1);
  return s;
}

/** อนุภาคประกาย (instanced) — ตำแหน่งคำนวณจากเวลาแบบ deterministic */
export class Sparks {
  mesh: THREE.InstancedMesh;
  private data: { dir: THREE.Vector3; sp: number; s: number; delay: number; spin: number }[] = [];
  private dummy = new THREE.Object3D();
  constructor(tex: THREE.Texture, n: number, key: string, colors: string[] = [C.gold, '#ffd27a', '#ffffff', C.heart]) {
    this.mesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }), n);
    this.mesh.frustumCulled = false;
    const rnd = rngFromKey(`cozypet:v1:film:sparks:${key}`);
    for (let i = 0; i < n; i++) {
      const th = rnd() * Math.PI * 2;
      const ph = Math.acos(2 * rnd() - 1);
      this.data.push({ dir: new THREE.Vector3(Math.sin(ph) * Math.cos(th), Math.sin(ph) * Math.sin(th) * 0.8, Math.cos(ph) * 0.6), sp: 1.5 + rnd() * 3.5, s: 0.04 + rnd() * 0.1, delay: rnd() * 0.12, spin: rnd() });
      this.mesh.setColorAt(i, new THREE.Color(colors[i % colors.length]));
    }
  }
  /** ระเบิดจาก origin เมื่อ age ≥ 0 (วินาที) */
  burst(origin: THREE.Vector3, age: number, cam: THREE.Camera, life = 1.4) {
    this.data.forEach((d, i) => {
      const a = age - d.delay;
      if (a < 0 || a > life) {
        this.dummy.scale.setScalar(0);
      } else {
        const k = 1 - Math.exp(-a * 2.6);
        this.dummy.position.copy(origin).addScaledVector(d.dir, (d.sp * k) / 2.6);
        this.dummy.position.y -= 0.5 * a * a;
        const fade = 1 - a / life;
        this.dummy.scale.setScalar(d.s * (0.6 + 0.4 * Math.sin(a * 18 + d.spin * 6)) * fade * 2);
        this.dummy.quaternion.copy(cam.quaternion);
      }
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);
    });
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}

/** อนุภาคลอยในอากาศ (โบเก้) */
export class Floaters {
  mesh: THREE.InstancedMesh;
  private data: { p: THREE.Vector3; s: number; sp: number; ph: number }[] = [];
  private dummy = new THREE.Object3D();
  constructor(tex: THREE.Texture, n: number, key: string, box: { x: number; y: number; z0: number; z1: number }, colors: string[] = [C.gold, '#ffd27a', '#ffb59a', '#ffe9b8'], opacity = 0.35) {
    this.mesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity }), n);
    this.mesh.frustumCulled = false;
    const rnd = rngFromKey(`cozypet:v1:film:floaters:${key}`);
    for (let i = 0; i < n; i++) {
      this.data.push({ p: new THREE.Vector3((rnd() - 0.5) * box.x, (rnd() - 0.5) * box.y, box.z0 + rnd() * (box.z1 - box.z0)), s: 0.1 + rnd() * 0.5, sp: 0.05 + rnd() * 0.15, ph: rnd() * 10 });
      this.mesh.setColorAt(i, new THREE.Color(colors[i % colors.length]));
    }
  }
  update(T: number, cam: THREE.Camera) {
    this.data.forEach((b, i) => {
      this.dummy.position.set(b.p.x + Math.sin(T * b.sp + b.ph) * 0.6, b.p.y + Math.cos(T * b.sp * 0.8 + b.ph) * 0.4, b.p.z);
      this.dummy.scale.setScalar(b.s * (1 + 0.15 * Math.sin(T * 0.7 + b.ph)));
      this.dummy.quaternion.copy(cam.quaternion);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);
    });
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}

/** วงคลื่นกระแทก (วงแหวนขยายแล้วจาง) */
export function shockRing(color: string = C.gold): THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial> {
  const m = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 96), new THREE.MeshBasicMaterial({ color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide }));
  m.visible = false;
  return m;
}

export function setShock(m: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>, age: number, maxR: number, life = 0.8) {
  if (age < 0 || age > life) {
    m.visible = false;
    return;
  }
  const p = age / life;
  const r = 0.2 + maxR * (1 - Math.pow(1 - p, 3));
  m.scale.setScalar(r);
  m.material.opacity = 0.9 * (1 - p);
  m.visible = true;
}

/** ไอคอนเวกเตอร์ที่วาดด้วยโค้ด (ไม่มีตัวอักษร) สำหรับการ์ด/ป้าย */
export type IconName = 'scan' | 'notice' | 'ai' | 'balancer' | 'chat' | 'handoff' | 'box' | 'split' | 'dashboard' | 'chart' | 'globe' | 'phone' | 'pin' | 'heart' | 'home' | 'paw' | 'people' | 'question' | 'stack' | 'search' | 'qr' | 'shield';

export function drawIcon(c: CanvasRenderingContext2D, name: IconName, cx: number, cy: number, s: number, color: string, accent: string = C.gold) {
  c.save();
  c.translate(cx, cy);
  c.scale(s / 100, s / 100);
  c.lineCap = 'round';
  c.lineJoin = 'round';
  c.strokeStyle = color;
  c.fillStyle = color;
  c.lineWidth = 7;
  const rr = (x: number, y: number, w: number, h: number, r: number) => {
    c.beginPath();
    c.roundRect(x, y, w, h, r);
  };
  const paw = (x: number, y: number, k: number) => {
    c.beginPath();
    c.ellipse(x, y + 6 * k, 12 * k, 10 * k, 0, 0, Math.PI * 2);
    c.fill();
    for (const [dx, dy] of [[-13, -7], [-5, -15], [5, -15], [13, -7]]) {
      c.beginPath();
      c.ellipse(x + dx * k, y + dy * k, 4.5 * k, 5.5 * k, 0, 0, Math.PI * 2);
      c.fill();
    }
  };
  switch (name) {
    case 'scan': {
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        c.beginPath();
        c.moveTo(sx * 38, sy * 20);
        c.lineTo(sx * 38, sy * 38);
        c.lineTo(sx * 20, sy * 38);
        c.stroke();
      }
      c.fillStyle = accent;
      paw(0, 0, 1.3);
      c.strokeStyle = accent;
      c.beginPath();
      c.moveTo(-30, 0);
      c.lineTo(30, 0);
      c.globalAlpha = 0.6;
      c.stroke();
      break;
    }
    case 'notice': {
      rr(-30, -38, 60, 76, 8);
      c.stroke();
      c.fillStyle = accent;
      paw(0, -10, 1);
      c.beginPath();
      c.moveTo(-18, 16);
      c.lineTo(18, 16);
      c.moveTo(-18, 28);
      c.lineTo(8, 28);
      c.stroke();
      c.beginPath();
      c.arc(0, -42, 5, 0, Math.PI * 2);
      c.fillStyle = C.heart;
      c.fill();
      break;
    }
    case 'ai': {
      const star = (x: number, y: number, r: number) => {
        c.beginPath();
        c.moveTo(x, y - r);
        c.quadraticCurveTo(x, y, x + r, y);
        c.quadraticCurveTo(x, y, x, y + r);
        c.quadraticCurveTo(x, y, x - r, y);
        c.quadraticCurveTo(x, y, x, y - r);
        c.fill();
      };
      c.fillStyle = accent;
      star(-6, 4, 32);
      c.fillStyle = color;
      star(26, -26, 14);
      star(28, 26, 9);
      break;
    }
    case 'balancer': {
      c.beginPath();
      c.moveTo(0, -36);
      c.lineTo(0, 34);
      c.moveTo(-26, 34);
      c.lineTo(26, 34);
      c.moveTo(-38, -22);
      c.lineTo(38, -22);
      c.stroke();
      c.beginPath();
      c.moveTo(-38, -22);
      c.lineTo(-50, 6);
      c.lineTo(-26, 6);
      c.closePath();
      c.moveTo(38, -22);
      c.lineTo(26, 6);
      c.lineTo(50, 6);
      c.closePath();
      c.stroke();
      c.fillStyle = accent;
      c.beginPath();
      c.arc(0, -36, 7, 0, Math.PI * 2);
      c.fill();
      break;
    }
    case 'chat': {
      rr(-40, -32, 62, 44, 14);
      c.stroke();
      c.beginPath();
      c.moveTo(-28, 12);
      c.lineTo(-34, 26);
      c.lineTo(-14, 12);
      c.stroke();
      c.fillStyle = accent;
      rr(-6, -6, 50, 38, 12);
      c.fill();
      c.beginPath();
      c.moveTo(30, 32);
      c.lineTo(36, 44);
      c.lineTo(18, 32);
      c.fill();
      c.fillStyle = '#ffffff';
      for (let i = 0; i < 3; i++) {
        c.beginPath();
        c.arc(6 + i * 13, 13, 4, 0, Math.PI * 2);
        c.fill();
      }
      break;
    }
    case 'handoff': {
      c.beginPath();
      c.moveTo(-44, 10);
      c.lineTo(-22, -10);
      c.lineTo(-4, -2);
      c.lineTo(14, -14);
      c.lineTo(44, 8);
      c.stroke();
      c.beginPath();
      c.moveTo(-22, 8);
      c.lineTo(-6, 22);
      c.lineTo(8, 14);
      c.lineTo(22, 22);
      c.stroke();
      c.fillStyle = C.heart;
      c.beginPath();
      c.moveTo(0, -24);
      c.bezierCurveTo(-14, -40, -30, -24, 0, -6);
      c.bezierCurveTo(30, -24, 14, -40, 0, -24);
      c.fill();
      break;
    }
    case 'box': {
      c.beginPath();
      c.moveTo(-36, -16);
      c.lineTo(0, -32);
      c.lineTo(36, -16);
      c.lineTo(36, 24);
      c.lineTo(0, 40);
      c.lineTo(-36, 24);
      c.closePath();
      c.moveTo(-36, -16);
      c.lineTo(0, 0);
      c.lineTo(36, -16);
      c.moveTo(0, 0);
      c.lineTo(0, 40);
      c.stroke();
      c.strokeStyle = accent;
      c.beginPath();
      c.moveTo(-18, -24);
      c.lineTo(18, -8);
      c.stroke();
      break;
    }
    case 'split': {
      c.fillStyle = '#fff3d1';
      c.beginPath();
      c.arc(0, 0, 38, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = accent;
      c.beginPath();
      c.moveTo(0, 0);
      c.arc(0, 0, 38, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.1);
      c.closePath();
      c.fill();
      c.lineWidth = 6;
      c.beginPath();
      c.arc(0, 0, 38, 0, Math.PI * 2);
      c.stroke();
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(0, -38);
      c.moveTo(0, 0);
      c.lineTo(Math.cos(-Math.PI / 2 + Math.PI * 0.2) * 38, Math.sin(-Math.PI / 2 + Math.PI * 0.2) * 38);
      c.stroke();
      c.fillStyle = color;
      c.beginPath();
      c.arc(-12, 14, 6, 0, Math.PI * 2);
      c.fill();
      break;
    }
    case 'dashboard': {
      rr(-42, -32, 84, 64, 10);
      c.stroke();
      c.fillStyle = accent;
      [[-28, 8, 14], [-8, -6, 28], [12, -16, 38]].forEach(([x, y, h]) => {
        rr(x, y, 14, h + 8 - (y < 0 ? 0 : 8), 3);
        c.fill();
      });
      break;
    }
    case 'chart': {
      c.beginPath();
      c.moveTo(-40, -36);
      c.lineTo(-40, 34);
      c.lineTo(42, 34);
      c.stroke();
      c.strokeStyle = C.full;
      c.globalAlpha = 0.55;
      c.beginPath();
      c.moveTo(-32, 20);
      c.lineTo(-10, -2);
      c.lineTo(10, 8);
      c.lineTo(36, -30);
      c.stroke();
      c.globalAlpha = 1;
      c.strokeStyle = accent;
      c.beginPath();
      c.moveTo(-32, 22);
      c.lineTo(-10, 14);
      c.lineTo(10, 18);
      c.lineTo(36, 4);
      c.stroke();
      break;
    }
    case 'globe': {
      c.beginPath();
      c.arc(0, 0, 38, 0, Math.PI * 2);
      c.stroke();
      c.beginPath();
      c.ellipse(0, 0, 16, 38, 0, 0, Math.PI * 2);
      c.moveTo(-38, 0);
      c.lineTo(38, 0);
      c.moveTo(-32, -18);
      c.lineTo(32, -18);
      c.moveTo(-32, 18);
      c.lineTo(32, 18);
      c.lineWidth = 5;
      c.stroke();
      c.fillStyle = accent;
      c.beginPath();
      c.arc(26, -26, 10, 0, Math.PI * 2);
      c.fill();
      break;
    }
    case 'phone': {
      rr(-24, -42, 48, 84, 10);
      c.stroke();
      c.fillStyle = accent;
      paw(0, -2, 1);
      break;
    }
    case 'pin': {
      c.fillStyle = accent;
      c.beginPath();
      c.moveTo(0, 42);
      c.bezierCurveTo(-8, 22, -32, 8, -32, -12);
      c.arc(0, -12, 32, Math.PI, 0);
      c.bezierCurveTo(32, 8, 8, 22, 0, 42);
      c.fill();
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.arc(0, -12, 12, 0, Math.PI * 2);
      c.fill();
      break;
    }
    case 'heart': {
      c.fillStyle = accent;
      c.beginPath();
      c.moveTo(0, -14);
      c.bezierCurveTo(-24, -46, -60, -10, 0, 36);
      c.bezierCurveTo(60, -10, 24, -46, 0, -14);
      c.fill();
      break;
    }
    case 'home': {
      c.beginPath();
      c.moveTo(-40, -2);
      c.lineTo(0, -38);
      c.lineTo(40, -2);
      c.moveTo(-30, -10);
      c.lineTo(-30, 36);
      c.lineTo(30, 36);
      c.lineTo(30, -10);
      c.stroke();
      c.fillStyle = C.heart;
      c.beginPath();
      c.moveTo(0, 4);
      c.bezierCurveTo(-10, -8, -24, 4, 0, 24);
      c.bezierCurveTo(24, 4, 10, -8, 0, 4);
      c.fill();
      break;
    }
    case 'paw':
      c.fillStyle = accent;
      paw(0, 0, 2.2);
      break;
    case 'people': {
      c.beginPath();
      c.arc(-16, -16, 13, 0, Math.PI * 2);
      c.arc(20, -12, 11, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.ellipse(-16, 24, 26, 18, 0, Math.PI, 0);
      c.fill();
      c.fillStyle = accent;
      c.beginPath();
      c.ellipse(20, 24, 20, 15, 0, Math.PI, 0);
      c.fill();
      break;
    }
    case 'question': {
      c.lineWidth = 10;
      c.beginPath();
      c.arc(0, -12, 20, Math.PI * 1.1, Math.PI * 0.45);
      c.lineTo(0, 16);
      c.stroke();
      c.beginPath();
      c.arc(0, 34, 6, 0, Math.PI * 2);
      c.fill();
      break;
    }
    case 'stack': {
      c.fillStyle = accent;
      for (let i = 0; i < 4; i++) {
        rr(-30 + (i % 2) * 6, 22 - i * 18, 60, 14, 6);
        c.fill();
      }
      break;
    }
    case 'search': {
      c.beginPath();
      c.arc(-8, -8, 26, 0, Math.PI * 2);
      c.stroke();
      c.lineWidth = 11;
      c.beginPath();
      c.moveTo(12, 12);
      c.lineTo(36, 36);
      c.stroke();
      break;
    }
    case 'qr': {
      for (const [x, y] of [[-36, -36], [12, -36], [-36, 12]]) {
        rr(x, y, 24, 24, 4);
        c.stroke();
      }
      c.fillStyle = accent;
      for (const [x, y] of [[12, 12], [26, 26], [12, 30], [30, 10]]) c.fillRect(x, y, 8, 8);
      break;
    }
    case 'shield': {
      c.beginPath();
      c.moveTo(0, -40);
      c.lineTo(34, -26);
      c.quadraticCurveTo(34, 24, 0, 42);
      c.quadraticCurveTo(-34, 24, -34, -26);
      c.closePath();
      c.stroke();
      c.strokeStyle = accent;
      c.beginPath();
      c.moveTo(-14, 0);
      c.lineTo(-2, 12);
      c.lineTo(18, -12);
      c.stroke();
      break;
    }
  }
  c.restore();
}

/** การ์ดไอคอน: พื้นขาวมน + วงทองอ่อน + ไอคอน */
export async function iconCardTexture(kit: GLKit, name: IconName, opts: { size?: number; bg?: string; ring?: string; ink?: string; accent?: string } = {}): Promise<THREE.CanvasTexture> {
  const S = opts.size ?? 512;
  return kit.canvasTex(S, S, (c) => {
    c.fillStyle = opts.bg ?? '#ffffff';
    c.fillRect(0, 0, S, S);
    const g = c.createRadialGradient(S / 2, S / 2, S * 0.05, S / 2, S / 2, S * 0.42);
    g.addColorStop(0, opts.ring ?? 'rgba(244,180,0,0.22)');
    g.addColorStop(1, 'rgba(244,180,0,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, S, S);
    drawIcon(c, name, S / 2, S / 2, S * 0.5, opts.ink ?? C.ink, opts.accent ?? C.gold);
  });
}

/** ภาพ atlas (ภาพคน/บ้าน/สัตว์) ตัดเป็น texture แยกด้วย canvas (UV ตรงไปตรงมา ใช้กับรูปทรงใดก็ได้) */
export async function atlasCanvasTex(kit: GLKit, url: string, columns: number, rows: number, index: number, size = 512, crop?: { x: number; y: number; w: number; h: number }): Promise<THREE.CanvasTexture> {
  const img = await kit.image(url);
  return kit.canvasTex(size, size, (c) => {
    const sw = img.width / columns;
    const sh = img.height / rows;
    let sx = (index % columns) * sw;
    let sy = Math.floor(index / columns) * sh;
    let w = sw;
    let h = sh;
    if (crop) {
      sx += crop.x * sw;
      sy += crop.y * sh;
      w = crop.w * sw;
      h = crop.h * sh;
    }
    const k = Math.min(w, h);
    c.drawImage(img, sx + (w - k) / 2, sy + (h - k) / 2, k, k, 0, 0, size, size);
  });
}

/** เงานุ่มบนพื้น */
export async function contactShadow(kit: GLKit, w: number, h: number, opacity = 0.5): Promise<THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>> {
  const tex = await kit.canvasTex(256, 128, (c) => {
    const g = c.createRadialGradient(128, 64, 4, 128, 64, 120);
    g.addColorStop(0, `rgba(70,45,20,${opacity})`);
    g.addColorStop(1, 'rgba(70,45,20,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 128);
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }));
  m.rotation.x = -Math.PI / 2;
  return m;
}

/** รูปอุ้งเท้า 3 มิติ (extrude + bevel) */
export function pawGeometry(size = 1, depth = 0.22): THREE.ExtrudeGeometry {
  const shapes: THREE.Shape[] = [];
  const ell = (cx: number, cy: number, rx: number, ry: number) => {
    const s = new THREE.Shape();
    s.absellipse(cx * size, cy * size, rx * size, ry * size, 0, Math.PI * 2, false, 0);
    shapes.push(s);
  };
  ell(0, -0.16, 0.27, 0.23);
  ell(-0.31, 0.1, 0.1, 0.125);
  ell(-0.12, 0.28, 0.1, 0.13);
  ell(0.12, 0.28, 0.1, 0.13);
  ell(0.31, 0.1, 0.1, 0.125);
  const g = new THREE.ExtrudeGeometry(shapes, { depth, bevelEnabled: true, bevelThickness: depth * 0.45, bevelSize: size * 0.03, bevelSegments: 6, curveSegments: 40 });
  g.center();
  return g;
}

/** โลโก้ C หางแมว (เส้นเดียวกับ Wordmark ในแอป) เป็น path 3 มิติสำหรับ TubeGeometry */
export function tailCurve(scale = 1): THREE.CurvePath<THREE.Vector3> {
  // จาก SVG: M35 36C25 42 11 37 10 25 9 15 16 8 25 8c7 0 12 4 11 8-.5 4-4 5-7 2 (viewBox 48)
  const p = (x: number, y: number) => new THREE.Vector3(((x - 24) / 48) * scale, (-(y - 24) / 48) * scale, 0);
  const path = new THREE.CurvePath<THREE.Vector3>();
  path.add(new THREE.CubicBezierCurve3(p(35, 36), p(25, 42), p(11, 37), p(10, 25)));
  path.add(new THREE.CubicBezierCurve3(p(10, 25), p(9, 15), p(16, 8), p(25, 8)));
  path.add(new THREE.CubicBezierCurve3(p(25, 8), p(32, 8), p(37, 12), p(36, 16)));
  path.add(new THREE.CubicBezierCurve3(p(36, 16), p(35.5, 20), p(32, 21), p(29, 18)));
  return path;
}

export function disposeTree(o: THREE.Object3D) {
  o.traverse((x) => {
    const m = x as THREE.Mesh;
    m.geometry?.dispose?.();
    const mat = m.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(mat)) mat.forEach((mm) => mm.dispose());
    else mat?.dispose?.();
  });
}

/** โทรศัพท์ 3 มิติสีแชมเปญ (ทรงเดียวกับช็อตแอปจริง) — ความสูงจอ h หน่วย อัตราส่วน 390×844 */
export function phoneModel(screen: THREE.Texture, h = 4.4): THREE.Group {
  const w = (h * 390) / 844;
  const g = new THREE.Group();
  const bez = h * 0.022;
  const depth = h * 0.06;
  const body = new THREE.Mesh(new RoundedBoxGeometry(w + bez * 2, h + bez * 2, depth, 6, h * 0.07), new THREE.MeshPhysicalMaterial({ color: '#cfa96b', metalness: 0.85, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.2 }));
  g.add(body);
  const face = new THREE.Mesh(shapeGeo(roundedShape(w, h, h * 0.055), w, h), new THREE.MeshBasicMaterial({ map: screen, toneMapped: false }));
  face.position.z = depth / 2 + 0.003;
  face.name = 'screen';
  g.add(face);
  return g;
}

/** เหรียญฟีเจอร์: ขอบทอง หน้าขาวมีไอคอน (ใช้ทำวงโคจรของฟีเจอร์) */
export function featureCoin(face: THREE.Texture, r = 0.5): THREE.Group {
  const g = new THREE.Group();
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(r, r, r * 0.22, 48), goldMaterial());
  rim.rotation.x = Math.PI / 2;
  g.add(rim);
  const f = new THREE.Mesh(new THREE.CircleGeometry(r * 0.86, 48), new THREE.MeshBasicMaterial({ map: face, toneMapped: false }));
  f.position.z = r * 0.111 + 0.002;
  g.add(f);
  return g;
}

/** พื้นหลังกลางคืนโทนเทคโนโลยี: น้ำเงินเข้มอมม่วง + แสงทองจาง */
export async function nightStudio(kit: GLKit, scene: THREE.Scene, env = 0.7) {
  return studio(kit, scene, { top: '#151838', mid: '#0f1129', bottom: '#0a0b1c', glow: 'rgba(120,110,255,0.16)', env });
}

/** ทรงกลมจุดเรืองแสง (เครือข่ายทั่วเมือง) */
export function dotSphere(tex: THREE.Texture, n: number, r: number, color: string = C.gold, size = 0.09): THREE.Points {
  const pts: number[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = golden * i;
    pts.push(Math.cos(th) * rad * r, y * r, Math.sin(th) * rad * r);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return new THREE.Points(g, new THREE.PointsMaterial({ size, map: tex, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0.8 }));
}
