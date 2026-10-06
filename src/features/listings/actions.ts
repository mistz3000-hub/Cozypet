'use client';

import type { PetListing } from '@/lib/types';
import { getValue, updateValue } from '@/lib/store';
import type { WriteResult } from '@/lib/storage';

export function saveUserListing(listing: PetListing): WriteResult {
  return updateValue('userListings', (prev) => [listing, ...prev.filter((l) => l.id !== listing.id)]);
}

export function closeUserListing(id: string, reason: NonNullable<PetListing['closedReason']>): WriteResult {
  return updateValue('userListings', (prev) => prev.map((l) => (l.id === id ? { ...l, status: 'closed', closedReason: reason, updatedAt: new Date().toISOString() } : l)));
}

export function getUserListing(id: string): PetListing | undefined {
  return getValue('userListings').find((l) => l.id === id);
}
