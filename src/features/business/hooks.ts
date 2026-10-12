'use client';
import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { allDonationOrders } from '@/lib/business';
export function useDonationOrders() {
  const orders = useStore('donationOrders');
  const business = useStore('businessState');
  return useMemo(() => allDonationOrders(orders, business), [orders, business]);
}
