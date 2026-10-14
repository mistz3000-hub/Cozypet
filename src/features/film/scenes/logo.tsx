/**
 * โลโก้ (2 ห้อง): การ์ดน้อง ๆ นับพันในความมืดบินมารวมตัวเป็นหัวแมวรูปตัว C → แสงอุ่นสว่างขึ้น
 * โลโก้ 3 มิติประกอบตัว (ช่องทอง → ตัว C → หู → ตา → จมูก) แล้วการ์ดแตกกระจายเป็นประกาย · คำว่า cozypet เป็น DOM
 */
import * as THREE from 'three';
import type { GLKit, GLScene } from '../gl';
import type { FilmContext, SceneProps } from '../context';
import { BEAT, clamp, ease, lerp, prog } from '../timeline';
import { cardAtlas } from '../props/atlas';
import { CardSwarm } from '../props/swarm';
import { Logo3D } from '../props/logo3d';
import type { SceneModule, SceneSfx } from './types';
import { Floaters, Sparks, applyCam, glowSprite, glowTexture, makeCamera, pawGeometry, setShock, shockRing, studio, type CamRig } from './stage';
import s from './scenes.module.css';

const FORM_A = 0.15;
const FORM_B = 1.35;
const SOLID = BEAT * 2;
const LOGO_Y = 1.1;
const DARK = new THREE.Color('#0d0b12');
const WARM = new THREE.Color('#fff4dc');

function rig(t: number): CamRig {
  const k = ease.expoInOut(prog(t, 0, 1.6));
  const drift = ease.inOut(prog(t, 1.6, 5.33));
  return {
    pos: [lerp(2.5, 0, k) + 0.4 * Math.sin(drift * 2), lerp(1.2, 0.35, k), lerp(16, 9.6, k) + 0.8 * drift],
    look: [0, lerp(0.4, 0.15, k), 0],
    fov: 30,
    roll: lerp(0.08, 0, k),
  };
}

class LogoScene implements GLScene {
  scene = new THREE.Scene();
  camera = makeCamera();
  private logo = new Logo3D(2.2);
  private swarm!: CardSwarm;
  private targets: THREE.Vector3[] = [];
  private sparks!: Sparks;
  private ring = shockRing('#ffd27a');
  private halo!: THREE.Sprite;
  private floaters!: Floaters;
  private paws: THREE.Mesh[] = [];
  private bg = new THREE.Color();

  async init(kit: GLKit) {
    const { scene } = this;
    await studio(kit, scene, { env: 1.0 });
    // หมุน environment ไม่ให้แผงไฟสว่างอยู่หลังกล้องพอดี (หน้าโลโก้จะสะท้อนขาวทั้งแผ่น)
    scene.environmentRotation.set(0.35, 0.9, 0);
    scene.background = this.bg;
    const glow = await glowTexture(kit);
    this.halo = glowSprite(glow, '#ffd27a', 9, 0);
    this.halo.position.set(0, LOGO_Y, -1);
    scene.add(this.halo);
    this.floaters = new Floaters(glow, 50, 'logo2', { x: 26, y: 14, z0: -9, z1: -2 });
    scene.add(this.floaters.mesh);
    this.logo.group.position.set(0, LOGO_Y, 0);
    scene.add(this.logo.group);
    const atlas = await cardAtlas(kit);
    this.swarm = new CardSwarm(atlas, 1800, 'logo', { size: 0.5, rMin: 3, rMax: 16, height: 12 });
    scene.add(this.swarm.mesh);
    this.targets = this.logo.samplePoints(1800).map((p) => p.add(new THREE.Vector3(0, LOGO_Y, 0.05)));
    this.ring.position.set(0, LOGO_Y, -0.3);
    scene.add(this.ring);
    this.sparks = new Sparks(glow, 90, 'logo2', ['#f4b400', '#ffd27a', '#ffffff', '#f0707a']);
    scene.add(this.sparks.mesh);
    // อุ้งเท้าทองเล็ก ๆ ลอยรอบโลโก้ (ฉากหลัง)
    const pawGeo = pawGeometry(0.42, 0.08);
    const pawMat = new THREE.MeshPhysicalMaterial({ color: '#f4b400', roughness: 0.3, metalness: 0.2, clearcoat: 1 });
    for (let i = 0; i < 9; i++) {
      const m = new THREE.Mesh(pawGeo, pawMat);
      this.paws.push(m);
      scene.add(m);
    }
  }

