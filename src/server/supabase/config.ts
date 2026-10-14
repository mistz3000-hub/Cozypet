import 'server-only';
import { PUBLIC_SITE_URL } from '@/lib/public-site';

/** ระบบบัญชีเปิดเมื่อมีทั้ง SUPABASE_URL และ SUPABASE_PUBLISHABLE_KEY (ฝั่ง server เท่านั้น ไม่มี NEXT_PUBLIC_) */
export function supabaseEnv(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key) return null;
  return { url, key };
}

export function authEnabled(): boolean {
  return supabaseEnv() !== null;
}

export function passwordResetEnabled(): boolean {
  return process.env.AUTH_PASSWORD_RESET_ENABLED === 'true';
}

/** Every interactive auth flow uses this public origin, including development and previews. */
export function publicAuthSiteUrl(): string {
  return PUBLIC_SITE_URL;
}

/** Public base URL for provider redirects, email callbacks, and shareable URLs. */
export function siteUrl(): string {
  return publicAuthSiteUrl();
}

export function isNonCanonicalAuthRequest(request: Request): boolean {
  try {
    return new URL(request.url).origin !== publicAuthSiteUrl();
  } catch {
    return true;
  }
}

/** Callback handlers always write the session cookie on the public origin. */
export function authSiteUrl(): string {
  return publicAuthSiteUrl();
}
