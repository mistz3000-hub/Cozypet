import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { getSupabase } from '@/server/supabase/server';
import { getCurrentUser } from '@/server/supabase/auth';
import { SHELTER_BUCKET } from '@/server/supabase/shelter-photos';
import { takeToken } from '@/server/ai/rate-limit';
export const runtime='nodejs';
const fail=(error:string,status=400)=>NextResponse.json({ok:false,error},{status});
export async function POST(req:Request) {
  if(req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)return fail('origin',403);
  const db=await getSupabase();const user=await getCurrentUser();if(!db||!user)return fail('unauthorized',401);
  if(!takeToken('community',user.id).ok)return fail('rate',429);
  const p=z.object({placeId:z.string().uuid(),data:z.string().max(220000).regex(/^data:image\/(?:webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/),alt:z.string().trim().max(120)}).safeParse(await req.json().catch(()=>null));
  if(!p.success)return fail('bad_input');
  const {data:place}=await db.from('shelter_places').select('id').eq('id',p.data.placeId).eq('owner_id',user.id).maybeSingle();if(!place)return fail('unauthorized',403);
  const mime=p.data.data.slice(5,p.data.data.indexOf(';'));const bytes=Buffer.from(p.data.data.split(',')[1],'base64');
  if(bytes.length>160000||bytes.length<12)return fail('too_large',413);
  const valid=mime==='image/webp'?bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP':mime==='image/png'?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
  if(!valid)return fail('bad_input');
  const path=`${user.id}/${place.id}/${randomUUID()}.${mime==='image/webp'?'webp':mime==='image/png'?'png':'jpg'}`;
  const {error}=await db.storage.from(SHELTER_BUCKET).upload(path,bytes,{contentType:mime,upsert:false});if(error)return fail('unavailable',503);
  const {data:signed}=await db.storage.from(SHELTER_BUCKET).createSignedUrl(path,900);
  return NextResponse.json({ok:true,photo:{src:signed?.signedUrl??'',storagePath:path,alt:p.data.alt,creditId:'community-upload'}});
}
