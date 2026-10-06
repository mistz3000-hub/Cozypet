import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabase } from '@/server/supabase/server';
import { authError, authRateOk, mapAuthError, readJson } from '@/server/supabase/route';

export const runtime = 'nodejs';
const Body = z.object({ password: z.string().min(8).max(200).regex(/[A-Za-z]/).regex(/\d/) });

export async function POST(req: Request) {
  const supabase = await getSupabase();
  if (!supabase) return authError('disabled', 503);
  if (!authRateOk(req)) return authError('rate', 429);
  const parsed = Body.safeParse(await readJson(req));
  if (!parsed.success) return authError('weak');
  const { data } = await supabase.auth.getUser();
  if (!data.user) return authError('unauthorized', 401);
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return authError(mapAuthError(error));
  return NextResponse.json({ ok: true });
}
