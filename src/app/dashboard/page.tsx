import { Suspense } from 'react';
import { RequireRun } from '@/features/demo/RequireRun';
import { DashboardPage } from '@/features/dashboard/DashboardPage';

export default function Page() {
  return (
    <Suspense>
      <RequireRun>
        <DashboardPage />
      </RequireRun>
    </Suspense>
  );
}
