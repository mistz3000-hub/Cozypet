'use client';
import Link from 'next/link';
import { useId, useState } from 'react';
import type { DonationOrder, PartnerBooking } from '@/lib/types';
import { useI18n } from '@/i18n/provider';
import { useDemoSession, useStore, updateValue, newId } from '@/lib/store';
import { useNow } from '@/lib/useNow';
import { bookingActive, moneySplit, poolPackage, poolOrders, revenueSummary } from '@/lib/business';
import { getHelper } from '@/data';
import { BRANDS } from '@/data/brands';
import { PACKAGES, getPackage } from '@/data/packages';
import { DEMO_FOUNDATIONS } from '@/data/demo-foundations';
import { DONATION_TARGETS, DONATION_SUPPLY_MAP, CSR_CAMPAIGNS } from '@/data/business';
import { donationTargetDetail, rankDonationTargets } from '@/lib/balancer';
import { supplyLevel } from '@/lib/status';
import { availableSlots } from '@/lib/capacity';
import { useRun } from '@/features/demo/RequireRun';
import { helperName } from '@/features/helpers/helper-text';
import { useToast } from '@/components/providers/Toast';
import { PetImage } from '@/components/PetImage';
import { Badge, Notice } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Field, Select, Checkbox } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { Meter } from '@/components/ui/Meter';
import { CountUp } from '@/components/ui/CountUp';
import { useDonationOrders } from './hooks';
import { PetFrame, PetStat } from './PetFrame';
import s from './business.module.css';
import p from './profile-credit.module.css';

export function SponsorBanner({ placement, preview }: { placement: 'home' | 'dashboard'; preview?: PartnerBooking }) {
  const { m, loc, f } = useI18n();
  const [{ mascot }] = useDemoSession();
  const state = useStore('businessState');
  const now = useNow(state.bookings.length > 0);
  const candidates = [...state.bookings].reverse().filter((b) => b.placement === placement && bookingActive(b, new Date(now || 0)) && (b.species === 'all' || b.species === mascot));
  const booking = preview ?? candidates.find((b) => b.kind === 'advertisement') ?? candidates[0];
  const brand = BRANDS.find((b) => b.id === booking?.brandId) ?? BRANDS[0];
  const campaign = CSR_CAMPAIGNS.find((c) => c.id === booking?.campaignId);
  const h = getHelper(campaign?.helperId) ?? DEMO_FOUNDATIONS[0];
  return <aside id={`sponsor-${placement}`} className={s.banner} aria-label={preview ? m.business.preview : m.business.sponsored} data-tour="business-banner">
    <div>
      <Badge tone="butter" icon="star">{preview ? m.business.preview : booking ? m.business.sponsored : m.business.bannerSample}</Badge>
      <h3>{campaign ? loc(campaign.title) : m.business.bannerTitle}</h3>
      <p className={s.lead}>{m.business.bannerText}</p>
      <p className={s.brand}><Icon name="paw" /> {booking ? f(m.business.sponsorBrand, { brand: loc(brand.name) }) : loc(brand.name)}</p>
      {!preview ? <div className={s.actions}><ButtonLink small variant="primary" href={campaign ? `/helpers/${h.id}` : '/donate'} icon="box">{m.business.bannerCta}</ButtonLink><ButtonLink small variant="ghost" href="/partners" iconRight="arrowRight">{m.business.partners}</ButtonLink></div> : null}
      <p className={s.note}>{m.business.targetingNote}</p>
    </div>
    <PetImage media={h.images.place?.[0]} ratio="1 / 1" className={s.bannerImage} />
  </aside>;
}

export function MoneyFlow({ order, preview = false, onAdvance }: { order: DonationOrder; preview?: boolean; onAdvance?: () => void }) {
  const { m, money } = useI18n();
  const split = moneySplit(order, getPackage(order.packageId));
  const stage = order.settlementStage ?? 'partner_paid';
  const index = stage === 'received' ? 0 : stage === 'commissioned' ? 1 : 2;
  const rows = [{ title: m.business.received, amount: split.gross }, { title: m.business.commission, amount: split.commission }, { title: m.business.partnerPaid, amount: split.partner }];
  return <section id="money-flow" className={s.panel} data-tour="business-money-flow">
    <div className={s.head}><h3>{m.business.flowTitle}</h3><Badge tone="butter">{m.business.demo}</Badge></div>
    <ol className={s.flow} aria-live="polite">{rows.map((r, i) => <li key={r.title} data-done={!preview && i <= index ? 'true' : undefined}><span className={s.stepIcon}>{i + 1}<Icon name={i <= index && !preview ? 'check' : 'arrowRight'} size={18} /></span><p>{r.title}</p><strong>{money(r.amount)}</strong>{i === 1 ? <span className={s.muted}>{split.pct}%</span> : null}</li>)}</ol>
    <p className={s.lead}>{m.business.flowNote}</p><p className={s.note}>{m.business.zeroFee}</p>
    {!preview && order.status === 'active' ? <div className={s.actions}>{index < 2 && onAdvance ? <Button variant="primary" iconRight="arrowRight" onClick={onAdvance}>{index === 0 ? m.business.split : m.business.transfer}</Button> : <Badge tone="open" icon="check">{m.business.sent}</Badge>}</div> : null}
  </section>;
}

