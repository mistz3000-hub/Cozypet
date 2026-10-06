'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { OPEN_TOUR_EVENT } from '@/components/shell/HeaderControls';

// โค้ดทัวร์โหลดเมื่อผู้ใช้กด “วิธีใช้” เท่านั้น (AC-81)
const TourHost = dynamic(() => import('./TourHost'), { ssr: false });

export function TourLauncher() {
  const [request, setRequest] = useState<{ n: number; returnTo: HTMLElement | null } | null>(null);
  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<{ returnTo?: HTMLElement; full?: boolean }>).detail;
      setRequest((prev) => ({ n: (prev?.n ?? 0) + 1, returnTo: detail?.returnTo ?? null }));
    };
    window.addEventListener(OPEN_TOUR_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_TOUR_EVENT, onOpen);
  }, []);
  if (!request) return null;
  return <TourHost request={request} />;
}
