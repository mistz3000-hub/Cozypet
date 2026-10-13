import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { MediaRef, PublicShelter } from '@/lib/types';
export const SHELTER_BUCKET='community-shelters';
export async function signShelterPhotos(db:SupabaseClient,places:PublicShelter[]) {
  const paths=[...new Set(places.flatMap(p=>[...p.payload.photos,...p.payload.pets.flatMap(a=>a.photo?[a.photo]:[])].flatMap(m=>m.storagePath?[m.storagePath]:[])))];
  if(!paths.length)return places;
  const {data}=await db.storage.from(SHELTER_BUCKET).createSignedUrls(paths,900);
  const byPath=new Map((data??[]).map(p=>[p.path,p.signedUrl]));
  const sign=(photo:MediaRef):MediaRef=>({...photo,src:photo.storagePath?(byPath.get(photo.storagePath)??''):''});
  return places.map(p=>({...p,payload:{...p.payload,photos:p.payload.photos.map(sign),pets:p.payload.pets.map(a=>({...a,...(a.photo?{photo:sign(a.photo)}:{})}))}}));
}
