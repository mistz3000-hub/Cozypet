import type { Reason, Species } from '@/lib/types';
import type { Messages } from '@/i18n';

type F = (t: string, p: Record<string, string | number>) => string;

/** แปลงเหตุผลจาก Smart Load Balancer เป็นข้อความ (ค่าตัวเลขมาจาก record จริง) */
export function reasonText(r: Reason, m: Messages, f: F): string {
  const p = { ...r.params } as Record<string, string | number>;
  if (typeof p.species === 'string' && (p.species === 'cat' || p.species === 'dog' || p.species === 'other')) {
    p.species = m.species[p.species as Species];
  }
  const tpl = m.reasons[r.code];
  return f(tpl, p);
}

type FactorKey = keyof Messages['why']['factor'];

export function factorLabel(key: string, m: Messages): string {
  return m.why.factor[key as FactorKey] ?? key;
}

/** ค่าดิบของปัจจัย (rawLabel จาก balancer) → ข้อความตามภาษา */
export function factorRawText(key: string, raw: string, m: Messages, f: F, locale: 'th' | 'en'): string {
  let value = raw;
  if (key === 'urgency' && (raw === 'normal' || raw === 'soon' || raw === 'emergency')) value = m.urgency[raw];
  if (key === 'history' && (raw === 'cat' || raw === 'dog' || raw === 'other')) value = m.species[raw];
  if (key === 'space' || key === 'crowding') value = raw.replace('/', locale === 'th' ? ' จาก ' : ' of ');
  const tpl = m.why.raw[key as FactorKey];
  return tpl ? f(tpl, { value }) : raw;
}
