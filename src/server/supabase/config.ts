import 'server-only';

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

export function siteUrl(): string {
  return (process.env.SITE_URL?.trim() || 'http://localhost:3000').replace(/\/$/, '');
}
