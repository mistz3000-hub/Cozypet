/**
 * รับเลี้ยงถาวร (1 ห้อง): การ์ดขนมชั้น “กำลังหาบ้าน” → เทมเพลตสัญญาคลี่ออก ลายเซ็นวาดตัวเอง ตราหัวใจประทับ
 * สัญญาเป็นตัวอย่าง ไม่ใช่เอกสารทางกฎหมาย (ลายน้ำ “ตัวอย่าง”) · ข้อความทั้งหมดเป็น DOM วางบนกระดาษ
 */
import * as THREE from 'three';
import type { GLKit, GLScene } from '../gl';
import type { FilmContext, SceneProps } from '../context';
import { clamp, ease, lerp, prog } from '../timeline';
import { heartCoin, photoCard } from '../props/objects';
import type { SceneModule, SceneSfx } from './types';
import { Floaters, Sparks, applyCam, glowTexture, makeCamera, project, studio, type CamRig } from './stage';
import s from './scenes.module.css';

const CARD = new THREE.Vector3(-3.0, 0.75, 0);
const PAPER = new THREE.Vector3(1.9, 0.45, 0.2);
const TT = { card: 0, paper: 0.45, sign: 1.05, stamp: 1.85 };
const rig = (t: number): CamRig => ({ pos: [lerp(-0.6, 0.6, prog(t, 0, 2.67)), 0.5, 11.5], look: [0, 0.2, 0], fov: 30 });

class AdoptScene implements GLScene {
  scene = new THREE.Scene();
  camera = makeCamera();
  private card!: THREE.Group;
  private paper!: THREE.Group;
  private stamp!: THREE.Group;
  private sparks!: Sparks;
  private floaters!: Floaters;

  async init(kit: GLKit) {
    await studio(kit, this.scene, { env: 0.85 });
    this.scene.environmentRotation.set(0.35, 0.9, 0);
    const glow = await glowTexture(kit);
    this.floaters = new Floaters(glow, 40, 'adopt', { x: 26, y: 14, z0: -10, z1: -3 });
    this.scene.add(this.floaters.mesh);
    const street = kit.shared.get('street') as string | undefined;
    const img = street ? await kit.image(street) : await kit.image('/mascot/cat-happy.png');
    const tex = await kit.canvasTex(512, 640, (c) => {
      c.fillStyle = '#fffaf2';
      c.fillRect(0, 0, 512, 640);
      c.save();
      c.beginPath();
      c.roundRect(20, 20, 472, 470, 20);
      c.clip();
      const k = Math.min(img.width, img.height);
      c.drawImage(img, (img.width - k) / 2, (img.height - k) / 2, k, k, 20, 20, 472, 470);
      c.restore();
      c.fillStyle = '#e8dcc7';
      c.beginPath();
      c.roundRect(28, 520, 300, 26, 13);
      c.fill();
      c.beginPath();
      c.roundRect(28, 566, 200, 22, 11);
      c.fill();
    });
    this.card = photoCard(tex, 2.4, 3.0);
    this.scene.add(this.card);
    const paperTex = await kit.canvasTex(600, 800, (c) => {
      c.fillStyle = '#fffdf6';
      c.fillRect(0, 0, 600, 800);
      c.fillStyle = '#f4b400';
      c.fillRect(0, 0, 600, 18);
      c.fillStyle = '#eadfcc';
      for (let i = 0; i < 9; i++) {
        c.beginPath();
        c.roundRect(48, 190 + i * 42, i % 3 === 2 ? 360 : 500, 14, 7);
        c.fill();
      }
      c.strokeStyle = '#8c7b6b';
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(60, 690);
      c.lineTo(330, 690);
      c.stroke();
    });
    this.paper = photoCard(paperTex, 2.7, 3.6);
    this.scene.add(this.paper);
    this.stamp = heartCoin(0.9);
    this.scene.add(this.stamp);
    this.sparks = new Sparks(glow, 50, 'adopt');
    this.scene.add(this.sparks.mesh);
  }

