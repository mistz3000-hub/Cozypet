import { Suspense } from 'react';
import { ListingDetail } from '@/features/listings/ListingDetail';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <ListingDetail id={id} />
    </Suspense>
  );
}
