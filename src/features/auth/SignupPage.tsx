'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useId, useState } from 'react';
import { useI18n } from '@/i18n/provider';
import { safeNext } from '@/lib/safe-next';
import { useNow } from '@/lib/useNow';
import { Notice } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Checkbox, ErrorSummary, Field, TextInput, describedBy } from '@/components/ui/Field';
import { MiniMascot } from '@/components/mascot/MiniMascot';
import { useAuth } from './AuthContext';
import { GoogleButton } from './GoogleButton';
import { PasswordInput, passwordStrength } from './PasswordInput';
import s from './auth.module.css';

export function SignupPage() {
  const { m, f } = useI18n();
  const { enabled } = useAuth();
  const params = useSearchParams();
  const router = useRouter();
  const id = useId();
  const next = safeNext(params.get('next'), '/start');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accept, setAccept] = useState(false);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resendAt, setResendAt] = useState<number | null>(null);
  const now = useNow(resendAt !== null);

  const strength = passwordStrength(password);
  const errors = {
    [`${id}-n`]: !name.trim() || name.trim().length > 40 ? m.auth.errName : null,
    [`${id}-e`]: !/^\S+@\S+\.\S+$/.test(email.trim()) ? m.auth.errEmail : null,
    [`${id}-p`]: strength === 'weak' ? m.auth.errWeak : null,
    [`${id}-a`]: !accept ? m.auth.errAccept : null,
  };
  const shown = (k: string) => (tried ? errors[`${id}-${k}`] : null);
  const list = tried ? Object.entries(errors).filter(([, v]) => v).map(([k, v]) => ({ id: k, message: v! })) : [];

  const submit = async () => {
    setTried(true);
    if (Object.values(errors).some(Boolean)) {
      window.setTimeout(() => document.getElementById('error-summary')?.focus(), 0);
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: name.trim(), email: email.trim(), password, accept }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; confirm?: boolean; error?: string };
      if (data.ok && data.confirm) {
        setSentTo(email.trim());
        setResendAt(Date.now() + 60_000);
      } else if (data.ok) {
        router.replace(next);
        router.refresh();
        return;
      } else {
        setErr(data.error === 'rate' ? m.auth.errRate : data.error === 'weak' ? m.auth.errWeak : data.error === 'unavailable' || data.error === 'disabled' ? m.auth.errUnavailable : m.auth.errSignup);
      }
    } catch {
      setErr(m.auth.errUnavailable);
    } finally {
      setPassword('');
      setBusy(false);
    }
  };

  const resend = async () => {
    if (!sentTo) return;
    setResendAt(Date.now() + 60_000);
    await fetch('/api/auth/resend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: sentTo }) }).catch(() => null);
  };
  const wait = resendAt ? Math.max(0, Math.ceil((resendAt - now) / 1000)) : 0;

  return (
    <div className={`cp-container cp-page ${s.page}`}>
      <div className={s.card}>
        <MiniMascot style={{ top: -36, left: "calc(50% - 26px)" }} />
        <h1 className={s.title}>{m.auth.signupTitle}</h1>
        {!enabled ? <Notice tone="butter" icon="info">{m.auth.disabled}</Notice> : null}
        {err ? <Notice tone="error" icon="alert" role="alert">{err}</Notice> : null}
        {sentTo ? (
          <div className={s.form}>
            <Notice tone="success" icon="check" role="status">{m.auth.confirmSent}</Notice>
            <Button onClick={() => void resend()} disabled={wait > 0} icon="send">{wait > 0 ? f(m.auth.resendWait, { sec: wait }) : m.auth.resend}</Button>
          </div>
        ) : (
          <>
            <GoogleButton label={m.auth.googleSignup} next={next} disabled={!enabled} />
            <p className={s.or}><span>{m.auth.or}</span></p>
            <form noValidate className={s.form} onSubmit={(e) => { e.preventDefault(); void submit(); }}>
              <ErrorSummary title={m.common.errorSummary} errors={list} />
              <Field id={`${id}-n`} label={m.auth.displayName} hint={m.auth.displayNameHint} required error={shown('n')} counter={`${name.length}/40`}>
                <TextInput id={`${id}-n`} autoComplete="nickname" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} disabled={!enabled} aria-invalid={!!shown('n')} aria-describedby={describedBy(`${id}-n`, true, shown('n'))} />
              </Field>
              <Field id={`${id}-e`} label={m.auth.email} required error={shown('e')}>
                <TextInput id={`${id}-e`} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!enabled} aria-invalid={!!shown('e')} aria-describedby={describedBy(`${id}-e`, null, shown('e'))} />
              </Field>
              <Field id={`${id}-p`} label={m.auth.password} hint={m.auth.passwordHint} required error={shown('p')}>
                <PasswordInput id={`${id}-p`} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={!enabled} aria-invalid={!!shown('p')} aria-describedby={describedBy(`${id}-p`, true, shown('p'))} />
              </Field>
              {password ? (
                <div className={s.strength} data-level={strength}>
                  <span className={s.strengthBar} aria-hidden="true"><i /><i /><i /></span>
                  <span>{f(m.auth.strength, { level: m.auth.strengthLevels[strength] })}</span>
                </div>
              ) : null}
              <Checkbox id={`${id}-a`} checked={accept} onChange={setAccept} required error={shown('a')}>
                {m.auth.accept} (<Link href="/privacy" target="_blank">{m.auth.privacyLink}</Link>)
              </Checkbox>
              <Button type="submit" variant="primary" block disabled={!enabled || busy} aria-busy={busy}>{busy ? m.common.loading : m.auth.signup}</Button>
            </form>
          </>
        )}
        <p className={s.links}>{m.auth.hasAccount} <Link href={`/login?next=${encodeURIComponent(next)}`}>{m.auth.loginLink}</Link></p>
        <ButtonLink href="/start" variant={enabled ? 'ghost' : 'primary'} small={enabled} block={!enabled} icon="play" className={s.demo}>{m.auth.tryDemo}</ButtonLink>
        <p className={s.fine}>{m.auth.note} · {m.auth.notVerification}</p>
      </div>
    </div>
  );
}
