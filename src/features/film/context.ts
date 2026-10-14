import type { FilmMessages } from '@/i18n/film-th';
import type { CaptureIndex } from './capture';
import type { CaptionKey, Shot } from './cuts';

export interface TeamMember { no?: number; fullNameTh?: string; fullNameEn?: string; studentId?: string; role?: string }
export interface TeamInfo { teamName?: string; teamNameEn?: string; projectName?: string; siteUrl?: string; members?: TeamMember[]; stat?: { value: number; label: string; labelEn?: string; source: string } }

export interface FilmFacts {
  /** ผู้รับดูแลอันดับ 1 ตอนอัด (C3) */
  name: string;
  /** {sim} จาก /insights seed เริ่มต้น */
  sim: number;
  /** ผู้ช่วยสรุปใช้ AI จริงหรือกฎคำสำคัญ */
  assistAi: boolean;
  chatAi: boolean;
  /** ช็อต C1 เข้าสู่ระบบจริงหรือทดลอง Demo */
  login: boolean;
  pct: number;
  weights: { space: number; distance: number; urgency: number };
  /** ภาพบ้านของผู้รับเลี้ยงในฉากจบ */
  homeId: string;
  /** จำนวนเคสในการจำลอง 30 วัน (seed เริ่มต้นของ /insights) */
  cases: number;
  /** ครั้งที่ต้องโทรหาที่รับ: แบบเดิม → Smart Load Balancer (การจำลองเดียวกัน) */
  calls: { before: number; after: number };
  /** สถิติจริงที่ทีมใส่เองพร้อมแหล่งอ้างอิง (team.local.json → stat) — ถ้าไม่มีใช้ตัวเลขจากการจำลอง */
  stat?: { value: number; label: string; source: string };
}

export interface FilmContext {
  locale: 'th' | 'en';
  fm: FilmMessages;
  /** ซับอังกฤษในไฟล์ไทย (null ในไฟล์อังกฤษ) */
  sub: FilmMessages | null;
  facts: FilmFacts;
  team: TeamInfo | null;
  captures: CaptureIndex;
  record: boolean;
}

export interface SceneProps { t: number; dur: number; shot: Shot; ctx: FilmContext }

export function fill(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_, k: string) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`));
}

export function captionVars(ctx: FilmContext): Record<string, string | number> {
  return { name: ctx.facts.name, sim: ctx.facts.sim, pct: ctx.facts.pct, space: ctx.facts.weights.space, distance: ctx.facts.weights.distance, urgency: ctx.facts.weights.urgency };
}

/** ข้อความของคำบรรยาย (เลือกแบบ AI/ไม่ใช้ AI ตามข้อเท็จจริงตอนอัด) */
export function captionText(fm: FilmMessages, key: CaptionKey, ctx: FilmContext): { main: string; sub: string; card?: string } {
  const s = fm.shots;
  const pick = (() => {
    switch (key) {
      case 'assist': return ctx.facts.assistAi ? s.assistAi : s.assistRules;
      case 'chat': return ctx.facts.chatAi ? s.chatAi : s.chatDemo;
      case 'demo': return ctx.facts.login ? s.login : s.demo;
      default: return s[key];
    }
  })() as { main: string; sub: string; card?: string };
  const v = captionVars(ctx);
  return { main: fill(pick.main, v), sub: fill(pick.sub, v), card: pick.card ? fill(pick.card, v) : undefined };
}
