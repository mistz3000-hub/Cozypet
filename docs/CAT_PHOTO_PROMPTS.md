# CAT_PHOTO_PROMPTS.md — ภาพแมวสมจริงทั้งหมดใน Cozypet

**สถานะ: สร้างครบและเชื่อมกับหน้าเว็บแล้ว** 128 ช่องภาพใน 8 ไฟล์ PNG 1254×1254; ประกาศ/เรื่องราว/รูปตัวอย่างสแกนและโปรไฟล์ผู้ดูแลแสดงภาพจาก registry เดียวกัน

## Localized edit: cats-08.png

หลังดูผลภาพ เปลี่ยนเฉพาะ row 2 column 1 (`adopter-093-pet-1` บับเบิ้ล) ให้ขนสั้นแบบเอ็กโซติกช็อตแฮร์ โดยส่งไฟล์ atlas เดิมเป็น local referenced image และใช้ built-in `image_gen` เดิม ทุกช่องและ record ID ยังคงเดิม ไฟล์ใน public ใช้ผล edit ล่าสุด

```text
Use case: precise-object-edit. Edit this EXACT existing Cozypet 4 by 4 cat photograph atlas, keeping the same square canvas, dimensions, sixteen tile boundaries, photographic style and all cats in their present positions. Make ONE localized correction ONLY in row 2, column 1 (the white flat-faced cat): it must be a real WHITE EXOTIC SHORTHAIR, with clearly SHORT dense plush fur close to the body and cheeks, round face, small rounded upright ears with no long ear tufts, natural flat short muzzle, amber eyes, correct feline anatomy. It currently has overly long wispy Persian fur: remove the long tufts and make this one coat genuinely short-haired. Keep the white coat, friendly calm gaze, cream background and framing. Do NOT change any other tile. In particular the cream-and-white long-haired Persian in row 1, column 3 MUST retain its long fur. Preserve every other cat's identity, coat, eyes, lighting, camera angle and tile composition unchanged. No labels, text, borders, gutters, cartoon, 3D render or watermark. Output a natural pet PHOTOGRAPH atlas, not an illustration.
```

สร้างด้วย built-in `image_gen` วันที่ 2026-10-08 ตามคำขอให้เจนแมวทุกตัว ใช้สิทธิ์เครื่องมือในแชตนี้ ไม่มี API key ภายนอก

## ขอบเขต

- ประกาศแมว 17 records + เรื่องราวแมว 3 records + แมวที่ผู้รับดูแลเลี้ยงอยู่ 108 records = **128 ภาพ**
- แยก identity ตาม record ID แม้ชื่อเหมือนกัน; ไม่เปลี่ยนสี พันธุ์ อายุ ชื่อ หรือข้อมูล persona เพื่อให้ตรงภาพ
- จัดเป็น 8 atlas assets ภาพละ 4×4 ช่อง รวม 16 ตัวต่อไฟล์; เว็บแสดงทีละช่องด้วย SVG clipping โดยไม่แก้ไข raster ต้นฉบับหรือสร้างภาพจากโค้ด
- ไฟล์ใน `public/images/cats/cats-01.png`–`cats-08.png`; mapping อยู่ใน `src/data/cat-photos.generated.ts`
- ลำดับช่องนับจากซ้ายไปขวา บนลงล่าง (index 0–15); ไม่ random เวลา refresh หรือเปลี่ยน Run
- `scan-sample` ใช้ภาพเดียวกับ `listing-001` มะม่วงเพื่อให้ฉากสแกนและประกาศตรงกัน
- `PetImage` รองรับ media เก่าแบบ `art:cat?...&s=<id>` ในข้อมูลเครื่องโดย resolve ID ไปภาพชุดนี้ ไม่ต้องล้างประวัติ demo
- มีป้ายภาพสร้างด้วย AI และ alt; ถ้าไฟล์โหลดไม่ได้แสดง fallback ขนาดเดิม
- Mascot แมวเป็นชุดเดียวกัน 2 expression แยกใน `docs/MASCOT_ASSETS.md`; ไอคอนสลับแมว/หมาเป็น UI icon

## Prompt และทะเบียนช่องภาพ

### cats-01.png

| ช่อง (row, column) | Record ID | ชื่อ |
|---|---|---|
| 1, 1 | `listing-001` | มะม่วง |
| 1, 2 | `listing-002` | ถั่วดำ |
| 1, 3 | `listing-003` | โมจิ |
| 1, 4 | `listing-004` | เจ้าส้ม |
| 2, 1 | `listing-005` | ลาเต้ |
| 2, 2 | `listing-010` | ขนมครก |
| 2, 3 | `listing-011` | ซูชิ |
| 2, 4 | `listing-012` | ขนุน |
| 3, 1 | `listing-014` | แมวที่พบ |
| 3, 2 | `listing-015` | แมวที่พบ |
| 3, 3 | `listing-018` | แมวที่พบ |
| 3, 4 | `listing-019` | แมวที่พบ |
| 4, 1 | `listing-028` | แมวที่พบ |
| 4, 2 | `listing-022` | วุ้นกะทิ |
| 4, 3 | `listing-024` | โอริโอ้ |
| 4, 4 | `listing-025` | ส้มจี๊ด |

