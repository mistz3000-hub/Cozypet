import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SITE_URL } from '@/lib/public-site';

/**
 * ต่ออายุ session ของ Supabase (PROMPT.md 13) — ทำงานเฉพาะเมื่อตั้ง SUPABASE_URL/SUPABASE_PUBLISHABLE_KEY
 * cookie: HttpOnly, SameSite=Lax, Secure (production) · ไม่ log token
 */
export async function proxy(request: NextRequest) {
  // Account entry always happens on the shared site. Password/email flows
  // need their PKCE cookies there as well as Google OAuth.
  if (['GET', 'HEAD'].includes(request.method) &&
      ['/login', '/signup'].includes(request.nextUrl.pathname) &&
      request.nextUrl.origin !== PUBLIC_SITE_URL) {
    return NextResponse.redirect(new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, PUBLIC_SITE_URL));
  }
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) {
          response.cookies.set(name, value, { ...options, httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
        }
      },
    },
  });
  try {
    await supabase.auth.getUser();
  } catch {
    // ระบบบัญชีเชื่อมต่อไม่ได้ → ใช้โหมดทดลองต่อได้
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|mascot/|images/|api/chat|api/assist|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico|woff2?)$).*)'],
};
