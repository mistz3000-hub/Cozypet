'use client';

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, m } from '@/lib/motion';
import { SPRING, T } from '@/lib/motion-tokens';
import { Icon, type IconName } from '@/components/ui/Icon';
import s from './toast.module.css';

interface ToastItem { id: number; text: string; icon: IconName; tone: 'success' | 'info' | 'error' }
type Push = (text: string, opts?: { icon?: IconName; tone?: ToastItem['tone'] }) => void;

const ToastContext = createContext<Push>(() => {});
const TOAST_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);
  const push = useCallback<Push>((text, opts) => {
    const id = ++seq.current;
    setItems((prev) => [...prev.slice(-2), { id, text, icon: opts?.icon ?? 'check', tone: opts?.tone ?? 'success' }]);
    window.setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== id)), TOAST_MS);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className={s.stack} role="status" aria-live="polite">
        <AnimatePresence>
          {items.map((t) => (
            <m.div
              key={t.id}
              className={[s.toast, s[t.tone]].join(' ')}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: T.exit }}
              transition={SPRING.soft}
              onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
            >
              <Icon name={t.icon} />
              <span>{t.text}</span>
            </m.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
