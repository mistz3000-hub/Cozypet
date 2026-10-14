/**
 * อีกมากมาย (2 ห้อง): จากการ์ด “ภาพแรกบนถนน” ของขนมชั้นใบเดียว กล้องถอยออกเห็นการ์ดน้อง ๆ นับพันหมุนวนเป็นพายุในความมืด
 * ตัวเลขวิ่ง = จำนวนเคสในการจำลอง 30 วัน (หรือสถิติจริงที่ทีมใส่พร้อมแหล่งอ้างอิงใน team.local.json)
 */
import * as THREE from 'three';
import type { GLKit, GLScene } from '../gl';
import type { FilmContext, SceneProps } from '../context';
import { clamp, ease, lerp, prog } from '../timeline';
import { cardAtlas } from '../props/atlas';
import { CardSwarm } from '../props/swarm';
import { Counter, Kinetic } from '../props/dom';
import type { SceneModule, SceneSfx } from './types';
import { Floaters, applyCam, card3d, glowTexture, makeCamera, type CamRig } from './stage';
import s from './scenes.module.css';

const BG = '#0a0912';

function rig(t: number): CamRig {
  const back = ease.expoInOut(prog(t, 0.45, 2.4));
  const dive = ease.in(prog(t, 4.55, 5.33));
  const z = lerp(2.3, 15, back) - 11 * dive;
  const orbit = 0.35 * back + 0.12 * Math.sin(t * 0.7);
  return {
    pos: [Math.sin(orbit) * z * 0.25, lerp(0, 1.2, back) - 0.8 * dive, z],
    look: [0, lerp(0, 0.2, back), -2 * dive],
    fov: lerp(32, 38, back) + 18 * dive,
    roll: lerp(0, -0.06, back) + 0.18 * dive,
  };
}

class SwarmScene implements GLScene {
  scene = new THREE.Scene();
  camera = makeCamera();
  private swarm!: CardSwarm;
  private hero!: THREE.Group;
  private rays!: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  private floaters!: Floaters;

