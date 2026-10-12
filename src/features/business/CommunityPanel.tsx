'use client';
import { useId, useState, type ChangeEvent } from 'react';
import type { HelperProfile, MediaRef } from '@/lib/types';
import { useI18n } from '@/i18n/provider';
import { useStore, updateValue, newId } from '@/lib/store';
import { useNow } from '@/lib/useNow';
import { deliveredOrders } from '@/lib/business';
import { useRun } from '@/features/demo/RequireRun';
import { useToast } from '@/components/providers/Toast';
import { PetImage } from '@/components/PetImage';
import { Badge, Skeleton, Notice } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Field, Select, TextArea } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { useDonationOrders } from './hooks';
import s from './business.module.css';

async function readSmallImage(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const ratio = Math.min(1, 960 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas unavailable');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.75);
  } finally { URL.revokeObjectURL(url); }
}

export function CommunityPanel({ helper }: { helper: HelperProfile }) {
  const run = useRun();
  if (helper.isRealOrganization || helper.isPlaceholder) return null;
  return <Community key={`${helper.id}-${run?.run ?? 'guest'}`} helper={helper} />;
}
function Community({ helper }: { helper: HelperProfile }) {
  const { m, f, num, dateTime } = useI18n();
  const run = useRun();
  const id = useId();
  const state = useStore('businessState');
  const handoffs = useStore('handoffs');
  const orders = useDonationOrders();
  const now = useNow(orders.some((o) => o.status === 'active' && o.helperId === helper.id));
  const arrived = deliveredOrders(orders, helper.id, new Date(now || 0));
  const mine = arrived.filter((o) => o.runNumber === run?.run);
  const eligible = mine.length > 0 || handoffs.some((h) => h.helperId === helper.id && h.runNumber === run?.run);
  const reviews = state.reviews.filter((r) => r.helperId === helper.id);
  const existing = reviews.find((r) => r.runNumber === run?.run);
  const [rating, setRating] = useState(existing?.rating ?? 5);
  const [comment, setComment] = useState(existing?.comment ?? '');
  const [orderId, setOrderId] = useState('');
  const [image, setImage] = useState<MediaRef | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  const receipts = state.receipts.filter((r) => r.helperId === helper.id && arrived.some((o) => o.id === r.orderId));
  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setImage(null); setError('');
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) { setError(m.business.imageError); return; }
    setBusy(true);
    try { setImage({ src: await readSmallImage(file), alt: m.business.receiptImageAlt }); }
    catch { setError(m.business.imageError); }
    finally { setBusy(false); }
  };
  const saveReceipt = () => {
    const selected = orderId || mine[0]?.id;
    if (!run || !image || !mine.some((o) => o.id === selected) || note.trim().length < 3 || busy) return;
    const result = updateValue('businessState', (prev) => ({ ...prev, receipts: [...prev.receipts.filter((r) => !(r.orderId === selected && r.runNumber === run.run)),
      { id: newId('receipt'), runNumber: run.run, helperId: helper.id, orderId: selected, image, note: note.trim().slice(0, 300), createdAt: new Date().toISOString(), isDemo: true }] }));
    toast(result === 'quota' ? m.business.failed : m.business.saved);
    if (result !== 'quota') { setNote(''); setImage(null); }
  };
  const saveReview = () => {
    if (!run || !eligible || rating < 1 || rating > 5 || comment.trim().length < 5) return;
    const result = updateValue('businessState', (prev) => ({ ...prev, reviews: [...prev.reviews.filter((r) => !(r.helperId === helper.id && r.runNumber === run.run)),
      { id: existing?.id ?? newId('review'), runNumber: run.run, helperId: helper.id, rating, comment: comment.trim().slice(0, 500), createdAt: new Date().toISOString(), isDemo: true }] }));
    toast(result === 'quota' ? m.business.failed : m.business.saved);
  };
  return <div className={s.page}>
    <section className={s.panel} data-tour="transparency-board"><div className={s.head}><h2>{m.business.detailGallery}</h2><Badge tone="butter">{m.business.demo}</Badge></div><p className={s.lead}>{m.business.receiptIntro}</p>
      {receipts.length ? <div className={s.grid}>{receipts.map((r) => <figure key={r.id} className={s.receipt}><PetImage media={r.image} /><figcaption><strong>{r.note}</strong><p className={s.muted}>{f(m.business.receivedOn, { id: r.orderId })} · {dateTime(r.createdAt)}</p></figcaption></figure>)}</div> : <p className={s.muted}>{m.business.noReceipts}</p>}
      <h3>{m.business.receiptUpload}</h3>
      {mine.length ? <div className={s.form}><Field id={`${id}-order`} label={m.business.receiptSelect}><Select id={`${id}-order`} value={orderId || mine[0].id} onChange={(e) => setOrderId(e.target.value)}>{mine.map((o) => <option key={o.id} value={o.id}>{o.id}</option>)}</Select></Field>
        <Field id={`${id}-image`} label={m.business.receiptImage}><input className={s.file} id={`${id}-image`} type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} disabled={busy} /></Field>
        {busy ? <div aria-busy="true"><Skeleton height={150} /></div> : image ? <PetImage media={image} ratio="16 / 9" /> : null}
        <Field id={`${id}-note`} label={m.business.receiptNote}><TextArea id={`${id}-note`} value={note} onChange={(e) => setNote(e.target.value)} minLength={3} maxLength={300} /></Field>
        <Button variant="primary" disabled={!image || note.trim().length < 3 || busy} onClick={saveReceipt}>{m.business.receiptSubmit}</Button>
      </div> : <Notice>{m.business.receiptNeed}</Notice>}
      {error ? <Notice tone="error" role="alert">{error}</Notice> : null}
    </section>
    <section className={s.panel} data-tour="community-reviews"><div className={s.head}><h2>{m.business.reviews}</h2>{reviews.length ? <Badge tone="gold" icon="star">{f(m.business.average, { score: num(reviews.reduce((n, r) => n + r.rating, 0) / reviews.length, 1), n: reviews.length })}</Badge> : null}</div><p className={s.lead}>{m.business.reviewNote}</p>
      {eligible ? <div className={s.form}><div className={s.stars} role="radiogroup" aria-label={m.business.reviews}>{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={f(m.business.rating, { n })} className={s.star} data-filled={rating >= n ? 'true' : undefined} onClick={() => setRating(n)}><Icon name="star" size={24} /></button>)}</div><Field id={`${id}-review`} label={m.business.reviewText}><TextArea id={`${id}-review`} value={comment} onChange={(e) => setComment(e.target.value)} minLength={5} maxLength={500} /></Field><Button variant="primary" disabled={comment.trim().length < 5} onClick={saveReview}>{m.business.reviewSubmit}</Button></div> : <Notice>{m.business.reviewNeed}</Notice>}
      <ul className={s.list}>{reviews.map((r) => <li key={r.id} className={s.row}><div><strong>{f(m.business.reviewer, { run: String(r.runNumber).padStart(3, '0') })} · {f(m.business.rating, { n: r.rating })}</strong><p className={s.reviewText}>{r.comment}</p><small className={s.muted}>{dateTime(r.createdAt)}</small></div></li>)}</ul>{!reviews.length ? <p className={s.muted}>{m.business.noReviews}</p> : null}
    </section>
    <ButtonLink href={`/agreements/adoption?helper=${helper.id}`} icon="doc">{m.business.agreement}</ButtonLink>
  </div>;
}
