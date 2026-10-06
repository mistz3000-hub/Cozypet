'use client';

import { useId, useState } from 'react';
import type { CareRequest, HomeType, Species, Urgency } from '@/lib/types';
import { useI18n } from '@/i18n/provider';
import { getHelper } from '@/data';
import { updateValue, useHydrated, useStore } from '@/lib/store';
import { useAnnounce } from '@/components/providers/Announcer';
import { Badge, Card, Notice, Skeleton } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Icon } from '@/components/ui/Icon';
import { useAllListings } from '@/features/shared/data-hooks';
import { helperName } from '@/features/helpers/helper-text';
import { ListingCard } from '@/features/listings/ListingCard';
import s from './requests.module.css';

/** หน้าสถานะคำขอ (PROMPT.md 7.5) — ไม่มีคำว่า “อนุมัติแล้ว” หรือ “นัดหมายสำเร็จ” */
export function RequestStatusPage({ id }: { id: string }) {
  const hydrated = useHydrated();
  const requests = useStore('careRequests');
  const { m } = useI18n();
  if (!hydrated) {
    return (
      <div className="cp-container cp-page" aria-busy="true">
        <Skeleton height={36} width="60%" />
        <div style={{ height: 16 }} />
        <Skeleton height={200} />
      </div>
    );
  }
  const r = requests.find((x) => x.id === id);
  if (!r) {
    return (
      <div className="cp-container cp-page">
        <h1>{m.requests.notFound}</h1>
        <p>{m.requests.demoNote}</p>
        <ButtonLink href="/nearby" icon="search">{m.nav.findLocation}</ButtonLink>
      </div>
    );
  }
  return <Status r={r} />;
}