```text
Use case: photorealistic-natural. Asset type: a native 4 by 4 photograph atlas for the Cozypet pet rescue demo, sheet 1 of 8.
Create ONE SQUARE, high-resolution image (prefer 2048x2048 or higher) containing EXACTLY SIXTEEN separate PHOTOREALISTIC cat portraits, arranged in an exact seamless 4-column by 4-row grid. Every tile is an equal square, exactly one quarter of the canvas width and height. Each tile is a separate photo with ONE unique ordinary real-life cat, never a cartoon, illustration, toy or 3D render. NO gutters, NO dividing borders, NO captions, NO labels, NO text, NO repeated cats, NO animals spanning tile boundaries. Tile edges must align exactly at 25%, 50%, 75% horizontally and vertically.
Composition per tile: candid pet portrait, whole head and both ears comfortably inside the central 70% of each tile, with upper body visible. Keep 15% breathing room at TOP of each tile so cards may crop the top slightly without cutting ears. Faces near each tile center. Natural proportions, realistic modest-size eyes with correct pupils, clean whiskers and fine fur. All cats alive, calm, healthy, individual and believable, photographed in softly blurred warm cream neutral domestic backgrounds, natural window light in Bangkok. Mix subtly different camera angles and postures for each cat while maintaining visual consistency; focus on eyes and fur. No people, no hands, no leashes, no costumes. Collar appears ONLY when explicitly specified; collar must match specified color.
Read the following as an exact row-major tile assignment; these IDs are instructions only, never visible in the image:
Row 1, column 1 (listing-001): adult ginger-orange tabby and white domestic shorthair, red collar, white tail tip with slight kink; show tail beside body.
Row 1, column 2 (listing-002): adult mostly black domestic shorthair, amber eyes, tiny white chest spot, no collar.
Row 1, column 3 (listing-003): adult pure white domestic shorthair, one blue and one amber eye, BLUE collar.
Row 1, column 4 (listing-004): large adult ginger tabby shorthair, small notch in right ear, no collar.
Row 2, column 1 (listing-005): adult long-haired pale cream cat with fluffy tail, PINK collar.
Row 2, column 2 (listing-010): adult calico domestic shorthair, white black orange patches, orange patch on left ear, YELLOW collar.
Row 2, column 3 (listing-011): adult gray and white domestic shorthair, short tail, RED collar.
Row 2, column 4 (listing-012): young adult orange and white shorthair, tiny black spot on pink nose, no collar.
Row 3, column 1 (listing-014): young adult ginger striped tabby shorthair, long tail curling alongside, affectionate curious gaze, no collar.
Row 3, column 2 (listing-015): small 3-month calico kitten with gently moist clear eyes, healthy natural appearance, no injury, no collar.
Row 3, column 3 (listing-018): slender adult white and black shorthair with black patches, healthy natural appearance, no collar.
Row 3, column 4 (listing-019): large adult solid gray glossy shorthair, BLUE collar.
Row 4, column 1 (listing-028): adult ginger shorthair, slightly kinked tail curling alongside, no collar.
Row 4, column 2 (listing-022): adult female pale cream domestic shorthair, calm gentle gaze, no collar.
Row 4, column 3 (listing-024): adult male black and white tuxedo shorthair, affectionate calm gaze, no collar.
Row 4, column 4 (listing-025): young adult female orange and white shorthair, alert playful gaze, no collar.
Accurate coat and breed matter more than superficial cuteness. Preserve the sixteen different individuals, no face duplicates. Do not turn the grid into a group photograph. Each assigned cat belongs only in its assigned square. Plain natural creamy backgrounds may differ subtly across squares. NO watermark, logo, typography, symbols, hearts, money, cages or injury. Lifelike pet photography throughout.
```

### cats-02.png

| ช่อง (row, column) | Record ID | ชื่อ |
|---|---|---|
| 1, 1 | `listing-027` | ทับทิม |
| 1, 2 | `story-001` | ขนมชั้น |
| 1, 3 | `story-004` | ส้มส้ม |
| 1, 4 | `story-005` | ไข่ตุ๋น |
| 2, 1 | `adopter-001-pet-1` | ขนมปัง |
| 2, 2 | `adopter-001-pet-2` | มอคค่า |
| 2, 3 | `adopter-002-pet-1` | ซาลาเปา |
| 2, 4 | `adopter-004-pet-1` | ข้าวต้ม |
| 3, 1 | `adopter-005-pet-1` | มะปราง |
| 3, 2 | `adopter-005-pet-2` | ถั่วแดง |
| 3, 3 | `adopter-007-pet-1` | ส้มฉุน |
| 3, 4 | `adopter-007-pet-2` | ปุยนุ่น |
| 4, 1 | `adopter-007-pet-3` | ด่างดำ |
| 4, 2 | `adopter-009-pet-1` | เอสเพรสโซ |
| 4, 3 | `adopter-009-pet-2` | ลาเต้ |
| 4, 4 | `adopter-010-pet-1` | บุหงา |

