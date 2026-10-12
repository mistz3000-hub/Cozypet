import type { MediaRef } from '@/lib/types';
import { GENERATED_CAT_PHOTOS } from './cat-photos.generated';

/** ใช้ ID ของสัตว์เดิมเสมอ; ภาพตัวอย่างใน scan คือมะม่วงจากประกาศ listing-001 */
export function catPhotoFor(id: string): MediaRef | undefined {
  return GENERATED_CAT_PHOTOS[id === 'scan-sample' ? 'listing-001' : id];
}
