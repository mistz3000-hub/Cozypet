'use client';
import { useCallback,useEffect,useRef,useState } from 'react';
import { useI18n } from '@/i18n/provider';
import { useDemoSession } from '@/lib/store';
import { PetFrame } from '@/features/business/PetFrame';
import { Button,ButtonLink } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { CommunityPhoto } from '@/features/shelters/CommunityPhoto';
import s from '@/features/shelters/shelters.module.css';
export function RandomPetPage(){
  const {m}=useI18n();const q=m.community.qr;const [{mascot}]=useDemoSession();const previous=useRef('');const [pet,setPet]=useState<{id:string;src:string;sourceHash:string}|null>(null);const [busy,setBusy]=useState(true);const [error,setError]=useState(false);
  const load=useCallback(async(signal?:AbortSignal)=>{setBusy(true);setError(false);try{const r=await fetch(`/api/demo/random-pet?previous=${previous.current}`,{cache:'no-store',signal});if(!r.ok)throw Error();const d=await r.json();if(signal?.aborted)return;previous.current=d.pet.sourceHash;setPet(d.pet);}catch{if(!signal?.aborted)setError(true);}finally{if(!signal?.aborted)setBusy(false);}},[]);
  useEffect(()=>{const ac=new AbortController();void Promise.resolve().then(()=>{if(!ac.signal.aborted)return load(ac.signal);});return()=>ac.abort();},[load]);
  return <div className={`cp-container cp-page ${s.page}`}><header><h1>{q.petTitle}</h1><p>{q.description}</p></header><PetFrame mascot={mascot} className={s.heroPet}>{busy?<Skeleton style={{width:400,maxWidth:'100%',aspectRatio:'1'}}/>:pet?<CommunityPhoto media={{src:pet.src,alt:q.petTitle}}/>:null}{error?<Notice tone="error">{q.error}</Notice>:null}<div className={s.actions}><Button variant="primary" disabled={busy} onClick={()=>void load()}>{q.random}</Button><ButtonLink href="/">{m.nav.home}</ButtonLink></div><p className={s.muted}>{q.noReceipt}</p></PetFrame></div>;
}
