'use client';
import type { ComponentPropsWithoutRef } from 'react';
import type { MascotKind } from '@/lib/types';
import { AnimatePresence, m as motionEl, useReducedMotion } from '@/lib/motion';
import { T } from '@/lib/motion-tokens';
import { PawPrint } from '@/components/ui/PawPrint';
import { Icon, type IconName } from '@/components/ui/Icon';
import s from './profile-credit.module.css';

export function PetFrame({ mascot, children, className, ...props }: { mascot: MascotKind } & ComponentPropsWithoutRef<'section'>) {
  const reduced = useReducedMotion();
  return <section className={[s.frame, className].filter(Boolean).join(' ')} data-pet={mascot} {...props}>
    <div className={s.borderArt} aria-hidden="true"><AnimatePresence initial={false}>
      <motionEl.div key={mascot} className={s.pawLayer} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={reduced ? { duration: 0 } : T.switch}>
        {['topLeft', 'topRight', 'bottomLeft', 'bottomRight', 'sideLeft', 'sideRight'].map((position) => <PawPrint key={position} kind={mascot} className={`${s.borderPaw} ${s[position]}`} />)}
      </motionEl.div>
    </AnimatePresence></div>
    <div className={s.content}>{children}</div>
  </section>;
}

/** A metric in a definition list, shared by profile credit and donation pools. */
export function PetStat({ mascot, label, icon, children, className, ...props }: { mascot: MascotKind; label: string; icon: IconName } & ComponentPropsWithoutRef<'div'>) {
  return <div className={[s.creditStat, className].filter(Boolean).join(' ')} {...props}>
    <dt><Icon name={icon} size={18} />{label}</dt>
    <dd>{children}</dd>
    <PawPrint kind={mascot} className={s.statPaw} />
  </div>;
}
