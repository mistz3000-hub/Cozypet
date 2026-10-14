/**
 * เครื่องมือเวลาของ /film — ทุกค่าเป็นฟังก์ชันของเวลา t (วินาที) จึง seek ได้แบบ deterministic
 * (STORYBOARD.md หัวข้อ 10, DEMO_VIDEO.md หัวข้อ 9) ห้ามใช้ Math.random/Date.now ในฉาก
 */
import { gsap } from 'gsap';
import { EASE } from '@/lib/motion-tokens';
import { fnv1a32, mulberry32 } from '@/lib/seeded-random';

export const FPS = 30;
export const BPM = 90;
export const BEAT = 60 / BPM;
export const BAR = BEAT * 4;
/** บท 0 ยาว 5 ห้อง (ยังไม่มีเพลง) */
export const COLD_OPEN = BAR * 5;

export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** ความคืบหน้า 0..1 ของ t ในช่วง [a, b] */
export const prog = (t: number, a: number, b: number) => (b <= a ? (t >= b ? 1 : 0) : clamp((t - a) / (b - a)));
export const smooth = (k: number) => k * k * (3 - 2 * k);

/** cubic-bezier แบบเดียวกับ CSS (แก้ x ด้วย Newton แล้วตกไป bisection) */
export function bezier(p1x: number, p1y: number, p2x: number, p2y: number): (x: number) => number {
  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;
  const sx = (u: number) => ((ax * u + bx) * u + cx) * u;
  const sy = (u: number) => ((ay * u + by) * u + cy) * u;
  const dx = (u: number) => (3 * ax * u + 2 * bx) * u + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let u = x;
    for (let i = 0; i < 8; i++) {
      const err = sx(u) - x;
      if (Math.abs(err) < 1e-6) return sy(u);
      const d = dx(u);
      if (Math.abs(d) < 1e-6) break;
      u -= err / d;
    }
    let lo = 0;
    let hi = 1;
    u = x;
    for (let i = 0; i < 30; i++) {
      const v = sx(u);
      if (Math.abs(v - x) < 1e-6) break;
      if (v < x) lo = u;
      else hi = u;
      u = (lo + hi) / 2;
    }
    return sy(u);
  };
}

/** easing จาก motion tokens (ตัวเดียวกับ UI) */
export const ease = {
  out: bezier(...EASE.out),
  inOut: bezier(...EASE.inOut),
  in: bezier(...EASE.in),
  linear: (x: number) => x,
  /** เด้งเล็กน้อยเกิน 1 แล้วกลับ (ใช้กับตัวอักษร/อุ้งเท้า) */
  backOut: (x: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2;
  },
  /** spring แบบปิดรูป (damped) — ใช้แทน spring ของ Motion ในโหมดอัดที่ต้อง seek ได้ */
  spring: (x: number, damping = 7, freq = 2.2) => (x >= 1 ? 1 : 1 - Math.exp(-damping * x) * Math.cos(freq * Math.PI * 2 * x)),
  /** เส้นโค้งจาก GSAP (ฟังก์ชันบริสุทธิ์ ใช้ seek ได้) — ใช้กับ kinetic typography และตัวเลขวิ่ง */
  expoOut: gsapEase('expo.out'),
  expoInOut: gsapEase('expo.inOut'),
  circOut: gsapEase('circ.out'),
  power4Out: gsapEase('power4.out'),
  elastic: gsapEase('elastic.out(1, 0.45)'),
  backBig: gsapEase('back.out(2.4)'),
};

function gsapEase(name: string): (x: number) => number {
  const f = gsap.parseEase(name) as ((x: number) => number) | undefined;
  return (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : f ? f(x) : x);
}

/** ค่าในช่วง [a,b] แบบ eased */
export function tween(t: number, a: number, b: number, from: number, to: number, fn: (x: number) => number = ease.inOut): number {
  return lerp(from, to, fn(prog(t, a, b)));
}

/** keyframes [[t, v], ...] ระหว่าง key ใช้ easing ที่กำหนด */
export function keys(t: number, frames: readonly (readonly [number, number])[], fn: (x: number) => number = ease.inOut): number {
  if (t <= frames[0][0]) return frames[0][1];
  for (let i = 1; i < frames.length; i++) {
    const [t1, v1] = frames[i];
    if (t <= t1) {
      const [t0, v0] = frames[i - 1];
      return lerp(v0, v1, fn(prog(t, t0, t1)));
    }
  }
  return frames[frames.length - 1][1];
}

/** value noise 1D แบบ seeded (สำหรับกล้องสั่น) */
export function noise1(seedKey: string): (x: number) => number {
  const rnd = mulberry32(fnv1a32(seedKey));
  const table = Array.from({ length: 256 }, () => rnd() * 2 - 1);
  return (x: number) => {
    const i = Math.floor(x);
    const f = x - i;
    const a = table[((i % 256) + 256) % 256];
    const b = table[(((i + 1) % 256) + 256) % 256];
    return lerp(a, b, smooth(f));
  };
}

/** value noise 3 octave */
export function fbm(seedKey: string): (x: number) => number {
  const n = [noise1(`${seedKey}:1`), noise1(`${seedKey}:2`), noise1(`${seedKey}:3`)];
  return (x: number) => n[0](x) * 0.57 + n[1](x * 2.1) * 0.29 + n[2](x * 4.3) * 0.14;
}

/** เวลาเป็นเฟรม และกลับ */
export const frameOf = (t: number) => Math.round(t * FPS);
export const timeOf = (frame: number) => frame / FPS;

/** รูปแบบเวลา SRT */
export function srtTime(t: number): string {
  const ms = Math.max(0, Math.round(t * 1000));
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  const r = ms % 1000;
  const p = (n: number, w = 2) => String(n).padStart(w, '0');
  return `${p(h)}:${p(m)}:${p(s)},${p(r, 3)}`;
}
