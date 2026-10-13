'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ExclusionKey, FindingSession, Recommendation, Species, Urgency } from '@/lib/types';
import { useI18n } from '@/i18n/provider';
import { HELPERS, getHelper } from '@/data';
import { useShelters } from '@/features/shelters/useShelters';
import { isDistrictId, DISTRICTS } from '@/data/districts';
import { availableSlots } from '@/lib/capacity';
import { distanceKm } from '@/lib/geo';
import { helperBlocker, placeToCandidate, rankHelpers } from '@/lib/balancer';
import { buildFindingSession, formatRun, personaIdForRun } from '@/lib/run';
import { statusInfo } from '@/lib/status';
import { getValue, updateValue, useStore } from '@/lib/store';
import { useReducedMotion, AnimatePresence, m as motionEl, MotionMax } from '@/lib/motion';
import { T } from '@/lib/motion-tokens';
import { playSfx } from '@/lib/audio/sfx';
import { useAnnounce } from '@/components/providers/Announcer';
import { useRun } from '@/features/demo/RequireRun';
import { AssistBox } from '@/features/assist/AssistBox';
import { DistrictSelect } from '@/features/shared/DistrictSelect';
import { HelperCard } from '@/features/helpers/HelperCard';
import { helperName } from '@/features/helpers/helper-text';
import { placeToHelper, type DisplayHelper } from '@/features/caretaker/place';
import { RecommendPopup, type PopupRequest } from '@/features/balancer/RecommendPopup';
import { WhyPanel } from '@/features/balancer/WhyPanel';
import { Ticker } from '@/features/balancer/Ticker';
import { BangkokMap, type MapPin } from '@/components/map/BangkokMap';
import { Badge, Card, Notice, Skeleton } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Field, Select, Checkbox, TextInput } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import s from './nearby.module.css';

type SortKey = 'recommended' | 'nearest' | 'space';
type TypeKey = 'all' | 'shelter' | 'individual';
const RADII = [3, 5, 10] as const;
const SEARCH_MS = 1800;

/** จำว่ารอบไหนค้นหาแล้ว (ภายในแท็บนี้) เพื่อให้กลับมาแล้วเห็นผลทันที */
const searchedRounds = new Set<string>();

interface Row { helper: DisplayHelper; distance: number; rec?: Recommendation; rank?: number }

