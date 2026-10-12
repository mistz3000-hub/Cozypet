import type { BusinessState, DonationOrder, DonationPackage, PartnerBooking } from './types';
import { DEMO_FOUNDATIONS } from '@/data/demo-foundations';
import { PACKAGES, getPackage } from '@/data/packages';
import { orderTotalTHB, orderArrived } from './orders';

/** Money is represented in satang during the split; rounded parts always add up to the gross. */
export function moneySplit(order: Pick<DonationOrder, 'quantity' | 'unitPriceTHB' | 'platformSharePct'>, pkg?: DonationPackage) {
  const gross = Math.round(orderTotalTHB(order) * 100);
  const pct = Math.min(100, Math.max(0, order.platformSharePct ?? pkg?.platformSharePct ?? 0));
  const share = Math.round(gross * pct / 100);
  return { gross: gross / 100, commission: share / 100, partner: (gross - share) / 100, pct };
}
export function bookingActive(b: PartnerBooking, now: Date): boolean {
  return b.status === 'active' && now.getTime() < Date.parse(b.createdAt) + b.durationDays * 86_400_000;
}
export function poolPackage(helperId: string) {
  const h = DEMO_FOUNDATIONS.find((h) => h.id === helperId);
  return getPackage(h?.speciesAccepted.includes('dog') ? 'pkg-dog-food-7d' : 'pkg-cat-food-7d')!;
}
/** Each complete price threshold creates one deterministic order. Remainder stays in that foundation's pool. */
export function poolOrders(state: BusinessState): DonationOrder[] {
  const result: DonationOrder[] = [];
  for (const h of DEMO_FOUNDATIONS) {
    const pkg = poolPackage(h.id);
    let balance = 0;
    let n = 0;
    for (const d of state.microDonations.filter((d) => d.helperId === h.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id))) {
      balance += d.amountTHB;
      while (balance >= pkg.priceTHB) {
        balance -= pkg.priceTHB;
        n += 1;
        result.push({ id: `pool-${h.id}-${String(n).padStart(4, '0')}`, runNumber: d.runNumber, helperId: h.id,
          packageId: pkg.id, quantity: 1, unitPriceTHB: pkg.priceTHB, platformSharePct: pkg.platformSharePct,
          source: 'micro', settlementStage: 'partner_paid', fulfillmentStartedAt: d.createdAt, createdAt: d.createdAt, status: 'active', isDemo: true });
      }
    }
  }
  return result;
}
export function allDonationOrders(donorOrders: readonly DonationOrder[], state: BusinessState): DonationOrder[] {
  return [...donorOrders, ...poolOrders(state), ...state.bookings.flatMap((b) => b.aidOrder ? [{ ...b.aidOrder, status: b.status }] : [])];
}
export function revenueSummary(donorOrders: readonly DonationOrder[], state: BusinessState) {
  let commission = 0, pending = 0, paidToBrands = 0;
  const relevant = [...donorOrders, ...poolOrders(state)].filter((o) => o.status === 'active');
  for (const o of relevant) {
    const split = moneySplit(o, getPackage(o.packageId));
    const stage = o.settlementStage ?? 'partner_paid'; // legacy demo orders retain their original flow
    if (stage === 'received') pending += split.gross;
    else {
      commission += split.commission;
      if (stage === 'partner_paid') paidToBrands += split.partner;
      else pending += split.partner;
    }
  }
  const active = state.bookings.filter((b) => b.status === 'active');
  const advertising = active.filter((b) => b.kind === 'advertisement').reduce((sum, b) => sum + b.feeTHB, 0);
  const csr = active.filter((b) => b.kind === 'csr').reduce((sum, b) => sum + b.feeTHB, 0);
  paidToBrands += active.reduce((sum, b) => sum + b.aidBudgetTHB, 0);
  const pools = DEMO_FOUNDATIONS.map((h) => {
    const donated = state.microDonations.filter((d) => d.helperId === h.id).reduce((sum, d) => sum + d.amountTHB, 0);
    const spent = poolOrders(state).filter((o) => o.helperId === h.id).reduce((sum, o) => sum + orderTotalTHB(o), 0);
    return { helperId: h.id, donated, spent, balance: donated - spent };
  });
  pending += pools.reduce((sum, p) => sum + p.balance, 0);
  return { commission, advertising, csr, total: commission + advertising + csr, pending, paidToBrands, pools };
}
export function deliveredOrders(orders: readonly DonationOrder[], helperId: string, now: Date) {
  return orders.filter((o) => o.helperId === helperId && orderArrived(o, now));
}
export const BUSINESS_PACKAGE_MAP = new Map(PACKAGES.map((p) => [p.id, p]));
