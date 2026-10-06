import { Suspense } from 'react';
import { RequireRun } from '@/features/demo/RequireRun';
import { ScanPage } from '@/features/scan/ScanPage';

export default function Page() {
  return (
    <Suspense>
      <RequireRun>
        <ScanPage />
      </RequireRun>
    </Suspense>
  );
}
