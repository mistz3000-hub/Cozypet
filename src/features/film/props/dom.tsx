/**
 * ชิ้นส่วน DOM ของวิดีโอ (ข้อความไทยอยู่ใน DOM เสมอ): ตัวเลขวิ่ง (odometer), ข้อความเคลื่อนไหวทีละคำ, ข้อความสุ่มตัวอักษรก่อนนิ่ง
 * ทุกชิ้นเป็นฟังก์ชันของเวลา t จึงเรนเดอร์ทีละเฟรมได้ตรงกันทุกครั้ง
 */
import type { CSSProperties, ReactNode } from 'react';
import { clamp, ease, prog } from '../timeline';
import s from './props.module.css';

/** ตัวเลขวิ่งแบบ odometer: นับจาก from ถึง value ในช่วง [at, at+dur] */
export function Counter({ t, at, dur, value, from = 0, locale, className, style, suffix }: { t: number; at: number; dur: number; value: number; from?: number; locale: 'th' | 'en'; className?: string; style?: CSSProperties; suffix?: ReactNode }) {
  const k = ease.expoOut(prog(t, at, at + dur));
  const v = from + (value - from) * k;
  const final = Math.round(value);
  const digits = String(final).length;
  const speed = k < 1 ? (value - from) / dur * (1 - k) : 0;
  const groups = locale === 'th' || locale === 'en';
  const cols: ReactNode[] = [];
  for (let p = digits - 1; p >= 0; p--) {
    const place = 10 ** p;
    // แบบมาตรวัดจริง: หลักสูงขยับเฉพาะตอนหลักต่ำกำลังข้ามจาก 9 ไป 0
    const base = Math.floor(v / place) % 10;
    const roll = p === 0 ? v % 1 : clamp((v % place) - (place - 1), 0, 1);
    const df = k >= 1 ? Math.floor(final / place) % 10 : base + roll;
    const blur = clamp((speed / place) / 40, 0, 1) * 6;
    cols.push(
      <span key={p} className={s.digit} style={{ filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : undefined }}>
        <span className={s.strip} style={{ transform: `translateY(${((-df / 11) * 100).toFixed(3)}%)` }}>
          {'01234567890'.split('').map((d, i) => <span key={i}>{d}</span>)}
        </span>
      </span>,
    );
    if (groups && p > 0 && p % 3 === 0) cols.push(<span key={`c${p}`} className={s.comma}>,</span>);
  }
  return (
    <span className={[s.counter, className].filter(Boolean).join(' ')} style={style} aria-label={final.toLocaleString(locale === 'th' ? 'th-TH' : 'en-US')}>
      {cols}
      {suffix}
    </span>
  );
}

const seg = typeof Intl !== 'undefined' && 'Segmenter' in Intl ? new Intl.Segmenter('th', { granularity: 'word' }) : null;

/** แยกคำ (ภาษาไทยไม่มีช่องว่าง ใช้ Intl.Segmenter) */
export function words(text: string): string[] {
  if (!seg) return text.split(/(\s+)/);
  return Array.from(seg.segment(text), (x) => x.segment);
}

