'use client';

import { useEffect, useRef, useState } from 'react';
import { useDemoSession, useHydrated } from '@/lib/store';
import { useReducedMotion } from '@/lib/motion';
import { MASCOT } from './mascot-config';
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

  const fur = kind === 'dog' ? '#C8956A' : '#F2A65A';
  const dark = kind === 'dog' ? '#9E6D47' : '#E08A3C';
  const cream = kind === 'dog' ? '#FBEBD7' : '#FFF1DE';
  return (
    <span className={s.mini} style={style} aria-hidden="true" data-tap={tap ? 'true' : undefined} data-idle={reduced ? undefined : 'true'}>
      <svg viewBox="0 0 52 42">
        <g data-part="mini-head">
          {kind === 'cat' ? (
            <>
              <path d="M10 18 13 4l9 9zM42 18 39 4l-9 9z" fill={fur} />
              <ellipse cx="26" cy="22" rx="17" ry="14" fill={fur} />
            </>
          ) : (
            <>
              <ellipse cx="26" cy="22" rx="17" ry="15" fill={fur} />
              <path d="M12 12q-8 2-6 14 6-2 9-8zM40 12q8 2 6 14-6-2-9-8z" fill={dark} />
            </>
          )}
          <ellipse cx="26" cy="27" rx="10" ry="6.5" fill={cream} />
          <circle cx="20" cy="21" r="2.4" fill="#2B2118" />
          <circle cx="32" cy="21" r="2.4" fill="#2B2118" />
          <path d="M24 26h4l-2 2z" fill={kind === 'dog' ? '#2B2118' : '#E77C86'} />
        </g>
        <g data-part="mini-paw">
          <ellipse cx="17" cy="37" rx="6.5" ry="4.5" fill={cream} stroke={dark} strokeWidth="1" />
        </g>
        <ellipse cx="35" cy="37" rx="6.5" ry="4.5" fill={cream} stroke={dark} strokeWidth="1" />
      </svg>
    </span>
  );
}
