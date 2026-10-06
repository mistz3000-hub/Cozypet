'use client';

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

const AnnounceContext = createContext<(text: string) => void>(() => {});

/** live region แบบ polite สำหรับประกาศสถานะ (สแกน ค้นหา สลับ mascot แชต) */
export function AnnouncerProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState('');
  const toggle = useRef(false);
  const announce = useCallback((text: string) => {
    toggle.current = !toggle.current;
    // เติมช่องว่างสลับกัน เพื่อให้ข้อความเดิมถูกอ่านซ้ำได้
    setMsg(text + (toggle.current ? ' ' : ''));
  }, []);
  return (
    <AnnounceContext.Provider value={announce}>
      {children}
      <div aria-live="polite" role="status" className="visually-hidden">
        {msg}
      </div>
    </AnnounceContext.Provider>
  );
}

export function useAnnounce() {
  return useContext(AnnounceContext);
}
