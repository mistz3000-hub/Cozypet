import { z } from 'zod';
import { BANGKOK_BOUNDS, isDistrictId, DISTRICTS } from '@/data/districts';
import type { HelperProfile, PublicShelter, ShelterPayload, ShelterPublication } from './types';

const text = (max: number) => z.string().trim().max(max);
const Photo = z.object({ src: text(4096), storagePath: z.string().regex(/^[0-9a-f-]{36}\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(?:webp|jpg|png)$/), alt: text(120), creditId: z.literal('community-upload').optional() });
export const ShelterBody = z.object({
  name: text(80).min(2), organisationType: z.enum(['foundation', 'shelter', 'independent']),
  registrationNumber: text(60).optional(),
  districtId: z.string().refine(isDistrictId),
  location: z.object({ lat: z.number().finite().min(BANGKOK_BOUNDS.minLat).max(BANGKOK_BOUNDS.maxLat), lng: z.number().finite().min(BANGKOK_BOUNDS.minLng).max(BANGKOK_BOUNDS.maxLng) }),
  address: text(250), description: text(1200),
  speciesAccepted: z.array(z.enum(['cat', 'dog', 'other'])).min(1).max(3), careModes: z.array(z.enum(['foster', 'adopt'])).max(2),
  capacityTotal: z.number().int().min(1).max(1000), currentCount: z.number().int().min(0).max(1000),
  foodDays: z.number().int().min(0).max(365), litterDays: z.number().int().min(0).max(365).optional(),
  acceptsEmergency: z.boolean(), hours: text(160), conditions: text(800), donationsEnabled: z.boolean(), donationNeeds: text(600), contactInstructions: text(400),
  photos: z.array(Photo).max(3),
  pets: z.array(z.object({ id: z.string().uuid(), name: text(40).min(1), species: z.enum(['cat', 'dog', 'other']), breed: text(80), age: text(40), status: z.enum(['available', 'foster', 'adopted']), description: text(300), photo: Photo.optional() })).max(6),
}).refine((p) => p.currentCount <= p.capacityTotal, { path: ['currentCount'], message: 'capacity' });
export const ShelterWrite = z.object({ payload: ShelterBody, status: z.enum(['draft', 'published', 'paused', 'archived']), version: z.number().int().positive().optional() }).superRefine((value, ctx) => {
  if (value.payload.organisationType === 'foundation' && !value.payload.registrationNumber?.trim()) {
    ctx.addIssue({ code: 'custom', path: ['payload', 'registrationNumber'], message: 'required' });
  }
});

export function emptyShelter(): ShelterPayload {
  return { name: '', organisationType: 'shelter', registrationNumber: '', districtId: DISTRICTS[0].id, location: { ...DISTRICTS[0].center }, address: '', description: '', speciesAccepted: ['cat', 'dog'], careModes: ['foster', 'adopt'], capacityTotal: 20, currentCount: 0, foodDays: 7, litterDays: 7, acceptsEmergency: false, hours: '', conditions: '', donationsEnabled: true, donationNeeds: '', contactInstructions: '', photos: [], pets: [] };
}

export function shelterFromRow(row: Record<string, unknown>): PublicShelter {
  return { id: row.id as string, registrationDemoId: row.registration_demo_id as string, status: row.status as ShelterPublication, payload: row.payload as ShelterPayload, version: Number(row.version), createdAt: row.created_at as string, updatedAt: row.updated_at as string, isDemo: true };
}

export function shelterToHelper(p: PublicShelter): HelperProfile {
  const d = p.payload;
  return { id: `community-${p.id}`, publicPlaceId: p.id, kind: d.organisationType === 'independent' ? 'individual' : 'shelter', displayName: d.name, districtId: d.districtId, location: d.location,
    speciesAccepted: d.speciesAccepted, careModes: d.careModes, capacityTotal: d.capacityTotal, currentCount: d.currentCount,
    availability: p.status === 'paused' ? 'unavailable' : 'available', acceptsEmergency: d.acceptsEmergency, hours: d.hours, conditions: d.conditions ? [d.conditions] : [], description: d.description,
    images: { place: d.photos, profile: d.photos[0] }, isRealOrganization: false, ...(d.organisationType === 'foundation' ? { isFictionalFoundation: true as const } : {}),
    demoVerified: false, donationsEnabled: d.donationsEnabled, acceptsSupplyPackages: d.donationsEnabled,
    persona: { speakerLabel: '', politeParticle: 'ค่ะ', tone: '', facts: [] }, isDemo: true };
}
