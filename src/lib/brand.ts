/**
 * โลโก้ Cozypet (D34): ตัว C เป็นหัวแมวขดตัว — หูสองข้าง ตา จมูกชมพู บนช่องสี่เหลี่ยมมนสีทอง
 * เก็บเป็นตัวเลขชุดเดียว ใช้วาดทั้ง SVG ในแอป (Wordmark, favicon) และโมเดล 3 มิติในวิดีโอเดโม
 * พิกัดอยู่ในกรอบ 64×64 (แกน y ชี้ลงแบบ SVG)
 */
export const LOGO = {
  view: 64,
  tile: { x: 2, y: 2, size: 60, radius: 18 },
  /** วงหัว (เส้นตัว C): จุดศูนย์กลาง รัศมี ความหนา มุมเริ่ม/จบ (องศา วัดตามเข็มนาฬิกาจากแกน x) */
  ring: { cx: 32, cy: 37, r: 15.5, stroke: 7.5, from: 44, to: 298 },
  /** หูซ้าย [ฐานนอก, ปลาย, ฐานใน] — หูขวาสะท้อนรอบ x = 32 */
  ear: [[17.8, 26.7], [21.5, 13.5], [29.0, 19.8]] as const,
  earRound: 4.5,
  eyes: [[26.6, 36.4], [35.8, 36.4]] as const,
  eyeR: 2.5,
  /** จมูก: สามเหลี่ยมมน (จุดซ้าย, กว้าง, สูง) */
  nose: { x: 29.4, y: 40.6, w: 3.6, h: 2.1 },
} as const;

const pt = (deg: number, r: number = LOGO.ring.r) => {
  const a = (deg * Math.PI) / 180;
  return [LOGO.ring.cx + r * Math.cos(a), LOGO.ring.cy + r * Math.sin(a)] as const;
};

const f = (n: number) => Number(n.toFixed(2));

/** path ของเส้นตัว C (ใช้ stroke ความหนา LOGO.ring.stroke, หัวมน) */
export function logoRingPath(): string {
  const { r, from, to } = LOGO.ring;
  const [sx, sy] = pt(from);
  const [ex, ey] = pt(to);
  const large = (to - from + 360) % 360 > 180 ? 1 : 0;
  return `M${f(sx)} ${f(sy)}A${r} ${r} 0 ${large} 1 ${f(ex)} ${f(ey)}`;
}

/** จุดของหูทั้งสองข้าง (ซ้ายแล้วขวา) */
export function logoEars(): [number, number][][] {
  const left = LOGO.ear.map(([x, y]) => [x, y] as [number, number]);
  const right = [...LOGO.ear].reverse().map(([x, y]) => [LOGO.view - x, y] as [number, number]);
  return [left, right];
}

export function logoEarsPath(): string {
  return logoEars().map((pts) => `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}Z`).join('');
}

export function logoNosePath(): string {
  const n = LOGO.nose;
  return `M${n.x} ${n.y}h${n.w}l${-n.w / 2} ${n.h}z`;
}
