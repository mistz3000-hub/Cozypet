'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MascotKind } from '@/lib/types';
import { playPetSound, stopPetSound } from '@/lib/audio/pets';
import { MASCOT } from './mascot-config';

export interface Heart { id: number; x: number; drift: number; rot: number; delay: number; size: number }

/** Shared by both playable photographic pets. Timers describe a reaction, never loading. */
export function usePetReaction(kind: MascotKind, reduced: boolean) {
  const [reaction, setReaction] = useState(false);
  const [hearts, setHearts] = useState<Heart[]>([]);
  const scope = `${kind}:${reduced}`;
  const [stateScope, setStateScope] = useState(scope);
  if (stateScope !== scope) { setStateScope(scope); setReaction(false); setHearts([]); }
  const reacting = useRef(false);
  const timers = useRef<number[]>([]);
  const sequence = useRef(0);
  useEffect(() => {
    reacting.current = false;
    return () => { timers.current.forEach((timer) => window.clearTimeout(timer)); timers.current = []; stopPetSound(); };
  }, [kind, reduced]);

  const react = useCallback(() => {
    if (reacting.current) return;
    timers.current.forEach((timer) => window.clearTimeout(timer));
    reacting.current = true;
    setReaction(true);
    void playPetSound(kind);
    setHearts(Array.from({ length: reduced ? 2 : 3 }, (_, i) => ({
      id: ++sequence.current,
      x: (i - (reduced ? 0.5 : 1)) * MASCOT.heartSpread,
      drift: reduced ? 0 : MASCOT.heartDrift[i],
      rot: reduced ? 0 : Math.random() * 24 - 12,
      delay: i * MASCOT.heartGapMs,
      size: MASCOT.heartSizes[i],
    })));
    timers.current = [
      window.setTimeout(() => setReaction(false), reduced ? MASCOT.reducedReactionMs : MASCOT.reactionMs),
      window.setTimeout(() => { setHearts([]); reacting.current = false; timers.current = []; }, MASCOT.reactionLockMs),
    ];
  }, [kind, reduced]);
  return { reaction, hearts, react, reacting };
}
