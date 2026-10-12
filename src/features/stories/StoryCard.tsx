'use client';

import Link from 'next/link';
import type { SuccessStory } from '@/lib/types';
import { useI18n } from '@/i18n/provider';
import { PetImage } from '@/components/PetImage';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import s from './stories.module.css';

export function OutcomeBadge({ outcome }: { outcome: SuccessStory['outcome'] }) {
  const { m } = useI18n();
  return outcome === 'adopted'
    ? <Badge tone="adopted" icon="home">{m.stories.adopted}</Badge>
    : <Badge tone="reunited" icon="heartArrow">{m.stories.reunited}</Badge>;
}

export function StoryCard({ story }: { story: SuccessStory }) {
  const { m, f, date, locale } = useI18n();
  return (
    <Link href={`/stories/${story.id}`} className={s.card} aria-label={f(m.stories.openStory, { name: story.petName })}>
      <div className={s.media}>
        <PetImage media={story.photo} ratio="4 / 3" rounded={false} />
      </div>
      <div className={s.body}>
        <div className={s.badges}>
          <OutcomeBadge outcome={story.outcome} />
          <Badge tone="info">{m.common.demo}</Badge>
        </div>
        <h3 className={s.name}>
          {story.petName} <span className={s.species}>· {m.species[story.species]}</span>
        </h3>
        <p className={s.date}>{m.common.breed}: {story.breed || m.common.breedUnknown}</p>
        <p className={s.summary} lang="th">{story.summary}{locale === 'en' ? <span className={s.thai}> {m.common.thaiOnly}</span> : null}</p>
        <p className={s.date}><Icon name="clock" size="1em" /> {m.common.sampleDate} {date(story.date)}</p>
      </div>
    </Link>
  );
}
