'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n/provider';
import * as storage from '@/lib/storage';
import { SYNC_KEYS, type StoreKey } from '@/lib/storage';
import { getValue, updateValue } from '@/lib/store';
import { useToast } from '@/components/providers/Toast';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { useAuth } from './AuthContext';
import { fetchRemoteState } from './sync-client';
import { hasMeaningfulData, mergeValue } from './merge-state';

const pulled = new Set<string>();

/**
 * เมื่อเข้าสู่ระบบ: ดึงข้อมูลบัญชีลงเครื่อง (รวมกับ cache) แล้วถามว่าจะย้ายข้อมูลโหมดทดลองเข้าบัญชีไหม (PROMPT.md 7.9)
 */
export function AccountSync() {
  const { user } = useAuth();
  const { m } = useI18n();
  const toast = useToast();
  const [guestKeys, setGuestKeys] = useState<StoreKey[]>([]);

  useEffect(() => {
    if (!user || pulled.has(user.id)) return;
    pulled.add(user.id);
    let alive = true;
    void (async () => {
      const remote = await fetchRemoteState();
      if (!alive) return;
      if (remote) {
        for (const k of SYNC_KEYS) {
          const local = storage.read(k);
          const merged = mergeValue(k, local, remote[k] as never);
          if (merged === undefined) continue;
          const same = JSON.stringify(merged) === JSON.stringify(remote[k]);
          // ข้อมูลที่ตรงกับบัญชีอยู่แล้วไม่ต้องส่งกลับ
          storage.write(k, merged as never, { silentSync: same });
        }
      }
      // Run จากโปรไฟล์บัญชี (ใช้ได้ทุกเครื่อง)
      if (user.runNumber && getValue('demoSession').runNumber === null) {
        updateValue('demoSession', (prev) => ({ ...prev, runNumber: user.runNumber, updatedAt: new Date().toISOString() }));
      }
      if (getValue('noticeDismissed')['migrate-guest']) return;
      const found = SYNC_KEYS.filter((k) => hasMeaningfulData(k, storage.readGuest(k)));
      if (found.length) setGuestKeys(found);
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  const migrate = () => {
    for (const k of guestKeys) {
      const guest = storage.readGuest(k);
      const merged = mergeValue(k, storage.read(k), guest as never);
      if (merged !== undefined) storage.write(k, merged as never);
      storage.removeGuest(k);
    }
    setGuestKeys([]);
    toast(m.auth.migrated);
  };
  const skip = () => {
    updateValue('noticeDismissed', (prev) => ({ ...prev, 'migrate-guest': true }));
    setGuestKeys([]);
  };

  return (
    <Dialog
      open={guestKeys.length > 0}
      onClose={skip}
      title={m.auth.migrateTitle}
      size="sm"
      footer={(
        <>
          <Button onClick={skip}>{m.auth.migrateNo}</Button>
          <Button variant="primary" icon="arrowRight" onClick={migrate} data-autofocus>{m.auth.migrateYes}</Button>
        </>
      )}
    >
      <p>{m.auth.migrateText}</p>
    </Dialog>
  );
}
