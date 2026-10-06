import type { Locale } from '@/lib/types';
import { th } from './th';
import { en } from './en';
import type { Messages } from './types';

export type { Messages };
export const MESSAGES: Record<Locale, Messages> = { th, en };
export const LOCALE_COOKIE = 'cozypet_locale';

export function isLocale(v: unknown): v is Locale {
  return v === 'th' || v === 'en';
}

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale] ?? th;
}

export * from './format';
