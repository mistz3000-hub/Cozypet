/**
 * Seeded pseudo-random (PROMPT.md 11.2): FNV-1a 32-bit → mulberry32
 * ห้ามใช้ Math.random() กับข้อมูลที่ต้องทำซ้ำได้
 */

export function fnv1a32(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rngFromKey(seedKey: string): () => number {
  return mulberry32(fnv1a32(seedKey));
}

/** สลับลำดับแบบ Fisher–Yates ด้วย rng ที่ให้มา (ไม่แก้ array เดิม) */
export function seededShuffle<T>(items: readonly T[], rng: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function seededInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

export function pad3(n: number): string {
  return String(n).padStart(3, '0');
}