```text
Use case: photorealistic-natural. Asset type: a native 4 by 4 photograph atlas for the Cozypet pet rescue demo, sheet 2 of 8.
Create ONE SQUARE, high-resolution image (prefer 2048x2048 or higher) containing EXACTLY SIXTEEN separate PHOTOREALISTIC cat portraits, arranged in an exact seamless 4-column by 4-row grid. Every tile is an equal square, exactly one quarter of the canvas width and height. Each tile is a separate photo with ONE unique ordinary real-life cat, never a cartoon, illustration, toy or 3D render. NO gutters, NO dividing borders, NO captions, NO labels, NO text, NO repeated cats, NO animals spanning tile boundaries. Tile edges must align exactly at 25%, 50%, 75% horizontally and vertically.
Composition per tile: candid pet portrait, whole head and both ears comfortably inside the central 70% of each tile, with upper body visible. Keep 15% breathing room at TOP of each tile so cards may crop the top slightly without cutting ears. Faces near each tile center. Natural proportions, realistic modest-size eyes with correct pupils, clean whiskers and fine fur. All cats alive, calm, healthy, individual and believable, photographed in softly blurred warm cream neutral domestic backgrounds, natural window light in Bangkok. Mix subtly different camera angles and postures for each cat while maintaining visual consistency; focus on eyes and fur. No people, no hands, no leashes, no costumes. Collar appears ONLY when explicitly specified; collar must match specified color.
Read the following as an exact row-major tile assignment; these IDs are instructions only, never visible in the image:
Row 1, column 1 (listing-027): small 4-month female calico kitten, no collar.
Row 1, column 2 (story-001): small calico kitten with a subtle natural heart-shaped forehead patch, no collar.
Row 1, column 3 (story-004): adult ginger orange tabby shorthair, slight kink at tail tip, no collar.
Row 1, column 4 (story-005): young adult cream shorthair cat, calm affectionate expression, no collar.
Row 2, column 1 (adopter-001-pet-1): 3-year-old male Thai mixed-breed domestic shorthair; coat: ginger orange striped tabby; no collar.
Row 2, column 2 (adopter-001-pet-2): 2-year-old female Korat (heart-shaped face, silver-tipped gray short fur, green eyes); coat: solid silver gray; no collar.
Row 2, column 3 (adopter-002-pet-1): 3-year-old male British Shorthair (round face, dense plush short fur); coat: pale cream; no collar.
Row 2, column 4 (adopter-004-pet-1): 1-year-old male Thai mixed-breed domestic shorthair; coat: white with black patches; no collar.
Row 3, column 1 (adopter-005-pet-1): 4-year-old female Thai mixed-breed domestic shorthair; coat: orange and white; no collar.
Row 3, column 2 (adopter-005-pet-2): 2-year-old male Thai mixed-breed domestic shorthair; coat: brown striped tabby; no collar.
Row 3, column 3 (adopter-007-pet-1): 9-year-old male Thai mixed-breed domestic shorthair; coat: ginger orange; no collar.
Row 3, column 4 (adopter-007-pet-2): 7-year-old female Persian (long soft fur, rounded face, natural anatomy); coat: pure white; no collar.
Row 4, column 1 (adopter-007-pet-3): 8-year-old male Thai mixed-breed domestic shorthair; coat: white with black patches; no collar.
Row 4, column 2 (adopter-009-pet-1): 3-year-old male Thai mixed-breed domestic shorthair; coat: solid black; no collar.
Row 4, column 3 (adopter-009-pet-2): 3-year-old female Thai mixed-breed domestic shorthair; coat: pale cream; no collar.
Row 4, column 4 (adopter-010-pet-1): 4-year-old female Siamese (slender body, brown seal points on face ears paws tail, blue eyes); coat: cream with brown seal points; no collar.
Accurate coat and breed matter more than superficial cuteness. Preserve the sixteen different individuals, no face duplicates. Do not turn the grid into a group photograph. Each assigned cat belongs only in its assigned square. Plain natural creamy backgrounds may differ subtly across squares. NO watermark, logo, typography, symbols, hearts, money, cages or injury. Lifelike pet photography throughout.
```

### cats-03.png

| ช่อง (row, column) | Record ID | ชื่อ |
|---|---|---|
| 1, 1 | `adopter-011-pet-3` | ทองหยิบ |
| 1, 2 | `adopter-012-pet-1` | หมึก |
| 1, 3 | `adopter-013-pet-2` | ตะปู |
| 1, 4 | `adopter-014-pet-1` | มาการอง |
| 2, 1 | `adopter-015-pet-1` | เจ้าเหลือง |
| 2, 2 | `adopter-015-pet-2` | ลำดวน |
| 2, 3 | `adopter-016-pet-1` | มอลต์ |
| 2, 4 | `adopter-018-pet-2` | กุหลาบ |
| 3, 1 | `adopter-020-pet-1` | กระดุม |
| 3, 2 | `adopter-020-pet-2` | ผ้าไหม |
| 3, 3 | `adopter-020-pet-3` | เข็ม |
| 3, 4 | `adopter-021-pet-1` | ครัวซองต์ |
| 4, 1 | `adopter-022-pet-1` | มะลิ |
| 4, 2 | `adopter-022-pet-2` | ข้าวหลาม |
| 4, 3 | `adopter-024-pet-1` | โมจิ |
| 4, 4 | `adopter-025-pet-1` | เจ้าขาว |

```text
Use case: photorealistic-natural. Asset type: a native 4 by 4 photograph atlas for the Cozypet pet rescue demo, sheet 3 of 8.
Create ONE SQUARE, high-resolution image (prefer 2048x2048 or higher) containing EXACTLY SIXTEEN separate PHOTOREALISTIC cat portraits, arranged in an exact seamless 4-column by 4-row grid. Every tile is an equal square, exactly one quarter of the canvas width and height. Each tile is a separate photo with ONE unique ordinary real-life cat, never a cartoon, illustration, toy or 3D render. NO gutters, NO dividing borders, NO captions, NO labels, NO text, NO repeated cats, NO animals spanning tile boundaries. Tile edges must align exactly at 25%, 50%, 75% horizontally and vertically.
Composition per tile: candid pet portrait, whole head and both ears comfortably inside the central 70% of each tile, with upper body visible. Keep 15% breathing room at TOP of each tile so cards may crop the top slightly without cutting ears. Faces near each tile center. Natural proportions, realistic modest-size eyes with correct pupils, clean whiskers and fine fur. All cats alive, calm, healthy, individual and believable, photographed in softly blurred warm cream neutral domestic backgrounds, natural window light in Bangkok. Mix subtly different camera angles and postures for each cat while maintaining visual consistency; focus on eyes and fur. No people, no hands, no leashes, no costumes. Collar appears ONLY when explicitly specified; collar must match specified color.
Read the following as an exact row-major tile assignment; these IDs are instructions only, never visible in the image:
Row 1, column 1 (adopter-011-pet-3): 2-year-old female Thai mixed-breed domestic shorthair; coat: ginger orange; no collar.
Row 1, column 2 (adopter-012-pet-1): 5-year-old male Thai mixed-breed domestic shorthair; coat: solid black; no collar.
Row 1, column 3 (adopter-013-pet-2): 4-year-old male Thai mixed-breed domestic shorthair; coat: solid gray; no collar.
Row 1, column 4 (adopter-014-pet-1): 2-year-old female Ragdoll (long fur, brown seal points, vivid blue eyes); coat: cream with brown seal points and blue eyes; no collar.
Row 2, column 1 (adopter-015-pet-1): 6-year-old male Thai mixed-breed domestic shorthair; coat: ginger orange; no collar.
Row 2, column 2 (adopter-015-pet-2): 5-year-old female Thai mixed-breed domestic shorthair; coat: white black and orange calico; no collar.
Row 2, column 3 (adopter-016-pet-1): 3-year-old male British Shorthair (round face, dense plush short fur); coat: solid blue-gray; no collar.
Row 2, column 4 (adopter-018-pet-2): 3-year-old female Thai mixed-breed domestic shorthair; coat: orange and white; no collar.
Row 3, column 1 (adopter-020-pet-1): 5-year-old female Khao Manee (pure white short fur, odd-colored blue and amber eyes); coat: pure white, one blue eye and one amber eye; no collar.
Row 3, column 2 (adopter-020-pet-2): 6-year-old female Persian (long soft fur, rounded face, natural anatomy); coat: solid gray; no collar.
Row 3, column 3 (adopter-020-pet-3): 4-year-old male Thai mixed-breed domestic shorthair; coat: ginger orange; no collar.
Row 3, column 4 (adopter-021-pet-1): 2-year-old male Thai mixed-breed domestic shorthair; coat: orange and white; no collar.
Row 4, column 1 (adopter-022-pet-1): 3-year-old female Thai mixed-breed domestic shorthair; coat: pure white; no collar.
Row 4, column 2 (adopter-022-pet-2): 2-year-old male Thai mixed-breed domestic shorthair; coat: pale cream; no collar.
Row 4, column 3 (adopter-024-pet-1): 1-year-old female American Shorthair (classic silver-and-black tabby swirls, short fur); coat: silver classic tabby swirls; no collar.
Row 4, column 4 (adopter-025-pet-1): 8-year-old male Thai mixed-breed domestic shorthair; coat: pure white; no collar.
Accurate coat and breed matter more than superficial cuteness. Preserve the sixteen different individuals, no face duplicates. Do not turn the grid into a group photograph. Each assigned cat belongs only in its assigned square. Plain natural creamy backgrounds may differ subtly across squares. NO watermark, logo, typography, symbols, hearts, money, cages or injury. Lifelike pet photography throughout.
```

