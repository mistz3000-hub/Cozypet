'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useId, useMemo, useState } from 'react';
import type { DonationOrder, Species } from '@/lib/types';
import { useI18n } from '@/i18n/provider';
import { HELPERS, getHelper } from '@/data';
import { BRANDS } from '@/data/brands';
import { PACKAGES, getPackage } from '@/data/packages';
import { SUPPLIES } from '@/data/supplies';
import { donationTargetDetail, rankDonationTargets } from '@/lib/balancer';
import { orderTotalTHB } from '@/lib/orders';
import { statusInfo, supplyLevel } from '@/lib/status';
import { newId, updateValue, useStore } from '@/lib/store';
import { useNow } from '@/lib/useNow';
import { playSfx } from '@/lib/audio/sfx';
import { useToast } from '@/components/providers/Toast';
import { Avatar } from '@/components/PetImage';
import { Badge, Card, Notice } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Checkbox, Field, Segmented, Select } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { StatusBadge, SupplyBadge } from '@/components/ui/StatusBadge';
import { useRun } from '@/features/demo/RequireRun';
import { reasonText } from '@/features/balancer/reason-text';
import { WhyPanel } from '@/features/balancer/WhyPanel';
import { PACKAGE_MAP } from '@/features/helpers/supplies';
import { helperName } from '@/features/helpers/helper-text';
import { DemoModeBar } from '@/features/shared/DemoModeBar';
import s from './donate.module.css';

const SUPPLY_MAP = new Map(SUPPLIES.map((x) => [x.helperId, x]));
type SpeciesFilter = 'all' | Species;

