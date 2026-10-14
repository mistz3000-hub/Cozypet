'use client';
/**
 * บท 0 “ช่องมองภาพ” (STORYBOARD.md หัวข้อ 4 ฉบับ D33: ภาพสมจริง)
 * แมวสมจริง (mascot PNG alpha 3 ท่า) เกาะขอบบันไดในซอยยามเย็น · ฉากหลังเป็นภาพวาดในโค้ดที่เบลอตามระยะชัด
 * กล้องมือถือเดินเข้า สั่นตามก้าว (seeded) โฟกัส ล็อก กะพริบตาช้า ชัตเตอร์ แฟลชขาวครั้งเดียว ภาพค้าง ย่อเป็น thumbnail แล้วดันเข้าจมูก
 */
import * as THREE from 'three';
import type { CSSProperties } from 'react';
import { rngFromKey } from '@/lib/seeded-random';
import { filmAssets } from '../assets';
import type { SceneProps } from '../context';
import type { GLKit, GLScene } from '../gl';
import { clamp, ease, fbm, keys, lerp, prog, tween } from '../timeline';
import type { SceneModule, SceneSfx } from './types';
import s from './scenes.module.css';

export const SHUTTER = 10.3;
const FREEZE_END = 11.3;
const THUMB_END = 12.1;
const NOSE_START = 12.1;

/** ซองค่ากล้องมือถือ (STORYBOARD 4.3) */
const amp = (t: number) => keys(t, [[0, 0], [1.2, 0], [1.8, 1], [6.0, 1], [7.6, 0.25], [9.55, 0.05], [10.3, 0.01]], ease.inOut);

function paintSoi(c: CanvasRenderingContext2D, w: number, h: number) {
  const rnd = rngFromKey('cozypet:v1:film:soi');
  const sky = c.createLinearGradient(0, 0, 0, h * 0.6);
  sky.addColorStop(0, '#ffd9a0');
  sky.addColorStop(1, '#fff3d1');
  c.fillStyle = sky;
  c.fillRect(0, 0, w, h);
  const sun = c.createRadialGradient(w * 0.18, h * 0.12, 10, w * 0.18, h * 0.12, w * 0.45);
  sun.addColorStop(0, 'rgba(255,250,225,1)');
  sun.addColorStop(1, 'rgba(255,240,200,0)');
  c.fillStyle = sun;
  c.fillRect(0, 0, w, h);
  // ตึกไกล
  for (let i = 0; i < 14; i++) {
    const bw = w * (0.06 + rnd() * 0.08);
    const x = rnd() * w;
    const top = h * (0.12 + rnd() * 0.25);
    c.fillStyle = ['#f3c9a0', '#efc39b', '#f6d8b4', '#e8b991'][i % 4];
    c.fillRect(x, top, bw, h);
    c.fillStyle = 'rgba(160,110,70,0.25)';
    for (let yy = top + 20; yy < h * 0.62; yy += 34) for (let xx = x + 10; xx < x + bw - 16; xx += 28) c.fillRect(xx, yy, 14, 18);
  }
  // สายไฟพันกันแบบกรุงเทพฯ
  c.strokeStyle = 'rgba(90,60,40,0.55)';
  for (let i = 0; i < 9; i++) {
    c.lineWidth = 2 + rnd() * 3;
    c.beginPath();
    const y0 = h * (0.05 + rnd() * 0.22);
    c.moveTo(-20, y0);
    c.bezierCurveTo(w * 0.3, y0 + 60 + rnd() * 80, w * 0.65, y0 + 40 + rnd() * 70, w + 20, y0 + rnd() * 60 - 30);
    c.stroke();
  }
  // ผนังตึกแถวและประตูเหล็กยืด (ซ้าย)
  c.fillStyle = '#f7e6cc';
  c.fillRect(0, h * 0.3, w * 0.42, h);
  c.fillStyle = '#b9a58f';
  for (let x = w * 0.05; x < w * 0.36; x += 18) c.fillRect(x, h * 0.42, 8, h * 0.4);
  // เฟื่องฟ้าสีชมพูและต้นไม้ (ขวา)
  for (let i = 0; i < 60; i++) {
    const px = w * (0.62 + rnd() * 0.38);
    const py = h * (0.28 + rnd() * 0.4);
    c.fillStyle = i % 3 === 0 ? '#e57aa8' : i % 3 === 1 ? '#7a9a5a' : '#94b56a';
    c.beginPath();
    c.ellipse(px, py, 30 + rnd() * 60, 24 + rnd() * 40, rnd() * 3, 0, Math.PI * 2);
    c.fill();
  }
  // เก้าอี้พลาสติกสีฟ้า + มอเตอร์ไซค์ (เบลอ ไม่มีป้าย)
  c.fillStyle = '#4f8fd6';
  c.fillRect(w * 0.48, h * 0.55, w * 0.06, h * 0.12);
  c.fillRect(w * 0.48, h * 0.66, w * 0.012, h * 0.12);
  c.fillRect(w * 0.53, h * 0.66, w * 0.012, h * 0.12);
  c.fillStyle = '#3c3530';
  c.beginPath();
  c.ellipse(w * 0.78, h * 0.72, w * 0.09, h * 0.07, 0, 0, Math.PI * 2);
  c.fill();
  // พื้นถนน
  const road = c.createLinearGradient(0, h * 0.7, 0, h);
  road.addColorStop(0, '#d9c3a8');
  road.addColorStop(1, '#c7ad90');
  c.fillStyle = road;
  c.fillRect(0, h * 0.72, w, h);
}

