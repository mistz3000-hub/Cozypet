/**
 * ดนตรีและเสียงประกอบของวิดีโอเดโม — สังเคราะห์ด้วย OfflineAudioContext ทั้งหมด (ไม่มีเพลงจากแหล่งอื่น)
 * 90 BPM คีย์ C major · ทุกช่วงเพลงผูกกับบทของ cut · เสียงประกอบมาจาก sfx() ของแต่ละฉาก + cue ของภาพอัดจริง
 * โน้ตของเสียงประกอบอยู่ในบันไดเสียงเพนทาโทนิกเดียวกับเพลง จึงกลมกลืนและไล่ขึ้นตามลำดับวัตถุที่โผล่
 * เสียงแมวครางใช้คลิป CC0 (public/audio/cat-purr.wav, บันทึกใน CREDITS.md)
 */
import type { FilmContext } from '../context';
import type { ChapterKey, Cut, Shot } from '../cuts';
import { SCENES } from '../scenes';
import type { SceneSfx } from '../scenes/types';
import { buildSegments, shotTime } from '../capture';
import { BAR, BEAT } from '../timeline';
import { rngFromKey } from '@/lib/seeded-random';

const SR = 48000;

type Section = 'none' | 'tense' | 'hope' | 'groove' | 'groove2' | 'tech' | 'break' | 'lift' | 'ballad' | 'finale' | 'outro';

const SECTION: Record<ChapterKey, Section> = {
  cold: 'none', swarm: 'tense', problems: 'tense', logo: 'hope', connect: 'hope',
  critical: 'groove', start: 'groove', scan: 'groove', post: 'groove', balancer: 'tech', assist: 'groove2', nearby: 'groove2', chat: 'groove',
  package: 'lift', donate: 'groove2', dashboard: 'groove2', insights: 'tech', i18n: 'groove2',
  waiting: 'break', adopt: 'lift', home: 'ballad', impact: 'finale', team: 'outro',
};

/** พลังของแต่ละช่วง 0..3 (คุมกลอง/อาร์เปจโจ/ความสว่างของแพด) */
const ENERGY: Record<Section, number> = { none: 0, tense: 1.5, hope: 3, groove: 2, groove2: 2.3, tech: 2.8, break: 0.4, lift: 1.5, ballad: 0.8, finale: 3, outro: 1 };

// คอร์ด (ครึ่งเสียงจาก C) — หนึ่งคอร์ดต่อหนึ่งห้อง
const C = [0, 4, 7];
const Dm = [2, 5, 9];
const Em = [4, 7, 11];
const E = [4, 8, 11];
const F = [5, 9, 12];
const G = [7, 11, 14];
const Am = [9, 12, 16];
const PROG: Record<Section, number[][]> = {
  none: [C],
  tense: [Am, F, Dm, E],
  hope: [F, G, Em, Am],
  groove: [F, G, Em, Am],
  groove2: [C, G, Am, F],
  tech: [Am, F, C, G],
  break: [F, C],
  lift: [Dm, G],
  ballad: [C, Am, F, G],
  finale: [F, G, Em, Am],
  outro: [F, G, C, C],
};

/** ธีมขนมชั้น (โน้ตเพนทาโทนิก: [ช่วงเวลาเป็นบีต, โน้ตครึ่งเสียงจาก C5, ยาวบีต]) */
const THEME: [number, number, number][] = [[0, 4, 0.5], [0.5, 7, 0.5], [1, 9, 1], [2, 7, 0.5], [2.5, 4, 0.5], [3, 2, 1], [4, 4, 0.5], [4.5, 7, 0.5], [5, 9, 0.5], [5.5, 12, 0.5], [6, 9, 1.5]];

const PENTA = [0, 2, 4, 7, 9];
const mtof = (semisFromC4: number) => 261.6256 * Math.pow(2, semisFromC4 / 12);
/** โน้ตลำดับ n ในบันไดเพนทาโทนิก เริ่มที่ C5 */
const pentaHz = (n: number) => mtof(12 + 12 * Math.floor(n / 5) + PENTA[((n % 5) + 5) % 5]);

interface Buses { music: GainNode; drums: GainNode; sfx: GainNode; amb: GainNode; reverb: ConvolverNode; delay: DelayNode; delaySend: GainNode; revSend: GainNode }

let lastPcm: Int16Array | null = null;
const CHUNK = 1 << 20;

function impulse(ac: BaseAudioContext, seconds: number, decay: number): AudioBuffer {
  const len = Math.floor(SR * seconds);
  const buf = ac.createBuffer(2, len, SR);
  const rnd = rngFromKey('cozypet:v1:film:ir');
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let lp = 0;
    for (let i = 0; i < len; i++) {
      const n = rnd() * 2 - 1;
      lp = lp * 0.55 + n * 0.45;
      d[i] = lp * Math.pow(1 - i / len, decay);
    }
  }
  return buf;
}

let noiseBuf: AudioBuffer | null = null;
function noise(ac: BaseAudioContext): AudioBuffer {
  if (noiseBuf && noiseBuf.sampleRate === ac.sampleRate) return noiseBuf;
  const len = SR * 2;
  noiseBuf = ac.createBuffer(1, len, SR);
  const d = noiseBuf.getChannelData(0);
  const rnd = rngFromKey('cozypet:v1:film:noise');
  for (let i = 0; i < len; i++) d[i] = rnd() * 2 - 1;
  return noiseBuf;
}

