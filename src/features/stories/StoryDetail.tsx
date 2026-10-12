'use client';

import Link from 'next/link';
import { useI18n } from '@/i18n/provider';
import { getHelper, getStory } from '@/data';
import { PetImage } from '@/components/PetImage';
import { Badge, Notice } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { NotFoundView } from '@/components/shell/NotFoundView';
import { helperName } from '@/features/helpers/helper-text';
import { OutcomeBadge } from './StoryCard';
import s from './stories.module.css';

export function StoryDetail({ id }: { id: string }) {
  const { m, date, locale } = useI18n();
  const story = getStory(id);
  if (!story) return <NotFoundView />;
  const helper = story.helperId ? getHelper(story.helperId) : undefined;
  return (
    <article className={`cp-container cp-page ${s.detail}`}>
      <ButtonLink href="/stories" variant="ghost" small icon="arrowLeft" className={s.back}>{m.stories.backToAll}</ButtonLink>
      <div className={s.detailGrid}>
        <PetImage media={story.photo} ratio="4 / 3" />
        <div className={s.detailText}>
          <div className={s.badges}>
            <OutcomeBadge outcome={story.outcome} />
            <Badge tone="info">{m.common.demo}</Badge>
          </div>
          <h1 className={s.detailTitle}>{story.petName} <span className={s.species}>· {m.species[story.species]}</span></h1>
          <p className={s.date}>{m.common.breed}: {story.breed || m.common.breedUnknown}</p>
          <p className={s.date}><Icon name="clock" size="1em" /> {m.common.sampleDate} {date(story.date)}</p>
          <p className={s.lead} lang="th">{story.summary}</p>
          {story.body.split(/\n{2,}/).map((para, i) => <p key={i} lang="th" className={s.para}>{para}</p>)}
          {locale === 'en' ? <p className={s.thai}>{m.common.thaiOnly}</p> : null}
          {helper ? (
            <p className={s.related}>
              <Icon name="home" size="1em" /> {m.stories.relatedHelper}: <Link href={`/helpers/${helper.id}`}>{helperName(helper, locale)}</Link>
            </p>
          ) : null}
          <Notice tone="butter" icon="info">{m.stories.fictional}</Notice>
        </div>
      </div>
    </article>
  );
}
