'use client';
import { useCallback,useEffect,useRef,useState } from 'react';
import { useI18n } from '@/i18n/provider';
import { Dialog } from '@/components/ui/Dialog';
import { Checkbox } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import s from '@/features/shelters/shelters.module.css';
export function DemoPaymentDialog({amount,onClose,onConfirm}:{amount:number;onClose:()=>void;onConfirm:(sessionId:string)=>void|Promise<void>}){
  const {m,f,money}=useI18n();const q=m.community.qr;const [nonce]=useState(()=>crypto.randomUUID());const [qr,setQr]=useState<{image:string;url:string}|null>(null);const [error,setError]=useState(false);const [ack,setAck]=useState(false);const [busy,setBusy]=useState(false);const locked=useRef(false);
  useEffect(()=>{const ac=new AbortController();void fetch(`/api/demo-qr?t=${nonce}`,{signal:ac.signal,cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(d=>{if(!ac.signal.aborted)setQr(d);}).catch(()=>{if(!ac.signal.aborted)setError(true);});return()=>ac.abort();},[nonce]);
  const close=useCallback(()=>{if(!locked.current)onClose();},[onClose]);
  async function confirm(){if(!ack||!qr||locked.current)return;locked.current=true;setBusy(true);try{await onConfirm(nonce);onClose();}catch{setError(true);}finally{locked.current=false;setBusy(false);}}
  return <Dialog open onClose={close} title={q.title} size="sm"><p>{f(q.summary,{amount:money(amount)})}</p><Notice tone="butter">{q.description}</Notice>{qr?<>
    {/* A real QR matrix encodes only the random-animal demo URL. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img className={s.qr} src={qr.image} alt={q.title}/><a href={qr.url} target="_blank" rel="noopener noreferrer">{q.open}</a></>:!error?<div className={s.preview} aria-label={q.generating} aria-busy="true"><Skeleton style={{width:260,height:260}}/></div>:null}
    {error?<Notice tone="error">{q.error}</Notice>:null}<Checkbox checked={ack} onChange={setAck}>{q.ack}</Checkbox><Button variant="primary" block disabled={!qr||!ack||busy} onClick={()=>void confirm()}>{busy?q.pending:q.paid}</Button><p className={s.muted}>{q.noReceipt}</p>
  </Dialog>;
}
