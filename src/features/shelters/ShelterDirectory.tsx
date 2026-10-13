'use client';
import { useMemo, useState } from 'react';
import { useI18n } from '@/i18n/provider';
import { useDemoSession } from '@/lib/store';
import { statusInfo } from '@/lib/status';
import { shelterToHelper } from '@/lib/shelters';
import { Button,ButtonLink } from '@/components/ui/Button';
import { TextInput,Select,Field } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BangkokMap } from '@/components/map/BangkokMap';
import { PetFrame } from '@/features/business/PetFrame';
import { useShelters } from './useShelters';
import { CommunityPhoto } from './CommunityPhoto';
import { RecommendPopup,type PopupRequest } from '@/features/balancer/RecommendPopup';
import { useRun } from '@/features/demo/RequireRun';
import s from './shelters.module.css';
export function ShelterDirectory(){
  const {m,f,district}=useI18n();const c=m.community;const [{mascot}]=useDemoSession();const {places,loading,error,refresh}=useShelters();
  const [q,setQ]=useState('');const [type,setType]=useState('all');const [selected,setSelected]=useState<string|null>(null);
  const run=useRun();const [popup,setPopup]=useState<PopupRequest|null>(null);
  const rows=useMemo(()=>places.filter(p=>(type==='all'||p.payload.organisationType===type)&&`${p.payload.name} ${district(p.payload.districtId)} ${p.payload.pets.map(pet=>`${pet.name} ${pet.breed}`).join(' ')}`.toLocaleLowerCase().includes(q.trim().toLocaleLowerCase())),[places,type,q,district]);
  return <div className={`cp-container cp-page ${s.page}`}><header className={s.head}><div><h1>{c.title}</h1><p>{c.intro}</p></div><ButtonLink href="/shelter/manage" icon="plus" variant="primary">{c.manage}</ButtonLink></header>
    <PetFrame mascot={mascot}><div className={s.filters}><Field id="community-search" label={c.filter}><TextInput id="community-search" value={q} onChange={e=>setQ(e.target.value)}/></Field><Field id="community-type" label={c.fields.type}><Select id="community-type" value={type} onChange={e=>setType(e.target.value)}><option value="all">{c.all}</option>{(['foundation','shelter','independent'] as const).map(v=><option key={v} value={v}>{c.types[v]}</option>)}</Select></Field></div><Button small onClick={()=>void refresh()} icon="refresh">{c.refresh}</Button></PetFrame>
    {error?<Notice tone="error">{c.errors[error as keyof typeof c.errors]??c.errors.unavailable}</Notice>:null}
    {loading?<div aria-busy="true" aria-label={c.loading} className={s.grid}>{[0,1,2].map(v=><Skeleton key={v} style={{height:320}}/>)}</div>:<>
    <BangkokMap pins={rows.map(p=>({id:p.id,location:p.payload.location,level:statusInfo(shelterToHelper(p)).level,kind:p.payload.organisationType==='independent'?'individual':'shelter',label:p.payload.name,photo:p.payload.photos[0]}))} selectedId={selected} onSelect={id=>{setSelected(id);const place=places.find(p=>p.id===id);if(place&&statusInfo(shelterToHelper(place)).level==='full')setPopup({sourceId:`community-${id}`,blocker:place.status==='paused'?'unavailable':'full'});document.getElementById(`place-${id}`)?.scrollIntoView({block:'center',behavior:'auto'});}}/>
    {!rows.length?<Notice tone="butter">{c.empty}</Notice>:<div className={s.grid}>{rows.map(p=>{const d=p.payload;const st=statusInfo(shelterToHelper(p));return <article id={`place-${p.id}`} className={s.card} key={p.id}><CommunityPhoto media={d.photos[0]}/><div className={s.cardBody}><div className={s.chips}><StatusBadge level={st.level} closed={st.closed} demo/><span className={s.badge}>{c.types[d.organisationType]}</span></div><h2>{d.name}</h2><p className={s.muted}>{district(d.districtId)}</p><p>{f(c.space,{current:d.currentCount,total:d.capacityTotal,free:d.capacityTotal-d.currentCount})}</p><p className={s.muted}>{c.shared}</p><div className={s.actions}><ButtonLink href={`/shelters/${p.id}`} variant="primary">{c.detail}</ButtonLink></div></div></article>;})}</div>}</>}
    {popup&&places.find(p=>`community-${p.id}`===popup.sourceId)?<RecommendPopup request={popup} onClose={()=>setPopup(null)} species={places.find(p=>`community-${p.id}`===popup.sourceId)!.payload.speciesAccepted[0]} urgency="normal" searchPoint={places.find(p=>`community-${p.id}`===popup.sourceId)!.payload.location} run={run?.run??null} finding={run?.finding??1}/>:null}
    <ButtonLink href="/nearby" icon="pin">{m.nav.findLocation}</ButtonLink>
  </div>;
}