function paintStep(c: CanvasRenderingContext2D, w: number, h: number) {
  const g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#fff1d6');
  g.addColorStop(0.035, '#f3dcbc');
  g.addColorStop(0.09, '#d9bf9c');
  g.addColorStop(1, '#bfa27e');
  c.fillStyle = g;
  c.fillRect(0, 0, w, h);
  const rnd = rngFromKey('cozypet:v1:film:step');
  for (let i = 0; i < 2600; i++) {
    c.fillStyle = `rgba(${rnd() < 0.5 ? '120,90,60' : '255,245,225'},${0.05 + rnd() * 0.08})`;
    c.fillRect(rnd() * w, h * 0.05 + rnd() * h * 0.95, 2 + rnd() * 3, 2 + rnd() * 3);
  }
  // ขอบบนโดนแดดเย็น
  c.fillStyle = 'rgba(255,214,140,0.55)';
  c.fillRect(0, 0, w, h * 0.012);
}

function paintLeaves(c: CanvasRenderingContext2D, w: number, h: number) {
  const rnd = rngFromKey('cozypet:v1:film:leaves');
  c.filter = 'blur(26px)';
  for (const [cx, cy] of [[0.04, 0.06], [0.97, 0.95]] as const) {
    for (let i = 0; i < 16; i++) {
      c.fillStyle = i % 2 ? 'rgba(62,92,44,0.92)' : 'rgba(88,120,58,0.9)';
      c.beginPath();
      c.ellipse(w * (cx + (rnd() - 0.5) * 0.18), h * (cy + (rnd() - 0.5) * 0.22), 70 + rnd() * 90, 26 + rnd() * 30, rnd() * Math.PI, 0, Math.PI * 2);
      c.fill();
    }
  }
}

