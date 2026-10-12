import type { CurrentPet, HelperImages } from '@/lib/types';
import { GENERATED_MEDIA } from './generated-media';

export const AVAILABLE_PERSONA_IMAGES: ReadonlySet<string> = new Set(Array.from({ length: 100 }, (_, i) => `adopter-${String(i + 1).padStart(3, '0')}`));

export function creditIdForAdopter(id: string): string {
  return GENERATED_MEDIA[`people:${id}`]?.creditId ?? 'ai-people-01';
}

export function personaImagesFor(id: string, _name: string, _district: string, _home: string, _pets: CurrentPet[]): HelperImages {
  return { profile: GENERATED_MEDIA[`people:${id}`], home: GENERATED_MEDIA[`homes:${id}`], pets: GENERATED_MEDIA[`pet-groups:${id}`] };
}
