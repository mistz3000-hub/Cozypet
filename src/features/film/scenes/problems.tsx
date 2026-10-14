/**
 * ปัญหา 3 ข้อ (2 ห้อง หรือ 1 ห้องในเวอร์ชันสั้น) — โทนมืด สปอตไลต์ลงแท่นทีละแท่น กล้องเหวี่ยง (whip pan) จากแท่น 1 → 2 → 3 แล้วถอยเห็นทั้งหมด
 * ① ถังรับน้องล้นอยู่ถังเดียว ที่เหลือว่าง ② โทรศัพท์/ประกาศกระจัดกระจาย โทรหาไม่ติด ③ กล่องบริจาคหายเข้าไปในหมอก
 * ข้อความเป็น DOM วางตามตำแหน่งแท่น (project)
 */
import * as THREE from 'three';
import type { CSSProperties } from 'react';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { GLKit, GLScene } from '../gl';
import type { FilmContext, SceneProps } from '../context';
import type { Shot } from '../cuts';
import { clamp, ease, fbm, lerp, prog } from '../timeline';
import { rngFromKey } from '@/lib/seeded-random';
import type { SceneModule, SceneSfx } from './types';
import { C, Floaters, applyCam, card3d, glowSprite, glowTexture, iconCardTexture, makeCamera, project, setShock, shockRing, softMaterial, studio, type CamRig } from './stage';
import s from './scenes.module.css';

const X = [-4.6, 0, 4.6];
const BASE_Y = -1.0;
/** เวลาที่กล้องถึงแท่นแต่ละแท่น / เหวี่ยง / ถอยกว้าง (เวอร์ชันเต็ม) */
const ARRIVE = [0, 1.5, 3.0];
const WHIP = 0.24;
const WIDE = 4.45;

function times(single: boolean): number[] {
  return single ? [0.05, 0.45, 0.85] : ARRIVE.map((a) => a + 0.05);
}

function closeRig(i: number, t: number): CamRig {
  const orbit = 0.5 * Math.sin(t * 0.7 + i);
  return { pos: [X[i] + 1.55 + orbit, 1.6, 9.2], look: [X[i] + 1.55, 0.35, 0], fov: 30, roll: 0.012 * Math.sin(t * 0.9) };
}

const wideRig = (t: number): CamRig => ({ pos: [0.3 * Math.sin(t * 0.5), 2.4, 13.8], look: [0, 0.2, 0], fov: 30 });

function lerpRig(a: CamRig, b: CamRig, k: number): CamRig {
  return {
    pos: [lerp(a.pos[0], b.pos[0], k), lerp(a.pos[1], b.pos[1], k), lerp(a.pos[2], b.pos[2], k)],
    look: [lerp(a.look[0], b.look[0], k), lerp(a.look[1], b.look[1], k), lerp(a.look[2], b.look[2], k)],
    fov: lerp(a.fov, b.fov, k),
    roll: lerp(a.roll ?? 0, b.roll ?? 0, k) + 0.05 * Math.sin(k * Math.PI),
  };
}

function rig(t: number, single: boolean): CamRig {
  if (single) return wideRig(t);
  if (t >= WIDE) return lerpRig(closeRig(2, t), wideRig(t), ease.inOut(prog(t, WIDE, WIDE + 0.6)));
  for (let i = 2; i >= 1; i--) {
    if (t >= ARRIVE[i] - WHIP / 2) return lerpRig(closeRig(i - 1, t), closeRig(i, t), ease.inOut(prog(t, ARRIVE[i] - WHIP / 2, ARRIVE[i] + WHIP / 2)));
  }
  return closeRig(0, t);
}

/** 0..1 ความแรงของการเหวี่ยงกล้อง (ใช้เบลอ canvas) */
function whipAmount(t: number, single: boolean): number {
  if (single) return 0;
  let w = 0;
  for (const a of ARRIVE.slice(1)) w = Math.max(w, 1 - Math.abs(t - a) / (WHIP / 2));
  return clamp(w);
}

class ProblemsScene implements GLScene {
  scene = new THREE.Scene();
  camera = makeCamera();
  private single = false;
  private peds: THREE.Group[] = [];
  private pools: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>[] = [];
  private cones: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial>[] = [];
  private spots: THREE.SpotLight[] = [];
  private fills: THREE.Mesh[] = [];
  private tokens: THREE.Mesh[] = [];
  private alarm!: THREE.Sprite;
  private bits: THREE.Group[] = [];
  private rings: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>[] = [];
  private noise = fbm('cozypet:v1:film:problems');
  private box!: THREE.Group;
  private puffs: THREE.Sprite[] = [];
  private ask!: THREE.Group;
  private floaters!: Floaters;