class ColdScene implements GLScene {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.05, 100);
  private cats: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] = [];
  private catGroup = new THREE.Group();
  private leaves!: THREE.Mesh;
  private beam!: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  private dust!: THREE.InstancedMesh;
  private dustData: { x: number; y: number; z: number; s: number; v: number; ph: number }[] = [];
  private shake = fbm('cozypet:v1:film:coldopen');

  async init(kit: GLKit) {
    const { scene } = this;
    scene.background = new THREE.Color('#fff3d1');
    const soi = await kit.canvasTex(2048, 1152, (c) => {
      paintSoi(c, 2048, 1152);
      const blurred = document.createElement('canvas');
      blurred.width = 2048;
      blurred.height = 1152;
      const b = blurred.getContext('2d')!;
      b.filter = 'blur(22px)';
      b.drawImage(c.canvas, 0, 0);
      c.clearRect(0, 0, 2048, 1152);
      c.drawImage(blurred, 0, 0);
      // โบเก้จากแสงแดด
      const rnd = rngFromKey('cozypet:v1:film:soi-bokeh');
      c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 26; i++) {
        const x = rnd() * 2048;
        const y = rnd() * 700;
        const r = 18 + rnd() * 46;
        const g = c.createRadialGradient(x, y, r * 0.2, x, y, r);
        g.addColorStop(0, 'rgba(255,236,190,0.35)');
        g.addColorStop(0.8, 'rgba(255,220,160,0.22)');
        g.addColorStop(1, 'rgba(255,220,160,0)');
        c.fillStyle = g;
        c.beginPath();
        c.arc(x, y, r, 0, Math.PI * 2);
        c.fill();
      }
      c.globalCompositeOperation = 'source-over';
    });
    const back = new THREE.Mesh(new THREE.PlaneGeometry(34, 19.1), new THREE.MeshBasicMaterial({ map: soi, toneMapped: false }));
    back.position.set(0, 1.2, -14);
    scene.add(back);

    const step = await kit.canvasTex(2048, 512, (c) => paintStep(c, 2048, 512));
    const stepMesh = new THREE.Mesh(new THREE.PlaneGeometry(26, 6.5), new THREE.MeshBasicMaterial({ map: step, toneMapped: false }));
    stepMesh.position.set(0, -1.62 - 3.25, -0.9);
    scene.add(stepMesh);
    // เงาใต้อุ้งเท้าบนขอบบันได
    const shadowTex = await kit.canvasTex(256, 64, (c) => {
      const g = c.createRadialGradient(128, 20, 4, 128, 20, 120);
      g.addColorStop(0, 'rgba(90,60,30,0.45)');
      g.addColorStop(1, 'rgba(90,60,30,0)');
      c.fillStyle = g;
      c.fillRect(0, 0, 256, 64);
    });
    const contact = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.6), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, toneMapped: false }));
    contact.position.set(0.2, -1.78, -0.89);
    scene.add(contact);

    for (const name of ['neutral', 'happy', 'yawn']) {
      const tex = await kit.tex(`/mascot/cat-${name}.png`);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }));
      m.position.y = 1.8;
      this.cats.push(m);
      this.catGroup.add(m);
    }
    this.catGroup.position.set(0.2, -1.62 - 0.04, -1.0);
    scene.add(this.catGroup);

    // ลำแสงแดดเย็นและฝุ่น
    const beamTex = await kit.canvasTex(512, 512, (c) => {
      const g = c.createLinearGradient(0, 0, 512, 0);
      g.addColorStop(0, 'rgba(255,230,170,0)');
      g.addColorStop(0.5, 'rgba(255,230,170,0.5)');
      g.addColorStop(1, 'rgba(255,230,170,0)');
      c.fillStyle = g;
      c.fillRect(0, 0, 512, 512);
      // จางที่ปลายลำแสง
      c.globalCompositeOperation = 'destination-in';
      const v = c.createLinearGradient(0, 0, 0, 512);
      v.addColorStop(0, 'rgba(0,0,0,0.9)');
      v.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = v;
      c.fillRect(0, 0, 512, 512);
      c.globalCompositeOperation = 'source-over';
    });
    this.beam = new THREE.Mesh(new THREE.PlaneGeometry(9, 14), new THREE.MeshBasicMaterial({ map: beamTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.35, toneMapped: false }));
    this.beam.position.set(-1.5, 2.5, -0.6);
    this.beam.rotation.z = -0.55;
    scene.add(this.beam);
    const disc = await kit.canvasTex(64, 64, (c) => {
      const g = c.createRadialGradient(32, 32, 2, 32, 32, 30);
      g.addColorStop(0, 'rgba(255,245,215,1)');
      g.addColorStop(1, 'rgba(255,245,215,0)');
      c.fillStyle = g;
      c.fillRect(0, 0, 64, 64);
    });
    const rnd = rngFromKey('cozypet:v1:film:dust');
    const N = 70;
    this.dust = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: disc, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.8, toneMapped: false }), N);
    for (let i = 0; i < N; i++) this.dustData.push({ x: -4 + rnd() * 6, y: -1 + rnd() * 5, z: -0.8 + rnd() * 2.4, s: 0.02 + rnd() * 0.05, v: 0.05 + rnd() * 0.12, ph: rnd() * 6 });
    scene.add(this.dust);

    const leaves = await kit.canvasTex(1024, 576, (c) => paintLeaves(c, 1024, 576));
    this.leaves = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.9), new THREE.MeshBasicMaterial({ map: leaves, transparent: true, depthWrite: false, toneMapped: false }));
    this.leaves.position.set(0, 0, 5.6);
    scene.add(this.leaves);

    // “ภาพแรกบนถนน”: เฟรมตอนกดชัตเตอร์ (ไม่มี UI) — ใช้ในภาพค้าง thumbnail รูปบนตู้เย็นบท 12 และ film:stills
    // เรนเดอร์สองรอบ: รอบแรกอัปโหลด buffer ของ instanced dust (ไม่งั้นได้จุดขาวใหญ่ที่จุดกำเนิด)
    kit.renderer.setRenderTarget(null);
    this.render(SHUTTER, kit);
    this.render(SHUTTER, kit);
    const url = kit.renderer.domElement.toDataURL('image/jpeg', 0.95);
    filmAssets.set('street', url);
    kit.shared.set('street', url);
  }

  /** ตั้งกล้อง/ท่าแมวที่เวลา t */
  private pose(t: number) {
    const A = amp(t);
    const f = 1.5;
    const n = this.shake;
    const bobY = 0.07 * A * Math.sin(2 * Math.PI * f * t);
    const swayX = 0.04 * A * Math.sin(Math.PI * f * t);
    const roll = (0.9 * Math.PI / 180) * A * Math.sin(Math.PI * f * t + 0.6);
    const jit = 0.15;
    const z = keys(t, [[0, 8.4], [1.2, 8.2], [6.4, 6.6], [9.55, 5.7], [10.3, 5.55]], ease.inOut);
    const kneel = tween(t, 6.4, 7.6, 0, 1, ease.out);
    const y = 0.35 - 0.45 * kneel + bobY * (1 + jit * n(t * 3));
    const x = swayX * (1 + jit * n(t * 3 + 9)) + 0.2;
    this.camera.position.set(x, y, z);
    this.camera.fov = keys(t, [[0, 36], [6.4, 34], [10.3, 31.5]], ease.inOut);
    this.camera.updateProjectionMatrix();
    const look = new THREE.Vector3(0.2, lerp(0.55, 0.25, kneel), -1);
    this.camera.lookAt(look);
    this.camera.rotateZ(roll * (1 + jit * n(t * 3 + 17)));
    this.camera.rotateX((2 * Math.PI / 180) * (1 - kneel) * 0.5);
    // ท่าแมว: หาว (3.2–4.4) กะพริบตาช้า (8.6–9.55) อื่น ๆ หน้าปกติ
    const yawn = Math.min(prog(t, 3.15, 3.35), 1 - prog(t, 4.3, 4.5));
    const blink = Math.min(prog(t, 8.6, 8.95), 1 - prog(t, 9.15, 9.55));
    const happyEnd = t > 12.0 ? prog(t, 12.0, 12.3) : 0;
    const w = [1 - Math.max(yawn, blink, happyEnd), Math.max(blink, happyEnd), yawn];
    this.cats.forEach((m, i) => { m.material.opacity = clamp(w[i]); });
    const tilt = (6 * Math.PI / 180) * Math.min(prog(t, 8.5, 8.9), 1 - prog(t, 9.6, 10.2)) + (4 * Math.PI / 180) * prog(t, 11.3, 11.8);
    this.catGroup.rotation.z = -tilt * 0.6;
    const breath = 1 + 0.012 * Math.sin(2 * Math.PI * 0.5 * t);
    this.catGroup.scale.set(1, breath, 1);
  }

  render(t: number, kit: GLKit) {
    // ช่วงภาพค้างใช้เฟรมชัตเตอร์ (ภาพนิ่งเป็น DOM ด้านบน) กล้องจริงยังเดินต่อด้านหลัง
    this.pose(t >= SHUTTER && t < FREEZE_END ? SHUTTER : t);
    if (t >= NOSE_START) {
      // ขนมชั้นเดินเข้ามาดมเลนส์: ดันกล้องเข้าหาจมูก
      const k = ease.in(prog(t, NOSE_START, 13.33));
      const nose = new THREE.Vector3(0.2, -1.66 + 3.6 * 0.47, -1.0);
      this.camera.position.lerp(new THREE.Vector3(nose.x, nose.y, nose.z + 0.35), k);
      this.camera.lookAt(nose);
    }
    // ฝุ่นในแสง
    const d = new THREE.Object3D();
    this.dustData.forEach((p, i) => {
      d.position.set(p.x + 0.2 * Math.sin(t * 0.4 + p.ph), p.y + ((t * p.v + p.ph) % 5) - 2.5, p.z);
      d.scale.setScalar(p.s * (0.7 + 0.3 * Math.sin(t * 2 + p.ph)));
      d.lookAt(this.camera.position);
      d.updateMatrix();
      this.dust.setMatrixAt(i, d.matrix);
    });
    this.dust.instanceMatrix.needsUpdate = true;
    this.beam.material.opacity = 0.32 + 0.05 * Math.sin(t * 0.8);
    // ใบไม้หน้ากล้องติดกล้อง (parallax มากที่สุด)
    this.leaves.position.copy(this.camera.position);
    this.leaves.quaternion.copy(this.camera.quaternion);
    this.leaves.translateZ(-2.4);
    this.leaves.scale.setScalar(1.6);
    kit.renderer.render(this.scene, this.camera);
  }
}