  render(t: number, kit: GLKit) {
    applyCam(this.camera, rig(t));
    const light = ease.inOut(prog(t, SOLID - 0.15, SOLID + 0.55));
    this.bg.copy(DARK).lerp(WARM, light);
    this.scene.environmentIntensity = lerp(0.3, 0.8, light);
    // การ์ดรวมตัวเป็นโลโก้ แล้วแตกออกเป็นประกาย
    const form = prog(t, FORM_A, FORM_B);
    const burst = ease.out(prog(t, SOLID + 0.05, SOLID + 1.2));
    this.swarm.update({ t: t + 8, form: form * (1 - burst), stagger: 0.55, targets: this.targets, targetScale: 0.28, cam: this.camera, face: 0.4, spread: 1 + burst * 1.6, speed: 1 + burst * 2 });
    this.swarm.setLook(lerp(1, 1.1, light));
    this.swarm.mesh.visible = burst < 0.995;
    (this.swarm.mesh.material.uniforms.uBright as { value: number }).value = 1 - 0.6 * burst;
    // โลโก้ทึบประกอบตัว
    const build = prog(t, SOLID - 0.1, SOLID + 1.0);
    this.logo.setBuild(build);
    this.logo.group.visible = build > 0;
    const blink = Math.max(0, 1 - Math.abs(t - 3.75) / 0.09);
    this.logo.blink(blink);
    this.logo.group.rotation.set(0.05 * Math.sin(t * 0.9), 0.12 * Math.sin(t * 0.7) * prog(t, SOLID + 0.6, SOLID + 1.6), 0.03 * Math.sin(t * 1.1));
    this.logo.group.position.y = LOGO_Y + 0.06 * Math.sin(t * 1.6);
    this.halo.material.opacity = 0.8 * light;
    setShock(this.ring, t - SOLID, 7, 1.0);
    this.sparks.burst(new THREE.Vector3(0, LOGO_Y, 0.4), t - SOLID - 0.05, this.camera, 1.8);
    this.paws.forEach((m, i) => {
      const a = (i / this.paws.length) * Math.PI * 2 + t * 0.25;
      const pop = ease.backOut(prog(t, 1.9 + i * 0.08, 2.3 + i * 0.08));
      m.position.set(Math.cos(a) * (4.4 + (i % 2) * 0.8), LOGO_Y + Math.sin(a * 1.3) * 1.6, -2.2 - (i % 3) * 0.6);
      m.rotation.set(0.3 * Math.sin(t + i), a + Math.PI / 2, 0.4 * Math.sin(t * 0.8 + i));
      m.scale.setScalar(Math.max(0.001, pop));
    });
    this.floaters.update(t + 20, this.camera);
    kit.renderer.render(this.scene, this.camera);
  }
}

function LogoOverlay({ t, ctx }: SceneProps) {
  const word = 'cozypet';
  const tag = ctx.fm.logo.tagline;
  const tagIn = ease.out(prog(t, 2.6, 3.2));
  return (
    <div className={s.full}>
      <div className={s.logoWord} aria-hidden="true">
        {word.split('').map((ch, i) => {
          const a = SOLID + 0.75 + i * 0.05;
          const p = ease.backBig(prog(t, a, a + 0.45));
          return (
            <span key={i} data-gold={i >= 4 ? 'true' : undefined} style={{ opacity: clamp(p * 1.5), transform: `translateY(${((1 - p) * 70).toFixed(1)}px) scale(${(0.5 + 0.5 * p).toFixed(3)})` }}>{ch}</span>
          );
        })}
      </div>
      <p className={s.logoTag} style={{ opacity: tagIn, transform: `translateY(${(1 - tagIn) * 18}px)`, letterSpacing: `${lerp(0.14, 0.02, tagIn)}em` }}>{tag}</p>
    </div>
  );
}

function logoSfx(): SceneSfx[] {
  const ev: SceneSfx[] = [
    { at: 0, kind: 'paper', dur: 1.4, gain: 0.6 },
    { at: 0.2, kind: 'riser', dur: SOLID - 0.2, gain: 0.8 },
    { at: SOLID, kind: 'impact', gain: 1 },
    { at: SOLID + 0.02, kind: 'sparkle', gain: 0.7 },
    { at: SOLID + 0.25, kind: 'draw', dur: 0.45, gain: 0.35 },
    { at: SOLID + 0.65, kind: 'pop', note: 3, gain: 0.5 },
    { at: SOLID + 0.72, kind: 'pop', note: 4, gain: 0.5 },
    { at: SOLID + 0.8, kind: 'pop', note: 5, gain: 0.45 },
    { at: SOLID + 0.88, kind: 'pop', note: 7, gain: 0.55 },
    { at: 3.75, kind: 'tick', note: 9, gain: 0.25 },
  ];
  'cozypet'.split('').forEach((_, i) => ev.push({ at: SOLID + 0.75 + i * 0.05, kind: 'tap', note: i, gain: 0.18 }));
  return ev;
}

export const logo: SceneModule = {
  gl: (_ctx: FilmContext) => new LogoScene(),
  Overlay: LogoOverlay,
  hud: 'light',
  sfx: logoSfx,
  post: (t) => {
    const flash = Math.max(0, 1 - Math.abs(t - SOLID) / 0.25);
    return { bloom: lerp(1.2, 0.8, prog(t, SOLID, SOLID + 1)), threshold: lerp(0.7, 0.95, prog(t, SOLID - 0.2, SOLID + 0.6)), vignette: lerp(0.5, 0.25, prog(t, SOLID, SOLID + 0.8)), lift: 0.35 * flash };
  },
};
