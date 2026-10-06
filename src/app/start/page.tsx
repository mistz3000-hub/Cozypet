import { Suspense } from 'react';
import { StartPage } from '@/features/demo/StartPage';

export default function Page() {
  return (
    <Suspense>
      <StartPage />
    </Suspense>
  );
}