### cats-04.png

| ช่อง (row, column) | Record ID | ชื่อ |
|---|---|---|
| 1, 1 | `adopter-026-pet-1` | สมาธิ |
| 1, 2 | `adopter-027-pet-1` | บั๊ก |
| 1, 3 | `adopter-027-pet-2` | ฟีเจอร์ |
| 1, 4 | `adopter-028-pet-1` | ทองหยอด |
| 2, 1 | `adopter-028-pet-2` | ฝอยทอง |
| 2, 2 | `adopter-030-pet-2` | น้ำตาล |
| 2, 3 | `adopter-033-pet-1` | ภาษี |
| 2, 4 | `adopter-034-pet-1` | ข้าวมัน |
| 3, 1 | `adopter-034-pet-2` | ไก่ทอด |
| 3, 2 | `adopter-034-pet-3` | แกงเขียว |
| 3, 3 | `adopter-035-pet-1` | ดินสอ |
| 3, 4 | `adopter-035-pet-2` | สเก็ตช์ |
| 4, 1 | `adopter-036-pet-1` | ขนมชั้น |
| 4, 2 | `adopter-037-pet-1` | คอร์ด |
| 4, 3 | `adopter-038-pet-2` | ครามดำ |
| 4, 4 | `adopter-042-pet-1` | เงาะ |

```text
Use case: photorealistic-natural. Asset type: a native 4 by 4 photograph atlas for the Cozypet pet rescue demo, sheet 4 of 8.
Create ONE SQUARE, high-resolution image (prefer 2048x2048 or higher) containing EXACTLY SIXTEEN separate PHOTOREALISTIC cat portraits, arranged in an exact seamless 4-column by 4-row grid. Every tile is an equal square, exactly one quarter of the canvas width and height. Each tile is a separate photo with ONE unique ordinary real-life cat, never a cartoon, illustration, toy or 3D render. NO gutters, NO dividing borders, NO captions, NO labels, NO text, NO repeated cats, NO animals spanning tile boundaries. Tile edges must align exactly at 25%, 50%, 75% horizontally and vertically.
Composition per tile: candid pet portrait, whole head and both ears comfortably inside the central 70% of each tile, with upper body visible. Keep 15% breathing room at TOP of each tile so cards may crop the top slightly without cutting ears. Faces near each tile center. Natural proportions, realistic modest-size eyes with correct pupils, clean whiskers and fine fur. All cats alive, calm, healthy, individual and believable, photographed in softly blurred warm cream neutral domestic backgrounds, natural window light in Bangkok. Mix subtly different camera angles and postures for each cat while maintaining visual consistency; focus on eyes and fur. No people, no hands, no leashes, no costumes. Collar appears ONLY when explicitly specified; collar must match specified color.
Read the following as an exact row-major tile assignment; these IDs are instructions only, never visible in the image:
Row 1, column 1 (adopter-026-pet-1): 4-year-old female Korat (heart-shaped face, silver-tipped gray short fur, green eyes); coat: solid silver-gray; no collar.
Row 1, column 2 (adopter-027-pet-1): 3-year-old male Thai mixed-breed domestic shorthair; coat: white with black patches; no collar.
Row 1, column 3 (adopter-027-pet-2): 2-year-old male Thai mixed-breed domestic shorthair; coat: ginger orange; no collar.
Row 1, column 4 (adopter-028-pet-1): 10-year-old female Thai mixed-breed domestic shorthair; coat: ginger orange; no collar.
Row 2, column 1 (adopter-028-pet-2): 9-year-old female Thai mixed-breed domestic shorthair; coat: orange and white; no collar.
Row 2, column 2 (adopter-030-pet-2): 3-year-old male Thai mixed-breed domestic shorthair; coat: brown striped tabby; no collar.
Row 2, column 3 (adopter-033-pet-1): 4-year-old male Thai mixed-breed domestic shorthair; coat: ginger orange; no collar.
Row 2, column 4 (adopter-034-pet-1): 5-year-old male Thai mixed-breed domestic shorthair; coat: pure white; no collar.
Row 3, column 1 (adopter-034-pet-2): 4-year-old male Thai mixed-breed domestic shorthair; coat: ginger orange; no collar.
Row 3, column 2 (adopter-034-pet-3): 3-year-old female Thai mixed-breed domestic shorthair; coat: gray tabby stripes; no collar.
Row 3, column 3 (adopter-035-pet-1): 2-year-old male Thai mixed-breed domestic shorthair; coat: solid black; no collar.
Row 3, column 4 (adopter-035-pet-2): 2-year-old female Thai mixed-breed domestic shorthair; coat: white with black patches; no collar.
Row 4, column 1 (adopter-036-pet-1): 6-year-old female Thai mixed-breed domestic shorthair; coat: white black and orange calico; no collar.
Row 4, column 2 (adopter-037-pet-1): 2-year-old male Thai mixed-breed domestic shorthair; coat: ginger orange; no collar.
Row 4, column 3 (adopter-038-pet-2): 4-year-old male Thai mixed-breed domestic shorthair; coat: white with black patches; no collar.
Row 4, column 4 (adopter-042-pet-1): 3-year-old female Thai mixed-breed domestic shorthair; coat: ginger orange; no collar.
Accurate coat and breed matter more than superficial cuteness. Preserve the sixteen different individuals, no face duplicates. Do not turn the grid into a group photograph. Each assigned cat belongs only in its assigned square. Plain natural creamy backgrounds may differ subtly across squares. NO watermark, logo, typography, symbols, hearts, money, cages or injury. Lifelike pet photography throughout.
```

