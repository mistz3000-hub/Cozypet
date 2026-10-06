import { Suspense } from 'react';
import { StoriesPage } from '@/features/stories/StoriesPage';

export default function Page() {
  return (
    <Suspense>
      <StoriesPage />
    </Suspense>
  );
}
