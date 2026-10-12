'use client';
import { useId, useState } from 'react';
import type { HelperProfile } from '@/lib/types';
import { useI18n } from '@/i18n/provider';
import { availableSlots } from '@/lib/capacity';
import { useCurrentFinding, useRun } from '@/features/demo/RequireRun';
import { RecommendPopup, type PopupRequest } from '@/features/balancer/RecommendPopup';
import { useHelperSupplies } from '@/features/helpers/supplies';
import { helperName } from '@/features/helpers/helper-text';
import { PACKAGES } from '@/data/packages';
import { useStore } from '@/lib/store';
import { BRANDS } from '@/data/brands';
import { PetImage } from '@/components/PetImage';
import { Badge, Notice } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { BangkokMap } from '@/components/map/BangkokMap';
import { CommunityPanel } from './CommunityPanel';
import { MicroDonationTracker } from './BusinessWidgets';
import s from './business.module.css';

export function FoundationPage({ helper: h }: { helper: HelperProfile }) {
  const { m, f, loc, money, locale, district } = useI18n();
  const id = useId();
  const run = useRun();
  const finding = useCurrentFinding();
  const sup = useHelperSupplies(h.id, true);
  const slots = availableSlots(h);
  const [popup, setPopup] = useState<PopupRequest | null>(slots === 0 ? { sourceId: h.id, blocker: 'full' } : null);
  const state = useStore('businessState');
  const sponsor = state.bookings.find((b) => b.status === 'active' && b.aidOrder?.helperId === h.id);
  const brand = BRANDS.find((b) => b.id === sponsor?.brandId);
  return <div className={`cp-container cp-page ${s.page}`}>
    <ButtonLink small variant="ghost" href="/nearby" icon="arrowLeft">{m.helperPage.back}</ButtonLink>
    <header className={s.two}><PetImage media={h.images.place?.[0]} ratio="4 / 3" /><div><Badge tone="butter">{m.business.foundation}</Badge><h1>{helperName(h, locale)}</h1><p className={s.lead}>{m.business.detailIntro}</p><p>{district(h.districtId)} · {h.speciesAccepted.map((sp) => m.species[sp]).join(' / ')}</p><p>{f(m.business.crowded, { current: h.currentCount, total: h.capacityTotal, slots })}</p><p>{f(m.business.foodLeft, { days: sup?.foodDays ?? 0 })}</p>
      {sup?.litterDays !== undefined ? <p>{f(m.supply.litter, { days: sup.litterDays })} {m.supply.demo}</p> : null}
      {brand ? <Badge tone="gold" icon="star">{f(m.business.sponsorBrand, { brand: loc(brand.name) })}</Badge> : null}
      <div className={s.actions}><ButtonLink href={`/donate?helper=${h.id}`} variant="primary" icon="box">{m.helper.sendPackage}</ButtonLink><ButtonLink href="/partners" icon="star">{m.business.csr}</ButtonLink>{slots === 0 && run ? <Button onClick={() => setPopup({ sourceId: h.id, blocker: 'full' })} icon="pin">{m.popup.titleFull}</Button> : null}</div>
    </div></header>
    <Notice tone="butter">{m.business.note}</Notice>
    <section aria-labelledby={`${id}-packages`}><h2 id={`${id}-packages`}>{m.business.detailPackages}</h2><div className={s.grid}>{PACKAGES.filter((p) => p.species.some((sp) => h.speciesAccepted.includes(sp))).map((p) => <article key={p.id} className={s.panel}><h3>{loc(p.name)}</h3><p className={s.money}>{money(p.priceTHB)}</p><p className={s.muted}>{p.items.map(loc).join(' · ')}</p><ButtonLink href={`/donate?helper=${h.id}&package=${p.id}`} variant="primary" small icon="box">{m.donate.choose}</ButtonLink></article>)}</div></section>
    <MicroDonationTracker helperId={h.id} />
    <CommunityPanel helper={h} />
    <BangkokMap mini pins={[{ id: h.id, location: h.location, kind: 'shelter', level: slots === 0 ? 'full' : slots / h.capacityTotal < .15 ? 'tight' : 'open', label: helperName(h, locale) }]} />
    {run && finding ? <RecommendPopup request={popup} onClose={() => setPopup(null)} species={h.speciesAccepted[0]} urgency="normal" searchPoint={finding.searchPoint} run={run.run} finding={finding.findingIndex} /> : null}
  </div>;
}
