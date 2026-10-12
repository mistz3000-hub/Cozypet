import type { AnimalKind, LocalizedText, PetListing } from '@/lib/types';

export const ANIMAL_KINDS: readonly AnimalKind[] = ['cat', 'dog', 'rabbit', 'bird', 'guinea-pig', 'hamster', 'other'];
export interface AnimalBreed { id: string; kind: AnimalKind; label: LocalizedText }
export const ANIMAL_BREEDS: readonly AnimalBreed[] = [
  {
    "id": "thai-mixed-cat",
    "kind": "cat",
    "label": {
      "th": "แมวไทยพันทาง",
      "en": "Thai mixed-breed cat"
    }
  },
  {
    "id": "thai-longhair-cat",
    "kind": "cat",
    "label": {
      "th": "แมวไทยพันทางขนยาว",
      "en": "Thai mixed long-haired cat"
    }
  },
  {
    "id": "thai-mixed-dog",
    "kind": "dog",
    "label": {
      "th": "สุนัขไทยพันทาง",
      "en": "Thai mixed-breed dog"
    }
  },
  {
    "id": "poodle-mix",
    "kind": "dog",
    "label": {
      "th": "พุดเดิลผสม",
      "en": "Poodle mix"
    }
  },
  {
    "id": "mixed-rabbit",
    "kind": "rabbit",
    "label": {
      "th": "กระต่ายพันทาง",
      "en": "Mixed-breed rabbit"
    }
  },
  {
    "id": "british-shorthair",
    "kind": "cat",
    "label": {
      "th": "บริติชชอร์ตแฮร์",
      "en": "British Shorthair"
    }
  },
  {
    "id": "siamese",
    "kind": "cat",
    "label": {
      "th": "วิเชียรมาศ",
      "en": "Siamese"
    }
  },
  {
    "id": "persian",
    "kind": "cat",
    "label": {
      "th": "เปอร์เซีย",
      "en": "Persian"
    }
  },
  {
    "id": "ragdoll",
    "kind": "cat",
    "label": {
      "th": "แร็กดอลล์",
      "en": "Ragdoll"
    }
  },
  {
    "id": "scottish-fold",
    "kind": "cat",
    "label": {
      "th": "สกอตติชโฟลด์",
      "en": "Scottish Fold"
    }
  },
  {
    "id": "american-shorthair",
    "kind": "cat",
    "label": {
      "th": "อเมริกันชอร์ตแฮร์",
      "en": "American Shorthair"
    }
  },
  {
    "id": "maine-coon",
    "kind": "cat",
    "label": {
      "th": "เมนคูน",
      "en": "Maine Coon"
    }
  },
  {
    "id": "bengal",
    "kind": "cat",
    "label": {
      "th": "เบงกอล",
      "en": "Bengal"
    }
  },
  {
    "id": "sphynx",
    "kind": "cat",
    "label": {
      "th": "สฟิงซ์",
      "en": "Sphynx"
    }
  },
  {
    "id": "exotic-shorthair",
    "kind": "cat",
    "label": {
      "th": "เอ็กโซติกชอร์ตแฮร์",
      "en": "Exotic Shorthair"
    }
  },
  {
    "id": "golden-retriever",
    "kind": "dog",
    "label": {
      "th": "โกลเด้นรีทรีฟเวอร์",
      "en": "Golden Retriever"
    }
  },
  {
    "id": "corgi",
    "kind": "dog",
    "label": {
      "th": "เวลช์คอร์กี้",
      "en": "Welsh Corgi"
    }
  },
  {
    "id": "pomeranian",
    "kind": "dog",
    "label": {
      "th": "ปอมเมอเรเนียน",
      "en": "Pomeranian"
    }
  },
  {
    "id": "beagle",
    "kind": "dog",
    "label": {
      "th": "บีเกิล",
      "en": "Beagle"
    }
  },
  {
    "id": "siberian-husky",
    "kind": "dog",
    "label": {
      "th": "ไซบีเรียนฮัสกี้",
      "en": "Siberian Husky"
    }
  },
  {
    "id": "shiba-inu",
    "kind": "dog",
    "label": {
      "th": "ชิบะอินุ",
      "en": "Shiba Inu"
    }
  },
  {
    "id": "thai-ridgeback",
    "kind": "dog",
    "label": {
      "th": "ไทยหลังอาน",
      "en": "Thai Ridgeback"
    }
  },
  {
    "id": "poodle",
    "kind": "dog",
    "label": {
      "th": "พุดเดิล",
      "en": "Poodle"
    }
  },
  {
    "id": "dachshund",
    "kind": "dog",
    "label": {
      "th": "ดัชชุนด์",
      "en": "Dachshund"
    }
  },
  {
    "id": "french-bulldog",
    "kind": "dog",
    "label": {
      "th": "เฟรนช์บูลด็อก",
      "en": "French Bulldog"
    }
  },
  {
    "id": "holland-lop",
    "kind": "rabbit",
    "label": {
      "th": "ฮอลแลนด์ลอป",
      "en": "Holland Lop"
    }
  },
  {
    "id": "mini-lop",
    "kind": "rabbit",
    "label": {
      "th": "มินิลอป",
      "en": "Mini Lop"
    }
  },
  {
    "id": "netherland-dwarf",
    "kind": "rabbit",
    "label": {
      "th": "เนเธอร์แลนด์ดวอร์ฟ",
      "en": "Netherland Dwarf"
    }
  },
  {
    "id": "lionhead",
    "kind": "rabbit",
    "label": {
      "th": "ไลอ้อนเฮด",
      "en": "Lionhead"
    }
  },
  {
    "id": "rex-rabbit",
    "kind": "rabbit",
    "label": {
      "th": "เร็กซ์",
      "en": "Rex"
    }
  },
  {
    "id": "mini-rex",
    "kind": "rabbit",
    "label": {
      "th": "มินิเร็กซ์",
      "en": "Mini Rex"
    }
  },
  {
    "id": "dutch-rabbit",
    "kind": "rabbit",
    "label": {
      "th": "ดัตช์",
      "en": "Dutch"
    }
  },
  {
    "id": "flemish-giant",
    "kind": "rabbit",
    "label": {
      "th": "เฟลมมิชไจแอนท์",
      "en": "Flemish Giant"
    }
  },
  {
    "id": "cockatiel",
    "kind": "bird",
    "label": {
      "th": "ค็อกคาเทล",
      "en": "Cockatiel"
    }
  },
  {
    "id": "budgerigar",
    "kind": "bird",
    "label": {
      "th": "หงส์หยก",
      "en": "Budgerigar"
    }
  },
  {
    "id": "american-guinea-pig",
    "kind": "guinea-pig",
    "label": {
      "th": "อเมริกัน",
      "en": "American Guinea Pig"
    }
  },
  {
    "id": "syrian-hamster",
    "kind": "hamster",
    "label": {
      "th": "ซีเรียน",
      "en": "Syrian Hamster"
    }
  }
];

