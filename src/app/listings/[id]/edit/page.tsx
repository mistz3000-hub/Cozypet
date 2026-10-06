import { Suspense } from 'react';
import { RequireRun } from '@/features/demo/RequireRun';
import { ListingForm } from '@/features/listings/ListingForm';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <RequireRun>
        <ListingForm editId={id} />
      </RequireRun>
    </Suspense>
  );
}
