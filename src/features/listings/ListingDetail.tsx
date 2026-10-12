'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import type { PetListing } from '@/lib/types';
import { useI18n } from '@/i18n/provider';
import { getHelper, getOwner } from '@/data';
import { useToast } from '@/components/providers/Toast';
import { useListing } from '@/features/shared/data-hooks';
import { useSaved } from '@/features/shared/saved';
import { useRun } from '@/features/demo/RequireRun';
import { PetImage } from '@/components/PetImage';
import { Badge, Notice } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { RadioGroup } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { statusInfo } from '@/lib/status';
import { helperName } from '@/features/helpers/helper-text';
import { closeUserListing } from './actions';
import { colorsText, collarText, listingTitle, speciesLabel } from './listing-text';
import { animalBreedLabel } from '@/data/animal-catalog';
import s from './detail.module.css';

type Reason = NonNullable<PetListing['closedReason']>;

export function ListingDetail({ id }: { id: string }) {
  const { m, f, date, dateTime, district, loc, locale } = useI18n();
  const params = useSearchParams();
  const listing = useListing(id);
  const run = useRun();
  const toast = useToast();
  const [saved, toggleSaved] = useSaved('listing', id);
  const [closing, setClosing] = useState(false);
  const [reason, setReason] = useState<Reason>('reunited');

  if (!listing) {
    return (
      <div className="cp-container cp-page">
        <h1>{m.listings.notFoundTitle}</h1>
        <p>{m.listings.notFoundText}</p>
        <ButtonLink href="/listings" icon="list">{m.listings.goListings}</ButtonLink>
      </div>
    );
  }

  const mine = listing.source === 'user';
  const from = params.get('from');
  const backHref = from ? `/listings?${from}` : `/listings?tab=${listing.type}`;
  const title = listingTitle(listing, m, f);
  const holder = getHelper(listing.careHolderId);
  const owner = listing.postedBy.kind === 'owner' ? getOwner(listing.postedBy.id) : undefined;
  const eventLabel = listing.type === 'lost' ? m.listings.fEventLost : listing.type === 'found' ? m.listings.fEventFound : m.listings.fEventAdoption;
  const open = listing.status === 'open';
  const chatPersona = listing.postedBy.kind === 'tester' ? null : listing.postedBy.id;

  const doClose = (r: Reason) => {
    closeUserListing(listing.id, r);
    setClosing(false);
    toast(m.listings.closedToast);
  };

  return (
    <div className={`cp-container cp-page ${s.page}`}>
      <p className={s.back}><Link href={backHref}><Icon name="arrowLeft" size="1em" /> {m.listings.backToResults}</Link></p>
      <div className={s.layout}>
        <div className={s.mediaCol}>
          <PetImage media={listing.photo} ratio="4 / 3" fallbackLabel={listing.photo?.src === 'local-only' ? m.listings.photoLocalOnly : undefined} />
        </div>
        <div className={s.infoCol}>
          <div className={s.badges}>
            <Badge tone={listing.type === 'lost' ? 'tight' : listing.type === 'found' ? 'info' : 'adopted'}>{m.listingType[listing.type]}</Badge>
            {mine ? <Badge tone="butter" icon="user">{m.listings.mine}</Badge> : <Badge tone="info">{m.common.demo}</Badge>}
            {!open ? <Badge>{listing.closedReason ? f(m.listings.closedReasonLabel, { reason: m.listings.reason[listing.closedReason] }) : m.listings.closed}</Badge> : null}
          </div>
          <h1 className={s.title}>{title}</h1>
          <dl className={s.facts}>
            <div><dt>{m.listings.fSpecies}</dt><dd>{speciesLabel(listing, m)}</dd></div>
            <div><dt>{m.common.breed}</dt><dd>{animalBreedLabel(listing, loc, m.common.breedUnknown)}</dd></div>
            <div><dt>{m.listings.fSex}</dt><dd>{m.sex[listing.sex ?? 'unknown']}</dd></div>
            <div><dt>{m.listings.fColors}</dt><dd>{colorsText(listing.colors, loc) || '—'}</dd></div>
            <div><dt>{m.listings.fCollar}</dt><dd>{collarText(listing, m, loc)}</dd></div>
            {listing.markings ? <div className={s.wide}><dt>{m.listings.fMarkings}</dt><dd lang={listing.source === 'seed' ? 'th' : undefined}>{listing.markings}{listing.source === 'seed' && locale === 'en' ? <span className={s.thai}> {m.common.thaiOnly}</span> : null}</dd></div> : null}
            <div><dt>{m.listings.fDistrict}</dt><dd>{district(listing.districtId)}</dd></div>
            <div><dt>{eventLabel}</dt><dd>{listing.source === 'seed' ? `${date(listing.eventAt)} (${m.common.sampleDate})` : dateTime(listing.eventAt)}</dd></div>
            {listing.urgency && listing.type === 'found' ? <div><dt>{m.listings.fUrgency}</dt><dd>{m.urgency[listing.urgency]}</dd></div> : null}
            {listing.description ? <div className={s.wide}><dt>{m.listings.fDescription}</dt><dd lang={listing.source === 'seed' ? 'th' : undefined}>{listing.description}{listing.source === 'seed' && locale === 'en' ? <span className={s.thai}> {m.common.thaiOnly}</span> : null}</dd></div> : null}
            <div className={s.wide}>
              <dt>{holder ? m.listings.fCareHolder : m.listings.fPostedBy}</dt>
              <dd>
                {holder ? (
                  <span className={s.holder}>
                    <Link href={`/helpers/${holder.id}`}>{helperName(holder, locale)}</Link>
                    <Badge>{m.kind[holder.kind]}</Badge>
                    <StatusBadge level={statusInfo(holder).level} closed={statusInfo(holder).closed} />
                  </span>
                ) : owner ? `${owner.displayName} (${m.kind.owner} · ${m.common.demoData})` : m.listings.tester}
              </dd>
            </div>
          </dl>

          <div className={s.actions}>
            <Button icon="bookmark" aria-pressed={saved} onClick={toggleSaved}>{saved ? m.common.saved : m.common.save}</Button>
            {!mine && chatPersona && run ? (
              <ButtonLink href={`/chat/new?persona=${chatPersona}&listing=${listing.id}`} variant="primary" icon="chat">
                {listing.type === 'lost' ? m.listings.chatOwner : m.listings.chatCaretaker}
              </ButtonLink>
            ) : null}
            {!mine && chatPersona && !run ? (
              <ButtonLink href={`/start?next=${encodeURIComponent(`/chat/new?persona=${chatPersona}&listing=${listing.id}`)}`} variant="primary" icon="chat">
                {listing.type === 'lost' ? m.listings.chatOwner : m.listings.chatCaretaker}
              </ButtonLink>
            ) : null}
            {listing.type === 'adoption' && !mine && holder ? (
              open ? (
                <>
                  <ButtonLink href={`/requests/new?type=foster&helper=${holder.id}&listing=${listing.id}`} icon="home">{m.listings.requestFoster}</ButtonLink>
                  <ButtonLink href={`/requests/new?type=adopt&helper=${holder.id}&listing=${listing.id}`} icon="heart">{m.listings.requestAdopt}</ButtonLink>
                </>
              ) : <Notice tone="warn">{m.listings.adoptionClosedNote}</Notice>
            ) : null}
            {mine && open ? (
              <>
                <ButtonLink href={`/listings/${listing.id}/edit`} icon="edit">{m.common.edit}</ButtonLink>
                {listing.type === 'found' ? <Button icon="home" onClick={() => doClose('in_care')}>{m.listings.markInCare}</Button> : null}
                <Button variant="danger" icon="x" onClick={() => setClosing(true)}>{m.listings.close}</Button>
              </>
            ) : null}
            {mine && listing.type === 'lost' ? (
              <ButtonLink href={`/listings?tab=found&species=${listing.species}&district=${listing.districtId}`} variant="ghost" icon="search">{m.listings.relatedFound}</ButtonLink>
            ) : null}
          </div>
        </div>
      </div>

      <Dialog
        open={closing}
        onClose={() => setClosing(false)}
        title={m.listings.closeTitle}
        size="sm"
        footer={(
          <>
            <Button onClick={() => setClosing(false)}>{m.common.cancel}</Button>
            <Button variant="primary" onClick={() => doClose(reason)}>{m.listings.close}</Button>
          </>
        )}
      >
        <RadioGroup<Reason>
          name="close-reason"
          legend={m.listings.closeReason}
          value={reason}
          onChange={setReason}
          layout="column"
          options={(['reunited', 'in_care', 'other'] as Reason[]).map((r) => ({ value: r, label: m.listings.reason[r] }))}
        />
      </Dialog>
    </div>
  );
}
