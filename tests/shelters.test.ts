import { describe, expect, it } from 'vitest';
import { emptyShelter, ShelterBody, ShelterWrite } from '@/lib/shelters';

function payload(overrides: Partial<ReturnType<typeof emptyShelter>> = {}) {
  return { ...emptyShelter(), name: 'บ้านทดลอง', ...overrides };
}

describe('community foundation registration number', () => {
  it('requires a non-empty declared number for foundation writes', () => {
    const missing = payload({ organisationType: 'foundation', registrationNumber: '  ' });
    const result = ShelterWrite.safeParse({ payload: missing, status: 'draft' });
    expect(result.success).toBe(false);
  });

  it('accepts a declared foundation number on create or update payloads', () => {
    const foundation = payload({ organisationType: 'foundation', registrationNumber: 'มูลนิธิ-ตัวอย่าง-123' });
    expect(ShelterWrite.safeParse({ payload: foundation, status: 'draft' }).success).toBe(true);
  });

  it('does not require a foundation number for other place types', () => {
    const shelter = payload({ organisationType: 'shelter', registrationNumber: '' });
    expect(ShelterWrite.safeParse({ payload: shelter, status: 'draft' }).success).toBe(true);
  });

  it('continues reading legacy published foundations without the new field', () => {
    const legacy = payload({ organisationType: 'foundation' }) as Record<string, unknown>;
    delete legacy.registrationNumber;
    expect(ShelterBody.safeParse(legacy).success).toBe(true);
  });
});
