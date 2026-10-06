'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useMemo, useState } from 'react';
import type { StatusLevel } from '@/lib/types';
import { useI18n } from '@/i18n/provider';
import { HELPERS, getHelper } from '@/data';
import { getDistrict } from '@/data/districts';
import { DONATION_BASELINE } from '@/data/donation-baseline';
import { SUPPLIES } from '@/data/supplies';
import { rankUrgentCases } from '@/lib/balancer';
import { SUPPLY_CRITICAL_DAYS, TIGHT_RATIO } from '@/lib/balancer-config';
import { formatRun } from '@/lib/run';
import { orderTotalTHB } from '@/lib/orders';
import { statusInfo } from '@/lib/status';
import { useStore } from '@/lib/store';
import { useNow } from '@/lib/useNow';
import { Badge, Card } from '@/components/ui/Badge';
import { ButtonLink, LinkButton } from '@/components/ui/Button';
import { CountUp } from '@/components/ui/CountUp';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Meter } from '@/components/ui/Meter';
import { BangkokMap, type MapPin } from '@/components/map/BangkokMap';
import { useAuth } from '@/features/auth/AuthContext';
import { useRun } from '@/features/demo/RequireRun';
import { AssistBox } from '@/features/assist/AssistBox';
import { Ticker } from '@/features/balancer/Ticker';
import { reasonText } from '@/features/balancer/reason-text';
import { PACKAGE_MAP } from '@/features/helpers/supplies';
import { helperName } from '@/features/helpers/helper-text';
import { useAllListings } from '@/features/shared/data-hooks';
import { listingTitle, speciesLabel } from '@/features/listings/listing-text';
import { ActivityList, DemoModeBar } from '@/features/shared/DemoModeBar';
import { useKindness } from '@/features/shared/records';
import s from './dashboard.module.css';

const SUPPLY_MAP = new Map(SUPPLIES.map((x) => [x.helperId, x]));
const HELPER_MAP = new Map(HELPERS.map((h) => [h.id, h]));
type ShortcutKey = 'found' | 'place' | 'donate' | 'adopt';
const SHORTCUTS: { key: ShortcutKey; href: string; icon: IconName }[] = [
  { key: 'found', href: '/scan', icon: 'scan' },
  { key: 'place', href: '/nearby', icon: 'search' },
  { key: 'donate', href: '/donate', icon: 'box' },
  { key: 'adopt', href: '/listings?tab=adoption&sort=recommended', icon: 'heart' },
];

