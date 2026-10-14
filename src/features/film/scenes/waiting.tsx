/**
 * รอเจ้าของก่อนเสมอ (1 ห้อง): เมืองยามค่ำ หน้าต่างตึกเปิดไฟ ประกาศพบสัตว์ของขนมชั้นปลิวไปทั่วเมือง
 * นาฬิกา 3 มิติหมุนเร็วบอกว่าเวลาผ่านไป (ช่วงรอในเรื่องนี้เป็นตัวอย่าง ไม่ใช่ระยะเวลาตามกฎหมาย)
 */
import * as THREE from 'three';
import type { GLKit, GLScene } from '../gl';
import type { FilmContext, SceneProps } from '../context';
import { ease, lerp, prog } from '../timeline';
import { rngFromKey } from '@/lib/seeded-random';
import { noticeFace, photoCard } from '../props/objects';
import type { SceneModule, SceneSfx } from './types';
import { Floaters, applyCam, glowSprite, glowTexture, goldMaterial, makeCamera, type CamRig } from './stage';
import s from './scenes.module.css';

const rig = (t: number): CamRig => ({ pos: [lerp(-1.2, 1.2, prog(t, 0, 2.67)), lerp(0.4, 1.0, prog(t, 0, 2.67)), 13], look: [0, 1.2, 0], fov: 32, roll: 0.02 });

class WaitingScene implements GLScene {
  scene = new THREE.Scene();
  camera = makeCamera();
  private sky = new THREE.Color();
  private notices: THREE.Group[] = [];
  private nData: { x: number; y: number; z: number; sp: number; ph: number; spin: number }[] = [];
  private hand!: THREE.Mesh;
  private hand2!: THREE.Mesh;
  private clock = new THREE.Group();
  private win!: THREE.InstancedMesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  private winData: { on: number }[] = [];
  private floaters!: Floaters;
  private moon!: THREE.Sprite;

