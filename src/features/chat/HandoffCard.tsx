'use client';

import { useMemo, useState } from 'react';
import type { Handoff } from '@/lib/types';
import { useI18n } from '@/i18n/provider';
import { getHelper } from '@/data';
import { rngFromKey } from '@/lib/seeded-random';
import { m as motionEl, useReducedMotion } from '@/lib/motion';
import { DUR, EASE, SPRING, T } from '@/lib/motion-tokens';
import { Avatar } from '@/components/PetImage';
import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { helperName } from '@/features/helpers/helper-text';
import s from './chat.module.css';

const PARTICLES = 18; // ≤ 24 ชิ้น (PROMPT.md 7.6)

/** การ์ดส่งต่อน้อง (ผลลัพธ์จำลอง) + animation ฉลองในแชต ~1.8 วินาที */
export function HandoffCard({ handoff: h }: { handoff: Handoff }) {
  // เล่น animation เฉพาะการ์ดที่เพิ่งสร้าง (ไม่เล่นซ้ำเมื่อกลับมาเปิดแชต)
  const [animate] = useState(() => Date.now() - Date.parse(h.createdAt) < 5000);
  const { m, f, locale } = useI18n();
  const reduced = useReducedMotion();
  const helper = getHelper(h.helperId);
  const name = helper ? helperName(helper, locale) : h.helperId;
  const isShelter = helper?.kind === 'shelter';
  const play = animate && !reduced;
  const parts = useMemo(() => {
    const rnd = rngFromKey(h.id);
    return Array.from({ length: PARTICLES }, (_, i) => ({ i, x: (rnd() - 0.5) * 260, y: -40 - rnd() * 120, r: (rnd() - 0.5) * 60, heart: i % 3 === 0 }));
  }, [h.id]);

  return (
    <motionEl.div
      className={s.handoffCard}
      role="group"
      aria-label={m.chat.handoffDone}
      initial={animate ? (reduced ? { opacity: 0 } : { opacity: 0, y: 40 }) : false}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? T.base : SPRING.soft}
    >
      {play ? (
        <div className={s.particles} aria-hidden="true">
          {parts.map((p) => (
            <motionEl.span
              key={p.i}
              className={s.particle}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0.6, rotate: 0 }}
              animate={{ opacity: [0, 1, 0], x: p.x, y: p.y, scale: 1, rotate: p.r }}
              transition={{ duration: DUR.hero * 2, ease: EASE.out, delay: DUR.slow + (p.i % 6) * 0.03 }}
            >
              <Icon name={p.heart ? 'heart' : 'paw'} size={14} />
            </motionEl.span>
          ))}
        </div>
      ) : null}
      <div className={s.handoffPair}>
        <motionEl.span initial={play ? { x: -28 } : false} animate={{ x: 0 }} transition={{ ...SPRING.bouncy, delay: DUR.base }}>
          <Avatar name={name} media={helper?.images.profile} size={52} />
        </motionEl.span>
        <motionEl.span className={s.handoffHeart} initial={play ? { scale: 0 } : false} animate={{ scale: 1 }} transition={{ ...SPRING.bouncy, delay: DUR.slow }}>
          <Icon name="heart" size={26} />
        </motionEl.span>
        <motionEl.span initial={play ? { x: 28 } : false} animate={{ x: 0 }} transition={{ ...SPRING.bouncy, delay: DUR.base }} className={s.petBadge}>
          <Icon name="paw" size={28} />
        </motionEl.span>
      </div>
      <p className={s.handoffTitle}>{f(isShelter ? m.chat.cardShelter : m.chat.cardPerson, { helper: name, pet: h.petName })}</p>
      <p className={s.handoffSub}>{f(m.chat.cardMode, { mode: m.chat.modeLabel[h.mode] })}</p>
      <p className={s.handoffNote}>{m.chat.cardNote}{isShelter ? ` · ${f(m.chat.cardNoteReal, { helper: name })}` : ''}</p>
      <div className={s.handoffActions}>
        {helper ? <ButtonLink href={`/helpers/${helper.id}`} small icon="user">{m.chat.viewHelper}</ButtonLink> : null}
        {h.listingId ? <ButtonLink href={`/listings/${h.listingId}`} small variant="ghost" icon="doc">{m.chat.viewListing}</ButtonLink> : null}
      </div>
    </motionEl.div>
  );
}
