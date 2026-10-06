'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Locale, LocalizedText } from '@/lib/types';
import { getMessages, LOCALE_COOKIE, type Messages } from './index';
import { format, formatDate, formatDateTime, formatMoney, formatNumber, formatTime, getByPath } from './format';
import { updateValue } from '@/lib/store';
import { getDistrict } from '@/data/districts';

interface I18nValue {
  locale: Locale;
  m: Messages;
  t: (path: string, params?: Record<string, string | number>) => string;
  f: typeof format;
  date: (iso: string | Date) => string;
  time: (iso: string | Date) => string;
  dateTime: (iso: string | Date) => string;
  money: (n: number) => string;
  num: (n: number, digits?: number) => string;
  loc: (t: LocalizedText) => string;
  district: (id: string | undefined | null) => string;
  setLocale: (l: Locale) => void;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ initialLocale, onLocaleChange, children }: { initialLocale: Locale; onLocaleChange?: (l: Locale) => void; children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      /* ignore */
    }
    updateValue('demoSession', (prev) => ({ ...prev, locale: l, updatedAt: new Date().toISOString() }));
    onLocaleChange?.(l);
  }, [onLocaleChange]);

  const value = useMemo<I18nValue>(() => {
    const m = getMessages(locale);
    return {
      locale,
      m,
      t: (path, params) => format(getByPath(m, path) ?? path, params),
      f: format,
      date: (iso) => formatDate(iso, locale),
      time: (iso) => formatTime(iso, locale),
      dateTime: (iso) => formatDateTime(iso, locale),
      money: (n) => formatMoney(n, locale),
      num: (n, d) => formatNumber(n, locale, d),
      loc: (t) => t[locale],
      district: (id) => {
        const d = id ? getDistrict(id) : undefined;
        return d ? (locale === 'en' ? d.nameEn : d.nameTh) : '';
      },
      setLocale,
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
