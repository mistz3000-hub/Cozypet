import { Suspense } from 'react';
import { ListingsFeed } from '@/features/listings/ListingsFeed';

export default function Page() {
  return (
    <Suspense>
      <ListingsFeed />
    </Suspense>
  );
}
