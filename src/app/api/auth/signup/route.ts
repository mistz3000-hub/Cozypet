import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabase } from '@/server/supabase/server';
import { siteUrl } from '@/server/supabase/config';
import { authError, authRateOk, mapAuthError, readJson } from '@/server/supabase/route';

export const runtime = 'nodejs';
const Body = z.object({
  displayName: z.string().trim().min(1).max(40),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(200).regex(/[A-Za-z]/).regex(/\d/),
  accept: z.literal(true),
});

export async function POST(req: Request) {
  const supabase = await getSupabase();
  if (!supabase) return authError('disabled', 503);
  if (!authRateOk(req)) return authError('rate', 429);
  const parsed = Body.safeParse(await readJson(req));
  if (!parsed.success) return authError('bad_input');
  const { displayName, email, password } = parsed.data;
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName }, emailRedirectTo: `${siteUrl()}/auth/callback?next=/start` },
    });
    if (error) {
      const code = mapAuthError(error);
      console.error(`[cozypet] auth_signup:${code}`);
      return authError(code, code === 'rate' ? 429 : code === 'unavailable' ? 503 : 400);
    }
    // ไม่มี session = ต้องยืนยันอีเมลก่อน (ถ้าเปิดไว้)
    return NextResponse.json({ ok: true, confirm: !data.session });
  } catch {
    console.error('[cozypet] auth_signup:unavailable');
    return authError('unavailable', 503);
  }
}
