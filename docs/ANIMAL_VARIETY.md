# สัตว์และพันธุ์เพิ่มเติม (D23)

เพิ่มประกาศหาบ้าน 32 ตัว ID listing-029 ถึง listing-060; ทุกชื่อ พันธุ์ สถานะ และเรื่องราวเป็นข้อมูลสาธิต ไม่มีการวิเคราะห์พันธุ์จากภาพ ภาพสร้างใหม่ด้วย built-in image_gen วันที่ 2026-10-08

- 10 พันธุ์แมว + 10 พันธุ์สุนัข + 8 พันธุ์กระต่าย + นก 2 ชนิด + หนูตะเภา + แฮมสเตอร์
- species ในระบบจับคู่และ API ยังคง cat/dog/other; UI แยกสัตว์เล็กด้วย speciesOther และ AnimalKind
- รูปต้นฉบับเป็น atlas 4×4 ผูกช่องตาม ID คงที่ ไม่สุ่มใหม่เมื่อค้นหา ไม่ทับป้ายข้อความบนรูป
- ประกาศอยู่ในช่องสถานดูแลสาธิต shelter-006…020 เท่านั้น ไม่สร้างสัตว์หรือกิจกรรมแทน 5 องค์กรจริง ช่อง 016…020 รองรับ other ในข้อมูลสาธิต ตัวเลขความจุเดิมไม่เปลี่ยนและครอบคลุมสัตว์ในประกาศ

## variety-01

`public/images/variety/variety-01.png` · เครดิต `ai-variety-01`

| ช่อง (เริ่ม 0) | Listing ID | ชื่อ | ชนิด | พันธุ์ |
| --- | --- | --- | --- | --- |
| 0 | listing-029 | บลูเบอร์รี | แมว | บริติชชอร์ตแฮร์ / British Shorthair |
| 1 | listing-030 | สำลี | แมว | วิเชียรมาศ / Siamese |
| 2 | listing-031 | พุดดิ้ง | แมว | เปอร์เซีย / Persian |
| 3 | listing-032 | เมฆา | แมว | แร็กดอลล์ / Ragdoll |
| 4 | listing-033 | คาราเมล | แมว | สกอตติชโฟลด์ / Scottish Fold |
| 5 | listing-034 | เงินยวง | แมว | อเมริกันชอร์ตแฮร์ / American Shorthair |
| 6 | listing-035 | เมเปิล | แมว | เมนคูน / Maine Coon |
| 7 | listing-036 | เสือเล็ก | แมว | เบงกอล / Bengal |
| 8 | listing-037 | พีช | แมว | สฟิงซ์ / Sphynx |
| 9 | listing-038 | มิลค์ | แมว | เอ็กโซติกชอร์ตแฮร์ / Exotic Shorthair |
| 10 | listing-039 | ซันนี่ | สุนัข | โกลเด้นรีทรีฟเวอร์ / Golden Retriever |
| 11 | listing-040 | ชอร์ตเค้ก | สุนัข | เวลช์คอร์กี้ / Welsh Corgi |
| 12 | listing-041 | ปอมปอม | สุนัข | ปอมเมอเรเนียน / Pomeranian |
| 13 | listing-042 | บัตเตอร์ | สุนัข | บีเกิล / Beagle |
| 14 | listing-043 | ออโรร่า | สุนัข | ไซบีเรียนฮัสกี้ / Siberian Husky |
| 15 | listing-044 | ถั่วโมจิ | สุนัข | ชิบะอินุ / Shiba Inu |

### Prompt ที่ส่งให้ image_gen

