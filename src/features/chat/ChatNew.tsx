'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useI18n } from '@/i18n/provider';
import { getValue } from '@/lib/store';
import { Skeleton } from '@/components/ui/Badge';
import { NotFoundView } from '@/components/shell/NotFoundView';
import { useRun } from '@/features/demo/RequireRun';
import { getOrCreateConversation, personaRefFor } from './conversation';

/** /chat/new?persona=&listing=&request= → สร้าง/เปิดบทสนทนา (1 Run + 1 persona + 1 หัวข้อ) แล้ว redirect */
export function ChatNew() {
  const params = useSearchParams();
  const router = useRouter();
  const run = useRun()!;
  const { m } = useI18n();
  const persona = personaRefFor(params.get('persona'));
  const requestId = params.get('request');
  const listingParam = params.get('listing');

  useEffect(() => {
    if (!persona) return;
    const listingId = listingParam ?? (requestId ? getValue('careRequests').find((r) => r.id === requestId)?.listingId : null) ?? null;
    const id = getOrCreateConversation(run.run, persona, listingId);
    router.replace(`/chat/${id}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persona?.id, listingParam, requestId, run.run]);

  if (!persona) return <NotFoundView />;
  return (
    <div className="cp-container cp-page" aria-busy="true">
      <p>{m.chat.opening}</p>
      <Skeleton height={320} />
    </div>
  );
}
