'use client';

import type { CSSProperties } from 'react';
import { m as motionEl, MotionConfig } from '@/lib/motion';
import { EASE } from '@/lib/motion-tokens';
import { MASCOT } from './mascot-config';
import type { Heart } from './usePetReaction';
import s from './mascot.module.css';

export function PetHearts({ hearts, reduced, anchor = 'hero' }: { hearts: Heart[]; reduced: boolean; anchor?: 'hero' | 'photo' }) {
  return <MotionConfig reducedMotion="never"><span className={s.hearts} data-anchor={anchor} aria-hidden="true">
    {hearts.map((heart) => {
      const timing = { duration: MASCOT.heartMs / 1000, delay: heart.delay / 1000 };
      return <motionEl.svg
      key={heart.id} className={s.heart} data-heart="true" viewBox="0 0 24 24" width={heart.size} height={heart.size}
      style={{ left: `${50 + heart.x}%`, translate: '-50% 0', '--heart-size': `${heart.size}px` } as CSSProperties}
      initial={{ opacity: 1, x: 0, y: 4, scale: reduced ? 1 : 0.65 }}
      animate={reduced ? { opacity: [1, 1, 1, 0], y: [4, -MASCOT.reducedHeartRise] } : { opacity: [1, 1, 1, 0], y: [4, -MASCOT.heartRise], x: [0, heart.drift], scale: [0.65, 1.08, 1, 0.9], rotate: [0, heart.rot] }}
      transition={{
        ...timing,
        opacity: { ...timing, times: [0, 0.12, 0.62, 1], ease: EASE.inOut },
        y: { ...timing, ease: EASE.linear },
        x: { ...timing, ease: EASE.linear },
        scale: { ...timing, times: [0, 0.15, 0.65, 1], ease: EASE.out },
        rotate: { ...timing, ease: EASE.inOut },
      }}
    >
      <path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z" fill="currentColor" stroke="var(--cp-surface)" strokeWidth="0.8" />
      <path d="M6.8 9.5c0-1.7 1.1-2.8 2.4-2.8" fill="none" stroke="var(--cp-surface)" strokeWidth="1.4" strokeLinecap="round" opacity="0.75" />
    </motionEl.svg>;
    })}
  </span></MotionConfig>;
}
