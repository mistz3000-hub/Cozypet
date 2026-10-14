/**
 * Smart Load Balancer (2 ห้อง): เมืองจำลอง 3 มิติตอนกลางคืน — ตึกยกตัว หมุดที่รับดูแลหล่นลงพร้อมถังบอกความจุ
 * จุดที่พบน้องส่งคลื่นเรดาร์ ลำแสงวัดคะแนนวิ่งไปทุกที่ ที่ใกล้สุดเต็ม (แดง) → เส้นทางทองพาไปที่ที่ยังรับได้
 * ภาพประกอบหลักการ (ตำแหน่ง/ความจุสมมติ) — ตัวเลขน้ำหนักมาจาก balancer-config จริง
 */
import * as THREE from 'three';
import type { GLKit, GLScene } from '../gl';
import type { FilmContext, SceneProps } from '../context';
import { clamp, ease, lerp, prog } from '../timeline';
import { rngFromKey } from '@/lib/seeded-random';
import { CapacityTank, MapPin, STATUS, iconDisc, type Status } from '../props/objects';
import type { SceneModule, SceneSfx } from './types';
import { Beam, Floaters, Sparks, applyCam, atlasCanvasTex, glowSprite, glowTexture, makeCamera, nightStudio, portraitDisc, project, setShock, shockRing, type CamRig } from './stage';
import s from './scenes.module.css';

interface Place { at: [number, number]; status: Status; level: number; best?: boolean }
const PLACES: Place[] = [
  { at: [1.6, 1.2], status: 'full', level: 1.02 },
  { at: [-2.6, 2.6], status: 'tight', level: 0.82 },
  { at: [3.9, -1.8], status: 'open', level: 0.32, best: true },
  { at: [-4.2, -1.6], status: 'open', level: 0.45 },
  { at: [5.6, 2.8], status: 'tight', level: 0.88 },
  { at: [-0.8, -3.6], status: 'open', level: 0.25 },
];
const FOUND: [number, number] = [0.2, -0.2];
const BEST = PLACES.findIndex((p) => p.best);
const FULL = 0;

const TT = { blocks: 0.0, pins: 0.55, radar: 1.15, beams: 1.5, verdict: 2.7, route: 3.0, arrive: 4.1, dive: 4.55 };

function rig(t: number): CamRig {
  const intro = ease.expoInOut(prog(t, 0, 1.4));
  const dive = ease.in(prog(t, TT.dive, 5.333));
  const best = PLACES[BEST].at;
  const orbit = lerp(-0.55, 0.15, ease.inOut(prog(t, 0, TT.dive)));
  const r = lerp(17, 13.5, intro);
  const h = lerp(15, 8.5, intro);
  const pos: [number, number, number] = [Math.sin(orbit) * r, h, Math.cos(orbit) * r];
  const look: [number, number, number] = [0.4, 0, -0.2];
  const divePos: [number, number, number] = [best[0] + 0.4, 2.4, -best[1] + 3.2];
  return {
    pos: [lerp(pos[0], divePos[0], dive), lerp(pos[1], divePos[1], dive), lerp(pos[2], divePos[2], dive)],
    look: [lerp(look[0], best[0], dive), lerp(look[1], 0.9, dive), lerp(look[2], -best[1], dive)],
    fov: lerp(34, 30, dive),
  };
}

const W3 = (p: [number, number], y = 0) => new THREE.Vector3(p[0], y, -p[1]);

class BalancerScene implements GLScene {
  scene = new THREE.Scene();
  camera = makeCamera();
  private blocks!: THREE.InstancedMesh;
  private blockData: { x: number; z: number; h: number; d: number }[] = [];
  private pins: MapPin[] = [];
  private tanks: CapacityTank[] = [];
  private beams: Beam[] = [];
  private route = new Beam('#ffd23f', 0.08, 1);
  private radar = shockRing('#ffd23f');
  private radar2 = shockRing('#ffd23f');
  private pet!: THREE.Group;
  private beacon!: THREE.Sprite;
  private sparks!: Sparks;
  private floaters!: Floaters;
  private dummy = new THREE.Object3D();

