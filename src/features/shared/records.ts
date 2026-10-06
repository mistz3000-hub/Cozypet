'use client';

import { useMemo } from 'react';
import { computeActivities, kindnessLevel, type KindnessLevel } from '@/lib/kindness';
import type { ActivityEntry } from '@/lib/types';
import { useStore } from '@/lib/store';
import { useRun } from '@/features/demo/RequireRun';

/** แต้มน้ำใจและประวัติกิจกรรม (คำนวณจาก records ทุกครั้ง — PROMPT.md 7.13) */
export function useKindness(): { activities: ActivityEntry[]; total: number; level: KindnessLevel } {
  const userListings = useStore('userListings');
  const careRequests = useStore('careRequests');
  const handoffs = useStore('handoffs');
  const donationOrders = useStore('donationOrders');
  const places = useStore('caretakerPlace');
  const run = useRun();
  const place = run ? places.find((p) => p.runNumber === run.run) ?? null : null;
  return useMemo(() => {
    const activities = computeActivities({ userListings, careRequests, handoffs, donationOrders, caretakerPlace: place });
    const total = activities.reduce((n, e) => n + e.points, 0);
    return { activities, total, level: kindnessLevel(total) };
  }, [userListings, careRequests, handoffs, donationOrders, place]);
}

/** ลิงก์ของกิจกรรมแต่ละรายการ */
export function activityHref(e: ActivityEntry): string {
  switch (e.kind) {
    case 'listing_found':
    case 'listing_lost':
      return `/listings/${e.refId}`;
    case 'request_intake':
    case 'request_care':
      return `/requests/${e.refId}`;
    case 'order':
      return `/donate/orders/${e.refId}`;
    case 'place_update':
      return '/caretaker';
    case 'handoff':
      return '/profile#handoffs';
  }
}
