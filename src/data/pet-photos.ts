import { catPhotoFor } from './cat-photos';
import { GENERATED_MEDIA } from './generated-media';
import { VARIETY_MEDIA } from './variety-media';

export function petPhotoFor(id: string) {
  return VARIETY_MEDIA[id] ?? catPhotoFor(id) ?? GENERATED_MEDIA[`pets:${id}`];
}
