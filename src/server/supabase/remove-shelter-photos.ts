import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SHELTER_BUCKET } from './shelter-photos';
/** Owner-scoped cleanup, including uploads not yet saved in a payload. */
export async function removeShelterPhotos(db:SupabaseClient,userId:string):Promise<boolean>{
  const folders:string[]=[];
  for(let offset=0;;offset+=100){const {data,error}=await db.storage.from(SHELTER_BUCKET).list(userId,{limit:100,offset});if(error)return false;folders.push(...(data??[]).filter(f=>/^[0-9a-f-]{36}$/.test(f.name)).map(f=>f.name));if(!data||data.length<100)break;}
  for(const folder of folders){
    const paths:string[]=[];
    for(let offset=0;;offset+=100){const {data,error}=await db.storage.from(SHELTER_BUCKET).list(`${userId}/${folder}`,{limit:100,offset});if(error)return false;paths.push(...(data??[]).filter(f=>/^[0-9a-f-]{36}\.(webp|jpg|png)$/.test(f.name)).map(f=>`${userId}/${folder}/${f.name}`));if(!data||data.length<100)break;}
    for(let i=0;i<paths.length;i+=100){const {error}=await db.storage.from(SHELTER_BUCKET).remove(paths.slice(i,i+100));if(error)return false;}
  }
  return true;
}
