'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from '@/lib/motion';
import { DUR, EASE } from '@/lib/motion-tokens';
import { useI18n } from '@/i18n/provider';

/** ตัวเลขนับขึ้นจาก 0 ถึงค่าจริง (MOTION.md 3 ข้อ 8) — ค่าจริงจากข้อมูลเท่านั้น */
export function CountUp({ value, format }: { value: number; format?: (n: number) => string }) {
  const { num } = useI18n();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(value);
  useEffect(() => {
    if (!inView || reduced) return;
    const controls = animate(0, value, { duration: DUR.hero, ease: EASE.out, onUpdate: (v) => setShown(Math.round(v)) });
    return () => controls.stop();
  }, [inView, reduced, value]);
  const fmt = format ?? ((n: number) => num(n));
  return (
    <span ref={ref}>
      <span aria-hidden="true">{fmt(inView && !reduced ? shown : value)}</span>
      <span className="visually-hidden">{fmt(value)}</span>
    </span>
  );
}
