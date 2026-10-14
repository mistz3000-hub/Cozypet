/** แผนบทพากย์จาก cut + ข้อความใน film-*.ts (DEMO_VIDEO.md หัวข้อ 8, D33) */
import type { FilmMessages } from '@/i18n/film-th';
import { fill, type FilmContext } from './context';
import type { Cut, VoKey } from './cuts';

export interface VoLine { key: VoKey; text: string; start: number; maxDur: number; shot: string }
export interface VoTrack { lang: 'th' | 'en'; synthetic: boolean; lines: { key: string; start: number; dur: number }[] }

export function voPlan(cut: Cut, fm: FilmMessages, ctx: FilmContext): VoLine[] {
  const cues = cut.shots.flatMap((s) => (s.vo ?? []).map((v) => ({ key: v.key, start: s.start + v.at, shotEnd: s.start + s.dur, shot: s.id })));
  return cues.map((c, i) => {
    const next = cues[i + 1]?.start ?? cut.duration;
    const limit = Math.min(next - 0.2, c.shotEnd + 0.6, cut.duration - 0.3);
    return { key: c.key, text: fill(fm.vo[c.key], { sim: ctx.facts.sim }), start: Math.round(c.start * 1000) / 1000, maxDur: Math.round((limit - c.start) * 1000) / 1000, shot: c.shot };
  });
}
