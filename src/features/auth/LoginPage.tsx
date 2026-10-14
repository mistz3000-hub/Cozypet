'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useId, useState } from 'react';
import { useI18n } from '@/i18n/provider';
import { safeNext } from '@/lib/safe-next';
import { Notice } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Field, TextInput, describedBy } from '@/components/ui/Field';
import { MiniMascot } from '@/components/mascot/MiniMascot';
import { useAuth } from './AuthContext';
import { GoogleButton } from './GoogleButton';
import { PasswordInput } from './PasswordInput';
import s from './auth.module.css';

type Err = 'invalid' | 'rate' | 'unavailable' | 'oauth' | null;

export function LoginPage() {
  const { m } = useI18n();
  const { enabled, resetEnabled, user, googleEnabled } = useAuth();
  const params = useSearchParams();
  const router = useRouter();
  const id = useId();
  const next = safeNext(params.get('next'), '/');
  const initialErr = params.get('error');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [tried, setTried] = useState(false);
  const [err, setErr] = useState<Err>(initialErr === 'oauth' ? 'oauth' : initialErr === 'rate' ? 'rate' : null);
  const [resetMode, setResetMode] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const emailErr = tried && !/^\S+@\S+\.\S+$/.test(email.trim()) ? m.auth.errEmail : null;
  const pwErr = tried && !resetMode && !password ? m.auth.errPasswordRequired : null;
  const errText = err === 'invalid' ? m.auth.errInvalid : err === 'rate' ? m.auth.errRate : err === 'oauth' ? m.auth.errOauth : err === 'unavailable' ? m.auth.errUnavailable : null;

  const submit = async () => {
    setTried(true);
    if (!/^\S+@\S+\.\S+$/.test(email.trim()) || (!resetMode && !password)) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(resetMode ? '/api/auth/reset' : '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetMode ? { email: email.trim() } : { email: email.trim(), password }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (data.ok) {
        if (resetMode) setResetDone(true);
        else {
          router.replace(next);
          router.refresh();
        }
        return;
      }
      setErr(data.error === 'invalid' || data.error === 'bad_input' ? 'invalid' : data.error === 'rate' ? 'rate' : 'unavailable');
      setPassword('');
    } catch {
      setErr('unavailable');
      setPassword('');
    } finally {
      setBusy(false);
    }
  };

  if (user) {
    return (
      <div className={`cp-container cp-page ${s.page}`}>
        <div className={s.card}>
          <h1 className={s.title}>{m.auth.welcome}</h1>
          <ButtonLink href={next} variant="primary" block icon="arrowRight">{m.common.next}</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className={`cp-container cp-page ${s.page}`}>
      <div className={s.card}>
        <MiniMascot style={{ top: -36, left: "calc(50% - 26px)" }} />
        <h1 className={s.title}>{resetMode ? m.auth.resetTitle : m.auth.loginTitle}</h1>
        {!resetMode ? <p className={s.intro}>{m.auth.loginIntro}</p> : null}
        {!enabled ? <Notice tone="butter" icon="info">{m.auth.disabled}</Notice> : null}
        {errText ? <Notice tone="error" icon="alert" role="alert">{errText}</Notice> : null}
        {!resetMode ? (
          <>
            <GoogleButton label={m.auth.google} next={next} disabled={!googleEnabled} />
            <p className={s.or}><span>{m.auth.or}</span></p>
          </>
        ) : null}
        {resetDone ? <Notice tone="success" icon="check">{m.auth.resetSent}</Notice> : (
          <form noValidate className={s.form} onSubmit={(e) => { e.preventDefault(); void submit(); }}>
            <Field id={`${id}-e`} label={m.auth.email} error={emailErr}>
              <TextInput id={`${id}-e`} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!enabled} aria-invalid={!!emailErr} aria-describedby={describedBy(`${id}-e`, null, emailErr)} />
            </Field>
            {!resetMode ? (
              <Field id={`${id}-p`} label={m.auth.password} error={pwErr}>
                <PasswordInput id={`${id}-p`} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={!enabled} aria-invalid={!!pwErr} aria-describedby={describedBy(`${id}-p`, null, pwErr)} />
              </Field>
            ) : null}
            <Button type="submit" variant={enabled ? 'primary' : 'secondary'} block disabled={!enabled || busy} aria-busy={busy}>
              {busy ? m.common.loading : resetMode ? m.auth.resetSend : m.auth.login}
            </Button>
          </form>
        )}
        <p className={s.links}>
          {!resetMode ? <>{m.auth.noAccount} <Link href={`/signup?next=${encodeURIComponent(next)}`}>{m.auth.signupLink}</Link></> : <button type="button" className={s.textBtn} onClick={() => { setResetMode(false); setResetDone(false); }}>{m.auth.loginLink}</button>}
          {resetEnabled && enabled && !resetMode ? <> · <button type="button" className={s.textBtn} onClick={() => setResetMode(true)}>{m.auth.forgot}</button></> : null}
        </p>
        <ButtonLink href={`/start?next=${encodeURIComponent(next === '/dashboard' ? '/' : next)}`} variant={enabled ? 'ghost' : 'primary'} small={enabled} block={!enabled} icon="play" className={s.demo}>{m.auth.tryDemo}</ButtonLink>
        <p className={s.fine}>{m.auth.note} · <Link href="/privacy">{m.auth.privacyLink}</Link></p>
      </div>
    </div>
  );
}