  async init(kit: GLKit) {
    const { scene } = this;
    await nightStudio(kit, scene, 0.7);
    scene.fog = new THREE.Fog('#0d0f26', 18, 40);
    const glow = await glowTexture(kit);
    // พื้นแผนที่: แม่น้ำเรืองแสง ถนน และบล็อกเมือง
    const mapTex = await kit.canvasTex(2048, 2048, (c) => {
      c.fillStyle = '#121735';
      c.fillRect(0, 0, 2048, 2048);
      const rnd = rngFromKey('cozypet:v1:film:map');
      c.strokeStyle = 'rgba(140,150,255,0.16)';
      c.lineWidth = 3;
      for (let i = 0; i < 46; i++) {
        const x = rnd() * 2048;
        c.beginPath();
        c.moveTo(x, 0);
        c.lineTo(x + (rnd() - 0.5) * 300, 2048);
        c.stroke();
        const y = rnd() * 2048;
        c.beginPath();
        c.moveTo(0, y);
        c.lineTo(2048, y + (rnd() - 0.5) * 300);
        c.stroke();
      }
      c.lineCap = 'round';
      const river = () => {
        c.beginPath();
        c.moveTo(420, -50);
        c.bezierCurveTo(700, 500, 300, 800, 760, 1100);
        c.bezierCurveTo(1100, 1320, 820, 1700, 1000, 2100);
      };
      c.strokeStyle = 'rgba(90,140,255,0.35)';
      c.lineWidth = 120;
      river();
      c.stroke();
      c.strokeStyle = 'rgba(140,190,255,0.9)';
      c.lineWidth = 46;
      river();
      c.stroke();
    });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ map: mapTex, roughness: 0.85, metalness: 0, emissive: '#ffffff', emissiveMap: mapTex, emissiveIntensity: 0.55 }));
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    // ตึกเล็ก ๆ (instanced) หลีกเลี่ยงหมุดและแม่น้ำ
    const rnd = rngFromKey('cozypet:v1:film:blocks');
    const N = 520;
    for (let i = 0; i < N; i++) {
      const x = (rnd() - 0.5) * 26;
      const z = (rnd() - 0.5) * 26;
      const near = PLACES.some((p) => Math.hypot(p.at[0] - x, -p.at[1] - z) < 1.9) || Math.hypot(FOUND[0] - x, -FOUND[1] - z) < 1.6;
      const riverX = -8.5 + ((z + 13) / 26) * 6 + Math.sin(z * 0.35) * 1.5;
      if (near || Math.abs(x - riverX) < 1.1) continue;
      this.blockData.push({ x, z, h: 0.12 + Math.pow(rnd(), 2.6) * 1.5, d: Math.hypot(x, z) });
    }
    this.blocks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 1, 0.5), new THREE.MeshPhysicalMaterial({ color: '#1c2052', roughness: 0.55, metalness: 0.2, clearcoat: 0.5, emissive: '#2c2c8a', emissiveIntensity: 0.08 }), this.blockData.length);
    scene.add(this.blocks);
    // ที่รับดูแล: หมุด + ถัง
    const face = await iconDisc(kit, 'home');
    for (const p of PLACES) {
      const pin = new MapPin(STATUS[p.status], face, 0.8);
      pin.group.position.copy(W3(p.at));
      this.pins.push(pin);
      scene.add(pin.group);
      const tk = new CapacityTank(0.28, 1.3);
      tk.group.position.copy(W3(p.at)).add(new THREE.Vector3(0.75, 0, 0.1));
      this.tanks.push(tk);
      scene.add(tk.group);
      const b = new Beam('#ffd23f', 0.03, 0.85);
      this.beams.push(b);
      scene.add(b.mesh);
    }
    scene.add(this.route.mesh);
    // จุดที่พบน้อง: ป้ายภาพขนมชั้น + แสง
    const street = kit.shared.get('street') as string | undefined;
    const petTex = street ? await kit.canvasTex(320, 320, async (c) => {
      const img = await kit.image(street);
      const k = Math.min(img.width, img.height) * 0.62;
      c.drawImage(img, (img.width - k) / 2, img.height * 0.06, k, k, 0, 0, 320, 320);
    }) : await atlasCanvasTex(kit, '/images/cats/cats-01.png', 4, 4, 3, 320);
    this.pet = portraitDisc(petTex, 0.5, '#ffd23f');
    scene.add(this.pet);
    this.beacon = glowSprite(glow, '#ffd23f', 3, 0);
    scene.add(this.beacon);
    for (const r of [this.radar, this.radar2]) {
      r.geometry.dispose();
      r.geometry = new THREE.RingGeometry(0.96, 1, 128);
      r.rotation.x = -Math.PI / 2;
      r.position.copy(W3(FOUND, 0.03));
      scene.add(r);
    }
    this.sparks = new Sparks(glow, 60, 'balancer', ['#ffd23f', '#ffffff', '#2e8b62']);
    scene.add(this.sparks.mesh);
    this.floaters = new Floaters(glow, 50, 'balancer', { x: 34, y: 16, z0: -16, z1: -4 }, ['#9f97ff', '#ffd27a'], 0.22);
    scene.add(this.floaters.mesh);
  }

  render(t: number, kit: GLKit) {
    applyCam(this.camera, rig(t));
    // ตึกยกตัวเป็นคลื่นจากกลางเมือง
    this.blockData.forEach((b, i) => {
      const k = ease.backOut(prog(t, TT.blocks + b.d * 0.035, TT.blocks + b.d * 0.035 + 0.5));
      const h = Math.max(0.001, b.h * k);
      this.dummy.position.set(b.x, h / 2, b.z);
      this.dummy.scale.set(1, h, 1);
      this.dummy.updateMatrix();
      this.blocks.setMatrixAt(i, this.dummy.matrix);
    });
    this.blocks.instanceMatrix.needsUpdate = true;
    const found = W3(FOUND);
    const verdict = prog(t, TT.verdict, TT.verdict + 0.3);
    PLACES.forEach((p, i) => {
      const a = TT.pins + i * 0.08;
      this.pins[i].update(t + i, prog(t, a, a + 0.6), this.camera, 1);
      const rise = ease.out(prog(t, a + 0.1, a + 0.7));
      const lvl = p.level * rise + (p.best ? 0.12 * ease.inOut(prog(t, TT.arrive, TT.arrive + 0.5)) : 0);
      this.tanks[i].set(lvl, p.status, t + i, i === FULL ? verdict : 0);
      this.tanks[i].group.scale.setScalar(Math.max(0.001, ease.backOut(prog(t, a, a + 0.5))));
      // ลำแสงวัดคะแนน: วิ่งจากจุดพบไปทุกที่ แล้วจางเหลือเฉพาะที่แนะนำ
      const b = this.beams[i];
      const to = W3(p.at, 1.1);
      b.set(found.clone().setY(0.4), to, 1.2 + i * 0.1, 0.028, 32);
      const bp = ease.out(prog(t, TT.beams + i * 0.1, TT.beams + i * 0.1 + 0.5));
      b.progress(0, bp);
      const keep = p.best ? 1 : 1 - verdict * 0.85;
      b.mesh.material.color.set(i === FULL && verdict > 0 ? '#ff5a46' : '#ffd23f');
      b.mesh.material.opacity = (0.55 + 0.3 * Math.sin(t * 8 + i)) * keep;
    });
    // เส้นทางทองไปยังที่แนะนำ + น้องเดินทางตามเส้น
    const best = W3(PLACES[BEST].at, 0.05);
    this.route.set(found.clone().setY(0.08), best, 1.8, 0.07, 64);
    const rp = ease.inOut(prog(t, TT.route, TT.route + 0.7));
    this.route.progress(0, rp);
    const travel = ease.inOut(prog(t, TT.route + 0.3, TT.arrive));
    const curve = new THREE.QuadraticBezierCurve3(found.clone().setY(1.0), found.clone().lerp(best, 0.5).setY(2.8).add(new THREE.Vector3(0, 0, 0.7)), best.clone().setY(1.6));
    const pp = curve.getPoint(travel);
    this.pet.position.copy(pp);
    this.pet.quaternion.copy(this.camera.quaternion);
    this.pet.scale.setScalar(Math.max(0.001, ease.backOut(prog(t, TT.radar - 0.2, TT.radar + 0.2)) * (1 - 0.3 * prog(t, TT.arrive, TT.arrive + 0.3))));
    this.beacon.position.copy(pp);
    this.beacon.material.opacity = 0.7 * prog(t, TT.radar - 0.2, TT.radar + 0.2);
    setShock(this.radar, (t - TT.radar) % 1.2, 7, 1.2);
    setShock(this.radar2, (t - TT.radar - 0.6) % 1.2 - (t < TT.radar + 0.6 ? 10 : 0), 7, 1.2);
    this.sparks.burst(best.clone().setY(1.4), t - TT.arrive, this.camera, 1.4);
    this.floaters.update(t + 30, this.camera);
    kit.renderer.render(this.scene, this.camera);
  }
}

