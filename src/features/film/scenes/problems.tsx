/**
 * ปัญหา 3 ข้อ (2 ห้อง หรือ 1 ห้องในเวอร์ชันสั้น) — โทนมืด สปอตไลต์ลงแท่นทีละแท่น กล้องเหวี่ยง (whip pan) จากแท่น 1 → 2 → 3 แล้วถอยเห็นทั้งหมด
 * ① ถังรับน้องล้นอยู่ถังเดียว ที่เหลือว่าง ② โทรศัพท์/ประกาศกระจัดกระจาย โทรหาไม่ติด ③ กล่องบริจาคหายเข้าไปในหมอก
 * ข้อความเป็น DOM วางตามตำแหน่งแท่น (project)
 */
import * as THREE from 'three';
import type { CSSProperties } from 'react';
import type { GLKit, GLScene } from '../gl';
import type { FilmContext, SceneProps } from '../context';
import type { Shot } from '../cuts';
import { clamp, ease, fbm, lerp, prog } from '../timeline';
import { rngFromKey } from '@/lib/seeded-random';
import { SupplyBox, iconDisc, preloadKraft } from '../props/objects';
import type { SceneModule, SceneSfx } from './types';
import { C, Floaters, applyCam, card3d, glowSprite, glowTexture, iconCardTexture, makeCamera, project, setShock, shockRing, softMaterial, studio, type CamRig } from './stage';
import s from './scenes.module.css';

const X = [-4.6, 0, 4.6];
/** หลอดแก้ว ① (พิกัดในแท่น) */
const TUBE = { x: [-0.95, -0.12, 0.66, 1.38], z: [0.25, -0.35, 0.3, -0.25], r: 0.39, h: 1.75, base: 0.1 };
const CAT_R = 0.155;
/** จำนวนน้องแมว: เรียงในหลอดแรก 12 · ล้นออก 4 · หลอด 3 และ 4 มีหลอดละ 1 */
const STACK = 12;
const SPILL = 4;
const CATS = STACK + SPILL + 2;

