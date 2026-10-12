'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/i18n/provider';
import { getMessages } from '@/i18n';
import { useDemoSession, useHydrated } from '@/lib/store';
import { formatRun } from '@/lib/run';
import { useAuth } from '@/features/auth/AuthContext';
import { Icon } from '@/components/ui/Icon';
import { playSfx } from '@/lib/audio/sfx';
import { setSoundOverride } from '@/lib/audio/engine';
import { useAnnounce } from '@/components/providers/Announcer';
import { m as motionEl, useReducedMotion } from '@/lib/motion';
import { T } from '@/lib/motion-tokens';
import s from './header.module.css';

export const OPEN_TOUR_EVENT = 'cozypet:open-tour';

export function RunBadge() {
  const { m, f } = useI18n();
  const hydrated = useHydrated();
  const [session] = useDemoSession();
  const { user } = useAuth();
  const run = hydrated ? session.runNumber : null;
  const label = run ? f(user ? m.header.runBadgeAccount : m.header.runBadgeDemo, { run: formatRun(run) }) : m.header.runBadgeEmpty;
  return (
    <Link href={run ? '/profile' : '/start'} className={s.runBadge} aria-label={run ? `${label} — ${m.header.runBadgeLabel}` : label} data-tour="header-run">
      <Icon name="paw" size="1em" />
      <span className={s.runLabel} suppressHydrationWarning>{label}</span>
      <span className={s.runLabelCompact} suppressHydrationWarning>{run ? f(m.header.runBadgeCompact, { run: formatRun(run) }) : m.common.demo}</span>
    </Link>
  );
}

export function LocaleSwitch() {
  const { m, locale, setLocale } = useI18n();
  const announce = useAnnounce();
  const reduced = useReducedMotion();
  return (
    <div className={s.locale} role="group" aria-label={m.locale.label} data-tour="header-locale">
      <span className={s.localeLabel} aria-hidden="true">{m.locale.label}:</span>
      <div className={s.localeOptions}>
      <motionEl.span className={s.localeThumb} aria-hidden="true" initial={false} animate={{ x: locale === 'en' ? '100%' : '0%' }} transition={reduced ? { duration: 0 } : T.switch} />
      {(['th', 'en'] as const).map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          className={s.localeBtn}
          aria-pressed={locale === l}
          onClick={() => {
            if (l === locale) return;
            setLocale(l);
            announce(getMessages(l).locale.changed);
          }}
        >
          {l === 'th' ? m.locale.th : m.locale.en}
        </button>
      ))}
      </div>
    </div>
  );
}

export function HelpButton({ compact = false }: { compact?: boolean }) {
  const { m } = useI18n();
  return (
    <button
      type="button"
      className={s.help}
      data-help-button="true"
      aria-label={m.header.helpLabel}
      onClick={(e) => window.dispatchEvent(new CustomEvent(OPEN_TOUR_EVENT, { detail: { returnTo: e.currentTarget } }))}
    >
      <Icon name="help" />
      <span className={compact ? s.helpTextCompact : undefined}>{m.header.help}</span>
    </button>
  );
}

export function SoundToggle() {
  const { m } = useI18n();
  const hydrated = useHydrated();
  const [session, update] = useDemoSession();
  const on = hydrated && session.soundEnabled;
  return (
    <button
      type="button"
      className={s.sound}
      aria-pressed={on}
      aria-label={m.header.soundLabel}
      onClick={() => {
        const r = update({ soundEnabled: !on });
        if (r !== 'ok') setSoundOverride(!on);
        if (!on) playSfx('pop', { force: true });
      }}
    >
      <Icon name={on ? 'volume' : 'volumeOff'} />
      <span>{on ? m.header.soundOn : m.header.soundOff}</span>
    </button>
  );
}

export function AccountButton() {
  const { m } = useI18n();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  if (!user) {
    return (
      <Link href="/login" className={s.login} data-tour="header-login">
        <Icon name="login" />
        <span>{m.header.login}</span>
      </Link>
    );
  }
  const initial = user.displayName.trim().charAt(0).toUpperCase() || '?';
  return (
    <div className={s.account} ref={ref}>
      <button type="button" className={s.avatarBtn} aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((v) => !v)} aria-label={m.header.account}>
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt="" width={36} height={36} className={s.avatarImg} referrerPolicy="no-referrer" />
        ) : (
          <span className={s.avatarInitial} aria-hidden="true">{initial}</span>
        )}
        <Icon name="chevronDown" size="1em" />
      </button>
      {open ? (
        <div role="menu" className={s.menuPop}>
          <p className={s.menuName}>{user.displayName}</p>
          <Link role="menuitem" href="/dashboard" onClick={() => setOpen(false)}><Icon name="chart" />{m.header.dashboard}</Link>
          <Link role="menuitem" href="/profile" onClick={() => setOpen(false)}><Icon name="user" />{m.header.profile}</Link>
          <Link role="menuitem" href="/account" onClick={() => setOpen(false)}><Icon name="shield" />{m.header.account}</Link>
          <Link role="menuitem" href="/account#logout" onClick={() => setOpen(false)}><Icon name="logout" />{m.header.logout}</Link>
        </div>
      ) : null}
    </div>
  );
}