export function MicroDonationTracker({ helperId: preset }: { helperId?: string }) {
  const { m, f, money, locale, loc } = useI18n();
  const [{ mascot }] = useDemoSession();
  const state = useStore('businessState');
  const run = useRun();
  const id = useId();
  const toast = useToast();
  const [helperId, setHelperId] = useState(preset ?? DEMO_FOUNDATIONS[0].id);
  const [ack, setAck] = useState(false);
  const h = getHelper(helperId)!;
  const pkg = poolPackage(helperId);
  const revenue = revenueSummary([], state);
  const pool = revenue.pools.find((p) => p.helperId === helperId)!;
  const donations = state.microDonations.filter((d) => d.helperId === helperId);
  const total = state.microDonations.reduce((n, d) => n + d.amountTHB, 0);
  const orders = poolOrders(state).filter((o) => o.helperId === helperId);
  const give = (amountTHB: number) => {
    if (!run || !ack) return;
    const result = updateValue('businessState', (s) => ({ ...s, microDonations: [...s.microDonations, { id: newId('micro'), runNumber: run.run, helperId, amountTHB, createdAt: new Date().toISOString(), isDemo: true }] }));
    toast(result === 'quota' ? m.business.failed : m.business.saved);
  };
  return <PetFrame mascot={mascot} id="micro-donations" className={s.micro} data-tour="micro-donation">
    <div className={s.head}><h2>{m.business.microTitle}</h2><Badge tone="butter" icon="heart">{m.business.demo}</Badge></div>
    <p className={s.lead}>{m.business.microIntro}</p>
    <div className={s.microSummary}><div><p className={s.muted}>{m.business.microTotal}</p><p className={s.money}><CountUp value={total} format={money} /></p></div><Badge tone="info">{f(m.business.microCount, { n: state.microDonations.length })}</Badge></div>
    {!preset ? <Field id={`${id}-target`} label={m.donate.recipient}><Select id={`${id}-target`} value={helperId} onChange={(e) => setHelperId(e.target.value)}>{DEMO_FOUNDATIONS.map((h) => <option key={h.id} value={h.id}>{helperName(h, locale)}</option>)}</Select></Field> : <h3>{helperName(h, locale)}</h3>}
    <dl className={`${p.creditGrid} ${p.compactStats}`} data-pool-credit>
      <PetStat mascot={mascot} label={m.business.microPool} icon="heart"><CountUp value={pool.balance} format={money} /></PetStat>
      <PetStat mascot={mascot} label={m.business.microSpent} icon="box"><CountUp value={pool.spent} format={money} /></PetStat>
      <PetStat mascot={mascot} label={m.business.microCount.replace('{n} ', '')} icon="paw"><CountUp value={donations.length} /></PetStat>
    </dl>
    <p>{f(m.business.microNext, { package: loc(pkg.name), price: money(pkg.priceTHB) })}</p>
    <Meter value={pool.balance} max={pkg.priceTHB} label={m.business.microPool} level="gold" valueText={`${money(pool.balance)} / ${money(pkg.priceTHB)}`} />
    {run ? <><Checkbox checked={ack} onChange={setAck}>{m.business.microAck}</Checkbox><div className={s.actions}>{[50, 100].map((n) => <Button key={n} disabled={!ack} variant="primary" icon="heart" onClick={() => give(n)}>{f(m.business.microGive, { amount: money(n) })}</Button>)}</div></> : <ButtonLink href="/start?next=/dashboard" variant="primary" icon="heart">{m.start.submit}</ButtonLink>}
    <p className={s.note}>{m.business.liveNote}</p>
    {orders.length ? <><h3>{m.business.microOrders}</h3><ul className={s.list}>{orders.slice(-3).reverse().map((o) => <li key={o.id} className={s.row}><Link href={`/donate/orders/${o.id}`}>{loc(pkg.name)}</Link><span>{money(o.unitPriceTHB)}</span></li>)}</ul></> : null}
  </PetFrame>;
}

