'use client';

import { PACKAGES } from '@/data/packages';
import { DONATION_SUPPLY_MAP } from '@/data/business';
import { donationTargetDetail, type DonationTargetDetail } from '@/lib/balancer';
import { useDonationOrders } from '@/features/business/hooks';
import { useNow } from '@/lib/useNow';

export const PACKAGE_MAP = new Map(PACKAGES.map((p) => [p.id, p]));

/**
 * เสบียงที่แสดงผล = ข้อมูลสาธิต + ผลของคำสั่งจำลองที่ “ถึงผู้ดูแล” แล้ว (ใช้สูตรเดียวกับ Smart Load Balancer)
 * subscribe นาฬิกาเฉพาะเมื่อมีคำสั่งจำลองถึงผู้ช่วยดูแลคนนี้
 */
export function useHelperSupplies(helperId: string, enabled: boolean): DonationTargetDetail | null {
  const orders = useDonationOrders();
  const mine = enabled ? orders.filter((o) => o.helperId === helperId && o.status === 'active') : [];
  const now = useNow(mine.length > 0);
  const base = enabled ? DONATION_SUPPLY_MAP.get(helperId) : undefined;
  if (!base) return null;
  if (!mine.length || !now) return { foodDays: base.foodDays, litterDays: base.litterDays, recentTotal: base.recentPackages30d };
  return donationTargetDetail(helperId, base, { orders: mine, packages: PACKAGE_MAP, now: new Date(now) });
}
