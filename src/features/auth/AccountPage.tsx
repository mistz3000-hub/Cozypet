'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useId, useState } from 'react';
import { useI18n } from '@/i18n/provider';
import type { Locale } from '@/lib/types';
import * as storage from '@/lib/storage';
import { useStorageStatus } from '@/lib/store';
import { useToast } from '@/components/providers/Toast';
import { Badge, Card, Notice } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Checkbox, Field, Segmented, TextInput } from '@/components/ui/Field';
import { Dialog } from '@/components/ui/Dialog';
import { useAuth } from './AuthContext';
import { updateProfileRemote } from './sync-client';
import { PasswordInput, passwordStrength } from './PasswordInput';
import s from './auth.module.css';
import { RoleChooser } from '@/features/shelters/RoleChooser';

export function AccountPage() {
  const { m, f, time, locale, setLocale } = useI18n();
  const { user, enabled } = useAuth();
  const toast = useToast();
  const params = useSearchParams();
  const router = useRouter();
  const status = useStorageStatus();
  const id = useId();
  const [name, setName] = useState(user?.displayName ?? '');
  const [clearLocal, setClearLocal] = useState(true);
  const [del, setDel] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [busy, setBusy] = useState(false);
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);

  if (!user) {
    return (
      <div className={`cp-container cp-page ${s.page}`}>
        <div className={s.card}>
          <h1 className={s.title}>{m.auth.accountTitle}</h1>
          <p>{m.auth.notLoggedIn}</p>
          {!enabled ? <Notice tone="butter" icon="info">{m.auth.disabled}</Notice> : null}
          <ButtonLink href="/login?next=/account" variant="primary" block icon="login">{m.auth.login}</ButtonLink>
          <ButtonLink href="/start" variant="ghost" small icon="play" className={s.demo}>{m.auth.tryDemo}</ButtonLink>
        </div>
      </div>
    );
  }

  const saveName = async () => {
    const v = name.trim();
    if (!v || v.length > 40) {
      setErr(m.auth.errName);
      return;
    }
    setErr(null);
    const ok = await updateProfileRemote({ displayName: v });
    toast(ok ? m.auth.nameSaved : m.auth.saveFailed);
  };

  const logout = async () => {
    setBusy(true);
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null);
    if (clearLocal) storage.clearAccountCache(user.id);
    toast(m.auth.loggedOut);
    router.replace('/');
    router.refresh();
  };

  const deleteAccount = async () => {
    setBusy(true);
    const res = await fetch('/api/account', { method: 'DELETE' }).catch(() => null);
    if (res?.ok) {
      storage.clearAccountCache(user.id);
      toast(m.auth.deleted);
      router.replace('/');
      router.refresh();
      return;
    }
    setBusy(false);
    setErr(m.auth.errUnavailable);
  };

  const savePassword = async () => {
    if (passwordStrength(pw) === 'weak') {
      setErr(m.auth.errWeak);
      return;
    }
    const res = await fetch('/api/auth/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw }) }).catch(() => null);
    setPw('');
    toast(res?.ok ? m.auth.passwordSaved : m.auth.saveFailed);
  };

  const syncText = status.sync.state === 'pending' ? m.auth.syncPending
    : status.sync.state === 'error' ? m.auth.syncError
      : status.sync.at ? f(m.auth.synced, { time: time(status.sync.at) }) : m.auth.syncIdle;

  return (
    <div className={`cp-container cp-page ${s.wide}`}>
      <h1>{m.auth.accountTitle}</h1>
      <RoleChooser/>
      {err ? <Notice tone="error" icon="alert" role="alert">{err}</Notice> : null}

      <Card className={s.section}>
        <Field id={`${id}-n`} label={m.auth.displayName} hint={m.auth.displayNameHint} counter={`${name.length}/40`}>
          <TextInput id={`${id}-n`} maxLength={40} value={name} onChange={(e) => setName(e.target.value)} aria-describedby={`${id}-n-hint`} />
        </Field>
        <Button icon="check" onClick={() => void saveName()}>{m.auth.saveName}</Button>
        <dl className={s.facts}>
          <div><dt>{m.auth.emailLabel}</dt><dd>{user.emailMasked}</dd></div>
          <div><dt>{m.auth.providersLabel}</dt><dd>{user.providers.map((p) => <Badge key={p} tone="neutral">{p === 'google' ? m.auth.provider.google : m.auth.provider.email}</Badge>)}</dd></div>
        </dl>
        <Segmented<Locale> name={`${id}-l`} label={m.auth.languageLabel} value={locale} onChange={setLocale} options={[{ value: 'th', label: m.locale.th }, { value: 'en', label: m.locale.en }]} />
        <p className={s.fine}>{m.auth.notVerification}</p>
      </Card>

      <Card className={s.section}>
        <h2 className={s.h2}>{m.auth.sync}</h2>
        <p className={s.syncLine} data-state={status.sync.state}>{syncText}</p>
        {status.sync.state === 'error' ? <Button small icon="refresh" onClick={() => void storage.syncAllNow()}>{m.auth.syncRetry}</Button> : null}
        <a className={s.download} href="/api/account/export" download>{m.auth.download}</a>
      </Card>

      {user.providers.includes('email') ? (
        <Card className={s.section}>
          <h2 className={s.h2}>{m.auth.newPassword}</h2>
          {params.get('reset') === '1' ? <Notice tone="info" icon="info">{m.auth.passwordHint}</Notice> : null}
          <Field id={`${id}-pw`} label={m.auth.password} hint={m.auth.passwordHint}>
            <PasswordInput id={`${id}-pw`} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} aria-describedby={`${id}-pw-hint`} />
          </Field>
          <Button icon="check" onClick={() => void savePassword()} disabled={!pw}>{m.auth.newPassword}</Button>
        </Card>
      ) : null}

      <Card className={s.section} id="logout">
        <h2 className={s.h2}>{m.auth.logout}</h2>
        <Checkbox checked={clearLocal} onChange={setClearLocal}>{m.auth.logoutClear}</Checkbox>
        <Button icon="logout" onClick={() => void logout()} disabled={busy}>{m.auth.logout}</Button>
      </Card>

      <Card className={`${s.section} ${s.danger}`}>
        <h2 className={s.h2}>{m.auth.deleteTitle}</h2>
        <p>{m.auth.deleteText}</p>
        <Button variant="danger" icon="trash" onClick={() => setDel(true)}>{m.auth.deleteTitle}</Button>
      </Card>
      <p className={s.fine}><Link href="/privacy">{m.auth.privacyLink}</Link></p>

      <Dialog
        open={del}
        onClose={() => { setDel(false); setConfirmText(''); }}
        title={m.auth.deleteTitle}
        size="sm"
        footer={(
          <>
            <Button onClick={() => { setDel(false); setConfirmText(''); }} data-autofocus>{m.common.cancel}</Button>
            <Button variant="danger" icon="trash" disabled={confirmText.trim() !== m.auth.deleteWord || busy} onClick={() => void deleteAccount()}>{m.auth.deleteDo}</Button>
          </>
        )}
      >
        <p>{m.auth.deleteText}</p>
        <Field id={`${id}-del`} label={f(m.auth.deleteType, { word: m.auth.deleteWord })}>
          <TextInput id={`${id}-del`} value={confirmText} onChange={(e) => setConfirmText(e.target.value)} autoComplete="off" />
        </Field>
      </Dialog>
    </div>
  );
}
