'use client';

import type { PetListing } from '@/lib/types';
import { coatColor, collarColor } from '@/data/colors';
import { animalKindOf } from '@/data/animal-catalog';
import type { Messages } from '@/i18n';

type Loc = (t: { th: string; en: string }) => string;

export function speciesLabel(l: Pick<PetListing, 'species' | 'speciesOther'>, m: Messages): string {
  const kind = animalKindOf(l);
  return kind === 'other' ? l.speciesOther || m.species.other : m.animalKind[kind];
}

export function listingTitle(l: PetListing, m: Messages, f: (t: string, p: Record<string, string | number>) => string): string {
  return l.name?.trim() || f(m.listings.noName, { species: speciesLabel(l, m) });
}

export function colorsText(ids: string[], loc: Loc, sep = ', '): string {
  return ids.map((c) => (coatColor(c) ? loc(coatColor(c)!.label) : c)).join(sep);
}

export function collarText(l: PetListing, m: Messages, loc: Loc): string {
  if (l.collar.status !== 'yes') return m.scan.collarShort[l.collar.status];
  const c = collarColor(l.collar.detail);
  if (c) return `${m.scan.collarShort.yes} · ${loc(c.label)}`;
  return l.collar.detail ? `${m.scan.collarShort.yes} · ${l.collar.detail}` : m.scan.collarShort.yes;
}
