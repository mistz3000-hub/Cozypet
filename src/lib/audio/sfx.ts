'use client';
/** เสียง UI สั้น (< 400ms) และเบา — ห้ามมีเสียงเหรียญหรือเครื่องคิดเงิน (PROMPT.md 3.7) */
import { getAudio, isSoundEnabled, noise, tone } from './engine';

export type SfxName =
  | 'tap' | 'pop' | 'meow' | 'woof' | 'shutter' | 'scan' | 'chime' | 'ping' | 'message' | 'read' | 'jingle' | 'box' | 'tick' | 'whoosh';

export function playSfx(name: SfxName, opts: { force?: boolean } = {}) {
  if (!opts.force && !isSoundEnabled()) return;
  const a = getAudio();
  if (!a) return;
  switch (name) {
    case 'tap':
      tone(a, { freq: 880, to: 660, dur: 0.06, type: 'triangle', gain: 0.08 });
      break;
    case 'pop':
      tone(a, { freq: 520, to: 980, dur: 0.09, type: 'sine', gain: 0.14 });
      break;
    case 'meow':
      tone(a, { freq: 620, to: 980, dur: 0.16, type: 'sine', gain: 0.16 });
      tone(a, { freq: 980, to: 560, dur: 0.18, type: 'sine', gain: 0.14, delay: 0.15 });
      break;
    case 'woof':
      tone(a, { freq: 260, to: 170, dur: 0.12, type: 'triangle', gain: 0.22 });
      tone(a, { freq: 300, to: 190, dur: 0.12, type: 'triangle', gain: 0.2, delay: 0.16 });
      break;
    case 'shutter':
      noise(a, 0.05, { gain: 0.35, filter: 3200, q: 0.6 });
      noise(a, 0.07, { gain: 0.25, filter: 1400, q: 0.6, delay: 0.07 });
      break;
    case 'scan':
      noise(a, 0.35, { gain: 0.08, filter: 600, filterTo: 4200, q: 4 });
      break;
    case 'chime':
      [880, 1108, 1318].forEach((f, i) => tone(a, { freq: f, dur: 0.22, type: 'sine', gain: 0.1, delay: i * 0.08 }));
      break;
    case 'ping':
      tone(a, { freq: 1320, dur: 0.18, type: 'sine', gain: 0.08 });
      break;
    case 'message':
      tone(a, { freq: 700, to: 900, dur: 0.07, type: 'sine', gain: 0.1 });
      break;
    case 'read':
      tone(a, { freq: 1500, dur: 0.05, type: 'triangle', gain: 0.05 });
      break;
    case 'jingle':
      [659, 784, 988, 1318].forEach((f, i) => tone(a, { freq: f, dur: 0.16, type: 'triangle', gain: 0.1, delay: i * 0.07 }));
      break;
    case 'box':
      tone(a, { freq: 300, to: 520, dur: 0.1, type: 'square', gain: 0.05 });
      break;
    case 'tick':
      tone(a, { freq: 1250, dur: 0.04, type: 'square', gain: 0.04 });
      break;
    case 'whoosh':
      noise(a, 0.3, { gain: 0.08, filter: 400, filterTo: 2600, q: 1.2 });
      break;
  }
}