### cats-05.png

| ช่อง (row, column) | Record ID | ชื่อ |
|---|---|---|
| 1, 1 | `adopter-042-pet-2` | ลำไย |
| 1, 2 | `adopter-044-pet-1` | จดหมาย |
| 1, 3 | `adopter-046-pet-1` | ข้าวปั้น |
| 1, 4 | `adopter-046-pet-2` | สาหร่าย |
| 2, 1 | `adopter-047-pet-2` | นัตตะ |
| 2, 2 | `adopter-048-pet-3` | เอื้อง |
| 2, 3 | `adopter-049-pet-1` | อะลีฟ |
| 2, 4 | `adopter-049-pet-2` | นูร์ |
| 3, 1 | `adopter-051-pet-1` | เจล |
| 3, 2 | `adopter-054-pet-1` | นายพล |
| 3, 3 | `adopter-054-pet-2` | ทองแดง |
| 3, 4 | `adopter-056-pet-1` | ตัวหนังสือ |
| 4, 1 | `adopter-056-pet-2` | สารบัญ |
| 4, 2 | `adopter-056-pet-3` | ปกแข็ง |
| 4, 3 | `adopter-057-pet-1` | โน้ต |
| 4, 4 | `adopter-059-pet-1` | ลูกปัด |

```text
Use case: photorealistic-natural. Asset type: a native 4 by 4 photograph atlas for the Cozypet pet rescue demo, sheet 5 of 8.
Create ONE SQUARE, high-resolution image (prefer 2048x2048 or higher) containing EXACTLY SIXTEEN separate PHOTOREALISTIC cat portraits, arranged in an exact seamless 4-column by 4-row grid. Every tile is an equal square, exactly one quarter of the canvas width and height. Each tile is a separate photo with ONE unique ordinary real-life cat, never a cartoon, illustration, toy or 3D render. NO gutters, NO dividing borders, NO captions, NO labels, NO text, NO repeated cats, NO animals spanning tile boundaries. Tile edges must align exactly at 25%, 50%, 75% horizontally and vertically.
Composition per tile: candid pet portrait, whole head and both ears comfortably inside the central 70% of each tile, with upper body visible. Keep 15% breathing room at TOP of each tile so cards may crop the top slightly without cutting ears. Faces near each tile center. Natural proportions, realistic modest-size eyes with correct pupils, clean whiskers and fine fur. All cats alive, calm, healthy, individual and believable, photographed in softly blurred warm cream neutral domestic backgrounds, natural window light in Bangkok. Mix subtly different camera angles and postures for each cat while maintaining visual consistency; focus on eyes and fur. No people, no hands, no leashes, no costumes. Collar appears ONLY when explicitly specified; collar must match specified color.
Read the following as an exact row-major tile assignment; these IDs are instructions only, never visible in the image:
Row 1, column 1 (adopter-042-pet-2): 2-year-old male Thai mixed-breed domestic shorthair; coat: light brown; no collar.
Row 1, column 2 (adopter-044-pet-1): 4-year-old female Thai mixed-breed domestic shorthair; coat: white and gray patches; no collar.
Row 1, column 3 (adopter-046-pet-1): 3-year-old female Scottish Straight (upright ears, round face, plush short fur); coat: pale cream; no collar.
Row 1, column 4 (adopter-046-pet-2): 3-year-old male Thai mixed-breed domestic shorthair; coat: solid black; no collar.
Row 2, column 1 (adopter-047-pet-2): 2-year-old female Thai mixed-breed domestic shorthair; coat: orange and white; no collar.
Row 2, column 2 (adopter-048-pet-3): 4-year-old female Thai mixed-breed domestic shorthair; coat: ginger orange; no collar.
Row 2, column 3 (adopter-049-pet-1): 4-year-old male Thai mixed-breed domestic shorthair; coat: white and orange patches; no collar.
Row 2, column 4 (adopter-049-pet-2): 3-year-old female Thai mixed-breed domestic shorthair; coat: pure white; no collar.
Row 3, column 1 (adopter-051-pet-1): 3-year-old male Thai mixed-breed domestic shorthair; coat: white and gray patches; no collar.
Row 3, column 2 (adopter-054-pet-1): 6-year-old male Siamese (slender body, brown seal points on face ears paws tail, blue eyes); coat: cream with brown seal points; no collar.
Row 3, column 3 (adopter-054-pet-2): 4-year-old female Suphalak (solid warm copper-brown short fur); coat: solid warm copper brown; no collar.
Row 3, column 4 (adopter-056-pet-1): 5-year-old male Thai mixed-breed domestic shorthair; coat: white with black patches; no collar.
Row 4, column 1 (adopter-056-pet-2): 4-year-old female Thai mixed-breed domestic shorthair; coat: solid gray; no collar.
Row 4, column 2 (adopter-056-pet-3): 3-year-old male Thai mixed-breed domestic shorthair; coat: ginger orange; no collar.
Row 4, column 3 (adopter-057-pet-1): 4-year-old male Maine Coon (large long-haired silver tabby, ear tufts, square muzzle); coat: silver tabby stripes; no collar.
Row 4, column 4 (adopter-059-pet-1): 2-year-old female Thai mixed-breed domestic shorthair; coat: orange and white; no collar.
Accurate coat and breed matter more than superficial cuteness. Preserve the sixteen different individuals, no face duplicates. Do not turn the grid into a group photograph. Each assigned cat belongs only in its assigned square. Plain natural creamy backgrounds may differ subtly across squares. NO watermark, logo, typography, symbols, hearts, money, cages or injury. Lifelike pet photography throughout.
```

