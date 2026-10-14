import { NextResponse } from 'next/server';
import { getSupabase } from '@/server/supabase/server';
import { authSiteUrl, isNonCanonicalAuthRequest, publicAuthSiteUrl } from '@/server/supabase/config';
import { safeNext } from '@/lib/safe-next';

export const runtime = 'nodejs';

/** แลก code เป็น session ฝั่ง server แล้วไป next ที่ปลอดภัย (กัน open redirect) */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const next = safeNext(url.searchParams.get('next'), '/');
  const base = authSiteUrl();
  // If Supabase falls back to a configured Site URL on another origin, move
  // the one-time code to the public callback, where the PKCE verifier cookie
  // from the start of this flow lives.
  if (isNonCanonicalAuthRequest(req)) {
    if (!code) return NextResponse.redirect(new URL('/login?error=oauth', base));
    const target = new URL('/auth/callback', publicAuthSiteUrl());
    target.searchParams.set('code', code);
    target.searchParams.set('next', next);
    return NextResponse.redirect(target);
  }
  const supabase = await getSupabase();
  if (!supabase || !code) return NextResponse.redirect(new URL('/login?error=oauth', base));
  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('[cozypet] auth_callback:exchange_failed');
      return NextResponse.redirect(new URL('/login?error=oauth', base));
    }
  } catch {
    return NextResponse.redirect(new URL('/login?error=oauth', base));
  }
  return NextResponse.redirect(new URL(next, base));
}