/** แหล่งเสียงสั้นแบบ envelope ADSR อย่างง่าย */
function env(g: GainNode, t: number, a: number, peak: number, d: number, s = 0, r = 0.05, hold = 0) {
  const p = g.gain;
  p.setValueAtTime(0, t);
  p.linearRampToValueAtTime(peak, t + a);
  if (hold > 0) p.setValueAtTime(peak, t + a + hold);
  p.exponentialRampToValueAtTime(Math.max(0.0001, s * peak || 0.0001), t + a + hold + d);
  if (s > 0) p.setTargetAtTime(0, t + a + hold + d, r);
}

function osc(ac: BaseAudioContext, type: OscillatorType, f: number, t: number, dur: number, dest: AudioNode, opts: { detune?: number; to?: number; glide?: number } = {}) {
  const o = ac.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (opts.to) o.frequency.exponentialRampToValueAtTime(opts.to, t + (opts.glide ?? dur));
  if (opts.detune) o.detune.value = opts.detune;
  o.connect(dest);
  o.start(t);
  o.stop(t + dur + 0.05);
  return o;
}

function noiseSrc(ac: BaseAudioContext, t: number, dur: number, dest: AudioNode, offset = 0) {
  const s = ac.createBufferSource();
  s.buffer = noise(ac);
  s.loop = true;
  s.connect(dest);
  s.start(t, offset % 1.9);
  s.stop(t + dur + 0.05);
  return s;
}

function filter(ac: BaseAudioContext, type: BiquadFilterType, f: number, q = 0.7, dest?: AudioNode) {
  const b = ac.createBiquadFilter();
  b.type = type;
  b.frequency.value = f;
  b.Q.value = q;
  if (dest) b.connect(dest);
  return b;
}

function gainTo(ac: BaseAudioContext, dest: AudioNode, v = 1) {
  const g = ac.createGain();
  g.gain.value = v;
  g.connect(dest);
  return g;
}

function panTo(ac: BaseAudioContext, dest: AudioNode, pan: number) {
  const p = ac.createStereoPanner();
  p.pan.value = Math.max(-1, Math.min(1, pan));
  p.connect(dest);
  return p;
}

// ───────────────────────────── ดนตรี

interface BarInfo { t: number; sec: Section; idx: number; next: Section; shot: Shot }

function bars(cut: Cut): BarInfo[] {
  const out: BarInfo[] = [];
  const secCount = new Map<Section, number>();
  let prevSec: Section | null = null;
  for (const shot of cut.shots) {
    const sec = SECTION[shot.chapter];
    if (sec !== prevSec) secCount.set(sec, 0);
    prevSec = sec;
    for (let b = 0; b < shot.bars; b++) {
      const n = secCount.get(sec) ?? 0;
      secCount.set(sec, n + 1);
      out.push({ t: shot.start + b * BAR, sec, idx: n, next: sec, shot });
    }
  }
  for (let i = 0; i < out.length - 1; i++) out[i].next = out[i + 1].sec;
  return out;
}

function kick(ac: BaseAudioContext, t: number, dest: AudioNode, g = 1) {
  const v = gainTo(ac, dest, 0);
  env(v, t, 0.002, 0.9 * g, 0.32);
  osc(ac, 'sine', 140, t, 0.35, v, { to: 42, glide: 0.12 });
  const c = gainTo(ac, dest, 0);
  env(c, t, 0.001, 0.25 * g, 0.02);
  noiseSrc(ac, t, 0.03, filter(ac, 'highpass', 3000, 0.7, c));
}

function snare(ac: BaseAudioContext, t: number, dest: AudioNode, g = 1, clap = true) {
  const v = gainTo(ac, dest, 0);
  env(v, t, 0.001, 0.45 * g, 0.18);
  noiseSrc(ac, t, 0.2, filter(ac, 'bandpass', clap ? 1500 : 2200, 0.8, v), t * 7);
  const b = gainTo(ac, dest, 0);
  env(b, t, 0.001, 0.25 * g, 0.09);
  osc(ac, 'triangle', 190, t, 0.1, b, { to: 150 });
  if (clap) {
    for (const dt of [0.012, 0.024]) {
      const c = gainTo(ac, dest, 0);
      env(c, t + dt, 0.001, 0.2 * g, 0.03);
      noiseSrc(ac, t + dt, 0.04, filter(ac, 'bandpass', 1200, 1.2, c), t * 3 + dt);
    }
  }
}

function hat(ac: BaseAudioContext, t: number, dest: AudioNode, g = 1, open = false) {
  const v = gainTo(ac, dest, 0);
  env(v, t, 0.001, 0.16 * g, open ? 0.22 : 0.045);
  noiseSrc(ac, t, open ? 0.25 : 0.06, filter(ac, 'highpass', 7500, 0.8, v), t * 13);
}

function crash(ac: BaseAudioContext, t: number, dest: AudioNode, g = 1) {
  const v = gainTo(ac, dest, 0);
  env(v, t, 0.002, 0.22 * g, 1.6);
  noiseSrc(ac, t, 1.7, filter(ac, 'highpass', 4500, 0.5, v), t * 5);
}

