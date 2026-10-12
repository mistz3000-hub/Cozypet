'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { ExclusionKey, Reason, Species, Urgency } from '@/lib/types';
import { useI18n } from '@/i18n/provider';
import { availableSlots } from '@/lib/capacity';
import { statusInfo, supplyLevel } from '@/lib/status';
import { helperBlocker } from '@/lib/balancer';
import { Avatar, PetImage } from '@/components/PetImage';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Meter } from '@/components/ui/Meter';
import { StatusBadge, SupplyBadge } from '@/components/ui/StatusBadge';
import { useSaved } from '@/features/shared/saved';
import { reasonText } from '@/features/balancer/reason-text';
import type { DisplayHelper } from '@/features/caretaker/place';
import { DonationDialog } from './DonationDialog';
import { helperName } from './helper-text';
import { useHelperSupplies } from './supplies';
import s from './helpers.module.css';

export interface HelperCardProps {
  helper: DisplayHelper;
  distanceKm?: number | null;
  rank?: number;
  reasons?: Reason[];
  species: Species;
  urgency: Urgency;
  selected?: boolean;
  onSelect?: () => void;
  onWhy?: () => void;
  onBlocked?: (blocker: ExclusionKey) => void;
  onSeeOnMap?: () => void;
  personaBadge?: string | null;
  compact?: boolean;
  supplies?: { foodDays: number; litterDays?: number } | null;
}

