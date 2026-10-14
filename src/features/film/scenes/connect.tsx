/**
 * เชื่อมทุกคน (2 ห้อง / 1 ห้องในเวอร์ชันสั้น): กลางคืนโทนเทคโนโลยี โทรศัพท์ Cozypet อยู่กลาง
 * คนเจอน้อง · ผู้รับดูแล · คนที่อยากช่วย ลอยเป็นกลุ่มรอบ ๆ ลำแสงทองวิ่งเชื่อมเข้าหากัน แล้วฟีเจอร์ของแอปแตกออกเป็นเหรียญโคจร
 * ภาพบุคคลเป็นภาพสร้างด้วย AI (บุคคลสมมติ) — มีป้ายบอกบนจอ
 */
import * as THREE from 'three';
import type { GLKit, GLScene } from '../gl';
import type { FilmContext, SceneProps } from '../context';
import type { Shot } from '../cuts';
import { frameAt, frameUrl, markTime } from '../capture';
import { clamp, ease, lerp, prog } from '../timeline';
import { Kinetic } from '../props/dom';
import type { SceneModule, SceneSfx } from './types';
import { Beam, C, Floaters, applyCam, atlasCanvasTex, dotSphere, featureCoin, glowSprite, glowTexture, iconCardTexture, makeCamera, nightStudio, phoneModel, portraitDisc, project, type CamRig, type IconName } from './stage';
import { iconDisc } from '../props/objects';
import s from './scenes.module.css';

type GroupKey = 'finder' | 'caregiver' | 'donor';
const GROUPS: { key: GroupKey; at: [number, number, number]; faces: [string, number, number, number][] }[] = [
  { key: 'finder', at: [-5.1, 0.5, -0.4], faces: [['/images/people/people-01.png', 5, 5, 3], ['/images/people/people-01.png', 5, 5, 7], ['/images/cats/cats-01.png', 4, 4, 4]] },
  { key: 'caregiver', at: [4.7, 1.85, -0.6], faces: [['/images/people/people-01.png', 5, 5, 0], ['/images/people/people-01.png', 5, 5, 6], ['/images/homes/homes-01.png', 5, 5, 1]] },
  { key: 'donor', at: [4.5, -1.45, -0.3], faces: [['/images/people/people-01.png', 5, 5, 9], ['/images/people/people-01.png', 5, 5, 13], ['', 0, 0, 0]] },
];
const OFFS: [number, number, number][] = [[0, 0.15, 0], [0.95, -0.45, 0.2], [-0.8, -0.55, 0.35]];
const FEATURES: IconName[] = ['scan', 'notice', 'ai', 'balancer', 'chat', 'handoff', 'box', 'dashboard'];

/** เวลาหลักของฉาก (ย่อครึ่งในเวอร์ชันสั้น) */
function T(short: boolean) {
  const k = short ? 0.5 : 1;
  return { phone: 0, groups: 0.45 * k, beams: 1.0 * k, coins: 2.5 * k, coinStep: 0.12 * k };
}

function rig(t: number, dur: number): CamRig {
  const back = ease.expoInOut(prog(t, 0, Math.min(1.8, dur * 0.4)));
  const orbit = 0.18 * Math.sin(t * 0.5) + 0.25 * prog(t, 0, dur);
  const z = lerp(7.5, 15.5, back);
  return { pos: [Math.sin(orbit) * z, lerp(0.2, 1.1, back), Math.cos(orbit) * z], look: [0, 0, 0], fov: 30, roll: 0.02 * Math.sin(t * 0.7) };
}

function coinPos(i: number, t: number, a0: number): THREE.Vector3 {
  const a = (i / FEATURES.length) * Math.PI * 2 + t * 0.55 + a0;
  return new THREE.Vector3(Math.cos(a) * 2.75, Math.sin(a) * 0.55 + 0.2, Math.sin(a) * 2.2);
}

class ConnectScene implements GLScene {
  scene = new THREE.Scene();
  camera = makeCamera();
  private phone!: THREE.Group;
  private ring!: THREE.Points;
  private discs: THREE.Group[][] = [];
  private beams: Beam[] = [];
  private links: Beam[] = [];
  private pulses: THREE.Sprite[] = [];
  private coins: THREE.Group[] = [];
  private floaters!: Floaters;
  private halo!: THREE.Sprite;
  private ctx: FilmContext;

  constructor(ctx: FilmContext) {
    this.ctx = ctx;
  }

