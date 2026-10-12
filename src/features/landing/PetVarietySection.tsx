'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { AnimalKind } from '@/lib/types';
import { VARIETY_LISTINGS } from '@/data/variety-listings';
import { ANIMAL_KINDS, animalBreedLabel, animalKindOf } from '@/data/animal-catalog';
import { useI18n } from '@/i18n/provider';
import { PetImage } from '@/components/PetImage';
import { Badge, Eyebrow } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import s from './pet-variety.module.css';

const FEATURED = new Set(['listing-029', 'listing-030', 'listing-039', 'listing-040', 'listing-049', 'listing-051', 'listing-052', 'listing-055', 'listing-057', 'listing-058', 'listing-059', 'listing-060']);

export function PetVarietySection() {
  const { m, loc } = useI18n();
  const [kind, setKind] = useState<AnimalKind | ''>('');
  const pets = VARIETY_LISTINGS.filter((pet) => kind ? animalKindOf(pet) === kind : FEATURED.has(pet.id));
  return (
    <section id="pet-friends" className={s.section} aria-labelledby="pet-friends-title">
      <div className="cp-container">
        <header className={s.head}>
          <div>
            <Eyebrow icon="paw">{m.petVariety.eyebrow}</Eyebrow>
            <h2 id="pet-friends-title">{m.petVariety.title}</h2>
            <p className={s.intro}>{m.petVariety.intro}</p>
          </div>
          <Badge tone="butter" icon="sparkle">{m.petVariety.badge}</Badge>
        </header>
        <div className={s.filters} role="group" aria-label={m.petVariety.filterLabel}>
          {(['', ...ANIMAL_KINDS.filter((k) => k !== 'other')] as const).map((value) => (
            <button key={value || 'all'} type="button" aria-pressed={kind === value} onClick={() => setKind(value)}>
              {value ? m.animalKind[value] : m.petVariety.all}
            </button>
          ))}
        </div>
        <ul className={s.grid}>
          {pets.map((pet) => (
            <li key={pet.id}>
              <Link href={`/listings/${pet.id}`} className={s.card}>
                <div className={s.photo}><PetImage media={pet.photo} ratio="1 / 1" rounded={false} /></div>
                <div className={s.body}>
                  <span className={s.kind}>{m.animalKind[animalKindOf(pet)]}</span>
                  <h3>{pet.name}</h3>
                  <p>{animalBreedLabel(pet, loc, m.common.breedUnknown)}</p>
                  <span className={s.detail}>{m.petVariety.detail}<Icon name="arrowRight" size={17} /></span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <div className={s.cta}><ButtonLink href={`/listings?tab=adoption${kind ? `&species=${kind}` : ''}`} variant="primary" icon="heart" iconRight="arrowRight">{m.petVariety.cta}</ButtonLink></div>
      </div>
    </section>
  );
}
