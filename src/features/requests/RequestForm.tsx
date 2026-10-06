'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useId, useMemo, useState } from 'react';
import type { CareRequest, ExclusionKey, HomeType, RequestType, Species, Urgency } from '@/lib/types';
import { useI18n } from '@/i18n/provider';
import { getHelper } from '@/data';
import { helperBlocker } from '@/lib/balancer';
import { newId, updateValue, useStore } from '@/lib/store';
import { playSfx } from '@/lib/audio/sfx';
import { useToast } from '@/components/providers/Toast';
import { Badge, Card, Notice } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Checkbox, ErrorSummary, Field, RadioGroup, Select, TextArea, TextInput, describedBy } from '@/components/ui/Field';
import { NotFoundView } from '@/components/shell/NotFoundView';
import { useCurrentFinding, useRun } from '@/features/demo/RequireRun';
import { useAllListings, useListing } from '@/features/shared/data-hooks';
import { DistrictSelect } from '@/features/shared/DistrictSelect';
import { helperName } from '@/features/helpers/helper-text';
import { listingTitle, speciesLabel } from '@/features/listings/listing-text';
import { RecommendPopup, type PopupRequest } from '@/features/balancer/RecommendPopup';
import s from './requests.module.css';

const HOME_TYPES: HomeType[] = ['condo', 'apartment', 'townhouse', 'house', 'shophouse', 'wooden_house'];
type Duration = 'two_weeks' | 'one_month' | 'until_home';
const NOTE_MAX = 500;

function isType(v: string | null): v is RequestType {
  return v === 'intake' || v === 'foster' || v === 'adopt';
}

/** ฟอร์มคำขอ 3 ชนิด (PROMPT.md 7.5) — ส่งแล้วสถานะเป็น “รอการติดต่อ (demo)” เสมอ */
export function RequestForm() {
  const params = useSearchParams();
  const rawType = params.get('type');
  const type: RequestType = isType(rawType) ? rawType : 'intake';
  const listing = useListing(params.get('listing') ?? undefined);
  const helperId = type === 'intake' ? params.get('helper') : listing?.careHolderId;
  const helper = getHelper(helperId);
  if (!helper) return <NotFoundView />;
  return <Form key={`${type}:${helper.id}:${listing?.id ?? ''}`} type={type} helperId={helper.id} listingId={type === 'intake' ? params.get('listing') ?? undefined : listing?.id} />;
}

