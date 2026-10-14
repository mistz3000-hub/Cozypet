import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import { FilmPage } from '@/features/film/FilmPage';
import type { TeamInfo } from '@/features/film/context';

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

/** ข้อมูลทีมจาก team.local.json (อ่านในเครื่องเท่านั้น บน Vercel ไม่มีไฟล์ → แสดง [[ต้องเติม]]) — ไม่ส่งรหัสนักศึกษาเว้นแต่รันในเครื่อง */
function readTeam(): TeamInfo | null {
  if (process.env.VERCEL) return null;
  try {
    const raw = JSON.parse(readFileSync(path.join(process.cwd(), 'team.local.json'), 'utf8')) as TeamInfo;
    return raw;
  } catch {
    return null;
  }
}

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined));
  const locale = one('locale') === 'en' ? 'en' : 'th';
  return <FilmPage cutId={one('cut') ?? 'demo'} locale={locale} record={one('record') === '1'} team={readTeam()} />;
}
