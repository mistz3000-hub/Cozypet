'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useId, useState } from 'react';
import { useI18n } from '@/i18n/provider';
import { useDemoSession, useHydrated } from '@/lib/store';
import { formatRun, parseRunInput } from '@/lib/run';
import { useAuth } from '@/features/auth/AuthContext';
import { updateProfileRemote } from '@/features/auth/sync-client';
import { Button } from '@/components/ui/Button';
import { Card, Notice } from '@/components/ui/Badge';
import { Field, TextInput } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { playSfx } from '@/lib/audio/sfx';
import { safeNext } from './RequireRun';
import s from './start.module.css';

export function StartPage() {
  const { m, f } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const hydrated = useHydrated();
  const [session, update] = useDemoSession();
  const { user } = useAuth();
  const id = useId();
  const [raw, setRaw] = useState('');
  const [touched, setTouched] = useState(false);
  const run = parseRunInput(raw);
  const error = touched && raw.trim() !== '' && run === null ? m.start.error : null;
  const next = safeNext(params.get('next'), user ? '/dashboard' : '/');

  const start = (n: number) => {
    update({ runNumber: n });
    if (user) void updateProfileRemote({ runNumber: n });
    playSfx('pop');
    router.push(next);
  };

  return (
    <div className={`cp-container cp-page ${s.wrap}`}>
      <Card className={s.card}>
        <span className={s.icon} aria-hidden="true"><Icon name="paw" size={30} /></span>
        <h1>{m.start.title}</h1>
        <p className={s.intro}>{m.start.intro}</p>
        {hydrated && session.runNumber ? <p className={s.current}>{f(m.start.current, { run: formatRun(session.runNumber) })}</p> : null}
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setTouched(true);
            if (run !== null) start(run);
          }}
        >
          <Field id={`${id}-run`} label={m.start.label} required hint={m.start.hint} error={error}>
            <TextInput
              id={`${id}-run`}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={3}
              autoComplete="off"
              value={raw}
              onChange={(e) => setRaw(e.target.value.replace(/\D/g, '').slice(0, 3))}
              onBlur={() => setTouched(true)}
              aria-invalid={!!error}
              aria-describedby={[`${id}-run-hint`, error ? `${id}-run-error` : null].filter(Boolean).join(' ')}
              className={s.runInput}
              placeholder="042"
            />
          </Field>
          {run !== null ? <p className={s.preview} aria-live="polite">{f(m.start.preview, { run: formatRun(run) })}</p> : null}
          <div className={s.actions}>
            <Button type="submit" variant="primary" disabled={run === null} icon="arrowRight">{m.start.submit}</Button>
            <Button onClick={() => start(1)} icon="sparkle">{m.start.try001}</Button>
          </div>
        </form>
        <Notice tone="butter" icon="info">{m.start.sameRunNote}</Notice>
        {user ? (
          <p className={s.small}>{m.start.accountNote}</p>
        ) : (
          <p className={s.small}><Link href={`/login?next=${encodeURIComponent(next)}`}>{m.start.haveAccount}</Link></p>
        )}
      </Card>
    </div>
  );
}
