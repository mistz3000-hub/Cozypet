'use client';
import type { MascotKind } from '../types';
import { getAudio, isSoundEnabled } from './engine';

/** Real CC0 pet recordings; provenance and edits are registered in CREDITS.md D28. */
const CLIPS: Record<MascotKind, string> = { cat: '/audio/cat-purr.wav', dog: '/audio/dog-pant.wav' };
const buffers = new Map<MascotKind, Promise<AudioBuffer | null>>();
let revision = 0;
let active: { source: AudioBufferSourceNode; gain: GainNode } | null = null;

function loadClip(kind: MascotKind, context: AudioContext): Promise<AudioBuffer | null> {
  const cached = buffers.get(kind);
  if (cached) return cached;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 6000);
  const pending = fetch(CLIPS[kind], { cache: 'force-cache', signal: controller.signal })
    .then((response) => {
      if (!response.ok) throw new Error('Pet audio unavailable');
      return response.arrayBuffer();
    })
    .then((data) => context.decodeAudioData(data))
    .catch(() => { buffers.delete(kind); return null; })
    .finally(() => window.clearTimeout(timeout));
  buffers.set(kind, pending);
  return pending;
}

/** Called from a trusted sound toggle or pet selection, never on page entry. */
export function preparePetSound(kind: MascotKind) {
  if (!isSoundEnabled() || document.hidden) return;
  const audio = getAudio();
  if (audio) void loadClip(kind, audio.ctx);
}

export function stopPetSound() {
  revision++;
  if (!active) return;
  try { active.source.stop(); } catch { /* The short clip may already have ended. */ }
  active.source.disconnect();
  active.gain.disconnect();
  active = null;
}

/** The face and hearts react immediately while audio readiness is handled separately. */
export async function playPetSound(kind: MascotKind) {
  if (!isSoundEnabled() || document.hidden) return;
  stopPetSound();
  const request = revision;
  const deadline = performance.now() + 750;
  const audio = getAudio();
  if (!audio) return;
  try {
    const buffer = await loadClip(kind, audio.ctx);
    if (!buffer || request !== revision || !isSoundEnabled() || document.hidden || performance.now() > deadline || audio.ctx.state !== 'running') return;
    const source = audio.ctx.createBufferSource();
    const gain = audio.ctx.createGain();
    source.buffer = buffer;
    const now = audio.ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.85, now + 0.035);
    gain.gain.setValueAtTime(0.85, now + Math.max(0.04, buffer.duration - 0.12));
    gain.gain.linearRampToValueAtTime(0, now + buffer.duration);
    source.connect(gain).connect(audio.out);
    active = { source, gain };
    source.onended = () => {
      source.disconnect();
      gain.disconnect();
      if (active?.source === source) active = null;
    };
    source.start(now);
  } catch { /* A failed/blocked audio clip must not interrupt the visible reaction. */ }
}
