import { Suspense } from 'react';
import { RequestStatusPage } from '@/features/requests/RequestStatusPage';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <RequestStatusPage id={id} />
    </Suspense>
  );
}
