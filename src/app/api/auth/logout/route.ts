import { NextResponse } from 'next/server';
import { getSupabase } from '@/server/supabase/server';

export const runtime = 'nodejs';

export async function POST() {
  const supabase = await getSupabase();
  if (supabase) await supabase.auth.signOut().catch(() => null);
  return NextResponse.json({ ok: true });
}
