import { Suspense } from 'react';
import { SignupPage } from '@/features/auth/SignupPage';

export default function Page() {
  return (
    <Suspense>
      <SignupPage />
    </Suspense>
  );
}
