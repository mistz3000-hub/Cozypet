/**
 * Motion tokens — แหล่งความจริงเดียว (MOTION.md หัวข้อ 2) ต้องตรงกับ CSS custom properties ใน src/app/tokens.css (มี unit test)
 * ห้าม hard-code เวลา easing หรือ spring ใน component
 */
export const DURATION_MS = { instant: 90, quick: 150, base: 250, slow: 400, hero: 700 } as const;
export type DurationToken = keyof typeof DURATION_MS;
/** วินาที (สำหรับ Motion) */
export const DUR = {
  instant: DURATION_MS.instant / 1000,
  quick: DURATION_MS.quick / 1000,
  base: DURATION_MS.base / 1000,
  slow: DURATION_MS.slow / 1000,
  hero: DURATION_MS.hero / 1000,
} as const;

export const EASE = {
  linear: [0, 0, 1, 1],
  out: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
  in: [0.5, 0, 0.75, 0],
} as const satisfies Record<string, readonly [number, number, number, number]>;

export const SPRING = {
  snappy: { type: 'spring', stiffness: 520, damping: 38, mass: 1 },
  soft: { type: 'spring', stiffness: 260, damping: 28, mass: 1 },
  bouncy: { type: 'spring', stiffness: 380, damping: 18, mass: 1 },
  gentle: { type: 'spring', stiffness: 120, damping: 24, mass: 1 },
} as const;

export const DISTANCE = { page: 8, card: 16, sheet: 24, hoverLift: 2 } as const;
export const SCALE = { press: 0.97, popFrom: 0.92 } as const;
export const STAGGER_S = 0.04;
export const STAGGER_MAX_ITEMS = 8;
/** stagger ของรายการที่ i (เกิน 8 รายการ รวมไม่เกิน 320ms) */
export function staggerDelay(i: number): number {
  return Math.min(i, STAGGER_MAX_ITEMS) * STAGGER_S;
}

/** CSS custom properties ที่ต้องตรงกับค่าด้านบน */
export const CSS_TOKENS: Record<string, string> = {
  '--cp-dur-instant': `${DURATION_MS.instant}ms`,
  '--cp-dur-quick': `${DURATION_MS.quick}ms`,
  '--cp-dur-base': `${DURATION_MS.base}ms`,
  '--cp-dur-slow': `${DURATION_MS.slow}ms`,
  '--cp-dur-hero': `${DURATION_MS.hero}ms`,
  '--cp-ease-out': `cubic-bezier(${EASE.out.join(', ')})`,
  '--cp-ease-in-out': `cubic-bezier(${EASE.inOut.join(', ')})`,
  '--cp-ease-in': `cubic-bezier(${EASE.in.join(', ')})`,
};

/** transition มาตรฐาน */
export const T = {
  switch: { duration: DUR.slow, ease: EASE.inOut },
  page: { duration: DUR.base, ease: EASE.out },
  quick: { duration: DUR.quick, ease: EASE.out },
  base: { duration: DUR.base, ease: EASE.out },
  slow: { duration: DUR.slow, ease: EASE.out },
  hero: { duration: DUR.hero, ease: EASE.out },
  exit: { duration: DUR.quick, ease: EASE.in },
  instant: { duration: DUR.instant },
} as const;