  async init(kit: GLKit) {
    const { scene } = this;
    scene.background = this.sky;
    scene.add(new THREE.HemisphereLight('#9fa8ff', '#0b0b1a', 0.8));
    const key = new THREE.DirectionalLight('#ffe2b0', 1.0);
    key.position.set(3, 5, 6);
    scene.add(key);
    const glow = await glowTexture(kit);
    this.moon = glowSprite(glow, '#fff2c4', 3.5, 0.9);
    this.moon.position.set(5.5, 5.2, -12);
    scene.add(this.moon);
    // ตึกเป็นเงาดำ + หน้าต่าง (instanced)
    const rnd = rngFromKey('cozypet:v1:film:waiting');
    const bmat = new THREE.MeshStandardMaterial({ color: '#141533', roughness: 0.9 });
    const wins: THREE.Matrix4[] = [];
    const d = new THREE.Object3D();
    for (let i = 0; i < 18; i++) {
      const w = 1.2 + rnd() * 1.6;
      const h = 2 + rnd() * 6;
      const x = -15 + i * 1.75 + rnd() * 0.6;
      const z = -6 - rnd() * 3;
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 1.2), bmat);
      b.position.set(x, h / 2 - 2, z);
      scene.add(b);
      for (let r = 0; r < Math.floor(h / 0.55); r++) {
        for (let c = 0; c < Math.floor(w / 0.45); c++) {
          if (rnd() < 0.45) continue;
          d.position.set(x - w / 2 + 0.3 + c * 0.45, -2 + 0.4 + r * 0.55, z + 0.61);
          d.updateMatrix();
          wins.push(d.matrix.clone());
          this.winData.push({ on: rnd() });
        }
      }
    }
    this.win = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.24, 0.3), new THREE.MeshBasicMaterial({ color: '#ffd27a', toneMapped: false }), wins.length);
    wins.forEach((m, i) => this.win.setMatrixAt(i, m));
    scene.add(this.win);
    // ประกาศพบสัตว์ของขนมชั้นปลิวไปทั่ว
    const street = kit.shared.get('street') as string | undefined;
    const face = await noticeFace(kit, street ? await kit.image(street) : null);
    for (let i = 0; i < 16; i++) {
      const n = photoCard(face, 0.6, 0.8);
      this.notices.push(n);
      scene.add(n);
      this.nData.push({ x: -9 + rnd() * 18, y: -1 + rnd() * 6, z: -3 + rnd() * 6, sp: 0.6 + rnd() * 0.9, ph: rnd() * 6, spin: 1 + rnd() * 2 });
    }
    // นาฬิกา 3 มิติ
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.08, 16, 96), goldMaterial());
    this.clock.add(ring);
    const faceM = new THREE.Mesh(new THREE.CircleGeometry(1.2, 64), new THREE.MeshPhysicalMaterial({ color: '#fff8ec', roughness: 0.4, transparent: true, opacity: 0.92 }));
    this.clock.add(faceM);
    for (let i = 0; i < 12; i++) {
      const tick = new THREE.Mesh(new THREE.BoxGeometry(0.05, i % 3 ? 0.12 : 0.22, 0.03), new THREE.MeshStandardMaterial({ color: '#2b2118' }));
      const a = (i / 12) * Math.PI * 2;
      tick.position.set(Math.sin(a) * 1.02, Math.cos(a) * 1.02, 0.02);
      tick.rotation.z = -a;
      this.clock.add(tick);
    }
    this.hand = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.85, 0.04), new THREE.MeshStandardMaterial({ color: '#2b2118' }));
    this.hand.geometry.translate(0, 0.42, 0);
    this.hand.position.z = 0.05;
    this.hand2 = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.55, 0.04), new THREE.MeshStandardMaterial({ color: '#d0402f' }));
    this.hand2.geometry.translate(0, 0.27, 0);
    this.hand2.position.z = 0.07;
    this.clock.add(this.hand, this.hand2);
    this.clock.position.set(4.6, 2.6, 0.5);
    scene.add(this.clock);
    this.floaters = new Floaters(glow, 50, 'waiting', { x: 30, y: 14, z0: -10, z1: 2 }, ['#ffd27a', '#ffffff'], 0.25);
    scene.add(this.floaters.mesh);
  }

  render(t: number, kit: GLKit) {
    applyCam(this.camera, rig(t));
    // ค่ำลงเรื่อย ๆ
    const night = ease.inOut(prog(t, 0, 2.0));
    this.sky.set('#3b3f7a').lerp(new THREE.Color('#0b0c1f'), night);
    this.moon.material.opacity = 0.4 + 0.5 * night;
    const c = new THREE.Color();
    this.winData.forEach((w, i) => {
      const on = night > w.on * 0.9 ? 1 : 0.08;
      this.win.setColorAt(i, c.set('#ffd27a').multiplyScalar(on));
    });
    if (this.win.instanceColor) this.win.instanceColor.needsUpdate = true;
    this.notices.forEach((n, i) => {
      const d = this.nData[i];
      const x = d.x + ((t * d.sp * 3 + d.ph * 2) % 20) - 10;
      n.position.set(x, d.y + Math.sin(t * 2 + d.ph) * 0.5, d.z);
      n.rotation.set(Math.sin(t * d.spin + d.ph) * 0.8, t * d.spin * 0.7 + d.ph, Math.sin(t * 1.3 + d.ph) * 0.5);
    });
    this.hand.rotation.z = -t * 6;
    this.hand2.rotation.z = -t * 0.5;
    this.clock.scale.setScalar(Math.max(0.001, ease.backOut(prog(t, 0.1, 0.5))));
    this.clock.rotation.y = -0.3 + 0.1 * Math.sin(t);
    this.floaters.update(t, this.camera);
    kit.renderer.render(this.scene, this.camera);
  }
}

function WaitingOverlay({ t, ctx }: SceneProps) {
  return (
    <div className={s.full}>
      <span className={s.wtClock} style={{ opacity: ease.out(prog(t, 0.3, 0.6)) }}>{ctx.fm.scenes.waitingClock}</span>
    </div>
  );
}

function waitingSfx(): SceneSfx[] {
  const ev: SceneSfx[] = [{ at: 0, kind: 'paper', dur: 2.6, gain: 0.45 }];
  for (let i = 0; i < 8; i++) ev.push({ at: 0.2 + i * 0.3, kind: 'clock', note: i % 2, gain: 0.3 });
  return ev;
}

export const waiting: SceneModule = {
  gl: (_ctx: FilmContext) => new WaitingScene(),
  Overlay: WaitingOverlay,
  hud: 'dark',
  captionTone: 'dark',
  sfx: waitingSfx,
  post: () => ({ bloom: 1.0, threshold: 0.8, vignette: 0.45, tint: 0.5 }),
};
