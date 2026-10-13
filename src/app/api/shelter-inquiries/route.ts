import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabase } from '@/server/supabase/server';
import { getCurrentUser } from '@/server/supabase/auth';
import { takeToken } from '@/server/ai/rate-limit';
const fail=(error:string,status=400)=>NextResponse.json({ok:false,error},{status});
export async function GET(req:Request) {
  const db=await getSupabase(); const user=await getCurrentUser(); if(!db||!user)return fail('unauthorized',401);
  const placeId=new URL(req.url).searchParams.get('place');
  let q=db.from('shelter_inquiries').select('id,place_id,sender_name,type,body,reply,status,created_at').order('created_at',{ascending:false}).limit(100);
  if(placeId)q=q.eq('place_id',placeId);
  const {data,error}=await q; if(error)return fail('unavailable',503);
  return NextResponse.json({ok:true,items:(data??[]).map(r=>({id:r.id,placeId:r.place_id,senderName:r.sender_name,type:r.type,body:r.body,reply:r.reply,status:r.status,createdAt:r.created_at}))},{headers:{'Cache-Control':'no-store'}});
}
export async function POST(req:Request) {
  if(req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)return fail('origin',403);
  const db=await getSupabase(); const user=await getCurrentUser(); if(!db||!user)return fail('unauthorized',401);
  if(!takeToken('community',user.id).ok)return fail('rate',429);
  const p=z.object({placeId:z.string().uuid(),type:z.enum(['intake','adopt','contact']),body:z.string().trim().min(1).max(1000)}).safeParse(await req.json().catch(()=>null));
  if(!p.success)return fail('bad_input');
  const {error}=await db.from('shelter_inquiries').insert({place_id:p.data.placeId,sender_id:user.id,sender_name:user.displayName.slice(0,40),type:p.data.type,body:p.data.body});
  return error?fail('unavailable',503):NextResponse.json({ok:true});
}
export async function PATCH(req:Request) {
  if(req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)return fail('origin',403);
  const db=await getSupabase(); const user=await getCurrentUser(); if(!db||!user)return fail('unauthorized',401);
  if(!takeToken('community',user.id).ok)return fail('rate',429);
  const p=z.object({id:z.string().uuid(),reply:z.string().trim().min(1).max(1000),status:z.enum(['replied','closed'])}).safeParse(await req.json().catch(()=>null));
  if(!p.success)return fail('bad_input');
  const {data,error}=await db.from('shelter_inquiries').update({reply:p.data.reply,status:p.data.status}).eq('id',p.data.id).select('id').maybeSingle();
  return error?fail('unavailable',503):!data?fail('unauthorized',403):NextResponse.json({ok:true});
}
