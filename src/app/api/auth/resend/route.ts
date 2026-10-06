import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabase } from '@/server/supabase/server';
import { siteUrl } from '@/server/supabase/config';
import { authError, authRateOk, mapAuthError, readJson } from '@/server/supabase/route';

export const runtime = 'nodejs';
const Body = z.object({ email: z.string().trim().email().max(254) });

export async function POST(req: Request) {
  const supabase = await getSupabase();
  if (!supabase) return authError('disabled', 503);
  if (!authRateOk(req)) return authError('rate', 429);
  const parsed = Body.safeParse(await readJson(req));
  if (!parsed.success) return authError('bad_input');
  const { error } = await supabase.auth.resend({ type: 'signup', email: parsed.data.email, options: { emailRedirectTo: `${siteUrl()}/auth/callback?next=/start` } });
  if (error && mapAuthError(error) === 'rate') return authError('rate', 429);
  // ตอบเหมือนกันทุกกรณี (ไม่บอกว่าอีเมลมีอยู่หรือไม่)
  return NextResponse.json({ ok: true });
}
