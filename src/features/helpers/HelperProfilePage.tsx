'use client';

import { useId, useState } from 'react';
import type { ExclusionKey, Species } from '@/lib/types';
import { useI18n } from '@/i18n/provider';
import { getHelper } from '@/data';
import { availableSlots } from '@/lib/capacity';
import { distanceKm } from '@/lib/geo';
import { helperBlocker } from '@/lib/balancer';
import { SUPPLY_CRITICAL_DAYS, SUPPLY_LOW_DAYS, TIGHT_RATIO } from '@/lib/balancer-config';
import { personaIdForRun, formatRun } from '@/lib/run';
import { statusInfo, supplyLevel } from '@/lib/status';
import { useHydrated } from '@/lib/store';
import { Avatar, PetImage } from '@/components/PetImage';
import { Badge, Card, Notice, Skeleton } from '@/components/ui/Badge';
import { Button, ButtonLink, LinkButton } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Meter } from '@/components/ui/Meter';
import { StatusBadge, SupplyBadge } from '@/components/ui/StatusBadge';
import { BangkokMap } from '@/components/map/BangkokMap';
import { NotFoundView } from '@/components/shell/NotFoundView';
import { useCurrentFinding, useRun } from '@/features/demo/RequireRun';
import { useAllListings } from '@/features/shared/data-hooks';
import { useSaved } from '@/features/shared/saved';
import { ListingCard } from '@/features/listings/ListingCard';
import { RecommendPopup, type PopupRequest } from '@/features/balancer/RecommendPopup';
import { DonationDialog } from './DonationDialog';
import { helperName } from './helper-text';
import { useHelperSupplies } from './supplies';
import s from './profile.module.css';

/** โปรไฟล์ผู้ช่วยดูแล (PROMPT.md 7.5) */
export function HelperProfilePage({ id }: { id: string }) {
  const hydrated = useHydrated();
  const h = getHelper(id);
  if (!h) return <NotFoundView />;
  if (!hydrated) {
    return (
      <div className="cp-container cp-page" aria-busy="true">
        <Skeleton height={36} width="60%" />
        <div style={{ height: 16 }} />
        <Skeleton height={240} />
      </div>
    );
  }
  return <Profile id={h.id} />;
}

