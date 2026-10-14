'use client';

import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useI18n } from '@/i18n/provider';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { PawPrint } from '@/components/ui/PawPrint';
import type { MascotKind } from '@/lib/types';
import { formatRun } from '@/lib/run';
import s from './google-profile.module.css';

export function GoogleProfileCard({ variant, mascot = 'cat' }: { variant: 'home' | 'profile'; mascot?: MascotKind }) {
  const { m } = useI18n();
  const { user } = useAuth();
  const [imageFailed, setImageFailed] = useState(false);

  if (!user) {
    if (variant === 'home') return null;
    return (
      <section className={s.guest} aria-label={m.auth.googleProfileTitle}>
        <span className={s.guestPaw}><PawPrint kind={mascot} /></span>
        <div><span className={s.eyebrow}>{m.auth.googleProfileTitle}</span><h2>{m.auth.googleProfileGuestTitle}</h2><p>{m.auth.googleProfileGuestText}</p></div>
        <ButtonLink href="/login?next=%2Fprofile" variant="primary" icon="login">{m.auth.google}</ButtonLink>
      </section>
    );
  }

  const initial = user.displayName.trim().charAt(0).toUpperCase() || 'C';
  const isGoogle = user.providers.includes('google');

  return (
    <section className={s.card} data-variant={variant} data-pet={mascot} aria-label={m.auth.googleProfileTitle}>
      <span className={s.pawMark} aria-hidden="true"><PawPrint kind={mascot} /></span>
      <div className={s.avatarWrap}>
        {user.avatarUrl && !imageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt={m.auth.googleProfilePhotoAlt} className={s.avatar} referrerPolicy="no-referrer" onError={() => setImageFailed(true)} />
        ) : <span className={s.avatarFallback} aria-hidden="true">{initial}</span>}
        <span className={s.googleDot} aria-label={isGoogle ? m.auth.provider.google : m.auth.provider.email}>G</span>
      </div>
      <div className={s.identity}>
        <span className={s.eyebrow}>{variant === 'home' ? m.auth.googleProfileWelcome : m.auth.googleProfileTitle}</span>
        <h2>{user.displayName}</h2>
        <p className={s.email}>{user.emailMasked}</p>
        <div className={s.badges}>
          <Badge tone={isGoogle ? 'open' : 'neutral'} icon={isGoogle ? 'check' : 'user'}>{isGoogle ? m.auth.googleConnected : m.auth.provider.email}</Badge>
          {user.runNumber ? <Badge tone="butter" icon="paw">Run {formatRun(user.runNumber)}</Badge> : null}
        </div>
      </div>
      <div className={s.actions}>
        <ButtonLink href={variant === 'home' ? '/profile' : '/account'} variant={variant === 'home' ? 'secondary' : 'primary'} icon={variant === 'home' ? 'user' : 'shield'}>
          {variant === 'home' ? m.auth.googleProfileOpen : m.auth.accountTitle}
        </ButtonLink>
        {variant === 'profile' ? <ButtonLink href="/shelter/manage" variant="secondary" icon="home">{m.community.manage}</ButtonLink> : null}
      </div>
      <Icon name="sparkle" className={s.sparkle} aria-hidden="true" />
    </section>
  );
}
