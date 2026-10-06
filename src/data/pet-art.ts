import type { MediaRef, Species } from '@/lib/types';
import { coatColor, collarColor } from './colors';

/**
 * ภาพประกอบสัตว์ที่วาดด้วยโค้ด (SVG) ใช้แทนภาพถ่ายจนกว่าทีมจะเพิ่มภาพถ่ายที่มีไลเซนส์ (PROMPT.md 15, CREDITS.md `art-pets`)
 * src รูปแบบ `art:<species>?c=<coat ids>&k=<collar id>&s=<seed>` อ่านโดย component PetImage
 */
export function petArt(species: Species, colors: string[], opts: { collar?: string; seed?: string; speciesLabelTh?: string } = {}): MediaRef {
  const params = new URLSearchParams();
  params.set('c', colors.join(','));
  if (opts.collar) params.set('k', opts.collar);
  if (opts.seed) params.set('s', opts.seed);
  const kind = species === 'cat' ? 'แมว' : species === 'dog' ? 'สุนัข' : (opts.speciesLabelTh ?? 'สัตว์');
  const colorText = colors.map((c) => coatColor(c)?.label.th ?? c).join('');
  const collar = collarColor(opts.collar);
  return {
    src: `art:${species}?${params.toString()}`,
    alt: `ภาพวาดประกอบ: ${kind}สี${colorText}${collar ? ` ใส่ปลอกคอสี${collar.label.th}` : ''}`,
    creditId: 'art-pets',
    aiGenerated: false,
  };
}

export interface ParsedArt { species: Species; colors: string[]; collar?: string; seed: string }

export function parseArtSrc(src: string): ParsedArt | null {
  if (!src.startsWith('art:')) return null;
  const [head, query = ''] = src.slice(4).split('?');
  const species = (head === 'cat' || head === 'dog' ? head : 'other') as Species;
  const params = new URLSearchParams(query);
  return {
    species,
    colors: (params.get('c') ?? '').split(',').filter(Boolean),
    collar: params.get('k') ?? undefined,
    seed: params.get('s') ?? src,
  };
}