/** แดชบอร์ด (PROMPT.md 7.10) — หน้าจอบังคับ Home/Dashboard */
export function DashboardPage() {
  const { m, f, money, num, district, locale } = useI18n();
  const router = useRouter();
  const { user } = useAuth();
  const run = useRun()!;
  const listings = useAllListings();
  const orders = useStore('donationOrders');
  const kindness = useKindness();
  const now = useNow(orders.some((o) => o.status === 'active'));
  const [why, setWhy] = useState(false);
  const id = useId();

  const urgent = useMemo(() => rankUrgentCases({
    listings, helpers: HELPER_MAP, supplies: SUPPLY_MAP, orders, packages: PACKAGE_MAP, now: new Date(now || 0),
  }), [listings, orders, now]);

  const mine = orders.filter((o) => o.status === 'active');
  const mineTotal = mine.reduce((n, o) => n + orderTotalTHB(o), 0);
  const minePackages = mine.reduce((n, o) => n + o.quantity, 0);
  const totalTHB = DONATION_BASELINE.totalTHB + mineTotal;
  const totalPackages = DONATION_BASELINE.totalPackages + minePackages;

  const counts: Record<StatusLevel, number> = { open: 0, tight: 0, full: 0 };
  const pins: MapPin[] = HELPERS.map((h) => {
    const st = statusInfo(h);
    counts[st.level] += 1;
    return { id: h.id, location: h.location, level: st.level, kind: h.kind, label: helperName(h, locale) };
  });

  return (
    <div className={`cp-container cp-page ${s.page}`}>
      <DemoModeBar next="/dashboard" />
      <header className={s.hello}>
        <h1>{user ? f(m.dashboard.hello, { name: user.displayName }) : m.dashboard.helloGuest}</h1>
        <div className={s.chips}>
          <Badge tone="info" icon="paw">{f(user ? m.header.runBadgeAccount : m.header.runBadgeDemo, { run: formatRun(run.run) })}</Badge>
          <Link href="/profile#kindness" className={s.kChip}><Icon name="heart" size="1em" /> {f(m.kindness.chip, { n: num(kindness.total) })} · {m.kindness.level[kindness.level]}</Link>
        </div>
      </header>

      <div className={s.grid}>
        <div className={s.col}>
          <section aria-labelledby={`${id}-sc`} data-tour="dash-shortcuts">
            <h2 id={`${id}-sc`} className={s.h2}>{m.dashboard.shortcutsTitle}</h2>
            <ul className={s.tiles}>
              {SHORTCUTS.map((sc) => (
                <li key={sc.key}>
                  <Link href={sc.href} className={s.tile} data-key={sc.key}>
                    <span className={s.tileIcon} aria-hidden="true"><Icon name={sc.icon} size={26} /></span>
                    <span className={s.tileTitle}>{m.dashboard.shortcuts[sc.key]}</span>
                    <span className={s.tileDesc}>{m.dashboard.shortcutsDesc[sc.key]}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className={s.assist}>
              <AssistBox
                compact
                onApply={(r) => {
                  const q = new URLSearchParams();
                  if (r.helpType === 'donate') {
                    router.push(`/donate${r.species !== 'unknown' ? `?species=${r.species}` : ''}`);
                    return;
                  }
                  if (r.helpType === 'adopt') {
                    router.push('/listings?tab=adoption&sort=recommended');
                    return;
                  }
                  if (r.species !== 'unknown') q.set('species', r.species);
                  if (r.urgency !== 'unknown') q.set('urgency', r.urgency);
                  if (r.districtId) q.set('district', r.districtId);
                  q.set('auto', '1');
                  router.push(`/nearby?${q.toString()}`);
                }}
              />
            </div>
          </section>

          <section aria-labelledby={`${id}-ur`} data-tour="dash-urgent">
            <h2 id={`${id}-ur`} className={s.h2}><Icon name="emergency" /> {m.dashboard.urgentTitle}</h2>
            {urgent.length ? (
              <ul className={s.urgent}>
                {urgent.map((c) => {
                  if (c.kind === 'supplies') {
                    const h = getHelper(c.helperId)!;
                    return (
                      <li key={`s-${c.helperId}`} className={s.urgentCard}>
                        <p className={s.urgentTitle}><Link href={`/helpers/${h.id}`}>{helperName(h, locale)}</Link></p>
                        <p className={s.urgentMeta}>{f(m.dashboard.urgentHelper, { district: district(h.districtId) })}</p>
                        <ul className={s.reasonChips}>{c.reasons.map((r, i) => <li key={i}>{reasonText(r, m, f)}</li>)}</ul>
                        <ButtonLink href={`/donate?helper=${h.id}`} small variant="primary" icon="box">{m.helper.sendPackage}</ButtonLink>
                      </li>
                    );
                  }
                  const l = listings.find((x) => x.id === c.listingId);
                  if (!l) return null;
                  return (
                    <li key={`l-${c.listingId}`} className={s.urgentCard}>
                      <p className={s.urgentTitle}><Link href={`/listings/${l.id}`}>{listingTitle(l, m, f)}</Link></p>
                      <p className={s.urgentMeta}>{f(m.dashboard.urgentListing, { species: speciesLabel(l, m), district: getDistrict(l.districtId) ? district(l.districtId) : '' })}</p>
                      <ul className={s.reasonChips}><li>{m.urgency[c.urgency]}</li></ul>
                      <ButtonLink href={`/listings/${l.id}`} small icon="doc">{m.listings.openListing}</ButtonLink>
                    </li>
                  );
                })}
              </ul>
            ) : <p className={s.muted}>{m.dashboard.urgentEmpty}</p>}
          </section>
        </div>

        <div className={s.col}>
          <Card as="section" className={s.total} aria-labelledby={`${id}-tt`} data-tour="dash-total">
            <h2 id={`${id}-tt`} className={s.h2}>{m.dashboard.totalTitle}</h2>
            <p className={s.money}><CountUp value={totalTHB} format={(n) => money(n)} /></p>
            <p className={s.packages}>{f(m.dashboard.totalPackages, { n: num(totalPackages) })} · {f(m.dashboard.totalOf, { target: money(DONATION_BASELINE.targetTHB) })}</p>
            <Meter value={Math.min(totalTHB, DONATION_BASELINE.targetTHB)} max={DONATION_BASELINE.targetTHB} label={m.dashboard.totalLabel} level="gold" valueText={`${money(totalTHB)} / ${money(DONATION_BASELINE.targetTHB)}`} />
            <p className={s.simNote}><Icon name="info" size="1em" /> {m.dashboard.totalNote}</p>
            {minePackages ? <p className={s.muted}>{f(m.dashboard.totalMine, { n: num(minePackages) })}</p> : null}
          </Card>

          <Card as="section" className={s.area} aria-labelledby={`${id}-ar`}>
            <h2 id={`${id}-ar`} className={s.h2}>{m.dashboard.areaTitle}</h2>
            <BangkokMap mini pins={pins} showLegend />
            <p className={s.muted}>{f(m.dashboard.areaCounts, { open: counts.open, tight: counts.tight, full: counts.full })}</p>
            <ButtonLink href="/nearby" small icon="map">{m.dashboard.areaSeeAll}</ButtonLink>
          </Card>

          <Ticker />

          <section aria-labelledby={`${id}-ac`}>
            <h2 id={`${id}-ac`} className={s.h2}>{m.dashboard.activityTitle}</h2>
            {kindness.activities.length ? (
              <>
                <ActivityList items={kindness.activities} limit={5} />
                <Link href="/profile#kindness" className={s.more}>{m.dashboard.seeAllActivity}</Link>
              </>
            ) : <p className={s.muted}>{m.kindness.empty}</p>}
          </section>

          <section className={s.why} data-tour="dash-why">
            <LinkButton aria-expanded={why} aria-controls={`${id}-why`} onClick={() => setWhy((v) => !v)} data-tour-safe="true">
              <Icon name="info" size="1em" /> {m.dashboard.whyOpen}
            </LinkButton>
            {why ? (
              <div id={`${id}-why`} className={s.whyBox}>
                <p className={s.whyTitle}>{m.dashboard.whyTitle}</p>
                <ul>{m.dashboard.whyItems.map((t) => <li key={t}>{f(t, { critical: SUPPLY_CRITICAL_DAYS, tight: Math.round(TIGHT_RATIO * 100) })}</li>)}</ul>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
