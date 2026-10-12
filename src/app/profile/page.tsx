import { Suspense } from 'react';
import { RequireRun } from '@/features/demo/RequireRun';
import { ProfilePage } from '@/features/business/ProfilePage';
export default function Page() { return <Suspense><RequireRun><ProfilePage /></RequireRun></Suspense>; }
