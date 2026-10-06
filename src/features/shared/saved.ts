'use client';

import { useCallback } from 'react';
import type { SavedItem } from '@/lib/types';
import { updateValue, useStore } from '@/lib/store';

/** รายการที่บันทึก (ประกาศและผู้ช่วยดูแล) */
export function useSaved(kind: SavedItem['kind'], id: string): [boolean, () => void] {
  const saved = useStore('saved');
  const on = saved.some((x) => x.kind === kind && x.id === id);
  const toggle = useCallback(() => {
    updateValue('saved', (prev) => (prev.some((x) => x.kind === kind && x.id === id)
      ? prev.filter((x) => !(x.kind === kind && x.id === id))
      : [{ kind, id, savedAt: new Date().toISOString() }, ...prev]));
  }, [kind, id]);
  return [on, toggle];
}
