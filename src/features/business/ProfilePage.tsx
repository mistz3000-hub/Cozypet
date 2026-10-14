'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useI18n } from '@/i18n/provider';
import { useStore, getValue, updateValue, setValue, useDemoSession } from '@/lib/store';
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
import { Icon, type IconName } from '@/components/ui/Icon';
import { PawPrint } from '@/components/ui/PawPrint';
import { CountUp } from '@/components/ui/CountUp';
import { PetFrame, PetStat } from './PetFrame';
import s from './business.module.css';
import p from './profile-credit.module.css';
import { RoleChooser } from '@/features/shelters/RoleChooser';
import { GoogleProfileCard } from '@/features/auth/GoogleProfileCard';

export function ProfilePage() {
  const { m, f, money, loc, locale, dateTime } = useI18n();
  const run = useRun()!;
  const [session] = useDemoSession();
  const mascot = session.mascot;
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
  const stats: { label: string; value: number; icon: IconName; format?: (n: number) => string }[] = [
    { label: m.business.donated, value: total, icon: 'heart', format: money }, { label: m.business.donationCount, value: active.length + micro.length, icon: 'box' },
    { label: m.business.adopted, value: handoffs.filter((h) => h.mode === 'adopt').length, icon: 'home' },
    { label: m.business.fostered, value: handoffs.filter((h) => h.mode !== 'adopt').length, icon: 'heartArrow' },
    { label: m.business.pendingRequests, value: requests.filter((r) => r.status === 'pending_contact').length, icon: 'chat' },
  ];
  return <div className={`cp-container cp-page ${s.page} ${p.profile}`}><DemoModeBar next="/profile" />
    <header className={p.pageHeader}><div><Badge tone="butter">{f(m.business.reviewer, { run: String(run.run).padStart(3, '0') })}</Badge><h1>{m.business.profileTitle}</h1><p className={s.lead}>{m.business.profileNote}</p></div><span className={p.petChip} data-pet={mascot}><PawPrint kind={mascot} />{mascot === 'cat' ? m.mascot.cat : m.mascot.dog}</span></header>
    <GoogleProfileCard variant="profile" mascot={mascot} />
    <RoleChooser/>
    <ButtonLink href="/donation-tax" icon="doc">{m.community.tax.receipt}</ButtonLink>
    <PetFrame mascot={mascot} id="profile-credit" data-tour="profile-credit">
      <div className={p.creditHeader}><div className={p.creditHeading}><span className={p.seal}><PawPrint kind={mascot} /></span><div><span className={p.eyebrow}>{m.business.creditEyebrow}</span><h2>{m.business.creditTitle}</h2><p>{m.business.creditIntro}</p></div></div><span className={p.levelBadge}><Icon name="heart" size={16} />{m.kindness.level[kindness.level]}</span></div>
      <dl className={p.creditGrid}>{stats.map((x) => <PetStat key={x.label} mascot={mascot} label={x.label} icon={x.icon}><CountUp value={x.value} format={x.format} /></PetStat>)}</dl>
    </PetFrame>
    <PetFrame mascot={mascot} id="kindness"><div className={p.kindnessHeader}><div><span className={p.eyebrow}>{m.business.kindnessEyebrow}</span><h2>{m.kindness.historyTitle}</h2></div><div className={p.kindnessScore}><PawPrint kind={mascot} width={32} height={32} /><strong><CountUp value={kindness.total} /></strong><span>{m.business.pointsUnit}</span></div></div><p className={s.muted}>{m.kindness.note}</p>{kindness.activities.length ? <ActivityList items={kindness.activities} /> : <p className={p.empty}>{m.kindness.empty}</p>}</PetFrame>
    <PetFrame mascot={mascot}><h2>{m.business.profileOrders}</h2>{donorOrders.length ? <ul className={s.list}>{donorOrders.map((o) => { const h = getHelper(o.helperId); const pkg = getPackage(o.packageId); return <li key={o.id} className={s.row}><Link href={`/donate/orders/${o.id}`}>{pkg ? loc(pkg.name) : o.packageId} × {o.quantity}<p className={s.muted}>{h ? helperName(h, locale) : o.recipientSnapshot?.name??o.helperId} · {dateTime(o.createdAt)}</p></Link><span>{o.status === 'cancelled' ? m.orders.cancelled : money(orderTotalTHB(o))}</span></li>; })}</ul> : <p className={p.empty}>{m.business.profileEmpty}</p>}</PetFrame>
    <PetFrame mascot={mascot}><h2>{m.business.profileMicro}</h2><ul className={s.list}>{micro.slice().reverse().map((d) => { const h = getHelper(d.helperId); return <li key={d.id} className={s.row}><Link href={`/helpers/${d.helperId}`}>{h ? helperName(h, locale) : d.helperId}<p className={s.muted}>{dateTime(d.createdAt)}</p></Link><strong>{money(d.amountTHB)}</strong></li>; })}</ul>{!micro.length ? <p className={p.empty}>{m.business.profileEmpty}</p> : null}</PetFrame>
    <PetFrame mascot={mascot} id="handoffs"><h2>{m.business.handoffsTitle}</h2><ul className={s.list}>{handoffs.map((h) => <li key={h.id} className={s.row}><span>{h.petName} · {h.mode === 'adopt' ? m.business.adopted : m.business.fostered}</span><span className={s.muted}>{dateTime(h.createdAt)}</span></li>)}</ul>{!handoffs.length ? <p className={p.empty}>{m.profile.empty.handoffs}</p> : null}</PetFrame>
    <PetFrame mascot={mascot}><h2>{m.business.pendingRequests}</h2><ul className={s.list}>{requests.filter((r) => r.status === 'pending_contact').map((r) => <li key={r.id} className={s.row}><Link href={`/requests/${r.id}`}>{m.requests.type[r.type] ?? r.type}</Link><span>{dateTime(r.createdAt)}</span></li>)}</ul></PetFrame>
    <Notice>{m.business.note}</Notice><div className={s.actions}><ButtonLink href="/donate" variant="primary" icon="box">{m.helper.sendPackage}</ButtonLink><ButtonLink href="/partners" icon="star">{m.business.partners}</ButtonLink><ButtonLink href="/start" icon="user">{m.start.title}</ButtonLink></div>
    <PetFrame mascot={mascot} id="reset"><h2>{m.profile.resetTitle}</h2><p>{m.profile.resetDemoText}</p><p className={s.muted}>{m.business.resetBusiness}</p><Button icon="refresh" onClick={() => setResetOpen(true)}>{m.profile.resetDemo}</Button></PetFrame>
    <Dialog open={resetOpen} onClose={() => setResetOpen(false)} title={m.profile.resetTitle} size="sm" footer={<><Button onClick={() => setResetOpen(false)}>{m.common.cancel}</Button><Button variant="danger" onClick={reset}>{m.profile.resetDemo}</Button></>}><p>{m.profile.resetDemoText}</p><p>{m.business.resetBusiness}</p></Dialog>
  </div>;
}
