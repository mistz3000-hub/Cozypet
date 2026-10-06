import { Suspense } from 'react';
import { RequireRun } from '@/features/demo/RequireRun';
import { ListingForm } from '@/features/listings/ListingForm';

export default function Page() {
  return (
    <Suspense>
      <RequireRun>
        <ListingForm />
      </RequireRun>
    </Suspense>
  );
}