/** ตำแหน่งปลายทางของน้องตัวที่ i ในหลอดแรก (2 ตัวต่อชั้น สลับมุม) */
function stackPos(i: number): THREE.Vector3 {
  const layer = Math.floor(i / 2);
  const a = (i % 2) * Math.PI + layer * 1.15 + 0.4;
  const off = TUBE.r - 0.035 - CAT_R - 0.012;
  return new THREE.Vector3(TUBE.x[0] + Math.cos(a) * off, TUBE.base + CAT_R + 0.01 + layer * 0.272, TUBE.z[0] + Math.sin(a) * off * 0.9);
}
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
  private cats: THREE.Sprite[] = [];
  private glass0!: THREE.MeshPhysicalMaterial;
  private rim0!: THREE.MeshPhysicalMaterial;
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

    // ① หลอดแก้วรับน้อง 4 หลอด: น้องแมวลูกกลมหล่นลงหลอดแรกหลอดเดียวจนล้น หลอดอื่นแทบว่าง
    // แก้วใส: ผนังชั้นเดียว 2 หน้า ความทึบต่ำ ให้เห็นน้องข้างใน — ขอบสว่างมาจากเงาสะท้อน clearcoat
    const glassMat = () => new THREE.MeshPhysicalMaterial({ color: '#eaf4ff', roughness: 0.05, metalness: 0, transparent: true, opacity: 0.07, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 0.9, specularIntensity: 1, depthWrite: false, side: THREE.DoubleSide });
    const rimMat = () => new THREE.MeshPhysicalMaterial({ color: C.gold, metalness: 0.9, roughness: 0.22, clearcoat: 1 });
    for (let i = 0; i < 4; i++) {
      const g = glassMat();
      const r = rimMat();
      if (i === 0) {
        this.glass0 = g;
        this.rim0 = r;
      }
      const tube = new THREE.Group();
      tube.position.set(TUBE.x[i], 0, TUBE.z[i]);
      const wall = new THREE.Mesh(new THREE.CylinderGeometry(TUBE.r, TUBE.r, TUBE.h, 48, 1, true), g);
      wall.position.y = TUBE.base + TUBE.h / 2;
      wall.renderOrder = 3;
      // แถบสะท้อนแสงแนวตั้ง 2 เส้น (หันเข้ากล้อง) ให้รู้ว่าเป็นแก้ว
      const shine = new THREE.Mesh(new THREE.PlaneGeometry(0.05, TUBE.h * 0.86), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.32, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
      shine.position.set(-TUBE.r * 0.55, TUBE.base + TUBE.h * 0.5, TUBE.r * 0.82);
      const shine2 = shine.clone();
      shine2.scale.x = 0.45;
      shine2.position.x = -TUBE.r * 0.32;
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(TUBE.r + 0.04, TUBE.r + 0.07, TUBE.base, 48), new THREE.MeshPhysicalMaterial({ color: '#f3e8d8', roughness: 0.15, transmission: 0, clearcoat: 1, transparent: true, opacity: 0.65 }));
      foot.position.y = TUBE.base / 2;
      const lip = new THREE.Mesh(new THREE.TorusGeometry(TUBE.r - 0.012, 0.032, 12, 64), r);
      lip.rotation.x = Math.PI / 2;
      lip.position.y = TUBE.base + TUBE.h;
      tube.add(wall, shine, shine2, foot, lip);
      this.peds[0].add(tube);
    }
    // น้องแมวลูกกลม: ภาพ 3 มิติ 6 แบบ (ภาพสร้างด้วย AI) เป็น sprite หันเข้ากล้องเสมอ — ใช้ซ้ำทั้ง 18 ตัว
    const FUR = ['orange', 'cream', 'grey', 'tuxedo', 'white', 'calico'];
    const catTex = await Promise.all(FUR.map((f) => kit.tex(`/images/film/sprites/cat-${f}.png`)));
    for (let i = 0; i < CATS; i++) {
      const mat = new THREE.SpriteMaterial({ map: catTex[(i * 5) % FUR.length], transparent: true, depthWrite: false });
      const cat = new THREE.Sprite(mat);
      cat.scale.setScalar(CAT_R * 2.5);
      cat.renderOrder = 1;
      cat.visible = false;
      this.peds[0].add(cat);
      this.cats.push(cat);
    }
    this.alarm = glowSprite(glow, '#ff3b2a', 3.0, 0);
    this.alarm.position.set(TUBE.x[0], TUBE.base + TUBE.h + 0.1, TUBE.z[0] + 0.3);
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
    await preloadKraft(kit);
    const carton = new SupplyBox(kit, 0.95, await iconDisc(kit, 'heart', '#fff3d1'));
    carton.setOpen(0);
    carton.group.position.y = -0.36;
    this.box.add(carton.group);
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

    // ① น้องหล่นลงหลอดแรกทีละตัว ตรงกลางปากหลอด ซ้อนเป็นชั้น จนเต็มแล้วล้นกลิ้งออกมาที่แท่น
    const t1 = (t - ts[0]) * sp;
    const DROP = 0.075;
    const FALL = 0.34;
    const up = new THREE.Vector3();
    this.cats.forEach((cat, i) => {
      if (i >= STACK + SPILL) {
        // น้องที่อยู่หลอดอื่นอยู่แล้ว (หลอดละ 1 ตัว)
        const k = i - STACK - SPILL;
        cat.visible = true;
        cat.position.set(TUBE.x[2 + k], TUBE.base + CAT_R + 0.01, TUBE.z[2 + k]);
        cat.material.rotation = 0.06 * Math.sin(t * 2 + k);
        return;
      }
      const a = 0.12 + i * DROP;
      const f = prog(t1, a, a + FALL);
      cat.visible = t1 > a;
      if (!cat.visible) return;
      const spin = (1 - f) * 2.2;
      if (i < STACK) {
        const target = stackPos(i);
        // ตกแนวดิ่งจากเหนือปากหลอด: x/z ตรงจุดหมายตั้งแต่ต้น จึงลงหลอดพอดี
        const y0 = TUBE.base + TUBE.h + 1.6;
        const y = lerp(y0, target.y, ease.in(f));
        const land = t1 - (a + FALL);
        const bounce = land > 0 ? 0.05 * Math.exp(-land * 18) * Math.abs(Math.sin(land * 26)) : 0;
        cat.position.set(target.x, y + bounce, target.z);
        cat.material.rotation = 0.35 * spin * Math.sin(i * 1.7 + 1);
      } else {
        // ล้น: ตกลงบนยอดกองแล้วกลิ้งออกด้านหน้าลงแท่น
        const j = i - STACK;
        const topY = TUBE.base + TUBE.h + CAT_R + 0.02;
        const fallEnd = a + FALL;
        const roll = prog(t1, fallEnd, fallEnd + 0.45);
        const dir = -0.9 + j * 0.55;
        up.set(Math.sin(dir), 0, Math.cos(dir));
        const dist = (TUBE.r + 0.25 + 0.22 * j) * ease.out(roll);
        const ground = CAT_R + 0.005;
        const arcY = roll < 1 ? lerp(topY, ground, ease.in(roll)) + 0.35 * Math.sin(roll * Math.PI) * (1 - roll * 0.6) : ground + 0.03 * Math.abs(Math.sin((t1 - fallEnd - 0.45) * 10)) * Math.exp(-(t1 - fallEnd - 0.45) * 6);
        const y = f < 1 ? lerp(TUBE.base + TUBE.h + 1.6, topY, ease.in(f)) : arcY;
        cat.position.set(TUBE.x[0] + up.x * dist, y, TUBE.z[0] + up.z * dist);
        cat.material.rotation = -roll * 3.4 * Math.sign(Math.sin(dir) || 1);
      }
    });
    const full = ease.out(prog(t1, 0.12 + (STACK - 1) * DROP + FALL, 0.12 + (STACK - 1) * DROP + FALL + 0.3));
    this.glass0.color.set('#ffffff').lerp(new THREE.Color('#ff7a68'), 0.7 * full);
    this.glass0.opacity = 0.07 + 0.1 * full;
    this.rim0.color.set(C.gold).lerp(new THREE.Color('#e0473a'), full);
    this.rim0.emissive.set('#ff2a10');
    this.rim0.emissiveIntensity = 0.5 * full * (0.6 + 0.4 * Math.max(0, Math.sin(t * 9)));
    this.alarm.material.opacity = full * (0.45 + 0.35 * Math.max(0, Math.sin(t * 9)));

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
  // น้องแมวหล่นลงหลอดทีละตัว: เสียงติ๊งไล่โน้ตขึ้นตามความสูงของกอง แล้วสัญญาณเตือนตอนเต็ม
  for (let i = 0; i < STACK + SPILL; i++) ev.push({ at: ts[0] + (0.12 + i * 0.075 + 0.34) / sp, kind: i < STACK ? 'drop' : 'pop', note: i < STACK ? 2 + Math.floor(i / 2) : 1, gain: i < STACK ? 0.24 : 0.3 });
  ev.push({ at: ts[0] + (0.12 + (STACK - 1) * 0.075 + 0.36) / sp, kind: 'zap', gain: 0.4 });
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
