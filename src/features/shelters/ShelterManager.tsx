'use client';
import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { useI18n } from '@/i18n/provider';
import { DISTRICTS,BANGKOK_BOUNDS } from '@/data/districts';
import type { PublicShelter,ShelterPayload,ShelterPet,ShelterPublication,MediaRef } from '@/lib/types';
import { emptyShelter } from '@/lib/shelters';
import { useDemoSession } from '@/lib/store';
import { readAsDataUrl,resizeToJpeg,validateImageFile } from '@/lib/image';
import { PetFrame } from '@/features/business/PetFrame';
import { Button,ButtonLink } from '@/components/ui/Button';
import { Field,TextInput,TextArea,Select,ChipGroup,Checkbox } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { BangkokMap } from '@/components/map/BangkokMap';
import { DistrictSelect } from '@/features/shared/DistrictSelect';
import { useShelters } from './useShelters';
import { CommunityPhoto } from './CommunityPhoto';
import { ShelterInbox } from './ShelterInbox';
import s from './shelters.module.css';

export function ShelterManager(){
  const {user}=useAuth();const {m}=useI18n();const c=m.community;const [{mascot}]=useDemoSession();
  const {places,loading,error,refresh}=useShelters(true,!!user);const [editing,setEditing]=useState<PublicShelter|null|undefined>(undefined);
  if(!user)return <div className={`cp-container cp-page ${s.page}`}><h1>{c.manage}</h1><Notice tone="butter">{c.login}</Notice><ButtonLink variant="primary" href="/login?next=/shelter/manage">{m.auth.google}</ButtonLink><ButtonLink href="/signup?next=/shelter/manage">{m.auth.signupTitle}</ButtonLink></div>;
  return <div className={`cp-container cp-page ${s.page}`}><header className={s.head}><div><h1>{c.manage}</h1><p>{c.privateDraft}</p></div><div className={s.actions}><Button onClick={()=>setEditing(null)} variant="primary" icon="plus">{c.create}</Button><ButtonLink href="/shelters">{c.title}</ButtonLink></div></header>
    <PetFrame mascot={mascot}>{loading?<Skeleton style={{height:100}}/>:<div className={s.list}>{places.map(p=><div className={s.head} key={p.id}><div><strong>{p.payload.name}</strong><p className={s.muted}>{c.status[p.status]} · {c.recordId}: {p.registrationDemoId}</p>{p.payload.organisationType==='foundation'&&p.payload.registrationNumber?<p className={s.muted}>{c.fields.registrationNumber}: {p.payload.registrationNumber}</p>:null}</div><Button small onClick={()=>setEditing(p)}>{m.common.edit}</Button></div>)}</div>}{error?<Notice tone="error">{c.errors.unavailable}</Notice>:null}</PetFrame>
    {editing!==undefined?<ShelterEditor key={`${editing?.id??'new'}-${editing?.version??0}`} initial={editing} onSaved={p=>{setEditing(p);void refresh();}} onReload={async()=>{await refresh();const r=await fetch(`/api/shelters?mine=1&id=${editing?.id}`,{cache:'no-store'});const d=await r.json();if(d.ok&&d.places[0])setEditing(d.places[0]);}}/>:null}
    {editing?.id?<ShelterInbox key={editing.id} placeId={editing.id} owner/>:null}
  </div>;
}
function ShelterEditor({initial,onSaved,onReload}:{initial:PublicShelter|null;onSaved:(p:PublicShelter)=>void;onReload:()=>Promise<void>}){
  const {m,f}=useI18n();const c=m.community;const [{mascot}]=useDemoSession();const [d,setD]=useState<ShelterPayload>(()=>{const payload=initial?.payload??emptyShelter();return {...payload,registrationNumber:payload.registrationNumber??''};});
  const [busy,setBusy]=useState(false);const [uploading,setUploading]=useState(false);const [error,setError]=useState<string|null>(null);const [consent,setConsent]=useState(false);
  const patch=(p:Partial<ShelterPayload>)=>setD(prev=>({...prev,...p}));
  const errText=error?c.errors[error as keyof typeof c.errors]??c.errors.unavailable:null;
  async function save(status:ShelterPublication){
    if(d.organisationType==='foundation'&&!d.registrationNumber?.trim()){setError('registration_required');return;}
    if(busy||uploading||((status==='published'||status==='paused')&&!consent))return;setBusy(true);setError(null);
    try{const r=await fetch(`/api/shelters${initial?`?id=${initial.id}`:''}`,{method:initial?'PATCH':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({payload:d,status,version:initial?.version})});const data=await r.json();if(!r.ok||!data.ok){setError(data.error);return;}onSaved(data.place);}catch{setError('unavailable');}finally{setBusy(false);}
  }
  async function upload(file:File|undefined,petId?:string){
    if(!file||!initial||uploading)return;setUploading(true);setError(null);
    try{if(validateImageFile(file))throw Error('bad_input');let image=await resizeToJpeg(await readAsDataUrl(file),640,.68);if(image.length>210000)image=await resizeToJpeg(image,480,.55);const r=await fetch('/api/shelter-photo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({placeId:initial.id,data:image,alt:petId?d.pets.find(p=>p.id===petId)?.name:d.name})});const data=await r.json();if(!r.ok||!data.ok)throw Error(data.error);const photo=data.photo as MediaRef;setD(prev=>petId?{...prev,pets:prev.pets.map(p=>p.id===petId?{...p,photo}:p)}:{...prev,photos:[...prev.photos,photo].slice(0,3)});}catch(e){setError(e instanceof Error?e.message:'unavailable');}finally{setUploading(false);}
  }
  const petPatch=(id:string,p:Partial<ShelterPet>)=>patch({pets:d.pets.map(pet=>pet.id===id?{...pet,...p}:pet)});
  const text=(key:'name'|'address'|'hours'|'contactInstructions',label:string,max:number)=>{const id=`place-${key}`;return <Field id={id} label={label} required={key==='name'}><TextInput id={id} maxLength={max} value={d[key]} onChange={e=>patch({[key]:e.target.value})}/></Field>;};
  const area=(key:'description'|'conditions'|'donationNeeds',label:string,max:number)=>{const id=`place-${key}`;return <Field id={id} label={label}><TextArea id={id} maxLength={max} value={d[key]} onChange={e=>patch({[key]:e.target.value})}/></Field>;};
  const number=(key:'capacityTotal'|'currentCount'|'foodDays'|'litterDays',label:string,max:number)=>{const id=`place-${key}`;return <Field id={id} label={label}><TextInput id={id} type="number" min={key==='capacityTotal'?1:0} max={max} step={1} value={d[key]??0} onChange={e=>patch({[key]:Number(e.target.value)})}/></Field>;};
  return <PetFrame mascot={mascot}><form className={s.form} aria-busy={busy||uploading} onSubmit={e=>{e.preventDefault();void save(initial?.status??'draft');}}>
    <div className={s.head}><h2>{initial?m.common.edit:c.create}</h2>{initial?<span className={s.badge}>{c.status[initial.status]}</span>:null}</div>
    {initial?<Notice tone="butter"><strong>{initial.registrationDemoId}</strong><p>{c.demoId}</p></Notice>:null}
    {errText?<Notice tone="error">{errText}{error==='conflict'?<Button small onClick={()=>void onReload()}>{c.reload}</Button>:null}</Notice>:null}
    <div className={s.columns}>{text('name',c.fields.name,80)}<Field id="place-type" label={c.fields.type}><Select id="place-type" value={d.organisationType} onChange={e=>patch({organisationType:e.target.value as ShelterPayload['organisationType']})}>{(['foundation','shelter','independent'] as const).map(v=><option key={v} value={v}>{c.types[v]}</option>)}</Select></Field>
    {d.organisationType==='foundation'?<Field id="place-registration-number" label={c.fields.registrationNumber} required><TextInput id="place-registration-number" maxLength={60} required value={d.registrationNumber??''} onChange={e=>patch({registrationNumber:e.target.value})}/><span className={s.muted}>{c.registrationNumberHint}</span></Field>:null}
    <Field id="place-district" label={c.fields.district}><DistrictSelect id="place-district" value={d.districtId} onChange={e=>patch({districtId:e.target.value})}/></Field>{text('address',c.fields.address,250)}</div>
    {area('description',c.fields.description,1200)}
    <ChipGroup legend={c.fields.species} values={d.speciesAccepted} onChange={v=>patch({speciesAccepted:v as ShelterPayload['speciesAccepted']})} options={(['cat','dog','other'] as const).map(v=>({value:v,label:m.species[v]}))}/>
    <ChipGroup legend={c.fields.modes} values={d.careModes} onChange={v=>patch({careModes:v as ShelterPayload['careModes']})} options={(['foster','adopt'] as const).map(v=>({value:v,label:v==='foster'?m.careMode.foster:m.careMode.adopt}))}/>
    <div className={s.columns}>{number('capacityTotal',c.fields.capacity,1000)}{number('currentCount',c.fields.current,1000)}{number('foodDays',c.fields.food,365)}{number('litterDays',c.fields.litter,365)}{text('hours',c.fields.hours,160)}{text('contactInstructions',c.fields.contact,400)}</div>
    <Checkbox checked={d.acceptsEmergency} onChange={v=>patch({acceptsEmergency:v})}>{c.fields.emergency}</Checkbox>{area('conditions',c.fields.conditions,800)}
    <Checkbox checked={d.donationsEnabled} onChange={v=>patch({donationsEnabled:v})}>{c.fields.donations}</Checkbox>{area('donationNeeds',c.fields.needs,600)}
    <section><h3>{c.pin}</h3><BangkokMap searchPoint={d.location} onPick={location=>patch({location})} showLegend={false}/><div className={s.columns}>{(['lat','lng'] as const).map(v=><Field id={`place-${v}`} key={v} label={c.fields[v]}><TextInput id={`place-${v}`} type="number" step="0.000001" min={v==='lat'?BANGKOK_BOUNDS.minLat:BANGKOK_BOUNDS.minLng} max={v==='lat'?BANGKOK_BOUNDS.maxLat:BANGKOK_BOUNDS.maxLng} value={d.location[v]} onChange={e=>patch({location:{...d.location,[v]:Number(e.target.value)}})}/></Field>)}</div><Button small onClick={()=>patch({location:{...(DISTRICTS.find(x=>x.id===d.districtId)??DISTRICTS[0]).center}})}>{c.center}</Button></section>
    <section><h3>{c.fields.photos}</h3><p className={s.muted}>{c.photoHint}</p><div className={s.gallery}>{d.photos.map(photo=><div key={photo.storagePath}><CommunityPhoto media={photo}/><Button small onClick={()=>patch({photos:d.photos.filter(p=>p.storagePath!==photo.storagePath)})}>{c.remove}</Button></div>)}</div>{uploading?<Skeleton style={{height:120}}/>:null}<label className={s.label}>{c.upload}<TextInput type="file" accept="image/jpeg,image/png,image/webp" disabled={!initial||uploading||d.photos.length>=3||busy} onChange={e=>{void upload(e.target.files?.[0]);e.target.value='';}}/></label></section>
    <section><h3>{c.fields.pets}</h3><div className={s.list}>{d.pets.map(pet=><div className={s.item} key={pet.id}><div className={s.columns}><Field id={`${pet.id}-name`} label={c.fields.petName}><TextInput id={`${pet.id}-name`} maxLength={40} value={pet.name} onChange={e=>petPatch(pet.id,{name:e.target.value})}/></Field><Field id={`${pet.id}-species`} label={c.fields.species}><Select id={`${pet.id}-species`} value={pet.species} onChange={e=>petPatch(pet.id,{species:e.target.value as ShelterPet['species']})}>{(['cat','dog','other'] as const).map(v=><option key={v} value={v}>{m.species[v]}</option>)}</Select></Field><Field id={`${pet.id}-breed`} label={c.fields.breed}><TextInput id={`${pet.id}-breed`} maxLength={80} value={pet.breed} onChange={e=>petPatch(pet.id,{breed:e.target.value})}/></Field><Field id={`${pet.id}-age`} label={c.fields.age}><TextInput id={`${pet.id}-age`} maxLength={40} value={pet.age} onChange={e=>petPatch(pet.id,{age:e.target.value})}/></Field></div><Field id={`${pet.id}-story`} label={c.fields.petStory}><TextArea id={`${pet.id}-story`} maxLength={300} value={pet.description} onChange={e=>petPatch(pet.id,{description:e.target.value})}/></Field><Field id={`${pet.id}-status`} label={c.fields.pets}><Select id={`${pet.id}-status`} value={pet.status} onChange={e=>petPatch(pet.id,{status:e.target.value as ShelterPet['status']})}>{(['available','foster','adopted'] as const).map(v=><option key={v} value={v}>{c.petStatus[v]}</option>)}</Select></Field>{pet.photo?<CommunityPhoto media={pet.photo}/>:null}<label className={s.label}>{c.upload}<TextInput type="file" accept="image/jpeg,image/png,image/webp" disabled={!initial||uploading||busy} onChange={e=>{void upload(e.target.files?.[0],pet.id);e.target.value='';}}/></label><Button small onClick={()=>patch({pets:d.pets.filter(p=>p.id!==pet.id)})}>{c.remove}</Button></div>)}</div><Button small icon="plus" disabled={d.pets.length>=6||busy} onClick={()=>patch({pets:[...d.pets,{id:crypto.randomUUID(),name:'',species:'cat',breed:'',age:'',status:'available',description:''}]})}>{c.addPet}</Button></section>
    <Checkbox checked={consent} onChange={setConsent}>{c.consent}</Checkbox><div className={s.actions}><Button type="submit" disabled={busy||uploading} icon="check">{busy?m.common.sending:initial?m.common.save:c.saveDraft}</Button><Button disabled={busy||uploading||!initial||!consent} variant="primary" onClick={()=>void save('published')}>{c.publish}</Button>{initial?<><Button disabled={busy||uploading||!consent} onClick={()=>void save('paused')}>{c.pause}</Button><Button variant="ghost" disabled={busy||uploading} onClick={()=>void save('archived')}>{c.archive}</Button></>:null}</div>{initial?<p className={s.muted}>{f(c.updated,{time:new Date(initial.updatedAt).toLocaleString()})}</p>:null}
  </form></PetFrame>;
}
