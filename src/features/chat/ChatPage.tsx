'use client';

import Link from 'next/link';
import { useCallback, useId, useLayoutEffect, useRef, useState } from 'react';
import type { ChatMessage, Conversation, FallbackReason, ProviderId } from '@/lib/types';
import { useI18n } from '@/i18n/provider';
import { getHelper, getOwner } from '@/data';
import { newId, useHydrated, useStore } from '@/lib/store';
import { playSfx } from '@/lib/audio/sfx';
import { useNow } from '@/lib/useNow';
import { AnimatePresence, m as motionEl, useReducedMotion } from '@/lib/motion';
import { DISTANCE, T } from '@/lib/motion-tokens';
import { useAnnounce } from '@/components/providers/Announcer';
import { Avatar } from '@/components/PetImage';
import { Badge, Notice, Skeleton } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Icon } from '@/components/ui/Icon';
import { useCurrentFinding } from '@/features/demo/RequireRun';
import { useAllListings } from '@/features/shared/data-hooks';
import { helperName } from '@/features/helpers/helper-text';
import { listingTitle } from '@/features/listings/listing-text';
import { deadlineIn, sendChat, type ChatReply } from './chat-client';
import { historyFor, patchConversation, patchMessage, userListingPayload } from './conversation';
import { HandoffSheet } from './HandoffSheet';
import { HandoffCard } from './HandoffCard';
import s from './chat.module.css';

const MAX = 500;
const PROVIDER_LABEL: Record<ProviderId, string> = { gemini: 'Gemini', groq: 'Groq', openrouter: 'OpenRouter' };
type QuickKey = keyof ReturnType<typeof useI18n>['m']['chat']['quick'];

export function ChatPage({ id }: { id: string }) {
  const hydrated = useHydrated();
  const conversations = useStore('conversations');
  const { m } = useI18n();
  if (!hydrated) {
    return (
      <div className="cp-container cp-page" aria-busy="true">
        <Skeleton height={56} />
        <div style={{ height: 16 }} />
        <Skeleton height={320} />
      </div>
    );
  }
  const conv = conversations.find((c) => c.id === id);
  if (!conv) {
    return (
      <div className="cp-container cp-page">
        <h1>{m.chat.notFound}</h1>
        <ButtonLink href="/nearby" icon="search">{m.nav.findLocation}</ButtonLink>
      </div>
    );
  }
  return <Chat conv={conv} />;
}

