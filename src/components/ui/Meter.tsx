'use client';

import { m } from '@/lib/motion';
import { T } from '@/lib/motion-tokens';
import s from './ui.module.css';

/** แถบความจุ/เสบียง/ความคืบหน้า — เติมจาก 0 ถึงค่าจริง (MOTION.md 3 ข้อ 7) ตัวเลขต้องแสดงเป็นข้อความคู่กันเสมอ */
export function Meter({ value, max, label, level = 'open', valueText }: { value: number; max: number; label: string; level?: 'open' | 'tight' | 'full' | 'gold'; valueText?: string }) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <div className={s.meter} role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-valuetext={valueText}>
      <m.div
        className={s.meterFill}
        data-level={level}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: ratio }}
        viewport={{ once: true }}
        transition={T.slow}
        style={{ scaleX: ratio }}
      />
    </div>
  );
}
