import { Suspense } from 'react';
import { InsightsPage } from '@/features/insights/InsightsPage';

export default function Page() {
  return (
    <Suspense>
      <InsightsPage />
    </Suspense>
  );
}