/** เบลอโฟกัส แสงเปิดกล้อง และภาพเบลอตอนดมเลนส์ (CSS filter บน canvas) */
function coldCanvasStyle(t: number): CSSProperties {
  const blur = t < 1.2 ? 12
    : t < 5.2 ? lerp(12, 2.5, ease.out(prog(t, 1.2, 2.6)))
      : t < 5.9 ? keys(t, [[5.2, 2.5], [5.38, 8], [5.55, 2], [5.72, 5], [5.9, 0.6]], ease.inOut)
        : t < NOSE_START ? 0 : lerp(0, 22, ease.in(prog(t, NOSE_START + 0.3, 13.2)));
  const bright = t < 1.2 ? lerp(0.3, 1, ease.out(prog(t, 0.2, 1.0))) : 1;
  return { filter: `blur(${blur.toFixed(2)}px) brightness(${bright.toFixed(3)}) saturate(1.08)` };
}

function ColdOverlay({ t, ctx }: SceneProps) {
  const fm = ctx.fm;
  const street = filmAssets.get('street');
  const uiIn = ease.out(prog(t, 0.05, 0.55));
  const uiVis = t < SHUTTER ? uiIn : t < FREEZE_END ? 1 - prog(t, SHUTTER, SHUTTER + 0.3) : t < NOSE_START + 0.4 ? prog(t, FREEZE_END, FREEZE_END + 0.3) : 1 - prog(t, NOSE_START + 0.4, 12.9);
  const locked = t >= 5.9;
  const focusSize = locked ? 84 + 6 * Math.max(0, 1 - Math.abs(t - SHUTTER) / 0.12) : 120;
  const flashFrame = t >= SHUTTER + 1 / 30 && t < SHUTTER + 3 / 30 ? 1 : t >= SHUTTER + 3 / 30 ? 1 - ease.out(prog(t, SHUTTER + 3 / 30, SHUTTER + 3 / 30 + 0.35)) : 0;
  const freeze = t >= SHUTTER && t < THUMB_END + 0.4;
  // ภาพค้าง → thumbnail มุมซ้ายล่าง (หมุน 3° แล้วเด้ง)
  const shrink = ease.inOut(prog(t, FREEZE_END, THUMB_END));
  const pop = t >= THUMB_END ? 1 + 0.15 * Math.max(0, 1 - (t - THUMB_END) / 0.25) * Math.sin(prog(t, THUMB_END, THUMB_END + 0.25) * Math.PI) : 1;
  const thumb = { x: 132, y: 958, s: 104 / 1920 };
  const fx = lerp(960, thumb.x, shrink);
  const fy = lerp(540, thumb.y, shrink);
  const fs = lerp(1, thumb.s, shrink) * pop;
  const overBright = t < FREEZE_END ? lerp(1.25, 1, ease.out(prog(t, SHUTTER + 0.1, SHUTTER + 0.6))) : 1;
  const counter = t >= SHUTTER ? 25 : 24;
  const caption = Math.min(prog(t, 2.0, 2.4), 1 - prog(t, 4.6, 5.0));
  const snap = t >= SHUTTER && t < FREEZE_END + 0.2 ? ease.backOut(prog(t, SHUTTER + 0.05, SHUTTER + 0.35)) * (1 - prog(t, FREEZE_END - 0.1, FREEZE_END + 0.2)) : 0;
  const pink = prog(t, 12.75, 13.15);
  const cream = prog(t, 13.12, 13.32);
  const press = t >= SHUTTER && t < SHUTTER + 0.12 ? 0.86 : 1;
  const ev = keys(t, [[0, -2], [1.0, 0.4], [5.9, 0], [10.3, 0]], ease.inOut);
  const style = (o: number): CSSProperties => ({ opacity: o });

  return (
    <div className={s.cold}>
      {freeze && street ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={s.freeze} src={street} alt="" style={{ transform: `translate(${fx - 960}px, ${fy - 540}px) rotate(${3 * shrink}deg) scale(${fs})`, filter: `brightness(${overBright})`, outline: shrink > 0 ? `${lerp(0, 60, shrink)}px solid #fff` : undefined }} />
      ) : null}
      <div className={s.vf} style={style(uiVis)} aria-hidden="true">
        <span className={s.bezel} />
        {(['tl', 'tr', 'bl', 'br'] as const).map((c, i) => (
          <span key={c} className={s.corner} data-c={c} style={{ transform: `translate(${(1 - ease.out(prog(t, 0.06 * i, 0.25 + 0.06 * i))) * (c.endsWith('l') ? -80 : 80)}px, ${(1 - ease.out(prog(t, 0.06 * i, 0.25 + 0.06 * i))) * (c.startsWith('t') ? -80 : 80)}px)` }} />
        ))}
        <span className={s.grid} style={{ opacity: 0.25 * prog(t, 0.2, 0.6) }} />
        <span className={s.focus} data-locked={locked ? 'true' : undefined} style={{ width: focusSize, height: focusSize, transform: `translate(-50%, -50%) translate(${locked ? 0 : 6 * Math.sin(t * 7)}px, ${locked ? 0 : 4 * Math.cos(t * 5)}px)` }} />
        <div className={s.topBar}>
          <span className={s.flashIcon}><svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor" /></svg>A</span>
          <span className={s.af} data-locked={locked ? 'true' : undefined}>{locked ? 'AF-L' : 'AF'}</span>
          <span className={s.count}>{counter}</span>
          <span className={s.battery}><i /><i /><i /></span>
        </div>
        <div className={s.bottomBar}>
          <div className={s.ev}>
            <span>−2</span><span>·</span><span>·</span><span>0</span><span>·</span><span>·</span><span>+2</span>
            <i style={{ transform: `translateX(${ev * 44}px)` }} />
          </div>
          <div className={s.modes}><span>VIDEO</span><b>PHOTO</b><span>PORTRAIT</span></div>
          <div className={s.slot} />
          <button type="button" tabIndex={-1} className={s.shutter} style={{ transform: `translateX(-50%) scale(${press})` }}><svg viewBox="0 0 100 100" width="34" height="34" aria-hidden="true"><g fill="currentColor"><ellipse cx="50" cy="64" rx="24" ry="20" /><ellipse cx="22" cy="40" rx="9" ry="11" /><ellipse cx="38" cy="24" rx="9" ry="12" /><ellipse cx="62" cy="24" rx="9" ry="12" /><ellipse cx="78" cy="40" rx="9" ry="11" /></g></svg></button>
        </div>
        <span className={s.camLabel}>{fm.cold.camLabel}</span>
      </div>
      {caption > 0 ? <p className={s.coldCaption} style={{ opacity: caption, transform: `translateY(${(1 - caption) * 10}px)` }}>{fm.cold.line}</p> : null}
      {snap > 0 ? <p className={s.snap} style={{ opacity: Math.min(1, snap * 1.5), transform: `scale(${0.6 + 0.4 * snap}) rotate(-6deg)` }}>{fm.cold.snap}</p> : null}
      {flashFrame > 0 ? <span className={s.flash} style={{ opacity: flashFrame }} /> : null}
      {pink > 0 ? <span className={s.pink} style={{ opacity: pink }} /> : null}
      {cream > 0 ? <span className={s.creamFill} style={{ opacity: cream }} /> : null}
      <span className={s.grain} style={{ backgroundPosition: `${Math.floor(t * 30) * 37 % 200}px ${Math.floor(t * 30) * 53 % 200}px` }} />
      <span className={s.vignette} />
    </div>
  );
}

