'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { SuccessStory } from '@/lib/types';
import { useI18n } from '@/i18n/provider';
import { STORIES } from '@/data';
import { Segmented } from '@/components/ui/Field';
import { StoryCard } from './StoryCard';
import s from './stories.module.css';

type Filter = 'all' | SuccessStory['outcome'];

export function StoriesPage() {
  const { m } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get('outcome');
  const filter: Filter = raw === 'adopted' || raw === 'reunited' ? raw : 'all';
  const list = STORIES.filter((st) => filter === 'all' || st.outcome === filter);
  return (
    <div className={`cp-container cp-page ${s.page}`}>
      <h1>{m.stories.title}</h1>
      <p className={s.intro}>{m.stories.intro}</p>
      <div className={s.filter}>
        <Segmented<Filter>
          name="story-filter"
          label={m.stories.filterLabel}
          value={filter}
          onChange={(v) => router.replace(v === 'all' ? '/stories' : `/stories?outcome=${v}`, { scroll: false })}
          options={[{ value: 'all', label: m.stories.filterAll }, { value: 'adopted', label: m.stories.adopted }, { value: 'reunited', label: m.stories.reunited }]}
        />
      </div>
      {list.length ? <div className={s.grid}>{list.map((st) => <StoryCard key={st.id} story={st} />)}</div> : <p>{m.stories.empty}</p>}
    </div>
  );
}
