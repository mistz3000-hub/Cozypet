/**
 * ผลกระทบ (2 ห้อง): ผนังฟีเจอร์ 12 ช่องพลิกเข้ามาทีละช่องเป็นคลื่น (ครบในแอปเดียว) → ป้าย SDG 3 · 9 · 11 (ทำเอง ไม่ใช่ไอคอนทางการ)
 * พร้อมเสาหลัก 3 ข้อ และตัวเลขวิ่งจากการจำลอง (มีป้ายข้อมูลสมมติ)
 */
import * as THREE from 'three';
import type { GLKit, GLScene } from '../gl';
import type { FilmContext, SceneProps } from '../context';
import { fill } from '../context';
import { clamp, ease, lerp, prog } from '../timeline';
import { Counter, Kinetic } from '../props/dom';
import type { SceneModule, SceneSfx } from './types';
import { Floaters, applyCam, card3d, glowTexture, iconCardTexture, makeCamera, project, studio, type CamRig, type IconName } from './stage';
import s from './scenes.module.css';

const ICONS: IconName[] = ['scan', 'notice', 'ai', 'balancer', 'chat', 'handoff', 'box', 'split', 'dashboard', 'chart', 'globe', 'shield'];
const SDG = [{ n: 3, color: '#4c9f38' }, { n: 9, color: '#f36d25' }, { n: 11, color: '#f99d26' }];
const SWAP = 2.55;
const tilePos = (i: number) => new THREE.Vector3(((i % 4) - 1.5) * 2.25, (1 - Math.floor(i / 4)) * 1.95 - 0.25, 0);
const tileAt = (i: number) => 0.15 + ((i % 4) + Math.floor(i / 4)) * 0.11;
const rig = (t: number): CamRig => ({ pos: [0.3 * Math.sin(t * 0.6), 0.4, lerp(14.5, 13.2, prog(t, 0, 5.33))], look: [0, 0, 0], fov: 30 });

class ImpactScene implements GLScene {
  scene = new THREE.Scene();
  camera = makeCamera();
  private tiles: THREE.Group[] = [];
  private badges: THREE.Group[] = [];
  private floaters!: Floaters;

  async init(kit: GLKit) {
    await studio(kit, this.scene, { env: 0.85 });
    this.scene.environmentRotation.set(0.35, 0.9, 0);
    const glow = await glowTexture(kit);
    this.floaters = new Floaters(glow, 50, 'impact', { x: 28, y: 14, z0: -10, z1: -3 });
    this.scene.add(this.floaters.mesh);
    for (const ic of ICONS) {
      const tex = await iconCardTexture(kit, ic, { size: 384 });
      const tile = card3d(1.55, 1.55, { depth: 0.16, radius: 0.28, face: tex, faceInset: 0.06 });
      this.tiles.push(tile);
      this.scene.add(tile);
    }
    for (const b of SDG) {
      const tex = await kit.canvasTex(512, 512, (c) => {
        c.fillStyle = b.color;
        c.fillRect(0, 0, 512, 512);
        c.fillStyle = '#ffffff';
        c.font = '700 64px "DejaVu Sans", sans-serif';
        c.textBaseline = 'top';
        c.fillText('SDG', 56, 56);
        c.font = '700 240px "DejaVu Sans", sans-serif';
        c.fillText(String(b.n), 50, 150);
      });
      const g = card3d(2.1, 2.1, { depth: 0.2, radius: 0.36, face: tex, faceInset: 0.05, color: b.color });
      this.badges.push(g);
      this.scene.add(g);
    }
  }