### cats-06.png

| ช่อง (row, column) | Record ID | ชื่อ |
|---|---|---|
| 1, 1 | `adopter-061-pet-1` | ขนมครก |
| 1, 2 | `adopter-061-pet-2` | ทองม้วน |
| 1, 3 | `adopter-063-pet-1` | ส้มจีน |
| 1, 4 | `adopter-063-pet-2` | มะลิลา |
| 2, 1 | `adopter-064-pet-3` | นกหวีด |
| 2, 2 | `adopter-065-pet-1` | ปุยปุย |
| 2, 3 | `adopter-066-pet-1` | ข่าวสด |
| 2, 4 | `adopter-067-pet-1` | ส้มซ่า |
| 3, 1 | `adopter-067-pet-2` | ส้มตำ |
| 3, 2 | `adopter-067-pet-3` | ส้มเช้ง |
| 3, 3 | `adopter-069-pet-1` | ม่านแดง |
| 3, 4 | `adopter-072-pet-1` | ปรัชญา |
| 4, 1 | `adopter-072-pet-2` | ตรรกะ |
| 4, 2 | `adopter-072-pet-3` | วิจัย |
| 4, 3 | `adopter-074-pet-1` | ช็อต |
| 4, 4 | `adopter-075-pet-1` | ดินเผา |

```text
Use case: photorealistic-natural. Asset type: a native 4 by 4 photograph atlas for the Cozypet pet rescue demo, sheet 6 of 8.
Create ONE SQUARE, high-resolution image (prefer 2048x2048 or higher) containing EXACTLY SIXTEEN separate PHOTOREALISTIC cat portraits, arranged in an exact seamless 4-column by 4-row grid. Every tile is an equal square, exactly one quarter of the canvas width and height. Each tile is a separate photo with ONE unique ordinary real-life cat, never a cartoon, illustration, toy or 3D render. NO gutters, NO dividing borders, NO captions, NO labels, NO text, NO repeated cats, NO animals spanning tile boundaries. Tile edges must align exactly at 25%, 50%, 75% horizontally and vertically.
Composition per tile: candid pet portrait, whole head and both ears comfortably inside the central 70% of each tile, with upper body visible. Keep 15% breathing room at TOP of each tile so cards may crop the top slightly without cutting ears. Faces near each tile center. Natural proportions, realistic modest-size eyes with correct pupils, clean whiskers and fine fur. All cats alive, calm, healthy, individual and believable, photographed in softly blurred warm cream neutral domestic backgrounds, natural window light in Bangkok. Mix subtly different camera angles and postures for each cat while maintaining visual consistency; focus on eyes and fur. No people, no hands, no leashes, no costumes. Collar appears ONLY when explicitly specified; collar must match specified color.
Read the following as an exact row-major tile assignment; these IDs are instructions only, never visible in the image:
Row 1, column 1 (adopter-061-pet-1): 4-year-old female Exotic Shorthair (round face, short plush fur, natural eyes); coat: ginger orange; no collar.
Row 1, column 2 (adopter-061-pet-2): 3-year-old male Thai mixed-breed domestic shorthair; coat: ginger orange striped tabby; no collar.
Row 1, column 3 (adopter-063-pet-1): 11-year-old female Thai mixed-breed domestic shorthair; coat: ginger orange; no collar.
Row 1, column 4 (adopter-063-pet-2): 12-year-old female Thai mixed-breed domestic shorthair; coat: pure white; no collar.
Row 2, column 1 (adopter-064-pet-3): 2-year-old male Thai mixed-breed domestic shorthair; coat: white and orange patches; no collar.
Row 2, column 2 (adopter-065-pet-1): 3-year-old female Thai mixed-breed domestic shorthair; coat: white and pale cream; no collar.
Row 2, column 3 (adopter-066-pet-1): 5-year-old male Thai mixed-breed domestic shorthair; coat: gray tabby stripes; no collar.
Row 2, column 4 (adopter-067-pet-1): 3-year-old male Thai mixed-breed domestic shorthair; coat: ginger orange; no collar.
Row 3, column 1 (adopter-067-pet-2): 2-year-old female Thai mixed-breed domestic shorthair; coat: ginger orange striped tabby; no collar.
Row 3, column 2 (adopter-067-pet-3): 1-year-old male Thai mixed-breed domestic shorthair; coat: orange and white; no collar.
Row 3, column 3 (adopter-069-pet-1): 3-year-old female Siamese (slender body, brown seal points on face ears paws tail, blue eyes); coat: cream with brown seal points; no collar.
Row 3, column 4 (adopter-072-pet-1): 7-year-old male Thai mixed-breed domestic shorthair; coat: solid black; no collar.
Row 4, column 1 (adopter-072-pet-2): 6-year-old female Thai mixed-breed domestic shorthair; coat: solid gray; no collar.
Row 4, column 2 (adopter-072-pet-3): 4-year-old male Thai mixed-breed domestic shorthair; coat: white with black patches; no collar.
Row 4, column 3 (adopter-074-pet-1): 2-year-old male Thai mixed-breed domestic shorthair; coat: solid dark brown; no collar.
Row 4, column 4 (adopter-075-pet-1): 3-year-old male Thai mixed-breed domestic shorthair; coat: ginger orange striped tabby; no collar.
Accurate coat and breed matter more than superficial cuteness. Preserve the sixteen different individuals, no face duplicates. Do not turn the grid into a group photograph. Each assigned cat belongs only in its assigned square. Plain natural creamy backgrounds may differ subtly across squares. NO watermark, logo, typography, symbols, hearts, money, cages or injury. Lifelike pet photography throughout.
```