function Form({ type, helperId, listingId }: { type: RequestType; helperId: string; listingId?: string }) {
  const { m, f, district, locale } = useI18n();
  const router = useRouter();
  const toast = useToast();
  const run = useRun()!;
  const finding = useCurrentFinding();
  const all = useAllListings();
  const requests = useStore('careRequests');
  const id = useId();
  const h = getHelper(helperId)!;
  const name = helperName(h, locale);
  const target = type === 'intake' ? undefined : all.find((l) => l.id === listingId);

  // intake: ประกาศพบสัตว์ของฉันใน Run นี้
  const myFound = useMemo(() => all.filter((l) => l.source === 'user' && l.type === 'found' && l.status === 'open' && l.runNumber === run.run), [all, run.run]);
  const initialSource = listingId && myFound.some((l) => l.id === listingId) ? listingId : myFound[0]?.id ?? 'short';
  const [source, setSource] = useState<string>(initialSource);
  const chosen = myFound.find((l) => l.id === source);
  const [shortSpecies, setShortSpecies] = useState<Species | null>(h.speciesAccepted.length === 1 ? h.speciesAccepted[0] : null);
  const [shortDistrict, setShortDistrict] = useState<string>(finding?.districtId ?? h.districtId);
  const [symptoms, setSymptoms] = useState('');
  const [urgency, setUrgency] = useState<Urgency>(chosen?.urgency ?? 'normal');
  const [note, setNote] = useState('');
  // foster / adopt
  const [duration, setDuration] = useState<Duration | null>(null);
  const [housing, setHousing] = useState<HomeType | ''>('');
  const [otherPets, setOtherPets] = useState('');
  const [experience, setExperience] = useState('');
  const [startDate, setStartDate] = useState('');
  const [household, setHousehold] = useState<'yes' | 'no' | null>(null);
  const [reason, setReason] = useState('');
  const [ack, setAck] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [popup, setPopup] = useState<PopupRequest | null>(null);
  const [blockedNow, setBlockedNow] = useState<string | null>(null);

  const species: Species | null = type === 'intake' ? (chosen ? chosen.species : shortSpecies) : target?.species ?? null;

  // เงื่อนไขก่อนส่ง (ตรวจซ้ำตอนกดส่ง)
  const blockerFor = (): { key: ExclusionKey | 'closed'; text: string } | null => {
    if (type !== 'intake') {
      if (!target || target.status !== 'open') return { key: 'closed', text: m.requests.listingClosed };
      return null;
    }
    const b = helperBlocker(h, species ?? h.speciesAccepted[0] ?? 'cat', urgency);
    if (!b) return null;
    const text = b === 'full' ? m.helper.disabledFull
      : b === 'species' ? f(m.helper.disabledSpecies, { species: m.species[species ?? 'cat'] })
        : b === 'unavailable' ? m.helper.disabledClosed
          : b === 'emergency' ? m.helper.disabledEmergency : m.helper.disabledMode;
    return { key: b, text };
  };
  const blocked = blockerFor();

  const req = m.requests.errRequired;
  const errors: Record<string, string | null> = type === 'intake'
    ? {
      [`${id}-sp`]: !chosen && !shortSpecies ? req : null,
      [`${id}-sym`]: !chosen && !symptoms.trim() ? req : null,
    }
    : type === 'foster'
      ? {
        [`${id}-dur`]: !duration ? req : null,
        [`${id}-home`]: !housing ? req : null,
        [`${id}-start`]: !startDate ? req : null,
        [`${id}-ack`]: !ack ? m.requests.ackRequired : null,
      }
      : {
        [`${id}-home`]: !housing ? req : null,
        [`${id}-hh`]: !household ? req : null,
        [`${id}-why`]: !reason.trim() ? req : null,
        [`${id}-ack`]: !ack ? m.requests.ackRequired : null,
      };
  const shown = (k: string) => (submitted ? errors[`${id}-${k}`] ?? null : null);
  const labels: Record<string, string> = {
    [`${id}-sp`]: m.requests.shortSpecies, [`${id}-sym`]: m.requests.shortSymptoms, [`${id}-dur`]: m.requests.duration,
    [`${id}-home`]: m.requests.housing, [`${id}-start`]: m.requests.startDate, [`${id}-hh`]: m.requests.household,
    [`${id}-why`]: m.requests.reason, [`${id}-ack`]: type === 'foster' ? m.requests.ackFoster : m.requests.ackAdopt,
  };
  const errorList = submitted ? Object.entries(errors).filter(([, v]) => v).map(([k, v]) => ({ id: k, message: `${labels[k]}: ${v}` })) : [];

  const submit = async () => {
    setSubmitted(true);
    if (errorList.length || Object.values(errors).some(Boolean)) {
      window.setTimeout(() => document.getElementById('error-summary')?.focus(), 0);
      return;
    }
    const b = blockerFor();
    if (b) {
      setBlockedNow(f(m.requests.blocked, { reason: b.text }));
      return;
    }
    setSending(true);
    await new Promise((r) => window.setTimeout(r, 500));
    const ts = new Date().toISOString();
    const answers: CareRequest['answers'] = type === 'intake'
      ? chosen
        ? { source: 'listing', urgency, note: note.trim() }
        : { source: 'short', species: shortSpecies!, districtId: shortDistrict, symptoms: symptoms.trim(), urgency, note: note.trim() }
      : type === 'foster'
        ? { duration: duration!, housing, otherPets: otherPets.trim(), experience: experience.trim(), startDate, ack }
        : { housing, household: household === 'yes', otherPets: otherPets.trim(), experience: experience.trim(), reason: reason.trim(), ack };
    const record: CareRequest = {
      id: newId('req'),
      runNumber: run.run,
      type,
      helperId: h.id,
      listingId: type === 'intake' ? chosen?.id : target?.id,
      answers,
      status: 'pending_contact',
      createdAt: ts,
      updatedAt: ts,
    };
    updateValue('careRequests', (prev) => [record, ...prev]);
    playSfx('pop');
    toast(m.requests.sent);
    router.push(`/requests/${record.id}`);
  };

  const existing = requests.find((r) => r.status === 'pending_contact' && r.runNumber === run.run && r.type === type && r.helperId === h.id && (type === 'intake' || r.listingId === target?.id));

  return (
    <div className={`cp-container cp-page ${s.page}`}>
      <Badge tone="butter" icon="info">{m.common.demo}</Badge>
      <h1>{m.requests.newTitle[type]}</h1>
      <p className={s.to}>{f(m.requests.to, { name })}</p>
      {target ? (
        <p className={s.pet}>{f(m.requests.petFor, { name: listingTitle(target, m, f), species: speciesLabel(target, m), district: district(target.districtId) })}</p>
      ) : null}
      <Notice tone="info" icon="shield">{m.requests.demoNote}</Notice>
      {existing ? (
        <Notice tone="butter" icon="doc">
          {m.requests.statusTitle[type]} · <Link href={`/requests/${existing.id}`}>{m.common.viewDetails}</Link>
        </Notice>
      ) : null}

      {blocked ? (
        <Notice tone="error" icon="alert" role="alert">
          {f(m.requests.blocked, { reason: blocked.text })}
          {blocked.key !== 'closed' && blocked.key !== 'emergency' && finding ? (
            <span className={s.inline}><Button small onClick={() => setPopup({ sourceId: h.id, blocker: blocked.key as ExclusionKey })}>{m.requests.blockedSeeOthers}</Button></span>
          ) : null}
        </Notice>
      ) : null}
      {blockedNow && !blocked ? <Notice tone="error" icon="alert" role="alert">{blockedNow}</Notice> : null}

      <form noValidate className={s.form} onSubmit={(e) => { e.preventDefault(); void submit(); }}>
        <ErrorSummary title={m.common.errorSummary} errors={errorList} />

        {type === 'intake' ? (
          <Card flat className={s.block}>
            <h2 className={s.h2}>{m.requests.aboutPet}</h2>
            {myFound.length ? (
              <RadioGroup<string>
                name={`${id}-src`}
                legend={m.requests.chooseFound}
                layout="column"
                value={source}
                onChange={setSource}
                options={[
                  ...myFound.map((l) => ({ value: l.id, label: f(m.requests.listingOption, { title: listingTitle(l, m, f), district: district(l.districtId) }), description: l.urgency ? m.urgency[l.urgency] : undefined })),
                  { value: 'short', label: m.requests.shortOption },
                ]}
              />
            ) : <p className={s.muted}>{m.requests.noFoundListing}</p>}
            {!chosen ? (
              <div className={s.shortGrid}>
                <div id={`${id}-sp`} tabIndex={-1}>
                  <RadioGroup<Species>
                    name={`${id}-sp-r`}
                    legend={m.requests.shortSpecies}
                    required
                    value={shortSpecies}
                    onChange={setShortSpecies}
                    error={shown('sp')}
                    options={(['cat', 'dog', 'other'] as Species[]).map((x) => ({ value: x, label: m.species[x] }))}
                  />
                </div>
                <Field id={`${id}-dist`} label={m.requests.shortDistrict}>
                  <DistrictSelect id={`${id}-dist`} value={shortDistrict} onChange={(e) => setShortDistrict(e.target.value)} />
                </Field>
                <Field id={`${id}-sym`} label={m.requests.shortSymptoms} required error={shown('sym')}>
                  <TextArea id={`${id}-sym`} value={symptoms} maxLength={NOTE_MAX} rows={3} onChange={(e) => setSymptoms(e.target.value)} aria-invalid={!!shown('sym')} aria-describedby={describedBy(`${id}-sym`, null, shown('sym'))} />
                </Field>
              </div>
            ) : null}
            <RadioGroup<Urgency>
              name={`${id}-urg`}
              legend={m.requests.urgency}
              value={urgency}
              onChange={setUrgency}
              options={(['normal', 'soon', 'emergency'] as Urgency[]).map((u) => ({
                value: u,
                label: m.urgency[u],
                disabled: u === 'emergency' && !h.acceptsEmergency,
                description: u === 'emergency' && !h.acceptsEmergency ? m.requests.emergencyNotAccepted : undefined,
              }))}
            />
            <Field id={`${id}-note`} label={m.requests.note} hint={m.requests.noteHint} counter={`${note.length}/${NOTE_MAX}`}>
              <TextArea id={`${id}-note`} value={note} maxLength={NOTE_MAX} rows={3} onChange={(e) => setNote(e.target.value)} aria-describedby={`${id}-note-hint`} />
            </Field>
          </Card>
        ) : (
          <Card flat className={s.block}>
            {type === 'foster' ? (
              <div id={`${id}-dur`} tabIndex={-1}>
                <RadioGroup<Duration>
                  name={`${id}-dur-r`}
                  legend={m.requests.duration}
                  required
                  value={duration}
                  onChange={setDuration}
                  error={shown('dur')}
                  options={(['two_weeks', 'one_month', 'until_home'] as Duration[]).map((d) => ({ value: d, label: m.requests.durationOpts[d] }))}
                />
              </div>
            ) : null}
            <Field id={`${id}-home`} label={m.requests.housing} required error={shown('home')}>
              <Select id={`${id}-home`} value={housing} onChange={(e) => setHousing(e.target.value as HomeType)} aria-invalid={!!shown('home')} aria-describedby={describedBy(`${id}-home`, null, shown('home'))}>
                <option value="">{m.requests.housingChoose}</option>
                {HOME_TYPES.map((t) => <option key={t} value={t}>{m.home[t]}</option>)}
              </Select>
            </Field>
            {type === 'adopt' ? (
              <div id={`${id}-hh`} tabIndex={-1}>
                <RadioGroup<'yes' | 'no'>
                  name={`${id}-hh-r`}
                  legend={m.requests.household}
                  required
                  value={household}
                  onChange={setHousehold}
                  error={shown('hh')}
                  options={[{ value: 'yes', label: m.common.yes }, { value: 'no', label: m.common.no }]}
                />
              </div>
            ) : null}
            <Field id={`${id}-pets`} label={m.requests.otherPets} hint={m.requests.otherPetsHint}>
              <TextInput id={`${id}-pets`} value={otherPets} maxLength={120} onChange={(e) => setOtherPets(e.target.value)} aria-describedby={`${id}-pets-hint`} />
            </Field>
            <Field id={`${id}-exp`} label={m.requests.experience}>
              <TextArea id={`${id}-exp`} value={experience} maxLength={NOTE_MAX} rows={3} onChange={(e) => setExperience(e.target.value)} />
            </Field>
            {type === 'foster' ? (
              <Field id={`${id}-start`} label={m.requests.startDate} required error={shown('start')}>
                <TextInput id={`${id}-start`} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} aria-invalid={!!shown('start')} aria-describedby={describedBy(`${id}-start`, null, shown('start'))} />
              </Field>
            ) : (
              <Field id={`${id}-why`} label={m.requests.reason} required error={shown('why')}>
                <TextArea id={`${id}-why`} value={reason} maxLength={NOTE_MAX} rows={3} onChange={(e) => setReason(e.target.value)} aria-invalid={!!shown('why')} aria-describedby={describedBy(`${id}-why`, null, shown('why'))} />
              </Field>
            )}
            <Checkbox id={`${id}-ack`} checked={ack} onChange={setAck} required error={shown('ack')}>
              {type === 'foster' ? m.requests.ackFoster : m.requests.ackAdopt}
            </Checkbox>
          </Card>
        )}

        <div className={s.actions}>
          <ButtonLink href={`/helpers/${h.id}`} variant="ghost" icon="arrowLeft">{m.requests.backToHelper}</ButtonLink>
          <Button type="submit" variant="primary" icon="send" disabled={sending || !!blocked} aria-busy={sending}>{sending ? m.common.sending : m.requests.submit}</Button>
        </div>
      </form>

      {finding ? (
        <RecommendPopup
          request={popup}
          onClose={() => setPopup(null)}
          species={species ?? 'cat'}
          urgency={urgency}
          searchPoint={finding.searchPoint}
          run={run.run}
          finding={finding.findingIndex}
        />
      ) : null}
    </div>
  );
}
