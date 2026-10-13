'use client';
import { useCallback,useEffect,useState } from 'react';
import { useI18n } from '@/i18n/provider';
import { useAuth } from '@/features/auth/AuthContext';
import { useDemoSession } from '@/lib/store';
import type { ShelterInquiry } from '@/lib/types';
import { PetFrame } from '@/features/business/PetFrame';
import { Button } from '@/components/ui/Button';
import { Field,TextArea } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import s from './shelters.module.css';
export function ShelterInbox({placeId,owner=false}:{placeId:string;owner?:boolean}){
  const {m}=useI18n();const c=m.community;const {user}=useAuth();const [{mascot}]=useDemoSession();const [items,setItems]=useState<ShelterInquiry[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState(false);
  const refresh=useCallback(async(signal?:AbortSignal)=>{if(!user)return;try{const r=await fetch(`/api/shelter-inquiries?place=${placeId}`,{cache:'no-store',signal});const d=await r.json();if(signal?.aborted)return;if(!r.ok||!d.ok){setError(true);return;}setItems(d.items);setError(false);}catch{if(!signal?.aborted)setError(true);}finally{if(!signal?.aborted)setLoading(false);}},[placeId,user]);
  useEffect(()=>{const ac=new AbortController();void Promise.resolve().then(()=>{if(!ac.signal.aborted)return refresh(ac.signal);});const timer=window.setInterval(()=>{if(!document.hidden)void refresh(ac.signal);},15000);return()=>{ac.abort();window.clearInterval(timer);};},[refresh]);
  if(!user)return null;
  return <PetFrame mascot={mascot}><div className={s.head}><h2>{c.inbox}</h2><Button small onClick={()=>void refresh()}>{c.refresh}</Button></div>{error?<Notice tone="error">{c.errors.unavailable}</Notice>:null}{loading?<Skeleton style={{height:120}}/>:<div className={s.list}>{!items.length?<p>{c.inboxEmpty}</p>:items.map(item=><InquiryItem key={`${item.id}-${item.status}-${item.reply}`} item={item} owner={owner} onSaved={()=>void refresh()}/>)}</div>}</PetFrame>;
}
function InquiryItem({item,owner,onSaved}:{item:ShelterInquiry;owner:boolean;onSaved:()=>void}){
  const {m}=useI18n();const c=m.community;const [reply,setReply]=useState(item.reply);const [busy,setBusy]=useState(false);const [error,setError]=useState(false);
  async function send(status:'replied'|'closed'){if(busy||!reply.trim())return;setBusy(true);try{const r=await fetch('/api/shelter-inquiries',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:item.id,reply,status})});if(!r.ok){setError(true);return;}onSaved();}catch{setError(true);}finally{setBusy(false);}}
  return <article className={s.item}><div className={s.head}><strong>{item.senderName} · {c.inquiryType[item.type]}</strong><span className={s.badge}>{c.inquiryStatus[item.status]}</span></div><p>{item.body}</p>{item.reply?<blockquote>{item.reply}</blockquote>:null}{owner?<><Field id={`reply-${item.id}`} label={c.reply}><TextArea id={`reply-${item.id}`} maxLength={1000} value={reply} onChange={e=>setReply(e.target.value)}/></Field><div className={s.actions}><Button small variant="primary" disabled={busy||!reply.trim()} onClick={()=>void send('replied')}>{busy?m.common.sending:c.reply}</Button><Button small disabled={busy||!reply.trim()} onClick={()=>void send('closed')}>{c.closeInquiry}</Button></div></>:null}{error?<Notice tone="error">{c.errors.unavailable}</Notice>:null}</article>;
}
