'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ExclusionKey, GeoPoint, Species, Urgency } from '@/lib/types';
import { useI18n } from '@/i18n/provider';
import { HELPERS, getHelper } from '@/data';
import { useShelters } from '@/features/shelters/useShelters';
import { rankHelpers, placeToCandidate } from '@/lib/balancer';
import { m as motionEl } from '@/lib/motion';
import { SPRING, staggerDelay } from '@/lib/motion-tokens';
import { useStore } from '@/lib/store';
import { useAnnounce } from '@/components/providers/Announcer';
import { Dialog } from '@/components/ui/Dialog';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { HelperCard } from '@/features/helpers/HelperCard';
import { helperName } from '@/features/helpers/helper-text';
import { placeToHelper, type DisplayHelper } from '@/features/caretaker/place';
import { requestExplain } from '@/features/assist/assist-client';
import { WhyPanel } from './WhyPanel';
import { reasonText } from './reason-text';
import s from './balancer.module.css';

export interface PopupRequest { sourceId: string; blocker: ExclusionKey | null }

/** pop-up แนะนำอัจฉริยะ (PROMPT.md 7.11) — ≤ 3 ที่จาก rankHelpers() ชุดเดียวกับ “ที่อื่นที่ยังรับได้” และบริบทแชต */
export function RecommendPopup({ request, onClose, species, urgency, searchPoint, run, finding, searchDistrictId, onSeeOnMap, onSeeAll }: {
  request: PopupRequest | null;
  onClose: () => void;
  species: Species;
  urgency: Urgency;
  searchPoint: GeoPoint;
  run: number|null;
  finding: number;
  searchDistrictId?: string;
  onSeeOnMap?: (id: string) => void;
  onSeeAll?: () => void;
}) {
  const { m, f, locale } = useI18n();
  const announce = useAnnounce();
  const places = useStore('caretakerPlace');
  const shared=useShelters(false,!!request);
  const myPlace = places.find((p) => p.runNumber === run);
  const [whyFor, setWhyFor] = useState<string | null>(null);
  const [explain, setExplain] = useState<{ id: string; text: string } | null>(null);

  const ranking = useMemo(() => {
    if (!request) return null;
    const candidates = [...HELPERS,...shared.helpers,...(myPlace?[placeToCandidate(myPlace)]:[])];
    return rankHelpers({ candidates, species, urgency, searchPoint, radiusKm: null, excludeId: request.sourceId });
  }, [request, myPlace, shared.helpers, species, urgency, searchPoint]);
  const top = ranking?.items.slice(0, 3) ?? [];

  const title = !request ? '' : request.blocker === 'full' ? m.popup.titleFull
    : request.blocker === 'species' ? f(m.popup.titleSpecies, { species: m.species[species] })
      : request.blocker === 'unavailable' ? m.popup.titleClosed : m.popup.titleOther;

  useEffect(() => {
    if (!request) return;
    announce(f(m.popup.opened, { title }));
    const first = top[0];
    if (!first || run===null || first.id.startsWith('place-')||first.id.startsWith('community-')) return;
    let alive = true;
    void requestExplain({ helperId: first.id, runNumber: run, findingIndex: finding, searchDistrictId, species, urgency, locale }).then((r) => {
      if (alive && r) setExplain({ id: first.id, text: r.text });
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?.sourceId]);

  const toDisplay = (id: string): DisplayHelper | undefined => (myPlace && id === myPlace.id ? placeToHelper(myPlace) : shared.helpers.find(h=>h.id===id)??getHelper(id));
  const close = () => {
    setWhyFor(null);
    setExplain(null);
    onClose();
  };

  return (
    <Dialog open={!!request} onClose={close} title={title} variant="sheet" size="lg">
      <div data-tour="nearby-popup">
        <p className={s.popupIntro}>{m.popup.intro}</p>
        {top.length ? (
          <ol className={s.popupList}>
            {top.map((rec, i) => {
              const h = toDisplay(rec.id);
              if (!h) return null;
              const name = helperName(h, locale);
              const template = f(h.isRealOrganization ? m.popup.whyTemplateReal : m.popup.whyTemplate, {
                name,
                reasons: rec.reasons.slice(0, 2).map((r) => reasonText(r, m, f)).join(m.common.and),
              });
              return (
                <motionEl.li key={rec.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING.soft, delay: staggerDelay(i) }}>
                  <HelperCard
                    helper={h}
                    supplies={shared.places.find(p=>p.id===h.publicPlaceId)?.payload}
                    distanceKm={rec.distanceKm}
                    rank={i + 1}
                    reasons={rec.reasons}
                    species={species}
                    urgency={urgency}
                    compact
                    onSeeOnMap={onSeeOnMap ? () => { onSeeOnMap(rec.id); close(); } : undefined}
                    onWhy={() => setWhyFor((v) => (v === rec.id ? null : rec.id))}
                  />
                  {i === 0 ? (
                    <p className={s.whyLine} aria-live="polite">
                      <strong><Icon name="sparkle" size="1em" /> {m.popup.whyLine}:</strong>{' '}
                      {explain && explain.id === rec.id ? (
                        <>{explain.text} <Badge tone="gold">{m.popup.whyAi}</Badge></>
                      ) : template}
                    </p>
                  ) : null}
                  {whyFor === rec.id ? (
                    <div data-tour="nearby-why" style={{ marginTop: 10 }}>
                      <WhyPanel rec={rec} excluded={ranking?.excluded} name={name} />
                    </div>
                  ) : null}
                </motionEl.li>
              );
            })}
          </ol>
        ) : (
          <p>{m.popup.none}</p>
        )}
        <div className={s.popupFoot} style={{ marginTop: 12 }}>
          {onSeeAll ? <Button icon="list" onClick={() => { onSeeAll(); close(); }}>{m.popup.seeAll}</Button> : <ButtonLink href="/nearby" icon="list">{m.popup.seeAll}</ButtonLink>}
          {top[0] ? <Button variant="ghost" icon="info" onClick={() => setWhyFor(top[0].id)} data-tour-safe="true" data-popup-why="true">{m.why.open}</Button> : null}
        </div>
      </div>
    </Dialog>
  );
}
