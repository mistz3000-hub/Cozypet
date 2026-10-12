'use client';

import { useEffect, useRef, useState } from 'react';
import { useDemoSession, useHydrated } from '@/lib/store';
import { useReducedMotion } from '@/lib/motion';
import { MASCOT } from './mascot-config';
import { PhotoCatArt } from './PhotoCatArt';
import { PhotoDogArt } from './PhotoDogArt';
import s from './mascot.module.css';

export const DOCK_TOUCH_EVENT = 'cozypet:dock-touch';

/** mini mascot เกาะขอบ tab bar/dock — ภาพตกแต่ง (aria-hidden, pointer-events none) PROMPT.md 6.7 */
export function MiniMascot({ style }: { style?: React.CSSProperties }) {
  const hydrated = useHydrated();
  const [session] = useDemoSession();
  const reduced = useReducedMotion();
  const kind = hydrated ? session.mascot : 'cat';
  const [tap, setTap] = useState(false);
  const lastTap = useRef(0);

  useEffect(() => {
    if (reduced) return;
    let t = 0;
    const onTouch = () => {
      const now = performance.now();
      if (now - lastTap.current < MASCOT.pawThrottleMs) return;
      lastTap.current = now;
      setTap(true);
      window.clearTimeout(t);
      t = window.setTimeout(() => setTap(false), MASCOT.pawTapMs);
    };
    window.addEventListener(DOCK_TOUCH_EVENT, onTouch);
    return () => {
      window.removeEventListener(DOCK_TOUCH_EVENT, onTouch);
      window.clearTimeout(t);
    };
  }, [reduced]);

  return (
    <span className={s.mini} style={style} aria-hidden="true" data-kind={kind} data-tap={tap ? 'true' : undefined} data-idle={hydrated && !reduced ? 'true' : undefined}>
      {kind === 'cat' ? <PhotoCatArt withTable={false} /> : <PhotoDogArt withTable={false} />}
    </span>
  );
}
