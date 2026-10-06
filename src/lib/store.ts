'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { DemoSession, TourState } from './types';
import * as storage from './storage';
import type { StoreKey, StoreShape } from './storage';

export function defaultDemoSession(): DemoSession {
  const now = new Date().toISOString();
  return { runNumber: null, mascot: 'cat', findingIndexByRun: {}, chatMode: 'auto', soundEnabled: false, locale: 'th', startedAt: now, updatedAt: now };
}

const EMPTY_TOUR: TourState = { dismissedHint: false, completedPages: [], updatedAt: '1970-01-01T00:00:00.000Z' };

const DEFAULTS: { [K in StoreKey]: () => StoreShape[K] } = {
  demoSession: defaultDemoSession,
  findingSessions: () => [],
  userListings: () => [],
  careRequests: () => [],
  conversations: () => [],
  handoffs: () => [],
  saved: () => [],
  noticeDismissed: () => ({}),
  donationOrders: () => [],
  caretakerPlace: () => [],
  searchHistory: () => [],
  tourState: () => EMPTY_TOUR,
};

// ค่า default ต้องคงที่ต่อ key เพื่อไม่ให้ useSyncExternalStore วนซ้ำ
const defaultCache = new Map<StoreKey, unknown>();
function stableDefault<K extends StoreKey>(key: K): StoreShape[K] {
  if (!defaultCache.has(key)) defaultCache.set(key, DEFAULTS[key]());
  return defaultCache.get(key) as StoreShape[K];
}

export function getValue<K extends StoreKey>(key: K): StoreShape[K] {
  return storage.read(key) ?? stableDefault(key);
}

export function setValue<K extends StoreKey>(key: K, value: StoreShape[K]): storage.WriteResult {
  return storage.write(key, value);
}

export function updateValue<K extends StoreKey>(key: K, fn: (prev: StoreShape[K]) => StoreShape[K]): storage.WriteResult {
  return storage.write(key, fn(getValue(key)));
}

/** ค่าจาก storage (undefined ฝั่ง server → ใช้ค่า default) */
export function useStore<K extends StoreKey>(key: K): StoreShape[K] {
  return useSyncExternalStore(
    storage.subscribe,
    () => getValue(key),
    () => stableDefault(key),
  );
}

const noopSubscribe = () => () => {};
/** true เมื่อ render ฝั่ง client แล้ว (กัน hydration mismatch ของข้อมูลใน localStorage) */
export function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

export function useStorageStatus(): storage.StorageStatus {
  return useSyncExternalStore(storage.subscribeStatus, storage.getStatus, storage.getStatus);
}

export function useDemoSession(): [DemoSession, (patch: Partial<DemoSession>) => storage.WriteResult] {
  const session = useStore('demoSession');
  const update = useCallback(
    (patch: Partial<DemoSession>) => updateValue('demoSession', (prev) => ({ ...prev, ...patch, updatedAt: new Date().toISOString() })),
    [],
  );
  return [session, update];
}

export function newId(prefix: string): string {
  const uuid = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.floor(performance.now() * 1000).toString(36)}`;
  return `${prefix}-${uuid}`;
}

/** รวมรายการตาม id (id ซ้ำใช้ updatedAt/createdAt ที่ใหม่กว่า) — ใช้ตอนย้ายข้อมูลโหมดทดลองเข้าบัญชี */
export function mergeById<T extends { id: string; updatedAt?: string; createdAt?: string }>(a: readonly T[], b: readonly T[]): T[] {
  const map = new Map<string, T>();
  for (const item of [...a, ...b]) {
    const prev = map.get(item.id);
    const ts = (x: T) => x.updatedAt ?? x.createdAt ?? '';
    if (!prev || ts(item) > ts(prev)) map.set(item.id, item);
  }
  return [...map.values()];
}