```text
Create ONE high-resolution photographic contact sheet for the Cozypet pet adoption demo. A precise 4 columns by 4 rows grid with EXACTLY 16 equal square edge-to-edge tiles. No gutters, borders, numbers, captions, text, watermarks or logos. Each tile contains exactly ONE different healthy realistic living pet as specified below, entirely inside its own square tile. NEVER combine or blend adjacent tiles. This is a cohesive atlas asset for native web tile cropping. Lifelike professional natural pet photography, never illustration, cartoon, toy, game art or 3D render. Soft real daylight, warm cream Bangkok home environments, realistic fur/feathers/skin texture and correct natural anatomy. Centre the subject so the head and eyes, ears and breed features are clearly visible; show sufficient body for identifying rabbit ears, dog proportions, bird feathers and small pets. No people, hands, collar, accessories, readable signs or cages. Vary the subtle clean home background by tile. Every described breed must look like its normal real-world appearance, with natural eye size. Order is strict, reading left-to-right across each row then top-to-bottom:
ROW 1, COLUMN 1: one round-faced blue-grey British Shorthair, dense short coat, natural amber eyes.
ROW 1, COLUMN 2: one slender Siamese, cream body and seal brown face/ear/tail points, natural blue eyes.
ROW 1, COLUMN 3: one white long-haired Persian, full fluffy coat, realistic gently flat face and amber eyes.
ROW 1, COLUMN 4: one Ragdoll, cream semi-long coat, brown points, white chin, blue eyes.
ROW 2, COLUMN 1: one brown tabby Scottish Fold with naturally folded ears, realistic round face.
ROW 2, COLUMN 2: one silver classic tabby American Shorthair, grey coat with bold black swirls.
ROW 2, COLUMN 3: one adult Maine Coon, long brown tabby coat, tufted ears and natural large size.
ROW 2, COLUMN 4: one golden brown Bengal with distinct dark rosettes, athletic domestic cat.
ROW 3, COLUMN 1: one hairless Sphynx with natural peach cream skin and gentle wrinkles, elegant large ears.
ROW 3, COLUMN 2: one white and grey Exotic Shorthair, dense short fur, natural gently flat face.
ROW 3, COLUMN 3: one golden-coated young adult Golden Retriever, medium long silky coat and friendly expression.
ROW 3, COLUMN 4: one red and white Pembroke Welsh Corgi with short legs and upright ears.
ROW 4, COLUMN 1: one small fluffy cream Pomeranian, pointed ears and natural foxlike face.
ROW 4, COLUMN 2: one tricolour black tan white Beagle with floppy ears, natural puppy-adult proportions.
ROW 4, COLUMN 3: one grey and white Siberian Husky, blue eyes, upright ears and fluffy coat.
ROW 4, COLUMN 4: one red Shiba Inu with cream urajiro cheek and chest, upright ears, curled tail.
ABSOLUTELY no text or row labels printed in the output. Grid equal dimensions are essential. Use an opaque background for the photographic sheet.
```

## variety-02

`public/images/variety/variety-02.png` · เครดิต `ai-variety-02`

| ช่อง (เริ่ม 0) | Listing ID | ชื่อ | ชนิด | พันธุ์ |
| --- | --- | --- | --- | --- |
| 0 | listing-045 | ไพลิน | สุนัข | ไทยหลังอาน / Thai Ridgeback |
| 1 | listing-046 | ทอฟฟี่ | สุนัข | พุดเดิล / Poodle |
| 2 | listing-047 | ช็อกโก้ | สุนัข | ดัชชุนด์ / Dachshund |
| 3 | listing-048 | แม็กซ์ | สุนัข | เฟรนช์บูลด็อก / French Bulldog |
| 4 | listing-049 | มาร์ชเมลโล่ | กระต่าย | ฮอลแลนด์ลอป / Holland Lop |
| 5 | listing-050 | โกโก้บัน | กระต่าย | มินิลอป / Mini Lop |
| 6 | listing-051 | โมจิน้อย | กระต่าย | เนเธอร์แลนด์ดวอร์ฟ / Netherland Dwarf |
| 7 | listing-052 | ปุยเมฆ | กระต่าย | ไลอ้อนเฮด / Lionhead |
| 8 | listing-053 | เวลเว็ต | กระต่าย | เร็กซ์ / Rex |
| 9 | listing-054 | ไข่มุก | กระต่าย | มินิเร็กซ์ / Mini Rex |
| 10 | listing-055 | ทูโทน | กระต่าย | ดัตช์ / Dutch |
| 11 | listing-056 | เบิ้ม | กระต่าย | เฟลมมิชไจแอนท์ / Flemish Giant |
| 12 | listing-057 | ซันไชน์ | นก | ค็อกคาเทล / Cockatiel |
| 13 | listing-058 | กีวี | นก | หงส์หยก / Budgerigar |
| 14 | listing-059 | คุกกี้ | หนูตะเภา | อเมริกัน / American Guinea Pig |
| 15 | listing-060 | พ็อกเก็ต | แฮมสเตอร์ | ซีเรียน / Syrian Hamster |

