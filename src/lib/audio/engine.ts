'use client';
/**
 * Web Audio engine — เสียงทั้งหมดสังเคราะห์ในโค้ด (PROMPT.md 3.7, CREDITS.md `sound-synth`)
 * ปิดเสียงเป็นค่าเริ่มต้น และเริ่มได้หลังผู้ใช้กดเท่านั้น
 */
import { read } from '../storage';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

export function getAudio(): { ctx: AudioContext; out: GainNode } | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return { ctx, out: master! };
  } catch {
    return null;
  }
}

export function isSoundEnabled(): boolean {
  const session = read('demoSession');
  return session ? !!session.soundEnabled : soundOverride;
}

let soundOverride = false;
/** ใช้เมื่อ storage ใช้ไม่ได้ */
export function setSoundOverride(on: boolean) {
  soundOverride = on;
}

export interface Tone { freq: number; to?: number; dur: number; type?: OscillatorType; gain?: number; delay?: number }

export function tone(a: { ctx: AudioContext; out: AudioNode }, t: Tone) {
  const start = a.ctx.currentTime + (t.delay ?? 0);
  const osc = a.ctx.createOscillator();
  const g = a.ctx.createGain();
  osc.type = t.type ?? 'sine';
  osc.frequency.setValueAtTime(t.freq, start);
  if (t.to) osc.frequency.exponentialRampToValueAtTime(t.to, start + t.dur);
  const peak = t.gain ?? 0.2;
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(peak, start + Math.min(0.02, t.dur / 4));
  g.gain.exponentialRampToValueAtTime(0.0001, start + t.dur);
  osc.connect(g).connect(a.out);
  osc.start(start);
  osc.stop(start + t.dur + 0.05);
}

export function noise(a: { ctx: AudioContext; out: AudioNode }, dur: number, opts: { gain?: number; delay?: number; filter?: number; filterTo?: number; q?: number } = {}) {
  const start = a.ctx.currentTime + (opts.delay ?? 0);
  const len = Math.max(1, Math.floor(a.ctx.sampleRate * dur));
  const buf = a.ctx.createBuffer(1, len, a.ctx.sampleRate);
  const d = buf.getChannelData(0);
  let seed = 1234567;
  for (let i = 0; i < len; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    d[i] = (seed / 0x7fffffff) * 2 - 1;
  }
  const src = a.ctx.createBufferSource();
  src.buffer = buf;
  const f = a.ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.setValueAtTime(opts.filter ?? 1800, start);
  if (opts.filterTo) f.frequency.exponentialRampToValueAtTime(opts.filterTo, start + dur);
  f.Q.value = opts.q ?? 0.8;
  const g = a.ctx.createGain();
  g.gain.setValueAtTime(opts.gain ?? 0.2, start);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  src.connect(f).connect(g).connect(a.out);
  src.start(start);
  src.stop(start + dur + 0.05);
}
