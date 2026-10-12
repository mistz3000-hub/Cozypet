'use client';

import Link from 'next/link';
import type { PetListing } from '@/lib/types';
import { useI18n } from '@/i18n/provider';
import { PetImage } from '@/components/PetImage';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { useSaved } from '@/features/shared/saved';
import { listingTitle, speciesLabel, colorsText } from './listing-text';
import { animalBreedLabel } from '@/data/animal-catalog';
import s from './listings.module.css';

const TYPE_TONE = { lost: 'tight', found: 'info', adoption: 'adopted' } as const;

export function ListingCard({ listing, from, rank }: { listing: PetListing; from?: string; rank?: number }) {
  const { m, f, date, district, loc } = useI18n();
  const [saved, toggle] = useSaved('listing', listing.id);
  const title = listingTitle(listing, m, f);
  const href = `/listings/${listing.id}${from ? `?from=${encodeURIComponent(from)}` : ''}`;
  const where = listing.type === 'lost' ? m.listings.lostAt : listing.type === 'found' ? m.listings.found : m.listings.at;
  return (
    <article className={s.card} data-closed={listing.status === 'closed' ? 'true' : undefined}>
      <Link href={href} className={s.cardLink} aria-label={title}>
        <PetImage media={listing.photo} ratio="4 / 3" rounded={false} fallbackLabel={listing.photo?.src === 'local-only' ? m.listings.photoLocalOnly : undefined} />
      </Link>
      <div className={s.cardBody}>
        <div className={s.badges}>
          <Badge tone={TYPE_TONE[listing.type]}>{m.listingType[listing.type]}</Badge>
          {rank ? <Badge tone="gold" icon="star">{f(m.listings.recommendedRank, { n: rank })}</Badge> : null}
          {listing.source === 'user' ? <Badge tone="butter" icon="user">{m.listings.mine}</Badge> : <Badge tone="info">{m.common.demo}</Badge>}
          {listing.status === 'closed' ? <Badge>{m.listings.closed}</Badge> : null}
          {listing.urgency && listing.urgency !== 'normal' && listing.status === 'open' ? <Badge tone="full" icon="alert">{m.urgency[listing.urgency]}</Badge> : null}
        </div>
        <h3 className={s.cardTitle}><Link href={href}>{title}</Link></h3>
        <p className={s.cardMeta}>{speciesLabel(listing, m)} · {colorsText(listing.colors, loc)}</p>
        <p className={s.cardMeta}>{m.common.breed}: {animalBreedLabel(listing, loc, m.common.breedUnknown)}</p>
        <p className={s.cardMeta}><Icon name="pin" size="1em" /> {f(where, { district: district(listing.districtId) })}</p>
        <p className={s.cardMeta}><Icon name="clock" size="1em" /> {date(listing.eventAt)}{listing.source === 'seed' ? ` · ${m.common.sampleDate}` : ''}</p>
        <button type="button" className={s.save} aria-pressed={saved} onClick={toggle} aria-label={f(saved ? m.listings.unsaveLabel : m.listings.saveLabel, { name: title })}>
          <Icon name="bookmark" fill={saved ? 'currentColor' : 'none'} />
          <span>{saved ? m.common.saved : m.common.save}</span>
        </button>
      </div>
    </article>
  );
}
