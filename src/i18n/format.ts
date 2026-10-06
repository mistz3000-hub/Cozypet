import type { Locale, LocalizedText } from '@/lib/types';

/** แทนค่า {name} ในข้อความ */
export function format(template: string, params: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => (k in params ? String(params[k]) : `{${k}}`));
}

export function intlLocale(locale: Locale): string {
  return locale === 'th' ? 'th-TH' : 'en-GB';
}

/** วันที่แบบไทย พ.ศ. / en-GB เช่น “12 ส.ค. 2569” / “12 Aug 2026” */
export function formatDate(iso: string | Date, locale: Locale, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return new Intl.DateTimeFormat(intlLocale(locale), { timeZone: 'Asia/Bangkok', ...opts }).format(d);
}

export function formatTime(iso: string | Date, locale: Locale): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return new Intl.DateTimeFormat(intlLocale(locale), { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
}

export function formatDateTime(iso: string | Date, locale: Locale): string {
  return `${formatDate(iso, locale)} ${formatTime(iso, locale)}`;
}

/** เงินบาท — ต้องแสดงคู่กับป้าย “ราคาตัวอย่าง/ยอดจำลอง” เสมอ */
export function formatMoney(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale(locale), { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(amount);
}

export function formatNumber(n: number, locale: Locale, digits = 0): string {
  return new Intl.NumberFormat(intlLocale(locale), { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n);
}

export function localized(t: LocalizedText, locale: Locale): string {
  return t[locale];
}

/** อ่านค่าตาม path แบบ 'tour.nearby.assist.title' */
export function getByPath(obj: unknown, path: string): string | undefined {
  let cur: unknown = obj;
  for (const part of path.split('.')) {
    if (cur && typeof cur === 'object' && part in (cur as Record<string, unknown>)) cur = (cur as Record<string, unknown>)[part];
    else return undefined;
  }
  return typeof cur === 'string' ? cur : undefined;
}
