/**
 * รวมข้อมูลทดลอง 2 ชุด (บัญชี ↔ เครื่อง / โหมดทดลอง → บัญชี) — PROMPT.md 7.9
 * รายการ: ใช้ id เป็นหลัก id ซ้ำใช้ updatedAt/createdAt ที่ใหม่กว่า · demoSession: ใช้อันที่ updatedAt ใหม่กว่า แต่ไม่ทิ้ง Run
 * pure function (มี unit test)
 */
import type { StoreKey, StoreShape } from '@/lib/storage';
import type { DemoSession } from '@/lib/types';

type Stamped = { updatedAt?: string; createdAt?: string; savedAt?: string; at?: string };

function stamp(x: Stamped): string {
  return x.updatedAt ?? x.createdAt ?? x.savedAt ?? x.at ?? '';
}

function keyOf(x: unknown): string {
  const o = x as { id?: string; kind?: string; at?: string };
  if (o.id && o.kind) return `${o.kind}:${o.id}`;
  return o.id ?? o.at ?? JSON.stringify(x);
}

export function mergeList<T>(a: readonly T[], b: readonly T[]): T[] {
  const map = new Map<string, T>();
  for (const item of [...a, ...b]) {
    const k = keyOf(item);
    const prev = map.get(k);
    if (!prev || stamp(item as Stamped) > stamp(prev as Stamped)) map.set(k, item);
  }
  return [...map.values()];
}

export function mergeSession(a: DemoSession, b: DemoSession): DemoSession {
  const [newer, older] = (a.updatedAt ?? '') >= (b.updatedAt ?? '') ? [a, b] : [b, a];
  return {
    ...newer,
    runNumber: newer.runNumber ?? older.runNumber,
    findingIndexByRun: { ...older.findingIndexByRun, ...newer.findingIndexByRun },
  };
}

export function mergeValue<K extends StoreKey>(key: K, a: StoreShape[K] | undefined, b: StoreShape[K] | undefined): StoreShape[K] | undefined {
  if (a === undefined) return b;
  if (b === undefined) return a;
  if (key === 'demoSession') return mergeSession(a as DemoSession, b as DemoSession) as StoreShape[K];
  if (Array.isArray(a) && Array.isArray(b)) return mergeList(a, b) as StoreShape[K];
  return b;
}

/** มีข้อมูลโหมดทดลองที่ควรถามว่าจะย้ายไหม */
export function hasMeaningfulData(key: StoreKey, v: unknown): boolean {
  if (v === undefined || v === null) return false;
  if (key === 'demoSession') return (v as DemoSession).runNumber !== null;
  return Array.isArray(v) && v.length > 0;
}