export function NearbyPage() {
  const { m, f, num, district, locale } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const announce = useAnnounce();
  const reduced = useReducedMotion();
  const run = useRun()!;
  const sessions = useStore('findingSessions');
  const places = useStore('caretakerPlace');
  const id = useId();
  const listRef = useRef<HTMLDivElement>(null);

  const paramDistrict = isDistrictId(params.get('district')) ? params.get('district')! : '';
  const [radius, setRadius] = useState<number | null>(5);
  const [species, setSpecies] = useState<Species>((['cat', 'dog', 'other'] as Species[]).includes(params.get('species') as Species) ? (params.get('species') as Species) : 'cat');
  const [type, setType] = useState<TypeKey>('all');
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [urgency, setUrgency] = useState<Urgency>((['normal', 'soon', 'emergency'] as Urgency[]).includes(params.get('urgency') as Urgency) ? (params.get('urgency') as Urgency) : 'normal');
  const [sort, setSort] = useState<SortKey>('recommended');
  const [chosenDistrict, setChosenDistrict] = useState(paramDistrict);
  const [districtQuery, setDistrictQuery] = useState('');
  const [districtError, setDistrictError] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'searching' | 'results'>('idle');
  const [selected, setSelected] = useState<string | null>(null);
  const [popup, setPopup] = useState<PopupRequest | null>(null);
  const [whyRec, setWhyRec] = useState<{ rec: Recommendation; name: string } | null>(null);
  const [limit5, setLimit5] = useState(false);
  const searchTimer = useRef<number | null>(null);
  useEffect(() => () => { if (searchTimer.current !== null) window.clearTimeout(searchTimer.current); }, []);

  // รอบค้นหาปัจจุบัน (refresh ไม่เพิ่มรอบ)
  const findingIndex = run.finding;
  const current: FindingSession | undefined = sessions.find((x) => x.runNumber === run.run && x.findingIndex === findingIndex);
  useEffect(() => {
    if (current) return;
    const ses = buildFindingSession(run.run, findingIndex, 'run_seed', undefined, new Date().toISOString());
    updateValue('findingSessions', (prev) => (prev.some((x) => x.id === ses.id) ? prev : [...prev, ses]));
    updateValue('demoSession', (prev) => ({ ...prev, findingIndexByRun: { ...prev.findingIndexByRun, [formatRun(run.run)]: findingIndex } }));
  }, [current, run.run, findingIndex]);
  const session = useMemo(() => current ?? buildFindingSession(run.run, findingIndex, 'run_seed', undefined, ''), [current, run.run, findingIndex]);
  const roundKey = `${run.run}:${session.findingIndex}`;

  const startNewRound = useCallback((origin: FindingSession['origin'], districtId?: string) => {
    const all = getValue('findingSessions').filter((x) => x.runNumber === run.run);
    const nextIndex = Math.max(findingIndex, ...all.map((x) => x.findingIndex)) + 1;
    const ses = buildFindingSession(run.run, nextIndex, origin, districtId, new Date().toISOString());
    updateValue('findingSessions', (prev) => [...prev, ses]);
    updateValue('demoSession', (prev) => ({ ...prev, findingIndexByRun: { ...prev.findingIndexByRun, [formatRun(run.run)]: nextIndex } }));
    return ses;
  }, [findingIndex, run.run]);

  const doSearch = useCallback((ses?: FindingSession) => {
    const target = ses ?? session;
    setPhase('searching');
    setSelected(null);
    announce(f(m.nearby.searching, { district: district(target.districtId) }));
    playSfx('ping');
    if (searchTimer.current !== null) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      searchedRounds.add(`${run.run}:${target.findingIndex}`);
      setPhase('results');
      playSfx('chime');
    }, reduced ? 300 : SEARCH_MS);
  }, [announce, district, f, m.nearby.searching, reduced, run.run, session]);

  const onSearchClick = () => {
    setLimit5(false);
    if (chosenDistrict && chosenDistrict !== session.districtId) doSearch(startNewRound('district_choice', chosenDistrict));
    else doSearch();
  };

  // ?auto=1 จาก “เล่าให้ AI ช่วยสรุป” → ค้นหาทันที (เลื่อนออกจาก effect body เพื่อไม่ setState ซ้อน)
  const autoDone = useRef(false);
  const auto = params.get('auto') === '1';
  useEffect(() => {
    if (!auto || autoDone.current) return;
    const timer = window.setTimeout(() => {
      autoDone.current = true;
      if (paramDistrict && paramDistrict !== session.districtId) doSearch(startNewRound('district_choice', paramDistrict));
      else doSearch();
      router.replace('/nearby', { scroll: false });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [auto, paramDistrict, session.districtId, doSearch, startNewRound, router]);
  // กลับมาที่รอบที่เคยค้นแล้ว → แสดงผลทันที
  const shownPhase = phase === 'idle' && searchedRounds.has(roundKey) ? 'results' : phase;

  const shared = useShelters();
  const myPlace = places.find((p) => p.runNumber === run.run);
  const personaId = personaIdForRun(run.run);

  const { rows, excluded } = useMemo(() => {
    const point = session.searchPoint;
    const base: DisplayHelper[] = [...HELPERS, ...shared.helpers, ...(myPlace ? [placeToHelper(myPlace)] : [])];
    let list = base.map<Row>((h) => ({ helper: h, distance: distanceKm(point, h.location) }));
    if (radius !== null && !limit5) list = list.filter((r) => r.distance <= radius);
    list = list.filter((r) => r.helper.speciesAccepted.includes(species));
    if (type !== 'all') list = list.filter((r) => r.helper.kind === type);
    if (onlyOpen) list = list.filter((r) => availableSlots(r.helper) > 0 && r.helper.availability !== 'unavailable');
    if (emergencyOnly) list = list.filter((r) => r.helper.acceptsEmergency);
    const ranking = rankHelpers({
      candidates: list.map((r) => (r.helper.isUserPlace && myPlace ? placeToCandidate(myPlace) : r.helper)),
      species, urgency, searchPoint: point, radiusKm: limit5 ? null : radius,
    });
    const recById = new Map(ranking.items.map((r, i) => [r.id, { rec: r, rank: i + 1 }]));
    list = list.map((r) => ({ ...r, rec: recById.get(r.helper.id)?.rec, rank: recById.get(r.helper.id)?.rank }));
    if (sort === 'recommended') {
      list.sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999) || a.distance - b.distance || a.helper.id.localeCompare(b.helper.id));
    } else if (sort === 'nearest' || limit5) {
      list.sort((a, b) => a.distance - b.distance || a.helper.id.localeCompare(b.helper.id));
    } else {
      list.sort((a, b) => availableSlots(b.helper) - availableSlots(a.helper) || a.distance - b.distance || a.helper.id.localeCompare(b.helper.id));
    }
    if (limit5) list = list.slice(0, 5);
    return { rows: list, excluded: ranking.excluded };
  }, [session.searchPoint, myPlace, shared.helpers, radius, species, type, onlyOpen, emergencyOnly, urgency, sort, limit5]);

  const pins: MapPin[] = rows.map((r) => {
    const st = statusInfo(r.helper);
    const name = helperName(r.helper, locale);
    const statusText = st.closed ? m.status.closed : m.status[st.level];
    return {
      id: r.helper.id,
      location: r.helper.location,
      photo:r.helper.images.place?.[0]??r.helper.images.profile,
      level: st.level,
      kind: r.helper.isUserPlace ? 'place' : r.helper.kind,
      label: f(m.map.pinLabel, { name, kind: r.helper.isUserPlace ? m.nearby.yourPlace : m.kind[r.helper.kind], status: statusText, km: r.distance }),
    };
  });
  const routes = sort === 'recommended' && shownPhase === 'results' ? rows.filter((r) => r.rank && r.rank <= 3).map((r) => r.helper.location) : [];

  const openBlocked = (helperId: string, blocker: ExclusionKey | null) => setPopup({ sourceId: helperId, blocker });

  const onPin = (pid: string) => {
    setSelected(pid);
    const h = rows.find((r) => r.helper.id === pid)?.helper;
    if (!h) return;
    const blocker = helperBlocker(h, species, urgency);
    if (blocker === 'full' || blocker === 'species' || blocker === 'unavailable') {
      openBlocked(pid, blocker);
      return;
    }
    document.getElementById(`card-${pid}`)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
  };

  const personaRow = rows.find((r) => r.helper.id === personaId);
  const persona = getHelper(personaId)!;
  const radiusIdx = radius === null ? -1 : RADII.indexOf(radius as (typeof RADII)[number]);
  const nextRadius = radius === null ? null : radiusIdx >= 0 && radiusIdx < RADII.length - 1 ? RADII[radiusIdx + 1] : null;
  const prevRounds = sessions.filter((x) => x.runNumber === run.run && x.findingIndex < session.findingIndex).sort((a, b) => b.findingIndex - a.findingIndex);

  const clearFilters = () => {
    setRadius(5);
    setType('all');
    setOnlyOpen(false);
    setEmergencyOnly(false);
    setUrgency('normal');
    setSort('recommended');
    setLimit5(false);
  };

  return (
    <div className={`cp-container cp-page ${s.page}`}>
      <h1>{m.nearby.title}</h1>
      <Card className={s.pointBox} flat>
        <span className={s.pointIcon} aria-hidden="true"><Icon name="target" /></span>
        <div>
          <p className={s.pointMain}>{f(m.nearby.pointBox, { district: district(session.districtId), run: formatRun(run.run), round: session.findingIndex })}</p>
          <p className={s.pointNote}>{m.nearby.pointNote}</p>
        </div>
      </Card>

      <div className={s.layout}>
        <aside className={s.side}>
          <AssistBox
            tourTarget="nearby-assist"
            onApply={(r) => {
              if (r.species !== 'unknown') setSpecies(r.species);
              if (r.urgency !== 'unknown') setUrgency(r.urgency);
              setSort('recommended');
              if (r.urgency === 'emergency') setEmergencyOnly(true);
              if (r.districtId && r.districtId !== session.districtId) {
                setChosenDistrict(r.districtId);
                doSearch(startNewRound('district_choice', r.districtId));
              } else doSearch();
            }}
          />
          <section className={s.filters} aria-labelledby={`${id}-ft`}>
            <h2 id={`${id}-ft`} className={s.filtersTitle}>{m.nearby.filtersTitle}</h2>
            <div className={s.filterGrid}>
              <Field id={`${id}-r`} label={m.nearby.radius}>
                <Select id={`${id}-r`} value={radius === null ? 'all' : String(radius)} onChange={(e) => { setRadius(e.target.value === 'all' ? null : Number(e.target.value)); setLimit5(false); }}>
                  {RADII.map((r) => <option key={r} value={r}>{f(m.nearby.radiusKm, { km: r })}</option>)}
                  <option value="all">{m.nearby.radiusAll}</option>
                </Select>
              </Field>
              <Field id={`${id}-sp`} label={m.nearby.species}>
                <Select id={`${id}-sp`} value={species} onChange={(e) => setSpecies(e.target.value as Species)}>
                  <option value="cat">{m.species.cat}</option>
                  <option value="dog">{m.species.dog}</option>
                  <option value="other">{m.species.other}</option>
                </Select>
              </Field>
              <Field id={`${id}-t`} label={m.nearby.type}>
                <Select id={`${id}-t`} value={type} onChange={(e) => setType(e.target.value as TypeKey)}>
                  <option value="all">{m.nearby.typeAll}</option>
                  <option value="shelter">{m.kind.shelter}</option>
                  <option value="individual">{m.kind.individual}</option>
                </Select>
              </Field>
              <Field id={`${id}-a`} label={m.nearby.availability}>
                <Select id={`${id}-a`} value={onlyOpen ? 'open' : 'all'} onChange={(e) => setOnlyOpen(e.target.value === 'open')}>
                  <option value="all">{m.nearby.availAll}</option>
                  <option value="open">{m.nearby.availOpen}</option>
                </Select>
              </Field>
              <Field id={`${id}-u`} label={m.nearby.urgency}>
                <Select id={`${id}-u`} value={urgency} onChange={(e) => setUrgency(e.target.value as Urgency)}>
                  {(['normal', 'soon', 'emergency'] as Urgency[]).map((u) => <option key={u} value={u}>{m.urgency[u]}</option>)}
                </Select>
              </Field>
              <div data-tour="nearby-sort">
                <Field id={`${id}-so`} label={m.nearby.sort}>
                  <Select id={`${id}-so`} value={sort} onChange={(e) => setSort(e.target.value as SortKey)} data-tour-safe="true">
                    <option value="recommended">{m.nearby.sortRecommended}</option>
                    <option value="nearest">{m.nearby.sortNearest}</option>
                    <option value="space">{m.nearby.sortSpace}</option>
                  </Select>
                </Field>
              </div>
            </div>
            <Checkbox checked={emergencyOnly} onChange={setEmergencyOnly}>{m.nearby.emergencyOnly}</Checkbox>
            <div className={s.districtRow}>
              <form onSubmit={(e) => {
                e.preventDefault();
                const query = districtQuery.trim().replace(/^เขต\s*/, '').toLowerCase();
                const matches = DISTRICTS.filter((d) => d.nameTh.toLowerCase().includes(query) || d.nameEn.toLowerCase().includes(query) || d.id === query);
                const found = matches.find((d) => d.nameTh.toLowerCase() === query || d.nameEn.toLowerCase() === query || d.id === query) ?? (matches.length === 1 ? matches[0] : undefined);
                if (!found || !query) { setDistrictError(true); return; }
                setDistrictError(false); setChosenDistrict(found.id); doSearch(startNewRound('district_choice', found.id));
              }}>
                <Field id={`${id}-location`} label={m.business.location} error={districtError ? m.business.locationMissing : undefined}>
                  <TextInput id={`${id}-location`} placeholder={m.business.locationPlaceholder} value={districtQuery} onChange={(e) => { setDistrictQuery(e.target.value); setDistrictError(false); }} />
                </Field>
                {districtQuery.trim() ? <div className={s.searchBtns}>{DISTRICTS.filter((d) => d.nameTh.includes(districtQuery.trim().replace(/^เขต\s*/, '')) || d.nameEn.toLowerCase().includes(districtQuery.trim().toLowerCase())).slice(0, 5).map((d) => <Button key={d.id} small variant="soft" disabled={shownPhase === 'searching'} onClick={() => { setDistrictQuery(locale === 'en' ? d.nameEn : d.nameTh); setChosenDistrict(d.id); setDistrictError(false); doSearch(startNewRound('district_choice', d.id)); }}>{district(d.id)}</Button>)}</div> : null}
                <Button type="submit" small icon="search" disabled={shownPhase === 'searching'}>{m.business.locationGo}</Button>
                <p className={s.muted}>{m.business.mapNote}</p>
              </form>
              <Field id={`${id}-d`} label={m.nearby.changeDistrict}>
                <DistrictSelect id={`${id}-d`} value={chosenDistrict || session.districtId} onChange={(e) => setChosenDistrict(e.target.value)} />
              </Field>
            </div>
            <div className={s.searchBtns}>
              <Button variant="primary" icon="search" onClick={onSearchClick} disabled={shownPhase === 'searching'} block data-nearby-search="true">{m.nearby.search}</Button>
              <Button icon="refresh" onClick={() => { setChosenDistrict(''); doSearch(startNewRound('run_seed')); }} disabled={shownPhase === 'searching'}>{m.nearby.newPoint}</Button>
              {prevRounds.length ? (
                <Button variant="ghost" icon="arrowLeft" onClick={() => {
                  const prev = prevRounds[0];
                  updateValue('demoSession', (p) => ({ ...p, findingIndexByRun: { ...p.findingIndexByRun, [formatRun(run.run)]: prev.findingIndex } }));
                  setChosenDistrict('');
                  setPhase('idle');
                }}>{m.nearby.prevRound}</Button>
              ) : null}
            </div>
          </section>
        </aside>

        <section className={s.main} aria-labelledby={`${id}-res`}>
          <h2 id={`${id}-res`} className="visually-hidden">{m.nearby.listTitle}</h2>
          <div className={s.mapWrap} data-tour="nearby-legend">
            <BangkokMap
              pins={shownPhase === 'results' ? pins : []}
              searchPoint={session.searchPoint}
              radiusKm={limit5 ? null : radius}
              selectedId={selected}
              onSelect={onPin}
              routes={routes}
              zoomKm={limit5 ? null : radius}
              searching={shownPhase === 'searching'}
            />
          </div>

          {shownPhase === 'idle' ? <Notice tone="butter" icon="info">{m.nearby.beforeSearch}</Notice> : null}

          {shownPhase === 'searching' ? (
            <div aria-busy="true" className={s.skeletons}>
              <p className={s.searchingText}><span className={s.spinner} aria-hidden="true" /> {f(m.nearby.searching, { district: district(session.districtId) })}</p>
              {[0, 1, 2].map((i) => <Skeleton key={i} height={150} radius={20} />)}
            </div>
          ) : null}

          {shownPhase === 'results' ? (
            <div ref={listRef}>
              <p className={s.count} aria-live="polite">{f(radius === null || limit5 ? m.nearby.resultsAll : m.nearby.results, { n: num(rows.length) })}</p>
              {!personaRow ? (
                <Card className={s.personaBox} flat>
                  <Badge tone="butter" icon="user">{f(m.nearby.personaOutside, { run: formatRun(run.run) })}</Badge>
                  <p className={s.personaName}>{persona.displayName} · {district(persona.districtId)} · {f(m.common.aboutKm, { km: distanceKm(session.searchPoint, persona.location) })}</p>
                  <div className={s.personaActions}>
                    <ButtonLink href={`/helpers/${persona.id}`} small icon="doc">{m.helper.viewDetails}</ButtonLink>
                    <ButtonLink href={`/chat/new?persona=${persona.id}`} small variant="primary" icon="chat">{f(m.helper.chatWith, { name: persona.displayName })}</ButtonLink>
                  </div>
                </Card>
              ) : null}
              {rows.length ? (
                <MotionMax>
                  <ul className={s.list}>
                    <AnimatePresence initial={false}>
                      {rows.map((r) => (
                        <motionEl.li key={r.helper.id} id={`card-${r.helper.id}`} layout={rows.length <= 30} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: T.exit }} transition={T.base}>
                          <HelperCard
                            helper={r.helper}
                            distanceKm={r.distance}
                            rank={sort === 'recommended' && r.rank && r.rank <= 3 ? r.rank : undefined}
                            reasons={sort === 'recommended' && r.rank && r.rank <= 3 ? r.rec?.reasons : undefined}
                            species={species}
                            urgency={urgency}
                            selected={selected === r.helper.id}
                            onSelect={() => setSelected(r.helper.id)}
                            onBlocked={(b) => openBlocked(r.helper.id, b)}
                            onWhy={r.rec && sort === 'recommended' && r.rank && r.rank <= 3 ? () => setWhyRec({ rec: r.rec!, name: helperName(r.helper, locale) }) : undefined}
                            personaBadge={r.helper.id === personaId ? f(m.nearby.personaHere, { run: formatRun(run.run) }) : null}
                            supplies={r.helper.isUserPlace && myPlace ? { foodDays: myPlace.foodDays, litterDays: myPlace.litterDays } : shared.places.find(p=>p.id===r.helper.publicPlaceId)?.payload}
                          />
                        </motionEl.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                </MotionMax>
              ) : (
                <div className={s.empty}>
                  <p className={s.emptyTitle}>{f(m.nearby.emptyTitle, { km: radius ?? 0 })}</p>
                  <div className={s.personaActions}>
                    {nextRadius ? <Button icon="plus" onClick={() => setRadius(nextRadius)}>{f(m.nearby.expand, { km: nextRadius })}</Button> : null}
                    <Button icon="pin" onClick={() => setLimit5(true)}>{m.nearby.nearest5}</Button>
                    <Button variant="ghost" icon="x" onClick={clearFilters}>{m.nearby.clearFilters}</Button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
          <Ticker />
        </section>
      </div>

      <RecommendPopup
        request={popup}
        onClose={() => setPopup(null)}
        species={species}
        urgency={urgency}
        searchPoint={session.searchPoint}
        run={run.run}
        finding={session.findingIndex}
        searchDistrictId={session.origin === 'district_choice' ? session.districtId : undefined}
        onSeeOnMap={(pid) => { setSelected(pid); document.getElementById(`card-${pid}`)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); }}
        onSeeAll={() => { setSort('recommended'); setRadius(null); }}
      />
      <Dialog open={!!whyRec} onClose={() => setWhyRec(null)} title={m.why.title} size="md">
        {whyRec ? <WhyPanel rec={whyRec.rec} excluded={excluded} name={whyRec.name} /> : null}
      </Dialog>
    </div>
  );
}
