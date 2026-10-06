import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabase } from '@/server/supabase/server';
import { authError, authRateOk, mapAuthError, readJson } from '@/server/supabase/route';

export const runtime = 'nodejs';
const Body = z.object({ email: z.string().trim().email().max(254), password: z.string().min(1).max(200) });

export async function POST(req: Request) {
  const supabase = await getSupabase();
  if (!supabase) return authError('disabled', 503);
  if (!authRateOk(req)) return authError('rate', 429);
  const parsed = Body.safeParse(await readJson(req));
  if (!parsed.success) return authError('invalid');
  try {
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) {
      const code = mapAuthError(error);
      console.error(`[cozypet] auth_login:${code}`);
      return authError(code, code === 'rate' ? 429 : code === 'unavailable' ? 503 : 400);
    }
    return NextResponse.json({ ok: true });
  } catch {
    console.error('[cozypet] auth_login:unavailable');
    return authError('unavailable', 503);
  }
}
