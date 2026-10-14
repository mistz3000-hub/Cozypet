/**
 * ช็อตแอปจริงในฉาก 3 มิติ: โทรศัพท์/หน้าต่างเบราว์เซอร์ที่ลอยและหมุนได้ จอเป็นภาพอัดจริงทีละเฟรม
 * กล้องซูมเข้าจุดสำคัญ, วงแตะ, เคอร์เซอร์อุ้งเท้า และการ์ด “เบื้องหลัง” ที่ลอยออกจากจอ (DEMO_VIDEO.md หัวข้อ 5, D33)
 * ไม่มีข้อความไทยใน WebGL — ข้อความในจอคือภาพหน้าจอแอปจริง (raster) ส่วนคำบรรยายเป็น DOM
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildSegments, frameAt, frameUrl, shotTime, srcTime, type Box, type CaptureMeta, type Segment } from './capture';
import type { FilmContext } from './context';
import type { Shot } from './cuts';
import type { GLKit } from './gl';
import { explainSide, type ExplainLayer } from './explain';
import { clamp, ease, fbm, lerp, prog } from './timeline';
import { rngFromKey } from '@/lib/seeded-random';

const FOV = 30;
const CAM_Z = 10;
export const PX = 1080 / (2 * CAM_Z * Math.tan((FOV / 2) * (Math.PI / 180)));
const toU = (px: number) => px / PX;
const SCREEN_H = 888;
const SCREEN_W = Math.round((SCREEN_H * 390) / 844);
/** ตำแหน่งกลางโทรศัพท์บนจอ (px) — คอลัมน์คำบรรยายอยู่ด้านขวา */
export const PHONE_PX = { x: 470, y: 540 };
const WIN_W = 1500;
/** โทนภาพของช็อตแอปจริง: ฟุ้งเฉพาะแสงทอง ไม่ให้ตัวหนังสือบนจอเบลอ */
export const DEVICE_POST = { bloom: 0.7, threshold: 1.05, radius: 0.6, vignette: 0.32, grain: 0.03, contrast: 1.03, saturation: 1.05, tint: 0.3 };
const BAR_H = 46;

interface Pose { x: number; y: number; z: number; yaw: number; pitch: number; roll: number; s: number }

function roundedRect(w: number, h: number, r: number): THREE.ShapeGeometry {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ShapeGeometry(s, 12);
  const uv = g.attributes.uv as THREE.BufferAttribute;
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) - x) / w, (pos.getY(i) - y) / h);
  uv.needsUpdate = true;
  return g;
}

function pawPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  ctx.beginPath();
  ctx.ellipse(cx, cy + s * 0.14, s * 0.24, s * 0.2, 0, 0, Math.PI * 2);
  for (const [dx, dy, rx, ry] of [[-0.28, -0.1, 0.09, 0.11], [-0.12, -0.26, 0.09, 0.12], [0.12, -0.26, 0.09, 0.12], [0.28, -0.1, 0.09, 0.11]] as const) {
    ctx.moveTo(cx + dx * s + rx * s, cy + dy * s);
    ctx.ellipse(cx + dx * s, cy + dy * s, rx * s, ry * s, 0, 0, Math.PI * 2);
  }
}

export class DeviceScene {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(FOV, 16 / 9, 0.1, 100);
  private phone = new THREE.Group();
  private browser = new THREE.Group();
  private screen!: THREE.Mesh<THREE.ShapeGeometry, THREE.MeshBasicMaterial>;
  private overrideScreen!: THREE.Mesh<THREE.ShapeGeometry, THREE.MeshBasicMaterial>;
  private winScreen!: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  private barTex!: THREE.CanvasTexture;
  private barCanvas = document.createElement('canvas');
  private mCanvas = document.createElement('canvas');
  private dCanvas = document.createElement('canvas');
  private mTex!: THREE.CanvasTexture;
  private dTex!: THREE.CanvasTexture;
  private img = new Image();
  private imgSrc = '';
  private card!: THREE.Group;
  private cardFace!: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  private cardTex!: THREE.CanvasTexture;
  private cardCanvas = document.createElement('canvas');
  private beam!: THREE.Mesh<THREE.TubeGeometry, THREE.MeshBasicMaterial>;
  private cursor!: THREE.Sprite;
  private bokeh!: THREE.InstancedMesh;
  private bokehData: { x: number; y: number; z: number; s: number; sp: number; ph: number }[] = [];
  private nodes!: THREE.Points;
  private links!: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  private shadow!: THREE.Mesh;
  private sway = fbm('cozypet:v1:film:device');
  private segCache = new Map<string, Segment[]>();
  private lastUrl = '';
  /** ชั้น prop อธิบายขั้นตอน (เรนเดอร์ทับหลังฉากโทรศัพท์) */
  explain: ExplainLayer | null = null;

