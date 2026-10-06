import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseEnv } from './config';

/** Supabase client ฝั่ง server (server components / route handlers) — คืน null ถ้าไม่ได้ตั้ง env */
export async function getSupabase(): Promise<SupabaseClient | null> {
  const env = supabaseEnv();
  if (!env) return null;
  const store = await cookies();
  return createServerClient(env.url, env.key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) {
            store.set(name, value, { ...options, httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
          }
        } catch {
          // เรียกจาก server component ตั้ง cookie ไม่ได้ — proxy ต่ออายุ session ให้แล้ว
        }
      },
    },
  });
}
