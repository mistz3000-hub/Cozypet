import { Suspense } from 'react';
import { RequireRun } from '@/features/demo/RequireRun';
import { RequestForm } from '@/features/requests/RequestForm';

export default function Page() {
  return (
    <Suspense>
      <RequireRun>
        <RequestForm />
      </RequireRun>
    </Suspense>
  );
}
