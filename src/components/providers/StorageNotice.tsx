'use client';

import { useI18n } from '@/i18n/provider';
import { useStorageStatus } from '@/lib/store';
import { clearStatusError } from '@/lib/storage';
import { Icon } from '@/components/ui/Icon';
import s from './notice.module.css';

/** แจ้งเมื่อ storage ใช้ไม่ได้/เต็ม/อ่านไม่ได้ (PROMPT.md 10.5) */
export function StorageNotice() {
  const { m } = useI18n();
  const st = useStorageStatus();
  const msg = st.lastError === 'quota' ? m.common.storageQuota
    : st.lastError === 'parse' ? m.common.storageParse
      : st.lastError === 'too_large' ? m.common.storageTooLarge
        : !st.persistent ? m.common.storageMemory : null;
  if (!msg) return null;
  return (
    <div className={s.bar} role="status">
      <Icon name="alert" />
      <span>{msg}</span>
      {st.lastError ? (
        <button type="button" onClick={clearStatusError} aria-label={m.common.dismiss}>
          <Icon name="x" />
        </button>
      ) : null}
    </div>
  );
}