function Status({ r }: { r: CareRequest }) {
  const { m, f, locale, dateTime, district } = useI18n();
  const announce = useAnnounce();
  const listings = useAllListings();
  const [confirm, setConfirm] = useState(false);
  const uid = useId();
  const h = getHelper(r.helperId);
  const name = h ? helperName(h, locale) : r.helperId;
  const listing = r.listingId ? listings.find((l) => l.id === r.listingId) : undefined;
  const steps = m.requests.timeline[r.type];
  const title = r.status === 'cancelled' ? m.requests.cancelledTitle : r.status === 'completed_demo' ? m.requests.completedTitle : m.requests.statusTitle[r.type];
  const tone = r.status === 'cancelled' ? 'neutral' : r.status === 'completed_demo' ? 'reunited' : 'butter';

  const cancel = () => {
    const ts = new Date().toISOString();
    updateValue('careRequests', (prev) => prev.map((x) => (x.id === r.id ? { ...x, status: 'cancelled', updatedAt: ts } : x)));
    setConfirm(false);
    announce(m.requests.cancelled);
  };

  const a = r.answers;
  const str = (k: string) => (typeof a[k] === 'string' ? (a[k] as string) : '');
  const rows: { label: string; value: string }[] = [];
  if (r.type === 'intake') {
    rows.push({ label: m.requests.aboutPet, value: a.source === 'listing' ? m.requests.sourceListing : m.requests.sourceShort });
    if (a.source === 'short') {
      if (str('species')) rows.push({ label: m.requests.shortSpecies, value: m.species[str('species') as Species] ?? str('species') });
      if (str('districtId')) rows.push({ label: m.requests.shortDistrict, value: district(str('districtId')) });
      if (str('symptoms')) rows.push({ label: m.requests.shortSymptoms, value: str('symptoms') });
    }
    if (str('urgency')) rows.push({ label: m.requests.urgency, value: m.urgency[str('urgency') as Urgency] ?? str('urgency') });
    if (str('note')) rows.push({ label: m.requests.note, value: str('note') });
  } else {
    if (r.type === 'foster' && str('duration')) rows.push({ label: m.requests.duration, value: m.requests.durationOpts[str('duration') as keyof typeof m.requests.durationOpts] ?? str('duration') });
    if (str('housing')) rows.push({ label: m.requests.housing, value: m.home[str('housing') as HomeType] ?? str('housing') });
    if (r.type === 'adopt') rows.push({ label: m.requests.household, value: a.household ? m.common.yes : m.common.no });
    if (str('otherPets')) rows.push({ label: m.requests.otherPets, value: str('otherPets') });
    if (str('experience')) rows.push({ label: m.requests.experience, value: str('experience') });
    if (r.type === 'foster' && str('startDate')) rows.push({ label: m.requests.startDate, value: str('startDate') });
    if (r.type === 'adopt' && str('reason')) rows.push({ label: m.requests.reason, value: str('reason') });
    rows.push({ label: r.type === 'foster' ? m.requests.ackFoster : m.requests.ackAdopt, value: a.ack ? m.common.yes : m.common.no });
  }

  return (
    <div className={`cp-container cp-page ${s.page}`}>
      <Badge tone="butter" icon="info">{m.common.demo}</Badge>
      <p className={s.eyebrow}>{m.requests.type[r.type]} · {f(m.requests.to, { name })}</p>
      <h1 className={s.statusTitle} data-status={r.status}>
        <Badge tone={tone} icon={r.status === 'cancelled' ? 'x' : r.status === 'completed_demo' ? 'heart' : 'clock'}>{title}</Badge>
      </h1>
      <p className={s.muted}>{f(m.requests.sentAt, { date: dateTime(r.createdAt) })}</p>

      <section className={s.block} aria-labelledby={`${uid}-tl`}>
        <h2 id={`${uid}-tl`} className={s.h2}>{m.requests.timelineTitle}</h2>
        <ol className={s.timeline}>
          {steps.map((step, i) => {
            const done = i === 0;
            return (
              <li key={step} data-done={done ? 'true' : undefined}>
                <span className={s.dot} aria-hidden="true">{done ? <Icon name="check" size={14} /> : null}</span>
                <span>{step}</span>
                <span className="visually-hidden"> — {done ? m.requests.timelineDone : m.requests.timelinePending}</span>
              </li>
            );
          })}
          {r.status === 'completed_demo' ? (
            <li data-done="true">
              <span className={s.dot} aria-hidden="true"><Icon name="heart" size={14} /></span>
              <span>{m.requests.completedTitle}</span>
            </li>
          ) : null}
        </ol>
      </section>

      {listing ? (
        <section className={s.block}>
          <h2 className={s.h2}>{m.requests.aboutPet}</h2>
          <div className={s.listingBox}><ListingCard listing={listing} from={`/requests/${r.id}`} /></div>
        </section>
      ) : null}

      <Card flat className={s.block}>
        <h2 className={s.h2}>{m.requests.answers}</h2>
        <dl className={s.answers}>
          {rows.map((row) => (
            <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>
          ))}
        </dl>
      </Card>

      <div className={s.actions}>
        <ButtonLink href={`/chat/new?persona=${r.helperId}&request=${r.id}`} variant="primary" icon="chat">{m.requests.chat}</ButtonLink>
        {r.type !== 'intake' ? <ButtonLink href={`/requests/${r.id}/agreement`} icon="doc">{m.requests.agreement}</ButtonLink> : null}
        {h ? <ButtonLink href={`/helpers/${h.id}`} variant="ghost" icon="user">{m.requests.backToHelper}</ButtonLink> : null}
        {r.status === 'pending_contact' ? <Button variant="ghost" icon="x" onClick={() => setConfirm(true)}>{m.requests.cancel}</Button> : null}
      </div>
      <Notice tone="info" icon="shield">{m.requests.demoNote}</Notice>

      <Dialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title={m.requests.cancelConfirm}
        size="sm"
        footer={(
          <>
            <Button onClick={() => setConfirm(false)} data-autofocus>{m.requests.keepRequest}</Button>
            <Button variant="danger" icon="x" onClick={cancel}>{m.requests.cancel}</Button>
          </>
        )}
      >
        <p>{m.requests.statusTitle[r.type]}</p>
      </Dialog>
    </div>
  );
}
