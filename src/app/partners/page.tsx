import { Suspense } from 'react';
import { RequireRun } from '@/features/demo/RequireRun';
import { PartnersPage } from '@/features/business/PartnersPage';
export default function Page() { return <Suspense><RequireRun><PartnersPage /></RequireRun></Suspense>; }
