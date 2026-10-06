import type { Availability, CareMode, CarePreferences, CurrentPet, GeoPoint, HomeInfo, Species } from '@/lib/types';

/** รูปแบบข้อมูลดิบที่ถอดจาก CODEX_IMAGE_PROMPTS.md หัวข้อ 5 (ดู scripts/data/extract-adopters.ts) */
export interface AdopterSource {
  id: string;
  displayName: string;
  sex: 'male' | 'female';
  age: number;
  districtId: string;
  location: GeoPoint;
  occupation: string;
  home: { type: string; summary: string };
  currentPets: Array<Omit<CurrentPet, 'species' | 'sex'> & { species: string; sex: string }>;
  preferences: CarePreferences;
  hours: string;
  politeParticle: string;
  careModes: string[];
  speciesAccepted: string[];
  capacityTotal: number;
  currentCount: number;
  availability: string;
  acceptsEmergency: boolean;
}

export type { Availability, CareMode, HomeInfo, Species };