export function HelperCard({ helper: h, distanceKm, rank, reasons, species, urgency, selected, onSelect, onWhy, onBlocked, onSeeOnMap, personaBadge, compact, supplies: suppliesOverride }: HelperCardProps) {
  const { m, f, district, locale } = useI18n();
  const [saved, toggleSaved] = useSaved('helper', h.id);
  const [donation, setDonation] = useState(false);
  const st = statusInfo(h);
  const slots = availableSlots(h);
  const name = helperName(h, locale);
  const isShelter = h.kind === 'shelter';
  const blocker = helperBlocker(h, species, urgency);
  const live = useHelperSupplies(h.id, !!h.acceptsSupplyPackages && !suppliesOverride);
  const sup = suppliesOverride ?? live;
  const canIntake = isShelter || h.careModes.includes('foster');
  const blockText = blocker === 'full' ? m.helper.disabledFull
    : blocker === 'species' ? f(m.helper.disabledSpecies, { species: m.species[species] })
      : blocker === 'unavailable' ? m.helper.disabledClosed
        : blocker === 'emergency' ? m.helper.disabledEmergency
          : blocker === 'mode' ? m.helper.disabledMode : null;

  return (
    <article className={s.card} data-selected={selected ? 'true' : undefined} data-level={st.level} aria-label={name}>
      <div className={s.cardTop} onClick={onSelect}>
        {isShelter ? (
          <PetImage media={h.images.place?.[0]} ratio="1 / 1" className={s.thumb} fallbackLabel={undefined} />
        ) : (
          <Avatar name={name} media={h.images.profile} size={56} aiLabel />
        )}
        <div className={s.cardHead}>
          <div className={s.badges}>
            {rank ? <Badge tone="gold" icon="star">{f(m.listings.recommendedRank, { n: rank })}</Badge> : null}
            {personaBadge ? <Badge tone="butter" icon="user">{personaBadge}</Badge> : null}
            {h.isUserPlace ? <Badge tone="butter" icon="home">{m.nearby.yourPlace}</Badge> : null}
            <Badge tone={isShelter ? 'info' : 'neutral'}>{h.isFictionalFoundation ? m.business.foundation : isShelter ? m.helper.shelterBadge : m.helper.individualBadge}</Badge>
            {h.demoVerified ? <Badge tone="reunited" icon="shield" title={m.helper.verifiedInfo}>{m.helper.verified}</Badge> : null}
          </div>
          <h3 className={s.cardTitle}>
            {h.isUserPlace ? name : <Link href={`/helpers/${h.id}`}>{name}</Link>}
          </h3>
          <p className={s.meta}>
            <Icon name="pin" size="1em" /> {district(h.districtId)}
            {typeof distanceKm === 'number' ? <> · {f(m.common.aboutKm, { km: distanceKm })}</> : null}
          </p>
          {!compact && h.hours ? <p className={s.meta}><Icon name="clock" size="1em" /> {isShelter ? m.helper.hoursShelter : m.helper.hoursIndividual}: {h.hours}</p> : null}
        </div>
      </div>
      {!isShelter && !compact ? (
        <p className={s.modes}>{h.careModes.map((cm) => <Badge key={cm} tone="butter">{m.careMode[cm]}</Badge>)}</p>
      ) : null}
      <p className={s.accepts}>
        <span>{m.helper.accepts}: {h.speciesAccepted.map((x) => m.species[x]).join(', ')}</span>
        {h.acceptsEmergency ? <Badge tone="error" icon="emergency">{m.helper.acceptsEmergency}</Badge> : null}
      </p>
      <div className={s.capacity}>
        <div className={s.capRow}>
          <StatusBadge level={st.level} closed={st.closed} demo />
          <span className={s.capText}>{slots === 0 ? f(m.helper.fullLine, { current: h.currentCount, total: h.capacityTotal }) : f(m.helper.capacityLine, { current: h.currentCount, total: h.capacityTotal, slots })}</span>
        </div>
        <Meter value={h.currentCount} max={h.capacityTotal} label={m.helper.capacityLabel} level={st.level} valueText={f(m.helper.capacityLine, { current: h.currentCount, total: h.capacityTotal, slots })} />
        {isShelter ? <p className={s.demoNote}>{f(m.helper.demoOf, { name })}</p> : null}
      </div>
      {isShelter && h.donationsEnabled ? (
        <>
          <button type="button" className={s.donationRow} onClick={() => setDonation(true)} aria-haspopup="dialog">
            <span className={s.coins} aria-hidden="true"><Icon name="coin" /><Icon name="coin" /><Icon name="coin" /></span>
            <span>{m.helper.donationRow}</span>
            <Icon name="chevronRight" size="1em" />
          </button>
          <DonationDialog open={donation} onClose={() => setDonation(false)} helper={h} />
        </>
      ) : null}
      {sup ? (
        <div className={s.supplies}>
          <SupplyBadge level={supplyLevel(sup.foodDays, sup.litterDays)} />
          <span>{f(m.supply.food, { days: sup.foodDays })}{sup.litterDays !== undefined ? ` · ${f(m.supply.litter, { days: sup.litterDays })}` : ''} {m.supply.demo}</span>
        </div>
      ) : null}
      {reasons?.length ? (
        <ul className={s.reasonChips}>
          {reasons.slice(0, 3).map((r, i) => <li key={i}><Icon name="check" size="1em" /> {reasonText(r, m, f)}</li>)}
        </ul>
      ) : null}
      <div className={s.actions}>
        {!h.isUserPlace ? <ButtonLink href={`/helpers/${h.id}`} small icon="doc">{m.helper.viewDetails}</ButtonLink> : null}
        {canIntake && !h.isUserPlace ? (
          blocker ? (
            <Button small icon="home" aria-disabled="true" className={s.disabledBtn} onClick={() => onBlocked?.(blocker)} title={blockText ?? undefined}>
              {m.helper.requestIntake}
            </Button>
          ) : (
            <ButtonLink href={`/requests/new?type=intake&helper=${h.id}`} small variant="primary" icon="home">{compact ? m.helper.requestIntakeHere : m.helper.requestIntake}</ButtonLink>
          )
        ) : null}
        {!canIntake ? <p className={s.adoptOnly}>{m.helper.adoptOnlyNote}</p> : null}
        {!h.isUserPlace ? <ButtonLink href={`/chat/new?persona=${h.id}`} small icon="chat">{f(m.helper.chatWith, { name: compact ? (name.length > 18 ? `${name.slice(0, 18)}…` : name) : name })}</ButtonLink> : null}
        {h.acceptsSupplyPackages && !compact ? <ButtonLink href={`/donate?helper=${h.id}`} small variant="soft" icon="box">{m.helper.sendPackage}</ButtonLink> : null}
        {onSeeOnMap ? <Button small variant="ghost" icon="map" onClick={onSeeOnMap}>{m.helper.seeOnMap}</Button> : null}
        {onWhy ? <Button small variant="ghost" icon="info" onClick={onWhy} data-tour-safe="true" data-why-button="true">{m.why.open}</Button> : null}
        {!h.isUserPlace && !compact ? (
          <Button small variant="ghost" icon="bookmark" aria-pressed={saved} onClick={toggleSaved}>{saved ? m.common.saved : m.common.save}</Button>
        ) : null}
      </div>
      {blockText && canIntake ? <p className={s.blockReason}><Icon name="info" size="1em" /> {blockText}</p> : null}
    </article>
  );
}