  async init(kit: GLKit) {
    const { scene } = this;
    await nightStudio(kit, scene, 0.8);
    scene.environmentRotation.set(0.3, 0.8, 0);
    const glow = await glowTexture(kit);
    this.floaters = new Floaters(glow, 70, 'connect', { x: 34, y: 18, z0: -14, z1: -3 }, ['#ffd27a', '#9f97ff', '#ffffff'], 0.3);
    scene.add(this.floaters.mesh);
    this.ring = dotSphere(glow, 900, 9, '#8f86ff', 0.08);
    this.ring.position.z = -8;
    scene.add(this.ring);
    this.halo = glowSprite(glow, '#f4b400', 6, 0.5);
    this.halo.position.z = -0.6;
    scene.add(this.halo);

    // จอโทรศัพท์: เฟรมแดชบอร์ดจริงจาก C1 (ถ้ามี)
    const meta = this.ctx.captures.C1;
    let screen: THREE.Texture | null = null;
    if (meta?.frames.length) {
      const tSrc = markTime(meta, 'micro-ack', meta.duration * 0.5) - 0.3;
      screen = await kit.tex(frameUrl(meta.locale, meta.id, frameAt(meta, tSrc))).catch(() => null);
    }
    if (!screen) {
      screen = await kit.canvasTex(390, 844, (c) => {
        c.fillStyle = '#fffdf8';
        c.fillRect(0, 0, 390, 844);
        c.fillStyle = '#f4b400';
        c.beginPath();
        c.roundRect(28, 110, 334, 200, 28);
        c.fill();
      });
    }
    this.phone = phoneModel(screen, 3.6);
    scene.add(this.phone);

    for (const g of GROUPS) {
      const row: THREE.Group[] = [];
      for (let i = 0; i < g.faces.length; i++) {
        const [url, cols, rows, idx] = g.faces[i];
        const tex = url ? await atlasCanvasTex(kit, url, cols, rows, idx, 320) : await iconDisc(kit, 'box', '#fff3d1');
        const d = portraitDisc(tex, i === 0 ? 0.72 : 0.55, i === 2 ? '#ffd27a' : C.gold);
        scene.add(d);
        row.push(d);
      }
      this.discs.push(row);
      const b = new Beam('#ffc94a', 0.05, 0.95);
      this.beams.push(b);
      scene.add(b.mesh);
      for (let k = 0; k < 2; k++) {
        const p = glowSprite(glow, '#fff2c4', 0.7, 1);
        this.pulses.push(p);
        scene.add(p);
      }
    }
    for (let i = 0; i < 3; i++) {
      const l = new Beam('#9f97ff', 0.018, 0.6);
      this.links.push(l);
      scene.add(l.mesh);
    }
    for (const f of FEATURES) {
      const tex = await iconCardTexture(kit, f, { size: 256 });
      const c = featureCoin(tex, 0.42);
      scene.add(c);
      this.coins.push(c);
    }
  }