/** ข้อความโผล่ทีละคำจากใต้หน้ากาก (หรือจากเบลอ) — highlight = ทั้งวลีเป็นกล่องสีทองก้อนเดียว */
export function Kinetic({ text, t, at, out, stagger = 0.06, className, style, highlight, from = 'below' }: { text: string; t: number; at: number; out?: number; stagger?: number; className?: string; style?: CSSProperties; highlight?: boolean; from?: 'below' | 'blur' }) {
  const ws = words(text);
  const outK = out !== undefined ? ease.in(prog(t, out, out + 0.3)) : 0;
  const anim = (a: number): CSSProperties => {
    const p = from === 'blur' ? ease.out(prog(t, a, a + 0.45)) : ease.backOut(prog(t, a, a + 0.42));
    if (from === 'blur') return { opacity: clamp(p) * (1 - outK), filter: `blur(${((1 - p) * 14 + outK * 10).toFixed(1)}px)`, transform: `scale(${(1.25 - 0.25 * p).toFixed(3)})` };
    return { opacity: p <= 0.001 || outK >= 0.999 ? 0 : 1, transform: `translateY(${((1 - p) * 140 - outK * 140).toFixed(1)}%)` };
  };
  if (highlight) {
    // วลีไฮไลต์: กล่องทองขยายจากซ้าย แล้วคำโผล่ทีละคำในกล่อง
    // กล่องขยายตามจังหวะคำที่โผล่ (ไม่วิ่งนำจนเห็นกล่องว่าง)
    const nWords = ws.filter((w) => !/^\s+$/.test(w)).length;
    const box = ease.out(prog(t, at, at + Math.max(0.3, nWords * stagger + 0.3)));
    let j = 0;
    return (
      <span className={[s.hiWrap, className].filter(Boolean).join(' ')} style={style}>
        <span className={s.hiBox} style={{ transform: `scaleX(${box.toFixed(3)})`, opacity: (box > 0.001 ? 1 : 0) * (1 - outK) }} />
        {ws.map((w, idx) => (/^\s+$/.test(w) ? <span key={idx}>{w}</span> : (
          <span key={idx} className={s.mask}><span style={{ display: 'inline-block', ...anim(at + 0.05 + stagger * j++) }}>{w}</span></span>
        )))}
      </span>
    );
  }
  let i = 0;
  return (
    <span className={[s.kinetic, className].filter(Boolean).join(' ')} style={style}>
      {ws.map((w, idx) => (/^\s+$/.test(w) ? <span key={idx}>{w}</span> : (
        <span key={idx} className={s.mask}><span style={{ display: 'inline-block', ...anim(at + stagger * i++) }}>{w}</span></span>
      )))}
    </span>
  );
}

/** ข้อความมีไฮไลต์ด้วยเครื่องหมาย **…** (เช่นคำบรรยายของช็อตแอป) — ส่วนธรรมดาโผล่ทีละคำ ส่วนไฮไลต์เป็นกล่องทอง */
export function RichKinetic({ text, t, at, stagger = 0.05, className }: { text: string; t: number; at: number; stagger?: number; className?: string }) {
  const parts = text.split('**');
  const starts = parts.reduce<number[]>((acc, p, i) => [...acc, (acc[i - 1] ?? at) + (i ? words(parts[i - 1]).filter((w) => !/^\s+$/.test(w)).length * stagger + 0.05 : 0)], []);
  return (
    <span className={className}>
      {parts.map((p, i) => {
        if (!p) return null;
        return i % 2 === 1 ? <Kinetic key={i} text={p} t={t} at={starts[i]} stagger={stagger} highlight /> : <Kinetic key={i} text={p} t={t} at={starts[i]} stagger={stagger} />;
      })}
    </span>
  );
}

/** ตัดเครื่องหมายไฮไลต์ออก (ใช้กับซับ .srt และคำแปล) */
export const plain = (s: string) => s.replace(/\*\*/g, '');

const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#/+*';

/** ข้อความสุ่มตัวอักษรก่อนนิ่ง (ใช้กับตัวอักษรละติน/ตัวเลขใน HUD) */
export function Scramble({ text, t, at, dur = 0.6 }: { text: string; t: number; at: number; dur?: number }) {
  const k = prog(t, at, at + dur);
  if (k <= 0) return <span style={{ opacity: 0 }}>{text}</span>;
  const n = Math.floor(text.length * k);
  const f = Math.floor(t * 30);
  const out = text.split('').map((ch, i) => {
    if (i < n || ch === ' ' || k >= 1) return ch;
    const h = Math.abs(Math.sin((f + 1) * 12.9898 + i * 78.233) * 43758.5453) % 1;
    return GLYPHS[Math.floor(h * GLYPHS.length)];
  });
  return <span>{out.join('')}</span>;
}
