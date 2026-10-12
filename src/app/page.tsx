import { Suspense } from 'react';
import { LandingPage } from '@/features/landing/LandingPage';
import { RouteLoading } from '@/components/ui/RouteLoading';

export default function Home() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <LandingPage />
    </Suspense>
  );
}
