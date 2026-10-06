'use client';

import type { StatusLevel, SupplyLevel } from '@/lib/types';
import { useI18n } from '@/i18n/provider';
import s from './ui.module.css';

/** รูปทรงสถานะ (ตรงกับหมุดบนแผนที่): รับได้ = วงกลมมีถูก · ใกล้เต็ม = วงกลมเติมครึ่ง · เต็ม = วงกลมมีขีดขวาง */
export function StatusShape({ level, size = 14 }: { level: StatusLevel; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
      {level === 'open' && <path d="M4.8 8.3l2.2 2.2 4.2-4.4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
      {level === 'tight' && <path d="M8 1.5a6.5 6.5 0 0 1 0 13z" fill="currentColor" />}
      {level === 'full' && <path d="M3.5 12.5l9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
    </svg>
  );
}

export function StatusBadge({ level, closed, demo }: { level: StatusLevel; closed?: boolean; demo?: boolean }) {
  const { m } = useI18n();
  const label = closed ? m.status.closed : m.status[level];
  return (
    <span className={[s.badge, s[`b-${level}`]].join(' ')}>
      <StatusShape level={level} />
      {label}
      {demo ? <span className="visually-hidden"> ({m.common.demoFigures})</span> : null}
    </span>
  );
}

const SUPPLY_TO_STATUS: Record<SupplyLevel, StatusLevel> = { ok: 'open', low: 'tight', critical: 'full' };

export function SupplyBadge({ level }: { level: SupplyLevel }) {
  const { m } = useI18n();
  const st = SUPPLY_TO_STATUS[level];
  return (
    <span className={[s.badge, s[`b-${st}`]].join(' ')}>
      <StatusShape level={st} />
      {m.supply[level]}
    </span>
  );
}
