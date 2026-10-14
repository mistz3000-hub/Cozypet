/**
 * บ้านที่อบอุ่น (4 ห้อง): ฝนนอกหน้าต่างบ้านที่เปิดไฟอุ่น → กล้องเข้าไปเห็นขนมชั้นนอนบนเบาะ (เสียงคราง)
 * → ช่องมองภาพอุ่น ๆ กดชัตเตอร์ (แฟลชอุ่น ไม่ใช่ขาวเต็มจอ) → รูปโพลารอยด์สองใบบนตู้เย็น: ภาพแรกบนถนน + ภาพแรกในบ้าน
 * ภาพบ้านเป็นภาพสร้างด้วย AI ของผู้รับเลี้ยงสมมติ (adopter-001)
 */
import * as THREE from 'three';
import type { GLKit, GLScene } from '../gl';
import type { FilmContext, SceneProps } from '../context';
import { clamp, ease, lerp, prog } from '../timeline';
import { rngFromKey } from '@/lib/seeded-random';
import { photoCard } from '../props/objects';
import { filmAssets } from '../assets';
import type { SceneModule, SceneSfx } from './types';
import { Floaters, applyCam, atlasCanvasTex, glowSprite, glowTexture, makeCamera, softMaterial, type CamRig } from './stage';
import s from './scenes.module.css';

const IN = 3.0;
const SHOT = 8.0;
const FRIDGE = 8.15;

function rig(t: number): CamRig {
  if (t < IN) {
    const k = ease.in(prog(t, 1.2, IN));
    return { pos: [lerp(0.6, 0, k), lerp(0.2, 0.05, k), lerp(9, 1.2, k)], look: [0, 0.05, -2], fov: 32 };
  }
  if (t < FRIDGE) {
    const k = ease.out(prog(t, IN, SHOT));
    return { pos: [lerp(-0.6, 0.15, k), lerp(0.4, 0.15, k), lerp(5.2, 3.6, k)], look: [0.1, -0.15, -1.5], fov: 32, roll: 0.01 * Math.sin(t) };
  }
  const k = ease.inOut(prog(t, FRIDGE, 10.67));
  return { pos: [lerp(0.2, -0.3, k), 0, lerp(4.2, 6.0, k) + 30], look: [0, 0, 30], fov: 32 };
}

class HomeScene implements GLScene {
  scene = new THREE.Scene();
  camera = makeCamera();
  private outside = new THREE.Group();
  private inside = new THREE.Group();
  private fridge = new THREE.Group();
  private rain!: THREE.InstancedMesh;
  private rainData: { x: number; y: number; z: number; v: number }[] = [];
  private cat!: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  private rays!: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  private floaters!: Floaters;
  private polaroids: THREE.Group[] = [];
  private dummy = new THREE.Object3D();
  private bg = new THREE.Color();

