import { Suspense } from 'react';
import { AgreementPage } from '@/features/business/AgreementPage';
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <Suspense><AgreementPage requestId={id} /></Suspense>; }
