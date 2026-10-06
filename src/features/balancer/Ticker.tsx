'use client';

import { useMemo } from 'react';
import { tickerAt, TICKER_BUCKET_MS } from '@/lib/ticker';
import { useNow } from '@/lib/useNow';
import { useI18n } from '@/i18n/provider';
import { Icon } from '@/components/ui/Icon';
import s from './balancer.module.css';

export function Ticker({ count = 4 }: { count?: number }) {
  const { m, f, district } = useI18n();
  const now = useNow();
  const bucket = Math.floor((now || 0) / TICKER_BUCKET_MS);
  const events = useMemo(() => (now ? tickerAt(bucket, count) : []), [bucket, count, now]);
  if (!events.length) return null;
  return (
    <section className={s.ticker} aria-labelledby="ticker-title">
      <h3 id="ticker-title" className={s.tickerTitle}><Icon name="bolt" size="1em" /> {m.nearby.tickerTitle}</h3>
      <ul>
        {events.map((e) => {
          const d = district(e.districtId);
          const text = e.kind === 'supplies' ? f(m.ticker.supplies, { district: d, days: e.days })
            : e.kind === 'capacity' ? f(m.ticker.capacity, { district: d, slots: e.slots })
              : e.kind === 'full' ? f(m.ticker.full, { district: d })
                : e.kind === 'found' ? f(m.ticker.found, { district: d, species: m.species[e.species] })
                  : f(m.ticker.adoption, { district: d, name: e.name });
          return <li key={`${e.kind}-${e.id}`}>{text}</li>;
        })}
      </ul>
    </section>
  );
}