/** ส่งแพ็กเกจของใช้ (จำลอง) — PROMPT.md 7.12 · ไม่มีช่องชำระเงิน ไม่มี QR ไม่มีเลขบัญชี */
export function DonatePage() {
  const { m, f, money, loc, district, locale } = useI18n();
  const params = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const run = useRun()!;
  const orders = useStore('donationOrders');
  const now = useNow(orders.some((o) => o.status === 'active'));
  const id = useId();

  const paramHelper = getHelper(params.get('helper'));
  const paramSpecies = params.get('species');
  const [species, setSpecies] = useState<SpeciesFilter>(paramSpecies === 'cat' || paramSpecies === 'dog' || paramSpecies === 'other' ? paramSpecies : 'all');
  const eligibleParam = paramHelper && paramHelper.kind === 'individual' && paramHelper.acceptsSupplyPackages ? paramHelper.id : null;
  const [helperId, setHelperId] = useState<string | null>(eligibleParam);
  const paramPkg = getPackage(params.get('package') ?? '');
  const [packageId, setPackageId] = useState<string | null>(paramPkg?.id ?? null);
  const [qty, setQty] = useState(1);
  const [step, setStep] = useState<1 | 2 | 3>(eligibleParam ? 2 : 1);
  const [ack, setAck] = useState(false);
  const [tried, setTried] = useState(false);
  const [whyId, setWhyId] = useState<string | null>(null);

  const ranking = useMemo(() => rankDonationTargets({
    helpers: HELPERS, supplies: SUPPLY_MAP, orders, packages: PACKAGE_MAP, now: new Date(now || 0), species: species === 'all' ? null : species,
  }), [orders, now, species]);

  const helper = helperId ? getHelper(helperId) : undefined;
  const pkgs = helper ? PACKAGES.filter((p) => p.species.some((x) => helper.speciesAccepted.includes(x))) : [];
  const pkg = packageId ? getPackage(packageId) : undefined;
  const brand = pkg ? BRANDS.find((b) => b.id === pkg.brandId) : undefined;
  const rank = helperId ? ranking.items.findIndex((r) => r.id === helperId) : -1;
  const whyRec = whyId ? ranking.items.find((r) => r.id === whyId) : undefined;
  const mine = [...orders].filter((o) => o.runNumber === run.run).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const confirm = () => {
    setTried(true);
    if (!ack || !helper || !pkg) return;
    // ตรวจซ้ำ: สถานสงเคราะห์จริงไม่เป็นปลายทางเด็ดขาด
    if (helper.kind !== 'individual' || !helper.acceptsSupplyPackages) return;
    const order: DonationOrder = {
      id: newId('order'), runNumber: run.run, helperId: helper.id, packageId: pkg.id, quantity: qty, unitPriceTHB: pkg.priceTHB,
      recommendedRank: rank >= 0 ? rank + 1 : undefined, status: 'active', createdAt: new Date().toISOString(), isDemo: true,
    };
    updateValue('donationOrders', (prev) => [order, ...prev]);
    playSfx('box');
    toast(m.donate.created);
    router.push(`/donate/orders/${order.id}`);
  };

  return (
    <div className={`cp-container cp-page ${s.page}`}>
      <DemoModeBar next="/donate" />
      <p className={s.bar} data-tour="donate-notice"><Icon name="info" size="1em" /> {m.donate.bar}</p>
      <h1>{m.donate.title}</h1>
      {paramHelper && paramHelper.kind === 'shelter' ? (
        <Notice tone="butter" icon="info">
          {f(m.donate.realShelter, { name: helperName(paramHelper, locale) })}
          {paramHelper.officialUrl ? <> · <a href={paramHelper.officialUrl} target="_blank" rel="noopener noreferrer">{m.helper.officialLink}</a></> : null}
        </Notice>
      ) : null}
      {paramHelper && paramHelper.kind === 'individual' && !paramHelper.acceptsSupplyPackages ? <Notice tone="butter" icon="info">{m.donate.notEligible}</Notice> : null}

      <ol className={s.steps} aria-label={m.donate.title}>
        {m.donate.steps.map((name, i) => (
          <li key={name} data-active={step === i + 1 ? 'true' : undefined} data-done={step > i + 1 ? 'true' : undefined} aria-current={step === i + 1 ? 'step' : undefined}>
            <span className={s.stepNum}>{step > i + 1 ? <Icon name="check" size={14} /> : i + 1}</span> {name}
          </li>
        ))}
      </ol>

      {step === 1 ? (
        <section aria-labelledby={`${id}-t`} data-tour="donate-targets">
          <h2 id={`${id}-t`} className={s.h2}>{m.donate.targetsTitle}</h2>
          <p className={s.muted}>{m.donate.targetsIntro}</p>
          <div className={s.filter}>
            <Segmented<SpeciesFilter> name={`${id}-sp`} label={m.donate.speciesFilter} value={species} onChange={setSpecies}
              options={[{ value: 'all', label: m.donate.all }, { value: 'cat', label: m.species.cat }, { value: 'dog', label: m.species.dog }]} />
          </div>
          {ranking.items.length ? (
            <ul className={s.targets}>
              {ranking.items.slice(0, 12).map((r, i) => {
                const h = getHelper(r.id)!;
                const det = donationTargetDetail(h.id, SUPPLY_MAP.get(h.id)!, { orders, packages: PACKAGE_MAP, now: new Date(now || 0) });
                const st = statusInfo(h);
                const name = helperName(h, locale);
                return (
                  <li key={r.id} className={s.target} data-selected={helperId === h.id ? 'true' : undefined}>
                    <div className={s.targetTop}>
                      <Avatar name={name} media={h.images.profile} size={44} aiLabel />
                      <div className={s.targetHead}>
                        <div className={s.badges}>
                          {i < 3 ? <Badge tone="gold" icon="star">{f(m.listings.recommendedRank, { n: i + 1 })}</Badge> : null}
                          <StatusBadge level={st.level} closed={st.closed} demo />
                        </div>
                        <p className={s.targetName}><Link href={`/helpers/${h.id}`}>{name}</Link></p>
                        <p className={s.muted}>{district(h.districtId)} · {h.speciesAccepted.map((x) => m.species[x]).join(', ')}</p>
                      </div>
                    </div>
                    <p className={s.supply}>
                      <SupplyBadge level={supplyLevel(det.foodDays, det.litterDays)} />
                      <span>{f(m.supply.food, { days: det.foodDays })}{det.litterDays !== undefined ? ` · ${f(m.supply.litter, { days: det.litterDays })}` : ''} {m.supply.demo}</span>
                    </p>
                    {r.reasons.length ? <ul className={s.chips}>{r.reasons.slice(0, 3).map((x, k) => <li key={k}><Icon name="check" size="1em" /> {reasonText(x, m, f)}</li>)}</ul> : null}
                    <div className={s.actions}>
                      <Button small variant={helperId === h.id ? 'primary' : 'secondary'} icon={helperId === h.id ? 'check' : 'box'} onClick={() => { setHelperId(h.id); setPackageId(null); setStep(2); }}>
                        {helperId === h.id ? m.donate.chosen : m.donate.choose}
                      </Button>
                      <Button small variant="ghost" icon="info" onClick={() => setWhyId(h.id)}>{m.why.open}</Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : <p>{m.donate.noTargets}</p>}
        </section>
      ) : null}

      {step === 2 && helper ? (
        <section aria-labelledby={`${id}-p`}>
          <h2 id={`${id}-p`} className={s.h2}>{f(m.donate.packagesTitle, { name: helperName(helper, locale) })}</h2>
          <ul className={s.pkgs}>
            {pkgs.map((p) => {
              const b = BRANDS.find((x) => x.id === p.brandId);
              return (
                <li key={p.id}>
                  <label className={s.pkg} data-selected={packageId === p.id ? 'true' : undefined}>
                    <input type="radio" name={`${id}-pkg`} checked={packageId === p.id} onChange={() => setPackageId(p.id)} />
                    <span className={s.pkgBody}>
                      <span className={s.pkgName}>{loc(p.name)}</span>
                      <span className={s.pkgPrice}>{f(m.donate.price, { price: money(p.priceTHB) })}</span>
                      <span className={s.muted}>{b ? loc(b.name) : ''}</span>
                      <span className={s.pkgItems}>{p.items.map((it) => loc(it)).join(' · ')}</span>
                      <span className={s.pkgEffect}>
                        {p.effect.foodDays ? f(m.donate.effectFood, { days: p.effect.foodDays }) : null}
                        {p.effect.foodDays && p.effect.litterDays && helper.speciesAccepted.includes('cat') ? ' · ' : null}
                        {p.effect.litterDays && helper.speciesAccepted.includes('cat') ? f(m.donate.effectLitter, { days: p.effect.litterDays }) : null}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          <div className={s.qty}>
            <Field id={`${id}-q`} label={m.donate.quantity}>
              <Select id={`${id}-q`} value={qty} onChange={(e) => setQty(Number(e.target.value))}>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
              </Select>
            </Field>
          </div>
          <div className={s.nav}>
            <Button icon="arrowLeft" onClick={() => setStep(1)}>{m.donate.back}</Button>
            <Button variant="primary" iconRight="arrowRight" disabled={!pkg} onClick={() => setStep(3)}>{m.donate.next}</Button>
          </div>
        </section>
      ) : null}

      {step === 3 && helper && pkg ? (
        <section aria-labelledby={`${id}-r`}>
          <h2 id={`${id}-r`} className={s.h2}>{m.donate.reviewTitle}</h2>
          <Card flat className={s.review}>
            <dl className={s.facts}>
              <div><dt>{m.donate.recipient}</dt><dd>{helperName(helper, locale)} · {district(helper.districtId)}</dd></div>
              <div><dt>{m.donate.package}</dt><dd>{loc(pkg.name)} × {qty} · {brand ? loc(brand.name) : ''}</dd></div>
              <div><dt>{m.donate.total}</dt><dd><strong>{f(m.donate.totalSim, { money: money(orderTotalTHB({ quantity: qty, unitPriceTHB: pkg.priceTHB })) })}</strong></dd></div>
            </dl>
          </Card>
          <Card flat className={s.transparency} data-tour="donate-transparency">
            <h3 className={s.h3}>{m.donate.transparencyTitle}</h3>
            <ul>
              <li><Icon name="check" size="1em" /> {m.donate.tr1}</li>
              <li><Icon name="check" size="1em" /> {f(m.donate.tr2, { pct: 100 - pkg.platformSharePct })}</li>
              <li><Icon name="check" size="1em" /> {f(m.donate.tr3, { pct: pkg.platformSharePct })}</li>
              <li><Icon name="check" size="1em" /> {m.donate.tr4}</li>
            </ul>
          </Card>
          <p className={s.paymentOff}><Icon name="shield" size="1em" /> {m.donate.paymentOff}</p>
          <Checkbox checked={ack} onChange={setAck} required error={tried && !ack ? m.requests.ackRequired : null}>{m.donate.ack}</Checkbox>
          <div className={s.nav}>
            <Button icon="arrowLeft" onClick={() => setStep(2)}>{m.donate.back}</Button>
            <span data-tour="donate-confirm"><Button variant="primary" icon="box" onClick={confirm}>{m.donate.confirm}</Button></span>
          </div>
        </section>
      ) : null}

      {mine.length ? (
        <section aria-labelledby={`${id}-o`}>
          <h2 id={`${id}-o`} className={s.h2}>{m.donate.myOrders}</h2>
          <ul className={s.orders}>
            {mine.map((o) => {
              const h = getHelper(o.helperId);
              const p = getPackage(o.packageId);
              return (
                <li key={o.id}>
                  <Link href={`/donate/orders/${o.id}`} className={s.orderLink}>
                    <span>{f(m.orders.summary, { pkg: p ? loc(p.name) : o.packageId, qty: o.quantity, helper: h ? helperName(h, locale) : o.helperId })}</span>
                    {o.status === 'cancelled' ? <Badge tone="neutral">{m.orders.cancelled}</Badge> : <span className={s.muted}>{money(orderTotalTHB(o))}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <Dialog open={!!whyRec} onClose={() => setWhyId(null)} title={m.why.title} size="md">
        {whyRec ? <WhyPanel rec={whyRec} kind="donation" name={helperName(getHelper(whyRec.id)!, locale)} /> : null}
      </Dialog>
    </div>
  );
}
