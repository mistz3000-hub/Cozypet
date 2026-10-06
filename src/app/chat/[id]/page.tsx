import { Suspense } from 'react';
import { RequireRun } from '@/features/demo/RequireRun';
import { ChatPage } from '@/features/chat/ChatPage';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <RequireRun>
        <ChatPage id={id} />
      </RequireRun>
    </Suspense>
  );
}
