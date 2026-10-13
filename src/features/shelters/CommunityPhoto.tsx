'use client';
import { useState } from 'react';
import type { MediaRef } from '@/lib/types';
import { Skeleton } from '@/components/ui/Skeleton';
import { Icon } from '@/components/ui/Icon';
import { useI18n } from '@/i18n/provider';
import s from './shelters.module.css';
export function CommunityPhoto({media}:{media?:MediaRef}) {
  // Keyed image state follows the actual URL, never a simulated timer.
  return <div className={s.photo}>{media?.src?<ImageBody key={media.src} media={media}/>:<Icon name="paw" size={44}/>}</div>;
}
function ImageBody({media}:{media:MediaRef}) {
  const [pending,setPending]=useState(true);const [failed,setFailed]=useState(false);const {m}=useI18n();
  return <>{pending?<Skeleton/>:null}{failed?<span role="status">{m.community.qr.error}</span>:
    // eslint-disable-next-line @next/next/no-img-element
    <img src={media.src} alt={media.alt} loading="lazy" decoding="async" onLoad={()=>setPending(false)} onError={()=>{setPending(false);setFailed(true);}}/>}</>;
}