  async init(kit: GLKit) {
    const { scene } = this;
    await studio(kit, scene, { top: '#2d2520', mid: '#1f1916', bottom: '#151110', glow: 'rgba(255,214,160,0.10)', env: 0.55 });
    scene.children.filter((o) => (o as THREE.Light).isLight).forEach((l) => ((l as THREE.Light).intensity *= 0.35));
    const glow = await glowTexture(kit);
    this.floaters = new Floaters(glow, 50, 'problems', { x: 30, y: 14, z0: -12, z1: -2 }, ['#ffd9a0', '#f4b400', '#ffffff'], 0.16);
    scene.add(this.floaters.mesh);

    // พื้นมันวาวโทนเข้ม + วงแสงสปอตไลต์
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 40), new THREE.MeshPhysicalMaterial({ color: '#120d0a', roughness: 0.42, metalness: 0, clearcoat: 0.5, envMapIntensity: 0.12 }));
    scene.fog = new THREE.Fog('#1b1512', 12, 34);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = BASE_Y - 0.35;
    scene.add(floor);
    const poolTex = await kit.canvasTex(256, 256, (c) => {
      const g = c.createRadialGradient(128, 128, 4, 128, 128, 127);
      g.addColorStop(0, 'rgba(255,226,170,0.75)');
      g.addColorStop(0.5, 'rgba(255,200,120,0.25)');
      g.addColorStop(1, 'rgba(255,200,120,0)');
      c.fillStyle = g;
      c.fillRect(0, 0, 256, 256);
    });
    const coneTex = await kit.canvasTex(64, 256, (c) => {
      const g = c.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, 'rgba(255,230,180,0.0)');
      g.addColorStop(0.25, 'rgba(255,230,180,0.5)');
      g.addColorStop(1, 'rgba(255,230,180,0.05)');
      c.fillStyle = g;
      c.fillRect(0, 0, 64, 256);
    });

    const pedMat = softMaterial('#fff7ea', 0.5);
    const lipMat = new THREE.MeshPhysicalMaterial({ color: C.gold, metalness: 0.9, roughness: 0.25, clearcoat: 1 });
    for (let i = 0; i < 3; i++) {
      const g = new THREE.Group();
      const ped = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.0, 0.34, 64), pedMat);
      ped.position.y = -0.17;
      g.add(ped);
      const lip = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.04, 8, 96), lipMat);
      lip.rotation.x = Math.PI / 2;
      g.add(lip);
      g.position.set(X[i], BASE_Y, 0);
      scene.add(g);
      this.peds.push(g);
      const pool = new THREE.Mesh(new THREE.CircleGeometry(3.6, 48), new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
      pool.rotation.x = -Math.PI / 2;
      pool.position.set(X[i], BASE_Y - 0.34, 0);
      scene.add(pool);
      this.pools.push(pool);
      const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 2.2, 9, 48, 1, true), new THREE.MeshBasicMaterial({ map: coneTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide, opacity: 0.08, fog: false }));
      cone.position.set(X[i], BASE_Y + 4.3, -0.3);
      scene.add(cone);
      this.cones.push(cone);
      const sp = new THREE.SpotLight('#ffe2b0', 0, 18, 0.42, 0.6, 0);
      sp.position.set(X[i], 7, 1.5);
      sp.target.position.set(X[i], BASE_Y, 0);
      scene.add(sp, sp.target);
      this.spots.push(sp);
    }

    // ① ถังรับน้อง 4 ใบ: ใบแรกล้น ใบอื่นว่าง
    const glass = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.06, transparent: true, opacity: 0.22, clearcoat: 1, depthWrite: false });
    const tankX = [-1.0, -0.15, 0.62, 1.32];
    const tankZ = [0.3, -0.4, 0.35, -0.3];
    for (let i = 0; i < 4; i++) {
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 1.8, 40, 1, true), glass);
      tank.position.set(tankX[i], 0.9, tankZ[i]);
      tank.renderOrder = 2;
      this.peds[0].add(tank);
      const fill = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1, 40), new THREE.MeshPhysicalMaterial({ color: i === 0 ? '#e0473a' : '#7fc9a4', roughness: 0.35, clearcoat: 0.8, emissive: i === 0 ? '#ff2a10' : '#000000', emissiveIntensity: i === 0 ? 0.35 : 0 }));
      fill.position.set(tankX[i], 0, tankZ[i]);
      this.peds[0].add(fill);
      this.fills.push(fill);
    }
    for (let i = 0; i < 6; i++) {
      const tok = new THREE.Mesh(new THREE.SphereGeometry(0.19, 24, 16), softMaterial(i % 2 ? '#f4a95a' : '#efd9b6', 0.4));
      tok.visible = false;
      this.peds[0].add(tok);
      this.tokens.push(tok);
    }
    this.alarm = glowSprite(glow, '#ff3b2a', 3.2, 0);
    this.alarm.position.set(-1.0, 1.9, 0.4);
    this.peds[0].add(this.alarm);

    // ② โทรศัพท์ ประกาศ และเครื่องหมายคำถามกระจัดกระจาย
    const icons: ('phone' | 'notice' | 'question' | 'search')[] = ['phone', 'notice', 'phone', 'question', 'notice', 'phone', 'search'];
    for (let i = 0; i < icons.length; i++) {
      const tex = await iconCardTexture(kit, icons[i], { size: 256, accent: icons[i] === 'question' ? C.full : C.gold });
      const card = card3d(0.86, 0.86, { depth: 0.09, radius: 0.16, face: tex, faceInset: 0.03 });
      this.peds[1].add(card);
      this.bits.push(card);
      if (icons[i] === 'phone') {
        const r = shockRing(C.gold);
        this.peds[1].add(r);
        this.rings.push(r);
      }
    }

    // ③ กล่องบริจาคเดินเข้าหมอก แล้วมีเครื่องหมายคำถามโผล่
    this.box = new THREE.Group();
    const kraft = softMaterial('#c89a63', 0.75);
    this.box.add(new THREE.Mesh(new RoundedBoxGeometry(0.95, 0.75, 0.8, 3, 0.06), kraft));
    this.box.add(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.76, 0.81), softMaterial('#e8d3a6', 0.5)));
    const heartTex = await iconCardTexture(kit, 'heart', { size: 128, bg: '#c89a63', ring: 'rgba(0,0,0,0)', accent: C.heart });
    const label = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), new THREE.MeshBasicMaterial({ map: heartTex, toneMapped: false }));
    label.position.set(0.28, 0, 0.402);
    this.box.add(label);
    this.peds[2].add(this.box);
    const puff = await kit.canvasTex(256, 256, (c) => {
      const rnd = rngFromKey('cozypet:v1:film:fog');
      for (let k = 0; k < 14; k++) {
        const x = 70 + rnd() * 116;
        const y = 70 + rnd() * 116;
        const rad = 40 + rnd() * 60;
        const g = c.createRadialGradient(x, y, 4, x, y, rad);
        g.addColorStop(0, 'rgba(255,255,255,0.5)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = g;
        c.fillRect(0, 0, 256, 256);
      }
    });
    for (let k = 0; k < 8; k++) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: puff, color: k % 2 ? '#2e2a38' : '#4a4458', transparent: true, opacity: 0.92, depthWrite: false, toneMapped: false }));
      this.peds[2].add(sp);
      this.puffs.push(sp);
    }
    const qTex = await iconCardTexture(kit, 'question', { size: 256, accent: C.full, ink: C.full });
    this.ask = card3d(0.95, 0.95, { depth: 0.1, radius: 0.18, face: qTex, faceInset: 0.03 });
    this.peds[2].add(this.ask);
  }

  render(t: number, kit: GLKit, shot?: Shot) {
    this.single = shot?.variant === 'single';
    applyCam(this.camera, rig(t, this.single));
    const ts = times(this.single);
    const sp = this.single ? 1.9 : 1;
    this.peds.forEach((g, i) => {
      const p = ease.backOut(prog(t, ts[i] - 0.05, ts[i] + 0.5));
      g.position.y = BASE_Y - 3.2 * (1 - p);
      g.scale.setScalar(Math.max(0.001, lerp(0.6, 1, p)));
      g.rotation.y = (1 - p) * 0.8 + 0.06 * Math.sin(t * 0.6 + i);
      g.visible = p > 0.001;
      const on = ease.out(prog(t, ts[i] - 0.15, ts[i] + 0.15));
      this.spots[i].intensity = 2.6 * on;
      this.pools[i].material.opacity = 0.55 * on;
      this.cones[i].material.opacity = 0.075 * on * (0.9 + 0.1 * Math.sin(t * 7 + i));
    });

    // ① ถังใบแรกเติมจนล้น ใบอื่นเกือบว่าง
    const t1 = (t - ts[0]) * sp;
    const levels = [lerp(0.45, 1.12, ease.out(prog(t1, 0.3, 1.5))), 0.12, 0.08, 0.16];
    this.fills.forEach((f, i) => {
      const h = 1.75 * levels[i];
      f.scale.set(1, h, 1);
      f.position.y = h / 2 + 0.02;
    });
    this.tokens.forEach((tok, i) => {
      const a = 0.25 + i * 0.18;
      const k = prog(t1, a, a + 0.35);
      const spill = i >= 3;
      const yTop = spill ? 1.98 + 0.2 * (i - 3) : 1.98;
      tok.position.set(-1.0 + (spill ? (i - 4) * 0.27 : 0), lerp(3.4, yTop, ease.in(k)) - (k >= 1 && !spill ? 0.5 : 0), 0.3 + (spill ? 0.15 : 0));
      if (spill && k >= 1) tok.position.y = yTop - 0.05 * Math.abs(Math.sin(t * 6 + i));
      tok.visible = t1 > a && (spill || k < 1);
    });
    this.alarm.material.opacity = prog(t1, 0.9, 1.3) * (0.45 + 0.35 * Math.max(0, Math.sin(t * 9)));

    // ② กระจัดกระจาย หมุน และสั่นเหมือนโทรหาไม่ติด
    const t2 = (t - ts[1]) * sp;
    let ri = 0;
    this.bits.forEach((b, i) => {
      const a = (i / this.bits.length) * Math.PI * 2;
      const n = this.noise;
      const spread = ease.out(prog(t2, 0, 0.8));
      const rr = lerp(0.2, 1.45 + 0.25 * n(i * 3.1), spread);
      b.position.set(Math.cos(a + t * 0.25) * rr, 1.05 + 0.6 * Math.sin(a * 2 + t * 0.7) * spread + 0.35 * n(t * 0.8 + i), Math.sin(a + t * 0.25) * rr * 0.6);
      const ringing = i % 2 === 0 && t2 > 0.4;
      const buzz = ringing ? 0.12 * Math.sin(t * 60 + i) * (Math.sin(t * 4 + i) > 0.2 ? 1 : 0) : 0;
      const e = new THREE.Euler(0.4 * n(t * 0.5 + i * 2), 0.6 * n(t * 0.4 + i) + buzz, 0.3 * n(t * 0.6 + i * 5) + buzz);
      b.quaternion.copy(this.camera.quaternion).multiply(new THREE.Quaternion().setFromEuler(e));
      b.scale.setScalar(Math.max(0.001, ease.backOut(prog(t2, 0.05 * i, 0.05 * i + 0.4))));
      if (this.rings[ri] && i % 2 === 0) {
        const ring = this.rings[ri++];
        ring.position.copy(b.position);
        ring.quaternion.copy(this.camera.quaternion);
        setShock(ring, t2 < 0.4 ? -1 : (t2 - 0.4 + i * 0.13) % 0.8, 0.95, 0.7);
      }
    });

    // ③ กล่องเดินเข้าหมอกแล้วหายไป
    const t3 = (t - ts[2]) * sp;
    const go = ease.inOut(prog(t3, 0.3, 1.25));
    this.box.position.set(lerp(-1.3, 0.75, go), 0.42 + 0.14 * Math.abs(Math.sin(go * Math.PI * 3)), lerp(0.5, -0.2, go));
    this.box.rotation.set(0, lerp(0.5, -0.2, go), 0.05 * Math.sin(go * Math.PI * 6));
    this.box.scale.setScalar(Math.max(0.001, 1 - prog(t3, 1.05, 1.35)));
    const gulp = 0.15 * Math.sin(prog(t3, 1.05, 1.5) * Math.PI);
    this.puffs.forEach((p, k) => {
      const a = (k / this.puffs.length) * Math.PI * 2 + t * (k % 2 ? 0.5 : -0.4);
      const rad = 0.42 + 0.1 * Math.sin(t * 1.3 + k);
      p.position.set(0.75 + Math.cos(a) * rad, 1.1 + Math.sin(a) * rad * 0.7, -0.2 + (k % 3) * 0.25);
      const sc = (1.5 + 0.25 * Math.sin(t * 1.7 + k * 2)) * (1 + gulp) * ease.out(prog(t3, 0, 0.5));
      p.scale.set(Math.max(0.001, sc), Math.max(0.001, sc), 1);
      p.material.rotation = a * 0.5;
    });
    const ask = ease.backOut(prog(t3, 1.3, 1.7));
    this.ask.scale.setScalar(Math.max(0.001, ask));
    this.ask.position.set(0.75, 2.45 + 0.08 * Math.sin(t * 3), 0.3);
    this.ask.rotation.y = 0.25 * Math.sin(t * 1.7);
    this.ask.visible = ask > 0.001;

    this.floaters.update(t + 40, this.camera);
    kit.renderer.render(this.scene, this.camera);
  }
}

