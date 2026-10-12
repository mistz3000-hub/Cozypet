'use client';

import { Component, type ReactNode } from 'react';
import type { MascotKind } from '@/lib/types';
import { useI18n } from '@/i18n/provider';
import { MascotArt } from './MascotArt';
import s from './mascot.module.css';

/** ภาพนิ่ง fallback (ใช้ก่อน hydrate, เมื่อ component error หรือ asset โหลดไม่ได้) */
export function MascotStatic({ kind, emptyTable }: { kind: MascotKind; emptyTable?: boolean }) {
  const { m } = useI18n();
  if (emptyTable) {
    return (
      <div className={s.stage} aria-hidden="true">
        <span className={s.blob} />
        <svg viewBox="0 0 400 320" className={s.static}>
          <rect x="0" y={kind === 'cat' ? 262 : 236} width="400" height={kind === 'cat' ? 58 : 84} rx="10" fill="var(--cp-table-wood)" />
          <rect x="0" y={kind === 'cat' ? 262 : 236} width="400" height="14" rx="8" fill="var(--cp-table-edge)" />
        </svg>
      </div>
    );
  }
  return (
    <div className={s.stage} role="img" aria-label={kind === 'dog' ? m.mascot.altDog : m.mascot.altCat}>
      <span className={s.blob} aria-hidden="true" />
      <div className={s.art} aria-hidden="true"><MascotArt kind={kind} /></div>
    </div>
  );
}

interface Props { kind: MascotKind; children: ReactNode }
export class MascotErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    /* แสดงภาพนิ่งแทน ไม่ log รายละเอียด */
  }
  render() {
    if (this.state.failed) return <MascotStatic kind={this.props.kind} />;
    return this.props.children;
  }
}
