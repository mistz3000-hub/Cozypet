'use client';

import { useEffect, useRef, useState } from 'react';
import type { DonationOrder } from '@/lib/types';
import { useI18n } from '@/i18n/provider';
import { getHelper } from '@/data';
import { getPackage } from '@/data/packages';
import { ORDER_ARRIVED_STEP, ORDER_STEPS } from '@/lib/balancer-config';
import { canCancelOrder, orderStepIndex, orderStepTime, orderTotalTHB } from '@/lib/orders';
import { supplyLevel } from '@/lib/status';
import { updateValue, useHydrated, useDemoSession } from '@/lib/store';
import { useNow } from '@/lib/useNow';
import { playSfx } from '@/lib/audio/sfx';
import { useToast } from '@/components/providers/Toast';
import { Badge, Card, Notice, Skeleton } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Icon } from '@/components/ui/Icon';
import { Meter } from '@/components/ui/Meter';
import { SupplyBadge } from '@/components/ui/StatusBadge';
import { helperName } from '@/features/helpers/helper-text';
import { useHelperSupplies } from '@/features/helpers/supplies';
import { DemoModeBar } from '@/features/shared/DemoModeBar';
import s from './donate.module.css';
import { MoneyFlow } from '@/features/business/BusinessWidgets';
import { useDonationOrders } from '@/features/business/hooks';
import { CareEnvelope } from './CareEnvelope';

export function OrderPage({ id }: { id: string }) {
  const hydrated = useHydrated();
  const orders = useDonationOrders();
  const { m } = useI18n();
  if (!hydrated) return <div className="cp-container cp-page" aria-busy="true"><Skeleton height={280} /></div>;
  const order = orders.find((o) => o.id === id);
  if (!order) {
    return (
      <div className="cp-container cp-page">
        <h1>{m.orders.notFound}</h1>
        <ButtonLink href="/donate" icon="box">{m.donate.title}</ButtonLink>
      </div>
    );
  }
  return <Order order={order} />;
}