function pad(ac: BaseAudioContext, chord: number[], t: number, dur: number, dest: AudioNode, bright: number, g = 1) {
  const lp = filter(ac, 'lowpass', 900 + bright * 700, 0.6, gainTo(ac, dest, 1));
  for (const n of [chord[0] - 12, ...chord]) {
    for (const det of [-8, 7]) {
      const v = gainTo(ac, lp, 0);
      const p = v.gain;
      p.setValueAtTime(0, t);
      p.linearRampToValueAtTime(0.045 * g, t + 0.25);
      p.setValueAtTime(0.045 * g, t + dur - 0.1);
      p.linearRampToValueAtTime(0, t + dur + 0.35);
      osc(ac, 'sawtooth', mtof(n), t, dur + 0.4, v, { detune: det });
    }
  }
}

function bassNote(ac: BaseAudioContext, n: number, t: number, dur: number, dest: AudioNode, g = 1) {
  const lp = filter(ac, 'lowpass', 420, 1.2, gainTo(ac, dest, 1));
  const v = gainTo(ac, lp, 0);
  env(v, t, 0.005, 0.5 * g, Math.max(0.08, dur * 0.9));
  osc(ac, 'sawtooth', mtof(n - 24), t, dur, v);
  const s = gainTo(ac, dest, 0);
  env(s, t, 0.005, 0.35 * g, Math.max(0.08, dur * 0.9));
  osc(ac, 'sine', mtof(n - 24), t, dur, s);
}

function pluck(ac: BaseAudioContext, f: number, t: number, dest: AudioNode, g = 1, decay = 0.28) {
  const lp = filter(ac, 'lowpass', 1800, 2, gainTo(ac, dest, 1));
  lp.frequency.setValueAtTime(4200, t);
  lp.frequency.exponentialRampToValueAtTime(700, t + decay);
  const v = gainTo(ac, lp, 0);
  env(v, t, 0.002, 0.22 * g, decay);
  osc(ac, 'triangle', f, t, decay + 0.05, v);
  const v2 = gainTo(ac, lp, 0);
  env(v2, t, 0.002, 0.06 * g, decay * 0.6);
  osc(ac, 'square', f, t, decay + 0.05, v2);
}

function lead(ac: BaseAudioContext, f: number, t: number, dur: number, dest: AudioNode, g = 1, box = false) {
  if (box) {
    // กล่องดนตรี: ไซน์ + โอเวอร์โทนสูง เสียงสั้นใส
    for (const [k, a, d] of [[1, 0.2, 1.4], [3.01, 0.05, 0.5], [5.2, 0.025, 0.25]] as const) {
      const v = gainTo(ac, dest, 0);
      env(v, t, 0.002, a * g, d);
      osc(ac, 'sine', f * 2 * k, t, d + 0.1, v);
    }
    return;
  }
  const v = gainTo(ac, dest, 0);
  const p = v.gain;
  p.setValueAtTime(0, t);
  p.linearRampToValueAtTime(0.13 * g, t + 0.03);
  p.setTargetAtTime(0.09 * g, t + 0.05, 0.1);
  p.setValueAtTime(0.09 * g, t + dur * 0.85);
  p.linearRampToValueAtTime(0, t + dur + 0.12);
  const o = osc(ac, 'triangle', f, t, dur + 0.15, v);
  const lfo = ac.createOscillator();
  lfo.frequency.value = 5.2;
  const lg = ac.createGain();
  lg.gain.value = f * 0.006;
  lfo.connect(lg).connect(o.frequency);
  lfo.start(t + 0.15);
  lfo.stop(t + dur + 0.15);
  const s = gainTo(ac, dest, 0);
  env(s, t, 0.02, 0.05 * g, dur);
  osc(ac, 'sine', f * 2, t, dur + 0.1, s);
}

