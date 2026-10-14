'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { CollarStatus, MediaRef, Species } from '@/lib/types';
import { useI18n } from '@/i18n/provider';
import { useAnnounce } from '@/components/providers/Announcer';
import { useReducedMotion, m as motionEl, AnimatePresence } from '@/lib/motion';
import { SPRING, T, staggerDelay } from '@/lib/motion-tokens';
import { COAT_COLORS, COLLAR_COLORS, coatColor, collarColor } from '@/data/colors';
import { petPhotoFor } from '@/data/pet-photos';
import { animalBreedLabel } from '@/data/animal-catalog';
import { findCandidates, type MatchCandidate, type MatchReason } from '@/lib/matching';
import { canDecode, readAsDataUrl, validateImageFile } from '@/lib/image';
import { setScanDraft, getScanDraft } from '@/lib/drafts';
import { playSfx } from '@/lib/audio/sfx';
import { useNow } from '@/lib/useNow';
import { useAllListings } from '@/features/shared/data-hooks';
import { DistrictSelect } from '@/features/shared/DistrictSelect';
import { AssistBox } from '@/features/assist/AssistBox';
import { PetImage } from '@/components/PetImage';
import { RadarWaves } from '@/components/RadarWaves';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Badge, Card, Notice } from '@/components/ui/Badge';
import { ChipGroup, Field, RadioGroup, TextArea, TextInput, ErrorSummary } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import s from './scan.module.css';

type Phase = 'form' | 'scanning' | 'result';
const SCAN_STEP_MS = 900;

