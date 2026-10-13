'use client';
import { useState } from 'react';
import { useI18n } from '@/i18n/provider';
import { hypotheticalDonationTax } from '@/lib/donation-tax';
import { useDemoSession,useStore } from '@/lib/store';
import { useDonationOrders } from '@/features/business/hooks';
import { PetFrame,PetStat } from '@/features/business/PetFrame';
import { getPackage } from '@/data/packages';
import { getHelper } from '@/data';
import { helperName } from '@/features/helpers/helper-text';
import { orderTotalTHB } from '@/lib/orders';
import { Button,ButtonLink } from '@/components/ui/Button';
import { Field,TextInput } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Badge';
import p from '@/features/business/profile-credit.module.css';
import s from '@/features/shelters/shelters.module.css';
export function DonationTaxPage(){
  const {m,money,loc,locale,dateTime}=useI18n();const t=m.community.tax;const [{mascot,runNumber}]=useDemoSession();const [income,setIncome]=useState(500000);const [gift,setGift]=useState(10000);const calc=hypotheticalDonationTax(income,gift);
  const orders=useDonationOrders().filter(o=>o.runNumber===runNumber&&o.status==='active');const micro=useStore('businessState').microDonations.filter(d=>d.runNumber===runNumber);
  return <div className={`cp-container cp-page ${s.page}`}><div className={s.print}>{t.watermark}</div><header><h1>{t.title}</h1><p>{t.intro}</p></header><Notice tone="butter">{t.demo}</Notice>
    <PetFrame mascot={mascot}><h2>{t.eligibility}</h2><p>{t.rules}</p><p>{t.money}</p><h3>{t.sources}</h3><ul><li><a href="https://www.rd.go.th/29157.html" target="_blank" rel="noopener noreferrer">{t.orgs}</a></li><li><a href="https://www.rd.go.th/region/04/saraburi/85/6868.html" target="_blank" rel="noopener noreferrer">{t.edonation}</a></li><li><a href="https://www.rd.go.th/60062.html" target="_blank" rel="noopener noreferrer">{t.faq}</a></li></ul></PetFrame>
    <PetFrame mascot={mascot} className={s.noPrint}><h2>{t.calculator}</h2><p className={s.muted}>{t.calcHint}</p><div className={s.columns}><Field id="tax-income" label={t.income}><TextInput id="tax-income" type="number" min={0} max={100000000} value={income} onChange={e=>setIncome(Number(e.target.value))}/></Field><Field id="tax-gift" label={t.amount}><TextInput id="tax-gift" type="number" min={0} max={100000000} value={gift} onChange={e=>setGift(Number(e.target.value))}/></Field></div><dl className={`${p.creditGrid} ${p.compactStats}`}><PetStat mascot={mascot} label={t.allowed} icon="heart">{money(calc.deduction)}</PetStat><PetStat mascot={mascot} label={t.saving} icon="chart">{money(calc.saving)}</PetStat></dl></PetFrame>
    <PetFrame mascot={mascot}><h2>{t.receipt}</h2><Notice tone="butter">{t.watermark}</Notice>{!orders.length&&!micro.length?<p>{t.empty}</p>:<div className={s.list}>{orders.map(o=>{const pkg=getPackage(o.packageId);const h=getHelper(o.helperId);return <div className={s.item} key={o.id}><strong>{pkg?loc(pkg.name):o.packageId} × {o.quantity}</strong><p>{h?helperName(h,locale):o.recipientSnapshot?.name??o.helperId} · {dateTime(o.createdAt)}</p><p>{money(orderTotalTHB(o))} · {m.business.demo}</p></div>;})}{micro.map(d=><div className={s.item} key={d.id}><strong>{m.business.microTitle} · {money(d.amountTHB)}</strong><p>{dateTime(d.createdAt)} · {m.business.demo}</p></div>)}</div>}<div className={`${s.actions} ${s.noPrint}`}><Button icon="doc" onClick={()=>window.print()}>{t.print}</Button><ButtonLink href="/donate">{m.donate.title}</ButtonLink></div></PetFrame>
  </div>;
}