/** timeline 5 ขั้น เวลาคำนวณจาก createdAt (ไม่เก็บ) — PROMPT.md 7.12 */
function Order({ order }: { order: DonationOrder }) {
  const { m, f, loc, money, time, locale } = useI18n();
  const [session] = useDemoSession();
  const toast = useToast();
  const helper = getHelper(order.helperId);
  const pkg = getPackage(order.packageId);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const live = order.status === 'active' && !order.fastForwarded && (!order.settlementStage || order.settlementStage === 'partner_paid');
  const now = useNow(live);
  const step = orderStepIndex(order, new Date(now || Date.parse(order.createdAt)));
  const sup = useHelperSupplies(order.helperId, true);
  const name = helper ? helperName(helper, locale) : order.recipientSnapshot?.name??order.helperId;
  const pkgName = pkg ? loc(pkg.name) : order.packageId;
  const done = step >= ORDER_STEPS - 1;

  // toast แต้มน้ำใจเมื่อถึงขั้นสุดท้ายระหว่างเปิดหน้านี้
  const prev = useRef(step);
  useEffect(() => {
    if (prev.current < ORDER_STEPS - 1 && step >= ORDER_STEPS - 1 && order.status === 'active') {
      toast(f(m.kindness.earned, { n: Math.floor(orderTotalTHB(order) / 10) }));
      playSfx('chime');
    }
    prev.current = step;
  }, [step, order, toast, f, m.kindness.earned]);

  const cancel = () => {
    const result = updateValue('donationOrders', (list) => list.map((o) => (o.id === order.id ? { ...o, status: 'cancelled' } : o)));
    if (result === 'quota') { toast(m.business.failed); return; }
    setConfirmCancel(false);
    toast(m.orders.cancelled);
  };
  const fastForward = () => {
    const result = order.sponsorshipBookingId
      ? updateValue('businessState', (s) => ({ ...s, bookings: s.bookings.map((b) => b.id === order.sponsorshipBookingId && b.aidOrder ? { ...b, aidOrder: { ...b.aidOrder, fastForwarded: true } } : b) }))
      : updateValue('donationOrders', (list) => list.map((o) => (o.id === order.id ? { ...o, fastForwarded: true } : o)));
    if (result === 'quota') toast(m.business.failed);
  };
  const advanceMoney = () => {
    const result = updateValue('donationOrders', (list) => list.map((o) => {
      if (o.id !== order.id || o.status !== 'active' || o.settlementStage !== order.settlementStage) return o;
      if (o.settlementStage === 'received') return { ...o, settlementStage: 'commissioned' };
      if (o.settlementStage === 'commissioned') return { ...o, settlementStage: 'partner_paid', fulfillmentStartedAt: new Date().toISOString() };
      return o;
    }));
    if (result === 'quota') toast(m.business.failed);
  };

  return (
    <div className={`cp-container cp-page ${s.page}`}>
      <DemoModeBar next={`/donate/orders/${order.id}`} />
      <p className={s.bar}><Icon name="info" size="1em" /> {m.donate.bar}</p>
      <h1>{m.orders.title}</h1>
      <p className={s.orderSummary}>{f(m.orders.summary, { pkg: pkgName, qty: order.quantity, helper: name })} · {f(m.donate.totalSim, { money: money(orderTotalTHB(order)) })}</p>
      <MoneyFlow order={order} onAdvance={advanceMoney} />

      {order.status === 'cancelled' ? <Notice tone="info" icon="x">{m.orders.cancelledTitle}</Notice> : (
        <>
          <ol className={s.timeline} aria-live="polite">
            {m.orders.steps.map((label, i) => (
              <li key={label} data-done={i <= step ? 'true' : undefined} data-current={i === step ? 'true' : undefined}>
                <span className={s.dot} aria-hidden="true">{i <= step ? <Icon name="check" size={14} /> : null}</span>
                <span className={s.tlText}>
                  <strong>{label}</strong>
                  <span className={s.muted}>{i <= step ? f(m.orders.stepAt, { time: time(orderStepTime(order, i).toISOString()) }) : m.orders.stepPending}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className={s.nav}>
            {!done && order.source !== 'micro' ? <Button icon="bolt" disabled={!!order.settlementStage && order.settlementStage !== 'partner_paid'} onClick={fastForward}>{m.orders.fastForward}</Button> : null}
            {canCancelOrder(order, new Date(now || Date.parse(order.createdAt))) ? <Button variant="ghost" icon="x" onClick={() => setConfirmCancel(true)}>{m.orders.cancel}</Button> : null}
          </div>

          {step >= ORDER_ARRIVED_STEP ? (
            <Card flat className={s.arrived}>
              <CareEnvelope mascot={session.mascot} label={m.orders.arrivedArt} brand={m.common.brand} />
              {sup ? (
                <div className={s.afterSup}>
                  <p className={s.h3}>{m.donate.afterSupplies}</p>
                  <p className={s.supply}>
                    <SupplyBadge level={supplyLevel(sup.foodDays, sup.litterDays)} />
                    <span>{f(m.supply.food, { days: sup.foodDays })}{sup.litterDays !== undefined ? ` · ${f(m.supply.litter, { days: sup.litterDays })}` : ''} {m.supply.demo}</span>
                  </p>
                  <Meter value={Math.min(sup.foodDays, 30)} max={30} label={m.supply.title} level="gold" valueText={f(m.supply.food, { days: sup.foodDays })} />
                </div>
              ) : null}
            </Card>
          ) : null}

          {done ? (
            <Card flat className={s.thanks}>
              <p className={s.h3}>{m.orders.thanksTitle} <Badge tone="butter">{m.orders.thanksTag}</Badge></p>
              <p>{f(m.orders.thanks, { pkg: pkgName, p: helper?.persona.politeParticle ?? 'ค่ะ' })}</p>
              <p className={s.muted}>— {name}</p>
            </Card>
          ) : null}
        </>
      )}
      <div className={s.nav}>
        <ButtonLink href="/donate" icon="box">{m.orders.newOrder}</ButtonLink>
        {helper||order.recipientSnapshot ? <ButtonLink href={order.recipientSnapshot?`/shelters/${order.recipientSnapshot.placeId}`:`/helpers/${helper!.id}`} variant="ghost" icon="user">{m.chat.viewHelper}</ButtonLink> : null}
      </div>

      <Dialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title={m.orders.cancel}
        size="sm"
        footer={(
          <>
            <Button onClick={() => setConfirmCancel(false)} data-autofocus>{m.common.cancel}</Button>
            <Button variant="danger" icon="x" onClick={cancel}>{m.orders.cancel}</Button>
          </>
        )}
      >
        <p>{m.orders.cancelConfirm}</p>
      </Dialog>
    </div>
  );
}
