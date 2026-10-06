'use client';

import type { MascotKind } from '@/lib/types';
import { useDemoSession, useHydrated } from '@/lib/store';
import { useI18n } from '@/i18n/provider';
import { useAnnounce } from '@/components/providers/Announcer';
import { useToast } from '@/components/providers/Toast';
import s from './switch.module.css';

/** segmented control “น้องแมว / น้องหมา” (radio group) PROMPT.md 6.4 */
export function MascotSwitch({ compact = false, idSuffix = '' }: { compact?: boolean; idSuffix?: string }) {
  const { m } = useI18n();
  const hydrated = useHydrated();
  const [session, update] = useDemoSession();
  const announce = useAnnounce();
  const toast = useToast();
  const value: MascotKind = hydrated ? session.mascot : 'cat';
  const choose = (k: MascotKind) => {
    if (k === value) return;
    const r = update({ mascot: k });
    announce(k === 'dog' ? m.mascot.changedDog : m.mascot.changedCat);
    if (r === 'memory' || r === 'quota') toast(m.mascot.noRemember, { tone: 'info', icon: 'info' });
  };
  const name = `mascot-switch${idSuffix}`;
  return (
    <div role="radiogroup" aria-label={m.mascot.groupLabel} className={[s.switch, compact && s.compact].filter(Boolean).join(' ')}>
      {(['cat', 'dog'] as MascotKind[]).map((k) => (
        <label key={k} className={s.item} data-checked={value === k ? 'true' : undefined}>
          <input type="radio" name={name} value={k} checked={value === k} onChange={() => choose(k)} />
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            {k === 'cat' ? <path d="M5 10 6 3l5 4h2l5-4 1 7a8 8 0 0 1-14 0z" fill="currentColor" /> : <path d="M6 5q-4 1-3 8 3 0 4-4M18 5q4 1 3 8-3 0-4-4M6 7a6 6 0 0 1 12 0v6a6 6 0 0 1-12 0z" fill="currentColor" />}
          </svg>
          <span>{k === 'cat' ? m.mascot.cat : m.mascot.dog}</span>
        </label>
      ))}
    </div>
  );
}