### Prompt ที่ส่งให้ image_gen

```text
Create ONE high-resolution photographic contact sheet for the Cozypet pet adoption demo. A precise 4 columns by 4 rows grid with EXACTLY 16 equal square edge-to-edge tiles. No gutters, borders, numbers, captions, text, watermarks or logos. Each tile contains exactly ONE different healthy realistic living pet as specified below, entirely inside its own square tile. NEVER combine or blend adjacent tiles. This is a cohesive atlas asset for native web tile cropping. Lifelike professional natural pet photography, never illustration, cartoon, toy, game art or 3D render. Soft real daylight, warm cream Bangkok home environments, realistic fur/feathers/skin texture and correct natural anatomy. Centre the subject so the head and eyes, ears and breed features are clearly visible; show sufficient body for identifying rabbit ears, dog proportions, bird feathers and small pets. No people, hands, collar, accessories, readable signs or cages. Vary the subtle clean home background by tile. Every described breed must look like its normal real-world appearance, with natural eye size. Order is strict, reading left-to-right across each row then top-to-bottom:
ROW 1, COLUMN 1: one sleek blue grey Thai Ridgeback with short fur, upright ears and visible natural back ridge.
ROW 1, COLUMN 2: one small apricot brown Poodle, natural soft curly coat, unexaggerated pet grooming.
ROW 1, COLUMN 3: one black and tan smooth-coat Dachshund, long low body, short legs and floppy ears.
ROW 1, COLUMN 4: one fawn cream French Bulldog with dark muzzle and upright bat ears, realistic healthy anatomy.
ROW 2, COLUMN 1: one white and cream Holland Lop rabbit, naturally drooping floppy ears, seated fully visible.
ROW 2, COLUMN 2: one brown and white Mini Lop rabbit, floppy ears and compact rounded body.
ROW 2, COLUMN 3: one tiny white and grey Netherland Dwarf rabbit, very short upright ears and compact round body.
ROW 2, COLUMN 4: one white cream Lionhead rabbit, distinct fluffy fur mane around face and upright ears.
ROW 3, COLUMN 1: one castor brown Rex rabbit, smooth velvety plush short coat, elegant upright ears.
ROW 3, COLUMN 2: one white and grey Mini Rex rabbit, compact body and velvety very short coat.
ROW 3, COLUMN 3: one classic black and white Dutch rabbit with white face blaze and correct Dutch coat pattern.
ROW 3, COLUMN 4: one large sandy brown Flemish Giant rabbit, long upright ears, on natural indoor floor with believable giant rabbit scale.
ROW 4, COLUMN 1: one grey yellow Cockatiel with orange cheek patches and upright crest, on a clean natural wooden perch.
ROW 4, COLUMN 2: one green yellow Budgerigar with natural black wing stripes, on a clean wooden perch.
ROW 4, COLUMN 3: one tricolour short-haired American guinea pig on a soft clean cream mat, entire small body visible.
ROW 4, COLUMN 4: one golden white Syrian hamster, tiny natural rounded ears, on a clean wooden surface with natural small scale.
ABSOLUTELY no text or row labels printed in the output. Grid equal dimensions are essential. Use an opaque background for the photographic sheet.
```


## การตัดช่องภาพในเว็บ

ภาพต้นฉบับทั้งสองไฟล์ 1254×1254px ไม่ถูกแก้หรือ resample ช่องแรกใช้ 4×4 คงที่ตัดขอบ 3px; variety-02 มีเส้นแบ่งจริง x=[0,314,627,942,1254], y=[0,312,616,927,1254] จึงใช้ MediaRef.atlas.crop ด้วย native SVG และตัดขอบ 3px เพื่อไม่เห็นช่องข้างเคียง
