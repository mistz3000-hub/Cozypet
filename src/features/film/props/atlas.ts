/**
 * atlas ภาพการ์ดน้อง ๆ (มุมมน ขอบขาว) จากภาพสร้างด้วย AI ของโปรเจกต์ — ใช้กับฝูงการ์ดหลายพันใบใน draw call เดียว
 */
import * as THREE from 'three';
import type { GLKit } from '../gl';

export interface CardAtlas { tex: THREE.CanvasTexture; grid: [number, number]; count: number }

const SOURCES: { url: string; cols: number; rows: number }[] = [
  { url: '/images/cats/cats-01.png', cols: 4, rows: 4 },
  { url: '/images/cats/cats-02.png', cols: 4, rows: 4 },
  { url: '/images/pets/pets-01.png', cols: 4, rows: 4 },
];

let cache: Promise<CardAtlas> | null = null;

/** การ์ด 48 ใบ ขนาดช่อง 192×240 (สัดส่วน 4:5) ในตาราง 8×6 */
export function cardAtlas(kit: GLKit): Promise<CardAtlas> {
  if (cache) return cache;
  cache = (async () => {
    const imgs = await Promise.all(SOURCES.map((s) => kit.image(s.url)));
    const cols = 8;
    const rows = 6;
    const cw = 192;
    const ch = 240;
    const tex = await kit.canvasTex(cols * cw, rows * ch, (c) => {
      let i = 0;
      SOURCES.forEach((s, si) => {
        const img = imgs[si];
        const sw = img.width / s.cols;
        const sh = img.height / s.rows;
        for (let k = 0; k < s.cols * s.rows; k++) {
          const x = (i % cols) * cw;
          const y = Math.floor(i / cols) * ch;
          const pad = 9;
          c.save();
          c.beginPath();
          c.roundRect(x + 3, y + 3, cw - 6, ch - 6, 18);
          c.fillStyle = '#fffaf2';
          c.fill();
          c.beginPath();
          c.roundRect(x + 3 + pad, y + 3 + pad, cw - 6 - pad * 2, ch - 6 - pad * 2 - 26, 12);
          c.clip();
          const sx = (k % s.cols) * sw;
          const sy = Math.floor(k / s.cols) * sh;
          const dw = cw - 6 - pad * 2;
          const dh = ch - 6 - pad * 2 - 26;
          const scale = Math.max(dw / sw, dh / sh);
          const cwid = dw / scale;
          const chei = dh / scale;
          c.drawImage(img, sx + (sw - cwid) / 2, sy + (sh - chei) / 2, cwid, chei, x + 3 + pad, y + 3 + pad, dw, dh);
          c.restore();
          // แถบล่างของการ์ด: จุดทอง 3 จุด (แทนข้อความ — ไม่มีตัวอักษรใน WebGL)
          c.fillStyle = '#f4b400';
          c.beginPath();
          c.arc(x + 3 + pad + 10, y + ch - 3 - pad - 12, 5, 0, Math.PI * 2);
          c.fill();
          c.fillStyle = '#e8dcc7';
          c.beginPath();
          c.roundRect(x + 3 + pad + 22, y + ch - 3 - pad - 16, 70, 8, 4);
          c.fill();
          i++;
        }
      });
    });
    tex.anisotropy = 8;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    return { tex, grid: [cols, rows] as [number, number], count: 48 };
  })();
  return cache;
}