function localNowInput(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ScanPage() {
  const { m, f, district, date, loc } = useI18n();
  const router = useRouter();
  const announce = useAnnounce();
  const reduced = useReducedMotion();
  const listings = useAllListings();
  const id = useId();

  const prev = getScanDraft();
  const [photo, setPhoto] = useState<MediaRef | null>(prev?.photo ?? null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [species, setSpecies] = useState<Species | null>(prev?.species ?? null);
  const [speciesOther, setSpeciesOther] = useState(prev?.speciesOther ?? '');
  const [colors, setColors] = useState<string[]>(prev?.colors ?? []);
  const [markings, setMarkings] = useState(prev?.markings ?? '');
  const [collarStatus, setCollarStatus] = useState<CollarStatus>(prev?.collar.status ?? 'unknown');
  const [collarColorId, setCollarColorId] = useState<string>(prev?.collar.color ?? '');
  const [collarDetail, setCollarDetail] = useState(prev?.collar.detail ?? '');
  const [districtId, setDistrictId] = useState(prev?.districtId ?? '');
  const [foundAt, setFoundAt] = useState(() => prev?.foundAt ?? localNowInput());
  const [demoCase, setDemoCase] = useState<'match' | 'nomatch'>('match');
  const [submitted, setSubmitted] = useState(false);
  const [phase, setPhase] = useState<Phase>('form');
  const [scanStep, setScanStep] = useState(0);
  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const timers = useRef<number[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);

  const now = useNow();
  const future = !!foundAt && now > 0 && new Date(foundAt).getTime() > now + 60_000;
  const errors = {
    photo: !photo ? m.scan.needPhoto : null,
    species: !species ? m.scan.errSpecies : null,
    other: species === 'other' && !speciesOther.trim() ? m.scan.errOther : null,
    district: !districtId ? m.scan.errDistrict : null,
    foundAt: future ? m.scan.errFuture : null,
  };
  const valid = !Object.values(errors).some(Boolean);
  const shownErrors = submitted ? errors : { ...errors, photo: null, species: null, other: null, district: null };

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const draft = () => ({
    photo, species, speciesOther, colors, markings,
    collar: { status: collarStatus, color: collarColorId || undefined, detail: collarDetail || undefined },
    districtId, foundAt,
  });

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const err = validateImageFile(file);
    if (err) {
      setPhotoError(err === 'type' ? m.scan.errType : m.scan.errSize);
      return;
    }
    try {
      const url = await readAsDataUrl(file);
      if (!(await canDecode(url))) throw new Error('decode');
      setPhoto({ src: url, alt: m.scan.previewAlt });
      setPhotoError(null);
      playSfx('shutter');
    } catch {
      setPhotoError(m.scan.errDecode);
    }
  };

  const chooseSample = (kind: 'cat' | 'dog') => {
    const sample = petPhotoFor(kind === 'cat' ? 'listing-001' : 'listing-006');
    if (!sample) return;
    setPhoto({ ...sample, alt: kind === 'cat' ? m.scan.sampleAlt : m.scan.sampleDogAlt });
    setPhotoError(null);
    // Fixture metadata, never inferred from the image. Choosing another sample resets its observations.
    setSpecies(kind);
    setSpeciesOther('');
    setColors(kind === 'cat' ? ['orange', 'white'] : ['golden']);
    setMarkings('');
    setCollarStatus('yes');
    setCollarColorId('red');
    setCollarDetail('');
    setDistrictId(kind === 'cat' ? 'phra-khanong' : 'lat-phrao');
    playSfx('shutter');
  };

  const startScan = () => {
    setSubmitted(true);
    if (!valid) {
      window.setTimeout(() => document.getElementById('error-summary')?.focus(), 0);
      return;
    }
    setScanDraft(draft());
    setPhase('scanning');
    // การ์ดสแกนอยู่บนสุด แต่ปุ่มเริ่มสแกนอยู่ท้ายฟอร์ม — เลื่อนขึ้นให้เห็นขั้นตอน
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    setScanStep(0);
    setShowAlternatives(false);
    announce(m.scan.scanStep1);
    playSfx('scan');
    timers.current.push(window.setTimeout(() => { setScanStep(1); announce(m.scan.scanStep2); }, SCAN_STEP_MS));
    timers.current.push(window.setTimeout(() => { setScanStep(2); announce(m.scan.scanStep3); }, SCAN_STEP_MS * 2));
    timers.current.push(window.setTimeout(() => {
      const found = demoCase === 'match'
        ? findCandidates({ species: species!, colors, collar: { status: collarStatus, detail: collarColorId || undefined }, districtId, foundAt: new Date(foundAt).toISOString() }, listings)
        : [];
      setCandidates(found);
      setPhase('result');
      if (found.length) playSfx('chime');
      announce(found.length ? f(m.scan.foundTitle, { n: found.length }) : m.scan.notFoundTitle);
      window.setTimeout(() => resultHeading.current?.focus(), 50);
    }, SCAN_STEP_MS * 3));
  };

  const cancelScan = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setPhase('form');
  };

  const reasonText = (r: MatchReason) => {
    switch (r.code) {
      case 'same_species': return m.scan.reason.same_species;
      case 'shared_colors': return f(m.scan.reason.shared_colors, { colors: r.colors.map((c) => coatColor(c) ? loc(coatColor(c)!.label) : c).join(m.common.and) });
      case 'collar_both': return r.color ? f(m.scan.reason.collar_same, { color: loc(collarColor(r.color)!.label) }) : m.scan.reason.collar_both;
      case 'nearby': return f(m.scan.reason.nearby, { km: r.km });
      case 'after_lost': return f(m.scan.reason.after_lost, { days: r.days });
      default: return m.scan.reason.needs_more_checks;
    }
  };

  const goPostFound = () => {
    setScanDraft(draft());
    router.push('/listings/new?mode=found&from=scan');
  };

  const steps = [m.scan.scanStep1, m.scan.scanStep2, m.scan.scanStep3];
  const errorList = useMemo(() => (submitted ? [
    errors.photo && { id: `${id}-photo`, message: errors.photo },
    errors.species && { id: `${id}-species`, message: errors.species },
    errors.other && { id: `${id}-other`, message: errors.other },
    errors.district && { id: `${id}-district`, message: errors.district },
    errors.foundAt && { id: `${id}-found`, message: errors.foundAt },
  ].filter(Boolean) as { id: string; message: string }[] : []), [submitted, errors.photo, errors.species, errors.other, errors.district, errors.foundAt, id]);

  return (
    <div className={`cp-container cp-page ${s.page}`}>
      <header className={s.head}>
        <h1>{m.scan.title}</h1>
        <p className={s.intro}>{m.scan.intro}</p>
        <Badge tone="info" icon="info" className={s.simBadge}><span data-tour="scan-note">{m.scan.simNote}</span></Badge>
      </header>

      {phase === 'form' ? (
        <form className={s.form} noValidate onSubmit={(e) => { e.preventDefault(); startScan(); }}>
          <ErrorSummary title={m.common.errorSummary} errors={errorList} />

          <Card className={s.block} as="section" aria-labelledby={`${id}-p1`}>
            <h2 id={`${id}-p1`} className={s.blockTitle}><span className={s.num}>1</span>{m.scan.photoTitle}</h2>
            <p className={s.hint}>{m.scan.photoHint}</p>
            <div className={s.photoArea} data-tour="scan-upload">
              {photo ? (
                <div className={s.preview}>
                  <PetImage media={photo} ratio="4 / 3" className={s.previewImg} />
                  <div className={s.photoActions}>
                    <Button small icon="image" onClick={() => fileInput.current?.click()}>{m.scan.changePhoto}</Button>
                    <Button small variant="ghost" icon="trash" onClick={() => setPhoto(null)}>{m.scan.removePhoto}</Button>
                    <Button small variant="ghost" icon="paw" onClick={() => chooseSample('cat')}>{m.scan.useSample}</Button>
                    <Button small variant="ghost" icon="paw" onClick={() => chooseSample('dog')}>{m.scan.useDogSample}</Button>
                  </div>
                </div>
              ) : (
                <div className={s.pickers} id={`${id}-photo`} tabIndex={-1}>
                  <Button icon="camera" onClick={() => cameraInput.current?.click()}>{m.scan.takePhoto}</Button>
                  <Button icon="image" onClick={() => fileInput.current?.click()}>{m.scan.choosePhoto}</Button>
                  <Button variant="primary" icon="paw" onClick={() => chooseSample('cat')} data-tour-safe="true">{m.scan.useSample}</Button>
                  <Button icon="paw" onClick={() => chooseSample('dog')}>{m.scan.useDogSample}</Button>
                </div>
              )}
              <input ref={cameraInput} type="file" accept="image/*" capture="environment" className="visually-hidden" tabIndex={-1} onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ''; }} aria-label={m.scan.takePhoto} />
              <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="visually-hidden" tabIndex={-1} onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ''; }} aria-label={m.scan.choosePhoto} />
              {photoError ? <Notice tone="error" icon="alert" role="alert">{photoError}</Notice> : null}
              {shownErrors.photo ? <p className={s.err}><Icon name="alert" size="1em" /> {shownErrors.photo}</p> : null}
            </div>
          </Card>

          <Card className={s.block} as="section" aria-labelledby={`${id}-p2`}>
            <h2 id={`${id}-p2`} className={s.blockTitle}><span className={s.num}>2</span>{m.scan.detailsTitle}</h2>
            <div id={`${id}-species`} tabIndex={-1}>
              <RadioGroup<Species>
                name={`${id}-sp`}
                legend={m.scan.species}
                required
                value={species}
                onChange={setSpecies}
                error={shownErrors.species}
                options={[{ value: 'cat', label: m.species.cat }, { value: 'dog', label: m.species.dog }, { value: 'other', label: m.species.other }]}
              />
            </div>
            {species === 'other' ? (
              <Field id={`${id}-other`} label={m.scan.speciesOther} required error={shownErrors.other}>
                <TextInput id={`${id}-other`} value={speciesOther} maxLength={40} onChange={(e) => setSpeciesOther(e.target.value)} aria-invalid={!!shownErrors.other} aria-describedby={shownErrors.other ? `${id}-other-error` : undefined} />
              </Field>
            ) : null}
            <ChipGroup legend={m.scan.colors} values={colors} onChange={setColors} options={COAT_COLORS.map((c) => ({ value: c.id, label: loc(c.label), swatch: c.swatch }))} />
            <Field id={`${id}-mark`} label={m.scan.markings} counter={`${markings.length}/200`}>
              <TextArea id={`${id}-mark`} value={markings} maxLength={200} placeholder={m.scan.markingsPh} onChange={(e) => setMarkings(e.target.value)} rows={2} />
            </Field>
            <RadioGroup<CollarStatus>
              name={`${id}-collar`}
              legend={m.scan.collar}
              value={collarStatus}
              onChange={setCollarStatus}
              options={[{ value: 'yes', label: m.scan.collarYes }, { value: 'no', label: m.scan.collarNo }, { value: 'unknown', label: m.scan.collarUnknown }]}
            />
            {collarStatus === 'yes' ? (
              <>
                <RadioGroup<string>
                  name={`${id}-collar-color`}
                  legend={m.scan.collarColor}
                  value={collarColorId || null}
                  onChange={setCollarColorId}
                  options={COLLAR_COLORS.map((c) => ({ value: c.id, label: <span className={s.swatchLabel}><span className={s.swatch} style={{ background: c.swatch }} aria-hidden="true" />{loc(c.label)}</span> }))}
                />
                <Field id={`${id}-cd`} label={m.scan.collarDetail}>
                  <TextInput id={`${id}-cd`} value={collarDetail} maxLength={80} onChange={(e) => setCollarDetail(e.target.value)} />
                </Field>
              </>
            ) : null}
            <div className={s.twoCol}>
              <Field id={`${id}-district`} label={m.scan.district} required hint={m.scan.districtHint} error={shownErrors.district}>
                <DistrictSelect id={`${id}-district`} value={districtId} onChange={(e) => setDistrictId(e.target.value)} placeholder={m.scan.districtPh} aria-invalid={!!shownErrors.district} aria-describedby={[`${id}-district-hint`, shownErrors.district ? `${id}-district-error` : null].filter(Boolean).join(' ')} />
              </Field>
              <Field id={`${id}-found`} label={m.scan.foundAt} error={shownErrors.foundAt}>
                <TextInput id={`${id}-found`} type="datetime-local" value={foundAt} max={localNowInput()} onChange={(e) => setFoundAt(e.target.value)} aria-invalid={!!shownErrors.foundAt} aria-describedby={shownErrors.foundAt ? `${id}-found-error` : undefined} />
              </Field>
            </div>
          </Card>

          <Card className={s.block} as="section" aria-labelledby={`${id}-p3`}>
            <h2 id={`${id}-p3`} className={s.blockTitle}><span className={s.num}>3</span>{m.scan.caseTitle}</h2>
            <div data-tour="scan-case">
              <RadioGroup<'match' | 'nomatch'>
                name={`${id}-case`}
                legend={m.scan.caseTitle}
                hint={m.scan.caseHint}
                value={demoCase}
                onChange={setDemoCase}
                layout="column"
                options={[{ value: 'match', label: m.scan.caseMatch }, { value: 'nomatch', label: m.scan.caseNoMatch }]}
              />
            </div>
            <Button type="submit" variant="primary" icon="scan" block className={s.startBtn} aria-disabled={!valid}>{m.scan.startScan}</Button>
          </Card>
        </form>
      ) : null}

      {phase === 'scanning' ? (
        <Card className={s.scanCard} aria-busy="true">
          <div className={s.scanVisual}>
            <PetImage media={photo} ratio="4 / 3" />
            {!reduced ? (
              <>
                <span className={s.scanLine} aria-hidden="true" />
              </>
            ) : null}
            <RadarWaves />
          </div>
          <div className={s.scanSide}>
            <h2>{m.scan.scanning}</h2>
            <ol className={s.scanSteps}>
              {steps.map((label, i) => {
                const state = i < scanStep ? 'done' : i === scanStep ? 'now' : 'wait';
                return (
                  <li key={label} data-state={state}>
                    <span className={s.stepMark} aria-hidden="true">{state === 'done' ? <Icon name="check" size="1em" /> : state === 'now' ? <span className={s.dot} /> : null}</span>
                    <span>{label}</span>
                    <span className="visually-hidden"> — {state === 'done' ? m.scan.stepDone : state === 'now' ? m.scan.stepNow : m.scan.stepWait}</span>
                  </li>
                );
              })}
            </ol>
            <p className={s.simInline}><Icon name="info" size="1em" /> {m.scan.simNote}</p>
            <Button icon="x" onClick={cancelScan}>{m.common.cancel}</Button>
          </div>
        </Card>
      ) : null}

      {phase === 'result' ? (
        <div className={s.results}>
          {candidates.length ? (
            <>
              <h2 ref={resultHeading} tabIndex={-1} className={s.resultTitle}>{f(m.scan.foundTitle, { n: candidates.length })}</h2>
              <p className={s.hint}>{m.scan.foundIntro}</p>
              <ul className={s.candList}>
                <AnimatePresence>
                  {candidates.map((c, i) => {
                    const l = c.listing;
                    const ownerId = l.postedBy.kind === 'owner' ? l.postedBy.id : null;
                    return (
                      <motionEl.li
                        key={l.id}
                        className={s.cand}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...SPRING.soft, delay: staggerDelay(i) }}
                      >
                        <PetImage media={l.photo} ratio="4 / 3" className={s.candImg} />
                        <div className={s.candBody}>
                          <div className={s.badges}>
                            <Badge tone="tight">{m.listingType.lost}</Badge>
                            <Badge tone="info">{m.common.demo}</Badge>
                          </div>
                          <h3>{l.name ?? m.species[l.species]}</h3>
                          <p className={s.traits}>{m.common.breed}: {animalBreedLabel(l, loc, m.common.breedUnknown)}</p>
                          <p className={s.traits}>
                            {l.species === 'other' ? l.speciesOther ?? m.species.other : m.species[l.species]} · {l.colors.map((c) => coatColor(c) ? loc(coatColor(c)!.label) : c).join(', ')}
                            {' · '}{l.collar.status === 'yes' && collarColor(l.collar.detail) ? `${m.scan.collarShort.yes} (${loc(collarColor(l.collar.detail)!.label)})` : m.scan.collarShort[l.collar.status]}
                          </p>
                          {l.markings ? <p className={s.traits} lang="th">{l.markings}</p> : null}
                          <p className={s.meta}><Icon name="pin" size="1em" /> {f(m.scan.lostAt, { district: district(l.districtId), date: date(l.eventAt) })} <span className={s.sample}>({m.common.sampleDate})</span></p>
                          <div className={s.reasons}>
                            <p className={s.reasonsTitle}>{m.scan.reasonsTitle}</p>
                            <ul>
                              {c.reasons.map((r, k) => (
                                <li key={k}><Icon name={r.code === 'needs_more_checks' ? 'info' : 'check'} size="1em" /> {reasonText(r)}</li>
                              ))}
                            </ul>
                          </div>
                          <div className={s.candActions}>
                            <ButtonLink href={`/listings/${l.id}`} small icon="list">{m.scan.viewListing}</ButtonLink>
                            {ownerId ? <ButtonLink href={`/chat/new?persona=${ownerId}&listing=${l.id}`} small variant="primary" icon="chat">{m.scan.chatOwner}</ButtonLink> : null}
                          </div>
                        </div>
                      </motionEl.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
              <Notice tone="butter" icon="shield">{m.scan.safety}</Notice>
              <div className={s.resultActions}>
                <Button icon="x" onClick={() => setShowAlternatives(true)} aria-expanded={showAlternatives}>{m.scan.noneOfThese}</Button>
                <Button variant="ghost" icon="refresh" onClick={() => setPhase('form')}>{m.scan.rescan}</Button>
              </div>
            </>
          ) : (
            <>
              <motionEl.div className={s.notFound} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={T.base}>
                <span className={s.nfIcon} aria-hidden="true"><Icon name="search" size={30} /></span>
                <h2 ref={resultHeading} tabIndex={-1} data-film="scan-notfound">{m.scan.notFoundTitle}</h2>
                <p>{m.scan.notFoundText}</p>
              </motionEl.div>
            </>
          )}
          {(!candidates.length || showAlternatives) ? (
            <section className={s.alternatives} aria-label={m.scan.nextSteps}>
              <h3>{m.scan.nextSteps}</h3>
              <div className={s.altButtons}>
                <Button variant="primary" icon="plus" onClick={goPostFound} data-film="post-found">{m.scan.postFound}</Button>
                <ButtonLink href={`/nearby?district=${districtId}&species=${species ?? 'cat'}`} icon="search">{m.scan.findHelp}</ButtonLink>
                <Button variant="ghost" icon="edit" onClick={() => setPhase('form')}>{m.scan.editRescan}</Button>
              </div>
              <AssistBox
                compact
                onApply={(r) => {
                  const q = new URLSearchParams({ district: r.districtId ?? districtId, species: r.species !== 'unknown' ? r.species : species ?? 'cat', urgency: r.urgency !== 'unknown' ? r.urgency : 'normal', auto: '1' });
                  router.push(`/nearby?${q.toString()}`);
                }}
              />
            </section>
          ) : null}
          <p className={s.back}><Link href="/">{m.notFound.home}</Link></p>
        </div>
      ) : null}
    </div>
  );
}