function Chat({ conv }: { conv: Conversation }) {
  const { m, f, locale, time, date } = useI18n();
  const announce = useAnnounce();
  const reduced = useReducedMotion();
  const finding = useCurrentFinding();
  const listings = useAllListings();
  const handoffs = useStore('handoffs');
  const uid = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const atBottom = useRef(true);

  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [typing, setTyping] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<{ reason: FallbackReason; retryAt: number | null } | null>(null);
  const [restart, setRestart] = useState(false);
  const [handoffOpen, setHandoffOpen] = useState(false);

  const owner = conv.persona.kind === 'owner' ? getOwner(conv.persona.id) : undefined;
  const helper = conv.persona.kind !== 'owner' ? getHelper(conv.persona.id) : undefined;
  const name = owner ? owner.displayName : helper ? helperName(helper, locale) : conv.persona.id;
  const isRealOrg = helper?.kind === 'shelter';
  const listing = conv.listingId ? listings.find((l) => l.id === conv.listingId) : undefined;
  const topic = listing ? listingTitle(listing, m, f) : helper && !conv.listingId ? helperName(helper, locale) : m.chat.topicGeneral;
  const lastAssistant = [...conv.messages].reverse().find((x) => x.role === 'assistant');
  const usingAi = lastAssistant?.source === 'ai';
  const hasRound = conv.messages.some((x) => x.role === 'assistant');
  const convHandoffs = handoffs.filter((h) => h.conversationId === conv.id);
  const lastUser = [...conv.messages].reverse().find((x) => x.role === 'user');

  const scrollToEnd = useCallback((smooth = true) => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth && !reduced ? 'smooth' : 'auto' });
    setHasNew(false);
  }, [reduced]);

  // ข้อความใหม่: ถ้าอยู่ท้ายรายการ → เลื่อนลง ถ้ากำลังอ่านข้างบน → ปุ่ม “ข้อความใหม่ ↓”
  const count = conv.messages.length + (typing ? 1 : 0);
  useLayoutEffect(() => {
    if (atBottom.current) scrollToEnd(false);
    else setHasNew(true);
  }, [count, scrollToEnd]);

  // นับถอยหลัง retryAfterSec ของ rate_limited (นาฬิกา subscribe เฉพาะตอนนับ)
  const now = useNow(!!status?.retryAt);
  const retryLeft = status?.retryAt ? Math.max(0, Math.ceil((status.retryAt - now) / 1000)) : 0;

  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
    if (atBottom.current) setHasNew(false);
  };

  const deliver = async (userMsg: ChatMessage, history: { role: 'user' | 'assistant'; text: string }[]): Promise<boolean> => {
    setTyping(true);
    const res = await sendChat({
      conversationId: conv.id,
      persona: conv.persona,
      listingId: conv.listingId ?? null,
      runNumber: conv.runNumber,
      findingIndex: finding?.findingIndex ?? 1,
      searchDistrictId: finding?.origin === 'district_choice' ? finding.districtId : null,
      history,
      message: userMsg.text,
      userListing: userListingPayload(listing),
      handoffCompleted: convHandoffs.length > 0,
      locale,
    });
    setTyping(false);
    if (!res.ok) {
      patchMessage(conv.id, userMsg.id, { status: 'failed' });
      setError(res.error ?? m.chat.errorKeep);
      return false;
    }
    const data: ChatReply = res.data;
    const readAt = new Date().toISOString();
    patchMessage(conv.id, userMsg.id, { status: 'read', readAt });
    playSfx('read');
    const reply: ChatMessage = {
      id: newId('msg'), role: 'assistant', text: data.reply, createdAt: new Date().toISOString(), status: 'read',
      source: data.source, provider: data.provider ?? undefined, model: data.model ?? undefined, fallbackReason: data.fallbackReason ?? undefined,
    };
    patchConversation(conv.id, (c) => ({ ...c, messages: [...c.messages, reply] }));
    playSfx('message');
    announce(`${name}: ${data.reply}`);
    setStatus(data.source === 'fallback' && data.fallbackReason
      ? { reason: data.fallbackReason, retryAt: deadlineIn(data.retryAfterSec) }
      : null);
    return true;
  };

  const send = async (raw: string) => {
    const msg = raw.trim();
    if (!msg || busy) return;
    if (msg.length > MAX) {
      setError(m.chat.tooLong);
      return;
    }
    setError(null);
    setBusy(true);
    const history = historyFor(conv);
    const userMsg: ChatMessage = { id: newId('msg'), role: 'user', text: msg, createdAt: new Date().toISOString(), status: 'sending' };
    patchConversation(conv.id, (c) => ({ ...c, messages: [...c.messages, userMsg] }));
    atBottom.current = true;
    setText('');
    playSfx('tap');
    const ok = await deliver(userMsg, history);
    if (!ok) setText((t) => t || msg);
    setBusy(false);
  };

  const retryFailed = async (msg: ChatMessage) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    patchMessage(conv.id, msg.id, { status: 'sending' });
    await deliver({ ...msg, status: 'sending' }, historyFor(conv, msg.id));
    setBusy(false);
  };

  /** ถามผู้ช่วย AI อีกครั้งด้วยข้อความล่าสุดของผู้ใช้ */
  const retryAi = async () => {
    if (!lastUser || busy) return;
    setBusy(true);
    const idx = conv.messages.findIndex((x) => x.id === lastUser.id);
    const history = historyFor({ ...conv, messages: conv.messages.slice(0, idx) });
    await deliver(lastUser, history);
    setBusy(false);
  };

  const quick: QuickKey[] = ['pickup', 'publicMeet', 'travel'];
  if (conv.persona.kind === 'owner') quick.unshift('markings');
  if (conv.persona.kind === 'shelter') quick.unshift('moreSpace', 'donations');
  if (conv.persona.kind === 'individual') {
    quick.unshift('species', 'pets');
    if (helper?.acceptsSupplyPackages) quick.splice(2, 0, 'supplies');
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (e.key === 'Enter' && !e.shiftKey && !coarse && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void send(text);
    }
  };

  // textarea สูงอัตโนมัติ 1–5 บรรทัด
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 5 * 26 + 20)}px`;
  }, [text]);

  const groups = groupMessages(conv.messages, now);
  const badge = conv.persona.kind === 'owner' || !isRealOrg ? f(m.chat.badgeAi, { name }) : f(m.chat.badgeAiOrg, { name });
  const sourceBadge = !lastAssistant || usingAi ? badge : m.chat.badgeFallback;

  return (
    <div className={s.root}>
      <header className={s.head}>
        <ButtonLink href={helper ? `/helpers/${helper.id}` : listing ? `/listings/${listing.id}` : '/'} variant="ghost" small iconOnly icon="arrowLeft" aria-label={m.chat.back}>{m.chat.back}</ButtonLink>
        <Avatar name={name} media={owner?.photo ?? helper?.images.profile} size={40} aiLabel />
        <div className={s.headText}>
          <h1 className={s.name}>{name}</h1>
          <p className={s.role}>{m.chat.role[conv.persona.kind]} · {f(m.chat.topic, { topic })}</p>
          <p className={s.badgeRow}>
            <Badge tone={usingAi ? 'gold' : 'butter'} icon={usingAi ? 'sparkle' : 'chat'}>{sourceBadge}</Badge>
            {usingAi && lastAssistant?.provider ? <span className={s.via}>{f(m.chat.via, { provider: PROVIDER_LABEL[lastAssistant.provider] })}</span> : null}
            {isRealOrg && helper?.officialUrl ? <a className={s.via} href={helper.officialUrl} target="_blank" rel="noopener noreferrer">{m.chat.officialContact}</a> : null}
          </p>
        </div>
        <Button variant="ghost" small iconOnly icon="refresh" aria-label={m.chat.restart} title={m.chat.restart} onClick={() => setRestart(true)}>{m.chat.restart}</Button>
      </header>
      <p className={s.disclaimer}><Icon name="shield" size="1em" /> {m.chat.disclaimer}</p>

      <div className={s.list} ref={listRef} onScroll={onScroll} role="log" aria-live="off" aria-label={name} data-tour="chat-read">
        {groups.map((g) => (
          <div key={g.key} className={s.group} data-role={g.role}>
            {g.dayLabel ? <p className={s.day}><span>{g.dayLabel === 'today' ? m.common.today : g.dayLabel === 'yesterday' ? m.common.yesterday : date(g.dayLabel)}</span></p> : null}
            {g.items.map((msg, i) => {
              if (msg.role === 'system') {
                if (msg.handoffId) {
                  const h = handoffs.find((x) => x.id === msg.handoffId);
                  return h ? <HandoffCard key={msg.id} handoff={h} /> : null;
                }
                return <p key={msg.id} className={s.system}>{m.chat.started}</p>;
              }
              const mine = msg.role === 'user';
              return (
                <motionEl.div
                  key={msg.id}
                  className={s.row}
                  data-mine={mine ? 'true' : undefined}
                  initial={reduced ? false : { opacity: 0, y: DISTANCE.card / 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={T.quick}
                >
                  {!mine ? (i === 0 ? <span className={s.miniAvatar}><Avatar name={name} media={owner?.photo ?? helper?.images.profile} size={28} /></span> : <span className={s.avatarGap} />) : null}
                  <div className={s.bubble} data-mine={mine ? 'true' : undefined} data-failed={msg.status === 'failed' ? 'true' : undefined}>
                    {msg.text}
                  </div>
                </motionEl.div>
              );
            })}
            {g.role !== 'system' ? <p className={s.time} data-mine={g.role === 'user' ? 'true' : undefined}>{time(g.items[g.items.length - 1].createdAt)}</p> : null}
            {g.role === 'user' && lastUser && g.items.some((x) => x.id === lastUser.id) ? (
              <p className={s.msgStatus} aria-live="polite">
                {lastUser.status === 'sending' ? m.chat.sending
                  : lastUser.status === 'failed' ? <>{m.chat.failed} · <button type="button" className={s.linkBtn} onClick={() => void retryFailed(lastUser)}>{m.chat.retrySend}</button></>
                    : lastUser.readAt ? f(m.chat.read, { time: time(lastUser.readAt) }) : null}
              </p>
            ) : null}
          </div>
        ))}
        <AnimatePresence>
          {typing ? (
            <motionEl.div key="typing" className={s.row} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: T.exit }} transition={T.quick}>
              <span className={s.miniAvatar}><Avatar name={name} media={owner?.photo ?? helper?.images.profile} size={28} /></span>
              <div className={`${s.bubble} ${s.typing}`} aria-label={m.chat.typing} role="status">
                {reduced ? <span>{m.chat.typing}</span> : <><i /><i /><i /></>}
              </div>
            </motionEl.div>
          ) : null}
        </AnimatePresence>
      </div>

      {hasNew ? (
        <button type="button" className={s.newBtn} onClick={() => scrollToEnd()}>
          {m.chat.newMessages} <Icon name="arrowDown" size="1em" />
        </button>
      ) : null}

      <div className={s.bottom}>
        {status ? (
          <div className={s.statusBar} role="status">
            <span>{f(m.chat.fallback[status.reason], { sec: retryLeft })}</span>
            {status.reason !== 'ai_disabled' && status.reason !== 'demo_only' && status.reason !== 'misconfigured' && status.reason !== 'model_not_allowed' ? (
              <Button small variant="ghost" icon="refresh" onClick={() => void retryAi()} disabled={busy || retryLeft > 0}>{m.chat.retryAi}</Button>
            ) : null}
          </div>
        ) : null}
        {error ? <Notice tone="error" icon="alert" role="alert" className={s.error}>{error}</Notice> : null}
        <div className={s.quick} role="group" aria-label={m.chat.quickLabel} data-tour="chat-quick">
          {quick.map((k) => (
            <button key={k} type="button" className={s.chip} disabled={busy} onClick={() => void send(m.chat.quick[k])}>{m.chat.quick[k]}</button>
          ))}
        </div>
        {conv.persona.kind !== 'owner' ? (
          <div className={s.handoffRow} data-tour="chat-handoff">
            <Button small variant="soft" icon="heartArrow" onClick={() => setHandoffOpen(true)} disabled={!hasRound} aria-describedby={!hasRound ? `${uid}-ht` : undefined}>{m.chat.handoffBtn}</Button>
            {!hasRound ? <span id={`${uid}-ht`} className={s.hint}>{m.chat.handoffNeedTurn}</span> : null}
          </div>
        ) : null}
        <form className={s.composer} onSubmit={(e) => { e.preventDefault(); void send(text); }}>
          <label htmlFor={`${uid}-in`} className="visually-hidden">{f(m.chat.inputLabel, { name })}</label>
          <textarea
            id={`${uid}-in`}
            ref={inputRef}
            className={s.input}
            rows={1}
            value={text}
            maxLength={MAX + 50}
            placeholder={m.chat.placeholder}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            aria-describedby={`${uid}-cnt`}
            aria-invalid={text.length > MAX}
          />
          <span id={`${uid}-cnt`} className={s.counter} data-over={text.length > MAX ? 'true' : undefined}>{text.length}/{MAX}</span>
          <button type="submit" className={s.sendBtn} aria-label={m.chat.send} disabled={busy || !text.trim() || text.length > MAX}>
            <Icon name="send" />
          </button>
        </form>
      </div>

      <Dialog
        open={restart}
        onClose={() => setRestart(false)}
        title={m.chat.restart}
        size="sm"
        footer={(
          <>
            <Button onClick={() => setRestart(false)} data-autofocus>{m.common.cancel}</Button>
            <Button variant="danger" icon="trash" onClick={() => {
              patchConversation(conv.id, (c) => ({ ...c, messages: c.messages.filter((x) => x.role === 'system' && (x.text === 'started' || x.handoffId)) }));
              setStatus(null);
              setRestart(false);
            }}>{m.chat.restartDo}</Button>
          </>
        )}
      >
        <p>{m.chat.restartConfirm}</p>
      </Dialog>
      {helper ? <HandoffSheet open={handoffOpen} onClose={() => setHandoffOpen(false)} conv={conv} helper={helper} topicListing={listing} /> : null}
    </div>
  );
}

interface Group { key: string; role: ChatMessage['role']; items: ChatMessage[]; dayLabel: string | null }

/** รวมกลุ่มข้อความติดกันของผู้ส่งเดียวกัน + ตัวคั่นวัน */
function groupMessages(msgs: ChatMessage[], now: number): Group[] {
  const out: Group[] = [];
  let lastDay = '';
  const today = new Date(now).toDateString();
  const yesterday = new Date(now - 86_400_000).toDateString();
  for (const msg of msgs) {
    const d = new Date(msg.createdAt);
    const day = d.toDateString();
    const dayLabel = day !== lastDay ? (day === today ? 'today' : day === yesterday ? 'yesterday' : msg.createdAt) : null;
    lastDay = day;
    const prev = out[out.length - 1];
    if (prev && !dayLabel && prev.role === msg.role && msg.role !== 'system') prev.items.push(msg);
    else out.push({ key: msg.id, role: msg.role, items: [msg], dayLabel });
  }
  return out;
}

export function ChatLinkList({ items }: { items: Conversation[] }) {
  const { m, locale, dateTime } = useI18n();
  return (
    <ul className={s.convList}>
      {items.map((c) => {
        const h = c.persona.kind !== 'owner' ? getHelper(c.persona.id) : undefined;
        const o = c.persona.kind === 'owner' ? getOwner(c.persona.id) : undefined;
        const name = o ? o.displayName : h ? helperName(h, locale) : c.persona.id;
        const last = [...c.messages].reverse().find((x) => x.role !== 'system');
        return (
          <li key={c.id}>
            <Link href={`/chat/${c.id}`} className={s.convItem}>
              <Avatar name={name} media={o?.photo ?? h?.images.profile} size={36} />
              <span className={s.convText}>
                <strong>{name}</strong>
                <span>{last ? last.text.slice(0, 60) : m.chat.started}</span>
              </span>
              <span className={s.convTime}>{dateTime(c.updatedAt)}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
