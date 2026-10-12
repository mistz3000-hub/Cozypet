'use client';
import { useId, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { PartnerBooking, Species } from '@/lib/types';
import { useI18n } from '@/i18n/provider';
import { newId, updateValue, useStore } from '@/lib/store';
import { useNow } from '@/lib/useNow';
import { bookingActive, deliveredOrders } from '@/lib/business';
import { BRANDS } from '@/data/brands';
import { AD_PLANS, CSR_CAMPAIGNS } from '@/data/business';
import { getHelper } from '@/data';
import { getPackage } from '@/data/packages';
import { helperName } from '@/features/helpers/helper-text';
import { useRun } from '@/features/demo/RequireRun';
import { DemoModeBar } from '@/features/shared/DemoModeBar';
import { useToast } from '@/components/providers/Toast';
import { Badge, Notice } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Checkbox, Field, RadioGroup, Select, Segmented } from '@/components/ui/Field';
import { Meter } from '@/components/ui/Meter';
import { PetImage } from '@/components/PetImage';
import { SponsorBanner } from './BusinessWidgets';
import { useDonationOrders } from './hooks';
import s from './business.module.css';

export function PartnersPage() {
  const { m, f, loc, money, locale, dateTime } = useI18n();
  const run = useRun()!;
  const params = useSearchParams();
  const id = useId();
  const toast = useToast();
  const state = useStore('businessState');
  const orders = useDonationOrders();
  const now = useNow(state.bookings.length > 0 || orders.length > 0);
  const [tab, setTab] = useState<'advertisement' | 'csr'>(params.get('tab') === 'csr' ? 'csr' : 'advertisement');
  const [brandId, setBrandId] = useState(BRANDS[0].id);
  const [species, setSpecies] = useState<Species | 'all'>('all');
  const [planId, setPlanId] = useState(AD_PLANS[0].id);
  const [ack, setAck] = useState(false);
  const [problem, setProblem] = useState('');
  const plan = AD_PLANS.find((p) => p.id === planId)!;
  const occupied = state.bookings.some((b) => b.kind === 'advertisement' && b.placement === plan.placement && bookingActive(b, new Date(now || 0)));
  const preview: PartnerBooking = { id: 'preview', runNumber: run.run, brandId, kind: 'advertisement', placement: plan.placement, species, durationDays: plan.days, feeTHB: plan.feeTHB, aidBudgetTHB: 0, createdAt: '', status: 'active', isDemo: true };
  const save = (campaignId?: string) => {
    if (!ack || !BRANDS.some((b) => b.id === brandId)) return;
    const createdAt = new Date().toISOString();
    const campaign = campaignId ? CSR_CAMPAIGNS.find((c) => c.id === campaignId) : undefined;
    const pkg = campaign ? getPackage(campaign.packageId)! : null;
    const bookingId = newId('sponsor');
    let conflict = false;
    const result = updateValue('businessState', (prev) => {
      conflict = prev.bookings.some((b) => bookingActive(b, new Date(createdAt)) && (campaign ? b.campaignId === campaign.id : b.kind === 'advertisement' && b.placement === plan.placement));
      if (conflict) return prev;
      const b: PartnerBooking = {
        id: bookingId, runNumber: run.run, brandId, kind: campaign ? 'csr' : 'advertisement', placement: campaign ? 'home' : plan.placement,
        species: campaign ? 'all' : species, durationDays: campaign ? 30 : plan.days, feeTHB: campaign?.promotionFeeTHB ?? plan.feeTHB,
        aidBudgetTHB: pkg && campaign ? pkg.priceTHB * campaign.goalPackages : 0, campaignId: campaign?.id,
        status: 'active', createdAt, isDemo: true,
        aidOrder: campaign && pkg ? { id: `csr-order-${bookingId}`, runNumber: run.run, helperId: campaign.helperId, packageId: pkg.id,
          quantity: campaign.goalPackages, unitPriceTHB: pkg.priceTHB, platformSharePct: 0, source: 'csr', sponsorshipBookingId: bookingId,
          settlementStage: 'partner_paid', fulfillmentStartedAt: createdAt, createdAt, status: 'active', isDemo: true } : undefined,
      };
      return { ...prev, bookings: [...prev.bookings, b] };
    });
    if (conflict) { setProblem(campaign ? m.business.campaignTaken : m.business.occupied); return; }
    if (result === 'quota') { setProblem(m.business.failed); return; }
    setProblem(''); setAck(false); toast(m.business.saved);
  };
  const cancel = (id: string) => {
    const result = updateValue('businessState', (prev) => ({ ...prev, bookings: prev.bookings.map((b) => b.id === id && b.runNumber === run.run ? { ...b, status: 'cancelled' } : b) }));
    toast(result === 'quota' ? m.business.failed : m.business.cancelled);
  };
  return <div className={`cp-container cp-page ${s.page}`}>
    <DemoModeBar next="/partners" />
    <header><Badge tone="butter" icon="star">{m.business.demo}</Badge><h1>{m.business.partners}</h1><p className={s.lead}>{m.business.partnersIntro}</p><Notice tone="butter">{m.business.note}</Notice></header>
    <section className={s.panel} data-tour="business-partners">
      <Segmented name={`${id}-tab`} label={m.business.partners} value={tab} onChange={(v) => { setTab(v); setProblem(''); setAck(false); }} options={[{ value: 'advertisement', label: m.business.ad }, { value: 'csr', label: m.business.csr }]} />
      <Field id={`${id}-brand`} label={m.business.brand}><Select id={`${id}-brand`} value={brandId} onChange={(e) => setBrandId(e.target.value)}>{BRANDS.map((b) => <option key={b.id} value={b.id}>{loc(b.name)}</option>)}</Select></Field>
      {tab === 'advertisement' ? <>
        <RadioGroup name={`${id}-plan`} legend={m.business.adPlan} value={planId} onChange={setPlanId} options={AD_PLANS.map((p) => ({ value: p.id, label: `${p.placement === 'home' ? m.business.home : m.business.dashboard} · ${f(m.business.days, { n: p.days })}`, description: money(p.feeTHB) }))} />
        <Field id={`${id}-sp`} label={m.business.context}><Select id={`${id}-sp`} value={species} onChange={(e) => setSpecies(e.target.value as Species | 'all')}><option value="all">{m.business.all}</option><option value="cat">{m.species.cat}</option><option value="dog">{m.species.dog}</option></Select></Field>
        <SponsorBanner placement={plan.placement} preview={preview} />
        <p><strong>{m.business.fee}: {money(plan.feeTHB)}</strong> · {f(m.business.days, { n: plan.days })}</p>
        <Checkbox checked={ack} onChange={setAck}>{m.business.ack}</Checkbox>
        {occupied ? <Notice>{m.business.occupied}</Notice> : null}
        <div className={s.actions}><Button disabled={!ack || occupied} variant="primary" icon="star" onClick={() => save()}>{m.business.book}</Button></div>
      </> : <>
        <p className={s.lead}>{m.business.sponsorNote}</p>
        <Checkbox checked={ack} onChange={setAck}>{m.business.ack}</Checkbox>
        <div className={s.grid}>{CSR_CAMPAIGNS.map((c) => {
          const h = getHelper(c.helperId)!;
          const p = getPackage(c.packageId)!;
          const b = state.bookings.find((b) => b.campaignId === c.id && bookingActive(b, new Date(now || 0)));
          const brand = BRANDS.find((brand) => brand.id === b?.brandId);
          const delivered = deliveredOrders(orders, h.id, new Date(now || 0)).filter((o) => o.packageId === p.id).reduce((n, o) => n + o.quantity, 0);
          return <article key={c.id} className={s.case}><PetImage media={h.images.place?.[0]} ratio="16 / 9" rounded={false} cover /><div className={s.caseBody}><Badge tone="butter">{m.business.foundation}</Badge><h3>{loc(c.title)}</h3><p>{helperName(h, locale)}</p><p className={s.muted}>{f(m.business.campaignGoal, { n: c.goalPackages })} · {loc(p.name)}</p><Meter value={Math.min(delivered, c.goalPackages)} max={c.goalPackages} label={loc(c.title)} level="gold" valueText={f(m.business.campaignProgress, { n: delivered, goal: c.goalPackages })} />
            <dl className={s.list}><div><dt>{m.business.aidBudget}</dt><dd>{money(p.priceTHB * c.goalPackages)}</dd></div><div><dt>{m.business.csrFee}</dt><dd>{money(c.promotionFeeTHB)}</dd></div><div><dt>{m.business.sponsorTotal}</dt><dd><strong>{money(p.priceTHB * c.goalPackages + c.promotionFeeTHB)}</strong></dd></div></dl>
            <div className={s.caseActions}>{brand ? <Badge tone="open" icon="star">{f(m.business.sponsorBrand, { brand: loc(brand.name) })}</Badge> : <Button variant="primary" disabled={!ack} onClick={() => save(c.id)}>{m.business.sponsor}</Button>}
            {b?.aidOrder ? <ButtonLink small href={`/donate/orders/${b.aidOrder.id}`} icon="box">{m.business.sponsoredOrder}</ButtonLink> : null}<ButtonLink small variant="ghost" href={`/helpers/${h.id}`} iconRight="arrowRight">{m.chat.viewHelper}</ButtonLink>
            </div></div></article>;
        })}</div>
      </>}
      {problem ? <Notice tone="error" role="alert">{problem}</Notice> : null}
    </section>
    <section className={s.panel}><h2>{m.business.history}</h2><ul className={s.list}>{state.bookings.filter((b) => b.runNumber === run.run).slice().reverse().map((b) => <li key={b.id} className={s.row}><div><strong>{b.kind === 'csr' ? m.business.csr : m.business.ad} · {loc(BRANDS.find((x) => x.id === b.brandId)!.name)}</strong><p className={s.muted}>{money(b.feeTHB + b.aidBudgetTHB)} · {dateTime(b.createdAt)}</p></div><Badge tone={b.status === 'cancelled' ? 'neutral' : 'open'}>{b.status === 'cancelled' ? m.business.cancelled : bookingActive(b, new Date(now || 0)) ? m.business.active : m.business.expired}</Badge>{b.status === 'active' ? <Button small variant="ghost" onClick={() => cancel(b.id)}>{m.business.cancel}</Button> : null}</li>)}</ul></section>
    <ButtonLink href="/dashboard" icon="chart">{m.business.revenueTitle}</ButtonLink>
  </div>;
}
