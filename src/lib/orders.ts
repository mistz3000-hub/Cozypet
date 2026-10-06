import type { DonationOrder, DonationPackage, HelperSupplies } from './types';
import { ORDER_ARRIVED_STEP, ORDER_SHIPPING_STEP, ORDER_STEP_SECONDS, ORDER_STEPS } from './balancer-config';

/** เวลาของขั้น k (คำนวณจาก createdAt ไม่เก็บ) */
export function orderStepTime(order: Pick<DonationOrder, 'createdAt'>, step: number): Date {
  return new Date(new Date(order.createdAt).getTime() + step * ORDER_STEP_SECONDS * 1000);
}

/** ขั้นล่าสุดที่ผ่านแล้ว (0 = ยืนยันคำสั่ง … 4 = ผู้ดูแลขอบคุณ) หรือ -1 ถ้ายกเลิก */
export function orderStepIndex(order: DonationOrder, now: Date): number {
  if (order.status === 'cancelled') return -1;
  if (order.fastForwarded) return ORDER_STEPS - 1;
  const elapsed = (now.getTime() - new Date(order.createdAt).getTime()) / 1000;
  return Math.max(0, Math.min(ORDER_STEPS - 1, Math.floor(elapsed / ORDER_STEP_SECONDS)));
}

export function orderArrived(order: DonationOrder, now: Date): boolean {
  return orderStepIndex(order, now) >= ORDER_ARRIVED_STEP;
}

export function canCancelOrder(order: DonationOrder, now: Date): boolean {
  return order.status === 'active' && orderStepIndex(order, now) < ORDER_SHIPPING_STEP;
}

export function orderTotalTHB(order: Pick<DonationOrder, 'quantity' | 'unitPriceTHB'>): number {
  return order.quantity * order.unitPriceTHB;
}

/** เสบียงหลังรวมผลของคำสั่งจำลองที่ “ถึงผู้ดูแล” แล้ว */
export function effectiveSupplies(
  base: Pick<HelperSupplies, 'foodDays' | 'litterDays'>,
  helperId: string,
  orders: readonly DonationOrder[],
  packages: ReadonlyMap<string, DonationPackage>,
  now: Date,
): { foodDays: number; litterDays?: number } {
  let food = base.foodDays;
  let litter = base.litterDays;
  for (const o of orders) {
    if (o.helperId !== helperId || !orderArrived(o, now)) continue;
    const pkg = packages.get(o.packageId);
    if (!pkg) continue;
    food += (pkg.effect.foodDays ?? 0) * o.quantity;
    if (litter !== undefined) litter += (pkg.effect.litterDays ?? 0) * o.quantity;
  }
  return { foodDays: Math.min(food, 60), litterDays: litter === undefined ? undefined : Math.min(litter, 60) };
}

export function userOrdersToHelperWithin30d(helperId: string, orders: readonly DonationOrder[], now: Date): number {
  const cutoff = now.getTime() - 30 * 86_400_000;
  return orders.filter((o) => o.helperId === helperId && o.status === 'active' && new Date(o.createdAt).getTime() >= cutoff).length;
}