function ProblemsOverlay({ t, shot, ctx }: SceneProps) {
  const fm = ctx.fm;
  const single = shot.variant === 'single';
  const ts = times(single);
  const r = rig(t, single);
  const wide = single ? 1 : ease.inOut(prog(t, WIDE + 0.2, WIDE + 0.7));
  const titleIn = single ? ease.out(prog(t, 0, 0.4)) : wide;
  return (
    <div className={s.full}>
      <p className={s.probTitle} style={{ opacity: titleIn, transform: `translateY(${(1 - titleIn) * -14}px)` }}>{fm.problems.title}</p>
      {/* ใกล้: ตัวเลขใหญ่ + ข้อความด้านขวาของแท่น */}
      {!single
        ? fm.problems.items.map((txt, i) => {
          const a = ARRIVE[i];
          const end = i < 2 ? ARRIVE[i + 1] - WHIP / 2 : WIDE + 0.15;
          const pin = ease.out(prog(t, a + 0.12, a + 0.5));
          const pout = ease.in(prog(t, end - 0.12, end + 0.05));
          const o = pin * (1 - pout);
          if (o <= 0.001) return null;
          const style: CSSProperties = { opacity: o, transform: `translateX(${(1 - pin) * 80 - pout * 120}px)` };
          return (
            <div key={i} className={s.probBig} style={style}>
              <span className={s.probBigNum}>{String(i + 1).padStart(2, '0')}</span>
              <p>{txt}</p>
            </div>
          );
        })
        : null}
      {/* กว้าง: ป้ายใต้แท่น */}
      {fm.problems.items.map((txt, i) => {
        const p = single ? ease.backOut(prog(t, ts[i] + 0.15, ts[i] + 0.6)) : ease.backOut(prog(t, WIDE + 0.35 + i * 0.08, WIDE + 0.8 + i * 0.08));
        if (p <= 0.001) return null;
        const at = project(r, [X[i], BASE_Y - 0.45, 2.0]);
        return (
          <div key={i} className={s.probItem} style={{ left: at.x, top: at.y + 20, opacity: clamp(p * 1.3), transform: `translate(-50%, ${(1 - p) * 30}px)` }}>
            <span className={s.probNum}>{i + 1}</span>
            <p>{txt}</p>
          </div>
        );
      })}
    </div>
  );
}

