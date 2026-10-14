/**
 * โลโก้ Cozypet (D34 รอบ v3): ตัว C เป็นหางแมวขดรอบหน้าแมว — โคนหางหนานุ่ม เรียวไปทางปลาย ปลายหางม้วนเข้า
 * ข้างในเป็นหน้าแมว (ตา 2 จุด จมูกชมพู) เหมือนแมวขดตัวเอาหางพันหน้า บนช่องสี่เหลี่ยมมนสีทอง
 * เก็บเป็นตัวเลขชุดเดียว ใช้วาดทั้ง SVG ในแอป (Wordmark, favicon) และโมเดล 3 มิติในวิดีโอเดโม
 * พิกัดอยู่ในกรอบ 64×64 (แกน y ชี้ลงแบบ SVG)
 */
export const LOGO = {
  view: 64,
  tile: { x: 2, y: 2, size: 60, radius: 18 },
  /**
   * หาง (เส้นกลางของตัว C): วนตามเข็มนาฬิกาบนจอจากโคน (ขวาล่าง) ผ่านล่าง ซ้าย บน
   * แล้วม้วนเข้าที่ปลาย (ขวาบน) · มุมเป็นองศาวัดจากแกน x ตามเข็มนาฬิกา
   */
  tail: { cx: 32.5, cy: 34.5, r: 15.4, from: 58, to: 290, curlTo: 338, curlR: 10.6, wBase: 8.2, wMid: 9.4, wTip: 2.6 },
  eyes: [[27.2, 35.4], [35.6, 35.4]] as const,
  eyeR: 2.4,
  /** จมูก: สามเหลี่ยมมน (จุดซ้าย, กว้าง, สูง) */
  nose: { x: 29.8, y: 39.3, w: 3.0, h: 1.8 },
} as const;

const f = (n: number) => Number(n.toFixed(2));
const smooth = (x: number) => x * x * (3 - 2 * x);

export interface TailSample {
  x: number;
  y: number;
  /** ความกว้างของหางที่จุดนี้ */
  w: number;
}

/** จุดบนเส้นกลางของหางพร้อมความกว้าง (u = 0 โคน → 1 ปลาย) */
export function logoTail(n = 72): TailSample[] {
  const t = LOGO.tail;
  const main = t.to - t.from;
  const curl = t.curlTo - t.to;
  const total = main + curl;
  const out: TailSample[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const deg = t.from + total * u;
    // ปลายหางม้วนเข้า: รัศมีลดลงนุ่ม ๆ ในช่วงสุดท้าย
    const c = deg > t.to ? smooth((deg - t.to) / curl) : 0;
    const r = t.r + (t.curlR - t.r) * c;
    const a = (deg * Math.PI) / 180;
    // ความหนา: โคนหนา ป่องกลาง (ขนฟู) แล้วเรียวไปปลาย
    const w = u < 0.28 ? t.wBase + (t.wMid - t.wBase) * smooth(u / 0.28) : t.wMid + (t.wTip - t.wMid) * Math.pow((u - 0.28) / 0.72, 1.6);
    out.push({ x: t.cx + r * Math.cos(a), y: t.cy + r * Math.sin(a), w });
  }
  return out;
}

/** เส้นขอบของหาง (สองฝั่ง) สำหรับวาดเป็นรูปทึบ */
export function logoTailOutline(n = 72): { left: [number, number][]; right: [number, number][]; samples: TailSample[] } {
  const s = logoTail(n);
  const left: [number, number][] = [];
  const right: [number, number][] = [];
  s.forEach((p, i) => {
    const a = s[Math.max(0, i - 1)];
    const b = s[Math.min(s.length - 1, i + 1)];
    let tx = b.x - a.x;
    let ty = b.y - a.y;
    const l = Math.hypot(tx, ty) || 1;
    tx /= l;
    ty /= l;
    left.push([p.x - ty * (p.w / 2), p.y + tx * (p.w / 2)]);
    right.push([p.x + ty * (p.w / 2), p.y - tx * (p.w / 2)]);
  });
  return { left, right, samples: s };
}

/** ครึ่งวงกลมปิดปลาย: จากจุดขอบหนึ่ง ผ่านด้านหน้า (ทิศ dir) ไปอีกขอบ */
function cap(cx: number, cy: number, r: number, nx: number, ny: number, dx: number, dy: number, steps = 10): [number, number][] {
  const out: [number, number][] = [];
  for (let k = 1; k < steps; k++) {
    const a = (Math.PI * k) / steps;
    out.push([cx + r * (Math.cos(a) * nx + Math.sin(a) * dx), cy + r * (Math.cos(a) * ny + Math.sin(a) * dy)]);
  }
  return out;
}

/** รูปหลายเหลี่ยมของหาง (ขอบซ้าย → ปลายมน → ขอบขวา → โคนมน) */
export function logoTailPolygon(n = 72): [number, number][] {
  const { left, right, samples } = logoTailOutline(n);
  const dir = (i: number, j: number) => {
    const dx = samples[j].x - samples[i].x;
    const dy = samples[j].y - samples[i].y;
    const l = Math.hypot(dx, dy) || 1;
    return [dx / l, dy / l] as const;
  };
  const last = samples.length - 1;
  const [tx, ty] = dir(last - 1, last);
  const tip = samples[last];
  const [bx, by] = dir(1, 0);
  const base = samples[0];
  // normal ฝั่งซ้าย = (−ty, tx) ตาม logoTailOutline
  const tipCap = cap(tip.x, tip.y, tip.w / 2, -ty, tx, tx, ty);
  const baseCap = cap(base.x, base.y, base.w / 2, -by, bx, bx, by);
  return [...left, ...tipCap, ...[...right].reverse(), ...baseCap];
}

/** path ของหางแบบรูปทึบ (ปลายมนทั้งสองข้าง) */
export function logoTailPath(): string {
  const pts = logoTailPolygon();
  return `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}Z`;
}

export function logoNosePath(): string {
  const n = LOGO.nose;
  return `M${n.x} ${n.y}h${n.w}l${-n.w / 2} ${n.h}z`;
}
