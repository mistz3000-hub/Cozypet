import type { MascotKind } from '@/lib/types';
import { PhotoCatArt } from './PhotoCatArt';
import { PhotoDogArt } from './PhotoDogArt';

export function CatArt() { return <PhotoCatArt />; }
export function DogArt() { return <PhotoDogArt />; }
export function MascotArt({ kind }: { kind: MascotKind }) { return kind === 'dog' ? <DogArt /> : <CatArt />; }
