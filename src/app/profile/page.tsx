import { Suspense } from 'react';
import { ProfileEntry } from '@/features/business/ProfileEntry';
import { RouteLoading } from '@/components/ui/RouteLoading';
export default function Page() { return <Suspense fallback={<RouteLoading />}><ProfileEntry /></Suspense>; }
