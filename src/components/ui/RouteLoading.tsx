'use client';

import { useI18n } from '@/i18n/provider';
import { Skeleton } from './Skeleton';
import s from './route-loading.module.css';

export function RouteLoading() {
  const { m } = useI18n();
  return (
    <section className={`cp-container ${s.page}`} aria-busy="true" aria-label={m.common.loading}>
      <p className="visually-hidden" role="status">{m.common.loading}</p>
      <div className={s.heading}><Skeleton /><Skeleton style={{ width: '64%' }} /></div>
      <div className={s.grid}>
        {[0, 1, 2].map((id) => <div key={id} className={s.card}><Skeleton className={s.photo} /><Skeleton className={s.line} /><Skeleton className={s.line} style={{ width: '72%' }} /></div>)}
      </div>
    </section>
  );
}