  render(t: number, kit: GLKit, shot?: Shot) {
    const short = shot?.variant === 'short';
    const dur = shot?.dur ?? 5.333;
    const tm = T(short);
    applyCam(this.camera, rig(t, dur));
    const rise = ease.backOut(prog(t, 0, 0.6));
    this.phone.position.set(0, lerp(-3, 0, rise) + 0.06 * Math.sin(t * 1.4), 0);
    this.phone.rotation.set(0.05 * Math.sin(t * 0.9), 0.35 * Math.sin(t * 0.6) * (1 - 0.5 * prog(t, 0, 2)), 0);
    this.halo.material.opacity = 0.55 * rise;
    this.ring.rotation.y = t * 0.08;
    this.ring.rotation.x = 0.3;
    const center = new THREE.Vector3(0, 0.2, 0.2);
    GROUPS.forEach((g, gi) => {
      const base = new THREE.Vector3(...g.at);
      base.y += 0.12 * Math.sin(t * 1.1 + gi * 2);
      this.discs[gi].forEach((d, i) => {
        const a = tm.groups + gi * 0.18 + i * 0.08;
        const p = ease.backBig(prog(t, a, a + 0.45));
        d.visible = p > 0.001;
        d.scale.setScalar(Math.max(0.001, p));
        d.position.copy(base).add(new THREE.Vector3(...OFFS[i]));
        d.quaternion.copy(this.camera.quaternion);
      });
      // ลำแสงจากกลุ่มเข้าหาโทรศัพท์ + แสงวิ่งไปกลับ
      const b = this.beams[gi];
      b.set(base, center, 0.9 * (gi === 0 ? 1 : -0.6), 0.05, 40);
      const bp = ease.out(prog(t, tm.beams + gi * 0.15, tm.beams + gi * 0.15 + 0.5));
      b.progress(0, bp);
      b.mesh.material.opacity = 0.7 + 0.25 * Math.sin(t * 5 + gi);
      const curve = new THREE.QuadraticBezierCurve3(base, base.clone().lerp(center, 0.5).add(new THREE.Vector3(0, 0.9 * (gi === 0 ? 1 : -0.6), 0.36 * (gi === 0 ? 1 : -0.6))), center);
      for (let k = 0; k < 2; k++) {
        const pl = this.pulses[gi * 2 + k];
        const ph = ((t - tm.beams) * 0.8 + k * 0.5 + gi * 0.2) % 1;
        pl.visible = bp >= 1;
        const q = k === 0 ? ph : 1 - ph;
        pl.position.copy(curve.getPoint(clamp(q)));
        pl.material.opacity = Math.sin(ph * Math.PI);
      }
    });
    // เส้นเชื่อมระหว่างกลุ่ม (สามเหลี่ยม)
    for (let i = 0; i < 3; i++) {
      const a = new THREE.Vector3(...GROUPS[i].at);
      const b = new THREE.Vector3(...GROUPS[(i + 1) % 3].at);
      this.links[i].set(a, b, 1.6, 0.018, 40);
      this.links[i].progress(0, ease.out(prog(t, tm.beams + 0.6 + i * 0.1, tm.beams + 1.2 + i * 0.1)));
    }
    // ฟีเจอร์แตกออกจากโทรศัพท์แล้วโคจร
    this.coins.forEach((c, i) => {
      const a = tm.coins + i * tm.coinStep;
      const p = ease.backBig(prog(t, a, a + 0.4));
      c.visible = p > 0.001;
      const target = coinPos(i, t, 0.4);
      c.position.copy(center).lerp(target, ease.out(prog(t, a, a + 0.5)));
      c.scale.setScalar(Math.max(0.001, p));
      c.quaternion.copy(this.camera.quaternion);
      c.rotateY(0.5 * Math.sin(t * 2 + i));
    });
    this.floaters.update(t + 60, this.camera);
    kit.renderer.render(this.scene, this.camera);
  }
}

function ConnectOverlay({ t, dur, shot, ctx }: SceneProps) {
  const fm = ctx.fm.scenes;
  const short = shot.variant === 'short';
  const tm = T(short);
  const r = rig(t, dur);
  return (
    <div className={s.full}>
      <div className={s.cnTitle}>
        <Kinetic text={fm.connect.title} t={t} at={short ? 0.1 : 0.25} stagger={0.06} />
      </div>
      {GROUPS.map((g, gi) => {
        const base = [g.at[0], g.at[1] - 1.25, g.at[2]] as [number, number, number];
        const p = project(r, base);
        const a = tm.groups + gi * 0.18 + 0.25;
        const k = ease.backOut(prog(t, a, a + 0.4));
        return (
          <span key={g.key} className={s.cnPill} style={{ left: p.x, top: p.y, opacity: clamp(k * 1.3), transform: `translate(-50%, ${((1 - k) * 20).toFixed(1)}px)` }}>
            {fm.connect[g.key]}
          </span>
        );
      })}
      <span className={s.aiNote} style={{ opacity: ease.out(prog(t, tm.groups, tm.groups + 0.4)) }}>{fm.aiImage}</span>
    </div>
  );
}

function connectSfx(shot: Shot): SceneSfx[] {
  const tm = T(shot.variant === 'short');
  const ev: SceneSfx[] = [{ at: 0, kind: 'whoosh', dur: 0.8, gain: 0.6 }, { at: 0.35, kind: 'land', gain: 0.6 }];
  GROUPS.forEach((_, gi) => {
    for (let i = 0; i < 3; i++) ev.push({ at: tm.groups + gi * 0.18 + i * 0.08, kind: 'pop', note: gi * 2 + i, gain: 0.4 });
    ev.push({ at: tm.beams + gi * 0.15, kind: 'zap', note: gi, gain: 0.45 });
  });
  FEATURES.forEach((_, i) => ev.push({ at: tm.coins + i * tm.coinStep, kind: 'coin', note: i, gain: 0.4 }));
  return ev;
}

export const connect: SceneModule = {
  gl: (ctx) => new ConnectScene(ctx),
  Overlay: ConnectOverlay,
  hud: 'dark',
  sfx: connectSfx,
  post: () => ({ bloom: 1.1, threshold: 0.8, radius: 0.75, vignette: 0.45, contrast: 1.06, tint: 0.4 }),
};
