import type { HelperProfile, OwnerProfile, PetListing, SuccessStory } from '@/lib/types';
import { SHELTERS } from './shelters';
import { ADOPTERS } from './adopters';
import { OWNERS } from './owners';
import { LISTINGS } from './listings';
import { STORIES } from './stories';
import { DEMO_FOUNDATIONS } from './demo-foundations';

export { SHELTERS, ADOPTERS, OWNERS, LISTINGS, STORIES };

export const HELPERS: readonly HelperProfile[] = [...SHELTERS, ...ADOPTERS, ...DEMO_FOUNDATIONS];

const HELPER_BY_ID = new Map(HELPERS.map((h) => [h.id, h]));
const OWNER_BY_ID = new Map(OWNERS.map((o) => [o.id, o]));
const LISTING_BY_ID = new Map(LISTINGS.map((l) => [l.id, l]));
const STORY_BY_ID = new Map(STORIES.map((s) => [s.id, s]));

export function getHelper(id: string | undefined | null): HelperProfile | undefined {
  return id ? HELPER_BY_ID.get(id) : undefined;
}
export function getOwner(id: string | undefined | null): OwnerProfile | undefined {
  return id ? OWNER_BY_ID.get(id) : undefined;
}
export function getSeedListing(id: string | undefined | null): PetListing | undefined {
  return id ? LISTING_BY_ID.get(id) : undefined;
}
export function getStory(id: string | undefined | null): SuccessStory | undefined {
  return id ? STORY_BY_ID.get(id) : undefined;
}
