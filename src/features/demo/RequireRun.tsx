'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import type { FindingSession } from '@/lib/types';
import { buildFindingSession } from '@/lib/run';
import { useDemoSession, useHydrated, useStore } from '@/lib/store';
import { Skeleton } from '@/components/ui/Badge';

/** หน้าที่ต้องมี RUN_NUMBER: ถ้ายังไม่มี → /start?next=<route เดิม> (PROMPT.md 4) */
export function RequireRun({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const [session] = useDemoSession();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const missing = hydrated && session.runNumber === null;
  useEffect(() => {
    if (!missing) return;
    const q = params.toString();
    router.replace(`/start?next=${encodeURIComponent(pathname + (q ? `?${q}` : ''))}`);
  }, [missing, params, pathname, router]);
  if (!hydrated || missing) {
    return (
      <div className="cp-container cp-page" aria-busy="true">
        <Skeleton height={36} width="60%" />
        <div style={{ height: 16 }} />
        <Skeleton height={180} />
      </div>
    );
  }
  return <>{children}</>;
}

export { safeNext } from '@/lib/safe-next';

export function useRun(): { run: number; finding: number } | null {
  const hydrated = useHydrated();
  const [session] = useDemoSession();
  if (!hydrated || session.runNumber === null) return null;
  const key = String(session.runNumber).padStart(3, '0');
  return { run: session.runNumber, finding: session.findingIndexByRun[key] ?? 1 };
}

/** รอบค้นหาปัจจุบันของ Run (ถ้ายังไม่เคยสร้าง ใช้ค่าที่คำนวณได้แบบ deterministic) */
export function useCurrentFinding(): FindingSession | null {
  const run = useRun();
  const sessions = useStore('findingSessions');
  if (!run) return null;
  return sessions.find((x) => x.runNumber === run.run && x.findingIndex === run.finding)
    ?? buildFindingSession(run.run, run.finding, 'run_seed', undefined, '');
}
