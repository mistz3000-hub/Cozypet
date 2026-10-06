import { Suspense } from 'react';
import { PrivacyPage } from '@/features/auth/PrivacyPage';

export default function Page() {
  return (
    <Suspense>
      <PrivacyPage />
    </Suspense>
  );
}
