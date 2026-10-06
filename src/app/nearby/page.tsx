import { Suspense } from 'react';
import { RequireRun } from '@/features/demo/RequireRun';
import { NearbyPage } from '@/features/nearby/NearbyPage';

export default function Page() {
  return (
    <Suspense>
      <RequireRun>
        <NearbyPage />
      </RequireRun>
    </Suspense>
  );
}
