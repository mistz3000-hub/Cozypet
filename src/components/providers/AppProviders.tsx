'use client';

import { useEffect, useState, type ReactNode } from 'react';
import type { Locale } from '@/lib/types';
import { I18nProvider } from '@/i18n/provider';
import { MotionProvider } from '@/lib/motion';
import { AuthProvider, type AuthState } from '@/features/auth/AuthContext';
import { setStorageMode } from '@/lib/storage';
import { sendState, updateProfileRemote } from '@/features/auth/sync-client';
import { AnnouncerProvider } from './Announcer';
import { ToastProvider } from './Toast';
import { TourLauncher } from '@/features/motion/tour/TourLauncher';
import { StorageNotice } from './StorageNotice';
import { AccountSync } from '@/features/auth/AccountSync';
import { CriticalNotice } from '@/features/business/CriticalNotice';

const TYPING_TYPES = new Set(['text', 'search', 'email', 'password', 'number', 'tel', 'url', 'textarea', 'datetime-local', 'date']);

export function AppProviders({ locale, auth, children }: { locale: Locale; auth: AuthState; children: ReactNode }) {
  // ตั้งโหมด storage ก่อน children อ่านค่า (บัญชี = cache แยกต่อบัญชี + ซิงก์)
  useState(() => {
    if (typeof window !== 'undefined') {
      setStorageMode(auth.user ? { mode: 'account', userId: auth.user.id } : { mode: 'guest' }, auth.user ? sendState : null);
    }
    return null;
  });

  useEffect(() => {
    setStorageMode(auth.user ? { mode: 'account', userId: auth.user.id } : { mode: 'guest' }, auth.user ? sendState : null);
  }, [auth.user]);

  // ซ่อน tab bar ขณะพิมพ์บนมือถือ (คีย์บอร์ดเปิด)
  useEffect(() => {
    const isTypingEl = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false;
      if (el.tagName === 'TEXTAREA') return true;
      return el.tagName === 'INPUT' && TYPING_TYPES.has((el as HTMLInputElement).type);
    };
    const onIn = (e: FocusEvent) => {
      if (window.matchMedia('(max-width: 767px)').matches && isTypingEl(e.target)) document.body.dataset.typing = 'true';
    };
    const onOut = () => {
      delete document.body.dataset.typing;
    };
    document.addEventListener('focusin', onIn);
    document.addEventListener('focusout', onOut);
    return () => {
      document.removeEventListener('focusin', onIn);
      document.removeEventListener('focusout', onOut);
    };
  }, []);

  return (
    <AuthProvider value={auth}>
      <I18nProvider initialLocale={locale} onLocaleChange={auth.user ? (l) => void updateProfileRemote({ locale: l }) : undefined}>
        <MotionProvider>
          <AnnouncerProvider>
            <ToastProvider>
              <StorageNotice />
              {auth.user ? <AccountSync /> : null}
              {children}
              <CriticalNotice/>
              <TourLauncher />
            </ToastProvider>
          </AnnouncerProvider>
        </MotionProvider>
      </I18nProvider>
    </AuthProvider>
  );
}