export function CrisisCards() {
  const { m, f, district, locale } = useI18n();
  const orders = useDonationOrders();
  const now = useNow(orders.length > 0);
  const ranking = rankDonationTargets({ helpers: DONATION_TARGETS, supplies: DONATION_SUPPLY_MAP, orders, packages: new Map(PACKAGES.map((p) => [p.id, p])), now: new Date(now || 0) });
  const top = ranking.items.filter((r) => {
    const h = getHelper(r.id)!;
    const base = DONATION_SUPPLY_MAP.get(h.id)!;
    const detail = donationTargetDetail(h.id, base, { orders, packages: new Map(PACKAGES.map((p) => [p.id, p])), now: new Date(now || 0) });
    return h.isFictionalFoundation && (supplyLevel(detail.foodDays, detail.litterDays) === 'critical' || availableSlots(h) === 0);
  }).slice(0, 3);
  return <section id="crisis-cases" data-tour="crisis-cases"><div className={s.head}><h2>{m.business.campaignTitle}</h2><ButtonLink href="/partners?tab=csr" small iconRight="arrowRight">{m.business.csr}</ButtonLink></div><div className={s.grid}>{top.map((r) => {
    const h = getHelper(r.id)!;
    const detail = donationTargetDetail(h.id, DONATION_SUPPLY_MAP.get(h.id)!, { orders, packages: new Map(PACKAGES.map((p) => [p.id, p])), now: new Date(now || 0) });
    return <article className={s.case} key={h.id}><PetImage media={h.images.place?.[0]} ratio="16 / 9" rounded={false} cover /><div className={s.caseBody}><Badge tone="full" icon="alert">{m.business.crisis}</Badge><h3>{helperName(h, locale)}</h3><p className={s.muted}>{district(h.districtId)}</p><p>{f(m.business.foodLeft, { days: detail.foodDays })}</p>{detail.litterDays !== undefined ? <p className={s.muted}>{f(m.supply.litter, { days: detail.litterDays })}</p> : null}<p className={s.muted}>{f(m.business.crowded, { current: h.currentCount, total: h.capacityTotal, slots: availableSlots(h) })}</p><div className={s.caseActions}><ButtonLink href={`/helpers/${h.id}`} variant="primary" small icon="box">{m.helper.sendPackage}</ButtonLink></div></div></article>;
  })}</div>{!top.length ? <Notice icon="heart">{m.dashboard.urgentEmpty}</Notice> : null}</section>;
}

export function RevenuePanel() {
  const { m, money, loc, dateTime } = useI18n();
  const state = useStore('businessState');
  const donorOrders = useStore('donationOrders');
  const summary = revenueSummary(donorOrders, state);
  const rows = [...donorOrders, ...poolOrders(state)].filter((o) => o.status === 'active').sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);
  return <section id="platform-revenue" className={s.panel} data-tour="business-revenue"><div className={s.head}><h2>{m.business.revenueTitle}</h2><ButtonLink small href="/partners" icon="star">{m.business.partners}</ButtonLink></div><p className={s.lead}>{m.business.revenueNote}</p><p className={s.muted}>{m.business.revenueTotal}</p><p className={s.money}><CountUp value={summary.total} format={money} /></p>
    <dl className={s.stats}>{[{ label: m.business.commission, value: summary.commission }, { label: m.business.adRevenue, value: summary.advertising }, { label: m.business.csrRevenue, value: summary.csr }, { label: m.business.paidToBrands, value: summary.paidToBrands }, { label: m.business.balance, value: summary.pending }].map((r) => <div key={r.label} className={s.stat}><dt>{r.label}</dt><dd>{money(r.value)}</dd></div>)}</dl>
    {rows.length ? <><h3>{m.business.ledger}</h3><div className={s.scroll}><table className={s.table}><thead><tr><th>{m.donate.package}</th><th>{m.business.gross}</th><th>{m.business.commission}</th><th>{m.business.partnerPaid}</th></tr></thead><tbody>{rows.map((o) => { const p = getPackage(o.packageId); const split = moneySplit(o, p); return <tr key={o.id}><td><Link href={`/donate/orders/${o.id}`}>{p ? loc(p.name) : o.packageId}</Link><br /><small>{dateTime(o.createdAt)}</small></td><td>{money(split.gross)}</td><td>{money(o.settlementStage === 'received' ? 0 : split.commission)}</td><td>{money(!o.settlementStage || o.settlementStage === 'partner_paid' ? split.partner : 0)}</td></tr>; })}</tbody></table></div></> : <p className={s.muted}>{m.business.noRevenue}</p>}
    <p className={s.note}>{m.business.note}</p>
  </section>;
}