function scheduleMusic(ac: BaseAudioContext, cut: Cut, b: Buses) {
  const list = bars(cut);
  const pump = b.music.gain;
  pump.setValueAtTime(1, 0);
  const rnd = rngFromKey('cozypet:v1:film:music');
  for (let i = 0; i < list.length; i++) {
    const { t, sec, idx, next, shot } = list[i];
    if (sec === 'none') continue;
    const prog = PROG[sec];
    const chord = prog[idx % prog.length];
    const e = ENERGY[sec];
    const first = i === 0 || list[i - 1].sec !== sec;
    const lastOfShot = i === list.length - 1 || list[i + 1].shot !== shot;
    const capture = !!shot.capture;
    const mg = capture ? 0.72 : 1;
    // แพด
    pad(ac, chord, t, BAR, b.music, e / 3, (sec === 'break' || sec === 'ballad' ? 1.1 : 0.85) * mg);
    // เบส
    if (e >= 1.4) {
      const pat = e >= 2.7 ? [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5] : e >= 1.9 ? [0, 0.75, 1.5, 2, 2.75, 3.5] : [0, 2];
      pat.forEach((bt, k) => bassNote(ac, chord[0] + (k === pat.length - 1 && e >= 2.7 ? 7 : 0), t + bt * BEAT, (e >= 2.7 ? 0.45 : 0.7) * BEAT, b.music, 0.9 * mg));
    } else if (sec === 'ballad' || sec === 'outro') bassNote(ac, chord[0], t, BAR * 0.95, b.music, 0.6);
    // อาร์เปจโจ
    if (e >= 1.4 && sec !== 'tense') {
      const notes = [...chord, chord[0] + 12, chord[1] + 12];
      const step = e >= 2.5 ? 0.25 : 0.5;
      for (let k = 0; k < 4 / step; k++) {
        const n = notes[(k * 2 + (k % 3)) % notes.length];
        pluck(ac, mtof(n + 12), t + k * step * BEAT, b.delaySend, (k % 4 === 0 ? 1 : 0.7) * mg * (e >= 2.5 ? 1 : 0.8));
      }
    }
    if (sec === 'tense') {
      // ตึงเครียด: โน้ตเดียวซ้ำแบบ 16th + พัลส์ต่ำ
      for (let k = 0; k < 16; k++) pluck(ac, mtof(chord[0] + 24), t + k * 0.25 * BEAT, b.delaySend, k % 4 === 0 ? 0.6 : 0.3, 0.12);
    }
    // ทำนองธีม
    if ((sec === 'hope' || sec === 'finale') && idx % 2 === 0) {
      for (const [bt, n, d] of THEME) if (bt < 8) lead(ac, mtof(12 + n), t + bt * BEAT, d * BEAT, b.delaySend, 0.9);
    }
    if ((sec === 'ballad' || sec === 'break' || sec === 'outro') && idx % 2 === 0) {
      for (const [bt, n, d] of THEME) lead(ac, mtof(12 + n), t + bt * BEAT, d * BEAT, b.revSend, sec === 'outro' ? 0.8 : 1, true);
    }
    // กลอง
    if (e >= 1.4) {
      const four = e >= 2.7;
      for (let k = 0; k < 4; k++) {
        const bt = t + k * BEAT;
        if (four || k === 0 || k === 2 || (e >= 1.9 && k === 3 && rnd() < 0.4)) {
          kick(ac, bt, b.drums, capture ? 0.8 : 1);
          // sidechain: เพลงยุบลงตามจังหวะกระเดื่อง
          pump.setValueAtTime(0.5, bt);
          pump.linearRampToValueAtTime(1, bt + 0.24);
        }
        if (e >= 1.9 && (k === 1 || k === 3)) snare(ac, bt, b.drums, capture ? 0.7 : 0.9);
        for (const h of e >= 2.5 ? [0, 0.25, 0.5, 0.75] : [0, 0.5]) hat(ac, bt + h * BEAT, b.drums, (h === 0.5 ? 0.9 : 0.55) * (capture ? 0.7 : 1), e >= 2.7 && h === 0.5);
      }
      if (first && e >= 2.5) crash(ac, t, b.drums, 1);
      // ฟิลกลองก่อนเข้าช่วงที่แรงกว่า
      if (lastOfShot && ENERGY[next] > e + 0.4) for (let k = 0; k < 8; k++) snare(ac, t + 3 * BEAT + k * 0.125 * BEAT, b.drums, 0.25 + k * 0.08, false);
    }
  }
  // จบเพลง: โน้ตสามตัวท้ายของธีม แล้วจาง
  const end = cut.duration;
  [[4, 0], [7, 0.5], [12, 1]].forEach(([n, bt]) => lead(ac, mtof(12 + n), end - 2.6 + bt * BEAT, 1.2, b.revSend, 0.9, true));
}

// ───────────────────────────── เสียงประกอบ