  async init(kit: GLKit) {
    const { scene } = this;
    scene.background = this.bg;
    scene.add(new THREE.HemisphereLight('#ffe9c7', '#3a2a1c', 1.0));
    const key = new THREE.DirectionalLight('#ffd9a0', 1.3);
    key.position.set(-3, 4, 5);
    scene.add(key);
    const glow = await glowTexture(kit);
    const homeTex = await atlasCanvasTex(kit, '/images/homes/homes-01.png', 5, 5, 0, 1024);
    const homeBlur = await kit.canvasTex(1024, 1024, (c) => {
      c.filter = 'blur(10px) brightness(1.05) saturate(1.1)';
      c.drawImage(homeTex.image as HTMLCanvasElement, 0, 0);
    });

    // ── ภายนอก: ผนังมืด หน้าต่างเปิดไฟอุ่น ฝนตก
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 18), new THREE.MeshStandardMaterial({ color: '#1e2433', roughness: 0.9 }));
    wall.position.z = -0.2;
    const winW = 3.2;
    const winH = 2.4;
    const hole = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), new THREE.MeshBasicMaterial({ map: homeBlur, toneMapped: false }));
    hole.position.z = -0.6;
    const wallShape = new THREE.Shape();
    wallShape.moveTo(-15, -9);
    wallShape.lineTo(15, -9);
    wallShape.lineTo(15, 9);
    wallShape.lineTo(-15, 9);
    wallShape.closePath();
    const h = new THREE.Path();
    h.moveTo(-winW / 2, -winH / 2);
    h.lineTo(-winW / 2, winH / 2);
    h.lineTo(winW / 2, winH / 2);
    h.lineTo(winW / 2, -winH / 2);
    h.closePath();
    wallShape.holes.push(h);
    const wallMesh = new THREE.Mesh(new THREE.ShapeGeometry(wallShape), new THREE.MeshStandardMaterial({ color: '#232a3c', roughness: 0.95 }));
    this.outside.add(wallMesh, hole);
    void wall;
    const wood = softMaterial('#8a5a34', 0.6);
    for (const [w, hh, x, y] of [[winW + 0.24, 0.16, 0, winH / 2], [winW + 0.24, 0.16, 0, -winH / 2], [0.16, winH, -winW / 2, 0], [0.16, winH, winW / 2, 0], [0.08, winH, 0, 0]] as const) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, hh, 0.18), wood);
      b.position.set(x, y, 0.05);
      this.outside.add(b);
    }
    const sill = new THREE.Mesh(new THREE.BoxGeometry(winW + 0.6, 0.12, 0.5), wood);
    sill.position.set(0, -winH / 2 - 0.1, 0.2);
    this.outside.add(sill);
    const warm = glowSprite(glow, '#ffb45a', 7, 0.55);
    warm.position.z = 0.3;
    this.outside.add(warm);
    const rnd = rngFromKey('cozypet:v1:film:rain');
    const N = 420;
    for (let i = 0; i < N; i++) this.rainData.push({ x: (rnd() - 0.5) * 14, y: rnd() * 10, z: 0.5 + rnd() * 6, v: 7 + rnd() * 5 });
    this.rain = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.012, 0.42), new THREE.MeshBasicMaterial({ color: '#a9c4ff', transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false }), N);
    this.rain.frustumCulled = false;
    this.outside.add(this.rain);
    scene.add(this.outside);

    // ── ภายใน: ห้องของผู้รับเลี้ยง + ขนมชั้นบนเบาะ
    const back = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshBasicMaterial({ map: homeBlur, toneMapped: false }));
    back.position.set(0, 0.6, -4);
    this.inside.add(back);
    // เบาะนอนแมวทรงโดนัท (ขอบหน้าบังขอบล่างของภาพแมว)
    const bed = new THREE.Group();
    // วางราบ เอียงด้านหลังขึ้นหากล้องเล็กน้อย (มองเห็นด้านในเบาะ)
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.38, 24, 64), softMaterial('#fff1de', 0.95));
    rim.rotation.x = -Math.PI / 2 + 0.25;
    rim.scale.set(1, 1, 0.8);
    bed.add(rim);
    const inner = new THREE.Mesh(new THREE.CircleGeometry(1.15, 48), softMaterial('#f8c9bf', 0.9));
    inner.rotation.x = -Math.PI / 2 + 0.25;
    inner.position.y = -0.1;
    bed.add(inner);
    bed.position.set(0, -1.15, -0.9);
    this.inside.add(bed);
    const catTex = await kit.tex('/mascot/cat-happy.png');
    this.cat = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), new THREE.MeshBasicMaterial({ map: catTex, transparent: true, toneMapped: false }));
    this.cat.position.set(0, -0.2, -1.2);
    this.inside.add(this.cat);
    const rayTex = await kit.canvasTex(256, 512, (c) => {
      const g = c.createLinearGradient(0, 0, 256, 0);
      g.addColorStop(0, 'rgba(255,214,150,0)');
      g.addColorStop(0.5, 'rgba(255,214,150,0.5)');
      g.addColorStop(1, 'rgba(255,214,150,0)');
      c.fillStyle = g;
      c.fillRect(0, 0, 256, 512);
    });
    this.rays = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 7), new THREE.MeshBasicMaterial({ map: rayTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0.4 }));
    this.rays.position.set(-1.6, 1.4, -2);
    this.rays.rotation.z = -0.5;
    this.inside.add(this.rays);
    this.floaters = new Floaters(glow, 50, 'home', { x: 8, y: 5, z0: -3.5, z1: 0 }, ['#ffd27a', '#ffffff'], 0.35);
    this.inside.add(this.floaters.mesh);
    scene.add(this.inside);

    // ภาพแรกในบ้าน: เรนเดอร์ท่ากดชัตเตอร์ไว้ก่อน (ใช้บนตู้เย็นและ film:stills)
    this.render(SHOT - 0.01, kit);
    const homeShot = kit.renderer.domElement.toDataURL('image/jpeg', 0.92);
    filmAssets.set('home', homeShot);
    kit.shared.set('home', homeShot);

    // ── ตู้เย็น + โพลารอยด์สองใบ
    this.fridge.position.z = 30;
    const door = new THREE.Mesh(new THREE.PlaneGeometry(12, 8), new THREE.MeshPhysicalMaterial({ color: '#f6efe3', roughness: 0.35, clearcoat: 0.6 }));
    door.position.z = -0.3;
    this.fridge.add(door);
    const street = kit.shared.get('street') as string | undefined;
    for (const [i, url] of [street, homeShot].entries()) {
      if (!url) continue;
      const img = await kit.image(url);
      const tex = await kit.canvasTex(600, 720, (c) => {
        c.fillStyle = '#fffdf8';
        c.fillRect(0, 0, 600, 720);
        const k = Math.min(img.width * 0.75, img.height);
        c.drawImage(img, (img.width - k) / 2, (img.height - k) / 2, k, k, 36, 36, 528, 528);
      });
      const pc = photoCard(tex, 2.0, 2.4);
      pc.position.set(i ? 1.35 : -1.35, i ? -0.1 : 0.15, 0);
      pc.rotation.z = i ? -0.06 : 0.07;
      const mag = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 14), softMaterial(i ? '#f4b400' : '#f0707a', 0.3));
      mag.scale.z = 0.5;
      mag.position.set(0, 1.12, 0.08);
      pc.add(mag);
      this.polaroids.push(pc);
      this.fridge.add(pc);
    }
    scene.add(this.fridge);
  }

  render(t: number, kit: GLKit) {
    applyCam(this.camera, rig(t));
    const outside = t < IN;
    const inside = t >= IN - 0.25 && t < FRIDGE;
    this.outside.visible = outside;
    this.inside.visible = inside;
    this.fridge.visible = t >= FRIDGE;
    this.bg.set(outside ? '#141a2a' : '#2b2118');
    if (outside) {
      this.rainData.forEach((r, i) => {
        const y = 7 - ((r.y + t * r.v) % 10);
        this.dummy.position.set(r.x, y - 2, r.z);
        this.dummy.rotation.set(0, 0, 0.12);
        this.dummy.updateMatrix();
        this.rain.setMatrixAt(i, this.dummy.matrix);
      });
      this.rain.instanceMatrix.needsUpdate = true;
    }
    if (inside) {
      const breath = 1 + 0.02 * Math.sin(t * Math.PI * 1.3);
      this.cat.scale.set(1, breath, 1);
      this.rays.material.opacity = 0.32 + 0.08 * Math.sin(t * 0.7);
      this.floaters.update(t, this.camera);
    }
    if (t >= FRIDGE) {
      this.polaroids.forEach((p, i) => {
        const k = ease.backOut(prog(t, FRIDGE + i * 0.35, FRIDGE + 0.5 + i * 0.35));
        p.scale.setScalar(Math.max(0.001, k));
      });
    }
    kit.renderer.render(this.scene, this.camera);
  }
}

