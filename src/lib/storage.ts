/**
 * storage adapter (PROMPT.md 10.5, D13) — อ่าน/เขียนผ่าน module นี้เท่านั้น ครอบ try/catch ทุกครั้ง
 * - โหมดทดลอง: localStorage `cozypet:v1:<key>`
 * - บัญชี: cache ในเครื่อง `cozypet:v1:acct:<userId>:<key>` + ส่งขึ้นบัญชีแบบ debounce 800ms (ผ่าน /api/state)
 * - ถ้า localStorage ใช้ไม่ได้ → เก็บในหน่วยความจำของหน้าปัจจุบันและแจ้งผู้ใช้ว่าจะไม่บันทึก
 */
import type {
  CaretakerPlace, CareRequest, Conversation, DemoSession, DonationOrder, FindingSession, Handoff, PetListing,
  SavedItem, SearchHistoryEntry, TourState, BusinessState,
} from './types';

export interface StoreShape {
  demoSession: DemoSession;
  findingSessions: FindingSession[];
  userListings: PetListing[];
  careRequests: CareRequest[];
  conversations: Conversation[];
  handoffs: Handoff[];
  saved: SavedItem[];
  noticeDismissed: Record<string, boolean>;
  donationOrders: DonationOrder[];
  caretakerPlace: CaretakerPlace[];
  searchHistory: SearchHistoryEntry[];
  tourState: TourState;
  businessState: BusinessState;
}
export type StoreKey = keyof StoreShape;

export const STORE_KEYS: readonly StoreKey[] = [
  'demoSession', 'findingSessions', 'userListings', 'careRequests', 'conversations', 'handoffs', 'saved',
  'noticeDismissed', 'donationOrders', 'caretakerPlace', 'searchHistory', 'tourState', 'businessState',
];
/** key ที่อยู่ในเครื่องเท่านั้น ไม่ซิงก์ขึ้นบัญชี */
export const LOCAL_ONLY_KEYS: ReadonlySet<StoreKey> = new Set(['noticeDismissed', 'tourState', 'businessState']);
export const SYNC_KEYS: readonly StoreKey[] = STORE_KEYS.filter((k) => !LOCAL_ONLY_KEYS.has(k));
export const MAX_SYNC_BYTES = 256 * 1024;

export type StorageMode = { mode: 'guest' } | { mode: 'account'; userId: string };

export interface StorageStatus {
  persistent: boolean;
  lastError: null | 'quota' | 'parse' | 'too_large';
  sync: { state: 'idle' | 'pending' | 'synced' | 'error'; at: string | null };
}

const ROOT = 'cozypet:v1:';
let mode: StorageMode = { mode: 'guest' };
let persistent = true;
let probed = false;
const memory = new Map<string, string>();
const cache = new Map<string, unknown>();
const listeners = new Set<() => void>();
let status: StorageStatus = { persistent: true, lastError: null, sync: { state: 'idle', at: null } };
const statusListeners = new Set<() => void>();

type SyncSender = (key: StoreKey, value: unknown) => Promise<boolean>;
let syncSender: SyncSender | null = null;
const syncTimers = new Map<StoreKey, ReturnType<typeof setTimeout>>();

function setStatus(patch: Partial<StorageStatus>) {
  status = { ...status, ...patch };
  statusListeners.forEach((l) => l());
}

function probe() {
  if (probed || typeof window === 'undefined') return;
  probed = true;
  try {
    const k = `${ROOT}__probe`;
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    persistent = true;
  } catch {
    persistent = false;
    setStatus({ persistent: false });
  }
  window.addEventListener('storage', (e) => {
    if (!e.key || !e.key.startsWith(ROOT)) return;
    cache.clear();
    listeners.forEach((l) => l());
  });
}

export function prefix(): string {
  return mode.mode === 'account' ? `${ROOT}acct:${mode.userId}:` : ROOT;
}

export function fullKey(key: StoreKey): string {
  return `${prefix()}${key}`;
}

function rawGet(k: string): string | null {
  probe();
  if (!persistent) return memory.get(k) ?? null;
  try {
    return window.localStorage.getItem(k);
  } catch {
    return memory.get(k) ?? null;
  }
}

function rawSet(k: string, v: string): 'ok' | 'quota' | 'unavailable' {
  probe();
  if (!persistent) {
    memory.set(k, v);
    return 'unavailable';
  }
  try {
    window.localStorage.setItem(k, v);
    return 'ok';
  } catch {
    return 'quota';
  }
}

function rawRemove(k: string) {
  memory.delete(k);
  if (!persistent) return;
  try {
    window.localStorage.removeItem(k);
  } catch {
    /* ignore */
  }
}

export function getStorageMode(): StorageMode {
  return mode;
}

export function setStorageMode(next: StorageMode, sender?: SyncSender | null) {
  const changed = JSON.stringify(next) !== JSON.stringify(mode);
  mode = next;
  syncSender = next.mode === 'account' ? sender ?? syncSender : null;
  if (changed) {
    cache.clear();
    listeners.forEach((l) => l());
  }
}