const BY_ID = new Map(ANIMAL_BREEDS.map((b) => [b.id, b]));
const BY_NAME = new Map(ANIMAL_BREEDS.map((b) => [b.label.th, b]));
type PetKind = Pick<PetListing, 'species' | 'speciesOther'>;
type PetBreed = Pick<PetListing, 'breed' | 'breedId'>;

export function animalKindOf(pet: PetKind): AnimalKind {
  if (pet.species !== 'other') return pet.species;
  const name = pet.speciesOther?.trim().toLocaleLowerCase() ?? '';
  if (/กระต่าย|rabbit|bunny/.test(name)) return 'rabbit';
  if (/หนูตะเภา|guinea/.test(name)) return 'guinea-pig';
  if (/แฮมสเตอร์|hamster/.test(name)) return 'hamster';
  if (/นก|bird|parrot|cockatiel|budgie/.test(name)) return 'bird';
  return 'other';
}

export function matchesAnimalKind(pet: PetKind, kind: AnimalKind): boolean {
  return kind === 'other' ? pet.species === 'other' : animalKindOf(pet) === kind;
}

export function animalBreedOf(pet: PetBreed): AnimalBreed | undefined {
  return (pet.breedId ? BY_ID.get(pet.breedId) : undefined) ?? (pet.breed ? BY_NAME.get(pet.breed) : undefined);
}

export function animalBreedKey(pet: PetBreed): string {
  return animalBreedOf(pet)?.id ?? pet.breed ?? '';
}

export function animalBreedLabel(pet: PetBreed, loc: (text: LocalizedText) => string, unknown: string): string {
  const breed = animalBreedOf(pet);
  return breed ? loc(breed.label) : pet.breed || unknown;
}