function BalancerOverlay({ t, ctx }: SceneProps) {
  const fm = ctx.fm.scenes.balancer;
  const w = ctx.facts.weights;
  const r = rig(t);
  const legend = ease.out(prog(t, TT.beams - 0.1, TT.beams + 0.3));
  const bestAt = project(r, W3(PLACES[BEST].at, 2.35));
  const fullAt = project(r, W3(PLACES[FULL].at, 2.35));
  const foundAt = project(r, W3(FOUND, 0.0));
  const vb = ease.backOut(prog(t, TT.verdict, TT.verdict + 0.4));
  const ab = ease.backOut(prog(t, TT.arrive - 0.2, TT.arrive + 0.2));
  const factors: [string, number][] = [[fm.factors.space, w.space], [fm.factors.distance, w.distance], [fm.factors.urgency, w.urgency]];
  const fade = 1 - prog(t, TT.dive + 0.1, TT.dive + 0.4);
  return (
    <div className={s.full} style={{ opacity: fade }}>
      <div className={s.blLegend} style={{ opacity: legend, transform: `translateX(${(1 - legend) * -30}px)` }}>
        <span className={s.blTitle}>Smart Load Balancer</span>
        {factors.map(([label, v], i) => {
          const k = ease.expoOut(prog(t, TT.beams + 0.1 + i * 0.12, TT.beams + 0.9 + i * 0.12));
          return (
            <div key={label} className={s.blRow}>
              <span>{label}</span>
              <span className={s.blBar}><i style={{ transform: `scaleX(${(k * v / 50).toFixed(3)})` }} /></span>
              <b>{Math.round(v * k)}%</b>
            </div>
          );
        })}
        <span className={s.blNote}>{fm.note}</span>
      </div>
      <span className={s.blFound} style={{ left: foundAt.x, top: foundAt.y + 30, opacity: ease.out(prog(t, TT.radar, TT.radar + 0.3)) * (1 - prog(t, TT.route, TT.route + 0.3)) }}>{fm.found}</span>
      <span className={s.blBadge} data-tone="full" style={{ left: fullAt.x, top: fullAt.y, opacity: clamp(vb), transform: `translate(-50%, -100%) scale(${(0.6 + 0.4 * vb).toFixed(3)})` }}>{ctx.fm.story.status.full}</span>
      <span className={s.blBadge} style={{ left: bestAt.x, top: bestAt.y, opacity: clamp(ab), transform: `translate(-50%, -100%) scale(${(0.6 + 0.4 * ab).toFixed(3)})` }}>★ {fm.best}</span>
    </div>
  );
}

