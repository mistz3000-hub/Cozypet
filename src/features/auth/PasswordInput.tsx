'use client';

import { useState, type InputHTMLAttributes } from 'react';
import { useI18n } from '@/i18n/provider';
import { TextInput } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import s from './auth.module.css';

export function PasswordInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { m } = useI18n();
  const [show, setShow] = useState(false);
  return (
    <div className={s.pwWrap}>
      <TextInput {...props} type={show ? 'text' : 'password'} />
      <button type="button" className={s.pwToggle} onClick={() => setShow((v) => !v)} aria-pressed={show} aria-label={show ? m.auth.hidePassword : m.auth.showPassword}>
        <Icon name={show ? 'eyeOff' : 'eye'} />
      </button>
    </div>
  );
}

/** ความแข็งแรงแบบง่าย: ยาว ≥ 8 + มีตัวอักษรและตัวเลข = พอใช้ · ≥ 12 หรือมีอักขระพิเศษ = แข็งแรง */
export function passwordStrength(p: string): 'weak' | 'fair' | 'strong' {
  const ok = p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p);
  if (!ok) return 'weak';
  return p.length >= 12 || /[^A-Za-z0-9]/.test(p) ? 'strong' : 'fair';
}
