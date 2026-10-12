'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useI18n } from '@/i18n/provider';
import { useStore, getValue, updateValue, setValue } from '@/lib/store';
import { remove, STORE_KEYS } from '@/lib/storage';
import { useRun } from '@/features/demo/RequireRun';
import { useKindness } from '@/features/shared/records';
import { ActivityList, DemoModeBar } from '@/features/shared/DemoModeBar';
import { getHelper } from '@/data';
import { getPackage } from '@/data/packages';
import { helperName } from '@/features/helpers/helper-text';
import { orderTotalTHB } from '@/lib/orders';
import { Badge, Notice } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import s from './business.module.css';

export function ProfilePage() {
  const { m, f, money, loc, locale, dateTime } = useI18n();
  const run = useRun()!;
  const state = useStore('businessState');
  const donorOrders = useStore('donationOrders').filter((o) => o.runNumber === run.run);
  const handoffs = useStore('handoffs').filter((h) => h.runNumber === run.run);
  const requests = useStore('careRequests').filter((r) => r.runNumber === run.run);
  const micro = state.microDonations.filter((d) => d.runNumber === run.run);
  const kindness = useKindness();
  const [resetOpen, setResetOpen] = useState(false);
  const reset = () => {
    for (const key of STORE_KEYS) { if (key === 'demoSession') continue; remove(key); setValue(key, getValue(key)); }
    updateValue('demoSession', (s) => ({ ...s, findingIndexByRun: {}, updatedAt: new Date().toISOString() }));
    setResetOpen(false);
  };
  const active = donorOrders.filter((o) => o.status === 'active');
  const total = active.reduce((n, o) => n + orderTotalTHB(o), 0) + micro.reduce((n, d) => n + d.amountTHB, 0);
  const stats = [{ label: m.business.donated, value: money(total) }, { label: m.business.donationCount, value: active.length + micro.length },
    { label: m.business.adopted, value: handoffs.filter((h) => h.mode === 'adopt').length }, { label: m.business.fostered, value: handoffs.filter((h) => h.mode !== 'adopt').length },
    { label: m.business.pendingRequests, value: requests.filter((r) => r.status === 'pending_contact').length }];
  return <div className={`cp-container cp-page ${s.page}`}><DemoModeBar next="/profile" /><header><Badge tone="butter">{f(m.business.reviewer, { run: String(run.run).padStart(3, '0') })}</Badge><h1>{m.business.profileTitle}</h1><p className={s.lead}>{m.business.profileNote}</p></header>
    <section className={s.panel} data-tour="profile-credit"><dl className={s.stats}>{stats.map((x) => <div key={x.label} className={s.stat}><dt>{x.label}</dt><dd>{x.value}</dd></div>)}</dl></section>
    <section id="kindness" className={s.panel}><h2>{m.kindness.level[kindness.level]} · {f(m.kindness.chip, { n: kindness.total })}</h2><ActivityList items={kindness.activities} /></section>
    <section className={s.panel}><h2>{m.business.profileOrders}</h2>{donorOrders.length ? <ul className={s.list}>{donorOrders.map((o) => { const h = getHelper(o.helperId); const p = getPackage(o.packageId); return <li key={o.id} className={s.row}><Link href={`/donate/orders/${o.id}`}>{p ? loc(p.name) : o.packageId} × {o.quantity}<p className={s.muted}>{h ? helperName(h, locale) : o.helperId} · {dateTime(o.createdAt)}</p></Link><span>{o.status === 'cancelled' ? m.orders.cancelled : money(orderTotalTHB(o))}</span></li>; })}</ul> : <p className={s.muted}>{m.business.profileEmpty}</p>}</section>
    <section className={s.panel}><h2>{m.business.profileMicro}</h2><ul className={s.list}>{micro.slice().reverse().map((d) => { const h = getHelper(d.helperId); return <li key={d.id} className={s.row}><Link href={`/helpers/${d.helperId}`}>{h ? helperName(h, locale) : d.helperId}<p className={s.muted}>{dateTime(d.createdAt)}</p></Link><strong>{money(d.amountTHB)}</strong></li>; })}</ul>{!micro.length ? <p className={s.muted}>{m.business.profileEmpty}</p> : null}</section>
    <section id="handoffs" className={s.panel}><h2>{m.business.fostered} / {m.business.adopted}</h2><ul className={s.list}>{handoffs.map((h) => <li key={h.id} className={s.row}><span>{h.petName} · {h.mode === 'adopt' ? m.business.adopted : m.business.fostered}</span><span className={s.muted}>{dateTime(h.createdAt)}</span></li>)}</ul></section>
    <section className={s.panel}><h2>{m.business.pendingRequests}</h2><ul className={s.list}>{requests.filter((r) => r.status === 'pending_contact').map((r) => <li key={r.id} className={s.row}><Link href={`/requests/${r.id}`}>{m.requests.type[r.type] ?? r.type}</Link><span>{dateTime(r.createdAt)}</span></li>)}</ul></section>
    <Notice>{m.business.note}</Notice><div className={s.actions}><ButtonLink href="/donate" variant="primary" icon="box">{m.helper.sendPackage}</ButtonLink><ButtonLink href="/partners" icon="star">{m.business.partners}</ButtonLink><ButtonLink href="/start" icon="user">{m.start.title}</ButtonLink></div>
    <section id="reset" className={s.panel}><h2>{m.profile.resetTitle}</h2><p>{m.profile.resetDemoText}</p><p className={s.muted}>{m.business.resetBusiness}</p><Button icon="refresh" onClick={() => setResetOpen(true)}>{m.profile.resetDemo}</Button></section>
    <Dialog open={resetOpen} onClose={() => setResetOpen(false)} title={m.profile.resetTitle} size="sm" footer={<><Button onClick={() => setResetOpen(false)}>{m.common.cancel}</Button><Button variant="danger" onClick={reset}>{m.profile.resetDemo}</Button></>}><p>{m.profile.resetDemoText}</p><p>{m.business.resetBusiness}</p></Dialog>
  </div>;
}
