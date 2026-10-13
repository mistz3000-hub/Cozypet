'use client';
import { useCallback,useEffect,useMemo,useRef,useState } from 'react';
import { useI18n } from '@/i18n/provider';
import { useDonationOrders } from './hooks';
import { useShelters } from '@/features/shelters/useShelters';
import { DONATION_TARGETS,DONATION_SUPPLY_MAP } from '@/data/business';
import { PACKAGES } from '@/data/packages';
import { rankDonationTargets,donationTargetDetail } from '@/lib/balancer';
import { availableSlots } from '@/lib/capacity';
import { supplyLevel } from '@/lib/status';
import { useNow } from '@/lib/useNow';
import { helperName } from '@/features/helpers/helper-text';
import { CommunityPhoto } from '@/features/shelters/CommunityPhoto';
import { Dialog } from '@/components/ui/Dialog';
import { Button,ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import s from './critical-notice.module.css';

const SEEN='cozypet:critical-notice:session:v1';
export const CRITICAL_NOTICE_EVENT='cozypet:critical-notice:open';
/** First-visit UI state only; no order, request or donation is created by this notice. */
export function CriticalNotice(){
  const {m,f,locale,district}=useI18n();const a=m.community.alert;const [open,setOpen]=useState(false);const [active,setActive]=useState(true);const decided=useRef(false);const shared=useShelters(false,active);const orders=useDonationOrders();const now=useNow(open&&orders.length>0);
  const cases=useMemo(()=>{
    const helpers=[...DONATION_TARGETS,...shared.helpers].filter(h=>h.kind==='shelter'&&(h.isFictionalFoundation||h.publicPlaceId)&&!h.isRealOrganization);
    const supplies=new Map([...DONATION_SUPPLY_MAP,...shared.places.map(p=>[`community-${p.id}`,{helperId:`community-${p.id}`,foodDays:p.payload.foodDays,litterDays:p.payload.litterDays,recentPackages30d:0,updatedAt:p.updatedAt}] as const)]);
    const packages=new Map(PACKAGES.map(p=>[p.id,p]));const input={helpers,supplies,orders,packages,now:new Date(now||0)};
    return rankDonationTargets(input).items.flatMap(r=>{const h=helpers.find(h=>h.id===r.id)!;const detail=donationTargetDetail(h.id,supplies.get(h.id)!,input);return supplyLevel(detail.foodDays,detail.litterDays)==='critical'||availableSlots(h)===0?[{helper:h,detail}]:[];}).slice(0,3);
  },[shared.helpers,shared.places,orders,now]);
  useEffect(()=>{
    if(shared.loading||decided.current)return;
    decided.current=true;let seen=false;try{seen=sessionStorage.getItem(SEEN)==='1';}catch{/* UI remains usable when storage is blocked. */}
    if(seen||!cases.length){void Promise.resolve().then(()=>setActive(false));return;}
    try{sessionStorage.setItem(SEEN,'1');}catch{/* In-memory ref still prevents repeated opens. */}
    void Promise.resolve().then(()=>setOpen(true));
  },[shared.loading,cases]);
  useEffect(()=>{const show=()=>{setActive(true);setOpen(true);};window.addEventListener(CRITICAL_NOTICE_EVENT,show);return()=>window.removeEventListener(CRITICAL_NOTICE_EVENT,show);},[]);
  const close=useCallback(()=>{setOpen(false);setActive(false);},[]);const first=cases[0]?.helper;
  return <Dialog open={open} onClose={close} size="lg" className={s.panel} title={<span className={s.kicker}><Icon name="alert" size={18}/>{a.critical}<span className={s.demo}>{a.demo}</span></span>} footer={<><Button variant="ghost" onClick={close}>{a.later}</Button>{first?<ButtonLink variant="primary" href={`/donate?helper=${first.id}`} onClick={close} icon="heart">{a.help}</ButtonLink>:null}</>}>
    <div className={s.hero}><CommunityPhoto media={{src:'/media/critical/cozypet-critical-notice.webp',alt:a.imageAlt,creditId:'critical-notice-d30'}}/><div className={s.heroHeading}><span className={s.paw}><Icon name="paw" size={20}/></span><h2>{a.title}</h2></div></div>
    <p className={s.intro}>{a.intro}</p>
    {cases.length?<div className={s.cases}>{cases.map(({helper:h,detail})=><article className={s.case} key={h.id}><div className={s.caseHead}><span className={s.seal}><Icon name="heart" size={18}/></span><div><h3>{helperName(h,locale)}</h3><p>{district(h.districtId)}</p></div></div><p className={s.supply}>{f(m.business.foodLeft,{days:detail.foodDays})} · {m.common.simulated}</p><p className={s.capacity}>{f(m.business.crowded,{current:h.currentCount,total:h.capacityTotal,slots:availableSlots(h)})}</p><ButtonLink small href={h.publicPlaceId?`/shelters/${h.publicPlaceId}`:`/helpers/${h.id}`} iconRight="arrowRight" onClick={close}>{a.details}</ButtonLink></article>)}</div>:<p>{a.empty}</p>}
  </Dialog>;
}