function HomeOverlay({ t }: SceneProps) {
  const vf = clamp(Math.min(ease.out(prog(t, 7.2, 7.5)), 1 - prog(t, SHOT + 0.05, SHOT + 0.2)));
  const focus = 1 - ease.out(prog(t, 7.3, 7.8));
  return (
    <div className={s.full}>
      {vf > 0.01 ? (
        <div className={s.hmVf} style={{ opacity: vf }} aria-hidden="true">
          {(['tl', 'tr', 'bl', 'br'] as const).map((c) => <span key={c} className={s.hmCorner} data-c={c} />)}
          <span className={s.hmFocus} style={{ transform: `translate(-50%, -50%) scale(${(1 + 0.4 * focus).toFixed(3)})` }} />
          <span className={s.hmShutter} style={{ transform: `translateX(-50%) scale(${t > SHOT - 0.08 && t < SHOT + 0.1 ? 0.88 : 1})` }} />
        </div>
      ) : null}
    </div>
  );
}

function homeSfx(): SceneSfx[] {
  return [
    { at: 0, kind: 'rain', dur: IN + 0.3, gain: 0.6 },
    { at: 1.6, kind: 'whoosh', dur: 1.3, gain: 0.35 },
    { at: IN, kind: 'purr', dur: 4.4, gain: 0.7 },
    { at: 7.25, kind: 'tick', note: 9, gain: 0.25 },
    { at: SHOT, kind: 'shutter', gain: 0.8 },
    { at: 7.6, kind: 'meow', gain: 0.5 },
    { at: FRIDGE + 0.3, kind: 'pop', note: 2, gain: 0.5 },
    { at: FRIDGE + 0.65, kind: 'pop', note: 4, gain: 0.5 },
  ];
}

export const home: SceneModule = {
  gl: (_ctx: FilmContext) => new HomeScene(),
  Overlay: HomeOverlay,
  hud: 'dark',
  captionTone: 'dark',
  sfx: homeSfx,
  canvasStyle: (t) => (t < IN ? { filter: `blur(${(0.6 + 2.5 * prog(t, 2.3, IN)).toFixed(2)}px)` } : {}),
  post: (t) => ({ bloom: 0.9, threshold: 0.85, vignette: 0.45, tint: 0.5, lift: 0.4 * Math.max(0, 1 - Math.abs(t - SHOT - 0.05) / 0.18), exposure: t >= IN && t < FRIDGE ? 1.05 : 1 }),
};
