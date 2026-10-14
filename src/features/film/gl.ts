/**
 * WebGL ของ /film — renderer เดียวต่อหน้า (กติกา WebGL ≤ 2 context) ใช้ three.js
 * ข้อความไทยไม่ render ใน WebGL (เป็น DOM ซ้อนด้านบน) · ความสุ่มทั้งหมด seeded
 */
import * as THREE from 'three';
import type { Shot } from './cuts';

export const W = 1920;
export const H = 1080;

export interface GLKit {
  THREE: typeof THREE;
  renderer: THREE.WebGLRenderer;
  record: boolean;
  tex(url: string): Promise<THREE.Texture>;
  canvasTex(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void | Promise<void>): Promise<THREE.CanvasTexture>;
  image(url: string): Promise<HTMLImageElement>;
  /** ของที่ฉากต่าง ๆ ใช้ร่วมกัน เช่น ภาพแรกบนถนนจากบท 0 สำหรับรูปบนตู้เย็นบท 12 */
  shared: Map<string, unknown>;
}

export interface GLScene {
  init(kit: GLKit): Promise<void>;
  /** โหลดสิ่งที่ต้องใช้ในเฟรมนี้ให้เสร็จก่อน render (เช่นภาพ) */
  prepare?(t: number, shot?: Shot): Promise<void>;
  /** วาดเฟรมที่เวลา t (วินาทีภายในฉาก) — shot บอกความยาวและ variant ของช็อตที่ใช้ฉากนี้ */
  render(t: number, kit: GLKit, shot?: Shot): void;
  dispose?(): void;
}

const imageCache = new Map<string, Promise<HTMLImageElement>>();
const texCache = new Map<string, Promise<THREE.Texture>>();

export function loadImage(url: string): Promise<HTMLImageElement> {
  let p = imageCache.get(url);
  if (!p) {
    p = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => img.decode().then(() => resolve(img), () => resolve(img));
      img.onerror = () => reject(new Error(`load ${url}`));
      img.src = url;
    });
    imageCache.set(url, p);
  }
  return p;
}

export function createKit(canvas: HTMLCanvasElement, record: boolean): GLKit | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: record, powerPreference: 'high-performance' });
  } catch {
    return null;
  }
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  const kit: GLKit = {
    THREE,
    renderer,
    record,
    shared: new Map(),
    image: loadImage,
    tex(url) {
      let p = texCache.get(url);
      if (!p) {
        p = loadImage(url).then((img) => {
          const t = new THREE.Texture(img);
          t.colorSpace = THREE.SRGBColorSpace;
          t.anisotropy = 4;
          t.needsUpdate = true;
          return t;
        });
        texCache.set(url, p);
      }
      return p;
    },
    async canvasTex(w, h, draw) {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d')!;
      await draw(ctx);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      return t;
    },
  };
  return kit;
}

/** ตัดช่องจาก atlas (columns × rows หรือ crop เป็นพิกเซล) ให้ texture ใหม่ที่แชร์ภาพเดิม */
export function atlasTile(src: THREE.Texture, atlas: { columns: number; rows: number; index: number; crop?: { x: number; y: number; width: number; height: number; sheetWidth: number; sheetHeight: number } }): { tex: THREE.Texture; aspect: number } {
  const t = src.clone();
  t.needsUpdate = true;
  if (atlas.crop) {
    const c = atlas.crop;
    t.repeat.set(c.width / c.sheetWidth, c.height / c.sheetHeight);
    t.offset.set(c.x / c.sheetWidth, 1 - (c.y + c.height) / c.sheetHeight);
    return { tex: t, aspect: c.width / c.height };
  }
  const col = atlas.index % atlas.columns;
  const row = Math.floor(atlas.index / atlas.columns);
  t.repeat.set(1 / atlas.columns, 1 / atlas.rows);
  t.offset.set(col / atlas.columns, 1 - (row + 1) / atlas.rows);
  const img = src.image as HTMLImageElement;
  return { tex: t, aspect: (img.width / atlas.columns) / (img.height / atlas.rows) };
}

/** วาดช่องของ atlas ลง canvas 2D (ใช้ทำภาพเบลอ/กรอบ) */
export function drawAtlas(ctx: CanvasRenderingContext2D, img: HTMLImageElement, atlas: { columns: number; rows: number; index: number; crop?: { x: number; y: number; width: number; height: number; sheetWidth: number; sheetHeight: number } }, dx: number, dy: number, dw: number, dh: number, cover = true) {
  let sx: number;
  let sy: number;
  let sw: number;
  let sh: number;
  if (atlas.crop) {
    const k = img.width / atlas.crop.sheetWidth;
    sx = atlas.crop.x * k;
    sy = atlas.crop.y * k;
    sw = atlas.crop.width * k;
    sh = atlas.crop.height * k;
  } else {
    sw = img.width / atlas.columns;
    sh = img.height / atlas.rows;
    sx = (atlas.index % atlas.columns) * sw;
    sy = Math.floor(atlas.index / atlas.columns) * sh;
  }
  if (cover) {
    const r = Math.max(dw / sw, dh / sh);
    const cw = dw / r;
    const ch = dh / r;
    sx += (sw - cw) / 2;
    sy += (sh - ch) / 2;
    sw = cw;
    sh = ch;
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

/** plane ที่มีพิกัดเป็นพิกเซลบนจอ 1920×1080 (กล้อง orthographic) */
export function orthoCamera(): THREE.OrthographicCamera {
  const cam = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, -2000, 2000);
  cam.position.z = 1000;
  return cam;
}

export function plane(tex: THREE.Texture | null, w: number, h: number, opts: { transparent?: boolean; color?: THREE.ColorRepresentation; blending?: THREE.Blending; depthWrite?: boolean } = {}): THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> {
  const mat = new THREE.MeshBasicMaterial({
    map: tex ?? undefined,
    color: opts.color ?? 0xffffff,
    transparent: opts.transparent ?? true,
    blending: opts.blending ?? THREE.NormalBlending,
    depthWrite: opts.depthWrite ?? false,
    toneMapped: false,
  });
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
}

/** ภาพแบบ soft radial (ใช้ทำแสง/โบเก้/ฝุ่น) */
export function radialTexture(kit: GLKit, size = 128, inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)', stop = 0.0): Promise<THREE.CanvasTexture> {
  return kit.canvasTex(size, size, (ctx) => {
    const g = ctx.createRadialGradient(size / 2, size / 2, size * stop * 0.5, size / 2, size / 2, size / 2);
    g.addColorStop(0, inner);
    g.addColorStop(1, outer);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  });
}
