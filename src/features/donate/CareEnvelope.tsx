'use client';
import type { MascotKind } from '@/lib/types';
import { AnimatePresence, m as motionEl, useReducedMotion } from '@/lib/motion';
import { T } from '@/lib/motion-tokens';
import { PawPrint } from '@/components/ui/PawPrint';
import s from './donate.module.css';

/** Original SVG illustration; carries a cat and dog postage mark, with a seal for the selected pet. */
export function CareEnvelope({ mascot, label, brand }: { mascot: MascotKind; label: string; brand: string }) {
  const reduced = useReducedMotion();
  return <motionEl.svg viewBox="0 0 160 136" className={s.envelopeArt} data-pet={mascot} role="img" aria-label={label} focusable="false" initial={reduced ? false : { opacity: 0, y: 8, rotate: -4 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={reduced ? { duration: 0 } : T.slow}>
    <ellipse cx="80" cy="124" rx="56" ry="5" fill="var(--cp-table-wood)" opacity=".2" />
    <path d="m22 47 49-30q9-7 18 0l49 30v59H22Z" fill="var(--cp-table-edge)" stroke="var(--cp-wood-dark)" strokeWidth="1.3" strokeLinejoin="round" />
    <rect x="33" y="25" width="94" height="77" rx="9" fill="var(--cp-surface)" stroke="var(--cp-border)" strokeWidth="1.5" />
    <path d="M48 40h39M48 47h30" stroke="var(--cp-table-edge)" strokeWidth="3" strokeLinecap="round" />
    <g transform="rotate(9 110 45)"><rect x="98" y="32" width="25" height="28" rx="4" fill="var(--cp-peach)" stroke="var(--cp-wood-dark)" strokeDasharray="2 3" /><PawPrint kind="dog" x="102" y="35" width="17" height="19" color="var(--cp-wood-dark)" /></g>
    <PawPrint kind="cat" x="47" y="55" width="18" height="20" color="var(--cp-gold-700)" />
    <text x="82" y="73" textAnchor="middle" fill="var(--cp-ink-muted)" fontSize="10" fontFamily="var(--cp-font-heading)">{brand}</text>
    <path d="M18 52q0-6 6-6l49 35q7 5 14 0l49-35q6 0 6 6v53q0 11-12 11H30q-12 0-12-11Z" fill="var(--envelope-paper)" stroke="var(--cp-wood-dark)" strokeWidth="1.4" />
    <path d="m21 111 45-33m73 33L94 78" fill="none" stroke="var(--cp-table-edge)" strokeWidth="1.7" />
    <circle cx="80" cy="89" r="17" fill="var(--cp-gold-500)" stroke="var(--cp-table-edge)" strokeWidth="2" />
    <AnimatePresence initial={false}><motionEl.g key={mascot} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={reduced ? { duration: 0 } : T.switch}><PawPrint kind={mascot} x="65" y="74" width="30" height="30" color="var(--cp-ink)" /></motionEl.g></AnimatePresence>
    <path d="M29 29c-9-7-10-12-6-14 3-2 5 0 6 2 1-2 3-4 6-2 4 2 3 7-6 14Z" fill="var(--cp-heart)" opacity=".8" />
    <path d="M137 21c-6-5-7-8-4-10 2-1 3 0 4 1 1-1 2-2 4-1 3 2 2 5-4 10Z" fill="var(--cp-heart)" opacity=".6" />
  </motionEl.svg>;
}
