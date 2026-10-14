import { NextResponse } from 'next/server';
import { getSupabase } from '@/server/supabase/server';
import { authSiteUrl, isNonCanonicalAuthRequest, publicAuthSiteUrl } from '@/server/supabase/config';
import { safeNext } from '@/lib/safe-next';
import { authRateOk } from '@/server/supabase/route';

export const runtime = 'nodejs';

/** เริ่ม Google OAuth (PKCE) — scope เฉพาะ openid email profile */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = safeNext(url.searchParams.get('next'), '/');
  // Always start PKCE on the public origin. This includes localhost, preview
  // deployments, and alternate Vercel domains, so the verifier cookie and
  // callback session are never scoped to a non-public host.
  if (isNonCanonicalAuthRequest(req)) {
    const target = new URL('/api/auth/google', publicAuthSiteUrl());
    target.searchParams.set('next', next);
    return NextResponse.redirect(target);
  }
  const base = authSiteUrl();
  const supabase = await getSupabase();
  if (!supabase) return NextResponse.redirect(new URL('/login?error=disabled', base));
  if (!authRateOk(req)) return NextResponse.redirect(new URL('/login?error=rate', base));
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${base}/auth/callback?next=${encodeURIComponent(next)}`,
      scopes: 'openid email profile',
      skipBrowserRedirect: true,
    },
  });
  if (error || !data.url) {
    console.error('[cozypet] auth_google:unavailable');
    return NextResponse.redirect(new URL('/login?error=oauth', base));
  }
  return NextResponse.redirect(data.url);
}
