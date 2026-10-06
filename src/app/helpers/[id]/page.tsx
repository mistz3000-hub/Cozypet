import { Suspense } from 'react';
import { HelperProfilePage } from '@/features/helpers/HelperProfilePage';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <HelperProfilePage id={id} />
    </Suspense>
  );
}