### cats-07.png

| ช่อง (row, column) | Record ID | ชื่อ |
|---|---|---|
| 1, 1 | `adopter-075-pet-2` | เคลือบ |
| 1, 2 | `adopter-076-pet-1` | โซ่ |
| 1, 3 | `adopter-077-pet-1` | ลิ้นจี่ |
| 1, 4 | `adopter-077-pet-2` | มังคุด |
| 2, 1 | `adopter-079-pet-1` | มะลิ |
| 2, 2 | `adopter-079-pet-2` | กระเจี๊ยบ |
| 2, 3 | `adopter-081-pet-1` | ฟ้าคราม |
| 2, 4 | `adopter-082-pet-1` | ริฟฟ์ |
| 3, 1 | `adopter-082-pet-2` | โซโล่ |
| 3, 2 | `adopter-084-pet-1` | ไรเดอร์ |
| 3, 3 | `adopter-085-pet-1` | ครีมบรูเล่ |
| 3, 4 | `adopter-085-pet-2` | มัทฉะ |
| 4, 1 | `adopter-086-pet-2` | อาโม |
| 4, 2 | `adopter-087-pet-1` | ทองคำ |
| 4, 3 | `adopter-087-pet-2` | มรกต |
| 4, 4 | `adopter-089-pet-1` | คุกกี้ |

```text
Use case: photorealistic-natural. Asset type: a native 4 by 4 photograph atlas for the Cozypet pet rescue demo, sheet 7 of 8.
Create ONE SQUARE, high-resolution image (prefer 2048x2048 or higher) containing EXACTLY SIXTEEN separate PHOTOREALISTIC cat portraits, arranged in an exact seamless 4-column by 4-row grid. Every tile is an equal square, exactly one quarter of the canvas width and height. Each tile is a separate photo with ONE unique ordinary real-life cat, never a cartoon, illustration, toy or 3D render. NO gutters, NO dividing borders, NO captions, NO labels, NO text, NO repeated cats, NO animals spanning tile boundaries. Tile edges must align exactly at 25%, 50%, 75% horizontally and vertically.
Composition per tile: candid pet portrait, whole head and both ears comfortably inside the central 70% of each tile, with upper body visible. Keep 15% breathing room at TOP of each tile so cards may crop the top slightly without cutting ears. Faces near each tile center. Natural proportions, realistic modest-size eyes with correct pupils, clean whiskers and fine fur. All cats alive, calm, healthy, individual and believable, photographed in softly blurred warm cream neutral domestic backgrounds, natural window light in Bangkok. Mix subtly different camera angles and postures for each cat while maintaining visual consistency; focus on eyes and fur. No people, no hands, no leashes, no costumes. Collar appears ONLY when explicitly specified; collar must match specified color.
Read the following as an exact row-major tile assignment; these IDs are instructions only, never visible in the image:
Row 1, column 1 (adopter-075-pet-2): 3-year-old female Thai mixed-breed domestic shorthair; coat: pale cream; no collar.
Row 1, column 2 (adopter-076-pet-1): 2-year-old male Thai mixed-breed domestic shorthair; coat: gray tabby stripes; no collar.
Row 1, column 3 (adopter-077-pet-1): 4-year-old female Thai mixed-breed domestic shorthair; coat: white and orange patches; no collar.
Row 1, column 4 (adopter-077-pet-2): 3-year-old male Thai mixed-breed domestic shorthair; coat: solid black; no collar.
Row 2, column 1 (adopter-079-pet-1): 4-year-old female Thai mixed-breed domestic shorthair; coat: pure white; no collar.
Row 2, column 2 (adopter-079-pet-2): 3-year-old female Thai mixed-breed domestic shorthair; coat: ginger orange striped tabby; no collar.
Row 2, column 3 (adopter-081-pet-1): 2-year-old female Thai mixed-breed domestic shorthair; coat: solid blue-gray; no collar.
Row 2, column 4 (adopter-082-pet-1): 3-year-old male Bengal (golden fur with distinct dark rosettes, athletic body); coat: golden spotted rosettes; no collar.
Row 3, column 1 (adopter-082-pet-2): 4-year-old female Thai mixed-breed domestic shorthair; coat: solid black; no collar.
Row 3, column 2 (adopter-084-pet-1): 2-year-old male Thai mixed-breed domestic shorthair; coat: ginger orange; no collar.
Row 3, column 3 (adopter-085-pet-1): 3-year-old female Thai mixed-breed domestic shorthair; coat: pale cream; no collar.
Row 3, column 4 (adopter-085-pet-2): 2-year-old male Thai mixed-breed domestic shorthair; coat: solid black; no collar.
Row 4, column 1 (adopter-086-pet-2): 3-year-old male Thai mixed-breed domestic shorthair; coat: white and gray patches; no collar.
Row 4, column 2 (adopter-087-pet-1): 5-year-old female Suphalak (solid warm copper-brown short fur); coat: solid warm copper brown; no collar.
Row 4, column 3 (adopter-087-pet-2): 4-year-old female Siamese (slender body, brown seal points on face ears paws tail, blue eyes); coat: cream with brown seal points; no collar.
Row 4, column 4 (adopter-089-pet-1): 3-year-old male Thai mixed-breed domestic shorthair; coat: brown striped tabby; no collar.
Accurate coat and breed matter more than superficial cuteness. Preserve the sixteen different individuals, no face duplicates. Do not turn the grid into a group photograph. Each assigned cat belongs only in its assigned square. Plain natural creamy backgrounds may differ subtly across squares. NO watermark, logo, typography, symbols, hearts, money, cages or injury. Lifelike pet photography throughout.
```

