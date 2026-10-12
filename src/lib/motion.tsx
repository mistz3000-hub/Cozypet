'use client';
/**
 * จุดเดียวที่ import Motion (LazyMotion + m) — component อื่นห้าม import `motion` เต็มรูปแบบ (AC-81)
 */
import { LazyMotion, MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';
import { T } from './motion-tokens';

export { m, AnimatePresence, useReducedMotion, animate, useScroll, useTransform, useMotionValue, useSpring, useInView, LayoutGroup, MotionConfig } from 'motion/react';

const loadFeatures = () => import('./motion-features').then((r) => r.default);
const loadMax = () => import('./motion-features-max').then((r) => r.default);

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={T.base}>
      <LazyMotion features={loadFeatures} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}

/** ใช้ครอบเฉพาะส่วนที่ต้อง layout/drag */
export function MotionMax({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadMax} strict>
      {children}
    </LazyMotion>
  );
}
