'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MediaRef, PublicShelter } from '@/lib/types';
import { shelterToHelper } from '@/lib/shelters';

export function useShelters(mine=false, active=true) {
  const urls=useRef(new Map<string,{src:string;until:number}>());
  const inFlight=useRef(false);
  const [places,setPlaces]=useState<PublicShelter[]>([]);
  const [loading,setLoading]=useState(true); const [error,setError]=useState<string|null>(null); const [fetchedAt,setFetchedAt]=useState('');
  const refresh=useCallback(async (signal?:AbortSignal)=>{
    if(!active||inFlight.current||signal?.aborted)return;
    inFlight.current=true;
    try {
      const all:PublicShelter[]=[];let offset:number|null=0;let fetched='';
      do {
        const r:Response=await fetch(`/api/shelters?offset=${offset}${mine?'&mine=1':''}`,{cache:'no-store',signal}); const data:{ok:boolean;error?:string;places:PublicShelter[];nextOffset:number|null;fetchedAt:string}=await r.json();
        if(signal?.aborted)return;
        if(!r.ok||!data.ok){setError(data.error??'unavailable');return;}
        all.push(...data.places);offset=data.nextOffset;fetched=data.fetchedAt;
      }while(offset!==null);
      const stable=(photo:MediaRef)=>{if(!photo.storagePath)return photo;const old=urls.current.get(photo.storagePath);if(old&&old.until>Date.now())return {...photo,src:old.src};urls.current.set(photo.storagePath,{src:photo.src,until:Date.now()+840000});return photo;};
      setPlaces([...new Map(all.map(p=>[p.id,{...p,payload:{...p.payload,photos:p.payload.photos.map(stable),pets:p.payload.pets.map(pet=>({...pet,...(pet.photo?{photo:stable(pet.photo)}:{})}))}}])).values()]);setFetchedAt(fetched);setError(null);
    }catch{if(!signal?.aborted)setError('unavailable');}finally{inFlight.current=false;if(!signal?.aborted)setLoading(false);}
  },[mine,active]);
  useEffect(()=>{
    const controller=new AbortController(); void Promise.resolve().then(()=>refresh(controller.signal));
    const interval=window.setInterval(()=>{if(!document.hidden)void refresh(controller.signal);},15000);
    const focus=()=>{if(!document.hidden)void refresh(controller.signal);}; window.addEventListener('focus',focus); document.addEventListener('visibilitychange',focus);
    return()=>{controller.abort();window.clearInterval(interval);window.removeEventListener('focus',focus);document.removeEventListener('visibilitychange',focus);};
  },[refresh]);
  const helpers=useMemo(()=>places.map(shelterToHelper),[places]);
  return {places,loading,error,fetchedAt,refresh,helpers};
}