  render(t: number, kit: GLKit) {
    applyCam(this.camera, rig(t));
    const c = ease.backOut(prog(t, TT.card, TT.card + 0.4));
    this.card.position.copy(CARD).add(new THREE.Vector3(0, 0.05 * Math.sin(t * 2), 0));
    this.card.rotation.set(0, 0.25 - 0.1 * prog(t, 0, 2.6), -0.04);
    this.card.scale.setScalar(Math.max(0.001, c));
    // กระดาษคลี่ออก (หมุนจากแนวนอนขึ้นมาหันหน้า)
    const p = ease.expoOut(prog(t, TT.paper, TT.paper + 0.6));
    this.paper.position.copy(PAPER).add(new THREE.Vector3(0, lerp(-2.5, 0, p), 0));
    this.paper.rotation.set(lerp(-1.4, 0, p), lerp(-0.6, -0.12, p), lerp(0.2, 0.02, p));
    this.paper.scale.setScalar(Math.max(0.001, p));
    const st = prog(t, TT.stamp, TT.stamp + 0.25);
    this.stamp.position.copy(PAPER).add(new THREE.Vector3(0.75, lerp(1.5, -1.05, ease.in(st)), lerp(2.5, 0.35, ease.in(st))));
    this.stamp.rotation.set(0, -0.12, lerp(0.8, -0.2, st));
    this.stamp.scale.setScalar(Math.max(0.001, prog(t, TT.stamp - 0.1, TT.stamp) * (1 + 0.15 * Math.max(0, 1 - Math.abs(t - TT.stamp - 0.3) / 0.12))));
    this.sparks.burst(PAPER.clone().add(new THREE.Vector3(0.75, -1.05, 0.5)), t - TT.stamp - 0.25, this.camera, 1.2);
    this.floaters.update(t + 3, this.camera);
    kit.renderer.render(this.scene, this.camera);
  }
}

function AdoptOverlay({ t, ctx }: SceneProps) {
  const st = ctx.fm.story;
  const r = rig(t);
  const badge = project(r, CARD.clone().add(new THREE.Vector3(0, 1.75, 0.1)));
  const btn = project(r, CARD.clone().add(new THREE.Vector3(0, -1.95, 0.1)));
  const pt = project(r, PAPER.clone().add(new THREE.Vector3(-1.15, 1.45, 0.1)));
  const sig = project(r, PAPER.clone().add(new THREE.Vector3(-0.9, -1.15, 0.1)));
  const press = Math.max(0, 1 - Math.abs(t - 0.4) / 0.12);
  const p = ease.out(prog(t, TT.paper + 0.35, TT.paper + 0.6));
  const draw = ease.inOut(prog(t, TT.sign, TT.sign + 0.7));
  return (
    <div className={s.full}>
      <span className={s.adBadge} style={{ left: badge.x, top: badge.y, opacity: ease.out(prog(t, 0.1, 0.3)) }}>{st.adoptBadge}</span>
      <span className={s.adBtn} style={{ left: btn.x, top: btn.y, opacity: ease.out(prog(t, 0.1, 0.3)), transform: `translate(-50%, -50%) scale(${(1 - 0.08 * press).toFixed(3)})` }}>{st.adoptBtn}</span>
      <div className={s.adPaper} style={{ left: pt.x, top: pt.y, opacity: p }}>
        <b>{st.agreement}</b>
        {st.agreementLines.map((l) => <span key={l}>{l}</span>)}
      </div>
      <span className={s.adWater} style={{ left: pt.x + 60, top: pt.y + 200, opacity: 0.18 * p }}>{st.agreementWatermark}</span>
      <svg className={s.adSig} style={{ left: sig.x, top: sig.y - 70, opacity: p }} viewBox="0 0 300 90" width="300" height="90" aria-hidden="true">
        <path d="M8 62 C 40 10, 60 90, 92 46 S 140 20, 150 58 S 196 70, 214 30 S 262 40, 292 52" fill="none" stroke="#2b2118" strokeWidth="5" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={(1 - draw).toFixed(3)} />
      </svg>
      <span className={s.adSigLabel} style={{ left: sig.x, top: sig.y + 26, opacity: p }}>{st.signature}</span>
    </div>
  );
}

function adoptSfx(): SceneSfx[] {
  return [
    { at: 0.38, kind: 'tap', note: 4, gain: 0.5 },
    { at: TT.paper, kind: 'paper', dur: 0.6, gain: 0.5 },
    { at: TT.sign, kind: 'draw', dur: 0.7, gain: 0.4 },
    { at: TT.stamp + 0.25, kind: 'stamp', gain: 0.8 },
    { at: TT.stamp + 0.3, kind: 'sparkle', gain: 0.4 },
  ];
}

export const adopt: SceneModule = {
  gl: (_ctx: FilmContext) => new AdoptScene(),
  Overlay: AdoptOverlay,
  hud: 'light',
  sfx: adoptSfx,
  post: () => ({ bloom: 0.7, threshold: 0.95, vignette: 0.3 }),
};
void clamp;
