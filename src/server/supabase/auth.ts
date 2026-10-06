import 'server-only';
import type { ClientUser } from '@/features/auth/AuthContext';
import { getSupabase } from './server';

export function maskEmail(email: string | null | undefined): string {
  if (!email) return '';
  const [user, domain] = email.split('@');
  if (!domain) return '***';
  return `${user.slice(0, 2)}***@${domain}`;
}

/** ผู้ใช้ปัจจุบัน (ตรวจกับ server ของ Supabase) หรือ null — ห้าม log อีเมล/token */
export async function getCurrentUser(): Promise<ClientUser | null> {
  const supabase = await getSupabase();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    const u = data.user;
    const { data: profile } = await supabase.from('profiles').select('display_name, avatar_url, run_number').eq('id', u.id).maybeSingle();
    const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
    const displayName = (profile?.display_name as string | undefined)
      ?? (meta.full_name as string | undefined) ?? (meta.name as string | undefined) ?? (u.email?.split('@')[0] ?? 'Cozypet');
    return {
      id: u.id,
      displayName,
      avatarUrl: (profile?.avatar_url as string | undefined) ?? (meta.avatar_url as string | undefined) ?? null,
      emailMasked: maskEmail(u.email),
      providers: ((u.app_metadata?.providers as string[] | undefined) ?? [u.app_metadata?.provider as string]).filter(Boolean),
      runNumber: (profile?.run_number as number | null | undefined) ?? null,
    };
  } catch {
    return null;
  }
}
