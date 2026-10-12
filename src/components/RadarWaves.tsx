import type { CSSProperties } from 'react';
import s from './radar.module.css';

/** Reusable simulated scan: three expanding waves, a soft rotating sweep and a beacon. */
export function RadarWaves({ className, style }: { className?: string; style?: CSSProperties }) {
  return <span className={[s.radar, className].filter(Boolean).join(' ')} style={style} aria-hidden="true" data-radar-waves="true">
    <span className={s.grid} />
    <span className={s.sweep} />
    <span className={s.wave} /><span className={s.wave} /><span className={s.wave} />
    <span className={s.beacon} />
  </span>;
}