  render(t: number, kit: GLKit) {
    applyCam(this.camera, rig(t));
    const swap = ease.inOut(prog(t, SWAP, SWAP + 0.7));
    this.tiles.forEach((tile, i) => {
      const a = tileAt(i);
      const flip = ease.backOut(prog(t, a, a + 0.5));
      const p = tilePos(i);
      // ช่วงสลับ: ช่องฟีเจอร์ถอยไปเป็นวงด้านหลัง
      const ang = (i / ICONS.length) * Math.PI * 2 + t * 0.2;
      const ring = new THREE.Vector3(Math.cos(ang) * 7.2, Math.sin(ang) * 3.4, -4);
      tile.position.copy(p).lerp(ring, swap);
      tile.rotation.set(0.1 * Math.sin(t + i), lerp(Math.PI / 2, 0, flip) + 0.08 * Math.sin(t * 1.3 + i), 0);
      tile.scale.setScalar(Math.max(0.001, prog(t, a - 0.02, a) * lerp(1, 0.55, swap)));
    });
    this.badges.forEach((b, i) => {
      const a = SWAP + 0.35 + i * 0.15;
      const k = ease.backBig(prog(t, a, a + 0.5));
      b.position.set((i - 1) * 3.4, lerp(-3, 0.7, ease.out(prog(t, a, a + 0.5))), 0.5);
      b.rotation.set(0, lerp(-1.2, 0, k) + 0.1 * Math.sin(t * 1.1 + i), 0);
      b.scale.setScalar(Math.max(0.001, k));
    });
    this.floaters.update(t + 9, this.camera);
    kit.renderer.render(this.scene, this.camera);
  }
}

function ImpactOverlay({ t, ctx }: SceneProps) {
  const fm = ctx.fm;
  const r = rig(t);
  const tileOut = 1 - prog(t, SWAP - 0.1, SWAP + 0.2);
  return (
    <div className={s.full}>
      <div className={s.imTitle} style={{ opacity: tileOut }}>
        <Kinetic text={fm.scenes.recap} t={t} at={0.05} highlight />
      </div>
      {fm.scenes.features.map((f, i) => {
        const p = project(r, tilePos(i).add(new THREE.Vector3(0, -0.98, 0.1)));
        const a = tileAt(i) + 0.15;
        return <span key={f} className={s.imLabel} style={{ left: p.x, top: p.y, opacity: ease.out(prog(t, a, a + 0.3)) * tileOut }}>{f}</span>;
      })}
      <div className={s.imTitle} style={{ opacity: ease.out(prog(t, SWAP + 0.2, SWAP + 0.5)) }}>{fm.impact.title}</div>
      {fm.impact.sdgs.map((g, i) => {
        const p = project(r, [(i - 1) * 3.4, -0.75, 0.5]);
        const a = SWAP + 0.5 + i * 0.15;
        return (
          <div key={g.n} className={s.imPillar} style={{ left: p.x, top: p.y, opacity: ease.out(prog(t, a, a + 0.35)) }}>
            <b>{fm.impact.pillars[i]}</b>
            <span>SDG {g.n} · {g.label}</span>
          </div>
        );
      })}
      <div className={s.imKpi} style={{ opacity: ease.out(prog(t, SWAP + 1.0, SWAP + 1.3)) }}>
        <span className={s.imKpiNum}>−<Counter t={t} at={SWAP + 1.0} dur={1.4} value={ctx.facts.sim} locale={ctx.locale} />%</span>
        <span className={s.imKpiLabel}>{fill(fm.impact.kpi, { sim: ctx.facts.sim }).replace(`${ctx.facts.sim}%`, '').trim()}</span>
        <span className={s.imKpiNote}>{fm.impact.kpiNote} · {fm.impact.sdgNote}</span>
      </div>
    </div>
  );
}

function impactSfx(): SceneSfx[] {
  const ev: SceneSfx[] = [{ at: 0, kind: 'riser', dur: 0.2, gain: 0.3 }];
  ICONS.forEach((_, i) => ev.push({ at: tileAt(i), kind: 'flip', note: (i % 4) + Math.floor(i / 4) * 2, gain: 0.32 }));
  ev.push({ at: SWAP, kind: 'whoosh', dur: 0.7, gain: 0.55 });
  SDG.forEach((_, i) => ev.push({ at: SWAP + 0.35 + i * 0.15, kind: 'thud', note: 4 + i * 2, gain: 0.55 }));
  ev.push({ at: SWAP + 1.0, kind: 'riser', dur: 1.3, gain: 0.35 });
  ev.push({ at: SWAP + 2.4, kind: 'success', gain: 0.6 });
  return ev;
}

export const impact: SceneModule = {
  gl: (_ctx: FilmContext) => new ImpactScene(),
  Overlay: ImpactOverlay,
  hud: 'light',
  sfx: impactSfx,
  post: () => ({ bloom: 0.7, threshold: 0.95, vignette: 0.3 }),
};
void clamp;