function sfx(ac: BaseAudioContext, ev: SceneSfx, t: number, b: Buses, purr: AudioBuffer | null) {
  const g = ev.gain ?? 0.5;
  const out = panTo(ac, b.sfx, ev.pan ?? 0);
  const n = ev.note ?? 0;
  const f = pentaHz(n);
  const dur = ev.dur ?? 0.4;
  const rv = gainTo(ac, b.revSend, 0.35);
  switch (ev.kind) {
    case 'pop': {
      const v = gainTo(ac, out, 0);
      env(v, t, 0.003, 0.5 * g, 0.14);
      osc(ac, 'sine', f * 0.75, t, 0.16, v, { to: f * 1.3, glide: 0.06 });
      v.connect(rv);
      break;
    }
    case 'tap': {
      const v = gainTo(ac, out, 0);
      env(v, t, 0.002, 0.35 * g, 0.07);
      osc(ac, 'triangle', f * 2, t, 0.08, v, { to: f * 1.6, glide: 0.06 });
      break;
    }
    case 'tick':
    case 'type': {
      const v = gainTo(ac, out, 0);
      env(v, t, 0.001, 0.3 * g, 0.035);
      osc(ac, 'square', ev.kind === 'type' ? 2600 : f * 4, t, 0.04, filter(ac, 'bandpass', 3000, 1.5, v));
      break;
    }
    case 'whoosh':
    case 'swish': {
      const d = ev.kind === 'swish' ? Math.min(dur, 0.3) : dur;
      const bp = filter(ac, 'bandpass', 400, 1.1);
      bp.frequency.setValueAtTime(350, t);
      bp.frequency.exponentialRampToValueAtTime(ev.kind === 'swish' ? 5000 : 3200, t + d * 0.7);
      bp.frequency.exponentialRampToValueAtTime(900, t + d);
      const v = gainTo(ac, out, 0);
      v.gain.setValueAtTime(0, t);
      v.gain.linearRampToValueAtTime(0.9 * g, t + d * 0.6);
      v.gain.linearRampToValueAtTime(0, t + d);
      bp.connect(v);
      v.connect(rv);
      noiseSrc(ac, t, d, bp, t * 11);
      break;
    }
    case 'riser': {
      const v = gainTo(ac, out, 0);
      v.gain.setValueAtTime(0.0001, t);
      v.gain.exponentialRampToValueAtTime(0.7 * g, t + dur);
      v.gain.linearRampToValueAtTime(0, t + dur + 0.05);
      const hp = filter(ac, 'highpass', 300, 0.8, v);
      hp.frequency.setValueAtTime(300, t);
      hp.frequency.exponentialRampToValueAtTime(6000, t + dur);
      noiseSrc(ac, t, dur, hp, t * 5);
      const s = gainTo(ac, out, 0);
      s.gain.setValueAtTime(0.0001, t);
      s.gain.exponentialRampToValueAtTime(0.12 * g, t + dur);
      s.gain.linearRampToValueAtTime(0, t + dur + 0.05);
      osc(ac, 'sawtooth', 180, t, dur, filter(ac, 'lowpass', 2500, 1, s), { to: 1400, glide: dur });
      v.connect(rv);
      break;
    }
    case 'impact': {
      const v = gainTo(ac, out, 0);
      env(v, t, 0.002, 1.0 * g, 1.1);
      osc(ac, 'sine', 90, t, 1.2, v, { to: 32, glide: 0.5 });
      const nz = gainTo(ac, out, 0);
      env(nz, t, 0.001, 0.6 * g, 0.5);
      noiseSrc(ac, t, 0.6, filter(ac, 'lowpass', 2500, 0.7, nz), t);
      nz.connect(gainTo(ac, b.revSend, 0.9));
      crash(ac, t, out, 0.8 * g);
      break;
    }
    case 'thud':
    case 'land': {
      const v = gainTo(ac, out, 0);
      env(v, t, 0.002, 0.75 * g, ev.kind === 'land' ? 0.35 : 0.28);
      osc(ac, 'sine', mtof(-12 + PENTA[n % 5]) * 0.5 + 40, t, 0.4, v, { to: 45, glide: 0.18 });
      const c = gainTo(ac, out, 0);
      env(c, t, 0.001, 0.3 * g, 0.05);
      noiseSrc(ac, t, 0.06, filter(ac, 'lowpass', 1800, 0.7, c), t);
      break;
    }
    case 'sparkle':
    case 'twinkle': {
      const r = rngFromKey(`cozypet:v1:film:sparkle:${t.toFixed(2)}`);
      const count = ev.kind === 'twinkle' ? 3 : 7;
      for (let i = 0; i < count; i++) {
        const v = gainTo(ac, panTo(ac, b.sfx, r() * 1.4 - 0.7), 0);
        const tt = t + i * 0.045 + r() * 0.02;
        env(v, tt, 0.002, 0.16 * g, 0.4);
        osc(ac, 'sine', pentaHz(10 + Math.floor(r() * 7)), tt, 0.45, v);
        v.connect(rv);
      }
      break;
    }
    case 'draw': {
      const v = gainTo(ac, out, 0);
      v.gain.setValueAtTime(0, t);
      v.gain.linearRampToValueAtTime(0.25 * g, t + 0.05);
      v.gain.linearRampToValueAtTime(0, t + dur);
      noiseSrc(ac, t, dur, filter(ac, 'bandpass', 5000, 3, v), t);
      const s = gainTo(ac, out, 0);
      env(s, t, 0.01, 0.08 * g, dur);
      osc(ac, 'sine', 700, t, dur, s, { to: 1400, glide: dur });
      break;
    }
    case 'glass':
    case 'chime': {
      const tones = ev.kind === 'chime' ? [0, 2, 4] : [0];
      tones.forEach((k, i) => {
        const ff = pentaHz(n + k + 5);
        for (const [m, a, d] of [[1, 0.22, 1.2], [2.76, 0.07, 0.6], [5.4, 0.03, 0.3]] as const) {
          const v = gainTo(ac, out, 0);
          env(v, t + i * 0.09, 0.002, a * g, d);
          osc(ac, 'sine', ff * m, t + i * 0.09, d + 0.1, v);
          v.connect(rv);
        }
      });
      break;
    }
    case 'drop': {
      const v = gainTo(ac, out, 0);
      env(v, t, 0.002, 0.45 * g, 0.12);
      osc(ac, 'sine', f * 1.6, t, 0.14, v, { to: f * 0.7, glide: 0.1 });
      break;
    }
    case 'zap': {
      const v = gainTo(ac, out, 0);
      env(v, t, 0.002, 0.2 * g, 0.2);
      osc(ac, 'sawtooth', f * 2, t, 0.22, filter(ac, 'bandpass', 2400, 2, v), { to: f * 0.6, glide: 0.18 });
      v.connect(rv);
      break;
    }
    case 'paper': {
      const r = rngFromKey(`cozypet:v1:film:paper:${t.toFixed(2)}`);
      const count = Math.floor(dur * 14);
      for (let i = 0; i < count; i++) {
        const tt = t + (i / count) * dur + r() * 0.05;
        const v = gainTo(ac, panTo(ac, b.sfx, r() * 1.6 - 0.8), 0);
        env(v, tt, 0.002, (0.08 + r() * 0.12) * g, 0.05 + r() * 0.06);
        noiseSrc(ac, tt, 0.12, filter(ac, 'bandpass', 2500 + r() * 3000, 1.2, v), tt * 3);
      }
      break;
    }
    case 'coin': {
      for (const [k, dt] of [[2, 0], [3, 0.07]] as const) {
        const v = gainTo(ac, out, 0);
        env(v, t + dt, 0.002, 0.22 * g, 0.35);
        osc(ac, 'square', f * k, t + dt, 0.4, filter(ac, 'lowpass', 5000, 1, v));
        v.connect(rv);
      }
      break;
    }
    case 'success': {
      [0, 4, 7, 12, 16].forEach((k, i) => {
        const v = gainTo(ac, out, 0);
        env(v, t + i * 0.07, 0.003, 0.22 * g, 0.5);
        osc(ac, 'triangle', mtof(12 + k), t + i * 0.07, 0.55, v);
        v.connect(rv);
      });
      sfx(ac, { at: 0, kind: 'sparkle', gain: g * 0.6 }, t + 0.3, b, purr);
      break;
    }
    case 'radar': {
      for (let i = 0; i < 3; i++) {
        const v = gainTo(ac, out, 0);
        env(v, t + i * 0.3, 0.002, (0.3 / (i + 1)) * g, 0.9);
        osc(ac, 'sine', 1320, t + i * 0.3, 1.0, v);
        v.connect(rv);
      }
      break;
    }
    case 'stamp': {
      sfx(ac, { at: 0, kind: 'thud', note: 0, gain: g }, t, b, purr);
      const c = gainTo(ac, out, 0);
      env(c, t, 0.001, 0.4 * g, 0.08);
      noiseSrc(ac, t, 0.1, filter(ac, 'bandpass', 3200, 1, c), t);
      break;
    }
    case 'clock': {
      const v = gainTo(ac, out, 0);
      env(v, t, 0.001, 0.35 * g, 0.03);
      noiseSrc(ac, t, 0.04, filter(ac, 'bandpass', n % 2 ? 2200 : 3200, 4, v), t);
      break;
    }
    case 'flip': {
      sfx(ac, { at: 0, kind: 'swish', gain: g * 0.6 }, t, b, purr);
      sfx(ac, { at: 0, kind: 'pop', note: n, gain: g * 0.8 }, t + 0.08, b, purr);
      break;
    }
    case 'read':
    case 'message': {
      const v = gainTo(ac, out, 0);
      env(v, t, 0.002, 0.3 * g, 0.12);
      osc(ac, 'sine', ev.kind === 'read' ? 1760 : 880, t, 0.14, v, { to: ev.kind === 'read' ? 2100 : 1320, glide: 0.05 });
      v.connect(rv);
      break;
    }
    case 'scan': {
      const bp = filter(ac, 'bandpass', 600, 4);
      bp.frequency.setValueAtTime(600, t);
      bp.frequency.exponentialRampToValueAtTime(4200, t + dur);
      const v = gainTo(ac, out, 0);
      env(v, t, 0.02, 0.25 * g, dur);
      bp.connect(v);
      noiseSrc(ac, t, dur, bp, t);
      break;
    }
    case 'shutter': {
      for (const [dt, ff, a] of [[0, 3200, 0.6], [0.07, 1400, 0.45], [0.11, 5200, 0.2]] as const) {
        const v = gainTo(ac, out, 0);
        env(v, t + dt, 0.001, a * g, 0.05);
        noiseSrc(ac, t + dt, 0.07, filter(ac, 'bandpass', ff, 0.7, v), t + dt);
      }
      break;
    }
    case 'flash': {
      const v = gainTo(ac, out, 0);
      env(v, t, 0.01, 0.06 * g, 0.4);
      osc(ac, 'sine', 3000, t, 0.45, v, { to: 6500, glide: 0.4 });
      break;
    }
    case 'purr': {
      if (!purr) break;
      const s = ac.createBufferSource();
      s.buffer = purr;
      s.loop = true;
      const v = gainTo(ac, out, 0);
      v.gain.setValueAtTime(0, t);
      v.gain.linearRampToValueAtTime(0.9 * g, t + 0.5);
      v.gain.setValueAtTime(0.9 * g, t + dur - 0.6);
      v.gain.linearRampToValueAtTime(0, t + dur);
      s.connect(v);
      s.start(t);
      s.stop(t + dur + 0.05);
      break;
    }
    case 'rain': {
      const v = gainTo(ac, out, 0);
      v.gain.setValueAtTime(0, t);
      v.gain.linearRampToValueAtTime(0.5 * g, t + 0.6);
      v.gain.setValueAtTime(0.5 * g, t + dur - 0.6);
      v.gain.linearRampToValueAtTime(0, t + dur);
      noiseSrc(ac, t, dur, filter(ac, 'highpass', 500, 0.5, filter(ac, 'lowpass', 4500, 0.5, v)), t);
      const r = rngFromKey('cozypet:v1:film:drops');
      for (let i = 0; i < dur * 18; i++) {
        const tt = t + r() * dur;
        const d = gainTo(ac, panTo(ac, b.sfx, r() * 2 - 1), 0);
        env(d, tt, 0.001, 0.08 * g, 0.03);
        osc(ac, 'sine', 1800 + r() * 2200, tt, 0.04, d, { to: 900, glide: 0.03 });
      }
      break;
    }
    case 'meow': {
      // เหมียวน่ารัก: sawtooth ผ่าน formant bandpass + vibrato (ไม่เลียนเสียงจริงจนตกใจ)
      const bp = filter(ac, 'bandpass', 900, 3);
      bp.frequency.setValueAtTime(800, t);
      bp.frequency.linearRampToValueAtTime(1250, t + 0.18);
      bp.frequency.linearRampToValueAtTime(850, t + 0.45);
      const v = gainTo(ac, out, 0);
      env(v, t, 0.03, 0.35 * g, 0.45);
      bp.connect(v);
      osc(ac, 'sawtooth', 520, t, 0.5, bp, { to: 760, glide: 0.18 }).frequency.linearRampToValueAtTime(540, t + 0.48);
      v.connect(rv);
      break;
    }
    case 'yawn': {
      const bp = filter(ac, 'bandpass', 700, 2);
      const v = gainTo(ac, out, 0);
      env(v, t, 0.08, 0.18 * g, 0.7);
      bp.connect(v);
      const o = osc(ac, 'sawtooth', 380, t, 0.8, bp, { to: 620, glide: 0.35 });
      o.frequency.linearRampToValueAtTime(330, t + 0.78);
      break;
    }
    case 'steps': {
      const v = gainTo(ac, out, 0);
      env(v, t, 0.003, 0.4 * g, 0.12);
      osc(ac, 'sine', n % 2 ? 95 : 110, t, 0.14, v, { to: 60 });
      const c = gainTo(ac, out, 0);
      env(c, t, 0.002, 0.18 * g, 0.06);
      noiseSrc(ac, t, 0.08, filter(ac, 'lowpass', 900, 0.7, c), t);
      break;
    }
    case 'af': {
      const v = gainTo(ac, out, 0);
      v.gain.setValueAtTime(0, t);
      v.gain.linearRampToValueAtTime(0.05 * g, t + 0.05);
      v.gain.linearRampToValueAtTime(0, t + dur);
      osc(ac, 'square', 180, t, dur, filter(ac, 'lowpass', 1200, 1, v), { to: 260, glide: dur });
      break;
    }
    case 'beep': {
      for (const dt of [0, 0.09]) {
        const v = gainTo(ac, out, 0);
        env(v, t + dt, 0.002, 0.18 * g, 0.05);
        osc(ac, 'sine', 2350, t + dt, 0.06, v);
      }
      break;
    }
    case 'sniff': {
      for (const dt of [0, 0.11]) {
        const v = gainTo(ac, out, 0);
        v.gain.setValueAtTime(0, t + dt);
        v.gain.linearRampToValueAtTime(0.4 * g, t + dt + 0.05);
        v.gain.linearRampToValueAtTime(0, t + dt + 0.09);
        noiseSrc(ac, t + dt, 0.1, filter(ac, 'bandpass', 2400, 1.5, v), t + dt);
      }
      break;
    }
    case 'ambience': {
      const v = gainTo(ac, b.amb, 0);
      v.gain.setValueAtTime(0, t);
      v.gain.linearRampToValueAtTime(0.4 * g, t + 1.5);
      v.gain.setValueAtTime(0.4 * g, t + dur - 1);
      v.gain.linearRampToValueAtTime(0, t + dur);
      const lp = filter(ac, 'lowpass', 500, 0.5, v);
      noiseSrc(ac, t, dur, lp, 0.3);
      const lfo = ac.createOscillator();
      lfo.frequency.value = 0.15;
      const lg = ac.createGain();
      lg.gain.value = 200;
      lfo.connect(lg).connect(lp.frequency);
      lfo.start(t);
      lfo.stop(t + dur);
      const r = rngFromKey('cozypet:v1:film:birds');
      for (let i = 0; i < 9; i++) {
        const tt = t + 0.8 + r() * (dur - 2);
        for (let k = 0; k < 2 + Math.floor(r() * 3); k++) {
          const bv = gainTo(ac, panTo(ac, b.amb, r() * 1.6 - 0.8), 0);
          const t2 = tt + k * 0.12;
          env(bv, t2, 0.005, 0.05 * g, 0.08);
          osc(ac, 'sine', 3200 + r() * 1800, t2, 0.1, bv, { to: 2600 + r() * 2400, glide: 0.08 });
        }
      }
      break;
    }
  }
}

