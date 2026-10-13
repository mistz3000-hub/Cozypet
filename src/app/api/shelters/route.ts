import { NextResponse } from 'next/server';
import { getSupabase } from '@/server/supabase/server';
import { getCurrentUser } from '@/server/supabase/auth';
import { takeToken } from '@/server/ai/rate-limit';
import { ShelterBody,ShelterWrite, shelterFromRow } from '@/lib/shelters';
import { signShelterPhotos } from '@/server/supabase/shelter-photos';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const SELECT = 'id,registration_demo_id,payload,status,version,created_at,updated_at';
const fail = (error: string, status=400) => NextResponse.json({ ok:false,error },{status,headers:{'Cache-Control':'no-store'}});

export async function GET(req: Request) {
  const db=await getSupabase();
  if(!db) return fail('disabled',503);
  const url=new URL(req.url); const mine=url.searchParams.get('mine')==='1'; const id=url.searchParams.get('id');
  const offset=Math.max(0,Math.min(100000,Number(url.searchParams.get('offset')??0)||0));
  let query=db.from('shelter_places').select(SELECT).order('updated_at',{ascending:false}).order('id').range(offset,offset+49);
  if(mine) { const user=await getCurrentUser(); if(!user)return fail('unauthorized',401); query=query.eq('owner_id',user.id); }
  else query=query.in('status',['published','paused']);
  if(id) query=query.eq('id',id);
  const {data,error}=await query;
  if(error)return fail('unavailable',503);
  const valid=(data??[]).flatMap(row=>{const parsed=ShelterBody.safeParse(row.payload);return parsed.success?[shelterFromRow({...row,payload:parsed.data})]:[];});
  const places=await signShelterPhotos(db,valid);
  return NextResponse.json({ok:true,places,nextOffset:data?.length===50?offset+50:null,fetchedAt:new Date().toISOString()},{headers:{'Cache-Control':'no-store'}});
}

async function write(req:Request,isUpdate:boolean) {
  if(req.headers.get('origin') && req.headers.get('origin')!==new URL(req.url).origin)return fail('origin',403);
  if(!req.headers.get('content-type')?.includes('application/json'))return fail('bad_input');
  const db=await getSupabase(); if(!db)return fail('disabled',503);
  const user=await getCurrentUser(); if(!user)return fail('unauthorized',401);
  if(!takeToken('community',user.id).ok)return fail('rate',429);
  const raw=await req.text(); if(raw.length>1600000)return fail('too_large',413);
  let body:unknown; try{body=JSON.parse(raw);}catch{return fail('bad_input');}
  const parsed=ShelterWrite.safeParse(body); if(!parsed.success)return fail('bad_input');
  const {payload,status,version}=parsed.data;
  if((status==='published'||status==='paused')&&(!payload.address||!payload.description||!payload.photos.length))return fail('publish_incomplete');
  const id=new URL(req.url).searchParams.get('id');
  if(isUpdate && (!id||!version))return fail('bad_input');
  const photos=[...payload.photos,...payload.pets.flatMap(p=>p.photo?[p.photo]:[])];
  if(photos.some(p=>!id||!p.storagePath?.startsWith(`${user.id}/${id}/`)))return fail('bad_input');
  const persisted={...payload,photos:payload.photos.map(p=>({...p,src:''})),pets:payload.pets.map(p=>({...p,...(p.photo?{photo:{...p.photo,src:''}}:{})}))};
  let result;
  if(isUpdate) result=await db.from('shelter_places').update({payload:persisted,status}).eq('id',id!).eq('owner_id',user.id).eq('version',version!).select(SELECT).maybeSingle();
  else result=await db.from('shelter_places').insert({owner_id:user.id,payload:persisted,status}).select(SELECT).single();
  if(result.error)return fail('unavailable',503);
  if(!result.data)return fail('conflict',409);
  await db.from('profiles').update({account_role:'shelter'}).eq('id',user.id);
  const [place]=await signShelterPhotos(db,[shelterFromRow(result.data)]);
  return NextResponse.json({ok:true,place},{headers:{'Cache-Control':'no-store'}});
}
export const POST=(req:Request)=>write(req,false);
export const PATCH=(req:Request)=>write(req,true);
