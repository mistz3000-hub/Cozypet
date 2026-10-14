'use client';

import Link from 'next/link';
import { useId, useMemo, useState } from 'react';
import type { Conversation, Handoff, HelperProfile, PetListing, Species } from '@/lib/types';
import { useI18n } from '@/i18n/provider';
import { getDistrict } from '@/data/districts';
import { availableSlots } from '@/lib/capacity';
import { alternativesFor } from '@/lib/chat-context';
import { handoffBlock, handoffModeFor, handoffNeedsWaitConfirm } from '@/lib/handoff';
import { getValue, newId, updateValue, useStore } from '@/lib/store';
import { playSfx } from '@/lib/audio/sfx';
import { getHelper } from '@/data';
import { useAnnounce } from '@/components/providers/Announcer';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Checkbox, Field, RadioGroup, TextInput } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { useCurrentFinding } from '@/features/demo/RequireRun';
import { useAllListings } from '@/features/shared/data-hooks';
import { helperName } from '@/features/helpers/helper-text';
import { listingTitle, speciesLabel } from '@/features/listings/listing-text';
import { patchConversation } from './conversation';
import s from './chat.module.css';

/** sheet “ยืนยันส่งต่อน้อง (จำลอง)” — เงื่อนไขมาจาก record (PROMPT.md 7.6) ไม่ใช่ AI ตัดสิน */
export function HandoffSheet({ open, onClose, conv, helper, topicListing }: {
  open: boolean;
  onClose: () => void;
  conv: Conversation;
  helper: HelperProfile;
  topicListing?: PetListing;
}) {
  const { m, f, locale, district } = useI18n();
  const announce = useAnnounce();
  const finding = useCurrentFinding();
  const all = useAllListings();
  const handoffs = useStore('handoffs');
  const id = useId();

  const myFound = useMemo(() => all.filter((l) => l.source === 'user' && l.type === 'found' && l.status === 'open' && l.runNumber === conv.runNumber), [all, conv.runNumber]);
  const options: PetListing[] = topicListing && topicListing.status === 'open' && !myFound.some((l) => l.id === topicListing.id) ? [topicListing, ...myFound] : myFound;
  const [choice, setChoice] = useState<string>(options[0]?.id ?? 'short');
  const [shortName, setShortName] = useState('');
  const [shortSpecies, setShortSpecies] = useState<Species>(helper.speciesAccepted[0] ?? 'cat');
  const [waitOk, setWaitOk] = useState(false);
  const [tried, setTried] = useState(false);

  const chosen = options.find((l) => l.id === choice);
  const species: Species = chosen ? chosen.species : shortSpecies;
  const petName = chosen ? listingTitle(chosen, m, f) : shortName.trim();
  const mode = handoffModeFor(helper);
  const needWait = handoffNeedsWaitConfirm(helper);
  const block = handoffBlock(helper, species);
  const slots = availableSlots(helper);
  const already = handoffs.some((h) => h.runNumber === conv.runNumber && (chosen ? h.listingId === chosen.id : h.conversationId === conv.id && h.petName === petName && h.species === species));
  const name = helperName(helper, locale);
  const alternatives = block && finding ? alternativesFor(helper.id, species, finding.searchPoint) : [];
  const canConfirm = !block && !already && (!!chosen || !!shortName.trim()) && (!needWait || waitOk);

  const confirm = () => {
    setTried(true);
    if (!canConfirm) return;
    // ตรวจซ้ำจาก record ตอนกดยืนยัน
    if (handoffBlock(helper, species)) return;
    const ts = new Date().toISOString();
    const h: Handoff = {
      id: newId('handoff'), runNumber: conv.runNumber, conversationId: conv.id, helperId: helper.id,
      listingId: chosen?.id, petName, species, mode, createdAt: ts, isDemo: true,
    };
    updateValue('handoffs', (prev) => [h, ...prev]);
    if (chosen?.source === 'user') {
      updateValue('userListings', (prev) => prev.map((l) => (l.id === chosen.id ? { ...l, status: 'closed', closedReason: mode === 'adopt' ? 'adopted' : 'in_care', updatedAt: ts } : l)));
    }
    const pending = getValue('careRequests').filter((r) => r.status === 'pending_contact' && r.runNumber === conv.runNumber && r.helperId === helper.id && (!r.listingId || !chosen || r.listingId === chosen.id));
    if (pending.length) {
      const ids = new Set(pending.map((r) => r.id));
      updateValue('careRequests', (prev) => prev.map((r) => (ids.has(r.id) ? { ...r, status: 'completed_demo', updatedAt: ts } : r)));
    }
    patchConversation(conv.id, (c) => ({ ...c, messages: [...c.messages, { id: newId('msg'), role: 'system', text: 'handoff', createdAt: ts, status: 'read', handoffId: h.id }] }));
    playSfx('jingle');
    announce(m.chat.handoffDone);
    onClose();
  };

  const check = (ok: boolean, okText: string, failText: string) => (
    <li data-ok={ok ? 'true' : 'false'}>
      <Icon name={ok ? 'check' : 'x'} size="1em" /> {ok ? okText : failText}
    </li>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={m.chat.handoffTitle}
      variant="sheet"
      size="md"
      footer={(
        <>
          <Button onClick={onClose}>{m.common.cancel}</Button>
          <Button variant="primary" icon="heart" onClick={confirm} disabled={!!block || already} data-film="handoff-confirm">{m.chat.handoffConfirm}</Button>
        </>
      )}
    >
      <div className={s.sheet}>
        <RadioGroup<string>
          name={`${id}-pet`}
          legend={m.chat.handoffPet}
          layout="column"
          value={choice}
          onChange={setChoice}
          options={[
            ...options.map((l) => ({ value: l.id, label: f(m.chat.handoffTopic, { name: listingTitle(l, m, f) }), description: `${speciesLabel(l, m)} · ${district(l.districtId)}` })),
            { value: 'short', label: m.chat.handoffShort },
          ]}
        />
        {!chosen ? (
          <div className={s.shortRow}>
            <Field id={`${id}-n`} label={m.chat.handoffShortName} required error={tried && !shortName.trim() ? m.chat.handoffNeedName : null}>
              <TextInput id={`${id}-n`} value={shortName} maxLength={40} onChange={(e) => setShortName(e.target.value)} />
            </Field>
            <RadioGroup<Species>
              name={`${id}-sp`}
              legend={m.chat.handoffShortSpecies}
              value={shortSpecies}
              onChange={setShortSpecies}
              options={(['cat', 'dog', 'other'] as Species[]).map((x) => ({ value: x, label: m.species[x] }))}
            />
          </div>
        ) : null}
        <p className={s.sheetLine}><strong>{m.chat.handoffMode}:</strong> {m.chat.modeLabel[mode]}</p>
        {needWait ? <Checkbox checked={waitOk} onChange={setWaitOk} required error={tried && !waitOk ? m.requests.ackRequired : null}>{m.chat.handoffWaitConfirm}</Checkbox> : null}
        <div>
          <p className={s.sheetLine}><strong>{m.chat.handoffChecks}</strong></p>
          <ul className={s.checks}>
            {check(slots > 0, f(m.chat.checkSlots, { n: slots }), m.chat.checkSlotsFail)}
            {check(helper.speciesAccepted.includes(species), f(m.chat.checkSpecies, { species: m.species[species] }), f(m.chat.checkSpeciesFail, { species: m.species[species] }))}
            {check(helper.availability !== 'unavailable', m.chat.checkAvail, m.chat.checkAvailFail)}
          </ul>
        </div>
        {already ? <p className={s.blockText} role="alert">{m.chat.handoffAlready}</p> : null}
        {block ? (
          <div className={s.alts}>
            <p className={s.sheetLine}><strong>{m.helper.otherPlaces}</strong></p>
            {alternatives.length ? (
              <ul>
                {alternatives.map((r) => {
                  const h = getHelper(r.id)!;
                  return (
                    <li key={r.id}>
                      <Link href={`/helpers/${h.id}`}>{helperName(h, locale)}</Link> · {getDistrict(h.districtId) ? district(h.districtId) : ''} · {f(m.common.aboutKm, { km: r.distanceKm ?? 0 })}
                    </li>
                  );
                })}
              </ul>
            ) : <p>{m.helper.noOtherPlaces}</p>}
          </div>
        ) : null}
        {helper.kind === 'shelter' ? <p className={s.hint}>{f(m.helper.demoOf, { name })}</p> : <p className={s.hint}>{m.status.demoNote}</p>}
      </div>
    </Dialog>
  );
}
