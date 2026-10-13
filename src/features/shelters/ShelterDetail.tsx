'use client';
import { useEffect,useRef,useState } from 'react';
import { useI18n } from '@/i18n/provider';
import { useAuth } from '@/features/auth/AuthContext';
import { useDemoSession } from '@/lib/store';
import { shelterToHelper } from '@/lib/shelters';
import { statusInfo } from '@/lib/status';
import { PetFrame } from '@/features/business/PetFrame';
import { Button,ButtonLink } from '@/components/ui/Button';
import { Field,TextArea,Select } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BangkokMap } from '@/components/map/BangkokMap';
import { useShelters } from './useShelters';
import { CommunityPhoto } from './CommunityPhoto';
import { ShelterInbox } from './ShelterInbox';
import { CommunityPanel } from '@/features/business/CommunityPanel';
import { RecommendPopup,type PopupRequest } from '@/features/balancer/RecommendPopup';
import { useRun } from '@/features/demo/RequireRun';
import s from './shelters.module.css';
export function ShelterDetail({id}:{id:string}){
  const {m,f,district,dateTime}=useI18n();const c=m.community;const {user}=useAuth();const [{mascot}]=useDemoSession();const {places,loading,error}=useShelters();const p=places.find(p=>p.id===id);
  const run=useRun();const [popup,setPopup]=useState<PopupRequest|null>(null);const prompted=useRef(false);
  useEffect(()=>{if(!p||prompted.current||statusInfo(shelterToHelper(p)).level!=='full')return;prompted.current=true;void Promise.resolve().then(()=>setPopup({sourceId:`community-${p.id}`,blocker:p.status==='paused'?'unavailable':'full'}));},[p]);
  const [body,setBody]=useState('');const [type,setType]=useState<'intake'|'adopt'|'contact'>('contact');const [busy,setBusy]=useState(false);const [result,setResult]=useState<string|null>(null);const [inboxKey,setInboxKey]=useState(0);
  async function send(){if(!body.trim()||busy)return;setBusy(true);setResult(null);try{const r=await fetch('/api/shelter-inquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({placeId:id,type,body})});const d=await r.json();setResult(d.ok?'sent':d.error);if(d.ok){setBody('');setInboxKey(v=>v+1);}}catch{setResult('unavailable');}finally{setBusy(false);}}
  if(loading)return <div className={`cp-container cp-page ${s.page}`} aria-busy="true"><Skeleton style={{height:350}}/><Skeleton style={{height:120}}/></div>;
  if(error||!p)return <div className="cp-container cp-page"><Notice tone="butter">{error?c.errors.unavailable:c.empty}</Notice><ButtonLink href="/shelters">{c.title}</ButtonLink></div>;
  const d=p.payload;const st=statusInfo(shelterToHelper(p));
  return <div className={`cp-container cp-page ${s.page}`}><header className={s.head}><div><span className={s.badge}>{c.shared}</span><h1>{d.name}</h1><p>{district(d.districtId)} · {c.types[d.organisationType]}</p></div><StatusBadge level={st.level} closed={st.closed} demo/></header><div className={s.gallery}>{d.photos.map(photo=><CommunityPhoto key={photo.storagePath} media={photo}/>)}</div>
    <PetFrame mascot={mascot}><p>{d.description}</p><p><strong>{f(c.space,{current:d.currentCount,total:d.capacityTotal,free:d.capacityTotal-d.currentCount})}</strong></p><p>{f(c.supplies,{food:d.foodDays,litter:d.litterDays??'—'})}</p><p>{d.speciesAccepted.map(v=>m.species[v]).join(' · ')}</p><p>{c.fields.hours}: {d.hours||'—'}</p><p>{c.fields.conditions}: {d.conditions||'—'}</p><p>{c.fields.contact}: {d.contactInstructions||'—'}</p><Notice tone="butter">{p.registrationDemoId} · {c.demoId}</Notice>{d.donationsEnabled?<div className={s.actions}><ButtonLink href={`/donate?helper=community-${p.id}`} variant="primary" icon="box">{m.helper.sendPackage}</ButtonLink><ButtonLink href="/donation-tax">{c.tax.taxLink}</ButtonLink></div>:null}<p>{d.donationNeeds}</p></PetFrame>
    <PetFrame mascot={mascot}><h2>{c.fields.address}</h2><p>{d.address}</p><BangkokMap pins={[{id:p.id,location:d.location,kind:d.organisationType==='independent'?'individual':'shelter',level:st.level,label:d.name,photo:d.photos[0]}]}/><p className={s.muted}>{d.location.lat.toFixed(5)}, {d.location.lng.toFixed(5)} · {f(c.updated,{time:dateTime(p.updatedAt)})}</p></PetFrame>
    {d.pets.length?<section><h2>{c.fields.pets}</h2><div className={s.grid}>{d.pets.map(pet=><article className={s.card} key={pet.id}><CommunityPhoto media={pet.photo}/><div className={s.cardBody}><span className={s.badge}>{c.petStatus[pet.status]}</span><h2>{pet.name}</h2><p>{m.species[pet.species]} · {pet.breed||m.common.breedUnknown} · {pet.age}</p><p>{pet.description}</p>{pet.status==='available'&&p.status==='published'?<Button onClick={()=>{setType('adopt');setBody(`${pet.name}: `);document.getElementById('shelter-message')?.focus();}}>{c.inquiryType.adopt}</Button>:null}</div></article>)}</div></section>:null}
    <PetFrame mascot={mascot}><h2>{c.message}</h2>{p.status==='paused'?<Notice tone="butter">{c.pausedHint}</Notice>:!user?<ButtonLink href={`/login?next=/shelters/${p.id}`}>{c.login}</ButtonLink>:<form onSubmit={e=>{e.preventDefault();void send();}}><Field id="inquiry-type" label={c.message}><Select id="inquiry-type" value={type} onChange={e=>setType(e.target.value as typeof type)}>{(['intake','adopt','contact'] as const).map(v=><option key={v} value={v}>{c.inquiryType[v]}</option>)}</Select></Field><Field id="shelter-message" label={c.fields.note}><TextArea id="shelter-message" value={body} maxLength={1000} required onChange={e=>setBody(e.target.value)}/></Field><Button type="submit" variant="primary" disabled={busy||!body.trim()}>{busy?m.common.sending:c.send}</Button></form>}{result?<Notice tone={result==='sent'?'butter':'error'}>{result==='sent'?c.messageSent:c.errors[result as keyof typeof c.errors]??c.errors.unavailable}</Notice>:null}</PetFrame>
    <CommunityPanel helper={shelterToHelper(p)}/>
    <RecommendPopup request={popup} onClose={()=>setPopup(null)} species={d.speciesAccepted[0]} urgency="normal" searchPoint={d.location} run={run?.run??null} finding={run?.finding??1}/>
    <ShelterInbox key={inboxKey} placeId={p.id}/><ButtonLink href="/shelters">{c.title}</ButtonLink>
  </div>;
}
