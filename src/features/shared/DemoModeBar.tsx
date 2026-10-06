'use client';

import Link from 'next/link';
import { useI18n } from '@/i18n/provider';
import { useAuth } from '@/features/auth/AuthContext';
import { Icon } from '@/components/ui/Icon';
import type { ActivityEntry } from '@/lib/types';
import { activityHref as hrefFor } from './records';
import s from './shared.module.css';

/** แถบ “โหมดทดลอง” บนหน้าที่มีข้อมูลส่วนตัว (PROMPT.md 4) */
export function DemoModeBar({ next }: { next: string }) {
  const { m } = useI18n();
  const { user } = useAuth();
  if (user) return null;
  return (
    <p className={s.demoBar}>
      <Icon name="info" size="1em" /> {m.demoMode.bar} · <Link href={`/login?next=${encodeURIComponent(next)}`}>{m.demoMode.login}</Link>
    </p>
  );
}

export function ActivityList({ items, limit }: { items: ActivityEntry[]; limit?: number }) {
  const { m, f, dateTime } = useI18n();
  const list = limit ? items.slice(0, limit) : items;
  return (
    <ul className={s.activity}>
      {list.map((e) => (
        <li key={`${e.kind}:${e.refId}:${e.at}`}>
          <Link href={hrefFor(e)} className={s.activityItem}>
            <span className={s.activityText}>
              <strong>{m.kindness.kind[e.kind]}</strong>
              <span>{dateTime(e.at)}</span>
            </span>
            <span className={s.activityPts}>{f(m.kindness.plus, { n: e.points })}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
