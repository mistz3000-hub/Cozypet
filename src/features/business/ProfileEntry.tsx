'use client';

import { useI18n } from '@/i18n/provider';
import { ButtonLink } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Badge';
import { useDemoSession, useHydrated } from '@/lib/store';
import { useRun } from '@/features/demo/RequireRun';
import { GoogleProfileCard } from '@/features/auth/GoogleProfileCard';
import { ProfilePage } from './ProfilePage';
import s from './business.module.css';

export function ProfileEntry() {
  const { m } = useI18n();
  const hydrated = useHydrated();
  const [session] = useDemoSession();
  const run = useRun();

  if (!hydrated) {
    return <div className="cp-container cp-page" aria-busy="true"><Skeleton height={38} width="42%" /><div style={{ height: 16 }} /><Skeleton height={180} /></div>;
  }
  if (run) return <ProfilePage />;

  return (
    <div className={`cp-container cp-page ${s.page}`}>
      <header><h1>{m.header.profile}</h1><p className={s.lead}>{m.auth.profileWithoutRun}</p></header>
      <GoogleProfileCard variant="profile" mascot={session.mascot} />
      <ButtonLink href="/start?next=%2Fprofile" variant="primary" icon="paw">{m.auth.profileSetRun}</ButtonLink>
    </div>
  );
}
