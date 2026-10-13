'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, m } from '@/lib/motion';
import { SPRING, T } from '@/lib/motion-tokens';
import { useI18n } from '@/i18n/provider';
import { Icon } from './Icon';
import s from './dialog.module.css';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * dialog แบบ modal: focus trap, ปิดด้วย Esc, คืนโฟกัสไปที่ปุ่มที่เปิด (PROMPT.md 9)
 * variant 'sheet' = sheet จากด้านล่างบนมือถือ / dialog บน desktop
 */
export function Dialog({ open, onClose, title, children, footer, variant = 'dialog', size = 'md', describedBy,className }: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  variant?: 'dialog' | 'sheet';
  size?: 'sm' | 'md' | 'lg';
  describedBy?: string;
  className?:string;
}) {
  const { m: msg } = useI18n();
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnTo.current = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => {
      const first = panel.current?.querySelector<HTMLElement>('[data-autofocus]') ?? panel.current?.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? panel.current)?.focus();
    }, 20);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // An open combobox consumes the first Escape before closing its dialog.
        if ((e.target as HTMLElement)?.closest('[role="combobox"][aria-expanded="true"]')) return;
        e.stopPropagation();
        onClose();
      } else if (e.key === 'Tab' && panel.current) {
        const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null && el.tabIndex >= 0 && el.getAttribute('aria-hidden') !== 'true');
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = prevOverflow;
      const el = returnTo.current;
      if (el && document.contains(el)) window.setTimeout(() => el.focus(), 0);
    };
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;
  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className={s.root}>
          <m.div className={s.backdrop} onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={T.quick} />
          <m.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-title`}
            aria-describedby={describedBy}
            tabIndex={-1}
            className={[s.panel, variant === 'sheet' ? s.sheet : '', s[size],className].filter(Boolean).join(' ')}
            initial={variant === 'sheet' ? { opacity: 0, y: 24 } : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, transition: T.exit }}
            transition={SPRING.soft}
          >
            {variant === 'sheet' ? <div className={s.grabber} aria-hidden="true" /> : null}
            <div className={s.head}>
              <h2 id={`${id}-title`} className={s.title}>{title}</h2>
              <button type="button" className={s.close} onClick={onClose} aria-label={msg.common.close}>
                <Icon name="x" />
              </button>
            </div>
            <div className={s.body}>{children}</div>
            {footer ? <div className={s.footer}>{footer}</div> : null}
          </m.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