  async init(kit: GLKit) {
    const { scene } = this;
    scene.background = new THREE.Color(BG);
    scene.add(new THREE.HemisphereLight('#c9c4ff', '#120d09', 0.8));
    const key = new THREE.DirectionalLight('#fff2d6', 1.6);
    key.position.set(-3, 4, 6);
    scene.add(key);
    const glow = await glowTexture(kit);
    // ลำแสงพุ่งจากด้านหลัง (god rays)
    const rayTex = await kit.canvasTex(1024, 1024, (c) => {
      c.translate(512, 512);
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2 + (i % 3) * 0.05;
        const w = 0.02 + ((i * 37) % 7) * 0.006;
        const g = c.createLinearGradient(0, 0, Math.cos(a) * 512, Math.sin(a) * 512);
        g.addColorStop(0, 'rgba(255,236,200,0.5)');
        g.addColorStop(1, 'rgba(255,236,200,0)');
        c.fillStyle = g;
        c.beginPath();
        c.moveTo(0, 0);
        c.arc(0, 0, 512, a - w, a + w);
        c.closePath();
        c.fill();
      }
      const r = c.createRadialGradient(0, 0, 0, 0, 0, 300);
      r.addColorStop(0, 'rgba(255,240,210,0.55)');
      r.addColorStop(1, 'rgba(255,240,210,0)');
      c.fillStyle = r;
      c.fillRect(-512, -512, 1024, 1024);
    });
    this.rays = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({ map: rayTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    this.rays.position.set(0, 0.5, -14);
    scene.add(this.rays);
    this.floaters = new Floaters(glow, 60, 'swarm', { x: 30, y: 16, z0: -12, z1: 4 }, ['#ffd27a', '#ffffff', '#b9b2ff'], 0.25);
    scene.add(this.floaters.mesh);

    const atlas = await cardAtlas(kit);
    this.swarm = new CardSwarm(atlas, 2600, 'swarm', { size: 0.5, rMin: 2.6, rMax: 12, height: 12, spin: 0.9 });
    this.swarm.setFog(BG, 9, 30);
    scene.add(this.swarm.mesh);

    // การ์ดของขนมชั้น (ภาพแรกบนถนนจากบท 0)
    const street = kit.shared.get('street') as string | undefined;
    const tex = street ? await kit.tex(street) : null;
    const face = tex ? await kit.canvasTex(512, 640, async (c) => {
      const img = tex.image as HTMLImageElement;
      c.fillStyle = '#fffaf2';
      c.fillRect(0, 0, 512, 640);
      c.save();
      c.beginPath();
      c.roundRect(22, 22, 468, 520, 18);
      c.clip();
      const sc = Math.max(468 / img.width, 520 / img.height);
      c.drawImage(img, (img.width - 468 / sc) / 2, (img.height - 520 / sc) / 2, 468 / sc, 520 / sc, 22, 22, 468, 520);
      c.restore();
      c.fillStyle = '#f4b400';
      c.beginPath();
      c.arc(46, 590, 12, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#e8dcc7';
      c.beginPath();
      c.roundRect(70, 582, 180, 16, 8);
      c.fill();
    }) : null;
    this.hero = card3d(1.6, 2.0, { depth: 0.05, radius: 0.1, face, color: '#fffaf2' });
    scene.add(this.hero);
  }

  render(t: number, kit: GLKit) {
    applyCam(this.camera, rig(t));
    // การ์ดขนมชั้น: ค้างกลางจอ แล้วหมุนปลิวเข้าไปรวมกับพายุ
    const fly = ease.in(prog(t, 0.55, 1.6));
    this.hero.position.set(lerp(0, -5, fly), lerp(0, 2.5, fly) + 0.04 * Math.sin(t * 2), lerp(0, -6, fly));
    this.hero.rotation.set(0.1 * Math.sin(t * 1.3) + fly * 1.2, lerp(0, Math.PI * 3, fly), lerp(0, 0.6, fly));
    this.hero.visible = fly < 0.995;
    this.swarm.update({ t: t + 3, appear: prog(t, 0.3, 2.2), speed: lerp(0.6, 1.7, ease.inOut(prog(t, 0.3, 4.8))), spread: lerp(0.75, 1, ease.out(prog(t, 0.4, 2.4))), center: new THREE.Vector3(0, 0, -5), cam: this.camera, face: 0.5 });
    this.rays.rotation.z = t * 0.05;
    this.rays.material.opacity = 0.12 + 0.2 * ease.out(prog(t, 0.3, 2.2));
    this.floaters.update(t, this.camera);
    kit.renderer.render(this.scene, this.camera);
  }
}

function SwarmOverlay({ t, ctx }: SceneProps) {
  const fm = ctx.fm.scenes.swarm;
  const cases = ctx.facts.stat?.value ?? ctx.facts.cases;
  const label = ctx.facts.stat?.label ?? fm.counterLabel;
  const note = ctx.facts.stat?.source ?? fm.counterNote;
  const hudIn = ease.out(prog(t, 0.4, 0.9));
  const fadeOut = 1 - prog(t, 4.75, 5.2);
  return (
    <div className={s.full} style={{ opacity: fadeOut }}>
      <div className={s.swLine1}><Kinetic text={fm.line1} t={t} at={0.55} out={2.05} stagger={0.07} /></div>
      <div className={s.swBig}>
        <div><Kinetic text={fm.line2} t={t} at={2.3} stagger={0.08} from="blur" /></div>
        <div><Kinetic text={fm.line3} t={t} at={2.75} stagger={0.08} highlight /></div>
      </div>
      <div className={s.swCounter} style={{ opacity: ease.out(prog(t, 0.9, 1.3)) }}>
        <span className={s.swCounterNum}><Counter t={t} at={1.0} dur={3.2} value={cases} locale={ctx.locale} /></span>
        <span className={s.swCounterLabel}>{label}</span>
        <span className={s.swCounterNote}>{note}</span>
      </div>
      <span className={s.illus} style={{ opacity: hudIn * 0.9 }}>{fm.illustration}</span>
    </div>
  );
}

function swarmSfx(): SceneSfx[] {
  const ev: SceneSfx[] = [
    { at: 0.0, kind: 'glass', note: 4, gain: 0.4 },
    { at: 0.45, kind: 'whoosh', dur: 1.9, gain: 0.7 },
    { at: 0.6, kind: 'paper', dur: 4.0, gain: 0.55 },
    { at: 1.9, kind: 'riser', dur: 0.4, gain: 0.5 },
    { at: 2.3, kind: 'impact', gain: 0.85 },
    { at: 2.75, kind: 'sparkle', gain: 0.4 },
    { at: 4.55, kind: 'whoosh', dur: 0.8, gain: 0.85 },
  ];
  // ติ๊กตามตัวเลขวิ่ง (ถี่ก่อนแล้วช้าลง)
  for (let i = 0; i < 14; i++) {
    const at = 1.0 + 3.2 * (1 - Math.pow(1 - i / 14, 0.35));
    ev.push({ at, kind: 'tick', note: 7 + (i % 3), gain: 0.18 + 0.02 * i });
  }
  return ev;
}

export const swarm: SceneModule = {
  gl: (_ctx: FilmContext) => new SwarmScene(),
  Overlay: SwarmOverlay,
  hud: 'dark',
  sfx: swarmSfx,
  canvasStyle: (t) => {
    const b = clamp(prog(t, 4.75, 5.33) * 10);
    return b > 0.1 ? { filter: `blur(${b.toFixed(1)}px)` } : {};
  },
  post: (t) => ({ bloom: 1.1, threshold: 0.75, radius: 0.8, vignette: 0.55, contrast: 1.1, saturation: 1.05, tint: 0.5, exposure: lerp(0.7, 1, prog(t, 0, 0.5)) }),
};
