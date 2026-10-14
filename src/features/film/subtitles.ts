/** ซับไตเติล .srt จาก cue sheet เดียวกับคำบรรยายบนจอ (DEMO_VIDEO.md หัวข้อ 8) */
import type { FilmMessages } from '@/i18n/film-th';
import { captionText, fill, type FilmContext } from './context';
import type { Cut } from './cuts';
import { srtTime } from './timeline';
import type { VoTrack } from './vo';

export interface SubtitleLine { start: number; end: number; text: string }
const plain = (s: string) => s.replace(/\*\*/g, '');

/** ข้อความในฉากเล่าเรื่องที่ไม่ได้อยู่ใน shot.captions */
function sceneLines(fm: FilmMessages, scene: string, variant: string | undefined, start: number, dur: number, ctx: FilmContext): SubtitleLine[] {
  const L = (a: number, b: number, text: string): SubtitleLine => ({ start: start + a, end: start + Math.min(b, dur), text });
  switch (scene) {
    case 'cold':
      return [L(2.0, 5.0, fm.cold.line), L(10.3, 11.5, fm.cold.snap)];
    case 'logo':
      return [L(1.2, dur - 0.1, `Cozypet — ${fm.logo.tagline}`)];
    case 'problems':
      return variant === 'single'
        ? [L(0.1, dur - 0.1, fm.problems.items.join(' · '))]
        : fm.problems.items.map((it, i) => L(0.15 + i * (dur / 3), (i + 1) * (dur / 3) + (i === 2 ? 0 : 0.2), it));
    case 'impact':
      return [L(0.2, dur - 0.1, `${fm.impact.pillars.join(' · ')} — ${fill(fm.impact.kpi, { sim: ctx.facts.sim })} (${fm.impact.kpiNote})`)];
    case 'team':
      return [L(0.3, dur - 0.1, ctx.team?.teamName ?? fm.team.title)];
    case 'closing':
      return [L(0.1, dur - 0.2, fm.closing.lines.join(' · '))];
    default:
      return [];
  }
}

export function buildSubtitles(cut: Cut, ctx: FilmContext, voice: VoTrack | null = null): SubtitleLine[] {
  const fm = ctx.fm;
  const out: SubtitleLine[] = [];
  // มีเสียงพากย์ภาษาเดียวกับไฟล์ → ซับคือบทพากย์ (ตรงกับเสียงที่ได้ยิน) + เสียงสำคัญ
  if (voice && voice.lang === ctx.locale) {
    for (const l of voice.lines) out.push({ start: l.start, end: l.start + l.dur + 0.2, text: fill(fm.vo[l.key as keyof FilmMessages['vo']], { sim: ctx.facts.sim }) });
    for (const shot of cut.shots) for (const snd of shot.sounds ?? []) out.push({ start: shot.start + snd.at, end: shot.start + snd.to, text: fm.sounds[snd.key] });
    return out.sort((a, b) => a.start - b.start);
  }
  for (const shot of cut.shots) {
    if (shot.scene) out.push(...sceneLines(fm, shot.scene, shot.variant, shot.start, shot.dur, ctx));
    if (shot.scene === 'team' && shot.variant === 'withClosing') out.push(...sceneLines(fm, 'closing', undefined, shot.start + shot.dur - 2.6, 2.6, ctx));
    for (const c of shot.captions ?? []) {
      const t = captionText(fm, c.key, ctx);
      out.push({ start: shot.start + c.at, end: shot.start + c.to, text: t.sub ? `${plain(t.main)}\n${t.sub}` : plain(t.main) });
    }
    for (const snd of shot.sounds ?? []) out.push({ start: shot.start + snd.at, end: shot.start + snd.to, text: fm.sounds[snd.key] });
  }
  return out.sort((a, b) => a.start - b.start);
}

export function toSrt(lines: SubtitleLine[]): string {
  return lines.map((l, i) => `${i + 1}\n${srtTime(l.start)} --> ${srtTime(l.end)}\n${l.text}\n`).join('\n');
}
