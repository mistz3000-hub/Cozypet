'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useId, useMemo, useRef, useState } from 'react';
import type { CollarStatus, MediaRef, PetListing, Species, Urgency } from '@/lib/types';
import { useI18n } from '@/i18n/provider';
import { COAT_COLORS, COLLAR_COLORS, collarColor } from '@/data/colors';
import { getScanDraft, setScanDraft } from '@/lib/drafts';
import { canDecode, readAsDataUrl, resizeToJpeg, validateImageFile } from '@/lib/image';
import { newId } from '@/lib/store';
import { useNow } from '@/lib/useNow';
import { playSfx } from '@/lib/audio/sfx';
import { useAuth } from '@/features/auth/AuthContext';
import { useRun } from '@/features/demo/RequireRun';
import { useToast } from '@/components/providers/Toast';
import { DistrictSelect } from '@/features/shared/DistrictSelect';
import { PetImage } from '@/components/PetImage';
import { Badge, Card, Notice } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { ChipGroup, ErrorSummary, Field, RadioGroup, Segmented, TextArea, TextInput } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { saveUserListing, getUserListing } from './actions';
import { colorsText, collarText, listingTitle, speciesLabel } from './listing-text';
import s from './form.module.css';

type Mode = 'found' | 'lost';
type Phase = 'edit' | 'preview' | 'saving' | 'done' | 'quota';

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ListingForm({ editId }: { editId?: string }) {
  const { m, f, loc, district, dateTime } = useI18n();
  const params = useSearchParams();
  const run = useRun();
  const { user } = useAuth();
  const toast = useToast();
  const now = useNow();
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);

  const existing = editId ? getUserListing(editId) : undefined;
  const fromScan = !editId && params.get('from') === 'scan' ? getScanDraft() : null;
  const initialMode: Mode = existing ? (existing.type === 'lost' ? 'lost' : 'found') : params.get('mode') === 'lost' ? 'lost' : 'found';

  const [mode, setMode] = useState<Mode>(initialMode);
  const [photo, setPhoto] = useState<MediaRef | null>(existing?.photo ?? fromScan?.photo ?? null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [species, setSpecies] = useState<Species | null>(existing?.species ?? fromScan?.species ?? null);
  const [speciesOther, setSpeciesOther] = useState(existing?.speciesOther ?? fromScan?.speciesOther ?? '');
  const [name, setName] = useState(existing?.name ?? '');
  const [breed, setBreed] = useState(existing?.breed ?? '');
  const [sex, setSex] = useState<'male' | 'female' | 'unknown'>(existing?.sex ?? 'unknown');
  const [colors, setColors] = useState<string[]>(existing?.colors ?? fromScan?.colors ?? []);
  const [markings, setMarkings] = useState(existing?.markings ?? fromScan?.markings ?? '');
  const [collarStatus, setCollarStatus] = useState<CollarStatus>(existing?.collar.status ?? fromScan?.collar.status ?? 'unknown');
  const [collarDetail, setCollarDetail] = useState(existing?.collar.detail ?? fromScan?.collar.color ?? fromScan?.collar.detail ?? '');
  const [eventAt, setEventAt] = useState(() => (existing ? toLocalInput(existing.eventAt) : fromScan?.foundAt ?? ''));
  const [districtId, setDistrictId] = useState(existing?.districtId ?? fromScan?.districtId ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [urgency, setUrgency] = useState<Urgency>(existing?.urgency ?? fromScan?.urgency ?? 'normal');
  const [phase, setPhase] = useState<Phase>('edit');
  const [submitted, setSubmitted] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  const eventInvalid = !eventAt || (now > 0 && new Date(eventAt).getTime() > now + 60_000);
  const errors = {
    species: !species ? m.scan.errSpecies : null,
    other: species === 'other' && !speciesOther.trim() ? m.scan.errOther : null,
    name: mode === 'lost' && !name.trim() ? m.listings.errName : null,
    colors: colors.length === 0 ? m.listings.errColors : null,
    event: eventInvalid ? m.listings.errEvent : null,
    district: !districtId ? m.scan.errDistrict : null,
  };
  const valid = !Object.values(errors).some(Boolean);
  const shown = submitted ? errors : Object.fromEntries(Object.keys(errors).map((k) => [k, null])) as typeof errors;
  const errorList = useMemo(() => (submitted ? ([
    ['species', errors.species], ['other', errors.other], ['name', errors.name], ['colors', errors.colors], ['event', errors.event], ['district', errors.district],
  ] as const).filter(([, v]) => v).map(([k, v]) => ({ id: `${id}-${k}`, message: v as string })) : []), [submitted, errors.species, errors.other, errors.name, errors.colors, errors.event, errors.district, id]);

  if (editId && !existing) {
    return (
      <div className="cp-container cp-page">
        <Notice tone="warn">{m.listings.notEditable}</Notice>
        <p><ButtonLink href="/listings" icon="list">{m.listings.goListings}</ButtonLink></p>
      </div>
    );
  }

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const err = validateImageFile(file);
    if (err) return setPhotoError(err === 'type' ? m.scan.errType : m.scan.errSize);
    try {
      const url = await readAsDataUrl(file);
      if (!(await canDecode(url))) throw new Error('decode');
      setPhoto({ src: url, alt: m.scan.previewAlt });
      setPhotoError(null);
    } catch {
      setPhotoError(m.scan.errDecode);
    }
  };

  const build = (photoRef: MediaRef | undefined): PetListing => {
    const ts = new Date().toISOString();
    return {
      id: existing?.id ?? newId('user-listing'),
      type: mode,
      source: 'user',
      runNumber: existing?.runNumber ?? run?.run ?? 1,
      species: species!,
      speciesOther: species === 'other' ? speciesOther.trim() : undefined,
      breed: breed.trim() || undefined,
      name: name.trim() || undefined,
      sex,
      colors,
      markings: markings.trim() || undefined,
      collar: { status: collarStatus, detail: collarStatus === 'yes' ? collarDetail.trim() || undefined : undefined },
      districtId,
      eventAt: new Date(eventAt).toISOString(),
      photo: photoRef,
      description: description.trim() || undefined,
      postedBy: { kind: 'tester' },
      urgency: mode === 'found' ? urgency : undefined,
      status: existing?.status ?? 'open',
      closedReason: existing?.closedReason,
      createdAt: existing?.createdAt ?? ts,
      updatedAt: ts,
      isDemo: true,
    };
  };

  const toPreview = () => {
    setSubmitted(true);
    if (!valid) {
      window.setTimeout(() => document.getElementById('error-summary')?.focus(), 0);
      return;
    }
    setPhase('preview');
    window.scrollTo({ top: 0 });
  };

  const save = async (withPhoto = true) => {
    setPhase('saving');
    let photoRef: MediaRef | undefined;
    if (withPhoto && photo) {
      if (photo.src.startsWith('data:')) {
        try {
          photoRef = { src: await resizeToJpeg(photo.src), alt: f(m.listings.noName, { species: species ? m.species[species] : '' }) };
        } catch {
          photoRef = undefined;
        }
      } else photoRef = photo;
    }
    const listing = build(photoRef);
    const r = saveUserListing(listing);
    if (r === 'quota') {
      setPhase('quota');
      return;
    }
    setScanDraft(null);
    setSavedId(listing.id);
    setPhase('done');
    playSfx('pop');
    toast(editId ? m.listings.savedEdit : user ? m.listings.successAccount : m.listings.successTitle);
  };

  const preview = species ? build(photo ?? undefined) : null;

  if (phase === 'done' && savedId) {
    return (
      <div className="cp-container cp-page">
        <Card className={s.success}>
          <span className={s.check} aria-hidden="true"><Icon name="check" size={34} /></span>
          <h1>{editId ? m.listings.savedEdit : user ? m.listings.successAccount : m.listings.successTitle}</h1>
          <div className={s.actions}>
            <ButtonLink href={`/listings/${savedId}`} variant="primary" icon="doc">{m.listings.openListing}</ButtonLink>
            <ButtonLink href={`/listings?tab=${mode}`} icon="list">{m.listings.goListings}</ButtonLink>
            {mode === 'lost' ? <ButtonLink href={`/listings?tab=found&species=${species}&district=${districtId}`} variant="ghost" icon="search">{m.listings.relatedFound}</ButtonLink> : null}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`cp-container cp-page ${s.page}`}>
      <h1>{editId ? m.listings.editTitle : m.listings.newTitle}</h1>
      {fromScan ? <Notice tone="success" icon="check">{m.listings.fromScan}</Notice> : null}
      <Notice tone="warn" icon="shield" className={s.warn}>{m.listings.privacyWarn}</Notice>

      {phase === 'preview' || phase === 'saving' || phase === 'quota' ? (
        <Card className={s.preview}>
          <h2>{m.listings.previewTitle}</h2>
          {preview ? (
            <div className={s.previewGrid}>
              <PetImage media={photo} ratio="4 / 3" />
              <dl className={s.previewFacts}>
                <div><dt>{m.listings.modeLabel}</dt><dd>{mode === 'found' ? m.listings.modeFound : m.listings.modeLost}</dd></div>
                <div><dt>{m.listings.name}</dt><dd>{listingTitle(preview, m, f)}</dd></div>
                <div><dt>{m.common.breed}</dt><dd>{breed || m.common.breedUnknown}</dd></div>
                <div><dt>{m.listings.fSpecies}</dt><dd>{speciesLabel(preview, m)} · {m.sex[sex]}</dd></div>
                <div><dt>{m.listings.fColors}</dt><dd>{colorsText(colors, loc)}</dd></div>
                <div><dt>{m.listings.fCollar}</dt><dd>{collarText(preview, m, loc)}</dd></div>
                {markings ? <div><dt>{m.listings.fMarkings}</dt><dd>{markings}</dd></div> : null}
                <div><dt>{m.listings.fDistrict}</dt><dd>{district(districtId)}</dd></div>
                <div><dt>{mode === 'found' ? m.listings.eventFound : m.listings.eventLost}</dt><dd>{dateTime(new Date(eventAt).toISOString())}</dd></div>
                {mode === 'found' ? <div><dt>{m.listings.urgency}</dt><dd>{m.urgency[urgency]}</dd></div> : null}
                {description ? <div><dt>{m.listings.description}</dt><dd>{description}</dd></div> : null}
                <div><dt>{m.listings.contact}</dt><dd>{m.listings.contactValue}</dd></div>
              </dl>
            </div>
          ) : null}
          {phase === 'quota' ? (
            <Notice tone="error" icon="alert" role="alert">
              {m.listings.quotaError}
              <span className={s.inlineActions}>
                <Button small onClick={() => void save(false)}>{m.listings.saveWithoutPhoto}</Button>
                <Button small variant="ghost" onClick={() => void save(true)}>{m.common.retry}</Button>
              </span>
            </Notice>
          ) : null}
          <div className={s.actions}>
            <Button icon="edit" onClick={() => setPhase('edit')} disabled={phase === 'saving'}>{m.listings.editAgain}</Button>
            <Button variant="primary" icon="send" onClick={() => void save(true)} disabled={phase === 'saving'} aria-busy={phase === 'saving'}>
              {phase === 'saving' ? m.common.sending : editId ? m.listings.saveChanges : m.listings.submit}
            </Button>
          </div>
        </Card>
      ) : (
        <form noValidate onSubmit={(e) => { e.preventDefault(); toPreview(); }} className={s.form}>
          <ErrorSummary title={m.common.errorSummary} errors={errorList} />
          {!editId ? (
            <div className={s.mode}>
              <Segmented<Mode> name={`${id}-mode`} label={m.listings.modeLabel} value={mode} onChange={setMode} options={[{ value: 'found', label: m.listings.modeFound }, { value: 'lost', label: m.listings.modeLost }]} />
            </div>
          ) : <Badge tone={mode === 'lost' ? 'tight' : 'info'}>{mode === 'found' ? m.listings.modeFound : m.listings.modeLost}</Badge>}

          <Card className={s.block}>
            <p className={s.label}>{m.listings.photo} <span className={s.optional}>({m.common.optional})</span></p>
            <p className={s.hint}>{m.listings.photoHint}</p>
            {photo ? (
              <div className={s.photo}>
                <PetImage media={photo} ratio="4 / 3" />
                <div className={s.inlineActions}>
                  <Button small icon="image" onClick={() => fileRef.current?.click()}>{m.scan.changePhoto}</Button>
                  <Button small variant="ghost" icon="trash" onClick={() => setPhoto(null)}>{m.scan.removePhoto}</Button>
                </div>
              </div>
            ) : (
              <Button icon="image" onClick={() => fileRef.current?.click()}>{m.scan.choosePhoto}</Button>
            )}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="visually-hidden" tabIndex={-1} aria-label={m.scan.choosePhoto} onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ''; }} />
            {photoError ? <Notice tone="error" icon="alert" role="alert">{photoError}</Notice> : null}
          </Card>

          <Card className={s.block}>
            <div id={`${id}-species`} tabIndex={-1}>
              <RadioGroup<Species> name={`${id}-sp`} legend={m.scan.species} required value={species} onChange={setSpecies} error={shown.species}
                options={[{ value: 'cat', label: m.species.cat }, { value: 'dog', label: m.species.dog }, { value: 'other', label: m.species.other }]} />
            </div>
            {species === 'other' ? (
              <Field id={`${id}-other`} label={m.scan.speciesOther} required error={shown.other}>
                <TextInput id={`${id}-other`} value={speciesOther} maxLength={40} onChange={(e) => setSpeciesOther(e.target.value)} aria-invalid={!!shown.other} aria-describedby={shown.other ? `${id}-other-error` : undefined} />
              </Field>
            ) : null}
            <Field id={`${id}-name`} label={m.listings.name} required={mode === 'lost'} hint={mode === 'found' ? m.listings.nameHintFound : undefined} error={shown.name}>
              <TextInput id={`${id}-name`} value={name} maxLength={40} onChange={(e) => setName(e.target.value)} aria-invalid={!!shown.name} aria-describedby={[mode === 'found' ? `${id}-name-hint` : null, shown.name ? `${id}-name-error` : null].filter(Boolean).join(' ') || undefined} />
            </Field>
            <Field id={`${id}-breed`} label={m.common.breed} hint={m.common.breedHint}>
              <TextInput id={`${id}-breed`} value={breed} maxLength={60} onChange={(e) => setBreed(e.target.value)} aria-describedby={`${id}-breed-hint`} />
            </Field>
            <RadioGroup<'male' | 'female' | 'unknown'> name={`${id}-sex`} legend={m.listings.fSex} value={sex} onChange={setSex}
              options={[{ value: 'male', label: m.sex.male }, { value: 'female', label: m.sex.female }, { value: 'unknown', label: m.listings.sexUnknown }]} />
            <div id={`${id}-colors`} tabIndex={-1}>
              <ChipGroup legend={m.listings.colorsRequired} required values={colors} onChange={setColors} error={shown.colors}
                options={COAT_COLORS.map((c) => ({ value: c.id, label: loc(c.label), swatch: c.swatch }))} />
            </div>
            <Field id={`${id}-mark`} label={m.scan.markings} counter={`${markings.length}/200`}>
              <TextArea id={`${id}-mark`} value={markings} maxLength={200} rows={2} placeholder={m.scan.markingsPh} onChange={(e) => setMarkings(e.target.value)} />
            </Field>
            <RadioGroup<CollarStatus> name={`${id}-collar`} legend={m.scan.collar} value={collarStatus} onChange={setCollarStatus}
              options={[{ value: 'yes', label: m.scan.collarYes }, { value: 'no', label: m.scan.collarNo }, { value: 'unknown', label: m.scan.collarUnknown }]} />
            {collarStatus === 'yes' ? (
              <RadioGroup<string> name={`${id}-cc`} legend={m.scan.collarColor} value={collarColor(collarDetail) ? collarDetail : null} onChange={setCollarDetail}
                options={COLLAR_COLORS.map((c) => ({ value: c.id, label: loc(c.label) }))} />
            ) : null}
          </Card>

          <Card className={s.block}>
            <div className={s.twoCol}>
              <Field id={`${id}-event`} label={mode === 'found' ? m.listings.eventFound : m.listings.eventLost} required error={shown.event}>
                <TextInput id={`${id}-event`} type="datetime-local" value={eventAt} onChange={(e) => setEventAt(e.target.value)} aria-invalid={!!shown.event} aria-describedby={shown.event ? `${id}-event-error` : undefined} />
              </Field>
              <Field id={`${id}-district`} label={mode === 'found' ? m.listings.districtFound : m.listings.districtLost} required hint={m.scan.districtHint} error={shown.district}>
                <DistrictSelect id={`${id}-district`} value={districtId} onChange={(e) => setDistrictId(e.target.value)} placeholder={m.scan.districtPh} aria-invalid={!!shown.district} aria-describedby={[`${id}-district-hint`, shown.district ? `${id}-district-error` : null].filter(Boolean).join(' ')} />
              </Field>
            </div>
            {mode === 'found' ? (
              <RadioGroup<Urgency> name={`${id}-urg`} legend={m.listings.urgency} value={urgency} onChange={setUrgency}
                options={(['normal', 'soon', 'emergency'] as Urgency[]).map((u) => ({ value: u, label: m.urgency[u] }))} />
            ) : null}
            <Field id={`${id}-desc`} label={m.listings.description} counter={`${description.length}/300`}>
              <TextArea id={`${id}-desc`} value={description} maxLength={300} rows={3} onChange={(e) => setDescription(e.target.value)} />
            </Field>
            <p className={s.label}>{m.listings.contact}</p>
            <p className={s.contact}><Icon name="chat" size="1em" /> {m.listings.contactValue}</p>
          </Card>

          <div className={s.actions}>
            <Button type="submit" variant="primary" icon="eye">{m.listings.preview}</Button>
            <Link href="/listings" className={s.cancel}>{m.common.cancel}</Link>
          </div>
        </form>
      )}
    </div>
  );
}
