import { describe, expect, it } from 'vitest';
import { hasMeaningfulData, mergeList, mergeSession, mergeValue } from '@/features/auth/merge-state';
import { safeNext } from '@/lib/safe-next';
import type { DemoSession } from '@/lib/types';

const session = (p: Partial<DemoSession>): DemoSession => ({
  runNumber: null, mascot: 'cat', findingIndexByRun: {}, chatMode: 'auto', soundEnabled: false, locale: 'th',
  startedAt: '2026-10-01T00:00:00Z', updatedAt: '2026-10-01T00:00:00Z', ...p,
});

describe('safeNext (กัน open redirect)', () => {
  it('รับเฉพาะ path ภายใน', () => {
    expect(safeNext('/nearby?x=1')).toBe('/nearby?x=1');
    expect(safeNext('//evil.com', '/dashboard')).toBe('/dashboard');
    expect(safeNext('/\\evil.com', '/dashboard')).toBe('/dashboard');
    expect(safeNext('https://evil.com', '/dashboard')).toBe('/dashboard');
    expect(safeNext(null, '/dashboard')).toBe('/dashboard');
  });
});

describe('merge-state (ย้ายข้อมูลโหมดทดลองเข้าบัญชี)', () => {
  it('รวมตาม id และใช้ updatedAt ที่ใหม่กว่า', () => {
    const a = [{ id: 'x', updatedAt: '2026-10-02', v: 1 }, { id: 'y', updatedAt: '2026-10-01', v: 1 }];
    const b = [{ id: 'x', updatedAt: '2026-10-01', v: 2 }, { id: 'z', updatedAt: '2026-10-03', v: 2 }];
    const r = mergeList(a, b);
    expect(r.map((x) => `${x.id}:${x.v}`).sort()).toEqual(['x:1', 'y:1', 'z:2']);
  });
  it('saved แยกตาม kind+id และ searchHistory ใช้เวลาเป็น key', () => {
    const saved = mergeList([{ kind: 'listing', id: '1', savedAt: 'a' }], [{ kind: 'helper', id: '1', savedAt: 'b' }]);
    expect(saved).toHaveLength(2);
    const hist = mergeList([{ at: '2026-10-01T01:00:00Z' }], [{ at: '2026-10-01T01:00:00Z' }, { at: '2026-10-01T02:00:00Z' }]);
    expect(hist).toHaveLength(2);
  });
  it('demoSession ไม่ทิ้ง Run และรวมรอบค้นหา', () => {
    const local = session({ runNumber: 42, findingIndexByRun: { '042': 2 }, updatedAt: '2026-10-01T00:00:00Z' });
    const remote = session({ runNumber: null, findingIndexByRun: { '007': 1 }, updatedAt: '2026-10-05T00:00:00Z', locale: 'en' });
    const r = mergeSession(local, remote);
    expect(r.runNumber).toBe(42);
    expect(r.locale).toBe('en');
    expect(r.findingIndexByRun).toEqual({ '042': 2, '007': 1 });
  });
  it('ค่าเดียวฝั่งเดียวคืนค่านั้น และตรวจข้อมูลที่ควรถามย้าย', () => {
    expect(mergeValue('userListings', undefined, [])).toEqual([]);
    expect(hasMeaningfulData('userListings', [])).toBe(false);
    expect(hasMeaningfulData('careRequests', [{ id: 'r' }])).toBe(true);
    expect(hasMeaningfulData('demoSession', session({ runNumber: 5 }))).toBe(true);
    expect(hasMeaningfulData('demoSession', session({}))).toBe(false);
  });
});
