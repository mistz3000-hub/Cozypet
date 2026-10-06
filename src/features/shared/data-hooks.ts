'use client';

import { useMemo } from 'react';
import type { PetListing } from '@/lib/types';
import { LISTINGS } from '@/data';
import { useStore, useHydrated } from '@/lib/store';
import { useRun } from '@/features/demo/RequireRun';

/** ประกาศที่แสดง = seed + ประกาศที่ผู้ทดลองสร้างใน Run ปัจจุบัน (ข้อมูล seed ไม่ถูกเขียนลง storage) */
export function useAllListings(): PetListing[] {
  const user = useStore('userListings');
  const run = useRun();
  return useMemo(() => {
    const mine = run ? user.filter((l) => l.runNumber === run.run) : [];
    return [...mine, ...LISTINGS];
  }, [user, run]);
}

export function useListing(id: string | undefined): PetListing | undefined {
  const all = useAllListings();
  return useMemo(() => all.find((l) => l.id === id), [all, id]);
}

export function useIsMine(listing: PetListing | undefined): boolean {
  const hydrated = useHydrated();
  return hydrated && !!listing && listing.source === 'user';
}
