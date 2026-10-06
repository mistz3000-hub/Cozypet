import { Suspense } from 'react';
import { RequireRun } from '@/features/demo/RequireRun';
import { DonatePage } from '@/features/donate/DonatePage';

export default function Page() {
  return (
    <Suspense>
      <RequireRun>
        <DonatePage />
      </RequireRun>
    </Suspense>
  );
}
