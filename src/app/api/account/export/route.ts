import { NextResponse } from 'next/server';
import { getSupabase } from '@/server/supabase/server';
import { authError } from '@/server/supabase/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** ดาวน์โหลดข้อมูลของฉัน (JSON) — โปรไฟล์ + ข้อมูลทดลองในบัญชี */
export async function GET() {
  const supabase = await getSupabase();
  if (!supabase) return authError('disabled', 503);
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return authError('unauthorized', 401);
  const [{ data: profile }, { data: state }] = await Promise.all([
    supabase.from('profiles').select('display_name, avatar_url, locale, run_number, mascot, created_at, updated_at').eq('id', u.user.id).maybeSingle(),
    supabase.from('user_state').select('key, value, updated_at').eq('user_id', u.user.id),
  ]);
  const body = {
    exportedAt: new Date().toISOString(),
    note: 'Cozypet prototype — ข้อมูลทดลองทั้งหมดเป็นข้อมูลจำลอง',
    account: { email: u.user.email ?? null, providers: u.user.app_metadata?.providers ?? [] },
    profile,
    state,
  };
  return new NextResponse(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': 'attachment; filename="cozypet-my-data.json"',
      'Cache-Control': 'no-store',
    },
  });
}
