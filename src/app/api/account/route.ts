import { NextResponse } from 'next/server';
import { getSupabase } from '@/server/supabase/server';
import { authError } from '@/server/supabase/route';
import { removeShelterPhotos } from '@/server/supabase/remove-shelter-photos';

export const runtime = 'nodejs';

/** ลบบัญชีและข้อมูลทั้งหมด — เรียกฟังก์ชัน SQL delete_my_account() (security definer, ลบได้เฉพาะ auth.uid() ของตัวเอง) */
export async function DELETE() {
  const supabase = await getSupabase();
  if (!supabase) return authError('disabled', 503);
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return authError('unauthorized', 401);
  if(!await removeShelterPhotos(supabase,u.user.id))return authError('unavailable',503);
  const { error } = await supabase.rpc('delete_my_account');
  if (error) {
    console.error('[cozypet] account_delete:error');
    return authError('unavailable', 503);
  }
  await supabase.auth.signOut().catch(() => null);
  return NextResponse.json({ ok: true });
}
