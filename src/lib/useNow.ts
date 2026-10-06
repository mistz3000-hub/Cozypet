'use client';

import { useSyncExternalStore } from 'react';

/** เวลาปัจจุบันแบบ external store (อัปเดตทุก 1 วินาทีเมื่อมีผู้ใช้) — ใช้แทนการเรียก Date.now() ระหว่าง render */
let current = 0;
const subs = new Set<() => void>();
let timer: number | null = null;

function subscribe(cb: () => void) {
  subs.add(cb);
  if (timer === null) {
    current = Date.now();
    timer = window.setInterval(() => {
      current = Date.now();
      subs.forEach((s) => s());
    }, 1000);
  }
  return () => {
    subs.delete(cb);
    if (!subs.size && timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  };
}

function snapshot() {
  if (!current && typeof window !== 'undefined') current = Date.now();
  return current;
}

const idle = () => () => {};

/** `enabled = false` → ไม่ subscribe (ไม่ re-render ทุกวินาที) แต่ยังคืนค่าเวลาล่าสุดที่รู้ */
export function useNow(enabled = true): number {
  return useSyncExternalStore(enabled ? subscribe : idle, snapshot, () => 0);
}