/** เสียงจาก cue ของภาพอัดจริง (แตะ พิมพ์ ผลลัพธ์) ตามเวลาที่จัดใหม่ในช็อต */
function captureEvents(shot: Shot, ctx: FilmContext): SceneSfx[] {
  const meta = shot.capture ? ctx.captures[shot.capture] : undefined;
  if (!meta || !shot.anchors) return [];
  const segs = buildSegments(meta, shot.anchors);
  const ev: SceneSfx[] = [];
  const MARK: Record<string, SceneSfx['kind']> = { result: 'chime', done: 'success', celebrate: 'success', arrived: 'success', kpis: 'chime', paid: 'coin', 'reply-1': 'message', 'reply-2': 'message', read: 'read', switched: 'swish', scan: 'scan', 'micro-done-50': 'coin', 'micro-done-100': 'coin', popup: 'pop', 'why-open': 'pop', sheet: 'swish', results: 'radar' };
  let n = 0;
  for (const c of meta.cues) {
    const at = shotTime(segs, c.t);
    if (at === null || at < 0 || at > shot.dur) continue;
    if (c.type === 'tap') ev.push({ at, kind: 'tap', note: (n++ % 5) + 3, gain: 0.45 });
    else if (c.type === 'type') for (let k = 0; k < 18; k++) ev.push({ at: at + k * 0.075, kind: 'type', gain: 0.12 });
    else if (c.type === 'mark' && c.label && MARK[c.label]) ev.push({ at, kind: MARK[c.label], note: 4, gain: 0.5, dur: c.label === 'scan' ? 1.4 : undefined });
  }
  return ev;
}