export function read<K extends StoreKey>(key: K): StoreShape[K] | undefined {
  if (typeof window === 'undefined') return undefined;
  const fk = fullKey(key);
  if (cache.has(fk)) return cache.get(fk) as StoreShape[K];
  const raw = rawGet(fk);
  if (raw === null) {
    cache.set(fk, undefined);
    return undefined;
  }
  try {
    const parsed = JSON.parse(raw) as StoreShape[K];
    cache.set(fk, parsed);
    return parsed;
  } catch {
    // parse ไม่ได้ → รีเซ็ตเฉพาะ key นั้นและแจ้งผู้ใช้
    rawRemove(fk);
    cache.set(fk, undefined);
    setStatus({ lastError: 'parse' });
    return undefined;
  }
}

export type WriteResult = 'ok' | 'quota' | 'memory';

export function write<K extends StoreKey>(key: K, value: StoreShape[K], opts: { silentSync?: boolean } = {}): WriteResult {
  const fk = fullKey(key);
  const json = JSON.stringify(value);
  const r = rawSet(fk, json);
  if (r === 'quota') {
    setStatus({ lastError: 'quota' });
    return 'quota';
  }
  cache.set(fk, value);
  listeners.forEach((l) => l());
  if (!opts.silentSync) scheduleSync(key, value);
  return r === 'ok' ? 'ok' : 'memory';
}

export function remove(key: StoreKey) {
  const fk = fullKey(key);
  rawRemove(fk);
  cache.set(fk, undefined);
  listeners.forEach((l) => l());
}

/** ลบทุก key `cozypet:v1:*` ของโหมด/บัญชีปัจจุบัน */
export function clearAll() {
  for (const k of STORE_KEYS) remove(k);
}

export function keys(): StoreKey[] {
  return STORE_KEYS.filter((k) => rawGet(fullKey(k)) !== null);
}

export function subscribe(cb: () => void): () => void {
  probe();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getStatus(): StorageStatus {
  probe();
  return status;
}
export function subscribeStatus(cb: () => void): () => void {
  statusListeners.add(cb);
  return () => statusListeners.delete(cb);
}
export function clearStatusError() {
  setStatus({ lastError: null });
}

/** ตัดรูป data URL ออกก่อนส่งขึ้น server (ไม่อัปโหลดรูป) */
export function stripPhotos<T>(value: T): T {
  return JSON.parse(JSON.stringify(value, (k, v) => (k === 'src' && typeof v === 'string' && v.startsWith('data:') ? 'local-only' : v))) as T;
}

function scheduleSync(key: StoreKey, value: unknown) {
  if (mode.mode !== 'account' || !syncSender || LOCAL_ONLY_KEYS.has(key)) return;
  const prev = syncTimers.get(key);
  if (prev) clearTimeout(prev);
  setStatus({ sync: { ...status.sync, state: 'pending' } });
  syncTimers.set(key, setTimeout(async () => {
    syncTimers.delete(key);
    const payload = stripPhotos(value);
    if (JSON.stringify(payload).length > MAX_SYNC_BYTES) {
      setStatus({ lastError: 'too_large' });
      return;
    }
    const ok = await syncSender!(key, payload).catch(() => false);
    setStatus({ sync: { state: ok ? 'synced' : 'error', at: ok ? new Date().toISOString() : status.sync.at } });
  }, 800));
}

/** ส่งทุก key ขึ้นใหม่ (ปุ่ม “ลองใหม่”) */
export async function syncAllNow(): Promise<boolean> {
  if (mode.mode !== 'account' || !syncSender) return false;
  let ok = true;
  for (const k of SYNC_KEYS) {
    const v = read(k);
    if (v === undefined) continue;
    ok = (await syncSender(k, stripPhotos(v)).catch(() => false)) && ok;
  }
  setStatus({ sync: { state: ok ? 'synced' : 'error', at: ok ? new Date().toISOString() : status.sync.at } });
  return ok;
}

/** อ่านข้อมูลโหมดทดลองโดยตรง (ใช้ตอนย้ายข้อมูลเข้าบัญชี) */
export function readGuest<K extends StoreKey>(key: K): StoreShape[K] | undefined {
  const raw = rawGet(`${ROOT}${key}`);
  if (raw === null) return undefined;
  try {
    return JSON.parse(raw) as StoreShape[K];
  } catch {
    return undefined;
  }
}
export function removeGuest(key: StoreKey) {
  rawRemove(`${ROOT}${key}`);
}
/** ลบ cache ของบัญชีในเครื่องนี้ (ตัวเลือกตอนออกจากระบบ) */
export function clearAccountCache(userId: string) {
  for (const k of STORE_KEYS) rawRemove(`${ROOT}acct:${userId}:${k}`);
  cache.clear();
}