function Profile({ id }: { id: string }) {
  const h = getHelper(id)!;
  const { m, f, district, locale, num } = useI18n();
  const run = useRun();
  const finding = useCurrentFinding();
  const listings = useAllListings();
  const [saved, toggleSaved] = useSaved('helper', h.id);
  const [statusOpen, setStatusOpen] = useState(false);
  const [verifiedOpen, setVerifiedOpen] = useState(false);
  const [donation, setDonation] = useState(false);
  const [popup, setPopup] = useState<PopupRequest | null>(null);
  const uid = useId();

  const name = helperName(h, locale);
  const isShelter = h.kind === 'shelter';
  const st = statusInfo(h);
  const slots = availableSlots(h);
  const sup = useHelperSupplies(h.id, !!h.acceptsSupplyPackages);
  const species: Species = h.speciesAccepted[0] ?? 'cat';
  const blocker = helperBlocker(h, species, 'normal');
  const canIntake = isShelter || h.careModes.includes('foster');
  const waiting = listings.filter((l) => l.type === 'adoption' && l.status === 'open' && l.careHolderId === h.id);
  const isPersona = !!run && personaIdForRun(run.run) === h.id;
  const dist = finding ? distanceKm(finding.searchPoint, h.location) : null;
  const statusText = st.closed ? m.status.closed : m.status[st.level];

  const onBlocked = (b: ExclusionKey) => setPopup({ sourceId: h.id, blocker: b });

  const images = isShelter
    ? (h.images.place ?? []).map((img) => ({ img, label: null as string | null }))
    : [
      { img: h.images.profile, label: null },
      { img: h.images.home, label: m.helper.homePhoto },
      { img: h.images.pets, label: m.helper.petsPhoto },
    ].filter((x) => x.img);

  return (
    <div className={`cp-container cp-page ${s.page}`}>
      <ButtonLink href="/nearby" variant="ghost" small icon="arrowLeft" className={s.back}>{m.helperPage.back}</ButtonLink>

      <header className={s.hero}>
        {isShelter ? (
          <PetImage media={h.images.place?.[0]} ratio="1 / 1" className={s.heroImg} fallbackLabel={m.helper.shelterPhotoMissing} />
        ) : (
          <Avatar name={name} media={h.images.profile} size={96} aiLabel />
        )}
        <div className={s.heroText}>
          <div className={s.badges}>
            <Badge tone={isShelter ? 'info' : 'neutral'}>{isShelter ? m.helper.shelterBadge : m.helper.individualBadge}</Badge>
            {isPersona && run ? <Badge tone="butter" icon="user">{f(m.helper.mainPersona, { run: formatRun(run.run) })}</Badge> : null}
            {isShelter && h.isRealOrganization && !h.isPlaceholder ? <Badge tone="gold" icon="globe">{m.helperPage.realOrg}</Badge> : null}
            {h.isPlaceholder ? <Badge tone="butter" icon="info">{m.helperPage.placeholderBadge}</Badge> : null}
            {h.demoVerified ? (
              <button type="button" className={s.verifiedBtn} aria-expanded={verifiedOpen} aria-controls={`${uid}-ver`} onClick={() => setVerifiedOpen((v) => !v)}>
                <Badge tone="reunited" icon="shield">{m.helper.verified}</Badge>
                <span className="visually-hidden">{m.helperPage.verifiedWhat}</span>
              </button>
            ) : null}
          </div>
          <h1 className={s.name}>{name}</h1>
          {verifiedOpen ? <p id={`${uid}-ver`} className={s.verifiedText}>{m.helper.verifiedInfo}</p> : null}
          <p className={s.meta}>
            <Icon name="pin" size="1em" /> {f(m.helper.location, { district: district(h.districtId) })}
            {dist !== null ? <> · {f(m.common.aboutKm, { km: dist })}</> : <> · {m.helper.distanceNoRun}</>}
          </p>
          {!isShelter && h.age ? (
            <p className={s.meta}>
              <Icon name="user" size="1em" /> {f(m.helper.age, { age: h.age })}{h.sex ? ` · ${m.personSex[h.sex]}` : ''}
            </p>
          ) : null}
          <div className={s.statusRow} data-tour="helper-status">
            <StatusBadge level={st.level} closed={st.closed} demo />
            <LinkButton aria-expanded={statusOpen} aria-controls={`${uid}-st`} onClick={() => setStatusOpen((v) => !v)} data-tour-safe="true">
              {m.helperPage.statusWhyOpen}
            </LinkButton>
          </div>
          {statusOpen ? (
            <div id={`${uid}-st`} className={s.whyBox}>
              <p className={s.whyTitle}>{m.helperPage.statusWhyTitle}</p>
              <p>{f(m.helperPage.statusWhy, { current: h.currentCount, total: h.capacityTotal, tight: Math.round(TIGHT_RATIO * 100) })}</p>
              <p className={s.small}>{f(m.helper.capacityLine, { current: h.currentCount, total: h.capacityTotal, slots })} → {statusText}</p>
            </div>
          ) : null}
        </div>
      </header>

      {isShelter && (h.verification || h.isPlaceholder) ? (
        <Notice tone={h.isPlaceholder ? 'butter' : 'info'} icon="info" className={s.orgNote}>
          {h.isPlaceholder ? m.helper.placeholderNote : f(m.helper.verificationNote, { note: h.verification ?? '' })}
          {h.officialUrl ? (
            <> · <a href={h.officialUrl} target="_blank" rel="noopener noreferrer">{m.helper.officialLink} <Icon name="arrowRight" size="0.9em" /></a></>
          ) : <> · {m.helper.noOfficialLink}</>}
        </Notice>
      ) : null}

      <div className={s.layout}>
        <div className={s.mainCol}>
          <section className={s.section} aria-labelledby={`${uid}-cap`}>
            <h2 id={`${uid}-cap`}>{m.helper.capacityLabel}</h2>
            <p className={s.capText}>{slots === 0 ? f(m.helper.fullLine, { current: h.currentCount, total: h.capacityTotal }) : f(m.helper.capacityLine, { current: h.currentCount, total: h.capacityTotal, slots })}</p>
            <Meter value={h.currentCount} max={h.capacityTotal} label={m.helper.capacityLabel} level={st.level} valueText={f(m.helper.capacityLine, { current: h.currentCount, total: h.capacityTotal, slots })} />
            {isShelter ? <p className={s.demoNote}>{f(m.helper.demoOf, { name })}</p> : <p className={s.demoNote}>{m.status.demoNote}</p>}
            {sup ? (
              <div className={s.supplies} data-tour="helper-supplies">
                <div className={s.supplyHead}>
                  <SupplyBadge level={supplyLevel(sup.foodDays, sup.litterDays)} />
                  <span>{f(m.supply.food, { days: sup.foodDays })}{sup.litterDays !== undefined ? ` · ${f(m.supply.litter, { days: sup.litterDays })}` : ''} {m.supply.demo}</span>
                </div>
                <Meter value={Math.min(sup.foodDays, 30)} max={30} label={m.supply.title} level={supplyLevel(sup.foodDays, sup.litterDays) === 'ok' ? 'open' : supplyLevel(sup.foodDays, sup.litterDays) === 'low' ? 'tight' : 'full'} valueText={f(m.supply.food, { days: sup.foodDays })} />
                <p className={s.small}>{f(m.helperPage.supplyWhy, { critical: SUPPLY_CRITICAL_DAYS, low: SUPPLY_LOW_DAYS })}</p>
              </div>
            ) : null}
          </section>

          <section className={s.section} aria-labelledby={`${uid}-ab`}>
            <h2 id={`${uid}-ab`}>{m.helper.about}</h2>
            <dl className={s.facts}>
              <div><dt>{m.helper.accepts}</dt><dd>{h.speciesAccepted.map((x) => m.species[x]).join(', ')}{h.acceptsEmergency ? <> · <Badge tone="error" icon="emergency">{m.helper.acceptsEmergency}</Badge></> : null}</dd></div>
              <div><dt>{m.helperPage.modes}</dt><dd>{h.careModes.map((cm) => m.careMode[cm]).join(', ')}</dd></div>
              <div><dt>{m.helperPage.availability}</dt><dd>{m.availability[h.availability]}</dd></div>
              {h.hours ? <div><dt>{isShelter ? m.helper.hoursShelter : m.helper.hoursIndividual}</dt><dd>{h.hours}</dd></div> : null}
              {!isShelter && h.occupation ? <div><dt>{m.helper.occupation}</dt><dd>{h.occupation}</dd></div> : null}
              {!isShelter && h.home ? <div><dt>{m.helper.homeType}</dt><dd>{f(m.helperPage.homeSummary, { type: m.home[h.home.type], summary: h.home.summary })}</dd></div> : null}
            </dl>
            {h.description ? <p className={s.desc}>{h.description}</p> : null}
            {h.conditions.length ? (
              <>
                <h3 className={s.h3}>{m.helper.conditions}</h3>
                <ul className={s.bullets}>{h.conditions.map((c) => <li key={c}>{c}</li>)}</ul>
              </>
            ) : null}
          </section>

          {!isShelter ? (
            <section className={s.section} aria-labelledby={`${uid}-pets`}>
              <h2 id={`${uid}-pets`}>{m.helper.currentPets}</h2>
              {h.currentPets?.length ? (
                <ul className={s.pets}>
                  {h.currentPets.map((p) => (
                    <li key={p.name} className={s.pet}>
                      {p.photo ? <PetImage media={p.photo} ratio="1 / 1" className={s.petPhoto} /> : null}
                      <div className={s.petInfo}>
                        <Icon name="paw" size="1em" /> {f(m.helper.petLine, { name: p.name, species: m.species[p.species], breed: p.breed, color: p.color, sex: m.sex[p.sex], age: p.ageYears })}
                        {p.note ? <p className={s.small}>{p.note}</p> : null}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <p className={s.muted}>{m.helper.noPets}</p>}
              {h.preferences ? (
                <>
                  <h3 className={s.h3}>{m.helper.preferences}</h3>
                  <p className={s.prefs}>{f(m.helper.prefLine, { colors: h.preferences.colors.join(', '), breeds: h.preferences.breeds.join(', ') })}</p>
                  <p className={s.small}>{f(m.helperPage.prefReason, { reason: h.preferences.reason })}</p>
                </>
              ) : null}
            </section>
          ) : null}

          <section className={s.section} aria-labelledby={`${uid}-img`}>
            <h2 id={`${uid}-img`}>{m.helper.images}</h2>
            {isShelter && h.images.place?.length ? <p className={s.small}>{m.common.shelterImageNote}</p> : null}
            {images.length ? (
              <div className={s.gallery}>
                {images.map((x, i) => (
                  <figure key={i} className={s.figure}>
                    <PetImage media={x.img} ratio="4 / 3" fallbackLabel={m.helperPage.imageFallback} />
                    {x.label ? <figcaption>{x.label}</figcaption> : null}
                  </figure>
                ))}
              </div>
            ) : (
              <div className={s.noImage}>
                <Icon name="image" size={28} />
                <span>{isShelter ? m.helper.shelterPhotoMissing : m.helper.personaPhotoMissing}</span>
              </div>
            )}
          </section>

          <section className={s.section} aria-labelledby={`${uid}-wait`}>
            <h2 id={`${uid}-wait`}>{m.helper.waiting} {waiting.length ? <span className={s.count}>{f(m.helperPage.waitingCount, { n: num(waiting.length) })}</span> : null}</h2>
            {waiting.length ? (
              <ul className={s.waitList}>
                {waiting.map((l) => (
                  <li key={l.id} className={s.waitItem}>
                    <ListingCard listing={l} from={`/helpers/${h.id}`} />
                    <div className={s.waitActions}>
                      <ButtonLink href={`/requests/new?type=foster&listing=${l.id}`} small icon="home">{m.helperPage.foster}</ButtonLink>
                      <ButtonLink href={`/requests/new?type=adopt&listing=${l.id}`} small variant="primary" icon="heart">{m.helperPage.adopt}</ButtonLink>
                    </div>
                  </li>
                ))}
              </ul>
            ) : <p className={s.muted}>{m.helper.noWaiting}</p>}
          </section>
        </div>

        <aside className={s.sideCol}>
          <section className={s.actions} aria-labelledby={`${uid}-act`} data-tour="helper-actions">
            <h2 id={`${uid}-act`} className={s.actionsTitle}>{m.helperPage.actionsTitle}</h2>
            {canIntake ? (
              blocker ? (
                <>
                  <Button block icon="home" aria-disabled="true" className={s.disabledBtn} onClick={() => (run ? onBlocked(blocker) : undefined)}>{m.helper.requestIntake}</Button>
                  <p className={s.blockReason}><Icon name="info" size="1em" /> {blocker === 'full' ? m.helper.disabledFull : blocker === 'unavailable' ? m.helper.disabledClosed : f(m.helper.disabledSpecies, { species: m.species[species] })}</p>
                </>
              ) : (
                <ButtonLink href={`/requests/new?type=intake&helper=${h.id}`} block variant="primary" icon="home">{m.helper.requestIntake}</ButtonLink>
              )
            ) : <p className={s.small}>{m.helper.adoptOnlyNote}</p>}
            <ButtonLink href={`/chat/new?persona=${h.id}`} block icon="chat">{f(m.helper.chatWith, { name })}</ButtonLink>
            {h.acceptsSupplyPackages ? <ButtonLink href={`/donate?helper=${h.id}`} block variant="soft" icon="box">{m.helper.sendPackage}</ButtonLink> : null}
            <Button block variant="ghost" icon="bookmark" aria-pressed={saved} onClick={toggleSaved}>{saved ? m.common.saved : m.common.save}</Button>
            {isShelter && h.donationsEnabled ? (
              <>
                <button type="button" className={s.donationRow} onClick={() => setDonation(true)} aria-haspopup="dialog">
                  <span aria-hidden="true"><Icon name="coin" /></span>
                  <span>{m.helper.donationRow}</span>
                  <Icon name="chevronRight" size="1em" />
                </button>
                <DonationDialog open={donation} onClose={() => setDonation(false)} helper={h} />
              </>
            ) : null}
            <p className={s.small}>{m.helperPage.actionsNote}</p>
          </section>

          <Card flat className={s.mapCard}>
            <h2 className={s.mapTitle}>{m.helperPage.mapTitle}</h2>
            <BangkokMap
              mini
              showLegend={false}
              searchPoint={finding?.searchPoint}
              pins={[{ id: h.id, location: h.location, level: st.level, kind: h.kind, label: f(m.map.pinLabel, { name, kind: m.kind[h.kind], status: statusText, km: dist ?? 0 }) }]}
              selectedId={h.id}
              onSelect={() => undefined}
            />
          </Card>
        </aside>
      </div>

      {run && finding ? (
        <RecommendPopup
          request={popup}
          onClose={() => setPopup(null)}
          species={species}
          urgency="normal"
          searchPoint={finding.searchPoint}
          run={run.run}
          finding={finding.findingIndex}
        />
      ) : null}
    </div>
  );
}