function transitionEvents(shot: Shot): SceneSfx[] {
  switch (shot.transitionIn) {
    case 'paw': return [{ at: -0.1, kind: 'swish', gain: 0.5 }, { at: 0.2, kind: 'pop', note: 5, gain: 0.45 }];
    case 'flyIn': return [{ at: 0, kind: 'whoosh', dur: 0.6, gain: 0.45 }];
    case 'mapIn':
    case 'boxIn': return [{ at: 0, kind: 'whoosh', dur: 1.0, gain: 0.5 }];
    default: return [];
  }
}

export async function renderAudioBase64(cut: Cut, ctx: FilmContext): Promise<string> {
  const info = await renderAudio(cut, ctx);
  return JSON.stringify(info);
}

/** เรนเดอร์เสียงทั้งเรื่อง เก็บ PCM 16-bit ไว้ให้ดึงทีละก้อนด้วย audioChunk() */
export async function renderAudio(cut: Cut, ctx: FilmContext): Promise<{ sampleRate: number; channels: number; frames: number; chunks: number }> {
  const frames = Math.ceil((cut.duration + 0.5) * SR);
  const ac = new OfflineAudioContext(2, frames, SR);
  const master = ac.createGain();
  master.gain.value = 0.9;
  const comp = ac.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.knee.value = 8;
  comp.ratio.value = 3;
  comp.attack.value = 0.005;
  comp.release.value = 0.2;
  master.connect(comp).connect(ac.destination);
  const reverb = ac.createConvolver();
  reverb.buffer = impulse(ac, 2.6, 3.2);
  const revOut = gainTo(ac, master, 0.35);
  reverb.connect(revOut);
  const revSend = gainTo(ac, reverb, 1);
  const delay = ac.createDelay(2);
  delay.delayTime.value = BEAT * 0.75;
  const fb = gainTo(ac, delay, 0.32);
  delay.connect(fb);
  const delayOut = gainTo(ac, master, 0.3);
  delay.connect(delayOut);
  delay.connect(gainTo(ac, reverb, 0.3));
  const music = gainTo(ac, master, 0.5);
  const delaySend = gainTo(ac, music, 1);
  delaySend.connect(delay);
  music.connect(gainTo(ac, reverb, 0.25));
  const drums = gainTo(ac, master, 0.55);
  const sfxBus = gainTo(ac, master, 0.8);
  const amb = gainTo(ac, master, 0.6);
  const b: Buses = { music, drums, sfx: sfxBus, amb, reverb, delay, delaySend, revSend };

  let purr: AudioBuffer | null = null;
  try {
    const res = await fetch('/audio/cat-purr.wav');
    purr = await ac.decodeAudioData(await res.arrayBuffer());
  } catch {
    purr = null;
  }

  scheduleMusic(ac, cut, b);
  for (const shot of cut.shots) {
    const evs: SceneSfx[] = [...transitionEvents(shot)];
    if (shot.scene) evs.push(...(SCENES[shot.scene].sfx?.(shot, ctx) ?? []));
    if (shot.capture) evs.push(...captureEvents(shot, ctx));
    for (const ev of evs) {
      const t = shot.start + ev.at;
      if (t < 0 || t > cut.duration) continue;
      sfx(ac, ev, t, b, purr);
    }
  }
  const buf = await ac.startRendering();
  const L = buf.getChannelData(0);
  const R = buf.getChannelData(1);
  const pcm = new Int16Array(buf.length * 2);
  for (let i = 0; i < buf.length; i++) {
    pcm[i * 2] = Math.max(-1, Math.min(1, L[i])) * 32767;
    pcm[i * 2 + 1] = Math.max(-1, Math.min(1, R[i])) * 32767;
  }
  lastPcm = pcm;
  return { sampleRate: SR, channels: 2, frames: buf.length, chunks: Math.ceil(pcm.length / CHUNK) };
}

/** PCM ก้อนที่ i (base64 ของ int16 little-endian สลับซ้าย/ขวา) */
export function audioChunk(i: number): string {
  if (!lastPcm) return '';
  const part = lastPcm.subarray(i * CHUNK, Math.min(lastPcm.length, (i + 1) * CHUNK));
  const bytes = new Uint8Array(part.buffer, part.byteOffset, part.byteLength);
  let s = '';
  for (let k = 0; k < bytes.length; k += 0x8000) s += String.fromCharCode(...bytes.subarray(k, k + 0x8000));
  return btoa(s);
}
