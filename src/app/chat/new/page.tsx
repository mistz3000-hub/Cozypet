import { Suspense } from 'react';
import { RequireRun } from '@/features/demo/RequireRun';
import { ChatNew } from '@/features/chat/ChatNew';

export default function Page() {
  return (
    <Suspense>
      <RequireRun>
        <ChatNew />
      </RequireRun>
    </Suspense>
  );
}
