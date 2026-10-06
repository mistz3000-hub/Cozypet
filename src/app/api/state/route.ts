import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabase } from '@/server/supabase/server';
import { authError, readJson } from '@/server/supabase/route';
import { SYNC_KEYS, MAX_SYNC_BYTES, type StoreKey } from '@/lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({ key: z.enum(SYNC_KEYS as [StoreKey, ...StoreKey[]]), value: z.unknown() });

/** อ่านข้อมูลทดลองทั้งหมดของบัญชี (RLS: เห็นเฉพาะของตัวเอง) — ไม่ log เนื้อหา */
export async function GET() {
  const supabase = await getSupabase();
  if (!supabase) return authError('disabled', 503);
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return authError('unauthorized', 401);
  const { data, error } = await supabase.from('user_state').select('key, value, updated_at').eq('user_id', u.user.id);
  if (error) {
    console.error('[cozypet] state_get:error');
    return authError('unavailable', 503);
  }
  const state: Record<string, unknown> = {};
  for (const row of data ?? []) state[row.key as string] = row.value;
  return NextResponse.json({ state }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function PUT(req: Request) {
  const supabase = await getSupabase();
  if (!supabase) return authError('disabled', 503);
  const parsed = Body.safeParse(await readJson(req));
  if (!parsed.success || parsed.data.value === undefined) return authError('bad_input');
  if (JSON.stringify(parsed.data.value).length > MAX_SYNC_BYTES) return authError('bad_input', 413);
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return authError('unauthorized', 401);
  const { error } = await supabase.from('user_state').upsert({ user_id: u.user.id, key: parsed.data.key, value: parsed.data.value });
  if (error) {
    console.error('[cozypet] state_put:error');
    return authError('unavailable', 503);
  }
  return NextResponse.json({ ok: true });
}
