'use client';

import { Component, type ReactNode } from 'react';
import type { MascotKind } from '@/lib/types';
import { useI18n } from '@/i18n/provider';
import s from './mascot.module.css';

/** ภาพนิ่ง fallback (ใช้ก่อน hydrate, เมื่อ component error หรือ asset โหลดไม่ได้) */
export function MascotStatic({ kind, emptyTable }: { kind: MascotKind; emptyTable?: boolean }) {
  const { m } = useI18n();
  if (emptyTable) {
    return (
      <div className={s.stage} aria-hidden="true">
        <span className={s.blob} />
        <svg viewBox="0 0 400 320" className={s.static}>
          <rect x="0" y="236" width="400" height="84" rx="10" fill="#D9B98C" />
          <rect x="0" y="236" width="400" height="16" rx="8" fill="#E8CFA6" />
        </svg>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={s.static} src={`/mascot/${kind}-static.svg`} alt={kind === 'dog' ? m.mascot.altDog : m.mascot.altCat} width={400} height={320} />
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
