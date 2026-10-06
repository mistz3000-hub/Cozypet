import { Suspense } from 'react';
import { LandingPage } from '@/features/landing/LandingPage';

export default function Home() {
  return (
    <Suspense>
      <LandingPage />
    </Suspense>
  );
}