  async init(kit: GLKit) {
    const { scene, camera } = this;
    camera.position.set(0, 0, CAM_Z);
    scene.background = new THREE.Color('#1c140e');
    // พื้นหลังโทนเข้มอุ่น (เอสเปรสโซ) ให้จอแอปสีครีมเด่น + แสงทองฟุ้งด้านหลังโทรศัพท์
    const bgTex = await kit.canvasTex(512, 288, (c) => {
      const g = c.createLinearGradient(0, 0, 512, 288);
      g.addColorStop(0, '#2a1c12');
      g.addColorStop(0.55, '#1b130d');
      g.addColorStop(1, '#130d09');
      c.fillStyle = g;
      c.fillRect(0, 0, 512, 288);
      const r = c.createRadialGradient(125, 150, 8, 125, 150, 200);
      r.addColorStop(0, 'rgba(244,180,0,0.30)');
      r.addColorStop(0.5, 'rgba(200,120,40,0.12)');
      r.addColorStop(1, 'rgba(200,120,40,0)');
      c.fillStyle = r;
      c.fillRect(0, 0, 512, 288);
      const r2 = c.createRadialGradient(420, 40, 4, 420, 40, 220);
      r2.addColorStop(0, 'rgba(255,214,150,0.16)');
      r2.addColorStop(1, 'rgba(255,214,150,0)');
      c.fillStyle = r2;
      c.fillRect(0, 0, 512, 288);
    });
    const pm = new THREE.PMREMGenerator(kit.renderer);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.8;
    pm.dispose();
    const bg = new THREE.Mesh(new THREE.PlaneGeometry(36, 20.25), new THREE.MeshBasicMaterial({ map: bgTex, depthWrite: false, toneMapped: false }));
    bg.position.z = -8;
    scene.add(bg);

    // โบเก้ลอย (instanced)
    const disc = await kit.canvasTex(128, 128, (c) => {
      const g = c.createRadialGradient(64, 64, 4, 64, 64, 62);
      g.addColorStop(0, 'rgba(255,255,255,0.95)');
      g.addColorStop(0.55, 'rgba(255,255,255,0.45)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g;
      c.fillRect(0, 0, 128, 128);
    });
    const rng = rngFromKey('cozypet:v1:film:bokeh');
    const N = 46;
    this.bokeh = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: disc, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0.22 }), N);
    const palette = [new THREE.Color('#f4b400'), new THREE.Color('#ffd27a'), new THREE.Color('#ffb59a'), new THREE.Color('#ffe9b8')];
    for (let i = 0; i < N; i++) {
      this.bokehData.push({ x: (rng() - 0.5) * 22, y: (rng() - 0.5) * 12, z: -7 + rng() * 4, s: 0.12 + rng() * 0.55, sp: 0.05 + rng() * 0.12, ph: rng() * 10 });
      this.bokeh.setColorAt(i, palette[i % palette.length]);
    }
    scene.add(this.bokeh);

    // เครือข่าย “เชื่อมคนเข้าด้วยกัน” จาง ๆ ด้านหลัง
    const nodeCount = 28;
    const pts: number[] = [];
    for (let i = 0; i < nodeCount; i++) pts.push((rng() - 0.5) * 20, (rng() - 0.5) * 10, -6 + rng() * 1.5);
    const ng = new THREE.BufferGeometry();
    ng.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    this.nodes = new THREE.Points(ng, new THREE.PointsMaterial({ size: 0.14, map: disc, transparent: true, depthWrite: false, color: '#e8a400', opacity: 0.7, toneMapped: false }));
    scene.add(this.nodes);
    const lp: number[] = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dx = pts[i * 3] - pts[j * 3];
        const dy = pts[i * 3 + 1] - pts[j * 3 + 1];
        if (dx * dx + dy * dy < 9) lp.push(pts[i * 3], pts[i * 3 + 1], pts[i * 3 + 2], pts[j * 3], pts[j * 3 + 1], pts[j * 3 + 2]);
      }
    }
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3));
    this.links = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: '#f4b400', transparent: true, opacity: 0.22, toneMapped: false, blending: THREE.AdditiveBlending }));
    scene.add(this.links);

    // แสง
    scene.add(new THREE.HemisphereLight('#fff6e0', '#c9a37a', 1.1));
    const key = new THREE.DirectionalLight('#ffffff', 1.6);
    key.position.set(-4, 5, 8);
    scene.add(key);
    const rim = new THREE.DirectionalLight('#ffcf6b', 1.4);
    rim.position.set(5, 2, -4);
    scene.add(rim);

    // เงานุ่มใต้วัตถุ
    const shadowTex = await kit.canvasTex(256, 128, (c) => {
      const g = c.createRadialGradient(128, 64, 4, 128, 64, 120);
      g.addColorStop(0, 'rgba(244,180,0,0.32)');
      g.addColorStop(1, 'rgba(244,180,0,0)');
      c.fillStyle = g;
      c.fillRect(0, 0, 256, 128);
    });
    this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.4), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }));
    this.shadow.rotation.x = -Math.PI / 2;
    scene.add(this.shadow);

    // โทรศัพท์ (ออกแบบเอง ไม่อ้างอิงยี่ห้อ)
    const sw = toU(SCREEN_W);
    const sh = toU(SCREEN_H);
    const bez = 0.085;
    const depth = 0.24;
    const body = new THREE.Mesh(new RoundedBoxGeometry(sw + bez * 2, sh + bez * 2, depth, 6, 0.27), new THREE.MeshPhysicalMaterial({ color: '#cfa96b', metalness: 0.85, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.2 }));
    this.phone.add(body);
    const btn = new THREE.Mesh(new RoundedBoxGeometry(0.035, 0.42, 0.08, 2, 0.015), new THREE.MeshStandardMaterial({ color: '#d9a400', metalness: 0.6, roughness: 0.3 }));
    btn.position.set((sw + bez * 2) / 2 + 0.01, sh * 0.22, 0);
    this.phone.add(btn);
    this.mCanvas.width = 780;
    this.mCanvas.height = 1688;
    this.mTex = new THREE.CanvasTexture(this.mCanvas);
    this.mTex.colorSpace = THREE.SRGBColorSpace;
    this.mTex.anisotropy = 8;
    this.screen = new THREE.Mesh(roundedRect(sw, sh, 0.21), new THREE.MeshBasicMaterial({ map: this.mTex, toneMapped: false }));
    this.screen.position.z = depth / 2 + 0.003;
    this.phone.add(this.screen);
    this.overrideScreen = new THREE.Mesh(roundedRect(sw, sh, 0.21), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, toneMapped: false }));
    this.overrideScreen.position.z = depth / 2 + 0.006;
    this.phone.add(this.overrideScreen);
    // แสงสะท้อนบนกระจก
    const glare = await kit.canvasTex(256, 512, (c) => {
      const g = c.createLinearGradient(0, 0, 256, 512);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(0.42, 'rgba(255,255,255,0)');
      g.addColorStop(0.5, 'rgba(255,255,255,0.16)');
      g.addColorStop(0.6, 'rgba(255,255,255,0)');
      c.fillStyle = g;
      c.fillRect(0, 0, 256, 512);
    });
    const glass = new THREE.Mesh(roundedRect(sw, sh, 0.21), new THREE.MeshBasicMaterial({ map: glare, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    glass.position.z = depth / 2 + 0.009;
    glass.name = 'glass';
    this.phone.add(glass);
    scene.add(this.phone);

    // หน้าต่างเบราว์เซอร์ (desktop)
    this.dCanvas.width = 1800;
    this.dCanvas.height = 1125;
    this.dTex = new THREE.CanvasTexture(this.dCanvas);
    this.dTex.colorSpace = THREE.SRGBColorSpace;
    this.dTex.anisotropy = 8;
    const ww = toU(WIN_W);
    const wh = toU((WIN_W * 900) / 1440);
    const bh = toU(BAR_H);
    const frame = new THREE.Mesh(new RoundedBoxGeometry(ww + 0.05, wh + bh + 0.05, 0.08, 4, 0.08), new THREE.MeshPhysicalMaterial({ color: '#cfa96b', metalness: 0.8, roughness: 0.3, clearcoat: 1 }));
    frame.position.y = bh / 2;
    this.browser.add(frame);
    this.winScreen = new THREE.Mesh(new THREE.PlaneGeometry(ww, wh), new THREE.MeshBasicMaterial({ map: this.dTex, toneMapped: false }));
    this.winScreen.position.z = 0.045;
    this.browser.add(this.winScreen);
    this.barCanvas.width = 1500;
    this.barCanvas.height = 46;
    this.barTex = new THREE.CanvasTexture(this.barCanvas);
    this.barTex.colorSpace = THREE.SRGBColorSpace;
    const bar = new THREE.Mesh(new THREE.PlaneGeometry(ww, bh), new THREE.MeshBasicMaterial({ map: this.barTex, toneMapped: false }));
    bar.position.set(0, wh / 2 + bh / 2, 0.045);
    this.browser.add(bar);
    scene.add(this.browser);

    // การ์ด “เบื้องหลัง” ที่ลอยออกจากจอ + ลำแสงเชื่อม
    this.cardCanvas.width = 1024;
    this.cardCanvas.height = 1024;
    this.cardTex = new THREE.CanvasTexture(this.cardCanvas);
    this.cardTex.colorSpace = THREE.SRGBColorSpace;
    this.cardTex.anisotropy = 8;
    this.card = new THREE.Group();
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: disc, color: '#f4b400', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0.9 }));
    glow.name = 'glow';
    glow.position.z = -0.02;
    this.card.add(glow);
    this.cardFace = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.cardTex, transparent: true, toneMapped: false }));
    this.card.add(this.cardFace);
    this.card.visible = false;
    scene.add(this.card);
    this.beam = new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(), new THREE.Vector3(1, 0, 0)), 8, 0.012, 6), new THREE.MeshBasicMaterial({ color: '#f4b400', transparent: true, toneMapped: false }));
    this.beam.visible = false;
    scene.add(this.beam);

    // เคอร์เซอร์อุ้งเท้า (ตัวเดียวกับทัวร์ในแอป: ทอง ขอบเข้ม)
    const pawTex = await kit.canvasTex(128, 128, (c) => {
      c.shadowColor = 'rgba(43,33,24,0.35)';
      c.shadowBlur = 10;
      c.shadowOffsetY = 4;
      pawPath(c, 64, 60, 96);
      c.fillStyle = '#f4b400';
      c.fill();
      c.shadowColor = 'transparent';
      c.lineWidth = 5;
      c.strokeStyle = '#2b2118';
      c.stroke();
    });
    this.cursor = new THREE.Sprite(new THREE.SpriteMaterial({ map: pawTex, transparent: true, depthTest: false, toneMapped: false }));
    this.cursor.scale.set(0.42, 0.42, 1);
    this.cursor.renderOrder = 10;
    scene.add(this.cursor);
  }

  private segs(shot: Shot, meta: CaptureMeta): Segment[] {
    const k = `${shot.id}:${meta.id}`;
    let s = this.segCache.get(k);
    if (!s) {
      s = shot.anchors ? buildSegments(meta, shot.anchors) : [];
      this.segCache.set(k, s);
    }
    return s;
  }

  /** โหลดเฟรมที่ต้องใช้ให้เสร็จก่อน render (เรียกใน seek) */
  async prepare(shot: Shot, lt: number, ctx: FilmContext): Promise<void> {
    const meta = ctx.captures[shot.capture ?? ''];
    if (!meta?.frames.length) return;
    const fi = frameAt(meta, srcTime(this.segs(shot, meta), lt));
    const url = frameUrl(meta.locale, meta.id, fi);
    if (url === this.imgSrc) return;
    this.imgSrc = url;
    await new Promise<void>((resolve) => {
      this.img.onload = () => resolve();
      this.img.onerror = () => resolve();
      this.img.src = url;
    });
    await this.img.decode().catch(() => undefined);
  }

  /** พิกัดจอ (logical px ของ viewport) → ตำแหน่งในโลก 3 มิติ */
  private screenPoint(meta: CaptureMeta, x: number, y: number, mobile: boolean): THREE.Vector3 {
    const target = mobile ? this.screen : this.winScreen;
    const w = mobile ? toU(SCREEN_W) : toU(WIN_W);
    const h = mobile ? toU(SCREEN_H) : toU((WIN_W * 900) / 1440);
    const v = new THREE.Vector3((x / meta.viewport.w - 0.5) * w, (0.5 - y / meta.viewport.h) * h, 0.02);
    target.updateWorldMatrix(true, false);
    return v.applyMatrix4(target.matrixWorld);
  }

  render(shot: Shot, lt: number, ctx: FilmContext, kit: GLKit, prevKind: 'capture-mobile' | 'capture-desktop' | 'scene' | 'none', override?: { tex: THREE.Texture; mix: number; camFill: number }) {
    const meta = ctx.captures[shot.capture ?? ''];
    const mobile = (meta?.device ?? 'mobile') === 'mobile';
    const T = shot.start + lt;
    this.phone.visible = mobile;
    this.browser.visible = !mobile;

    // ── ภาพบนจอ (เฟรมจริง + วงแตะ + ไฮไลต์ + เบลอข้อมูลส่วนตัว)
    const canvas = mobile ? this.mCanvas : this.dCanvas;
    const tex = mobile ? this.mTex : this.dTex;
    const c = canvas.getContext('2d')!;
    const segs = meta ? this.segs(shot, meta) : [];
    const src = srcTime(segs, lt);
    if (meta && this.img.complete && this.img.naturalWidth) {
      if (canvas.width !== meta.frameSize.w || canvas.height !== meta.frameSize.h) {
        canvas.width = meta.frameSize.w;
        canvas.height = meta.frameSize.h;
      }
      const k = canvas.width / meta.viewport.w;
      c.filter = 'none';
      c.drawImage(this.img, 0, 0, canvas.width, canvas.height);
      for (const cue of meta.cues) {
        if (cue.type === 'blur' && cue.box && src >= cue.t && src <= (cue.to ?? cue.t)) {
          const b = cue.box;
          c.save();
          c.beginPath();
          c.rect(b.x * k - 6, b.y * k - 6, b.w * k + 12, b.h * k + 12);
          c.clip();
          c.filter = 'blur(14px)';
          c.drawImage(this.img, 0, 0, canvas.width, canvas.height);
          c.restore();
        }
      }
      c.filter = 'none';
      for (const cue of meta.cues) {
        if (cue.type === 'point' && cue.box) {
          const a = shotTime(segs, cue.t);
          const bEnd = shotTime(segs, cue.to ?? cue.t + 1) ?? (a ?? 0) + 1;
          if (a === null || lt < a || lt > bEnd) continue;
          const f = Math.min(clamp((lt - a) / 0.25), clamp((bEnd - lt) / 0.25));
          const b = cue.box;
          c.save();
          c.globalAlpha = f;
          c.shadowColor = 'rgba(244,180,0,0.8)';
          c.shadowBlur = 26;
          c.lineWidth = 6;
          c.strokeStyle = '#f4b400';
          const r = 26;
          c.beginPath();
          c.roundRect(b.x * k - 10, b.y * k - 10, b.w * k + 20, b.h * k + 20, r);
          c.stroke();
          c.restore();
        }
        if (cue.type === 'tap' && cue.box) {
          const a = shotTime(segs, cue.t);
          if (a === null || lt < a - 0.02 || lt > a + 0.5) continue;
          const p = clamp((lt - a) / 0.45);
          const x = (cue.x ?? cue.box.x + cue.box.w / 2) * k;
          const y = (cue.y ?? cue.box.y + cue.box.h / 2) * k;
          c.save();
          c.globalAlpha = 1 - p * p;
          c.fillStyle = 'rgba(244,180,0,0.22)';
          c.strokeStyle = '#f4b400';
          c.lineWidth = 8;
          c.beginPath();
          c.arc(x, y, (20 + 26 * ease.out(p)) * k, 0, Math.PI * 2);
          c.fill();
          c.stroke();
          c.restore();
        }
      }
      tex.needsUpdate = true;
      if (!mobile) this.drawBar(meta, src, ctx);
    } else if (!meta) {
      c.fillStyle = '#fff3d1';
      c.fillRect(0, 0, canvas.width, canvas.height);
      tex.needsUpdate = true;
    }

    // ── ท่าทางของวัตถุ (ลอยต่อเนื่องตามเวลารวมของหนัง จึงเนียนเมื่อตัดช็อต)
    const sw = this.sway;
    const enter = prevKind === (mobile ? 'capture-mobile' : 'capture-desktop') ? 1 : ease.backOut(prog(lt, 0, 0.75));
    const pose: Pose = mobile
      ? { x: toU(PHONE_PX.x - 960), y: 0, z: 0, yaw: 0.16 + 0.05 * sw(T * 0.23), pitch: -0.04 + 0.025 * sw(T * 0.19 + 7), roll: 0.012 * sw(T * 0.31 + 3), s: 1 }
      : { x: 0, y: toU(-22), z: -0.6, yaw: -0.07 + 0.04 * sw(T * 0.2), pitch: 0.05 + 0.02 * sw(T * 0.17 + 5), roll: 0, s: 1 };
    // ช็อต desktop ที่มี prop อธิบาย: หน้าต่างหลบไปซ้ายและหันเข้าหา prop
    const side = mobile ? 0 : explainSide(shot, lt);
    if (side > 0) {
      pose.x = lerp(pose.x, toU(-330), side);
      pose.y = lerp(pose.y, toU(10), side);
      pose.yaw = lerp(pose.yaw, 0.14, side);
      pose.s = lerp(1, 0.74, side);
    }
    const obj = mobile ? this.phone : this.browser;
    obj.position.set(pose.x, lerp(-6, pose.y + 0.04 * Math.sin(T * 0.9), enter) , pose.z);
    obj.rotation.set(pose.pitch + (1 - enter) * 0.5, pose.yaw + (1 - enter) * 0.9, pose.roll);
    obj.scale.setScalar(pose.s);
    const glass = this.phone.getObjectByName('glass') as THREE.Mesh | undefined;
    if (glass) (glass.material as THREE.MeshBasicMaterial).map!.offset.set(0.15 * Math.sin(T * 0.21), 0.2 * Math.sin(T * 0.13));
    this.shadow.position.set(obj.position.x, mobile ? -toU(SCREEN_H) / 2 - 0.35 : -toU(560), mobile ? 0.2 : 0);
    this.shadow.scale.set(mobile ? 1 : 2.4, 1, 1);
    (this.shadow.material as THREE.MeshBasicMaterial).opacity = enter;

    // ── กล้อง: ซูมเข้าจุดสำคัญ (zoom cue) + ดันเข้าช้า ๆ
    const camPos = new THREE.Vector3(0, 0, CAM_Z);
    const look = new THREE.Vector3(0, 0, 0);
    let zoomK = 1;
    let focus: THREE.Vector3 | null = null;
    if (meta) {
      for (const z of shot.zooms ?? []) {
        if (lt < z.from || lt > z.to) continue;
        const b = [...meta.cues].reverse().find((cc) => cc.label === z.cue && cc.box)?.box;
        if (!b) continue;
        const k2 = Math.min(ease.inOut(prog(lt, z.from, z.from + 0.7)), 1 - ease.inOut(prog(lt, z.to - 0.6, z.to)));
        zoomK = 1 + (z.scale - 1) * k2;
        focus = this.screenPoint(meta, b.x + b.w / 2, b.y + b.h / 2, mobile);
      }
    }
    if (focus) {
      const f = (zoomK - 1) / Math.max(0.001, zoomK);
      look.lerp(focus, f);
      camPos.set(look.x, look.y, focus.z + (CAM_Z - focus.z) / zoomK);
    }
    // ช่วงต่อจากฉากเล่าเรื่อง (mapIn/boxIn): เริ่มจากจอเต็มเฟรมแล้วถอยออก
    if (override) {
      const fill = override.camFill;
      const sc = this.screenPoint(meta ?? ({ viewport: { w: 390, h: 844 } } as CaptureMeta), (meta?.viewport.w ?? 390) / 2, (meta?.viewport.h ?? 844) / 2, true);
      const near = new THREE.Vector3(sc.x, sc.y, sc.z + toU(SCREEN_H) / (2 * Math.tan((FOV / 2) * (Math.PI / 180))) * 0.98);
      camPos.lerp(near, fill);
      look.lerp(sc, fill);
      const om = this.overrideScreen.material;
      om.map = override.tex;
      om.opacity = 1 - override.mix;
      om.needsUpdate = true;
      this.overrideScreen.visible = true;
    } else this.overrideScreen.visible = false;
    camPos.x += 0.03 * sw(T * 0.4 + 11);
    camPos.y += 0.02 * sw(T * 0.37 + 13);
    this.camera.position.copy(camPos);
    this.camera.lookAt(look);

    // ── การ์ดเบื้องหลังลอยออกจากจอ
    this.card.visible = false;
    this.beam.visible = false;
    if (meta) {
      for (const cd of shot.cards ?? []) {
        if (lt < cd.from || lt > cd.to) continue;
        const b = [...meta.cues].reverse().find((cc) => cc.label === cd.cue && cc.box)?.box;
        if (!b) continue;
        this.showCard(meta, b, lt, cd.from, cd.to, mobile);
      }
    }

    // ── เคอร์เซอร์อุ้งเท้า: เคลื่อนไปหาจุดแตะถัดไปแล้วกด
    this.cursor.visible = false;
    if (meta) {
      const taps = meta.cues.filter((cc) => cc.type === 'tap' && cc.box).map((cc) => ({ cc, at: shotTime(segs, cc.t) })).filter((x): x is { cc: typeof x.cc; at: number } => x.at !== null);
      const next = taps.find((x) => x.at >= lt - 0.35);
      const prev = [...taps].reverse().find((x) => x.at < lt - 0.35);
      if (next && next.at - lt < 1.1) {
        const to = this.screenPoint(meta, next.cc.x ?? next.cc.box!.x + next.cc.box!.w / 2, next.cc.y ?? next.cc.box!.y + next.cc.box!.h / 2, mobile);
        const from = prev && next.at - prev.at < 2.5 ? this.screenPoint(meta, prev.cc.x ?? prev.cc.box!.x, prev.cc.y ?? prev.cc.box!.y, mobile) : to.clone().add(new THREE.Vector3(0.9, -0.7, 0));
        const travelStart = Math.max(prev && next.at - prev.at < 2.5 ? prev.at : next.at - 0.6, next.at - 0.6);
        const m = ease.inOut(prog(lt, travelStart, next.at - 0.05));
        const pos = from.clone().lerp(to, m);
        pos.z += 0.25;
        pos.x += 0.1;
        pos.y -= 0.12;
        const press = lt >= next.at - 0.05 && lt <= next.at + 0.25 ? 1 - 0.18 * Math.sin(prog(lt, next.at - 0.05, next.at + 0.25) * Math.PI) : 1;
        const fade = Math.min(clamp((lt - (next.at - 1.1)) / 0.25), clamp((next.at + 0.35 - lt) / 0.2));
        this.cursor.position.copy(pos);
        this.cursor.scale.set(0.42 * press, 0.42 * press, 1);
        this.cursor.material.opacity = fade;
        this.cursor.visible = fade > 0.01;
      }
    }

    // ── พื้นหลังเคลื่อนช้า ๆ
    const dummy = new THREE.Object3D();
    this.bokehData.forEach((b, i) => {
      dummy.position.set(b.x + Math.sin(T * b.sp + b.ph) * 0.6, b.y + Math.cos(T * b.sp * 0.8 + b.ph) * 0.4, b.z);
      dummy.scale.setScalar(b.s * (1 + 0.15 * Math.sin(T * 0.7 + b.ph)));
      dummy.updateMatrix();
      this.bokeh.setMatrixAt(i, dummy.matrix);
    });
    this.bokeh.instanceMatrix.needsUpdate = true;
    this.links.material.opacity = 0.16 + 0.08 * Math.sin(T * 1.3);
    this.nodes.rotation.z = 0.02 * Math.sin(T * 0.1);
    this.links.rotation.z = this.nodes.rotation.z;

    kit.renderer.render(this.scene, this.camera);
    if (this.explain) this.explain.render(shot, lt, kit, !mobile);
  }

  private showCard(meta: CaptureMeta, b: Box, lt: number, from: number, to: number, mobile: boolean) {
    const canvas = mobile ? this.mCanvas : this.dCanvas;
    const k = canvas.width / meta.viewport.w;
    const pad = 12;
    const sx = Math.max(0, (b.x - pad) * k);
    const sy = Math.max(0, (b.y - pad) * k);
    const sWid = Math.min(canvas.width - sx, (b.w + pad * 2) * k);
    // ครอปไม่ให้สูงเกินกว้าง (ใช้ส่วนบนของกล่อง) การ์ดจึงไม่บังคำบรรยาย
    const sHei = Math.min(canvas.height - sy, (b.h + pad * 2) * k, sWid * 0.95);
    // วาดครอปลง canvas ของการ์ด (ขอบมน + กรอบทอง)
    const aspect = sWid / sHei;
    const cw = 1024;
    const ch = Math.round(cw / aspect);
    if (this.cardCanvas.height !== ch) this.cardCanvas.height = Math.min(2048, ch);
    const cc = this.cardCanvas.getContext('2d')!;
    cc.clearRect(0, 0, cw, this.cardCanvas.height);
    cc.save();
    cc.beginPath();
    cc.roundRect(8, 8, cw - 16, this.cardCanvas.height - 16, 36);
    cc.clip();
    cc.fillStyle = '#ffffff';
    cc.fillRect(0, 0, cw, this.cardCanvas.height);
    cc.drawImage(canvas, sx, sy, sWid, sHei, 8, 8, cw - 16, this.cardCanvas.height - 16);
    cc.restore();
    cc.lineWidth = 10;
    cc.strokeStyle = '#f4b400';
    cc.beginPath();
    cc.roundRect(8, 8, cw - 16, this.cardCanvas.height - 16, 36);
    cc.stroke();
    this.cardTex.needsUpdate = true;

    const pIn = ease.backOut(prog(lt, from, from + 0.55));
    const pOut = ease.in(prog(lt, to - 0.35, to));
    const p = pIn * (1 - pOut);
    const origin = this.screenPoint(meta, b.x + b.w / 2, b.y + b.h / 2, mobile);
    // ปลายทาง: ขวาล่างของโทรศัพท์ ยื่นเข้าหากล้อง
    const dest = mobile ? new THREE.Vector3(toU(1010 - 960), toU(540 - 790), 1.2) : new THREE.Vector3(toU(1180 - 960), toU(540 - 760), 1.6);
    const widthU = (mobile ? toU(430) : toU(560)) * Math.min(1, aspect / 0.95);
    const pos = origin.clone().lerp(dest, p);
    this.card.position.copy(pos);
    this.card.rotation.set(0, mobile ? -0.12 * p : 0.08 * p, 0.02 * Math.sin(lt * 2));
    const s = lerp(0.3, 1, p);
    this.cardFace.scale.set(widthU * s, (widthU / aspect) * s, 1);
    const glow = this.card.getObjectByName('glow') as THREE.Mesh;
    glow.scale.set(widthU * s * 1.5, (widthU / aspect) * s * 1.8, 1);
    (glow.material as THREE.MeshBasicMaterial).opacity = 0.55 * p;
    this.cardFace.material.opacity = clamp(p * 1.4);
    this.card.visible = p > 0.01;
    // ลำแสงจากจุดบนจอไปยังการ์ด
    this.beam.geometry.dispose();
    const mid = origin.clone().lerp(pos, 0.5).add(new THREE.Vector3(0, 0.3, 0.4));
    this.beam.geometry = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(origin, mid, pos), 24, 0.014, 6);
    this.beam.material.opacity = 0.85 * p;
    this.beam.visible = p > 0.05;
  }

  private drawBar(meta: CaptureMeta, src: number, ctx: FilmContext) {
    const c = this.barCanvas.getContext('2d')!;
    c.fillStyle = '#f4ede0';
    c.fillRect(0, 0, 1500, 46);
    ['#e2b9a6', '#ecd28c', '#b9d3a0'].forEach((col, i) => {
      c.fillStyle = col;
      c.beginPath();
      c.arc(26 + i * 22, 23, 7, 0, Math.PI * 2);
      c.fill();
    });
    const nav = [...meta.cues].reverse().find((cc) => cc.type === 'mark' && cc.label?.startsWith('nav:') && cc.t <= src);
    const site = (ctx.team?.siteUrl || 'cozypet-iota.vercel.app').replace(/^https?:\/\//, '').replace(/\/$/, '');
    const url = `${site}${nav?.label?.slice(4) ?? '/'}`;
    c.fillStyle = '#ffffff';
    c.beginPath();
    c.roundRect(430, 9, 640, 28, 14);
    c.fill();
    c.fillStyle = '#5e4f42';
    c.font = '500 15px system-ui, sans-serif';
    c.textBaseline = 'middle';
    c.fillText(url, 448, 24);
    this.barTex.needsUpdate = true;
  }
}