/** เสียงบท 0 (ยังไม่มีดนตรี): บรรยากาศซอย ฝีเท้า โฟกัส ชัตเตอร์ และเสียงดมเลนส์ */
function coldSfx(): SceneSfx[] {
  const ev: SceneSfx[] = [{ at: 0, kind: 'ambience', dur: 13.3, gain: 0.55 }];
  for (let i = 0; i < 8; i++) ev.push({ at: 1.25 + i * (2 / 3), kind: 'steps', note: i % 2, gain: 0.35 + 0.03 * i });
  ev.push({ at: 3.2, kind: 'yawn', gain: 0.45 });
  ev.push({ at: 5.2, kind: 'af', dur: 0.7, gain: 0.35 });
  ev.push({ at: 5.9, kind: 'beep', gain: 0.4 });
  ev.push({ at: 8.7, kind: 'twinkle', gain: 0.3 });
  ev.push({ at: SHUTTER, kind: 'shutter', gain: 0.9 });
  ev.push({ at: SHUTTER + 0.03, kind: 'flash', gain: 0.45 });
  ev.push({ at: SHUTTER + 0.1, kind: 'pop', note: 7, gain: 0.35 });
  ev.push({ at: FREEZE_END, kind: 'swish', gain: 0.4 });
  for (const at of [12.25, 12.55, 12.85]) ev.push({ at, kind: 'sniff', gain: 0.5 });
  ev.push({ at: 13.15, kind: 'riser', dur: 0.18, gain: 0.4 });
  return ev;
}

export const cold: SceneModule = {
  gl: () => new ColdScene(),
  Overlay: ColdOverlay,
  canvasStyle: coldCanvasStyle,
  sfx: coldSfx,
};
