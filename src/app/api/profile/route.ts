import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabase } from '@/server/supabase/server';
import { authError, readJson } from '@/server/supabase/route';

export const runtime = 'nodejs';

const Body = z.object({
  displayName: z.string().trim().min(1).max(40).optional(),
  locale: z.enum(['th', 'en']).optional(),
  runNumber: z.number().int().min(1).max(100).nullable().optional(),
  mascot: z.enum(['cat', 'dog']).optional(),
  accountRole:z.enum(['supporter','shelter']).optional(),
});

export async function PATCH(req: Request) {
  const supabase = await getSupabase();
  if (!supabase) return authError('disabled', 503);
  const parsed = Body.safeParse(await readJson(req));
  if (!parsed.success) return authError('bad_input');
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return authError('unauthorized', 401);
  const p = parsed.data;
  const patch: Record<string, unknown> = {};
  if (p.displayName !== undefined) patch.display_name = p.displayName;
  if (p.locale !== undefined) patch.locale = p.locale;
  if (p.runNumber !== undefined) patch.run_number = p.runNumber;
  if (p.mascot !== undefined) patch.mascot = p.mascot;
  if (p.accountRole !== undefined) patch.account_role = p.accountRole;
  if (!Object.keys(patch).length) return NextResponse.json({ ok: true });
  const { error } = await supabase.from('profiles').update(patch).eq('id', u.user.id);
  if (error) {
    console.error('[cozypet] profile_patch:error');
    return authError('unavailable', 503);
  }
  return NextResponse.json({ ok: true });
}