function balancerSfx(): SceneSfx[] {
  const ev: SceneSfx[] = [{ at: 0, kind: 'riser', dur: 0.9, gain: 0.5 }];
  for (let i = 0; i < 6; i++) ev.push({ at: TT.pins + i * 0.08 + 0.25, kind: 'drop', note: i, gain: 0.45 });
  ev.push({ at: TT.radar, kind: 'radar', gain: 0.6 });
  ev.push({ at: TT.radar + 1.2, kind: 'radar', gain: 0.4 });
  for (let i = 0; i < 6; i++) ev.push({ at: TT.beams + i * 0.1, kind: 'zap', note: 2 + i, gain: 0.32 });
  ev.push({ at: TT.verdict, kind: 'thud', note: 0, gain: 0.6 });
  ev.push({ at: TT.route, kind: 'whoosh', dur: 0.9, gain: 0.5 });
  ev.push({ at: TT.arrive, kind: 'success', gain: 0.7 });
  ev.push({ at: TT.dive, kind: 'whoosh', dur: 0.75, gain: 0.7 });
  return ev;
}

export const balancer: SceneModule = {
  gl: (_ctx: FilmContext) => new BalancerScene(),
  Overlay: BalancerOverlay,
  hud: 'dark',
  captionTone: 'dark',
  sfx: balancerSfx,
  post: () => ({ bloom: 1.2, threshold: 0.75, radius: 0.8, vignette: 0.45, contrast: 1.06, tint: 0.4 }),
};