function problemsSfx(shot: Shot): SceneSfx[] {
  const single = shot.variant === 'single';
  const ts = times(single);
  const sp = single ? 1.9 : 1;
  const ev: SceneSfx[] = [];
  ts.forEach((a, i) => {
    if (!single && i > 0) ev.push({ at: ARRIVE[i] - WHIP / 2 - 0.05, kind: 'whoosh', dur: WHIP + 0.1, gain: 0.7, pan: 0.6 });
    ev.push({ at: a - 0.02, kind: 'thud', note: i, gain: 0.8, pan: single ? (i - 1) * 0.5 : 0 });
    ev.push({ at: a, kind: 'glass', note: 2 + i, gain: 0.35 });
  });
  for (let i = 0; i < 3; i++) ev.push({ at: ts[0] + (0.25 + i * 0.18 + 0.35) / sp, kind: 'drop', note: 5 - i, gain: 0.45 });
  ev.push({ at: ts[0] + 0.9 / sp, kind: 'zap', gain: 0.4 });
  for (let k = 0; k < (single ? 1 : 2); k++) ev.push({ at: ts[1] + (0.4 + k * 0.6) / sp, kind: 'tick', note: 7, gain: 0.3 });
  ev.push({ at: ts[2] + 0.3 / sp, kind: 'whoosh', dur: 0.9 / sp, gain: 0.3 });
  ev.push({ at: ts[2] + 1.3 / sp, kind: 'pop', note: 1, gain: 0.55 });
  if (!single) ev.push({ at: WIDE, kind: 'riser', dur: 0.85, gain: 0.45 });
  return ev;
}

export const problems: SceneModule = {
  gl: (_ctx: FilmContext) => new ProblemsScene(),
  Overlay: ProblemsOverlay,
  hud: 'dark',
  sfx: problemsSfx,
  canvasStyle: (t) => {
    const w = whipAmount(t, false);
    return w > 0.01 ? { filter: `blur(${(w * 9).toFixed(2)}px)` } : {};
  },
  post: () => ({ bloom: 1.0, threshold: 0.85, vignette: 0.45, contrast: 1.08, tint: 0.45 }),
};