### cats-08.png

| ช่อง (row, column) | Record ID | ชื่อ |
|---|---|---|
| 1, 1 | `adopter-089-pet-2` | บราวนี่ |
| 1, 2 | `adopter-091-pet-1` | ยาหอม |
| 1, 3 | `adopter-091-pet-2` | สำลี |
| 1, 4 | `adopter-091-pet-3` | ผ้าก๊อซ |
| 2, 1 | `adopter-093-pet-1` | บับเบิ้ล |
| 2, 2 | `adopter-094-pet-2` | ท่าน้ำ |
| 2, 3 | `adopter-095-pet-1` | อินทผลัม |
| 2, 4 | `adopter-095-pet-2` | ซัยตูน |
| 3, 1 | `adopter-097-pet-3` | ชอล์ก |
| 3, 2 | `adopter-097-pet-4` | กระดาน |
| 3, 3 | `adopter-098-pet-1` | เซนเซอร์ |
| 3, 4 | `adopter-098-pet-2` | มอเตอร์ |
| 4, 1 | `adopter-099-pet-1` | ฝ้ายคำ |
| 4, 2 | `adopter-099-pet-2` | ด้ายแดง |
| 4, 3 | `adopter-100-pet-1` | ทองเค |
| 4, 4 | `adopter-100-pet-2` | เงินยวง |

```text
Use case: photorealistic-natural. Asset type: a native 4 by 4 photograph atlas for the Cozypet pet rescue demo, sheet 8 of 8.
Create ONE SQUARE, high-resolution image (prefer 2048x2048 or higher) containing EXACTLY SIXTEEN separate PHOTOREALISTIC cat portraits, arranged in an exact seamless 4-column by 4-row grid. Every tile is an equal square, exactly one quarter of the canvas width and height. Each tile is a separate photo with ONE unique ordinary real-life cat, never a cartoon, illustration, toy or 3D render. NO gutters, NO dividing borders, NO captions, NO labels, NO text, NO repeated cats, NO animals spanning tile boundaries. Tile edges must align exactly at 25%, 50%, 75% horizontally and vertically.
Composition per tile: candid pet portrait, whole head and both ears comfortably inside the central 70% of each tile, with upper body visible. Keep 15% breathing room at TOP of each tile so cards may crop the top slightly without cutting ears. Faces near each tile center. Natural proportions, realistic modest-size eyes with correct pupils, clean whiskers and fine fur. All cats alive, calm, healthy, individual and believable, photographed in softly blurred warm cream neutral domestic backgrounds, natural window light in Bangkok. Mix subtly different camera angles and postures for each cat while maintaining visual consistency; focus on eyes and fur. No people, no hands, no leashes, no costumes. Collar appears ONLY when explicitly specified; collar must match specified color.
Read the following as an exact row-major tile assignment; these IDs are instructions only, never visible in the image:
Row 1, column 1 (adopter-089-pet-2): 2-year-old female Thai mixed-breed domestic shorthair; coat: solid dark brown; no collar.
Row 1, column 2 (adopter-091-pet-1): 10-year-old female Thai mixed-breed domestic shorthair; coat: pure white; no collar.
Row 1, column 3 (adopter-091-pet-2): 9-year-old female Persian (long soft fur, rounded face, natural anatomy); coat: white and pale cream; no collar.
Row 1, column 4 (adopter-091-pet-3): 8-year-old male Thai mixed-breed domestic shorthair; coat: solid gray; no collar.
Row 2, column 1 (adopter-093-pet-1): 2-year-old female Exotic Shorthair (round face, short plush fur, natural eyes); coat: pure white; no collar.
Row 2, column 2 (adopter-094-pet-2): 4-year-old female Thai mixed-breed domestic shorthair; coat: brown striped tabby; no collar.
Row 2, column 3 (adopter-095-pet-1): 4-year-old male Thai mixed-breed domestic shorthair; coat: warm orange-brown; no collar.
Row 2, column 4 (adopter-095-pet-2): 3-year-old female Thai mixed-breed domestic shorthair; coat: gray fur with GREEN eyes; no collar.
Row 3, column 1 (adopter-097-pet-3): 3-year-old female Thai mixed-breed domestic shorthair; coat: pure white; no collar.
Row 3, column 2 (adopter-097-pet-4): 3-year-old male Thai mixed-breed domestic shorthair; coat: solid black; no collar.
Row 3, column 3 (adopter-098-pet-1): 3-year-old male Thai mixed-breed domestic shorthair; coat: white with black patches; no collar.
Row 3, column 4 (adopter-098-pet-2): 2-year-old male Thai mixed-breed domestic shorthair; coat: ginger orange; no collar.
Row 4, column 1 (adopter-099-pet-1): 1-year-old female Thai mixed-breed domestic shorthair; coat: orange and white; no collar.
Row 4, column 2 (adopter-099-pet-2): 1-year-old male Thai mixed-breed domestic shorthair; coat: brown mackerel tabby stripes; no collar.
Row 4, column 3 (adopter-100-pet-1): 6-year-old male Thai mixed-breed domestic shorthair; coat: golden ginger orange; no collar.
Row 4, column 4 (adopter-100-pet-2): 5-year-old female Korat (heart-shaped face, silver-tipped gray short fur, green eyes); coat: solid silver-gray; no collar.
Accurate coat and breed matter more than superficial cuteness. Preserve the sixteen different individuals, no face duplicates. Do not turn the grid into a group photograph. Each assigned cat belongs only in its assigned square. Plain natural creamy backgrounds may differ subtly across squares. NO watermark, logo, typography, symbols, hearts, money, cages or injury. Lifelike pet photography throughout.
```
