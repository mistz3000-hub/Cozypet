'use client';
/** ส่งข้อมูลบัญชีขึ้น server (เฉพาะเมื่อเข้าสู่ระบบ) — ไม่ log เนื้อหา */
import type { StoreKey } from '@/lib/storage';
import type { Locale, MascotKind } from '@/lib/types';

export async function sendState(key: StoreKey, value: unknown): Promise<boolean> {
  try {
    const res = await fetch('/api/state', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value }) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchRemoteState(): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch('/api/state', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as { state?: Record<string, unknown> };
    return data.state ?? {};
  } catch {
    return null;
  }
}

export async function updateProfileRemote(patch: { locale?: Locale; runNumber?: number | null; mascot?: MascotKind; displayName?: string;accountRole?:'supporter'|'shelter' }): Promise<boolean> {
  try {
    const res = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) });
    return res.ok;
  } catch {
    return false;
  }
}
