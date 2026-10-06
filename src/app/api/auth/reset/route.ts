import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabase } from '@/server/supabase/server';
import { passwordResetEnabled, siteUrl } from '@/server/supabase/config';
import { authError, authRateOk, readJson } from '@/server/supabase/route';

export const runtime = 'nodejs';
const Body = z.object({ email: z.string().trim().email().max(254) });

/** ขอลิงก์ตั้งรหัสผ่านใหม่ — เปิดเฉพาะ AUTH_PASSWORD_RESET_ENABLED=true (ต้องมี SMTP ฟรีของตัวเอง) */
export async function POST(req: Request) {
  const supabase = await getSupabase();
  if (!supabase || !passwordResetEnabled()) return authError('disabled', 503);
  if (!authRateOk(req)) return authError('rate', 429);
  const parsed = Body.safeParse(await readJson(req));
  if (!parsed.success) return authError('bad_input');
  await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent('/account?reset=1')}` }).catch(() => null);
  return NextResponse.json({ ok: true });
}
