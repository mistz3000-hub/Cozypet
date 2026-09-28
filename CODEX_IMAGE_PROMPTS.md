# CODEX_IMAGE_PROMPTS.md — รายละเอียด persona และคำสั่งสร้างภาพสำหรับ Codex

> **ใช้ทำอะไร:** ไฟล์เดียวที่รวมรายละเอียดของผู้รับดูแลรายบุคคล 100 ราย (`adopter-001`–`adopter-100`) และสถานสงเคราะห์ 20 แห่ง (`shelter-001`–`shelter-020`) พร้อมคำสั่งให้ Codex สร้างภาพเสมือนจริงของคน บ้านที่อยู่อาศัย น้องที่ดูแลอยู่ และสถานที่
> **ความสัมพันธ์กับเอกสารอื่น:** ข้อมูลในไฟล์นี้เป็นต้นฉบับของ `src/data/adopters.ts` และ `src/data/shelters.ts` ([PROMPT.md](PROMPT.md) หัวข้อ 10) ส่วนภาพที่ได้ต้องบันทึกใน [CREDITS.md](CREDITS.md) และแสดงป้าย “ภาพสร้างด้วย AI” ([PROMPT.md](PROMPT.md) หัวข้อ 15)
> **สถานะ:** ยังไม่ได้สร้างภาพ ทุกคนและทุกสถานที่ในไฟล์นี้เป็นข้อมูลสมมติ ชื่อสถานสงเคราะห์ต้องค้นตรวจว่าไม่ตรงกับองค์กรจริงก่อน deploy

## สารบัญ

1. [วิธีใช้ไฟล์นี้ (สำหรับ Codex)](#1-วิธีใช้ไฟล์นี้-สำหรับ-codex)
2. [กติกาความปลอดภัยและความสมจริง](#2-กติกาความปลอดภัยและความสมจริง)
3. [สไตล์กลางและแม่แบบ prompt](#3-สไตล์กลางและแม่แบบ-prompt)
4. [ขนาด ชื่อไฟล์ และที่เก็บ](#4-ขนาด-ชื่อไฟล์-และที่เก็บ)
5. [ผู้รับดูแลรายบุคคล 100 ราย](#5-ผู้รับดูแลรายบุคคล-100-ราย-adopter-001--adopter-100)
6. [สถานสงเคราะห์ 20 แห่ง](#6-สถานสงเคราะห์-20-แห่ง-shelter-001--shelter-020)
7. [Checklist หลังสร้างภาพ](#7-checklist-หลังสร้างภาพ)

---

## 1. วิธีใช้ไฟล์นี้ (สำหรับ Codex)

1. **เครื่องมือและงบ:** ใช้ความสามารถสร้างภาพที่มีอยู่ในสิทธิ์ของผู้ใช้ **ห้ามเปิด billing หรือซื้อเครดิตเพิ่มเอง** ถ้าการสร้างภาพต้องเสียเงินเพิ่ม ให้หยุดและถามผู้ใช้ก่อน
2. **ทำเป็น batch:** ครั้งละ 10 records (เช่น `adopter-001`–`adopter-010`) → สร้างภาพ → ตรวจตาม [หัวข้อ 7](#7-checklist-หลังสร้างภาพ) → บันทึก CREDITS.md → ทำ batch ถัดไป
3. **ประกอบ prompt:** ใช้แม่แบบในหัวข้อ 3 แล้วแทนช่อง `{LOOK}`, `{SETTING}`, `{HOME}`, `{PETS}`, `{PET_SCENE}`, `{MANAGER_LOOK}`, `{EXTERIOR}`, `{CARE_AREA}`, `{DONATION_ITEMS}`, `{DISTRICT}` ด้วยค่าของ record นั้น (ค่าภาษาอังกฤษอยู่ใต้ตารางของแต่ละ record)
4. **ห้ามเปลี่ยนข้อมูลให้ตรงกับภาพ:** ถ้าภาพไม่ตรงรายละเอียด (จำนวนน้อง สี พันธุ์ ประเภทบ้าน) ให้สร้างใหม่ ห้ามแก้ข้อมูลในไฟล์นี้เพื่อให้ตรงกับภาพ
5. **ภาพคนที่คล้ายคนดังหรือบุคคลจริง:** ทิ้งและสร้างใหม่ทันที
6. **ความต่อเนื่อง:** ภาพบ้านไม่มีคนและไม่มีสัตว์ ส่วนภาพน้องไม่มีคน จึงไม่ต้องคุมหน้าคนให้เหมือนกันข้ามภาพ แต่ภาพน้องต้องตรงกับรายการ “น้องที่ดูแลอยู่” ทุกตัว
7. **ขนาดงาน:** ผู้รับดูแลรายบุคคล 291 ภาพ (โปรไฟล์ 100 + บ้าน 100 + น้องที่ดูแลอยู่ 91) และสถานสงเคราะห์ 75 ภาพ (ผู้ดูแล 20 + ภายนอก 20 + พื้นที่ดูแลสัตว์ 20 + มุมบริจาค 15) รวม **366 ภาพ**

## 2. กติกาความปลอดภัยและความสมจริง

**บุคคล**
- ทุกคนเป็น **บุคคลสมมติ อายุ 21 ปีขึ้นไป** ห้ามทำให้หน้าเหมือนคนดัง นักแสดง อินฟลูเอนเซอร์ หรือบุคคลจริง และห้ามใส่ชื่อคนจริงใน prompt
- ทุกคนดูดี สวย หล่อ น่ารักแบบธรรมชาติ แต่งตัวเรียบร้อย สีหน้าเป็นมิตร แต่ต้องดูเป็นคนจริง ไม่ใช่ภาพรีทัชจนเหมือนพลาสติก
- บรรยายเชื้อสายและลักษณะอย่างให้เกียรติ (เช่น หมวย ตี๋ ผิวแทน มุสลิมคลุมฮิญาบ) ห้ามทำภาพเหมารวมหรือล้อเลียน
- ภาพเดี่ยวเท่านั้น ห้ามมีเด็กหรือบุคคลอื่นในภาพ

**ความสมจริง (photorealistic)**
- ให้ดูเหมือนภาพถ่ายจริงจากกล้อง: แสงธรรมชาติ ผิวมีรายละเอียดจริง มือ นิ้ว ตา ฟัน และหูถูกต้อง
- สัตว์มีกายวิภาคถูกต้อง (จำนวนขา หู หาง หนวดแมว) ลักษณะตรงตามพันธุ์และสีที่ระบุ ดูสุขภาพดี สะอาด ไม่มีบาดแผล
- บ้านและสถานที่ต้องเป็นบริบทกรุงเทพฯ ที่สมจริง สะอาด ปลอดภัยต่อสัตว์ (เช่น ตาข่ายระเบียงสำหรับแมว)

**ห้ามมีในภาพทุกภาพ**
- ข้อความ ตัวอักษร ป้าย โลโก้ แบรนด์ ลายน้ำ บ้านเลขที่ ป้ายทะเบียน หรือจุดสังเกตที่ระบุสถานที่จริงได้
- QR code เลขบัญชี ธนบัตร เหรียญ กล่องรับเงิน (โดยเฉพาะภาพมุมบริจาค)
- สัตว์ป่วย บาดเจ็บ ผอมโซ อยู่ในกรงแคบแออัด หรือสภาพทารุณ
- โลโก้หรือองค์ประกอบของแบรนด์ PetZen และภาพอ้างอิงใด ๆ

**การแสดงผลในเว็บ**
- ทุกภาพตั้ง `aiGenerated: true` แสดงป้าย “ภาพสร้างด้วย AI” และมี alt ภาษาไทยตามหัวข้อ 4

## 3. สไตล์กลางและแม่แบบ prompt

ใช้ภาษาอังกฤษใน prompt เพื่อให้เครื่องมือสร้างภาพเข้าใจตรงที่สุด ต่อท้ายทุก prompt ด้วย `NEGATIVE`

**`PROFILE`** (ผู้รับดูแลรายบุคคล)
```
Photorealistic head-and-shoulders portrait photograph of {LOOK}. Fictional adult person who does not resemble any real person or celebrity. Attractive, well-groomed, natural and approachable. Background: {SETTING}, softly blurred. Natural window light, shot on a full-frame camera with an 85mm lens at f/2, shallow depth of field, true-to-life skin texture, relaxed friendly expression, looking at the camera. Bangkok, Thailand.
```

**`HOME`** (บ้านที่อยู่อาศัย)
```
Photorealistic interior or exterior photograph of {HOME} in Bangkok, Thailand. Natural daylight, tidy and lived-in, realistic Thai materials and furniture, pet-safe details. Shot at eye level with a 24mm lens, realistic lighting and shadows. No people and no animals in the frame.
```

**`PETS`** (น้องที่ดูแลอยู่)
```
Photorealistic candid photograph of {PETS}, together in {PET_SCENE} in Bangkok, Thailand. Natural light, sharp focus on the eyes, accurate breed features and coat colors, correct anatomy, healthy and well-groomed animals. No people.
```

**`SHELTER_MANAGER`** (ผู้ดูแลสถานสงเคราะห์)
```
Photorealistic head-and-shoulders portrait photograph of {MANAGER_LOOK}, the fictional caretaker of a small animal shelter. Fictional adult person who does not resemble any real person or celebrity. Attractive, trustworthy and warm. Background: a clean, bright animal shelter courtyard, softly blurred. Natural light, 85mm lens, shallow depth of field, true-to-life skin texture.
```

**`SHELTER_EXTERIOR`**
```
Photorealistic exterior photograph of {EXTERIOR} in the {DISTRICT} area of Bangkok, Thailand. Clean, welcoming, well maintained, lush greenery, natural daylight, wide-angle 24mm, eye level. No readable signs, no house numbers, no people.
```

**`SHELTER_CARE_AREA`**
```
Photorealistic photograph of {CARE_AREA} inside a small, clean and humane animal shelter in Bangkok, Thailand. Healthy, relaxed, well-cared-for animals, spacious clean enclosures, good ventilation, natural light. No people, no readable text.
```

**`SHELTER_DONATION_CORNER`** (เฉพาะที่เปิดรับบริจาค)
```
Photorealistic photograph of a tidy donation storage corner in a small animal shelter in Bangkok, Thailand, with {DONATION_ITEMS}. Warm natural light, organized shelves. No money, no QR codes, no bank details, no readable labels or signs, no people.
```

**`NEGATIVE`** (ต่อท้ายทุก prompt)
```
Avoid: text, letters, captions, logos, brand names, watermarks, signage, QR codes, money, banknotes, coins, license plates, house numbers, extra fingers, distorted hands, extra limbs, deformed animals, extra legs or tails, cartoon, illustration, 3D render, anime, plastic skin, over-smoothed skin, oversaturated colors, celebrity likeness, children, crowded cages, injured or sick animals.
```

## 4. ขนาด ชื่อไฟล์ และที่เก็บ

| ภาพ | path | สัดส่วน · ขนาดส่งออก | alt (ภาษาไทย) |
|---|---|---|---|
| โปรไฟล์ | `public/images/personas/adopter-###/profile.webp` | 1:1 · 800×800 | “ภาพสร้างด้วย AI: คุณ[ชื่อ] ผู้รับดูแลรายบุคคล เขต[เขต]” |
| บ้าน | `public/images/personas/adopter-###/home.webp` | 3:2 · 1280×853 | “ภาพสร้างด้วย AI: [ประเภทบ้าน]ของคุณ[ชื่อ]” |
| น้องที่ดูแลอยู่ | `public/images/personas/adopter-###/pets.webp` | 3:2 · 1280×853 | “ภาพสร้างด้วย AI: [ชื่อน้อง] ที่คุณ[ชื่อ]ดูแลอยู่” |
| ผู้ดูแลสถานที่ | `public/images/shelters/shelter-###/manager.webp` | 1:1 · 800×800 | “ภาพสร้างด้วย AI: คุณ[ชื่อ] [บทบาท] [ชื่อสถานที่]” |
| ภายนอก | `public/images/shelters/shelter-###/exterior.webp` | 16:9 · 1600×900 | “ภาพสร้างด้วย AI: ภายนอก[ชื่อสถานที่]” |
| พื้นที่ดูแลสัตว์ | `public/images/shelters/shelter-###/care-area.webp` | 3:2 · 1280×853 | “ภาพสร้างด้วย AI: พื้นที่ดูแลสัตว์ของ[ชื่อสถานที่]” |
| มุมบริจาค | `public/images/shelters/shelter-###/donation-corner.webp` | 3:2 · 1280×853 | “ภาพสร้างด้วย AI: มุมเก็บของบริจาคของ[ชื่อสถานที่] (สถานะตัวอย่าง)” |

- ส่งออกเป็น WebP คุณภาพประมาณ 80 ไฟล์ละไม่เกิน 300 KB และลบ metadata (EXIF/ตำแหน่ง) ออก
- ถ้าเครื่องมือสร้างภาพได้ขนาดอื่น ให้ครอปตรงกลางตามสัดส่วนในตารางก่อนย่อ
- ภาพแต่ละภาพต้องมี fallback ตาม PROMPT.md หัวข้อ 15 (หน้าเว็บต้องใช้ได้แม้ไม่มีไฟล์ภาพ)

---

## 5. ผู้รับดูแลรายบุคคล 100 ราย (adopter-001 – adopter-100)

- `adopter-<run>` คือ **persona หลักของ Run** นั้น (PROMPT.md หัวข้อ 11.1) เช่น Run 001 → `adopter-001`
- “ความจุ” = จำนวนน้องที่ดูแลได้ทั้งหมด “ดูแลอยู่” = จำนวนน้องในรายการ (`currentPets.length === currentCount`)
- ความสนใจพิเศษเป็นความชอบส่วนตัวของ persona ไม่ใช่ข้อเท็จจริงทางวิทยาศาสตร์เรื่องนิสัยตามสี
- พิกัดของแต่ละ record สร้างครั้งเดียวในเขตที่ระบุตามกฎ PROMPT.md หัวข้อ 10.4 และห้ามเปลี่ยนตาม Run

### 5.1 สรุปการกระจาย (ตรวจด้วยสคริปต์ตอนเขียนเอกสาร)

| หัวข้อ | จำนวน |
|---|---|
| โหมด | อุปถัมภ์ชั่วคราวอย่างเดียว 32 · รับเลี้ยงถาวรอย่างเดียว 22 · ทั้งสองโหมด 46 |
| ชนิดสัตว์ที่รับ | แมว 64 · สุนัข 21 · แมวและสุนัข 12 · แมวและกระต่าย 2 · กระต่าย 1 |
| ความพร้อม | พร้อมรับ 78 · รับได้จำกัด 16 · ปิดรับชั่วคราว 6 |
| เต็มแล้ว (ดูแลอยู่เท่าความจุ) | 7 ราย: adopter-012, adopter-020, adopter-024, adopter-046, adopter-050, adopter-060, adopter-063 |
| ยังไม่มีน้องในความดูแล (ไม่มีภาพ pets) | 9 ราย |
| รับกรณีฉุกเฉิน | 25 ราย |
| เพศ / อายุ | หญิง 51 · ชาย 49 · อายุ 21–70 ปี |
| เขต | ผู้รับดูแลรายบุคคลรวมกับสถานสงเคราะห์ครอบคลุมครบ 50 เขต |

### 5.2 รายละเอียดราย record

#### adopter-001 · ใบเตย · หญิง 26 ปี · เขตลาดพร้าว (`lat-phrao`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวไทยหน้าหวานน่ารัก ผิวขาวอมชมพู ผมบ็อบประบ่าสีน้ำตาลเข้ม ใส่แว่นกรอบกลมสีกระดองเต่า ยิ้มแล้วตาหยี สวมคาร์ดิแกนไหมพรมสีครีม |
| อาชีพ / ไลฟ์สไตล์ | นักออกแบบกราฟิก ทำงานที่บ้าน 3 วันต่อสัปดาห์ |
| บ้าน (คอนโด) | คอนโด 1 ห้องนอน ชั้น 12 ระเบียงติดตาข่ายกันตก นิติบุคคลอนุญาตให้เลี้ยงแมว |
| น้องที่ดูแลอยู่ | ขนมปัง: แมว · แมวไทยพันทาง · ส้มลายสลิด · ผู้ 3 ปี<br>มอคค่า: แมว · โคราช · เทาเงิน (สีสวาด) · เมีย 2 ปี |
| ความจุ | ดูแลอยู่ 2/3 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ขาวล้วน · พันธุ์: ขาวมณี — ชอบแมวตาสองสีตั้งแต่เด็ก และเข้าใจว่าแมวขาวบางตัวอาจมีปัญหาการได้ยิน จึงอยากเป็นบ้านที่ดูแลเรื่องนี้ได้ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 18:00–21:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 3`, `currentCount: 2`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a cute 26-year-old Thai woman with fair rosy skin, a shoulder-length dark brown bob, round tortoiseshell glasses, a warm eye-crinkling smile, wearing a cream knit cardigan
- `SETTING`: a bright cozy condo living room with houseplants
- `HOME`: a compact one-bedroom high-rise condo with floor-to-ceiling windows, a balcony enclosed with safety netting, a tall cat tree by the window and wall-mounted cat shelves
- `PETS`: two cats: an orange tabby mixed-breed domestic shorthair cat (male, about 3 years old); a silver-blue Korat cat (female, about 2 years old)
- `PET_SCENE`: a bright condo living room near a window
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-002 · เหมยลี่ · หญิง 24 ปี · เขตสัมพันธวงศ์ (`samphanthawong`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวหมวยหน้าใส ผิวขาวเนียน ผมดำตรงยาวมีหน้าม้าซีทรู ตาชั้นเดียวเรียวสวย ปากสีชมพูอ่อน สวมเสื้อเบลาส์สีพาสเทล |
| อาชีพ / ไลฟ์สไตล์ | ช่วยครอบครัวดูแลร้านสมุนไพรจีน |
| บ้าน (ตึกแถว) | ห้องชั้นสามของตึกแถวครอบครัว หน้าต่างบานเฟี้ยมไม้ ติดมุ้งลวดกันแมวทุกบาน |
| น้องที่ดูแลอยู่ | ซาลาเปา: แมว · บริติชช็อตแฮร์ · ครีม · ผู้ 3 ปี |
| ความจุ | ดูแลอยู่ 1/2 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | รับเลี้ยงถาวร · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: สามสี · พันธุ์: แมวไทยพันทาง — ที่บ้านถือว่าแมวสามสีเป็นมงคล และชอบที่ลายของแต่ละตัวไม่ซ้ำกัน |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 19:00–22:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 2`, `currentCount: 1`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a pretty 24-year-old Thai-Chinese woman with smooth fair skin, long straight black hair with wispy see-through bangs, graceful monolid almond eyes, soft pink lips, wearing a pastel blouse
- `SETTING`: an old Chinatown shophouse room with wooden folding shutters
- `HOME`: the third-floor bedroom of an old family shophouse with teak wooden folding shutters, mesh screens on every window, a low wooden cabinet and a woven cat bed
- `PETS`: one cat: a cream British Shorthair cat (male, about 3 years old)
- `PET_SCENE`: the upstairs room of an old shophouse with wooden windows
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-003 · ภูผา · ชาย 31 ปี · เขตบางขุนเทียน (`bang-khun-thian`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | ผู้ชายเข้ม ผิวแทนแดด กรามชัด ผมสั้นเกรียน หนวดเคราบาง ๆ รูปร่างนักกีฬา สวมเสื้อเชิ้ตทำงานสีเขียวมะกอก |
| อาชีพ / ไลฟ์สไตล์ | ช่างซ่อมเรือและเครื่องยนต์ริมคลอง |
| บ้าน (บ้านเดี่ยว) | บ้านเดี่ยวชั้นเดียว ลานดินกว้างล้อมรั้วสูง ใกล้ป่าชายเลน |
| น้องที่ดูแลอยู่ | ดำ: สุนัข · ไทยหลังอาน · ดำ · ผู้ 5 ปี<br>ขาว: สุนัข · หมาไทยพันทาง · ขาว · เมีย 4 ปี |
| ความจุ | ดูแลอยู่ 2/4 ตัว · **รับเพิ่มได้ 2 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว · สุนัข |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ได้ |
| สนใจเป็นพิเศษ | สี: ดำ · พันธุ์: ไทยหลังอาน / หมาไทยพันทาง — หมาดำมักถูกรับเลี้ยงช้ากว่าตัวอื่น อยากให้โอกาส และบ้านมีลานกว้างพอให้หมาที่แข็งแรงได้วิ่ง |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 17:00–20:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster']`, `speciesAccepted: ['dog']`, `capacityTotal: 4`, `currentCount: 2`, `availability: 'available'`, `acceptsEmergency: true` |

- `LOOK`: a ruggedly handsome 31-year-old Thai man with sun-tanned skin, a strong jawline, a short crew cut, light stubble, an athletic build, wearing an olive-green work shirt
- `SETTING`: a sunny waterfront workshop yard with mangroves in the distance
- `HOME`: a single-story Thai house with a wide fenced dirt yard, a shaded wooden dog shelter, water bowls and mangrove trees behind the tall fence
- `PETS`: two dogs: a black Thai Ridgeback dog (male, about 5 years old); a white Thai mixed-breed dog (female, about 4 years old)
- `PET_SCENE`: a shaded yard of a Thai house on a sunny afternoon
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-004 · ตี๋ · ชาย 23 ปี · เขตปทุมวัน (`pathum-wan`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | หนุ่มตี๋หน้าใส ผิวขาว ผมดำหวีแสกข้างเรียบร้อย ตาชั้นเดียว ยิ้มสดใสแบบเด็กดี สวมเสื้อเชิ้ตขาวโอเวอร์ไซซ์ |
| อาชีพ / ไลฟ์สไตล์ | นักศึกษาปริญญาโทวิศวกรรมคอมพิวเตอร์ และติวเตอร์พาร์ตไทม์ |
| บ้าน (อพาร์ตเมนต์/ห้องเช่า) | ห้องสตูดิโอในอพาร์ตเมนต์ที่อนุญาตสัตว์เลี้ยงขนาดเล็ก |
| น้องที่ดูแลอยู่ | ข้าวต้ม: แมว · แมวไทยพันทาง · ขาวดำ · ผู้ 1 ปี |
| ความจุ | ดูแลอยู่ 1/2 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว · แมว |
| ความพร้อม | รับได้จำกัด · รับกรณีฉุกเฉิน: ไม่ได้ · ช่วงสอบกลางภาคและปลายภาครับได้จำกัด |
| สนใจเป็นพิเศษ | สี: ส้ม · พันธุ์: ไม่จำกัดพันธุ์ — รู้สึกว่าแมวส้มขี้อ้อนเข้ากับตัวเอง (เป็นความชอบส่วนตัว) และช่วงสอบอาจรับได้ไม่เต็มที่ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | จันทร์–ศุกร์ 20:00–22:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster']`, `speciesAccepted: ['cat']`, `capacityTotal: 2`, `currentCount: 1`, `availability: 'limited'`, `acceptsEmergency: false` |

- `LOOK`: a handsome 23-year-old Thai-Chinese young man with fair skin, neat side-parted black hair, monolid eyes, a boyish friendly smile, wearing a crisp white oversized shirt
- `SETTING`: a tidy study room with bookshelves
- `HOME`: a neat studio apartment with a study desk by the window, a compact cat tree, a litter box tucked in a cabinet and soft daylight
- `PETS`: one cat: a young black and white mixed-breed domestic shorthair cat (male, about 1 year old)
- `PET_SCENE`: a cozy apartment room with soft daylight
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-005 · ดาหลา · หญิง 29 ปี · เขตดุสิต (`dusit`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวผิวสองสีสดใส ผมยาวดัดลอนสีดำ ยิ้มกว้างมีลักยิ้ม สวมชุดเดรสลินินสีมัสตาร์ด |
| อาชีพ / ไลฟ์สไตล์ | ครูอนุบาล |
| บ้าน (ทาวน์เฮาส์) | ทาวน์เฮาส์ 2 ชั้นในซอยเงียบ มีระเบียงหน้าบ้านติดมุ้งลวด |
| น้องที่ดูแลอยู่ | มะปราง: แมว · แมวไทยพันทาง · ส้มขาว · เมีย 4 ปี<br>ถั่วแดง: แมว · แมวไทยพันทาง · น้ำตาลลายเสือ · ผู้ 2 ปี |
| ความจุ | ดูแลอยู่ 2/3 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: น้ำตาลลายเสือ · พันธุ์: แมวไทยพันทาง — เด็ก ๆ ในห้องเรียนชอบฟังเรื่องแมวลายเสือ และอยากให้แมวพันทางได้บ้านมากขึ้น |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 17:30–20:30 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 3`, `currentCount: 2`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a lovely 29-year-old Thai woman with warm tan skin, long wavy black hair, a bright smile with dimples, wearing a mustard linen dress
- `SETTING`: a leafy front porch of a townhouse
- `HOME`: a two-story townhouse living room in a quiet soi, a screened front porch with potted plants, a scratching post and a sunny window seat
- `PETS`: two cats: an orange and white mixed-breed domestic shorthair cat (female, about 4 years old); a brown mackerel tabby mixed-breed domestic shorthair cat (male, about 2 years old)
- `PET_SCENE`: a warm townhouse living room
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-006 · กัปตัน · ชาย 38 ปี · เขตบางนา (`bang-na`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | ผู้ชายสูงโปร่ง ผิวสีน้ำผึ้ง ตัดผมทรงเฟด เครา trim เรียบร้อย ยิ้มมั่นใจ สวมเสื้อโปโลสีกรมท่า |
| อาชีพ / ไลฟ์สไตล์ | นักบินพาณิชย์ |
| บ้าน (บ้านเดี่ยว) | บ้านเดี่ยวในหมู่บ้าน มีสนามหญ้าล้อมรั้ว |
| น้องที่ดูแลอยู่ | กัปปุ: สุนัข · โกลเด้นรีทรีฟเวอร์ · ทอง · ผู้ 6 ปี |
| ความจุ | ดูแลอยู่ 1/2 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | รับเลี้ยงถาวร · สุนัข |
| ความพร้อม | ปิดรับชั่วคราว · รับกรณีฉุกเฉิน: ไม่ได้ · ปิดรับชั่วคราวจนกว่าจะย้ายไปบินเส้นทางในประเทศ |
| สนใจเป็นพิเศษ | สี: ครีม / ทอง · พันธุ์: โกลเด้นรีทรีฟเวอร์ หรือลาบราดอร์ — อยากได้เพื่อนเล่นให้กัปปุที่นิสัยเข้ากับครอบครัว ตอนนี้บินต่างประเทศบ่อยจึงปิดรับชั่วคราว |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | เฉพาะวันหยุดที่ไม่มีเที่ยวบิน · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['adopt']`, `speciesAccepted: ['dog']`, `capacityTotal: 2`, `currentCount: 1`, `availability: 'unavailable'`, `acceptsEmergency: false` |

- `LOOK`: a handsome tall 38-year-old Thai man with honey-brown skin, a clean fade haircut, a neatly trimmed beard, a confident smile, wearing a navy polo shirt
- `SETTING`: a green lawn in front of a suburban house
- `HOME`: a modern suburban detached house with a fenced green lawn, a covered patio with a large dog bed and a shaded water station
- `PETS`: one dog: a golden Golden Retriever dog (male, about 6 years old)
- `PET_SCENE`: a shaded yard of a Thai house on a sunny afternoon
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-007 · นิ่มนวล · หญิง 58 ปี · เขตบางกอกน้อย (`bangkok-noi`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | คุณป้าสง่างาม ผมบ็อบสีดอกเลา ยิ้มอ่อนโยน สวมเสื้อผ้าไหมสีพาสเทลและต่างหูมุก |
| อาชีพ / ไลฟ์สไตล์ | ครูเกษียณ |
| บ้าน (บ้านไม้) | บ้านไม้สองชั้นริมคลอง ระเบียงไม้ติดมุ้งลวด |
| น้องที่ดูแลอยู่ | ส้มฉุน: แมว · แมวไทยพันทาง · ส้ม · ผู้ 9 ปี<br>ปุยนุ่น: แมว · เปอร์เซีย · ขาว · เมีย 7 ปี<br>ด่างดำ: แมว · แมวไทยพันทาง · ขาวดำ · ผู้ 8 ปี |
| ความจุ | ดูแลอยู่ 3/4 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ทุกสี (แมวสูงวัย) · พันธุ์: เปอร์เซีย — เลี้ยงเปอร์เซียมานานจึงดูแลขนยาวเป็น และอยากรับแมวสูงวัยที่คนมักไม่เลือก |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 09:00–17:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster']`, `speciesAccepted: ['cat']`, `capacityTotal: 4`, `currentCount: 3`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: an elegant 58-year-old Thai woman with a silver-streaked bob, a gentle smile, graceful posture, wearing a pastel silk blouse and pearl earrings
- `SETTING`: a wooden canal-side veranda with potted orchids
- `HOME`: a two-story traditional Thai teak house by a canal with a wide screened wooden veranda, orchids in clay pots, cushions and several cat beds
- `PETS`: three cats: an orange mixed-breed domestic shorthair cat (male, about 9 years old); a white Persian cat (female, about 7 years old); a black and white mixed-breed domestic shorthair cat (male, about 8 years old)
- `PET_SCENE`: the veranda of a traditional Thai wooden house
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-008 · ฟ้าใส · หญิง 22 ปี · เขตหลักสี่ (`lak-si`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวหน้าสดใส ผมหางม้า แต่งหน้าบาง ๆ ตาโตเป็นประกาย สวมเสื้อยืดลายทาง |
| อาชีพ / ไลฟ์สไตล์ | นักศึกษาสัตวแพทย์ชั้นปีสุดท้าย |
| บ้าน (อพาร์ตเมนต์/ห้องเช่า) | อพาร์ตเมนต์ห้องเดียว มีมุมกล่องอนุบาลลูกแมวที่อบอุ่น |
| น้องที่ดูแลอยู่ | ยังไม่มี |
| ความจุ | ดูแลอยู่ 0/1 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ได้ |
| สนใจเป็นพิเศษ | สี: ทุกสี (ลูกแมวกำพร้า) · พันธุ์: ไม่จำกัดพันธุ์ — อยากดูแลลูกแมวกำพร้าที่ต้องป้อนนมเป็นเวลา ตามที่เรียนมา (ไม่ได้รักษาโรคเอง) |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 20:00–22:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster']`, `speciesAccepted: ['cat']`, `capacityTotal: 1`, `currentCount: 0`, `availability: 'available'`, `acceptsEmergency: true` |

- `LOOK`: a fresh-faced 22-year-old Thai woman with a high ponytail, light natural makeup, bright sparkling eyes, wearing a casual striped t-shirt
- `SETTING`: a small bright apartment with a study corner
- `HOME`: a small bright apartment room with a clean kitten nursery corner, a soft heated pad in a basket, a feeding station and anatomy textbooks on a shelf
- ภาพ: `profile.webp`, `home.webp` (ไม่มี `pets.webp` เพราะยังไม่มีน้องในความดูแล)

#### adopter-009 · อาทิตย์ · ชาย 34 ปี · เขตจตุจักร (`chatuchak`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | หนุ่มบาริสต้าหล่อมีเสน่ห์ ไว้เคราเข้ม มัดผมจุก มีรอยสักเส้นบางที่แขน ยิ้มเป็นมิตร สวมผ้ากันเปื้อนผ้าใบ |
| อาชีพ / ไลฟ์สไตล์ | เจ้าของร้านกาแฟเล็ก ๆ |
| บ้าน (ตึกแถว) | ตึกแถวที่ชั้นล่างเป็นร้านกาแฟ ชั้นบนเป็นที่อยู่ มีดาดฟ้าปลูกต้นไม้ล้อมตาข่าย |
| น้องที่ดูแลอยู่ | เอสเพรสโซ: แมว · แมวไทยพันทาง · ดำ · ผู้ 3 ปี<br>ลาเต้: แมว · แมวไทยพันทาง · ครีม · เมีย 3 ปี |
| ความจุ | ดูแลอยู่ 2/3 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมว |
| ความพร้อม | รับได้จำกัด · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ดำ · พันธุ์: ไม่จำกัดพันธุ์ — แมวดำมักถูกมองข้าม อยากให้ได้บ้าน และดำเข้ากับสีร้านพอดี |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 16:00–19:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 3`, `currentCount: 2`, `availability: 'limited'`, `acceptsEmergency: false` |

- `LOOK`: a charming 34-year-old Thai man with a full dark beard, hair tied in a small man bun, fine-line tattoos on one forearm, a friendly smile, wearing a canvas apron
- `SETTING`: a cozy small coffee shop counter
- `HOME`: the upstairs living space of a shophouse café with exposed brick, a rooftop garden enclosed by cat-safe netting, hammocks and cat shelves
- `PETS`: two cats: a solid black mixed-breed domestic shorthair cat (male, about 3 years old); a cream mixed-breed domestic shorthair cat (female, about 3 years old)
- `PET_SCENE`: the upstairs room of an old shophouse with wooden windows
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-010 · ปริม · หญิง 30 ปี · เขตคลองเตย (`khlong-toei`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวมุสลิมหน้าหวาน คลุมฮิญาบสีชมพูอ่อน ตาโตเป็นประกาย ยิ้มอบอุ่น สวมเสื้อเบลาส์สีครีม |
| อาชีพ / ไลฟ์สไตล์ | เภสัชกรโรงพยาบาล |
| บ้าน (คอนโด) | คอนโด 2 ห้องนอนใกล้สถานีรถไฟฟ้า |
| น้องที่ดูแลอยู่ | บุหงา: แมว · วิเชียรมาศ · ครีมแต้มน้ำตาล · เมีย 4 ปี |
| ความจุ | ดูแลอยู่ 1/2 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | รับเลี้ยงถาวร · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ครีมแต้มน้ำตาล · พันธุ์: วิเชียรมาศ — ชอบนิสัยช่างคุยและผูกพันกับคนของวิเชียรมาศ และอยากให้บุหงามีเพื่อน |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 19:00–21:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 2`, `currentCount: 1`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a beautiful 30-year-old Thai Muslim woman wearing a soft blush-pink hijab, bright expressive eyes, a warm smile, wearing a modest cream blouse
- `SETTING`: a calm condo living room with sheer curtains
- `HOME`: a bright two-bedroom condo with sheer curtains, a low sofa, a window hammock for cats and a neat feeding corner
- `PETS`: one cat: a seal point Siamese (Wichien Maat) cat (female, about 4 years old)
- `PET_SCENE`: a bright condo living room near a window
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-011 · วศิน · ชาย 41 ปี · เขตบึงกุ่ม (`bueng-kum`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | วิศวกรหน้าตาใจดี ใส่แว่นไร้กรอบ ผมสั้นเรียบ โกนหนวดสะอาด ยิ้มสุขุม สวมเชิ้ตอ็อกซ์ฟอร์ดสีฟ้าอ่อน |
| อาชีพ / ไลฟ์สไตล์ | วิศวกรโยธา |
| บ้าน (บ้านเดี่ยว) | บ้านเดี่ยว 2 ชั้นในหมู่บ้าน สนามหญ้าล้อมรั้ว แยกโซนหมาและแมว |
| น้องที่ดูแลอยู่ | ข้าวเหนียว: สุนัข · ไทยบางแก้ว · ขาวแต้มน้ำตาล · เมีย 5 ปี<br>มะขาม: สุนัข · หมาไทยพันทาง · น้ำตาลแดง · ผู้ 3 ปี<br>ทองหยิบ: แมว · แมวไทยพันทาง · ส้ม · เมีย 2 ปี |
| ความจุ | ดูแลอยู่ 3/5 ตัว · **รับเพิ่มได้ 2 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมวและสุนัข |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ได้ |
| สนใจเป็นพิเศษ | สี: น้ำตาลแดง · พันธุ์: ไทยบางแก้ว — ภูมิใจในหมาสายพันธุ์ไทย และบ้านแยกโซนหมากับแมวชัดเจนจึงรับได้ทั้งสองชนิด |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 18:00–21:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat','dog']`, `capacityTotal: 5`, `currentCount: 3`, `availability: 'available'`, `acceptsEmergency: true` |

- `LOOK`: a kind-looking 41-year-old Thai man with rimless glasses, neat short hair, a clean shave, a calm smile, wearing a light blue oxford shirt
- `SETTING`: a suburban garden with a wooden fence
- `HOME`: a two-story suburban house with a fenced lawn, a covered dog area with raised beds and an indoor cat room with window perches
- `PETS`: one cat and two dogs: a white with tan patches Thai Bangkaew dog (female, about 5 years old); a reddish brown Thai mixed-breed dog (male, about 3 years old); an orange mixed-breed domestic shorthair cat (female, about 2 years old)
- `PET_SCENE`: a shaded yard of a Thai house on a sunny afternoon
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-012 · ข้าวหอม · หญิง 27 ปี · เขตราชเทวี (`ratchathewi`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวผมสั้นพิกซี่สีน้ำตาลหม่น ยิ้มซุกซน ผิวขาวเหลือง สวมเสื้อยืดกราฟิกกับแจ็กเก็ตยีนส์ |
| อาชีพ / ไลฟ์สไตล์ | นักวาดภาพประกอบอิสระ |
| บ้าน (คอนโด) | คอนโดเก่ารีโนเวตใหม่ ผนังเต็มไปด้วยภาพวาด |
| น้องที่ดูแลอยู่ | หมึก: แมว · แมวไทยพันทาง · ดำ · ผู้ 5 ปี |
| ความจุ | ดูแลอยู่ 1/1 ตัว · **เต็มแล้ว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว · แมว |
| ความพร้อม | รับได้จำกัด · รับกรณีฉุกเฉิน: ไม่ได้ · ตอนนี้เต็มแล้ว (ห้องเล็ก รับได้ครั้งละ 1 ตัว) |
| สนใจเป็นพิเศษ | สี: ดำ · พันธุ์: ไม่จำกัดพันธุ์ — หมึกเป็นแรงบันดาลใจในงานวาด และอยากช่วยแมวดำตัวอื่นเมื่อมีที่ว่าง |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 13:00–18:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster']`, `speciesAccepted: ['cat']`, `capacityTotal: 1`, `currentCount: 1`, `availability: 'limited'`, `acceptsEmergency: false` |

- `LOOK`: a playful 27-year-old Thai woman with an ash-brown pixie cut, a mischievous grin, light warm skin, wearing a graphic tee under a denim jacket
- `SETTING`: an artsy room with illustrations pinned on the wall
- `HOME`: a renovated older condo with illustration prints pinned on the walls, a drawing desk by the window, a cat hammock and colorful rugs
- `PETS`: one cat: a solid black mixed-breed domestic shorthair cat (male, about 5 years old)
- `PET_SCENE`: a bright condo living room near a window
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-013 · เกริก · ชาย 45 ปี · เขตธนบุรี (`thon-buri`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | คุณพ่อสายช่าง ผมสั้นสีดอกเลา ตีนกาเล็กน้อยเวลายิ้ม ยิ้มกว้างใจดี สวมเสื้อเชิ้ตลายสก๊อต |
| อาชีพ / ไลฟ์สไตล์ | ช่างไม้ทำเฟอร์นิเจอร์ |
| บ้าน (บ้านเดี่ยว) | บ้านครึ่งไม้ครึ่งปูน มีโรงงานไม้เล็ก ๆ ข้างบ้าน และบ้านหมาที่ทำเอง |
| น้องที่ดูแลอยู่ | ขี้เลื่อย: สุนัข · หมาไทยพันทาง · น้ำตาลอ่อน · ผู้ 7 ปี<br>ตะปู: แมว · แมวไทยพันทาง · เทา · ผู้ 4 ปี |
| ความจุ | ดูแลอยู่ 2/4 ตัว · **รับเพิ่มได้ 2 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว · แมวและสุนัข |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ได้ |
| สนใจเป็นพิเศษ | สี: น้ำตาลอ่อน · พันธุ์: หมาพันทาง — ทำคอกและบ้านไม้ให้น้องเองได้ จึงรับน้องที่ต้องการพื้นที่พักฟื้นชั่วคราว |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 17:00–20:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster']`, `speciesAccepted: ['cat','dog']`, `capacityTotal: 4`, `currentCount: 2`, `availability: 'available'`, `acceptsEmergency: true` |

- `LOOK`: a warm 45-year-old Thai man with salt-and-pepper short hair, smile lines around his eyes, a broad kind smile, wearing a plaid flannel shirt
- `SETTING`: a woodworking workshop with neatly hung tools
- `HOME`: a half-wood half-concrete Thai house with a small woodworking shed beside it, handmade wooden dog houses and cat climbing shelves
- `PETS`: one cat and one dog: a light fawn Thai mixed-breed dog (male, about 7 years old); a gray mixed-breed domestic shorthair cat (male, about 4 years old)
- `PET_SCENE`: a shaded yard of a Thai house on a sunny afternoon
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-014 · มิ้นท์ · หญิง 25 ปี · เขตวัฒนา (`watthana`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวสวยทันสมัย ผมยาวตรงสีน้ำตาลน้ำผึ้ง ผิวฉ่ำโกลว์ ลิปกลอสใส สวมเบลเซอร์ครอปสีเบจ |
| อาชีพ / ไลฟ์สไตล์ | นักการตลาดออนไลน์ |
| บ้าน (คอนโด) | คอนโด 1 ห้องนอน โทนเทาอ่อน วิวเมือง |
| น้องที่ดูแลอยู่ | มาการอง: แมว · แร็กดอลล์ · ครีมแต้มน้ำตาล ตาฟ้า · เมีย 2 ปี |
| ความจุ | ดูแลอยู่ 1/2 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | รับเลี้ยงถาวร · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ครีม ตาฟ้า · พันธุ์: แร็กดอลล์ — ชอบนิสัยนุ่มนวลและชอบให้อุ้ม ซึ่งเหมาะกับการอยู่คอนโด |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 20:00–22:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 2`, `currentCount: 1`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a stylish 25-year-old Thai woman with long straight honey-brown hair, glowing dewy skin, glossy lips, wearing a cropped beige blazer
- `SETTING`: a chic modern condo with city view
- `HOME`: a chic one-bedroom condo in soft gray tones with a city view, a plush sofa, a modern cat tree and a hidden litter cabinet
- `PETS`: one cat: a seal bicolor with blue eyes Ragdoll cat (female, about 2 years old)
- `PET_SCENE`: a bright condo living room near a window
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-015 · บุญมี · ชาย 63 ปี · เขตหนองแขม (`nong-khaem`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | คุณลุงใจดี ผมสั้นสีเทา ผิวแทนแดด ริ้วรอยอบอุ่น สวมเสื้อม่อฮ่อมสีคราม |
| อาชีพ / ไลฟ์สไตล์ | ข้าราชการเกษียณ ปลูกผักสวนครัว |
| บ้าน (บ้านเดี่ยว) | บ้านเดี่ยวชั้นเดียว มีสวนผักและต้นมะม่วง ล้อมรั้วตาข่าย |
| น้องที่ดูแลอยู่ | เจ้าเหลือง: แมว · แมวไทยพันทาง · ส้ม · ผู้ 6 ปี<br>ลำดวน: แมว · แมวไทยพันทาง · สามสี · เมีย 5 ปี<br>โทน: สุนัข · หมาไทยพันทาง · ดำ · ผู้ 8 ปี |
| ความจุ | ดูแลอยู่ 3/5 ตัว · **รับเพิ่มได้ 2 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมวและสุนัข |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ได้ |
| สนใจเป็นพิเศษ | สี: สามสี · พันธุ์: แมวไทยพันทาง — ชอบที่ลายสามสีไม่ซ้ำกันเลยสักตัว และบ้านมีพื้นที่ให้น้องพักฟื้น |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 08:00–18:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat','dog']`, `capacityTotal: 5`, `currentCount: 3`, `availability: 'available'`, `acceptsEmergency: true` |

- `LOOK`: a kind 63-year-old Thai man with short gray hair, sun-kissed skin, warm wrinkles, wearing a traditional indigo mor hom shirt
- `SETTING`: a vegetable garden with a mango tree
- `HOME`: a single-story house surrounded by a vegetable garden and a large mango tree, a fenced yard, a shaded bench and pet water bowls
- `PETS`: two cats and one dog: an orange mixed-breed domestic shorthair cat (male, about 6 years old); a calico mixed-breed domestic shorthair cat (female, about 5 years old); a black Thai mixed-breed dog (male, about 8 years old)
- `PET_SCENE`: a shaded yard of a Thai house on a sunny afternoon
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-016 · ณิชา · หญิง 33 ปี · เขตบางซื่อ (`bang-sue`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวสวยสุขุม มวยผมต่ำเรียบร้อย แต่งหน้าธรรมชาติ ตาสงบนิ่ง สวมเสื้อยืดสีขาวกับเสื้อคลุมบาง |
| อาชีพ / ไลฟ์สไตล์ | พยาบาลห้องฉุกเฉิน (ทำงานเป็นกะ) |
| บ้าน (คอนโด) | คอนโดใกล้ที่ทำงาน มีเครื่องให้อาหารอัตโนมัติ |
| น้องที่ดูแลอยู่ | มอลต์: แมว · บริติชช็อตแฮร์ · เทาฟ้า · ผู้ 3 ปี |
| ความจุ | ดูแลอยู่ 1/2 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมว |
| ความพร้อม | รับได้จำกัด · รับกรณีฉุกเฉิน: ไม่ได้ · รับได้เฉพาะช่วงที่ไม่เข้าเวรติดกันหลายวัน |
| สนใจเป็นพิเศษ | สี: เทาฟ้า · พันธุ์: บริติชช็อตแฮร์ — ชอบนิสัยสงบ ไม่ติดเจ้าของมาก เหมาะกับคนที่ทำงานเป็นกะ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | วันหยุดเวร 10:00–16:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 2`, `currentCount: 1`, `availability: 'limited'`, `acceptsEmergency: false` |

- `LOOK`: a calm and pretty 33-year-old Thai woman with a neat low bun, natural makeup, serene eyes, wearing a white t-shirt and a light cardigan
- `SETTING`: a quiet condo with morning light
- `HOME`: a quiet condo bedroom-living space with morning light, an automatic feeder, a water fountain and a cozy cat cave
- `PETS`: one cat: a blue-gray British Shorthair cat (male, about 3 years old)
- `PET_SCENE`: a bright condo living room near a window
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-017 · ธาวิน · ชาย 28 ปี · เขตคลองสาน (`khlong-san`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | หนุ่มหล่อสายอาร์ต ผมยาวประบ่าดัดลอน หนวดบาง ๆ สวมแจ็กเก็ตยีนส์ มีกล้องฟิล์มคล้องคอ |
| อาชีพ / ไลฟ์สไตล์ | ช่างภาพอิสระ |
| บ้าน (อพาร์ตเมนต์/ห้องเช่า) | ห้องเช่าในอาคารเก่าริมแม่น้ำ หน้าต่างติดมุ้งลวด |
| น้องที่ดูแลอยู่ | ยังไม่มี |
| ความจุ | ดูแลอยู่ 0/1 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ส้มลายสลิด · พันธุ์: ไม่จำกัดพันธุ์ — ชอบถ่ายรูปแมวส้มในแสงยามเย็น และตอนนี้อยากเริ่มจากการอุปถัมภ์ชั่วคราวก่อน |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 10:00–15:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster']`, `speciesAccepted: ['cat']`, `capacityTotal: 1`, `currentCount: 0`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a handsome 28-year-old Thai man with wavy shoulder-length hair, light stubble, wearing a denim jacket with a film camera hanging from his neck
- `SETTING`: a riverside room with golden hour light
- `HOME`: a rented room in an old riverside building with tall mesh-screened windows overlooking the river, film photos on the wall and a sunny cat perch
- ภาพ: `profile.webp`, `home.webp` (ไม่มี `pets.webp` เพราะยังไม่มีน้องในความดูแล)

#### adopter-018 · ไหมแก้ว · หญิง 36 ปี · เขตบางบอน (`bang-bon`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวหุ่นอวบอิ่มยิ้มสวย ผมลอนธรรมชาติยาวประบ่า สวมเสื้อลายดอกไม้ |
| อาชีพ / ไลฟ์สไตล์ | เจ้าของร้านดอกไม้ |
| บ้าน (ตึกแถว) | ตึกแถว 3 ชั้นที่ชั้นล่างเป็นร้านดอกไม้ ชั้นสองเป็นห้องนั่งเล่น มีคอกกระต่ายในบ้าน |
| น้องที่ดูแลอยู่ | ถั่วเขียว: กระต่าย · กระต่ายฮอลแลนด์ลอป · น้ำตาลขาว · เมีย 2 ปี<br>กุหลาบ: แมว · แมวไทยพันทาง · ส้มขาว · เมีย 3 ปี |
| ความจุ | ดูแลอยู่ 2/3 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | รับเลี้ยงถาวร · แมวและกระต่าย |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: หูตก ทุกสี · พันธุ์: กระต่ายฮอลแลนด์ลอป — กระต่ายหูตกนิสัยเชื่อง เลี้ยงในบ้านได้ และเข้ากับกุหลาบได้ดี |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 18:00–20:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['adopt']`, `speciesAccepted: ['cat','other']`, `capacityTotal: 3`, `currentCount: 2`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a radiant 36-year-old Thai woman with a curvy figure, natural shoulder-length curls, a beautiful smile, wearing a floral blouse
- `SETTING`: a flower shop full of fresh blooms
- `HOME`: the second-floor living room of a shophouse above a flower shop with a spacious indoor rabbit pen, hay rack, a cat tree and dried flowers
- `PETS`: one cat and one rabbit: a brown and white Holland Lop rabbit (female, about 2 years old); an orange and white mixed-breed domestic shorthair cat (female, about 3 years old)
- `PET_SCENE`: the upstairs room of an old shophouse with wooden windows
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-019 · กฤต · ชาย 26 ปี · เขตบางนา (`bang-na`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | หนุ่มสปอร์ตหุ่นดี ผมสั้นทรงสปอร์ต ผิวแทนอ่อน ยิ้มสดใส สวมแจ็กเก็ตวิ่ง |
| อาชีพ / ไลฟ์สไตล์ | เทรนเนอร์ฟิตเนส |
| บ้าน (คอนโด) | คอนโด 2 ห้องนอนติดสวนสาธารณะ |
| น้องที่ดูแลอยู่ | สปริง: สุนัข · บีเกิ้ล · สามสี ขาวน้ำตาลดำ · ผู้ 3 ปี |
| ความจุ | ดูแลอยู่ 1/2 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · สุนัข |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: สามสี · พันธุ์: บีเกิ้ล หรือหมาไทยพันทางขนาดกลาง — อยากได้เพื่อนวิ่งตอนเช้าให้สปริง และชอบหมาที่พลังเยอะ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 06:00–08:00 และ 19:00–21:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['dog']`, `capacityTotal: 2`, `currentCount: 1`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a fit and handsome 26-year-old Thai man with a short sporty haircut, light tan skin, a bright grin, wearing a running jacket
- `SETTING`: a park running track in the morning
- `HOME`: a two-bedroom condo next to a park with a large balcony, a dog bed, leashes neatly hung by the door and a water bowl station
- `PETS`: one dog: a tricolor Beagle dog (male, about 3 years old)
- `PET_SCENE`: a bright condo living room near a window
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-020 · อัญชัน · หญิง 47 ปี · เขตจอมทอง (`chom-thong`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาววัยสี่สิบสง่างาม ผมดำตรงประบ่าเงางาม แต่งหน้าบาง สวมจี้หยกกับเสื้อไหม |
| อาชีพ / ไลฟ์สไตล์ | เจ้าของร้านตัดเสื้อ |
| บ้าน (บ้านเดี่ยว) | บ้านเดี่ยวสองชั้น มีห้องตัดเย็บ และห้องแมวที่ติดมุ้งลวด |
| น้องที่ดูแลอยู่ | กระดุม: แมว · ขาวมณี · ขาว ตาสองสี · เมีย 5 ปี<br>ผ้าไหม: แมว · เปอร์เซีย · เทา · เมีย 6 ปี<br>เข็ม: แมว · แมวไทยพันทาง · ส้ม · ผู้ 4 ปี |
| ความจุ | ดูแลอยู่ 3/3 ตัว · **เต็มแล้ว** |
| โหมด · ชนิดสัตว์ | รับเลี้ยงถาวร · แมว |
| ความพร้อม | รับได้จำกัด · รับกรณีฉุกเฉิน: ไม่ได้ · ตอนนี้เต็มแล้ว |
| สนใจเป็นพิเศษ | สี: ขาวล้วน · พันธุ์: ขาวมณี — ชอบแมวไทยโบราณ และขาวมณีตาสองสีเป็นเสน่ห์ที่หลงรักตั้งแต่ครั้งแรก |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 18:30–20:30 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 3`, `currentCount: 3`, `availability: 'limited'`, `acceptsEmergency: false` |

- `LOOK`: an elegant 47-year-old Thai woman with sleek shoulder-length black hair, subtle makeup, a jade pendant, wearing a silk blouse
- `SETTING`: a tailor's atelier with fabric rolls
- `HOME`: a two-story house with a sewing atelier full of fabric rolls, a separate screened cat room with shelves and soft cushions
- `PETS`: three cats: a white with odd eyes Khao Manee cat (female, about 5 years old); a gray Persian cat (female, about 6 years old); an orange mixed-breed domestic shorthair cat (male, about 4 years old)
- `PET_SCENE`: a sunny living room of a Thai house
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-021 · ปั้น · ชาย 30 ปี · เขตยานนาวา (`yan-nawa`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | หนุ่มแก้มป่องน่ารัก ใส่แว่นกลม ผมทรงอันเดอร์คัต หัวเราะอบอุ่น สวมฮู้ดดี้สีพาสเทล |
| อาชีพ / ไลฟ์สไตล์ | เชฟขนมอบ |
| บ้าน (อพาร์ตเมนต์/ห้องเช่า) | อพาร์ตเมนต์ 2 ห้อง ครัวแยกปิดประตูได้ |
| น้องที่ดูแลอยู่ | ครัวซองต์: แมว · แมวไทยพันทาง · ส้มขาว · ผู้ 2 ปี |
| ความจุ | ดูแลอยู่ 1/3 ตัว · **รับเพิ่มได้ 2 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ครีม · พันธุ์: เอ็กโซติกช็อตแฮร์ — ชอบหน้าแบนน่ารัก แต่เข้าใจว่าต้องดูแลเรื่องการหายใจและคราบน้ำตาเป็นพิเศษ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 15:00–18:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster']`, `speciesAccepted: ['cat']`, `capacityTotal: 3`, `currentCount: 1`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a cute and charming 30-year-old Thai man with chubby cheeks, round glasses, a neat undercut, a warm laugh, wearing a pastel hoodie
- `SETTING`: a home kitchen with fresh pastries
- `HOME`: a two-room apartment with a closed-door kitchen, a sunny living area with a cat tree, a scratcher sofa cover and neatly stored cat toys
- `PETS`: one cat: an orange and white mixed-breed domestic shorthair cat (male, about 2 years old)
- `PET_SCENE`: a cozy apartment room with soft daylight
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-022 · ซาร่า · หญิง 29 ปี · เขตหนองจอก (`nong-chok`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวมุสลิมหน้าคม คลุมฮิญาบสีชมพูกะปิ ตาเรียวสวย ยิ้มมั่นใจ |
| อาชีพ / ไลฟ์สไตล์ | ครูสอนภาษาอังกฤษ |
| บ้าน (บ้านเดี่ยว) | บ้านเดี่ยวมีสวนมะพร้าวและบ่อปลา ห้องพักฟื้นสัตว์แยกจากตัวบ้าน |
| น้องที่ดูแลอยู่ | มะลิ: แมว · แมวไทยพันทาง · ขาว · เมีย 3 ปี<br>ข้าวหลาม: แมว · แมวไทยพันทาง · ครีม · ผู้ 2 ปี |
| ความจุ | ดูแลอยู่ 2/4 ตัว · **รับเพิ่มได้ 2 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ได้ |
| สนใจเป็นพิเศษ | สี: ขาวล้วน · พันธุ์: ไม่จำกัดพันธุ์ — บ้านมีห้องพักฟื้นแยก จึงรับน้องที่ต้องพักตัวได้ และชอบแมวขาวที่ดูสะอาดตา |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 17:00–20:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 4`, `currentCount: 2`, `availability: 'available'`, `acceptsEmergency: true` |

- `LOOK`: a beautiful 29-year-old Thai Muslim woman wearing a dusty-rose hijab, striking almond eyes, a confident smile, wearing a simple long-sleeve dress
- `SETTING`: a coconut garden beside a fish pond
- `HOME`: a detached house surrounded by coconut trees and a fish pond, with a separate screened recovery room for animals with clean crates and soft blankets
- `PETS`: two cats: a white mixed-breed domestic shorthair cat (female, about 3 years old); a cream mixed-breed domestic shorthair cat (male, about 2 years old)
- `PET_SCENE`: a sunny living room of a Thai house
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-023 · ต้นกล้า · ชาย 35 ปี · เขตทวีวัฒนา (`thawi-watthana`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | หนุ่มเกษตรกรหน้าคม ผิวแทน ผมสั้น ยิ้มจริงใจ สวมหมวกสานและเสื้อเชิ้ตลินิน |
| อาชีพ / ไลฟ์สไตล์ | เกษตรกรปลูกผักออร์แกนิก |
| บ้าน (บ้านไม้) | บ้านไม้ยกใต้ถุนกลางสวนผัก ลานใต้ถุนกว้างสำหรับหมา |
| น้องที่ดูแลอยู่ | พริก: สุนัข · ไทยหลังอาน · น้ำตาลแดง · ผู้ 4 ปี<br>มะนาว: สุนัข · หมาไทยพันทาง · เหลืองอ่อน · เมีย 2 ปี<br>ขิง: สุนัข · หมาไทยพันทาง · น้ำตาล · ผู้ 1 ปี |
| ความจุ | ดูแลอยู่ 3/5 ตัว · **รับเพิ่มได้ 2 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว · สุนัข |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ได้ |
| สนใจเป็นพิเศษ | สี: ทุกสี · พันธุ์: หมาไทยพันทาง — สวนกว้างพอให้หมาวิ่ง และหมาไทยปรับตัวกับอากาศร้อนได้ดี |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 16:00–19:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster']`, `speciesAccepted: ['dog']`, `capacityTotal: 5`, `currentCount: 3`, `availability: 'available'`, `acceptsEmergency: true` |

- `LOOK`: a handsome 35-year-old Thai farmer with tanned skin, short hair, a sincere smile, wearing a woven straw hat and a linen shirt
- `SETTING`: an organic vegetable farm at golden hour
- `HOME`: a raised wooden Thai stilt house in the middle of an organic vegetable farm, a wide shaded ground floor with dog beds and water troughs
- `PETS`: three dogs: a red Thai Ridgeback dog (male, about 4 years old); a pale yellow Thai mixed-breed dog (female, about 2 years old); a young brown Thai mixed-breed dog (male, about 1 year old)
- `PET_SCENE`: a shaded yard of a Thai house on a sunny afternoon
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-024 · พลอย · หญิง 23 ปี · เขตห้วยขวาง (`huai-khwang`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวสวยสไตล์เกาหลี ผมดำยาวม้วนปลาย ผิวฉ่ำ แต่งหน้าโทนชมพู สวมสเวตเตอร์ตัวใหญ่สีเบจ |
| อาชีพ / ไลฟ์สไตล์ | พนักงานบริษัทเกม |
| บ้าน (คอนโด) | คอนโดห้องสตูดิโอ โทนพาสเทล |
| น้องที่ดูแลอยู่ | โมจิ: แมว · อเมริกันช็อตแฮร์ · เงินลายคลาสสิก · เมีย 1 ปี |
| ความจุ | ดูแลอยู่ 1/1 ตัว · **เต็มแล้ว** |
| โหมด · ชนิดสัตว์ | รับเลี้ยงถาวร · แมว |
| ความพร้อม | ปิดรับชั่วคราว · รับกรณีฉุกเฉิน: ไม่ได้ · ปิดรับชั่วคราวระหว่างย้ายที่อยู่ |
| สนใจเป็นพิเศษ | สี: เงินลาย · พันธุ์: อเมริกันช็อตแฮร์ — ชอบนิสัยขี้เล่นแต่ไม่วุ่นวาย ตอนนี้กำลังจะย้ายคอนโดจึงปิดรับชั่วคราว |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 21:00–23:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 1`, `currentCount: 1`, `availability: 'unavailable'`, `acceptsEmergency: false` |

- `LOOK`: a gorgeous 23-year-old Thai woman with Korean-inspired style, long black hair with soft curled ends, dewy skin, rosy makeup, wearing an oversized beige sweater
- `SETTING`: a pastel-toned studio room
- `HOME`: a pastel-toned studio condo with fairy lights, a small cat tree, a pink cat bed and a tidy desk
- `PETS`: one cat: a young silver classic tabby American Shorthair cat (female, about 1 year old)
- `PET_SCENE`: a bright condo living room near a window
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-025 · วีระ · ชาย 52 ปี · เขตดินแดง (`din-daeng`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | คุณลุงวัยกลางคนใจดี ผมดำแซมขาวหวีเรียบ ยิ้มอบอุ่น เหน็บแว่นอ่านหนังสือไว้ที่กระเป๋าเสื้อ |
| อาชีพ / ไลฟ์สไตล์ | คนขับแท็กซี่กะกลางวัน |
| บ้าน (อพาร์ตเมนต์/ห้องเช่า) | ห้องแฟลตชุมชนชั้น 3 มีระเบียงเล็กติดตาข่าย |
| น้องที่ดูแลอยู่ | เจ้าขาว: แมว · แมวไทยพันทาง · ขาว · ผู้ 8 ปี |
| ความจุ | ดูแลอยู่ 1/2 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | รับเลี้ยงถาวร · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ไม่จำกัดสี (แมวโต) · พันธุ์: ไม่จำกัดพันธุ์ — แมวโตนิสัยนิ่ง เหมาะกับห้องเล็ก และเจ้าขาวชอบมีเพื่อนนอนด้วย |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 19:00–21:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 2`, `currentCount: 1`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a gentle 52-year-old Thai man with neatly combed black-and-gray hair, a warm smile, reading glasses tucked in his shirt pocket, wearing a light checked shirt
- `SETTING`: a small community flat balcony with plants
- `HOME`: a small community flat room on the third floor with a netted balcony full of potted plants, a simple wooden cat shelf and a folded cat blanket
- `PETS`: one cat: a white mixed-breed domestic shorthair cat (male, about 8 years old)
- `PET_SCENE`: a cozy apartment room with soft daylight
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-026 · แพรวา · หญิง 31 ปี · เขตบางพลัด (`bang-phlat`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวสายโยคะ ผมเปียยาวข้างเดียว รูปร่างเพรียว ผิวสองสี ยิ้มสงบ สวมเสื้อสีเขียวเสจ |
| อาชีพ / ไลฟ์สไตล์ | ครูสอนโยคะ |
| บ้าน (ทาวน์เฮาส์) | ทาวน์โฮมริมแม่น้ำ มีห้องโยคะพื้นไม้ |
| น้องที่ดูแลอยู่ | สมาธิ: แมว · โคราช · เทาเงิน · เมีย 4 ปี |
| ความจุ | ดูแลอยู่ 1/2 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: เทาเงิน · พันธุ์: โคราช — คนไทยถือว่าแมวโคราชเป็นแมวมงคล และชอบนิสัยเงียบสงบที่เข้ากับบ้าน |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 11:00–15:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 2`, `currentCount: 1`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a serene and beautiful 31-year-old Thai woman with a long side braid, a lean build, golden-tan skin, a peaceful smile, wearing a sage-green top
- `SETTING`: a sunlit yoga room with wooden floors
- `HOME`: a riverside townhome with a sunlit wooden-floor yoga room, floor cushions, a low cat bed and a window perch facing the river
- `PETS`: one cat: a silver-blue Korat cat (female, about 4 years old)
- `PET_SCENE`: a warm townhouse living room
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-027 · ณัฐ · ชาย 27 ปี · เขตวังทองหลาง (`wang-thonglang`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | หนุ่มโปรแกรมเมอร์หน้าหล่อ ผมหน้าม้ายุ่งนิด ๆ ใส่แว่นกรอบดำ ยิ้มขี้อาย สวมฮู้ดดี้สีเทา |
| อาชีพ / ไลฟ์สไตล์ | โปรแกรมเมอร์ทำงานจากบ้าน |
| บ้าน (ทาวน์เฮาส์) | ทาวน์เฮาส์ 3 ชั้น ห้องทำงานมีชั้นแมวติดผนัง |
| น้องที่ดูแลอยู่ | บั๊ก: แมว · แมวไทยพันทาง · ขาวดำ · ผู้ 3 ปี<br>ฟีเจอร์: แมว · แมวไทยพันทาง · ส้ม · ผู้ 2 ปี |
| ความจุ | ดูแลอยู่ 2/4 ตัว · **รับเพิ่มได้ 2 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ได้ |
| สนใจเป็นพิเศษ | สี: ทุกสี (ลูกแมว) · พันธุ์: ไม่จำกัดพันธุ์ — ทำงานที่บ้านทั้งวัน จึงป้อนอาหารลูกแมวได้ตรงเวลา |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 12:00–13:00 และ 18:00–21:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster']`, `speciesAccepted: ['cat']`, `capacityTotal: 4`, `currentCount: 2`, `availability: 'available'`, `acceptsEmergency: true` |

- `LOOK`: a handsome 27-year-old Thai software developer with messy fringe hair, black-framed glasses, a shy smile, wearing a gray hoodie
- `SETTING`: a home office with a desk setup
- `HOME`: a three-story townhouse home office with a dual-monitor desk, cat shelves and bridges mounted along the walls, and a kitten-safe playpen
- `PETS`: two cats: a black and white tuxedo mixed-breed domestic shorthair cat (male, about 3 years old); an orange mixed-breed domestic shorthair cat (male, about 2 years old)
- `PET_SCENE`: a warm townhouse living room
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-028 · จันทร์เจ้า · หญิง 64 ปี · เขตพระโขนง (`phra-khanong`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | คุณยายสง่างาม ผมขาวเกล้ามวยเรียบร้อย ตาอ่อนโยน ยิ้มใจดี สวมคาร์ดิแกนสีม่วงลาเวนเดอร์ |
| อาชีพ / ไลฟ์สไตล์ | เจ้าของร้านขนมไทยที่เกษียณแล้ว |
| บ้าน (บ้านเดี่ยว) | บ้านเดี่ยวหลังเก่ามีสวนหน้าบ้าน ประตูมุ้งลวดสองชั้น |
| น้องที่ดูแลอยู่ | ทองหยอด: แมว · แมวไทยพันทาง · ส้ม · เมีย 10 ปี<br>ฝอยทอง: แมว · แมวไทยพันทาง · ส้มขาว · เมีย 9 ปี |
| ความจุ | ดูแลอยู่ 2/3 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | รับเลี้ยงถาวร · แมว |
| ความพร้อม | รับได้จำกัด · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ส้ม (แมวสูงวัย) · พันธุ์: ไม่จำกัดพันธุ์ — อยากให้แมวแก่ได้มีบ้านสงบ ๆ ในบั้นปลาย เหมือนทองหยอดกับฝอยทอง |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 09:00–16:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 3`, `currentCount: 2`, `availability: 'limited'`, `acceptsEmergency: false` |

- `LOOK`: an elegant 64-year-old Thai woman with neatly styled white hair in a bun, gentle eyes, a kind smile, wearing a soft lavender cardigan
- `SETTING`: a traditional Thai dessert kitchen
- `HOME`: an old detached house with a lush front garden, double screen doors, a vintage wooden sofa with cat cushions and brass trays on the shelves
- `PETS`: two cats: a senior orange mixed-breed domestic shorthair cat (female, about 10 years old); an orange and white mixed-breed domestic shorthair cat (female, about 9 years old)
- `PET_SCENE`: a sunny living room of a Thai house
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-029 · ภาคิน · ชาย 29 ปี · เขตสะพานสูง (`saphan-sung`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | ผู้ชายเข้มหล่อ ผมดำยุ่งนิด ๆ คิ้วเข้ม หนวดเคราบาง สวมแจ็กเก็ตหนังสีน้ำตาล |
| อาชีพ / ไลฟ์สไตล์ | ช่างซ่อมมอเตอร์ไซค์คลาสสิก |
| บ้าน (บ้านเดี่ยว) | บ้านเดี่ยวมีโรงรถกว้าง แยกลานวิ่งสำหรับหมา |
| น้องที่ดูแลอยู่ | ลูกสูบ: สุนัข · หมาไทยพันทาง · ดำ · ผู้ 4 ปี |
| ความจุ | ดูแลอยู่ 1/3 ตัว · **รับเพิ่มได้ 2 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว · สุนัข |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ได้ |
| สนใจเป็นพิเศษ | สี: ดำ · พันธุ์: ไทยหลังอาน — ชอบหมาดำที่ดูเท่และซื่อสัตย์ และอยากช่วยหมาที่มักถูกรับเลี้ยงช้า |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 18:00–21:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster']`, `speciesAccepted: ['dog']`, `capacityTotal: 3`, `currentCount: 1`, `availability: 'available'`, `acceptsEmergency: true` |

- `LOOK`: a ruggedly handsome 29-year-old Thai man with tousled dark hair, thick brows, light stubble, wearing a brown leather jacket
- `SETTING`: a garage with classic motorcycles
- `HOME`: a detached house with a wide garage of classic motorcycles and a separate fenced dog run with a shaded kennel
- `PETS`: one dog: a black Thai mixed-breed dog (male, about 4 years old)
- `PET_SCENE`: a shaded yard of a Thai house on a sunny afternoon
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-030 · ปิ่นมุก · หญิง 35 ปี · เขตคันนายาว (`khan-na-yao`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวสวยอารมณ์ดี ผมประบ่ามีหน้าม้า ยิ้มสดใส สวมเสื้อเชิ้ตยีนส์ |
| อาชีพ / ไลฟ์สไตล์ | เจ้าของร้านออนไลน์ขายของใช้สัตว์เลี้ยง |
| บ้าน (บ้านเดี่ยว) | บ้านเดี่ยวในหมู่บ้าน มีสนามหญ้าเล็ก ๆ และประตูกันหมาในบ้าน |
| น้องที่ดูแลอยู่ | ปุยเมฆ: สุนัข · ปอมเมอเรเนียน · ขาว · เมีย 5 ปี<br>น้ำตาล: แมว · แมวไทยพันทาง · น้ำตาลลายเสือ · ผู้ 3 ปี |
| ความจุ | ดูแลอยู่ 2/4 ตัว · **รับเพิ่มได้ 2 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมวและสุนัข |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ขาว · พันธุ์: ปอมเมอเรเนียน / ชิสุ — ครอบครัวชอบหมาเล็กที่อยู่ในบ้านได้ และรู้วิธีดูแลขนยาว |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 10:00–17:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat','dog']`, `capacityTotal: 4`, `currentCount: 2`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a cheerful 35-year-old Thai woman with shoulder-length hair and bangs, a bright smile, wearing a denim shirt
- `SETTING`: a home office full of pet supply boxes
- `HOME`: a suburban detached house with a small lawn, indoor pet gates, a tidy stockroom of pet supplies and cozy pet beds in the living room
- `PETS`: one cat and one dog: a white Pomeranian dog (female, about 5 years old); a brown tabby mixed-breed domestic shorthair cat (male, about 3 years old)
- `PET_SCENE`: a shaded yard of a Thai house on a sunny afternoon
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-031 · เจตน์ · ชาย 44 ปี · เขตหลักสี่ (`lak-si`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | ผู้ชายไหล่กว้าง ผมเกรียนสั้น หน้าคมเข้ม ยิ้มมั่นใจแต่ใจดี สวมเสื้อยืดสีกรมท่า |
| อาชีพ / ไลฟ์สไตล์ | เจ้าหน้าที่กู้ภัยอาสา |
| บ้าน (ทาวน์เฮาส์) | ทาวน์เฮาส์ 2 ชั้น มีกรงพักฟื้นแยกและทางลาดสำหรับหมาขาไม่ดี |
| น้องที่ดูแลอยู่ | ฮีโร่: สุนัข · หมาไทยพันทาง · น้ำตาลเข้ม · ผู้ 6 ปี |
| ความจุ | ดูแลอยู่ 1/3 ตัว · **รับเพิ่มได้ 2 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว · แมวและสุนัข |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ได้ |
| สนใจเป็นพิเศษ | สี: ทุกสี (สัตว์พิการ) · พันธุ์: ไม่จำกัดพันธุ์ — เคยช่วยน้องที่บาดเจ็บ จึงอยากดูแลน้องที่ต้องพักฟื้นหรือพิการ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 19:00–21:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster']`, `speciesAccepted: ['cat','dog']`, `capacityTotal: 3`, `currentCount: 1`, `availability: 'available'`, `acceptsEmergency: true` |

- `LOOK`: a strong 44-year-old Thai man with broad shoulders, a buzz cut, rugged features, a confident yet kind smile, wearing a plain navy t-shirt
- `SETTING`: a townhouse front yard with a rescue gear shelf
- `HOME`: a two-story townhouse with a clean separate recovery area of spacious crates, a ramp for mobility-impaired dogs and orthopedic pet beds
- `PETS`: one dog: a dark brown Thai mixed-breed dog (three-legged) (male, about 6 years old)
- `PET_SCENE`: a warm townhouse living room
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-032 · นภัส · หญิง 28 ปี · เขตจตุจักร (`chatuchak`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวสวยสง่า มวยผมต่ำเรียบ แต่งหน้าประณีต ยิ้มสุภาพ สวมเสื้อเชิ้ตผ้าซาตินสีงาช้าง |
| อาชีพ / ไลฟ์สไตล์ | พนักงานต้อนรับบนเครื่องบิน |
| บ้าน (คอนโด) | คอนโดมินิมอลใกล้สวนสาธารณะ |
| น้องที่ดูแลอยู่ | ยังไม่มี |
| ความจุ | ดูแลอยู่ 0/1 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | รับเลี้ยงถาวร · แมว |
| ความพร้อม | ปิดรับชั่วคราว · รับกรณีฉุกเฉิน: ไม่ได้ · ปิดรับชั่วคราว |
| สนใจเป็นพิเศษ | สี: ครีม · พันธุ์: เปอร์เซีย — ตั้งใจรับเลี้ยงเมื่อย้ายไปทำงานภาคพื้นดิน ตอนนี้บินบ่อยจึงปิดรับชั่วคราว |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ช่วงนี้ไม่สะดวกรับติดต่อ · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 1`, `currentCount: 0`, `availability: 'unavailable'`, `acceptsEmergency: false` |

- `LOOK`: a graceful 28-year-old Thai woman with a sleek low bun, polished makeup, a poised smile, wearing an ivory satin shirt
- `SETTING`: a minimalist condo near a park
- `HOME`: a minimalist condo near a park with a clean white sofa, a neatly made bed, large windows and an empty spot prepared for a future cat tree
- ภาพ: `profile.webp`, `home.webp` (ไม่มี `pets.webp` เพราะยังไม่มีน้องในความดูแล)

#### adopter-033 · ชยพล · ชาย 32 ปี · เขตลาดพร้าว (`lat-phrao`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | หนุ่มออฟฟิศหน้าตาดี ผมควิฟฟ์เรียบร้อย โกนหนวดสะอาด พับแขนเสื้อเชิ้ตขาว ยิ้มสดใส |
| อาชีพ / ไลฟ์สไตล์ | นักบัญชี |
| บ้าน (คอนโด) | คอนโด 1 ห้องนอนใกล้รถไฟฟ้า มีตาข่ายระเบียง |
| น้องที่ดูแลอยู่ | ภาษี: แมว · แมวไทยพันทาง · ส้ม · ผู้ 4 ปี |
| ความจุ | ดูแลอยู่ 1/2 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ส้ม · พันธุ์: ไม่จำกัดพันธุ์ — ภาษีเป็นแมวส้มตัวแรกในชีวิต และอยากหาเพื่อนสีเดียวกันให้ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 19:00–21:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 2`, `currentCount: 1`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a handsome 32-year-old Thai office worker with a neat quiff, clean-shaven, white shirt sleeves rolled up, a bright smile
- `SETTING`: a modern condo living room
- `HOME`: a modern one-bedroom condo with a netted balcony, a gray sofa, a scratching post and a neatly organized cat corner
- `PETS`: one cat: an orange mixed-breed domestic shorthair cat (male, about 4 years old)
- `PET_SCENE`: a bright condo living room near a window
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-034 · วรรณา · หญิง 50 ปี · เขตบางกะปิ (`bang-kapi`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | ป้าแม่ค้าใจดี ผมสั้นดัดลอน ใส่แว่นห้อยสายลูกปัด ยิ้มกว้างเป็นกันเอง สวมผ้ากันเปื้อนลายดอก |
| อาชีพ / ไลฟ์สไตล์ | แม่ค้าขายข้าวแกง |
| บ้าน (ตึกแถว) | ตึกแถวที่ด้านหน้าเป็นร้านข้าวแกง ชั้นบนเป็นที่อยู่และห้องแมว |
| น้องที่ดูแลอยู่ | ข้าวมัน: แมว · แมวไทยพันทาง · ขาว · ผู้ 5 ปี<br>ไก่ทอด: แมว · แมวไทยพันทาง · ส้ม · ผู้ 4 ปี<br>แกงเขียว: แมว · แมวไทยพันทาง · ลายเสือเทา · เมีย 3 ปี |
| ความจุ | ดูแลอยู่ 3/5 ตัว · **รับเพิ่มได้ 2 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ได้ |
| สนใจเป็นพิเศษ | สี: ไม่จำกัดสี · พันธุ์: ไม่จำกัดพันธุ์ — ร้านอยู่ใกล้ตลาด เจอแมวหลงบ่อย จึงช่วยดูแลชั่วคราวระหว่างรอเจ้าของหรือบ้านใหม่ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 14:00–17:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster']`, `speciesAccepted: ['cat']`, `capacityTotal: 5`, `currentCount: 3`, `availability: 'available'`, `acceptsEmergency: true` |

- `LOOK`: a warm-hearted 50-year-old Thai woman with short permed hair, glasses on a beaded chain, a big friendly smile, wearing a floral apron
- `SETTING`: a small Thai curry-and-rice shop front
- `HOME`: the upstairs rooms of a shophouse above a small curry-and-rice shop, a screened cat room with plastic storage boxes turned into cozy beds and a feeding shelf
- `PETS`: three cats: a white mixed-breed domestic shorthair cat (male, about 5 years old); an orange mixed-breed domestic shorthair cat (male, about 4 years old); a gray tabby mixed-breed domestic shorthair cat (female, about 3 years old)
- `PET_SCENE`: the upstairs room of an old shophouse with wooden windows
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-035 · ธนา · ชาย 36 ปี · เขตวัฒนา (`watthana`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สถาปนิกหนุ่มมีสไตล์ ใส่แว่นกรอบกลม ไว้เคราสั้น สวมเสื้อคอเต่าสีดำ ยิ้มมุมปาก |
| อาชีพ / ไลฟ์สไตล์ | สถาปนิก |
| บ้าน (ทาวน์เฮาส์) | ทาวน์โฮมโมเดิร์นมีคอร์ตกลางบ้านที่ปิดด้วยตาข่ายโปร่ง |
| น้องที่ดูแลอยู่ | ดินสอ: แมว · แมวไทยพันทาง · ดำ · ผู้ 2 ปี<br>สเก็ตช์: แมว · แมวไทยพันทาง · ขาวดำ · เมีย 2 ปี |
| ความจุ | ดูแลอยู่ 2/3 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | รับเลี้ยงถาวร · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ดำ · พันธุ์: บอมเบย์ หรือแมวดำพันทาง — ชอบความเรียบเท่ของแมวดำ เข้ากับบ้านโทนมินิมอล |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 19:00–21:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 3`, `currentCount: 2`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a stylish 36-year-old Thai architect with round tortoiseshell glasses, a short beard, a subtle smile, wearing a black turtleneck
- `SETTING`: a modern home with a central courtyard
- `HOME`: a modern townhome with a central courtyard enclosed by fine netting, concrete and wood interiors, built-in cat walkways and minimalist furniture
- `PETS`: two cats: a solid black mixed-breed domestic shorthair cat (male, about 2 years old); a black and white mixed-breed domestic shorthair cat (female, about 2 years old)
- `PET_SCENE`: a warm townhouse living room
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-036 · ปาริชาติ · หญิง 42 ปี · เขตป้อมปราบศัตรูพ่าย (`pom-prap-sattru-phai`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาววัยสี่สิบสดใส ผมยาวดำขลับ ผิวแทน ยิ้มกว้าง สวมหมวกปีกกว้างและเสื้อผ้าฝ้าย |
| อาชีพ / ไลฟ์สไตล์ | มัคคุเทศก์นำเที่ยวย่านเมืองเก่า |
| บ้าน (ตึกแถว) | ห้องชุดในตึกแถวเก่าย่านเมืองเก่า เพดานสูงหน้าต่างไม้ |
| น้องที่ดูแลอยู่ | ขนมชั้น: แมว · แมวไทยพันทาง · สามสี · เมีย 6 ปี |
| ความจุ | ดูแลอยู่ 1/2 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว · แมว |
| ความพร้อม | รับได้จำกัด · รับกรณีฉุกเฉิน: ไม่ได้ · ช่วงมีทัวร์ต่างจังหวัดรับไม่ได้ |
| สนใจเป็นพิเศษ | สี: สามสี · พันธุ์: ไม่จำกัดพันธุ์ — ชอบลายสามสีที่ดูมีเรื่องเล่า และช่วงพาทัวร์หลายวันจะรับไม่ได้ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | วันจันทร์–พฤหัส 18:00–20:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster']`, `speciesAccepted: ['cat']`, `capacityTotal: 2`, `currentCount: 1`, `availability: 'limited'`, `acceptsEmergency: false` |

- `LOOK`: a lively 42-year-old Thai woman with long glossy black hair, tanned skin, a wide smile, wearing a wide-brimmed hat and a cotton blouse
- `SETTING`: an old-town street with shophouses
- `HOME`: an apartment inside a restored old-town shophouse with high ceilings, tall wooden windows fitted with mesh, antique furniture and a cat tree
- `PETS`: one cat: a calico mixed-breed domestic shorthair cat (female, about 6 years old)
- `PET_SCENE`: the upstairs room of an old shophouse with wooden windows
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-037 · กานต์ · ชาย 24 ปี · เขตบางกอกใหญ่ (`bangkok-yai`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | หนุ่มนักดนตรีหน้าหล่อ ผมยาวมัดครึ่งหัว ตาอบอุ่น ยิ้มละมุน สวมเสื้อยืดสีขาวกับเชิ้ตเปิดกระดุม |
| อาชีพ / ไลฟ์สไตล์ | นักดนตรีกลางคืน |
| บ้าน (บ้านไม้) | ห้องเช่าในบ้านไม้เก่าริมคลอง หน้าต่างติดมุ้งลวด |
| น้องที่ดูแลอยู่ | คอร์ด: แมว · แมวไทยพันทาง · ส้ม · ผู้ 2 ปี |
| ความจุ | ดูแลอยู่ 1/2 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ส้ม · พันธุ์: ไม่จำกัดพันธุ์ — คอร์ดชอบนอนฟังกีตาร์ อยากให้น้องที่รอบ้านได้พักในห้องที่อบอุ่น |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 12:00–16:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster']`, `speciesAccepted: ['cat']`, `capacityTotal: 2`, `currentCount: 1`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a handsome 24-year-old Thai musician with long hair in a half-up knot, warm eyes, a soft smile, wearing a white tee under an open shirt
- `SETTING`: a small room with an acoustic guitar on the wall
- `HOME`: a rented room in an old wooden canal-side house with mesh-screened windows, an acoustic guitar on the wall, a record player and a cat bed
- `PETS`: one cat: an orange mixed-breed domestic shorthair cat (male, about 2 years old)
- `PET_SCENE`: the veranda of a traditional Thai wooden house
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-038 · เพ็ญศรี · หญิง 55 ปี · เขตภาษีเจริญ (`phasi-charoen`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | คุณป้าสไตล์ดี ผมสั้นสีเงิน ต่างหูเงินชิ้นโต ยิ้มอบอุ่น สวมเสื้อผ้าทอมือ |
| อาชีพ / ไลฟ์สไตล์ | เจ้าของร้านผ้าไทย |
| บ้าน (บ้านไม้) | บ้านไม้สักริมคลอง มีลานหน้าบ้านล้อมรั้ว |
| น้องที่ดูแลอยู่ | ผ้าขาวม้า: สุนัข · หมาไทยพันทาง · ขาวลายดำ · เมีย 7 ปี<br>ครามดำ: แมว · แมวไทยพันทาง · ขาวดำ · ผู้ 4 ปี |
| ความจุ | ดูแลอยู่ 2/3 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมวและสุนัข |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ขาวดำ · พันธุ์: ไม่จำกัดพันธุ์ — ชอบลายขาวดำเหมือนลายผ้าที่ทอ และบ้านรับได้ทั้งหมาและแมว |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 17:00–19:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat','dog']`, `capacityTotal: 3`, `currentCount: 2`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a stylish 55-year-old Thai woman with short silver hair, bold silver earrings, a warm smile, wearing a handwoven cotton top
- `SETTING`: a Thai textile shop with woven fabrics
- `HOME`: a teak wooden house by a canal with a fenced front yard, woven textiles draped on furniture, a dog bed on the veranda and a cat window seat
- `PETS`: one cat and one dog: a white with black patches Thai mixed-breed dog (female, about 7 years old); a black and white mixed-breed domestic shorthair cat (male, about 4 years old)
- `PET_SCENE`: a shaded yard of a Thai house on a sunny afternoon
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-039 · อิทธิ · ชาย 47 ปี · เขตดอนเมือง (`don-mueang`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | ผู้ชายหน้าคมเข้ม ผมสั้นแซมขาวที่ขมับ ยิ้มสุขุม สวมเสื้อเชิ้ตทำงานสีเทา |
| อาชีพ / ไลฟ์สไตล์ | ช่างเทคนิคซ่อมบำรุงอากาศยาน |
| บ้าน (บ้านเดี่ยว) | บ้านเดี่ยวมีรั้วสูงและสนามหลังบ้าน |
| น้องที่ดูแลอยู่ | ใบพัด: สุนัข · ลาบราดอร์รีทรีฟเวอร์ · ดำ · ผู้ 5 ปี |
| ความจุ | ดูแลอยู่ 1/3 ตัว · **รับเพิ่มได้ 2 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · สุนัข |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ได้ |
| สนใจเป็นพิเศษ | สี: ดำ · พันธุ์: ลาบราดอร์ รีทรีฟเวอร์ — ใบพัดเป็นมิตรกับหมาทุกตัว บ้านจึงรับหมาที่ต้องหาที่พักด่วนได้ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 18:00–21:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['dog']`, `capacityTotal: 3`, `currentCount: 1`, `availability: 'available'`, `acceptsEmergency: true` |

- `LOOK`: a handsome 47-year-old Thai man with sharp features, short hair graying at the temples, a composed smile, wearing a gray work shirt
- `SETTING`: a quiet suburban street
- `HOME`: a detached house with a tall fence, a grassy backyard, a sturdy dog house, a kiddie pool for dogs and shade sails
- `PETS`: one dog: a black Labrador Retriever dog (male, about 5 years old)
- `PET_SCENE`: a shaded yard of a Thai house on a sunny afternoon
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-040 · มายด์ · หญิง 26 ปี · เขตสาทร (`sathon`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวสวยมั่นใจ ผมยาวตรงเรียบ แต่งหน้ามินิมอล สวมเบลเซอร์สีกรมท่า |
| อาชีพ / ไลฟ์สไตล์ | ทนายความ |
| บ้าน (คอนโด) | คอนโดวิวเมือง ห้องนั่งเล่นกว้าง ระเบียงติดตาข่าย |
| น้องที่ดูแลอยู่ | ยังไม่มี |
| ความจุ | ดูแลอยู่ 0/1 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | รับเลี้ยงถาวร · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: เทาฟ้า · พันธุ์: รัสเซียนบลู — ชอบนิสัยสงบของแมวขนสั้นสีเทาฟ้า และเตรียมบ้านไว้สำหรับรับเลี้ยงตัวแรก |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 20:00–22:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 1`, `currentCount: 0`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a confident and beautiful 26-year-old Thai woman with sleek long straight hair, minimal makeup, wearing a navy blazer
- `SETTING`: a city-view condo at dusk
- `HOME`: a city-view condo with a spacious living room, a netted balcony, a new unused cat tree and bowls ready for a first cat
- ภาพ: `profile.webp`, `home.webp` (ไม่มี `pets.webp` เพราะยังไม่มีน้องในความดูแล)

#### adopter-041 · ก้อง · ชาย 33 ปี · เขตบางเขน (`bang-khen`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | ผู้ชายสายเดินป่า ผมยาวประบ่าลอนนิด ๆ ไว้เครา ผิวแทน สวมเสื้อเชิ้ตลายสก๊อต |
| อาชีพ / ไลฟ์สไตล์ | ไกด์เดินป่า |
| บ้าน (บ้านเดี่ยว) | บ้านเดี่ยวมีสวนหลังบ้านกว้าง |
| น้องที่ดูแลอยู่ | ภูเขา: สุนัข · หมาพันทางเชพเพิร์ด · น้ำตาลดำ · ผู้ 5 ปี |
| ความจุ | ดูแลอยู่ 1/2 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว · สุนัข |
| ความพร้อม | รับได้จำกัด · รับกรณีฉุกเฉิน: ไม่ได้ · ช่วงมีทริปหลายวันรับไม่ได้ |
| สนใจเป็นพิเศษ | สี: น้ำตาลดำ · พันธุ์: หมาใหญ่พันทาง — ภูเขาเข้ากับหมาใหญ่ได้ดี แต่ช่วงมีทริปเดินป่ารับไม่ได้ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ช่วงไม่มีทริป 18:00–20:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster']`, `speciesAccepted: ['dog']`, `capacityTotal: 2`, `currentCount: 1`, `availability: 'limited'`, `acceptsEmergency: false` |

- `LOOK`: a rugged and handsome 33-year-old Thai outdoorsman with wavy shoulder-length hair, a beard, tanned skin, wearing a flannel shirt
- `SETTING`: a backyard with camping gear
- `HOME`: a detached house with a wide backyard garden, camping gear stored in a shed, a large dog bed on a covered porch and a water trough
- `PETS`: one dog: a black and tan German Shepherd mix dog (male, about 5 years old)
- `PET_SCENE`: a shaded yard of a Thai house on a sunny afternoon
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-042 · ชมพู่ · หญิง 30 ปี · เขตสายไหม (`sai-mai`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวหน้าหวาน ผมบ็อบสั้นมีหน้าม้า แก้มแดงระเรื่อ ยิ้มสดใส สวมเสื้อลายจุด |
| อาชีพ / ไลฟ์สไตล์ | ครูประถม |
| บ้าน (ทาวน์เฮาส์) | ทาวน์เฮาส์ 2 ชั้น ห้องนั่งเล่นมีมุมเล่นของแมว |
| น้องที่ดูแลอยู่ | เงาะ: แมว · แมวไทยพันทาง · ส้ม · เมีย 3 ปี<br>ลำไย: แมว · แมวไทยพันทาง · น้ำตาลอ่อน · ผู้ 2 ปี |
| ความจุ | ดูแลอยู่ 2/3 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ส้มขาว · พันธุ์: ไม่จำกัดพันธุ์ — อยากให้บ้านมีครบทั้งส้มและขาว ให้เหมือนชื่อผลไม้ของน้อง ๆ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 17:00–20:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 3`, `currentCount: 2`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a sweet 30-year-old Thai woman with a short bob and bangs, rosy cheeks, a bright smile, wearing a polka-dot blouse
- `SETTING`: a cheerful townhouse living room
- `HOME`: a cheerful townhouse living room with a play corner of tunnels and toys, a cat tree by the window and colorful cushions
- `PETS`: two cats: an orange mixed-breed domestic shorthair cat (female, about 3 years old); a light brown mixed-breed domestic shorthair cat (male, about 2 years old)
- `PET_SCENE`: a warm townhouse living room
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-043 · สิงห์ · ชาย 39 ปี · เขตมีนบุรี (`min-buri`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | ผู้ชายเข้ม ผิวคล้ำแดด แขนแข็งแรง ผมหยิกสั้น ตาใจดี สวมเสื้อยืดสีเทาเปื้อนน้ำมันนิด ๆ |
| อาชีพ / ไลฟ์สไตล์ | เจ้าของอู่ซ่อมรถ |
| บ้าน (บ้านเดี่ยว) | บ้านเดี่ยวติดอู่ มีลานหลังบ้านล้อมรั้วแยกจากอู่ |
| น้องที่ดูแลอยู่ | น็อต: สุนัข · หมาไทยพันทาง · น้ำตาล · ผู้ 3 ปี<br>เบรก: สุนัข · หมาไทยพันทาง · ขาวน้ำตาล · เมีย 2 ปี |
| ความจุ | ดูแลอยู่ 2/4 ตัว · **รับเพิ่มได้ 2 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว · สุนัข |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ได้ |
| สนใจเป็นพิเศษ | สี: ไม่จำกัดสี · พันธุ์: หมาไทยพันทาง — ลานหลังบ้านกว้างและแยกจากอู่ชัดเจน จึงรับหมาที่ต้องการที่พักชั่วคราวได้ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 18:00–20:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster']`, `speciesAccepted: ['dog']`, `capacityTotal: 4`, `currentCount: 2`, `availability: 'available'`, `acceptsEmergency: true` |

- `LOOK`: a rugged 39-year-old Thai man with deep sun-tanned skin, strong arms, short curly hair, kind eyes, wearing a gray t-shirt
- `SETTING`: an auto repair garage
- `HOME`: a detached house next to an auto repair garage, with a separately fenced backyard for dogs, raised dog beds and a shaded water station
- `PETS`: two dogs: a brown Thai mixed-breed dog (male, about 3 years old); a white and brown Thai mixed-breed dog (female, about 2 years old)
- `PET_SCENE`: a shaded yard of a Thai house on a sunny afternoon
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-044 · ลลิล · หญิง 27 ปี · เขตพญาไท (`phaya-thai`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวน่ารักแว่นกรอบทองบาง ผมยาวตรงเรียบร้อย ยิ้มเขิน ๆ สวมเสื้อไหมพรมสีเขียวหม่น |
| อาชีพ / ไลฟ์สไตล์ | บรรณารักษ์ |
| บ้าน (คอนโด) | คอนโดเล็กที่มีชั้นหนังสือเต็มผนัง |
| น้องที่ดูแลอยู่ | จดหมาย: แมว · แมวไทยพันทาง · ขาวเทา · เมีย 4 ปี |
| ความจุ | ดูแลอยู่ 1/2 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: เทาขาว · พันธุ์: ไม่จำกัดพันธุ์ — จดหมายชอบนอนบนหนังสือ และอยากได้เพื่อนสีเทาขาวเหมือนกัน |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 18:00–20:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 2`, `currentCount: 1`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a lovely 27-year-old Thai woman with thin gold wire-rimmed glasses, long neat straight hair, a shy smile, wearing a muted green knit sweater
- `SETTING`: a small condo filled with books
- `HOME`: a small condo with wall-to-wall bookshelves, a reading nook with a blanket, a cat bed tucked between books and warm lamp light
- `PETS`: one cat: a gray and white mixed-breed domestic shorthair cat (female, about 4 years old)
- `PET_SCENE`: a bright condo living room near a window
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-045 · ภูมิ · ชาย 21 ปี · เขตบางรัก (`bang-rak`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | หนุ่มนักศึกษาหน้าใส ผมสั้นทรงรองทรง ผิวสองสี ยิ้มกว้าง สวมเสื้อกีฬา |
| อาชีพ / ไลฟ์สไตล์ | นักศึกษาพลศึกษา |
| บ้าน (อพาร์ตเมนต์/ห้องเช่า) | ห้องพักแบบอพาร์ตเมนต์ใกล้สนามกีฬา |
| น้องที่ดูแลอยู่ | ยังไม่มี |
| ความจุ | ดูแลอยู่ 0/1 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว · แมว |
| ความพร้อม | ปิดรับชั่วคราว · รับกรณีฉุกเฉิน: ไม่ได้ · ปิดรับชั่วคราวระหว่างฝึกงาน |
| สนใจเป็นพิเศษ | สี: ส้ม · พันธุ์: ไม่จำกัดพันธุ์ — ตั้งใจช่วยอุปถัมภ์แมวส้มหลังฝึกงาน ตอนนี้กลับต่างจังหวัดจึงปิดรับ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ช่วงนี้ไม่สะดวก · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster']`, `speciesAccepted: ['cat']`, `capacityTotal: 1`, `currentCount: 0`, `availability: 'unavailable'`, `acceptsEmergency: false` |

- `LOOK`: a fresh-faced 21-year-old Thai man with a short tapered haircut, golden-brown skin, a wide smile, wearing a sports jersey
- `SETTING`: a campus-area apartment
- `HOME`: a simple apartment room near a sports field with a single bed, sports gear on hooks and a neat empty corner
- ภาพ: `profile.webp`, `home.webp` (ไม่มี `pets.webp` เพราะยังไม่มีน้องในความดูแล)

#### adopter-046 · กิ่งแก้ว · หญิง 38 ปี · เขตบางคอแหลม (`bang-kho-laem`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวสวยวัยสามสิบปลาย ผมยาวดัดลอนใหญ่ แต่งหน้าบางเบา ยิ้มอ่อนโยน สวมเดรสผ้าฝ้าย |
| อาชีพ / ไลฟ์สไตล์ | นักบัญชีอิสระ |
| บ้าน (คอนโด) | คอนโดริมแม่น้ำ ระเบียงติดตาข่าย |
| น้องที่ดูแลอยู่ | ข้าวปั้น: แมว · สก็อตติชสเตรท · ครีม · เมีย 3 ปี<br>สาหร่าย: แมว · แมวไทยพันทาง · ดำ · ผู้ 3 ปี |
| ความจุ | ดูแลอยู่ 2/2 ตัว · **เต็มแล้ว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมว |
| ความพร้อม | รับได้จำกัด · รับกรณีฉุกเฉิน: ไม่ได้ · ตอนนี้เต็มแล้ว |
| สนใจเป็นพิเศษ | สี: ครีม · พันธุ์: สก็อตติชสเตรท (หูตั้ง) — ชอบหน้ากลมของสายพันธุ์นี้ แต่เลือกหูตั้งเพื่อหลีกเลี่ยงปัญหากระดูกอ่อนของแมวหูพับ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 18:00–20:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 2`, `currentCount: 2`, `availability: 'limited'`, `acceptsEmergency: false` |

- `LOOK`: a graceful 38-year-old Thai woman with long loose curls, light makeup, a gentle smile, wearing a cotton dress
- `SETTING`: a riverside condo balcony
- `HOME`: a riverside condo with a netted balcony overlooking the river, a rattan chair, a cat tree and matching cat beds
- `PETS`: two cats: a cream Scottish Straight cat (female, about 3 years old); a black mixed-breed domestic shorthair cat (male, about 3 years old)
- `PET_SCENE`: a bright condo living room near a window
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-047 · ธีร์ · ชาย 29 ปี · เขตบางแค (`bang-khae`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | หนุ่มหล่อลุคเกาหลี ผมทรงสองบล็อกสีน้ำตาลเข้ม ผิวขาว ยิ้มละมุน สวมเสื้อเชิ้ตสีครีม |
| อาชีพ / ไลฟ์สไตล์ | นักออกแบบ UX |
| บ้าน (ทาวน์เฮาส์) | ทาวน์โฮม 2 ชั้นในหมู่บ้าน ลานหลังบ้านเล็ก ๆ |
| น้องที่ดูแลอยู่ | โคโค่: สุนัข · ชิบะอินุ · แดง · ผู้ 3 ปี<br>นัตตะ: แมว · แมวไทยพันทาง · ส้มขาว · เมีย 2 ปี |
| ความจุ | ดูแลอยู่ 2/4 ตัว · **รับเพิ่มได้ 2 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมวและสุนัข |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: แดง/ส้ม · พันธุ์: ชิบะอินุ หรือหมาไทยพันทางสีแดง — ชอบหมาสีแดงอบอุ่น และบ้านที่มีหมาแมวอยู่ด้วยกันได้อย่างสงบ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 19:00–22:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat','dog']`, `capacityTotal: 4`, `currentCount: 2`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a handsome 29-year-old Thai man with Korean-inspired style, a dark brown two-block haircut, fair skin, a soft smile, wearing a cream shirt
- `SETTING`: a modern townhouse living room
- `HOME`: a two-story townhome with a small fenced back patio, a modern living room with a dog bed and a cat tree side by side
- `PETS`: one cat and one dog: a red Shiba Inu dog (male, about 3 years old); an orange and white mixed-breed domestic shorthair cat (female, about 2 years old)
- `PET_SCENE`: a warm townhouse living room
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-048 · รุ่งนภา · หญิง 61 ปี · เขตตลิ่งชัน (`taling-chan`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | คุณป้าผิวสองสี ผมสั้นหงอกแซม ยิ้มกว้างใจดี สวมเสื้อเชิ้ตลายดอกกล้วยไม้ |
| อาชีพ / ไลฟ์สไตล์ | เจ้าของสวนกล้วยไม้ |
| บ้าน (บ้านเดี่ยว) | บ้านเดี่ยวกลางสวนกล้วยไม้ มีเรือนเพาะชำและลานหญ้ากว้าง |
| น้องที่ดูแลอยู่ | กล้วยไม้: สุนัข · หมาไทยพันทาง · ขาว · เมีย 6 ปี<br>หวาย: สุนัข · หมาไทยพันทาง · ดำขาว · ผู้ 5 ปี<br>เอื้อง: แมว · แมวไทยพันทาง · ส้ม · เมีย 4 ปี |
| ความจุ | ดูแลอยู่ 3/5 ตัว · **รับเพิ่มได้ 2 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมวและสุนัข |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ได้ |
| สนใจเป็นพิเศษ | สี: ขาว · พันธุ์: หมาไทยพันทาง — สวนกว้างเหมาะกับหมาโตที่ต้องการพื้นที่ และคุ้นกับการดูแลสัตว์หลายตัว |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 08:00–17:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat','dog']`, `capacityTotal: 5`, `currentCount: 3`, `availability: 'available'`, `acceptsEmergency: true` |

- `LOOK`: a cheerful 61-year-old Thai woman with warm tan skin, short graying hair, a big kind smile, wearing an orchid-print shirt
- `SETTING`: an orchid nursery
- `HOME`: a detached house in the middle of an orchid nursery with shade-net greenhouses, a wide lawn, dog beds on the veranda and a cat room
- `PETS`: one cat and two dogs: a white Thai mixed-breed dog (female, about 6 years old); a black and white Thai mixed-breed dog (male, about 5 years old); an orange mixed-breed domestic shorthair cat (female, about 4 years old)
- `PET_SCENE`: a shaded yard of a Thai house on a sunny afternoon
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-049 · ยูซุฟ · ชาย 34 ปี · เขตมีนบุรี (`min-buri`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | หนุ่มมุสลิมหน้าคมหล่อ ไว้เคราเรียบร้อย สวมหมวกกะปิเยาะสีขาวและเสื้อเชิ้ตสีเขียวเข้ม |
| อาชีพ / ไลฟ์สไตล์ | เจ้าของร้านอาหารฮาลาล |
| บ้าน (บ้านเดี่ยว) | บ้านเดี่ยวมีระเบียงหลังบ้านติดมุ้งลวด |
| น้องที่ดูแลอยู่ | อะลีฟ: แมว · แมวไทยพันทาง · ขาวส้ม · ผู้ 4 ปี<br>นูร์: แมว · แมวไทยพันทาง · ขาว · เมีย 3 ปี |
| ความจุ | ดูแลอยู่ 2/4 ตัว · **รับเพิ่มได้ 2 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ได้ |
| สนใจเป็นพิเศษ | สี: ขาว · พันธุ์: ไม่จำกัดพันธุ์ — ครอบครัวรักแมวมาก ระเบียงหลังบ้านกว้างพอรับน้องที่ต้องการที่พักด่วน |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 15:00–17:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 4`, `currentCount: 2`, `availability: 'available'`, `acceptsEmergency: true` |

- `LOOK`: a handsome 34-year-old Thai Muslim man with a neatly groomed beard, wearing a white kufi cap and a dark green shirt, a friendly smile
- `SETTING`: a house with a garden patio
- `HOME`: a detached house with a screened back patio, cat shelves on the wall, a spacious litter area and a sunny window seat
- `PETS`: two cats: a white and orange mixed-breed domestic shorthair cat (male, about 4 years old); a white mixed-breed domestic shorthair cat (female, about 3 years old)
- `PET_SCENE`: a sunny living room of a Thai house
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-050 · แจน · หญิง 32 ปี · เขตสวนหลวง (`suan-luang`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวสวยยิ้มสวย ผมยาวประบ่ามัดครึ่งหัว ผิวขาว ฟันเรียงสวย สวมเสื้อเชิ้ตสีขาว |
| อาชีพ / ไลฟ์สไตล์ | ทันตแพทย์ |
| บ้าน (คอนโด) | คอนโด 1 ห้องนอน อนุญาตหมาเล็ก |
| น้องที่ดูแลอยู่ | ถั่วลันเตา: สุนัข · ชิวาวา · ครีม · เมีย 4 ปี |
| ความจุ | ดูแลอยู่ 1/1 ตัว · **เต็มแล้ว** |
| โหมด · ชนิดสัตว์ | รับเลี้ยงถาวร · สุนัข |
| ความพร้อม | รับได้จำกัด · รับกรณีฉุกเฉิน: ไม่ได้ · ตอนนี้เต็มแล้ว |
| สนใจเป็นพิเศษ | สี: ครีม · พันธุ์: ชิวาวา หรือหมาเล็กพันทาง — คอนโดรับได้เฉพาะหมาเล็ก และถั่วลันเตาชอบอยู่ตัวเดียว |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 19:00–21:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['adopt']`, `speciesAccepted: ['dog']`, `capacityTotal: 1`, `currentCount: 1`, `availability: 'limited'`, `acceptsEmergency: false` |

- `LOOK`: a pretty 32-year-old Thai woman with a lovely smile, shoulder-length half-up hair, fair skin, wearing a crisp white shirt
- `SETTING`: a bright modern condo
- `HOME`: a bright modern condo that allows small dogs, with a soft rug, a small dog bed, a puppy gate and tidy toy basket
- `PETS`: one dog: a cream Chihuahua dog (female, about 4 years old)
- `PET_SCENE`: a bright condo living room near a window
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-051 · ไอซ์ · หญิง 27 ปี · เขตลาดกระบัง (`lat-krabang`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวสวยเท่ ผมสั้นดำทัดหู ต่างหูเงินเม็ดเล็ก ผิวใส ยิ้มมั่นใจ สวมเสื้อเชิ้ตสีฟ้าอ่อน |
| อาชีพ / ไลฟ์สไตล์ | นักวิทยาศาสตร์อาหาร |
| บ้าน (ทาวน์เฮาส์) | ทาวน์โฮมใกล้นิคมอุตสาหกรรม ห้องนั่งเล่นโปร่ง |
| น้องที่ดูแลอยู่ | เจล: แมว · แมวไทยพันทาง · ขาวเทา · ผู้ 3 ปี |
| ความจุ | ดูแลอยู่ 1/2 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: เทาขาว · พันธุ์: ไม่จำกัดพันธุ์ — เจลเป็นแมวขี้เหงา อยากได้เพื่อนนิสัยนิ่ง ๆ สีโทนเดียวกัน |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 18:30–21:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 2`, `currentCount: 1`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a cool and beautiful 27-year-old Thai woman with short black hair tucked behind her ears, tiny silver stud earrings, clear skin, a confident smile, wearing a light blue shirt
- `SETTING`: a bright townhome kitchen
- `HOME`: an airy townhome living room near an industrial estate, light wood furniture, a wall-mounted cat ladder and a clean feeding station
- `PETS`: one cat: a gray and white mixed-breed domestic shorthair cat (male, about 3 years old)
- `PET_SCENE`: a warm townhouse living room
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-052 · บอส · ชาย 37 ปี · เขตประเวศ (`prawet`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | นักธุรกิจหนุ่มหล่อ เสยผมเรียบ ไว้เคราแพะบาง ๆ สวมสูทสีกรมท่าไม่ผูกเนกไท |
| อาชีพ / ไลฟ์สไตล์ | เจ้าของบริษัทรับจัดงาน |
| บ้าน (บ้านเดี่ยว) | บ้านเดี่ยวสองชั้น สวนสวย สระว่ายน้ำล้อมรั้วกันหมาตก |
| น้องที่ดูแลอยู่ | ซิงเกิล: สุนัข · เวลช์คอร์กี้ · แดงขาว · ผู้ 4 ปี |
| ความจุ | ดูแลอยู่ 1/3 ตัว · **รับเพิ่มได้ 2 ตัว** |
| โหมด · ชนิดสัตว์ | รับเลี้ยงถาวร · สุนัข |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: แดงขาว · พันธุ์: คอร์กี้ หรือหมาขาสั้นพันทาง — อยากให้ซิงเกิลมีเพื่อน และรู้ว่าหมาขาสั้นต้องระวังเรื่องหลังและน้ำหนัก |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | เสาร์–อาทิตย์ 10:00–16:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['adopt']`, `speciesAccepted: ['dog']`, `capacityTotal: 3`, `currentCount: 1`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a handsome 37-year-old Thai businessman with slicked-back hair, a neatly trimmed goatee, wearing a navy suit without a tie, a charismatic smile
- `SETTING`: a modern house with a garden
- `HOME`: a modern two-story detached house with a landscaped garden, a pool fenced off for pet safety, a corgi-sized dog bed and toys on the terrace
- `PETS`: one dog: a red and white Pembroke Welsh Corgi dog (male, about 4 years old)
- `PET_SCENE`: a shaded yard of a Thai house on a sunny afternoon
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-053 · น้ำฝน · หญิง 45 ปี · เขตคลองสามวา (`khlong-sam-wa`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวใหญ่ผิวแทน ผมยาวรวบหางม้าต่ำ ยิ้มร่าเริง ตาเป็นประกาย สวมเสื้อยืดกับผ้าคลุมไหล่ |
| อาชีพ / ไลฟ์สไตล์ | เจ้าของฟาร์มไข่ไก่เล็ก ๆ |
| บ้าน (บ้านเดี่ยว) | บ้านกึ่งไม้กึ่งปูนกลางทุ่ง มีคอกหมากว้างแยกจากเล้าไก่ |
| น้องที่ดูแลอยู่ | ข้าวโพด: สุนัข · หมาไทยพันทาง · เหลือง · ผู้ 5 ปี<br>ถั่วฝักยาว: สุนัข · หมาไทยพันทาง · ดำ · เมีย 4 ปี<br>แตงกวา: สุนัข · หมาไทยพันทาง · ขาว · เมีย 2 ปี |
| ความจุ | ดูแลอยู่ 3/6 ตัว · **รับเพิ่มได้ 3 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว · สุนัข |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ได้ |
| สนใจเป็นพิเศษ | สี: ไม่จำกัดสี · พันธุ์: หมาไทยพันทาง — มีพื้นที่ทุ่งกว้าง เหมาะกับหมาโตที่ต้องการวิ่งและพักฟื้นชั่วคราว |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 07:00–10:00 และ 16:00–18:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster']`, `speciesAccepted: ['dog']`, `capacityTotal: 6`, `currentCount: 3`, `availability: 'available'`, `acceptsEmergency: true` |

- `LOOK`: a cheerful 45-year-old Thai woman with sun-tanned skin, long hair in a low ponytail, sparkling eyes, a joyful smile, wearing a t-shirt with a light scarf
- `SETTING`: a small farm with open fields
- `HOME`: a half-wood house surrounded by open fields, a large fenced dog enclosure well separated from a chicken coop, shaded kennels and water troughs
- `PETS`: three dogs: a yellow Thai mixed-breed dog (male, about 5 years old); a black Thai mixed-breed dog (female, about 4 years old); a white Thai mixed-breed dog (female, about 2 years old)
- `PET_SCENE`: a shaded yard of a Thai house on a sunny afternoon
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-054 · เอกชัย · ชาย 58 ปี · เขตราษฎร์บูรณะ (`rat-burana`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | คุณลุงทหารเรือเกษียณ ผมขาวตัดสั้นเกรียน ท่าทางสง่า ยิ้มใจดี สวมเสื้อเชิ้ตสีขาว |
| อาชีพ / ไลฟ์สไตล์ | ทหารเรือเกษียณ |
| บ้าน (บ้านเดี่ยว) | บ้านเดี่ยวริมแม่น้ำ ห้องรับแขกกว้างติดมุ้งลวด |
| น้องที่ดูแลอยู่ | นายพล: แมว · วิเชียรมาศ · ครีมแต้มน้ำตาล · ผู้ 6 ปี<br>ทองแดง: แมว · ศุภลักษณ์ · น้ำตาลทองแดง · เมีย 4 ปี |
| ความจุ | ดูแลอยู่ 2/3 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | รับเลี้ยงถาวร · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: น้ำตาลทองแดง · พันธุ์: ศุภลักษณ์ — ชอบแมวไทยโบราณ และศุภลักษณ์สีทองแดงหาได้ยาก อยากให้มีบ้านที่เข้าใจสายพันธุ์ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 09:00–18:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 3`, `currentCount: 2`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a dignified 58-year-old retired Thai navy officer with short-cropped white hair, upright posture, a kind smile, wearing a crisp white shirt
- `SETTING`: a riverside terrace
- `HOME`: a riverside detached house with a spacious screened living room, polished wooden floors, a nautical decor, a tall cat tree and a sunny window ledge
- `PETS`: two cats: a seal point Siamese (Wichien Maat) cat (male, about 6 years old); a copper brown Suphalak cat (female, about 4 years old)
- `PET_SCENE`: a sunny living room of a Thai house
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-055 · ใบบัว · หญิง 29 ปี · เขตทุ่งครุ (`thung-khru`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวผิวคล้ำสวยเปล่งปลั่ง ผมหยิกฟูธรรมชาติ ยิ้มสดใส สวมเสื้อลินินสีขาว |
| อาชีพ / ไลฟ์สไตล์ | อาจารย์มหาวิทยาลัยสาขาชีววิทยา |
| บ้าน (อพาร์ตเมนต์/ห้องเช่า) | อพาร์ตเมนต์ใกล้มหาวิทยาลัย มีคอกกระต่ายในร่มขนาดใหญ่ |
| น้องที่ดูแลอยู่ | ถั่วดำ: กระต่าย · กระต่ายเนเธอร์แลนด์ดวาร์ฟ · ดำ · ผู้ 2 ปี |
| ความจุ | ดูแลอยู่ 1/2 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว · กระต่าย |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ทุกสี · พันธุ์: กระต่ายพันธุ์เล็ก — เลี้ยงกระต่ายเป็นและมีคอกพร้อม จึงช่วยดูแลกระต่ายหลงระหว่างรอเจ้าของ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 18:00–20:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster']`, `speciesAccepted: ['other']`, `capacityTotal: 2`, `currentCount: 1`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a radiant 29-year-old Thai woman with beautiful deep-brown skin, naturally voluminous curly hair, a bright smile, wearing a white linen top
- `SETTING`: a university lab office with plants
- `HOME`: an apartment near a university with a large indoor rabbit enclosure, hay, wooden hideouts, a litter tray and potted herbs by the window
- `PETS`: one rabbit: a black Netherland Dwarf rabbit (male, about 2 years old)
- `PET_SCENE`: a cozy apartment room with soft daylight
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-056 · ปกรณ์ · ชาย 40 ปี · เขตพระนคร (`phra-nakhon`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | ผู้ชายสูงโปร่งหน้าใจดี ผมลอนนิด ๆ ใส่แว่นกลม สวมเสื้อลินินสีครีม |
| อาชีพ / ไลฟ์สไตล์ | เจ้าของร้านหนังสือมือสอง |
| บ้าน (ตึกแถว) | ตึกแถวเก่าที่ชั้นล่างเป็นร้านหนังสือ ชั้นบนเป็นบ้าน |
| น้องที่ดูแลอยู่ | ตัวหนังสือ: แมว · แมวไทยพันทาง · ขาวดำ · ผู้ 5 ปี<br>สารบัญ: แมว · แมวไทยพันทาง · เทา · เมีย 4 ปี<br>ปกแข็ง: แมว · แมวไทยพันทาง · ส้ม · ผู้ 3 ปี |
| ความจุ | ดูแลอยู่ 3/4 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมว |
| ความพร้อม | รับได้จำกัด · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ขาวดำ · พันธุ์: ไม่จำกัดพันธุ์ — ลูกค้าชอบแมวประจำร้าน แต่เลือกรับเพิ่มทีละตัวเพื่อให้แมวเดิมปรับตัวได้ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 17:00–19:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 4`, `currentCount: 3`, `availability: 'limited'`, `acceptsEmergency: false` |

- `LOOK`: a tall and gentle 40-year-old Thai man with slightly wavy hair, round glasses, a warm smile, wearing a cream linen shirt
- `SETTING`: a secondhand bookstore
- `HOME`: an old shophouse with a secondhand bookstore downstairs, stacks of books, a cozy upstairs living room with cat beds on bookshelves and a reading lamp
- `PETS`: three cats: a black and white mixed-breed domestic shorthair cat (male, about 5 years old); a gray mixed-breed domestic shorthair cat (female, about 4 years old); an orange mixed-breed domestic shorthair cat (male, about 3 years old)
- `PET_SCENE`: the upstairs room of an old shophouse with wooden windows
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-057 · มินตรา · หญิง 34 ปี · เขตบางกะปิ (`bang-kapi`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวลูกครึ่งไทย-ยุโรป ผมยาวลอนสีน้ำตาลอ่อน ตาสีน้ำตาลอ่อน ยิ้มอ่อนหวาน สวมเสื้อสเวตเตอร์บาง |
| อาชีพ / ไลฟ์สไตล์ | ครูสอนเปียโน |
| บ้าน (คอนโด) | คอนโดสองห้องนอนที่มีเปียโนอัปไรต์ |
| น้องที่ดูแลอยู่ | โน้ต: แมว · เมนคูน · เงินลายเสือ · ผู้ 4 ปี |
| ความจุ | ดูแลอยู่ 1/2 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: เงิน · พันธุ์: เมนคูน — ชอบแมวตัวใหญ่นิสัยใจดี และรู้ว่าต้องมีพื้นที่ปีนป่ายมากพอ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 16:00–18:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 2`, `currentCount: 1`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a beautiful 34-year-old Thai woman of mixed Thai-European heritage with long light-brown wavy hair, light hazel eyes, a sweet smile, wearing a thin sweater
- `SETTING`: a condo living room with a piano
- `HOME`: a two-bedroom condo with an upright piano, soft rugs, a sturdy tall cat tree for a large cat and big windows
- `PETS`: one cat: a silver tabby Maine Coon cat (male, about 4 years old)
- `PET_SCENE`: a bright condo living room near a window
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-058 · สมชาย · ชาย 66 ปี · เขตบางพลัด (`bang-phlat`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | คุณลุงช่างตัดผมเกษียณ ผมขาวหวีเรียบ หนวดขาวเล็กน้อย ยิ้มอบอุ่น สวมเสื้อเชิ้ตลายทาง |
| อาชีพ / ไลฟ์สไตล์ | ช่างตัดผมเกษียณ |
| บ้าน (บ้านไม้) | บ้านไม้ชั้นเดียวในชุมชนริมน้ำ มีลานปูนหน้าบ้าน |
| น้องที่ดูแลอยู่ | ลุงดำ: สุนัข · หมาไทยพันทาง · ดำแซมขาวที่ปาก · ผู้ 12 ปี |
| ความจุ | ดูแลอยู่ 1/2 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | รับเลี้ยงถาวร · สุนัข |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ไม่จำกัดสี (หมาสูงวัย) · พันธุ์: หมาไทยพันทาง — อยากรับหมาสูงวัยมาเป็นเพื่อนลุงดำ เพราะจังหวะชีวิตช้า ๆ เหมือนกัน |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 09:00–17:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['adopt']`, `speciesAccepted: ['dog']`, `capacityTotal: 2`, `currentCount: 1`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a warm 66-year-old retired Thai barber with neatly combed white hair, a small white mustache, a gentle smile, wearing a striped shirt
- `SETTING`: an old barber chair in a small room
- `HOME`: a single-story wooden house in a waterside community with a small concrete front yard, a vintage barber chair inside, a soft old dog bed and a fan
- `PETS`: one dog: a senior black with a graying muzzle Thai mixed-breed dog (male, about 12 years old)
- `PET_SCENE`: a shaded yard of a Thai house on a sunny afternoon
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-059 · เฟิร์น · หญิง 25 ปี · เขตดอนเมือง (`don-mueang`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวน่ารักผมยาวไล่สีน้ำตาลอ่อน ทาเล็บสีพาสเทล ยิ้มหวาน สวมเสื้อครอปไหมพรม |
| อาชีพ / ไลฟ์สไตล์ | ช่างทำเล็บ |
| บ้าน (ตึกแถว) | ห้องเช่าเหนือร้านทำเล็บ ติดมุ้งลวดทุกหน้าต่าง |
| น้องที่ดูแลอยู่ | ลูกปัด: แมว · แมวไทยพันทาง · ส้มขาว · เมีย 2 ปี |
| ความจุ | ดูแลอยู่ 1/2 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ส้มขาว · พันธุ์: ไม่จำกัดพันธุ์ — ลูกปัดเข้ากับแมวอื่นได้ดี จึงช่วยดูแลน้องหลงชั่วคราวได้ครั้งละตัว |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 20:00–22:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster']`, `speciesAccepted: ['cat']`, `capacityTotal: 2`, `currentCount: 1`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a cute 25-year-old Thai woman with long ombré light-brown hair, pastel manicured nails, a sweet smile, wearing a cropped knit top
- `SETTING`: a pastel nail salon
- `HOME`: a small rented room above a nail salon with mesh-screened windows, pastel decor, a cushioned cat bed and a compact cat tree
- `PETS`: one cat: an orange and white mixed-breed domestic shorthair cat (female, about 2 years old)
- `PET_SCENE`: the upstairs room of an old shophouse with wooden windows
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-060 · ชาติชาย · ชาย 50 ปี · เขตสายไหม (`sai-mai`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | ผู้ชายวัยห้าสิบหน้าเข้ม ไว้หนวด ผิวแทน ยิ้มกว้าง สวมเสื้อเชิ้ตยีนส์ |
| อาชีพ / ไลฟ์สไตล์ | เจ้าของร้านวัสดุก่อสร้าง |
| บ้าน (บ้านเดี่ยว) | บ้านเดี่ยวลานกว้าง มีคอกหมาหลังร้าน |
| น้องที่ดูแลอยู่ | เหล็ก: สุนัข · หมาไทยพันทาง · น้ำตาล · ผู้ 6 ปี<br>ปูน: สุนัข · หมาไทยพันทาง · เทา · เมีย 5 ปี<br>ทราย: สุนัข · หมาไทยพันทาง · ครีม · เมีย 3 ปี |
| ความจุ | ดูแลอยู่ 3/3 ตัว · **เต็มแล้ว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว · สุนัข |
| ความพร้อม | รับได้จำกัด · รับกรณีฉุกเฉิน: ไม่ได้ · ตอนนี้เต็มแล้ว |
| สนใจเป็นพิเศษ | สี: ไม่จำกัดสี · พันธุ์: หมาไทยพันทาง — เคยรับหมาหลงหน้าร้านมาดูแลหลายครั้ง ตอนนี้คอกเต็มแล้ว |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 18:00–20:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster']`, `speciesAccepted: ['dog']`, `capacityTotal: 3`, `currentCount: 3`, `availability: 'limited'`, `acceptsEmergency: false` |

- `LOOK`: a rugged 50-year-old Thai man with a mustache, tanned skin, a wide grin, wearing a denim shirt
- `SETTING`: a hardware store yard
- `HOME`: a detached house with a wide yard behind a hardware store, sturdy shaded dog pens, gravel paths and big water buckets
- `PETS`: three dogs: a brown Thai mixed-breed dog (male, about 6 years old); a gray Thai mixed-breed dog (female, about 5 years old); a cream Thai mixed-breed dog (female, about 3 years old)
- `PET_SCENE`: a shaded yard of a Thai house on a sunny afternoon
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-061 · อรอุมา · หญิง 39 ปี · เขตลาดพร้าว (`lat-phrao`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวออฟฟิศเก๋ ผมบ็อบตรงเสมอคาง ใส่แว่นกรอบสีแดง ยิ้มมั่นใจ สวมเสื้อเชิ้ตลายทาง |
| อาชีพ / ไลฟ์สไตล์ | ผู้จัดการฝ่ายบุคคล |
| บ้าน (ทาวน์เฮาส์) | ทาวน์เฮาส์ 3 ชั้น ห้องนั่งเล่นตกแต่งเก๋ |
| น้องที่ดูแลอยู่ | ขนมครก: แมว · เอ็กโซติกช็อตแฮร์ · ส้ม · เมีย 4 ปี<br>ทองม้วน: แมว · แมวไทยพันทาง · ส้มลายสลิด · ผู้ 3 ปี |
| ความจุ | ดูแลอยู่ 2/3 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ส้ม · พันธุ์: ไม่จำกัดพันธุ์ — บ้านนี้เป็นทีมแมวส้ม และรู้สึกว่าแมวส้มเข้ากันง่าย (ความชอบส่วนตัว) |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 19:00–21:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 3`, `currentCount: 2`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a chic 39-year-old Thai woman with a sleek chin-length bob, red-framed glasses, a confident smile, wearing a striped shirt
- `SETTING`: a stylish townhouse living room
- `HOME`: a stylish three-story townhouse living room with a velvet sofa, gallery wall, cat shelves and a cozy cat condo
- `PETS`: two cats: an orange Exotic Shorthair cat (female, about 4 years old); an orange tabby mixed-breed domestic shorthair cat (male, about 3 years old)
- `PET_SCENE`: a warm townhouse living room
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-062 · ปีเตอร์ · ชาย 28 ปี · เขตวัฒนา (`watthana`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | หนุ่มหล่อลุคไอดอล ผมย้อมสีเทาควัน ต่างหูเล็ก ผิวขาวใส ยิ้มมีเสน่ห์ สวมเสื้อเชิ้ตสีดำ |
| อาชีพ / ไลฟ์สไตล์ | โค้ชสอนเต้น |
| บ้าน (คอนโด) | คอนโดวิวเมือง ห้องกว้างโปร่ง |
| น้องที่ดูแลอยู่ | ยังไม่มี |
| ความจุ | ดูแลอยู่ 0/1 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | รับเลี้ยงถาวร · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ดำ · พันธุ์: ไม่จำกัดพันธุ์ — อยากรับเลี้ยงแมวตัวแรก และชอบแมวดำที่ดูเท่เข้ากับห้อง |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 11:00–14:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 1`, `currentCount: 0`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a strikingly handsome 28-year-old Thai man with idol-style ash-gray dyed hair, a small earring, clear fair skin, a charming smile, wearing a black shirt
- `SETTING`: a dance studio with mirrors
- `HOME`: a spacious bright condo with a city view, a minimalist sofa, a mirror wall, and a newly bought cat bed and scratcher waiting for a first cat
- ภาพ: `profile.webp`, `home.webp` (ไม่มี `pets.webp` เพราะยังไม่มีน้องในความดูแล)

#### adopter-063 · นวล · หญิง 70 ปี · เขตคลองสาน (`khlong-san`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | คุณยายใจดี ผมสีเงินเกล้ามวย ยิ้มอบอุ่น สวมผ้าคลุมไหล่ผ้าไหมไทย |
| อาชีพ / ไลฟ์สไตล์ | เกษียณ |
| บ้าน (บ้านไม้) | บ้านไม้ริมแม่น้ำ ระเบียงไม้ติดมุ้งลวด |
| น้องที่ดูแลอยู่ | ส้มจีน: แมว · แมวไทยพันทาง · ส้ม · เมีย 11 ปี<br>มะลิลา: แมว · แมวไทยพันทาง · ขาว · เมีย 12 ปี |
| ความจุ | ดูแลอยู่ 2/2 ตัว · **เต็มแล้ว** |
| โหมด · ชนิดสัตว์ | รับเลี้ยงถาวร · แมว |
| ความพร้อม | รับได้จำกัด · รับกรณีฉุกเฉิน: ไม่ได้ · ตอนนี้เต็มแล้ว |
| สนใจเป็นพิเศษ | สี: ไม่จำกัดสี (แมวสูงวัย) · พันธุ์: ไม่จำกัดพันธุ์ — ดูแลแมวแก่มาทั้งชีวิต ตอนนี้ครบสองตัวแล้วจึงยังไม่รับเพิ่ม |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 09:00–16:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 2`, `currentCount: 2`, `availability: 'limited'`, `acceptsEmergency: false` |

- `LOOK`: a graceful 70-year-old Thai grandmother with silver hair in a bun, a warm smile, wearing a Thai silk shawl
- `SETTING`: a riverside wooden house veranda
- `HOME`: an old riverside wooden house with a screened veranda, rattan furniture, a woven cat basket and potted jasmine
- `PETS`: two cats: a senior orange mixed-breed domestic shorthair cat (female, about 11 years old); a senior white mixed-breed domestic shorthair cat (female, about 12 years old)
- `PET_SCENE`: the veranda of a traditional Thai wooden house
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-064 · ทรงพล · ชาย 42 ปี · เขตบางแค (`bang-khae`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | คุณพ่อใจดี หน้ากลม ผมสั้น ยิ้มกว้าง สวมเสื้อโปโลสีเหลือง |
| อาชีพ / ไลฟ์สไตล์ | ครูพลศึกษา |
| บ้าน (บ้านเดี่ยว) | บ้านเดี่ยวสนามหญ้ากว้าง แยกห้องแมวกับลานหมา |
| น้องที่ดูแลอยู่ | บาส: สุนัข · หมาไทยพันทาง · น้ำตาลอ่อน · ผู้ 4 ปี<br>แชมป์: สุนัข · ลาบราดอร์รีทรีฟเวอร์ · เหลือง · เมีย 3 ปี<br>นกหวีด: แมว · แมวไทยพันทาง · ขาวส้ม · ผู้ 2 ปี |
| ความจุ | ดูแลอยู่ 3/5 ตัว · **รับเพิ่มได้ 2 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมวและสุนัข |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ได้ |
| สนใจเป็นพิเศษ | สี: น้ำตาลอ่อน · พันธุ์: ลาบราดอร์ หรือหมาพันทางขนาดใหญ่ — ชอบหมาใหญ่ที่เล่นกีฬาด้วยได้ และบ้านแยกโซนหมากับแมวชัดเจน |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 17:00–20:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat','dog']`, `capacityTotal: 5`, `currentCount: 3`, `availability: 'available'`, `acceptsEmergency: true` |

- `LOOK`: a friendly 42-year-old Thai man with a round face, short hair, a big smile, wearing a yellow polo shirt
- `SETTING`: a house front yard with a basketball hoop
- `HOME`: a detached house with a wide lawn, a basketball hoop, a fenced dog area and a separate indoor cat room
- `PETS`: one cat and two dogs: a fawn Thai mixed-breed dog (male, about 4 years old); a yellow Labrador Retriever dog (female, about 3 years old); a white and orange mixed-breed domestic shorthair cat (male, about 2 years old)
- `PET_SCENE`: a shaded yard of a Thai house on a sunny afternoon
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-065 · ขวัญ · หญิง 31 ปี · เขตหนองแขม (`nong-khaem`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวหน้าหวานแบบธรรมชาติ ผมยาวตรงดำ ผิวสองสี ยิ้มอาย ๆ สวมเสื้อยืดสีฟ้า |
| อาชีพ / ไลฟ์สไตล์ | พนักงานโรงงานกะเช้า |
| บ้าน (ทาวน์เฮาส์) | ทาวน์เฮาส์ชั้นเดียว ห้องนั่งเล่นเรียบง่าย |
| น้องที่ดูแลอยู่ | ปุยปุย: แมว · แมวไทยพันทาง · ขาวครีม · เมีย 3 ปี |
| ความจุ | ดูแลอยู่ 1/3 ตัว · **รับเพิ่มได้ 2 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ครีม · พันธุ์: ไม่จำกัดพันธุ์ — กลับบ้านตรงเวลาทุกวัน จึงดูแลน้องที่ต้องกินยาตามเวลาที่สัตวแพทย์สั่งได้ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 17:00–20:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster']`, `speciesAccepted: ['cat']`, `capacityTotal: 3`, `currentCount: 1`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a naturally pretty 31-year-old Thai woman with long straight black hair, golden-brown skin, a shy smile, wearing a light blue t-shirt
- `SETTING`: a simple tidy townhouse
- `HOME`: a simple single-story townhouse with a tidy living room, a floor mat, a DIY cardboard cat house and a sunny window
- `PETS`: one cat: a cream and white mixed-breed domestic shorthair cat (female, about 3 years old)
- `PET_SCENE`: a warm townhouse living room
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-066 · โอม · ชาย 35 ปี · เขตห้วยขวาง (`huai-khwang`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | หนุ่มนักข่าวหน้าคม ไว้เคราสั้น ผมสั้นยุ่งเล็กน้อย สวมเสื้อเชิ้ตพับแขน |
| อาชีพ / ไลฟ์สไตล์ | นักข่าว |
| บ้าน (คอนโด) | คอนโด 1 ห้องนอน ระเบียงติดตาข่าย |
| น้องที่ดูแลอยู่ | ข่าวสด: แมว · แมวไทยพันทาง · ลายเสือเทา · ผู้ 5 ปี |
| ความจุ | ดูแลอยู่ 1/2 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมว |
| ความพร้อม | รับได้จำกัด · รับกรณีฉุกเฉิน: ไม่ได้ · เวลางานไม่แน่นอน รับได้จำกัด |
| สนใจเป็นพิเศษ | สี: ลายเสือ · พันธุ์: ไม่จำกัดพันธุ์ — ชอบแมวลายเสือที่ดูคล่องแคล่ว แต่งานข่าวเวลาไม่แน่นอนจึงรับได้จำกัด |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 21:00–23:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 2`, `currentCount: 1`, `availability: 'limited'`, `acceptsEmergency: false` |

- `LOOK`: a sharp-featured 35-year-old Thai journalist with a short beard, slightly messy short hair, wearing a shirt with rolled sleeves, a thoughtful smile
- `SETTING`: a condo desk with notebooks
- `HOME`: a lived-in one-bedroom condo with a writing desk full of notebooks, a netted balcony and a cat hammock
- `PETS`: one cat: a gray tabby mixed-breed domestic shorthair cat (male, about 5 years old)
- `PET_SCENE`: a bright condo living room near a window
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-067 · ส้มโอ · หญิง 28 ปี · เขตสวนหลวง (`suan-luang`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวร่าเริง ผมบ็อบย้อมสีส้มอิฐ ยิ้มกว้างตาหยี สวมเอี๊ยมยีนส์ |
| อาชีพ / ไลฟ์สไตล์ | เจ้าของร้านเค้ก |
| บ้าน (ตึกแถว) | ตึกแถวที่ชั้นล่างเป็นร้านเค้ก ชั้นบนเป็นห้องแมว |
| น้องที่ดูแลอยู่ | ส้มซ่า: แมว · แมวไทยพันทาง · ส้ม · ผู้ 3 ปี<br>ส้มตำ: แมว · แมวไทยพันทาง · ส้มลายสลิด · เมีย 2 ปี<br>ส้มเช้ง: แมว · แมวไทยพันทาง · ส้มขาว · ผู้ 1 ปี |
| ความจุ | ดูแลอยู่ 3/4 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ส้มทุกเฉด · พันธุ์: ไม่จำกัดพันธุ์ — ชื่อเล่นเป็นส้มจึงสะสมแมวส้มจนเป็นธีมบ้าน และอยากให้น้องส้มหลงได้บ้าน |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 19:00–21:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 4`, `currentCount: 3`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a bubbly 28-year-old Thai woman with a brick-orange dyed bob, a wide eye-crinkling smile, wearing denim overalls
- `SETTING`: a cake shop counter
- `HOME`: the upstairs of a shophouse above a cake shop with pastel walls, climbing shelves, three cat beds and a large screened window
- `PETS`: three cats: an orange mixed-breed domestic shorthair cat (male, about 3 years old); an orange tabby mixed-breed domestic shorthair cat (female, about 2 years old); a young orange and white mixed-breed domestic shorthair cat (male, about 1 year old)
- `PET_SCENE`: the upstairs room of an old shophouse with wooden windows
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-068 · ธวัชชัย · ชาย 55 ปี · เขตทวีวัฒนา (`thawi-watthana`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | ลุงชาวสวนหน้าเข้ม ผิวกร้านแดด ยิ้มกว้างจริงใจ สวมหมวกสานกับเสื้อม่อฮ่อม |
| อาชีพ / ไลฟ์สไตล์ | ทำสวนกล้วยน้ำว้า |
| บ้าน (บ้านไม้) | บ้านไม้ใต้ถุนสูงกลางสวนกล้วย ลานใต้ถุนกว้าง |
| น้องที่ดูแลอยู่ | กล้วยหอม: สุนัข · หมาไทยพันทาง · เหลือง · ผู้ 6 ปี<br>กล้วยไข่: สุนัข · หมาไทยพันทาง · ขาว · เมีย 5 ปี<br>กล้วยเล็บมือ: สุนัข · หมาไทยพันทาง · น้ำตาล · ผู้ 4 ปี<br>กล้วยตาก: สุนัข · ไทยหลังอาน · น้ำตาลแดง · เมีย 3 ปี |
| ความจุ | ดูแลอยู่ 4/6 ตัว · **รับเพิ่มได้ 2 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว · สุนัข |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ได้ |
| สนใจเป็นพิเศษ | สี: ไม่จำกัดสี · พันธุ์: หมาไทยพันทาง — สวนกว้างและมีคนอยู่ทั้งวัน จึงรับหมาที่ต้องการที่พักด่วนได้ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 06:00–09:00 และ 16:00–18:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster']`, `speciesAccepted: ['dog']`, `capacityTotal: 6`, `currentCount: 4`, `availability: 'available'`, `acceptsEmergency: true` |

- `LOOK`: a rugged 55-year-old Thai orchard farmer with weathered sun-tanned skin, a broad sincere smile, wearing a woven hat and an indigo work shirt
- `SETTING`: a banana plantation
- `HOME`: a raised wooden stilt house in a banana plantation with a large shaded space underneath, dog beds on wooden platforms and big water bowls
- `PETS`: four dogs: a yellow Thai mixed-breed dog (male, about 6 years old); a white Thai mixed-breed dog (female, about 5 years old); a brown Thai mixed-breed dog (male, about 4 years old); a red Thai Ridgeback dog (female, about 3 years old)
- `PET_SCENE`: a shaded yard of a Thai house on a sunny afternoon
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-069 · กชกร · หญิง 26 ปี · เขตปทุมวัน (`pathum-wan`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวสวยลุคนักแสดง ผมดำยาวสลวย ลิปแดง ผิวขาวใส ยิ้มมีเสน่ห์ สวมเดรสสีดำเรียบ |
| อาชีพ / ไลฟ์สไตล์ | นักแสดงละครเวที |
| บ้าน (คอนโด) | คอนโดหรูใจกลางเมือง ห้องแต่งตัวกว้าง |
| น้องที่ดูแลอยู่ | ม่านแดง: แมว · วิเชียรมาศ · ครีมแต้มน้ำตาล · เมีย 3 ปี |
| ความจุ | ดูแลอยู่ 1/2 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | รับเลี้ยงถาวร · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: แต้มสี (point) · พันธุ์: วิเชียรมาศ — ชอบแมวที่ช่างพูดคุยเหมือนนักแสดง และม่านแดงเข้ากับแมวไทยได้ดี |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 11:00–14:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 2`, `currentCount: 1`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a glamorous 26-year-old Thai stage actress with long flowing black hair, red lipstick, luminous fair skin, a captivating smile, wearing a simple black dress
- `SETTING`: a theater backstage mirror
- `HOME`: a luxurious central-city condo with a large dressing area, velvet chairs, a designer cat tree and floor-to-ceiling windows
- `PETS`: one cat: a seal point Siamese (Wichien Maat) cat (female, about 3 years old)
- `PET_SCENE`: a bright condo living room near a window
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-070 · อานนท์ · ชาย 31 ปี · เขตบางกอกน้อย (`bangkok-noi`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | หนุ่มหมอหน้าหล่อ ใส่แว่นกรอบบาง ผมสั้นเรียบ ยิ้มเหนื่อยแต่อบอุ่น สวมเสื้อเชิ้ตสีฟ้า |
| อาชีพ / ไลฟ์สไตล์ | แพทย์ประจำบ้าน |
| บ้าน (อพาร์ตเมนต์/ห้องเช่า) | อพาร์ตเมนต์ใกล้โรงพยาบาล |
| น้องที่ดูแลอยู่ | ยังไม่มี |
| ความจุ | ดูแลอยู่ 0/1 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว · แมว |
| ความพร้อม | ปิดรับชั่วคราว · รับกรณีฉุกเฉิน: ไม่ได้ · ปิดรับชั่วคราวช่วงฝึกอบรม |
| สนใจเป็นพิเศษ | สี: ไม่จำกัดสี · พันธุ์: ไม่จำกัดพันธุ์ — อยากช่วยอุปถัมภ์แมวหลังจบการฝึกอบรม ตอนนี้เข้าเวรหนักจึงปิดรับ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ช่วงนี้ไม่สะดวก · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster']`, `speciesAccepted: ['cat']`, `capacityTotal: 1`, `currentCount: 0`, `availability: 'unavailable'`, `acceptsEmergency: false` |

- `LOOK`: a handsome 31-year-old Thai resident doctor with thin-framed glasses, neat short hair, a tired but warm smile, wearing a light blue shirt
- `SETTING`: an apartment near a hospital
- `HOME`: a small apartment near a hospital with a neat bed, medical textbooks, a coffee maker and an empty sunny corner
- ภาพ: `profile.webp`, `home.webp` (ไม่มี `pets.webp` เพราะยังไม่มีน้องในความดูแล)

#### adopter-071 · ฝ้าย · หญิง 33 ปี · เขตคันนายาว (`khan-na-yao`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวสปอร์ตผมสั้นซอย ผิวแทน ยิ้มสดใส สวมเสื้อกีฬาแบดมินตัน |
| อาชีพ / ไลฟ์สไตล์ | โค้ชแบดมินตัน |
| บ้าน (บ้านเดี่ยว) | บ้านเดี่ยวหลังเล็กมีสนามหญ้า |
| น้องที่ดูแลอยู่ | ลูกขนไก่: สุนัข · แจ็กรัสเซลล์เทอร์เรีย · ขาวน้ำตาล · ผู้ 4 ปี |
| ความจุ | ดูแลอยู่ 1/2 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · สุนัข |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ขาวน้ำตาล · พันธุ์: แจ็กรัสเซลล์ หรือหมาพลังเยอะ — ชอบหมาพลังเยอะที่ออกกำลังด้วยกันได้ทุกเช้า |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 08:00–10:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['dog']`, `capacityTotal: 2`, `currentCount: 1`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a sporty 33-year-old Thai woman with a short layered haircut, tanned skin, a bright smile, wearing a badminton sports shirt
- `SETTING`: an indoor badminton court
- `HOME`: a small detached house with a lawn, a dog agility tunnel, a rope toy basket and a cooling mat on the porch
- `PETS`: one dog: a white and tan Jack Russell Terrier dog (male, about 4 years old)
- `PET_SCENE`: a shaded yard of a Thai house on a sunny afternoon
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-072 · ศักดิ์ชัย · ชาย 60 ปี · เขตดุสิต (`dusit`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | อาจารย์เกษียณท่าทางภูมิฐาน ผมขาว ใส่แว่น ยิ้มสุภาพ สวมเสื้อผ้าบาติก |
| อาชีพ / ไลฟ์สไตล์ | อาจารย์มหาวิทยาลัยเกษียณ |
| บ้าน (บ้านเดี่ยว) | บ้านเก่าสไตล์โคโลเนียล มีสวนร่มรื่นและห้องสมุด |
| น้องที่ดูแลอยู่ | ปรัชญา: แมว · แมวไทยพันทาง · ดำ · ผู้ 7 ปี<br>ตรรกะ: แมว · แมวไทยพันทาง · เทา · เมีย 6 ปี<br>วิจัย: แมว · แมวไทยพันทาง · ขาวดำ · ผู้ 4 ปี |
| ความจุ | ดูแลอยู่ 3/4 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ไม่จำกัดสี · พันธุ์: ไม่จำกัดพันธุ์ — บ้านเงียบและมีเวลามาก จึงเหมาะกับแมวขี้อายที่ต้องใช้เวลาปรับตัว |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 09:00–17:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 4`, `currentCount: 3`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a distinguished 60-year-old retired Thai professor with white hair, glasses, a polite smile, wearing a batik shirt
- `SETTING`: a garden of an old colonial-style house
- `HOME`: an old colonial-style house with a shady garden, a home library with cat beds on the window seats and a screened veranda
- `PETS`: three cats: a black mixed-breed domestic shorthair cat (male, about 7 years old); a gray mixed-breed domestic shorthair cat (female, about 6 years old); a black and white mixed-breed domestic shorthair cat (male, about 4 years old)
- `PET_SCENE`: a sunny living room of a Thai house
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-073 · นันทนา · หญิง 44 ปี · เขตยานนาวา (`yan-nawa`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | นักธุรกิจหญิงสง่างาม มวยผมเรียบ สร้อยมุก ยิ้มมั่นใจ สวมเสื้อสูทสีครีม |
| อาชีพ / ไลฟ์สไตล์ | เจ้าของโรงงานเย็บผ้าเล็ก ๆ |
| บ้าน (ทาวน์เฮาส์) | ทาวน์เฮาส์ 3 ชั้น ห้องนั่งเล่นพื้นไม้ |
| น้องที่ดูแลอยู่ | ขนมจีน: สุนัข · ชิสุ · ขาวทอง · เมีย 6 ปี<br>น้ำยา: สุนัข · ชิสุ · ขาวน้ำตาล · ผู้ 5 ปี |
| ความจุ | ดูแลอยู่ 2/3 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · สุนัข |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ขาวทอง · พันธุ์: ชิสุ หรือหมาเล็กขนยาว — ดูแลขนยาวเป็นและมีเวลาพาไปอาบน้ำตัดขนสม่ำเสมอ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 19:00–21:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['dog']`, `capacityTotal: 3`, `currentCount: 2`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: an elegant 44-year-old Thai businesswoman with a neat updo, a pearl necklace, a confident smile, wearing a cream blazer
- `SETTING`: a tidy townhouse office
- `HOME`: a three-story townhouse with a wooden-floor living room, small dog beds, a playpen and a grooming table
- `PETS`: two dogs: a white and gold Shih Tzu dog (female, about 6 years old); a white and brown Shih Tzu dog (male, about 5 years old)
- `PET_SCENE`: a warm townhouse living room
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-074 · ตูน · ชาย 27 ปี · เขตสะพานสูง (`saphan-sung`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | หนุ่มข้างบ้านหน้าน่ารัก ผมหยิกสั้น กระบนแก้มเล็กน้อย ยิ้มกว้าง สวมเสื้อยืดสีมัสตาร์ด |
| อาชีพ / ไลฟ์สไตล์ | บาริสต้า |
| บ้าน (อพาร์ตเมนต์/ห้องเช่า) | อพาร์ตเมนต์ห้องเดียว มีระเบียงติดมุ้งลวด |
| น้องที่ดูแลอยู่ | ช็อต: แมว · แมวไทยพันทาง · น้ำตาลเข้ม · ผู้ 2 ปี |
| ความจุ | ดูแลอยู่ 1/2 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: น้ำตาล · พันธุ์: ไม่จำกัดพันธุ์ — ช็อตชอบมีเพื่อนเล่น จึงช่วยอุปถัมภ์น้องหลงได้ครั้งละตัว |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 15:00–18:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster']`, `speciesAccepted: ['cat']`, `capacityTotal: 2`, `currentCount: 1`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a cute boy-next-door 27-year-old Thai man with short curly hair, light freckles on his cheeks, a wide smile, wearing a mustard t-shirt
- `SETTING`: a small café bar
- `HOME`: a one-room apartment with a mesh-screened balcony, a coffee corner, a cat window perch and a cozy blanket on the bed
- `PETS`: one cat: a dark brown mixed-breed domestic shorthair cat (male, about 2 years old)
- `PET_SCENE`: a cozy apartment room with soft daylight
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-075 · อิงฟ้า · หญิง 30 ปี · เขตบางบอน (`bang-bon`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวโบฮีเมียน ผมยาวลอนธรรมชาติ ผิวแทนอ่อน ยิ้มอ่อนหวาน สวมเสื้อผ้าฝ้ายปักมือ |
| อาชีพ / ไลฟ์สไตล์ | ช่างปั้นเซรามิก |
| บ้าน (บ้านเดี่ยว) | บ้านเดี่ยวมีสตูดิโอปั้นดินแยกออกไป และสวนเล็ก ๆ |
| น้องที่ดูแลอยู่ | ดินเผา: แมว · แมวไทยพันทาง · ส้มลายสลิด · ผู้ 3 ปี<br>เคลือบ: แมว · แมวไทยพันทาง · ครีม · เมีย 3 ปี |
| ความจุ | ดูแลอยู่ 2/3 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ครีม · พันธุ์: ไม่จำกัดพันธุ์ — ชอบแมวสีดินเหมือนงานเซรามิก และสตูดิโอแยกทำให้บ้านปลอดภัยกับแมว |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 16:00–19:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 3`, `currentCount: 2`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a bohemian 30-year-old Thai woman with long natural waves, light tan skin, a soft smile, wearing a hand-embroidered cotton blouse
- `SETTING`: a pottery studio
- `HOME`: a detached house with a separate pottery studio, a small garden, handmade ceramic cat bowls and a cat tree by the window
- `PETS`: two cats: an orange tabby mixed-breed domestic shorthair cat (male, about 3 years old); a cream mixed-breed domestic shorthair cat (female, about 3 years old)
- `PET_SCENE`: a sunny living room of a Thai house
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-076 · ภัทร · ชาย 25 ปี · เขตลาดกระบัง (`lat-krabang`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | หนุ่มตี๋สายปั่นจักรยาน ผิวขาว ตาชั้นเดียว ผมสั้นรองทรง ยิ้มสดใส สวมเสื้อปั่นจักรยานสีฟ้า |
| อาชีพ / ไลฟ์สไตล์ | วิศวกรโรงงาน |
| บ้าน (คอนโด) | คอนโดใกล้ที่ทำงาน มีที่แขวนจักรยานในห้อง |
| น้องที่ดูแลอยู่ | โซ่: แมว · แมวไทยพันทาง · เทาลายเสือ · ผู้ 2 ปี |
| ความจุ | ดูแลอยู่ 1/2 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: เทา · พันธุ์: ไม่จำกัดพันธุ์ — โซ่เป็นแมวขี้เล่น อยากได้เพื่อนวัยใกล้กันมาเล่นด้วย |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 19:00–21:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 2`, `currentCount: 1`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a handsome 25-year-old Thai-Chinese cyclist with fair skin, monolid eyes, a short tapered haircut, a cheerful smile, wearing a light blue cycling jersey
- `SETTING`: a condo lobby with a road bike
- `HOME`: a compact condo with a road bike on a wall rack, a netted window, a cat tree and a tidy litter cabinet
- `PETS`: one cat: a gray tabby mixed-breed domestic shorthair cat (male, about 2 years old)
- `PET_SCENE`: a bright condo living room near a window
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-077 · วาสนา · หญิง 48 ปี · เขตราษฎร์บูรณะ (`rat-burana`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | แม่ค้าผลไม้หน้าตาใจดี ผมดำยาวรวบมวย ผิวแทน ยิ้มกว้าง สวมเสื้อลายดอกกับหมวกงอบ |
| อาชีพ / ไลฟ์สไตล์ | แม่ค้าผลไม้ริมน้ำ |
| บ้าน (บ้านเดี่ยว) | บ้านเดี่ยวริมน้ำ มีระเบียงล้อมรั้วและกรงพักชั่วคราว |
| น้องที่ดูแลอยู่ | ลิ้นจี่: แมว · แมวไทยพันทาง · ขาวส้ม · เมีย 4 ปี<br>มังคุด: แมว · แมวไทยพันทาง · ดำ · ผู้ 3 ปี<br>ทุเรียน: สุนัข · หมาไทยพันทาง · เหลือง · ผู้ 5 ปี |
| ความจุ | ดูแลอยู่ 3/5 ตัว · **รับเพิ่มได้ 2 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมวและสุนัข |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ได้ |
| สนใจเป็นพิเศษ | สี: ไม่จำกัดสี · พันธุ์: ไม่จำกัดพันธุ์ — เจอสัตว์หลงแถวท่าน้ำบ่อย บ้านมีกรงพักชั่วคราวพร้อมเสมอ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 14:00–17:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat','dog']`, `capacityTotal: 5`, `currentCount: 3`, `availability: 'available'`, `acceptsEmergency: true` |

- `LOOK`: a warm 48-year-old Thai fruit vendor with long black hair in a bun, tanned skin, a big smile, wearing a floral shirt and holding a traditional ngob hat
- `SETTING`: a riverside fruit market
- `HOME`: a riverside detached house with a fenced veranda, clean temporary crates with blankets, fruit baskets stacked neatly and pet water bowls
- `PETS`: two cats and one dog: a white and orange mixed-breed domestic shorthair cat (female, about 4 years old); a black mixed-breed domestic shorthair cat (male, about 3 years old); a yellow Thai mixed-breed dog (male, about 5 years old)
- `PET_SCENE`: a shaded yard of a Thai house on a sunny afternoon
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-078 · ธาร · ชาย 32 ปี · เขตบางกอกใหญ่ (`bangkok-yai`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | หนุ่มไกด์พายเรือคายัค ผิวแทน ผมยาวมัดจุก หุ่นนักกีฬา ยิ้มสดใส สวมเสื้อกันแดดแขนยาว |
| อาชีพ / ไลฟ์สไตล์ | ไกด์พายเรือคายัคในคลอง |
| บ้าน (บ้านไม้) | บ้านไม้ริมคลอง มีลานหน้าบ้านล้อมรั้วกันหมาตกน้ำ |
| น้องที่ดูแลอยู่ | พาย: สุนัข · หมาไทยพันทาง · ขาวดำ · เมีย 4 ปี |
| ความจุ | ดูแลอยู่ 1/2 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว · สุนัข |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ได้ |
| สนใจเป็นพิเศษ | สี: ขาวดำ · พันธุ์: หมาไทยพันทาง — บ้านล้อมรั้วริมน้ำแน่นหนา จึงรับหมาที่ต้องการที่พักด่วนระหว่างรอเจ้าของได้ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 17:00–19:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster']`, `speciesAccepted: ['dog']`, `capacityTotal: 2`, `currentCount: 1`, `availability: 'available'`, `acceptsEmergency: true` |

- `LOOK`: an athletic 32-year-old Thai kayak guide with tanned skin, long hair in a top knot, a bright smile, wearing a long-sleeve sun shirt
- `SETTING`: a canal pier with kayaks
- `HOME`: a wooden canal-side house with a fenced front deck so dogs cannot fall into the water, kayaks stored on racks and a shaded dog bed
- `PETS`: one dog: a black and white Thai mixed-breed dog (female, about 4 years old)
- `PET_SCENE`: a shaded yard of a Thai house on a sunny afternoon
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-079 · มัลลิกา · หญิง 36 ปี · เขตพญาไท (`phaya-thai`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวสวยสุภาพ ผมม้วนสูง ใส่แว่นกรอบใส ยิ้มอ่อนโยน สวมเสื้อเบลาส์สีฟ้าอ่อน |
| อาชีพ / ไลฟ์สไตล์ | นักวิจัยการตลาด |
| บ้าน (คอนโด) | คอนโด 2 ห้องนอน มีห้องหนึ่งเป็นห้องแมว |
| น้องที่ดูแลอยู่ | มะลิ: แมว · แมวไทยพันทาง · ขาว · เมีย 4 ปี<br>กระเจี๊ยบ: แมว · แมวไทยพันทาง · ส้มลายสลิด · เมีย 3 ปี |
| ความจุ | ดูแลอยู่ 2/3 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ขาวส้ม · พันธุ์: ไม่จำกัดพันธุ์ — มีห้องแมวแยกให้น้องใหม่ปรับตัวก่อน และชอบลายขาวส้มที่ดูอบอุ่น |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 19:00–21:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 3`, `currentCount: 2`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a graceful 36-year-old Thai woman with hair in a high twist, clear-framed glasses, a gentle smile, wearing a pale blue blouse
- `SETTING`: a calm condo workspace
- `HOME`: a two-bedroom condo where one room is a dedicated cat room with wall shelves, a hammock, puzzle feeders and a big window
- `PETS`: two cats: a white mixed-breed domestic shorthair cat (female, about 4 years old); an orange tabby mixed-breed domestic shorthair cat (female, about 3 years old)
- `PET_SCENE`: a bright condo living room near a window
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-080 · เอก · ชาย 45 ปี · เขตจอมทอง (`chom-thong`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | ครูมวยไทยหน้าเข้ม ผิวแทน กล้ามแน่น ยิ้มใจดี สวมเสื้อกล้ามกับผ้าพันมือ |
| อาชีพ / ไลฟ์สไตล์ | ครูมวยไทย |
| บ้าน (บ้านเดี่ยว) | บ้านเดี่ยวที่มียิมมวยเล็ก ๆ ด้านหน้า และลานหมาด้านหลัง |
| น้องที่ดูแลอยู่ | หมัด: สุนัข · ไทยหลังอาน · น้ำตาลแดง · ผู้ 5 ปี<br>ศอก: สุนัข · หมาไทยพันทาง · ดำ · เมีย 3 ปี |
| ความจุ | ดูแลอยู่ 2/4 ตัว · **รับเพิ่มได้ 2 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว · สุนัข |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ได้ |
| สนใจเป็นพิเศษ | สี: น้ำตาลแดง · พันธุ์: ไทยหลังอาน — ชอบหมาไทยที่แข็งแรง และมีลูกศิษย์ช่วยพาหมาเดินทุกวัน |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 11:00–14:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster']`, `speciesAccepted: ['dog']`, `capacityTotal: 4`, `currentCount: 2`, `availability: 'available'`, `acceptsEmergency: true` |

- `LOOK`: a rugged 45-year-old Thai boxing coach with tanned skin, a muscular build, a kind smile, wearing a tank top with hand wraps
- `SETTING`: a Muay Thai gym
- `HOME`: a detached house with a small Muay Thai gym in front and a fenced backyard for dogs with shaded kennels and water buckets
- `PETS`: two dogs: a red Thai Ridgeback dog (male, about 5 years old); a black Thai mixed-breed dog (female, about 3 years old)
- `PET_SCENE`: a shaded yard of a Thai house on a sunny afternoon
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-081 · ปลายฟ้า · หญิง 23 ปี · เขตหลักสี่ (`lak-si`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวหมวยผมสั้นเสมอติ่งหู ใส่แว่นกรอบเหลี่ยมบาง ผิวขาว ยิ้มน่ารัก สวมเสื้อยืดสีขาวกับเอี๊ยม |
| อาชีพ / ไลฟ์สไตล์ | นักศึกษาปริญญาโทจิตวิทยา |
| บ้าน (อพาร์ตเมนต์/ห้องเช่า) | อพาร์ตเมนต์ห้องเดียว มุมอ่านหนังสือเล็ก ๆ |
| น้องที่ดูแลอยู่ | ฟ้าคราม: แมว · แมวไทยพันทาง · เทาฟ้า · เมีย 2 ปี |
| ความจุ | ดูแลอยู่ 1/2 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: เทาฟ้า · พันธุ์: ไม่จำกัดพันธุ์ — สนใจดูแลแมวขี้กลัวที่ต้องค่อย ๆ สร้างความไว้ใจ ตามที่เรียนด้านพฤติกรรม |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 20:00–22:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster']`, `speciesAccepted: ['cat']`, `capacityTotal: 2`, `currentCount: 1`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: an adorable 23-year-old Thai-Chinese woman with an ear-length bob, thin square glasses, fair skin, a sweet smile, wearing a white tee with overalls
- `SETTING`: a cozy study corner
- `HOME`: a cozy one-room apartment with a reading corner, fairy lights, a small cat tree and a soft round cat bed
- `PETS`: one cat: a blue-gray mixed-breed domestic shorthair cat (female, about 2 years old)
- `PET_SCENE`: a cozy apartment room with soft daylight
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-082 · กิตติ · ชาย 38 ปี · เขตดินแดง (`din-daeng`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | หนุ่มร็อกเกอร์หน้าหล่อ ผมยาวสีดำสลวย ไว้หนวดเคราบาง สวมเสื้อยืดวงดนตรีสีดำ |
| อาชีพ / ไลฟ์สไตล์ | นักกีตาร์และครูสอนดนตรี |
| บ้าน (คอนโด) | คอนโดที่มีห้องซ้อมดนตรีเก็บเสียง |
| น้องที่ดูแลอยู่ | ริฟฟ์: แมว · เบงกอล · ลายจุดทอง · ผู้ 3 ปี<br>โซโล่: แมว · แมวไทยพันทาง · ดำ · เมีย 4 ปี |
| ความจุ | ดูแลอยู่ 2/3 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมว |
| ความพร้อม | รับได้จำกัด · รับกรณีฉุกเฉิน: ไม่ได้ · ช่วงทัวร์คอนเสิร์ตรับไม่ได้ |
| สนใจเป็นพิเศษ | สี: ลายจุด · พันธุ์: เบงกอล — ชอบแมวพลังเยอะที่ต้องการกิจกรรม แต่ช่วงทัวร์คอนเสิร์ตรับได้จำกัด |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 13:00–16:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 3`, `currentCount: 2`, `availability: 'limited'`, `acceptsEmergency: false` |

- `LOOK`: a handsome 38-year-old Thai rock guitarist with long glossy black hair, light stubble, wearing a plain black band-style t-shirt without text
- `SETTING`: a music room with guitars
- `HOME`: a condo with a soundproofed music room, guitars on the wall, an amp, and a sturdy cat tree for active cats
- `PETS`: two cats: a brown spotted Bengal cat (male, about 3 years old); a black mixed-breed domestic shorthair cat (female, about 4 years old)
- `PET_SCENE`: a bright condo living room near a window
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-083 · สุนิสา · หญิง 52 ปี · เขตบางเขน (`bang-khen`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | คุณป้าช่างทำผมสุดเก๋ ผมบ็อบสีน้ำตาลแดง แต่งหน้าเต็ม ยิ้มสดใส สวมเสื้อลายเสือดาว |
| อาชีพ / ไลฟ์สไตล์ | เจ้าของร้านทำผม |
| บ้าน (ตึกแถว) | ตึกแถวที่ชั้นล่างเป็นร้านทำผม ชั้นบนเป็นบ้าน |
| น้องที่ดูแลอยู่ | ม้วน: สุนัข · พุดเดิ้ล · น้ำตาลแดง · เมีย 5 ปี<br>ดัด: สุนัข · พุดเดิ้ล · ขาว · ผู้ 4 ปี |
| ความจุ | ดูแลอยู่ 2/3 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · สุนัข |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: น้ำตาลแดง · พันธุ์: พุดเดิ้ล หรือหมาเล็กขนหยิก — ตัดแต่งขนเองได้ และรู้ว่าหมาขนหยิกต้องแปรงขนทุกวัน |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 19:00–21:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['dog']`, `capacityTotal: 3`, `currentCount: 2`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a glamorous 52-year-old Thai hair stylist with an auburn bob, polished makeup, a bright smile, wearing a leopard-print blouse
- `SETTING`: a hair salon
- `HOME`: the upstairs home of a shophouse hair salon with a plush sofa, a grooming corner, small dog beds and a playpen
- `PETS`: two dogs: a red Toy Poodle dog (female, about 5 years old); a white Toy Poodle dog (male, about 4 years old)
- `PET_SCENE`: the upstairs room of an old shophouse with wooden windows
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-084 · โตโต้ · ชาย 29 ปี · เขตคลองเตย (`khlong-toei`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | หนุ่มไรเดอร์หน้าหล่อคม ผิวแทน ผมสั้นเซตเรียบ ยิ้มเป็นมิตร ถือหมวกกันน็อก |
| อาชีพ / ไลฟ์สไตล์ | ไรเดอร์ส่งอาหาร |
| บ้าน (อพาร์ตเมนต์/ห้องเช่า) | ห้องเช่าชั้น 4 มีระเบียงติดตาข่าย |
| น้องที่ดูแลอยู่ | ไรเดอร์: แมว · แมวไทยพันทาง · ส้ม · ผู้ 2 ปี |
| ความจุ | ดูแลอยู่ 1/2 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ส้ม · พันธุ์: ไม่จำกัดพันธุ์ — เคยช่วยลูกแมวข้างทางระหว่างส่งอาหาร จึงอยากช่วยอุปถัมภ์น้องหลงชั่วคราว |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 10:00–11:00 และ 15:00–16:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster']`, `speciesAccepted: ['cat']`, `capacityTotal: 2`, `currentCount: 1`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a handsome 29-year-old Thai delivery rider with sharp features, tanned skin, neat short hair, a friendly smile, holding a motorcycle helmet
- `SETTING`: a city street at dusk
- `HOME`: a fourth-floor rented room with a netted balcony, a simple bed, a cat tree made of wood planks and a sunny spot by the window
- `PETS`: one cat: an orange mixed-breed domestic shorthair cat (male, about 2 years old)
- `PET_SCENE`: a cozy apartment room with soft daylight
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-085 · ใหม่ · หญิง 27 ปี · เขตบางรัก (`bang-rak`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวสายคาเฟ่ ผมบ็อบสั้นระดับคางสีดำ ลิปแดง ผิวขาว ยิ้มเก๋ สวมเสื้อลายทางแขนสามส่วน |
| อาชีพ / ไลฟ์สไตล์ | ช่างภาพอาหาร |
| บ้าน (คอนโด) | คอนโดเก่าย่านเมือง แต่งสไตล์วินเทจ |
| น้องที่ดูแลอยู่ | ครีมบรูเล่: แมว · แมวไทยพันทาง · ครีม · เมีย 3 ปี<br>มัทฉะ: แมว · แมวไทยพันทาง · ดำ · ผู้ 2 ปี |
| ความจุ | ดูแลอยู่ 2/3 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ครีม · พันธุ์: ไม่จำกัดพันธุ์ — ชอบถ่ายภาพแมวสีครีมคู่กับขนม และบ้านเงียบพอสำหรับแมวใหม่ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 18:00–20:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 3`, `currentCount: 2`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a chic 27-year-old Thai woman with a black chin-length bob, red lipstick, fair skin, a stylish smile, wearing a striped three-quarter sleeve top
- `SETTING`: a café table with food props
- `HOME`: a vintage-styled condo in an old city district with a rattan sofa, film posters, a retro cat bed and a wooden scratching post
- `PETS`: two cats: a cream mixed-breed domestic shorthair cat (female, about 3 years old); a black mixed-breed domestic shorthair cat (male, about 2 years old)
- `PET_SCENE`: a bright condo living room near a window
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-086 · พงศ์ · ชาย 34 ปี · เขตพระโขนง (`phra-khanong`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | หนุ่มตี๋ใส่แว่นกรอบใส ผมทรงเกาหลีสีดำ ผิวขาว ยิ้มสุภาพ สวมเสื้อเชิ้ตลายทางสีฟ้า |
| อาชีพ / ไลฟ์สไตล์ | เภสัชกรร้านยา |
| บ้าน (คอนโด) | คอนโด 2 ห้องนอน ห้องหนึ่งมีคอกกระต่าย |
| น้องที่ดูแลอยู่ | ลูกชุบ: กระต่าย · กระต่ายฮอลแลนด์ลอป · ครีม · เมีย 2 ปี<br>อาโม: แมว · แมวไทยพันทาง · ขาวเทา · ผู้ 3 ปี |
| ความจุ | ดูแลอยู่ 2/3 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมวและกระต่าย |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ครีม · พันธุ์: กระต่ายหูตก หรือแมวพันทาง — แยกห้องกระต่ายกับแมวได้ จึงรับได้ทั้งสองชนิด |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 20:00–22:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat','other']`, `capacityTotal: 3`, `currentCount: 2`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a handsome 34-year-old Thai-Chinese pharmacist with clear-framed glasses, a black Korean-style haircut, fair skin, a polite smile, wearing a blue striped shirt
- `SETTING`: a bright condo with plants
- `HOME`: a two-bedroom condo where one room has a large rabbit pen with hay and tunnels, and the living room has a cat tree
- `PETS`: one cat and one rabbit: a cream Holland Lop rabbit (female, about 2 years old); a gray and white mixed-breed domestic shorthair cat (male, about 3 years old)
- `PET_SCENE`: a bright condo living room near a window
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-087 · มณี · หญิง 57 ปี · เขตป้อมปราบศัตรูพ่าย (`pom-prap-sattru-phai`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | ครูสอนรำไทยสง่างาม ผมเกล้ามวยต่ำ แต่งหน้าอ่อน สวมเสื้อผ้าไหมสีทอง |
| อาชีพ / ไลฟ์สไตล์ | ครูสอนรำไทย |
| บ้าน (ตึกแถว) | ตึกแถวเก่าที่ชั้นบนเป็นห้องซ้อมรำพื้นไม้ |
| น้องที่ดูแลอยู่ | ทองคำ: แมว · ศุภลักษณ์ · น้ำตาลทองแดง · เมีย 5 ปี<br>มรกต: แมว · วิเชียรมาศ · ครีมแต้มน้ำตาล · เมีย 4 ปี |
| ความจุ | ดูแลอยู่ 2/3 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | รับเลี้ยงถาวร · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: น้ำตาลทองแดง · พันธุ์: ศุภลักษณ์ / แมวไทยโบราณ — รักแมวไทยโบราณเหมือนรักนาฏศิลป์ไทย อยากช่วยให้สายพันธุ์ไทยได้บ้านที่เข้าใจ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 09:00–12:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 3`, `currentCount: 2`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a graceful 57-year-old Thai classical dance teacher with a low bun, soft makeup, wearing a golden silk blouse
- `SETTING`: a traditional dance studio
- `HOME`: an old shophouse with a wooden-floor dance practice room upstairs, traditional Thai decor, cat cushions on a low wooden bench
- `PETS`: two cats: a copper brown Suphalak cat (female, about 5 years old); a seal point Siamese (Wichien Maat) cat (female, about 4 years old)
- `PET_SCENE`: the upstairs room of an old shophouse with wooden windows
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-088 · ปรเมศวร์ · ชาย 41 ปี · เขตบางคอแหลม (`bang-kho-laem`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | นักธุรกิจหนุ่มใหญ่หน้าหล่อ ผมเสยเรียบ มีผมขาวแซม ยิ้มสุขุม สวมเสื้อเชิ้ตลินินสีขาว |
| อาชีพ / ไลฟ์สไตล์ | เจ้าของบริษัทนำเข้าอาหาร |
| บ้าน (บ้านเดี่ยว) | บ้านเดี่ยวริมแม่น้ำ สนามหญ้ากว้างล้อมรั้ว |
| น้องที่ดูแลอยู่ | ทองคำขาว: สุนัข · โกลเด้นรีทรีฟเวอร์ · ครีม · เมีย 4 ปี<br>ทับทิม: สุนัข · โกลเด้นรีทรีฟเวอร์ · ทองเข้ม · ผู้ 3 ปี |
| ความจุ | ดูแลอยู่ 2/4 ตัว · **รับเพิ่มได้ 2 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · สุนัข |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ครีม / ทอง · พันธุ์: โกลเด้นรีทรีฟเวอร์ — บ้านมีสนามกว้างพอสำหรับหมาใหญ่ และมีเวลาพาเดินทุกเย็น |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 19:00–21:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['dog']`, `capacityTotal: 4`, `currentCount: 2`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a handsome 41-year-old Thai businessman with slicked-back hair with a touch of gray, a composed smile, wearing a white linen shirt
- `SETTING`: a riverfront terrace
- `HOME`: a riverfront detached house with a wide fenced lawn, a covered terrace with large dog beds and a shaded water fountain
- `PETS`: two dogs: a cream Golden Retriever dog (female, about 4 years old); a dark golden Golden Retriever dog (male, about 3 years old)
- `PET_SCENE`: a shaded yard of a Thai house on a sunny afternoon
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-089 · เนย · หญิง 29 ปี · เขตลาดพร้าว (`lat-phrao`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวน่ารักแก้มป่อง ผมยาวทวิสต์ลอน ยิ้มหวาน สวมเสื้อไหมพรมสีชมพูอ่อน |
| อาชีพ / ไลฟ์สไตล์ | ครูสอนทำขนม |
| บ้าน (ทาวน์เฮาส์) | ทาวน์เฮาส์ 2 ชั้น ห้องครัวแยกประตูปิด |
| น้องที่ดูแลอยู่ | คุกกี้: แมว · แมวไทยพันทาง · น้ำตาลลายเสือ · ผู้ 3 ปี<br>บราวนี่: แมว · แมวไทยพันทาง · น้ำตาลเข้ม · เมีย 2 ปี |
| ความจุ | ดูแลอยู่ 2/3 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: น้ำตาล · พันธุ์: ไม่จำกัดพันธุ์ — ตั้งชื่อน้องตามขนม และอยากได้น้องสีช็อกโกแลตมาครบทีม |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 18:00–20:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 3`, `currentCount: 2`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: an adorable 29-year-old Thai woman with round cheeks, long twisted curls, a sweet smile, wearing a light pink knit sweater
- `SETTING`: a baking class kitchen
- `HOME`: a two-story townhouse with a closed kitchen, a warm living room with a cat tree, a sofa throw and a basket of cat toys
- `PETS`: two cats: a brown tabby mixed-breed domestic shorthair cat (male, about 3 years old); a dark brown mixed-breed domestic shorthair cat (female, about 2 years old)
- `PET_SCENE`: a warm townhouse living room
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-090 · เอิร์ธ · ชาย 26 ปี · เขตวังทองหลาง (`wang-thonglang`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | หนุ่มลุคอินดี้ ใส่แว่นกลมสีดำ ผมยาวระต้นคอ ยิ้มขี้เล่น สวมเสื้อเชิ้ตฮาวาย |
| อาชีพ / ไลฟ์สไตล์ | นักแต่งเพลง |
| บ้าน (อพาร์ตเมนต์/ห้องเช่า) | อพาร์ตเมนต์ห้องมุม มีแผ่นเสียงเต็มผนัง |
| น้องที่ดูแลอยู่ | ยังไม่มี |
| ความจุ | ดูแลอยู่ 0/1 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | รับเลี้ยงถาวร · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: สามสี · พันธุ์: ไม่จำกัดพันธุ์ — อยากรับเลี้ยงแมวตัวแรก และชอบลายสามสีที่ดูเป็นศิลปะ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 14:00–17:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 1`, `currentCount: 0`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a charming 26-year-old Thai indie songwriter with round black glasses, neck-length hair, a playful smile, wearing a Hawaiian shirt
- `SETTING`: a room with vinyl records
- `HOME`: a corner apartment with vinyl records on the wall, a keyboard, a floor cushion, and a new cat bed and scratcher ready for a first cat
- ภาพ: `profile.webp`, `home.webp` (ไม่มี `pets.webp` เพราะยังไม่มีน้องในความดูแล)

#### adopter-091 · อรพิน · หญิง 62 ปี · เขตบึงกุ่ม (`bueng-kum`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | พยาบาลเกษียณหน้าใจดี ผมสั้นสีเทา ใส่แว่น ยิ้มอบอุ่น สวมเสื้อคาร์ดิแกนสีฟ้า |
| อาชีพ / ไลฟ์สไตล์ | พยาบาลเกษียณ |
| บ้าน (บ้านเดี่ยว) | บ้านเดี่ยว 2 ชั้น มีห้องพักฟื้นสัตว์ที่สะอาด |
| น้องที่ดูแลอยู่ | ยาหอม: แมว · แมวไทยพันทาง · ขาว · เมีย 10 ปี<br>สำลี: แมว · เปอร์เซีย · ขาวครีม · เมีย 9 ปี<br>ผ้าก๊อซ: แมว · แมวไทยพันทาง · เทา · ผู้ 8 ปี |
| ความจุ | ดูแลอยู่ 3/5 ตัว · **รับเพิ่มได้ 2 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ได้ |
| สนใจเป็นพิเศษ | สี: ไม่จำกัดสี (แมวสูงวัย/พักฟื้น) · พันธุ์: ไม่จำกัดพันธุ์ — มีประสบการณ์ดูแลผู้ป่วย จึงอยากดูแลแมวสูงวัยหรือแมวที่ต้องให้ยาตามคำสั่งสัตวแพทย์ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 09:00–17:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 5`, `currentCount: 3`, `availability: 'available'`, `acceptsEmergency: true` |

- `LOOK`: a kind 62-year-old retired Thai nurse with short gray hair, glasses, a warm smile, wearing a light blue cardigan
- `SETTING`: a cozy house living room
- `HOME`: a two-story detached house with a clean recovery room for animals, soft bedding, a medicine cabinet out of reach and a quiet sunny window
- `PETS`: three cats: a senior white mixed-breed domestic shorthair cat (female, about 10 years old); a cream white Persian cat (female, about 9 years old); a gray mixed-breed domestic shorthair cat (male, about 8 years old)
- `PET_SCENE`: a sunny living room of a Thai house
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-092 · ชัยวัฒน์ · ชาย 36 ปี · เขตคลองสามวา (`khlong-sam-wa`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | ผู้ชายเข้มแข็งแรง ผิวแทนเข้ม ผมสั้นเกรียน ยิ้มจริงใจ สวมเสื้อยืดสีเขียวขี้ม้า |
| อาชีพ / ไลฟ์สไตล์ | เจ้าของบ่อปลา |
| บ้าน (บ้านเดี่ยว) | บ้านเดี่ยวกลางบ่อปลา มีลานดินกว้างล้อมรั้ว |
| น้องที่ดูแลอยู่ | บ่อ: สุนัข · หมาไทยพันทาง · ดำ · ผู้ 5 ปี<br>นิล: สุนัข · หมาไทยพันทาง · เทา · เมีย 4 ปี<br>ทับทิม: สุนัข · หมาไทยพันทาง · แดง · เมีย 2 ปี |
| ความจุ | ดูแลอยู่ 3/5 ตัว · **รับเพิ่มได้ 2 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว · สุนัข |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ได้ |
| สนใจเป็นพิเศษ | สี: ไม่จำกัดสี · พันธุ์: หมาไทยพันทาง — มีลานกว้างและรั้วแน่นหนา รับหมาที่ต้องการที่พักด่วนได้ทุกขนาด |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 06:00–08:00 และ 17:00–19:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster']`, `speciesAccepted: ['dog']`, `capacityTotal: 5`, `currentCount: 3`, `availability: 'available'`, `acceptsEmergency: true` |

- `LOOK`: a strong 36-year-old Thai fish farmer with deep tan skin, a buzz cut, a sincere smile, wearing an army-green t-shirt
- `SETTING`: fish ponds at sunset
- `HOME`: a detached house among fish ponds with a wide fenced dirt yard, shaded kennels, and dogs' water bowls under a big tree
- `PETS`: three dogs: a black Thai mixed-breed dog (male, about 5 years old); a gray Thai mixed-breed dog (female, about 4 years old); a red Thai mixed-breed dog (female, about 2 years old)
- `PET_SCENE`: a shaded yard of a Thai house on a sunny afternoon
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-093 · น้ำหวาน · หญิง 24 ปี · เขตห้วยขวาง (`huai-khwang`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวน่ารักลุคไอดอล ผมยาวสีน้ำตาลช็อกโกแลต ตากลมโต ยิ้มหวาน สวมเสื้อสเวตเตอร์สีขาว |
| อาชีพ / ไลฟ์สไตล์ | ครูสอนร้องเพลง |
| บ้าน (คอนโด) | คอนโด 1 ห้องนอน ตกแต่งโทนพาสเทล |
| น้องที่ดูแลอยู่ | บับเบิ้ล: แมว · เอ็กโซติกช็อตแฮร์ · ขาว · เมีย 2 ปี |
| ความจุ | ดูแลอยู่ 1/2 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมว |
| ความพร้อม | รับได้จำกัด · รับกรณีฉุกเฉิน: ไม่ได้ · ตารางสอนแน่นช่วงปลายปี |
| สนใจเป็นพิเศษ | สี: ขาว · พันธุ์: เอ็กโซติกช็อตแฮร์ / เปอร์เซีย — ชอบหน้ากลมแบนน่ารัก และพร้อมดูแลเรื่องเช็ดตาทุกวัน |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 20:00–22:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 2`, `currentCount: 1`, `availability: 'limited'`, `acceptsEmergency: false` |

- `LOOK`: a lovely 24-year-old Thai woman with idol-like looks, long chocolate-brown hair, big round eyes, a sweet smile, wearing a white sweater
- `SETTING`: a bright pastel room
- `HOME`: a pastel one-bedroom condo with a fluffy rug, a heart-shaped cat bed, a cat tree and fairy lights
- `PETS`: one cat: a white Exotic Shorthair cat (female, about 2 years old)
- `PET_SCENE`: a bright condo living room near a window
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-094 · ธงชัย · ชาย 49 ปี · เขตภาษีเจริญ (`phasi-charoen`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | ลุงคนเรือหน้าคม ผิวแทน ยิ้มกว้าง สวมหมวกแก๊ปและเสื้อเชิ้ตแขนสั้น |
| อาชีพ / ไลฟ์สไตล์ | คนขับเรือหางยาวนำเที่ยวคลอง |
| บ้าน (บ้านไม้) | บ้านไม้ริมคลอง ท่าน้ำล้อมรั้ว |
| น้องที่ดูแลอยู่ | หางยาว: สุนัข · หมาไทยพันทาง · น้ำตาล · ผู้ 6 ปี<br>ท่าน้ำ: แมว · แมวไทยพันทาง · ลายเสือ · เมีย 4 ปี |
| ความจุ | ดูแลอยู่ 2/4 ตัว · **รับเพิ่มได้ 2 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมวและสุนัข |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: น้ำตาล · พันธุ์: หมาไทยพันทาง — บ้านริมคลองมีท่าน้ำล้อมรั้ว หมาแมวอยู่ร่วมกันได้ดีมานาน |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 17:00–19:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat','dog']`, `capacityTotal: 4`, `currentCount: 2`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a friendly 49-year-old Thai canal boatman with sharp features, tanned skin, a broad smile, wearing a cap and a short-sleeve shirt
- `SETTING`: a long-tail boat at a canal pier
- `HOME`: a wooden canal house with a fenced private pier, a shaded deck with a dog bed, a cat window perch and potted herbs
- `PETS`: one cat and one dog: a brown Thai mixed-breed dog (male, about 6 years old); a tabby mixed-breed domestic shorthair cat (female, about 4 years old)
- `PET_SCENE`: a shaded yard of a Thai house on a sunny afternoon
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-095 · ลูกปลา · หญิง 30 ปี · เขตธนบุรี (`thon-buri`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวมุสลิมหน้าคมสวย คลุมฮิญาบสีครีม ตาโต ยิ้มสดใส สวมเสื้อแขนยาวสีเขียวอ่อน |
| อาชีพ / ไลฟ์สไตล์ | นักโภชนาการ |
| บ้าน (ทาวน์เฮาส์) | ทาวน์เฮาส์ 2 ชั้น ครัวสะอาด มีมุมอาหารแมวแยก |
| น้องที่ดูแลอยู่ | อินทผลัม: แมว · แมวไทยพันทาง · น้ำตาลส้ม · ผู้ 4 ปี<br>ซัยตูน: แมว · แมวไทยพันทาง · เทาเขียว (ตาเขียว) · เมีย 3 ปี |
| ความจุ | ดูแลอยู่ 2/3 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: เทา · พันธุ์: ไม่จำกัดพันธุ์ — ชอบแมวตาเขียวสีเทา และดูแลเรื่องอาหารให้น้องน้ำหนักพอดีได้ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 19:00–21:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 3`, `currentCount: 2`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a beautiful 30-year-old Thai Muslim woman with striking features, wearing a cream hijab, big bright eyes, a radiant smile, wearing a light green long-sleeve top
- `SETTING`: a clean bright kitchen
- `HOME`: a two-story townhouse with a spotless kitchen, a separate cat feeding corner with measured portions, a cat tree and a sunny sofa
- `PETS`: two cats: a ginger brown mixed-breed domestic shorthair cat (male, about 4 years old); a gray with green eyes mixed-breed domestic shorthair cat (female, about 3 years old)
- `PET_SCENE`: a warm townhouse living room
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-096 · เต้ย · ชาย 28 ปี · เขตดอนเมือง (`don-mueang`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | หนุ่มหล่อลุคนายแบบ ผมเซตขึ้น โครงหน้าชัด ยิ้มมีเสน่ห์ สวมเสื้อเชิ้ตขาวพอดีตัว |
| อาชีพ / ไลฟ์สไตล์ | พนักงานต้อนรับบนเครื่องบิน |
| บ้าน (คอนโด) | คอนโดใกล้สนามบิน |
| น้องที่ดูแลอยู่ | ยังไม่มี |
| ความจุ | ดูแลอยู่ 0/1 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | รับเลี้ยงถาวร · แมว |
| ความพร้อม | ปิดรับชั่วคราว · รับกรณีฉุกเฉิน: ไม่ได้ · ปิดรับชั่วคราว |
| สนใจเป็นพิเศษ | สี: ส้มขาว · พันธุ์: ไม่จำกัดพันธุ์ — อยากรับเลี้ยงเมื่อตารางบินลดลง ตอนนี้บินต่างประเทศจึงปิดรับ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ช่วงนี้ไม่สะดวก · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 1`, `currentCount: 0`, `availability: 'unavailable'`, `acceptsEmergency: false` |

- `LOOK`: a model-handsome 28-year-old Thai man with styled-up hair, a defined jawline, a charming smile, wearing a fitted white shirt
- `SETTING`: a minimal condo with morning light
- `HOME`: a minimal condo near an airport with a neatly packed suitcase, a clean white room and an empty sunny corner reserved for a future cat
- ภาพ: `profile.webp`, `home.webp` (ไม่มี `pets.webp` เพราะยังไม่มีน้องในความดูแล)

#### adopter-097 · จิราพร · หญิง 41 ปี · เขตบางซื่อ (`bang-sue`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | รองผู้อำนวยการโรงเรียนสง่างาม ผมยาวประบ่าเป่าเรียบ ยิ้มอบอุ่น สวมเสื้อสูทสีฟ้าอ่อน |
| อาชีพ / ไลฟ์สไตล์ | รองผู้อำนวยการโรงเรียน |
| บ้าน (บ้านเดี่ยว) | บ้านเดี่ยว 2 ชั้น สวนกว้าง แยกห้องแมวและลานหมา |
| น้องที่ดูแลอยู่ | ครูใหญ่: สุนัข · หมาไทยพันทาง · ดำ · ผู้ 7 ปี<br>ผู้ช่วย: สุนัข · หมาไทยพันทาง · น้ำตาลอ่อน · เมีย 4 ปี<br>ชอล์ก: แมว · แมวไทยพันทาง · ขาว · เมีย 3 ปี<br>กระดาน: แมว · แมวไทยพันทาง · ดำ · ผู้ 3 ปี |
| ความจุ | ดูแลอยู่ 4/6 ตัว · **รับเพิ่มได้ 2 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมวและสุนัข |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ได้ |
| สนใจเป็นพิเศษ | สี: ดำ / ขาว · พันธุ์: ไม่จำกัดพันธุ์ — บ้านกว้างแยกโซนชัดเจน และครอบครัวช่วยกันดูแลน้องที่มาพักด่วนได้ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 18:00–20:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat','dog']`, `capacityTotal: 6`, `currentCount: 4`, `availability: 'available'`, `acceptsEmergency: true` |

- `LOOK`: an elegant 41-year-old Thai school vice-principal with smooth shoulder-length hair, a warm smile, wearing a light blue blazer
- `SETTING`: a spacious house with a garden
- `HOME`: a two-story detached house with a wide garden, a fenced dog area with shaded beds and a separate indoor cat room with shelves
- `PETS`: two cats and two dogs: a black Thai mixed-breed dog (male, about 7 years old); a fawn Thai mixed-breed dog (female, about 4 years old); a white mixed-breed domestic shorthair cat (female, about 3 years old); a black mixed-breed domestic shorthair cat (male, about 3 years old)
- `PET_SCENE`: a shaded yard of a Thai house on a sunny afternoon
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-098 · ศรัณย์ · ชาย 33 ปี · เขตทุ่งครุ (`thung-khru`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | วิศวกรหุ่นยนต์หน้าตาดี ผมรองทรงเรียบร้อย ผิวสองสี ยิ้มฉลาด สวมเสื้อยืดคอกลมกับเสื้อคลุม |
| อาชีพ / ไลฟ์สไตล์ | วิศวกรหุ่นยนต์ |
| บ้าน (ทาวน์เฮาส์) | ทาวน์เฮาส์ 2 ชั้น มีห้องทำงานแยกปิดประตูได้ |
| น้องที่ดูแลอยู่ | เซนเซอร์: แมว · แมวไทยพันทาง · ขาวดำ · ผู้ 3 ปี<br>มอเตอร์: แมว · แมวไทยพันทาง · ส้ม · ผู้ 2 ปี |
| ความจุ | ดูแลอยู่ 2/3 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ขาวดำ · พันธุ์: ไม่จำกัดพันธุ์ — ชอบแมวพลังเยอะที่เล่นวงล้อแมว และห้องทำงานแยกทำให้ปลอดภัยจากสายไฟ |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 19:00–21:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 3`, `currentCount: 2`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a handsome 33-year-old Thai robotics engineer with a neat tapered haircut, golden-brown skin, a clever smile, wearing a crew-neck tee under an overshirt
- `SETTING`: a home workshop with electronics
- `HOME`: a two-story townhouse with a closed-door electronics workshop, a living room with a cat wheel, a cat tree and interactive toys
- `PETS`: two cats: a black and white mixed-breed domestic shorthair cat (male, about 3 years old); an orange mixed-breed domestic shorthair cat (male, about 2 years old)
- `PET_SCENE`: a warm townhouse living room
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-099 · ปุยฝ้าย · หญิง 25 ปี · เขตประเวศ (`prawet`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | สาวหน้าหวาน ผมยาวสีชานมติดกิ๊บ ยิ้มอ่อนโยน สวมเสื้อยืดสีขาวกับผ้ากันเปื้อนสีเขียว |
| อาชีพ / ไลฟ์สไตล์ | ผู้ช่วยสัตวแพทย์ |
| บ้าน (อพาร์ตเมนต์/ห้องเช่า) | อพาร์ตเมนต์สองห้อง มีห้องอนุบาลลูกแมวที่สะอาด |
| น้องที่ดูแลอยู่ | ฝ้ายคำ: แมว · แมวไทยพันทาง · ส้มขาว · เมีย 1 ปี<br>ด้ายแดง: แมว · แมวไทยพันทาง · ลายสลิด · ผู้ 1 ปี |
| ความจุ | ดูแลอยู่ 2/4 ตัว · **รับเพิ่มได้ 2 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ได้ |
| สนใจเป็นพิเศษ | สี: ทุกสี (ลูกแมว) · พันธุ์: ไม่จำกัดพันธุ์ — ทำงานคลินิกจึงคุ้นกับลูกแมว และช่วยดูแลชั่วคราวระหว่างรอเจ้าของหรือบ้านใหม่ (ไม่รักษาเอง) |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 19:00–21:00 · ค่ะ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster']`, `speciesAccepted: ['cat']`, `capacityTotal: 4`, `currentCount: 2`, `availability: 'available'`, `acceptsEmergency: true` |

- `LOOK`: a sweet 25-year-old Thai woman with long milk-tea-brown hair held with a clip, a gentle smile, wearing a white tee and a green apron
- `SETTING`: an animal clinic reception area
- `HOME`: a two-room apartment with a clean kitten nursery room, a playpen, heating pads, and soft blankets
- `PETS`: two cats: a young orange and white mixed-breed domestic shorthair cat (female, about 1 year old); a young tabby mixed-breed domestic shorthair cat (male, about 1 year old)
- `PET_SCENE`: a cozy apartment room with soft daylight
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

#### adopter-100 · ชาญ · ชาย 67 ปี · เขตพระนคร (`phra-nakhon`)

| หัวข้อ | รายละเอียด |
|---|---|
| ลุค | คุณตาช่างทองเกษียณ ผมขาวหวีเรียบ แว่นกรอบทอง ยิ้มใจดี สวมเสื้อเชิ้ตสีครีม |
| อาชีพ / ไลฟ์สไตล์ | ช่างทองเกษียณ |
| บ้าน (ตึกแถว) | ตึกแถวเก่าในย่านเมืองเก่า ชั้นบนเป็นบ้าน หน้าต่างติดมุ้งลวด |
| น้องที่ดูแลอยู่ | ทองเค: แมว · แมวไทยพันทาง · ส้มทอง · ผู้ 6 ปี<br>เงินยวง: แมว · โคราช · เทาเงิน · เมีย 5 ปี |
| ความจุ | ดูแลอยู่ 2/3 ตัว · **รับเพิ่มได้ 1 ตัว** |
| โหมด · ชนิดสัตว์ | อุปถัมภ์ชั่วคราว + รับเลี้ยงถาวร · แมว |
| ความพร้อม | พร้อมรับ · รับกรณีฉุกเฉิน: ไม่ได้ |
| สนใจเป็นพิเศษ | สี: ส้มทอง · พันธุ์: โคราช — ชอบสีส้มทองเหมือนทองที่เคยทำ และแมวโคราชเงินยวงเข้ากับชื่อร้านเก่า |
| เวลาติดต่อ (ตัวอย่าง) · คำลงท้าย | ทุกวัน 09:00–17:00 · ครับ |
| ข้อมูลสำหรับ `src/data` | `careModes: ['foster','adopt']`, `speciesAccepted: ['cat']`, `capacityTotal: 3`, `currentCount: 2`, `availability: 'available'`, `acceptsEmergency: false` |

- `LOOK`: a kind 67-year-old retired Thai goldsmith with neatly combed white hair, gold-rimmed glasses, a gentle smile, wearing a cream shirt
- `SETTING`: an old-town shophouse interior
- `HOME`: an old-town shophouse living room upstairs with antique wooden furniture, mesh-screened windows, a vintage cabinet and cat cushions
- `PETS`: two cats: a golden orange mixed-breed domestic shorthair cat (male, about 6 years old); a silver-blue Korat cat (female, about 5 years old)
- `PET_SCENE`: the upstairs room of an old shophouse with wooden windows
- ภาพ: `profile.webp`, `home.webp`, `pets.webp`

---

## 6. สถานสงเคราะห์ 20 แห่ง (shelter-001 – shelter-020)

ชื่อสถานสงเคราะห์ทั้งหมดเป็นชื่อสมมติ ต้องค้นตรวจว่าไม่ตรงกับองค์กรจริงก่อน deploy (PROMPT.md หัวข้อ 18.3)

| ID | ชื่อ | เขต | รับ | ความจุ | บริจาค | ฉุกเฉิน | Verified |
|---|---|---|---|---|---|---|---|
| shelter-001 | บ้านอุ่นใจสี่ขา | บางกะปิ | แมวและสุนัข | 95/100 (ว่าง 5) | เปิด | ได้ | ตัวอย่าง |
| shelter-002 | บ้านพักน้องริมคลอง | สวนหลวง | แมวและสุนัข | 37/40 (ว่าง 3) | เปิด | — | ตัวอย่าง |
| shelter-003 | เรือนแมวเมืองเก่า | พระนคร | แมว | 44/50 (ว่าง 6) | เปิด | — | ตัวอย่าง |
| shelter-004 | ฟาร์มหางกระดิก | หนองจอก | สุนัข | 138/150 (ว่าง 12) | เปิด | ได้ | ตัวอย่าง |
| shelter-005 | บ้านพักพิงปุยฝ้าย | บางแค | แมวและสุนัข | 29/35 (ว่าง 6) | ปิด | — | ตัวอย่าง |
| shelter-006 | ลานรักน้องบางมด | ทุ่งครุ | สุนัข | 71/80 (ว่าง 9) | เปิด | ได้ | — |
| shelter-007 | บ้านแมวชั้นสอง | สาทร | แมว | 30/30 (เต็ม) | เปิด | — | ตัวอย่าง |
| shelter-008 | สวนพักใจสี่ขามีนบุรี | มีนบุรี | แมวและสุนัข | 58/70 (ว่าง 12) | เปิด | ได้ | ตัวอย่าง |
| shelter-009 | บ้านน้องรอบ้าน | ดอนเมือง | แมวและสุนัข | 38/45 (ว่าง 7) | ปิด | — | ตัวอย่าง |
| shelter-010 | เรือนไม้ริมน้ำตลิ่งชัน | ตลิ่งชัน | แมวและสุนัข | 33/40 (ว่าง 7) | เปิด | — | ตัวอย่าง |
| shelter-011 | บ้านเพื่อนขนนุ่ม | ลาดกระบัง | แมวและสุนัข | 76/90 (ว่าง 14) | เปิด | ได้ | ตัวอย่าง |
| shelter-012 | บ้านหางตั้งบางเขน | บางเขน | สุนัข | 40/45 (ว่าง 5) | ปิด | — | — |
| shelter-013 | บ้านกระต่ายและผองเพื่อน | ภาษีเจริญ | แมวและกระต่าย | 31/40 (ว่าง 9) | เปิด | — | ตัวอย่าง |
| shelter-014 | บ้านแมวแก่ใจดี | ห้วยขวาง | แมว | 22/25 (ว่าง 3) | เปิด | — | ตัวอย่าง |
| shelter-015 | ลานอุ่นไอรักประเวศ | ประเวศ | แมวและสุนัข | 52/60 (ว่าง 8) | เปิด | ได้ | ตัวอย่าง |
| shelter-016 | บ้านหมาน้อยคลองสามวา | คลองสามวา | สุนัข | 43/50 (ว่าง 7) | ปิด | — | ตัวอย่าง |
| shelter-017 | บ้านสะพานใจ | ราษฎร์บูรณะ | แมวและสุนัข | 47/55 (ว่าง 8) | เปิด | ได้ | ตัวอย่าง |
| shelter-018 | บ้านเหมียวสายไหม | สายไหม | แมว | 30/35 (ว่าง 5) | เปิด | — | ตัวอย่าง |
| shelter-019 | บ้านขนฟูบางพลัด | บางพลัด | แมวและสุนัข | 24/30 (ว่าง 6) | ปิด | — | — |
| shelter-020 | สวนสี่ขาทวีวัฒนา | ทวีวัฒนา | แมวและสุนัข | 55/65 (ว่าง 10) | เปิด | — | ตัวอย่าง |

#### shelter-001 · บ้านอุ่นใจสี่ขา · เขตบางกะปิ (`bang-kapi`)

| หัวข้อ | รายละเอียด |
|---|---|
| ผู้ดูแลสถานที่ | คุณแก้วตา (ผู้ก่อตั้งและผู้ประสานงาน) · หญิง 46 ปี · หญิงวัยกลางคนหน้าตาอบอุ่น ผมยาวรวบหางม้า ยิ้มกว้าง สวมเสื้อโปโลสีเหลืองมัสตาร์ดไม่มีโลโก้ · คำลงท้าย ค่ะ |
| สถานที่ | บ้านเดี่ยวสองหลังเชื่อมกันในซอยกว้าง รั้วเหล็กสีครีม ลานหน้าบ้านมีร่มไม้ |
| พื้นที่ดูแลสัตว์ | ห้องแมวติดมุ้งลวดพร้อมชั้นปีน และลานหมาแยกโซนมีหลังคา |
| รับ · ความจุ | แมวและสุนัข · ดูแลอยู่ 95/100 ตัว · **รับเพิ่มได้ 5 ตัว** |
| บริจาค | เปิดรับบริจาค (สถานะตัวอย่าง) — ต้องการอาหารแมวและทรายแมว (ข้อความตัวอย่าง) |
| ฉุกเฉิน · Verified | รับกรณีฉุกเฉิน · Verified (ตัวอย่าง) |
| เวลาทำการ (ตัวอย่าง) · เงื่อนไข | ทุกวัน 09:00–17:00 · ขอประวัติการพบน้องคร่าว ๆ ก่อนรับเข้า / รับกรณีฉุกเฉินหลังโทรนัดล่วงหน้า (จำลอง) |

- `MANAGER_LOOK`: a warm 46-year-old Thai woman with long hair in a ponytail, a wide caring smile, wearing a plain mustard-yellow polo shirt
- `EXTERIOR`: two connected detached houses in a wide soi with a cream-painted metal fence and a shaded front yard with large trees
- `CARE_AREA`: a clean screened cat room with climbing shelves and sleeping cubbies next to a separate covered dog yard with raised beds
- `DONATION_ITEMS`: neatly stacked bags of cat food and cat litter on wooden shelves with folded blankets
- ภาพ: `manager.webp`, `exterior.webp`, `care-area.webp`, `donation-corner.webp`

#### shelter-002 · บ้านพักน้องริมคลอง · เขตสวนหลวง (`suan-luang`)

| หัวข้อ | รายละเอียด |
|---|---|
| ผู้ดูแลสถานที่ | คุณปกป้อง (ผู้ดูแลสถานที่) · ชาย 39 ปี · ผู้ชายหน้าใจดี ผิวแทน ผมสั้น ยิ้มสุภาพ สวมเสื้อยืดสีเขียวหม่น · คำลงท้าย ครับ |
| สถานที่ | บ้านไม้สองชั้นริมคลองที่ปรับปรุงใหม่ มีรั้วไม้ระแนงกันตกน้ำ |
| พื้นที่ดูแลสัตว์ | ห้องแมวบนชั้นสองและคอกหมาใต้ถุนที่ร่มเย็น |
| รับ · ความจุ | แมวและสุนัข · ดูแลอยู่ 37/40 ตัว · **รับเพิ่มได้ 3 ตัว** |
| บริจาค | เปิดรับบริจาค (สถานะตัวอย่าง) — ต้องการผ้าห่มเก่าและชามอาหารสแตนเลส (ข้อความตัวอย่าง) |
| ฉุกเฉิน · Verified | ไม่รับกรณีฉุกเฉิน · Verified (ตัวอย่าง) |
| เวลาทำการ (ตัวอย่าง) · เงื่อนไข | อังคาร–อาทิตย์ 10:00–17:00 · รับเฉพาะน้องที่ตรวจสุขภาพเบื้องต้นแล้ว (จำลอง) |

- `MANAGER_LOOK`: a kind 39-year-old Thai man with tanned skin, short hair, a polite smile, wearing a muted green t-shirt
- `EXTERIOR`: a renovated two-story wooden house by a canal with a slatted wooden fence along the water
- `CARE_AREA`: an airy upstairs cat room with window perches and a shaded ground-floor dog area with clean pens
- `DONATION_ITEMS`: stacks of donated clean old blankets and stainless steel bowls on shelves
- ภาพ: `manager.webp`, `exterior.webp`, `care-area.webp`, `donation-corner.webp`

#### shelter-003 · เรือนแมวเมืองเก่า · เขตพระนคร (`phra-nakhon`)

| หัวข้อ | รายละเอียด |
|---|---|
| ผู้ดูแลสถานที่ | คุณลำเจียก (ผู้ก่อตั้ง) · หญิง 55 ปี · หญิงวัยห้าสิบกว่าผมสั้นสีดอกเลา ใส่แว่นกรอบบาง ยิ้มอ่อนโยน สวมเสื้อผ้าฝ้ายสีคราม · คำลงท้าย ค่ะ |
| สถานที่ | ตึกแถวเก่าสองคูหาในย่านเมืองเก่า หน้าต่างไม้บานเฟี้ยมติดมุ้งลวด |
| พื้นที่ดูแลสัตว์ | ห้องแมวเพดานสูงพื้นไม้ มีชั้นปีนและตะกร้าให้นอน |
| รับ · ความจุ | แมว · ดูแลอยู่ 44/50 ตัว · **รับเพิ่มได้ 6 ตัว** |
| บริจาค | เปิดรับบริจาค (สถานะตัวอย่าง) — ต้องการทรายแมวและแผ่นลับเล็บ (ข้อความตัวอย่าง) |
| ฉุกเฉิน · Verified | ไม่รับกรณีฉุกเฉิน · Verified (ตัวอย่าง) |
| เวลาทำการ (ตัวอย่าง) · เงื่อนไข | ทุกวัน 10:00–16:00 · รับเฉพาะแมว / นัดดูบ้านแมวได้ในวันเสาร์ (จำลอง) |

- `MANAGER_LOOK`: a gentle 55-year-old Thai woman with short silver-streaked hair, thin glasses, a soft smile, wearing an indigo cotton blouse
- `EXTERIOR`: two adjoining old-town shophouses with wooden folding windows fitted with fine mesh screens
- `CARE_AREA`: a high-ceiling wooden-floor cat room with climbing shelves, woven sleeping baskets and cats lounging calmly
- `DONATION_ITEMS`: bags of cat litter and cardboard scratchers stacked in a wooden cabinet
- ภาพ: `manager.webp`, `exterior.webp`, `care-area.webp`, `donation-corner.webp`

#### shelter-004 · ฟาร์มหางกระดิก · เขตหนองจอก (`nong-chok`)

| หัวข้อ | รายละเอียด |
|---|---|
| ผู้ดูแลสถานที่ | คุณบุญส่ง (เจ้าของฟาร์ม) · ชาย 51 ปี · ผู้ชายวัยห้าสิบผิวแทนเข้ม หนวดบาง หมวกแก๊ป ยิ้มกว้าง สวมเสื้อเชิ้ตลายสก๊อต · คำลงท้าย ครับ |
| สถานที่ | พื้นที่ฟาร์มกว้างหลายไร่ รั้วตาข่ายสูง มีโรงเรือนหลังคาเมทัลชีทสีเขียว |
| พื้นที่ดูแลสัตว์ | โรงเรือนหมาที่แบ่งคอกกว้าง มีพัดลมและรางน้ำสะอาด |
| รับ · ความจุ | สุนัข · ดูแลอยู่ 138/150 ตัว · **รับเพิ่มได้ 12 ตัว** |
| บริจาค | เปิดรับบริจาค (สถานะตัวอย่าง) — ต้องการอาหารหมาเม็ดและยาถ่ายพยาธิที่สัตวแพทย์แนะนำ (ข้อความตัวอย่าง) |
| ฉุกเฉิน · Verified | รับกรณีฉุกเฉิน · Verified (ตัวอย่าง) |
| เวลาทำการ (ตัวอย่าง) · เงื่อนไข | ทุกวัน 08:00–17:00 · รับเฉพาะหมา / รับหมาใหญ่ได้ |

- `MANAGER_LOOK`: a sun-tanned 51-year-old Thai man with a thin mustache, a cap, a broad smile, wearing a plaid shirt
- `EXTERIOR`: a spacious multi-acre farm compound with tall mesh fencing and green metal-roofed kennel barns
- `CARE_AREA`: a clean dog barn with spacious pens, fans, clean water troughs and healthy dogs resting on raised beds
- `DONATION_ITEMS`: large sacks of dog kibble stacked on pallets with buckets and leashes on hooks
- ภาพ: `manager.webp`, `exterior.webp`, `care-area.webp`, `donation-corner.webp`

#### shelter-005 · บ้านพักพิงปุยฝ้าย · เขตบางแค (`bang-khae`)

| หัวข้อ | รายละเอียด |
|---|---|
| ผู้ดูแลสถานที่ | คุณดวงใจ (ผู้ประสานงาน) · หญิง 34 ปี · หญิงสาวผมบ็อบ ใบหน้าสดใส ยิ้มกว้าง สวมเสื้อยืดสีชมพูอ่อน · คำลงท้าย ค่ะ |
| สถานที่ | ทาวน์เฮาส์สามคูหาเชื่อมกัน หน้าบ้านทาสีขาวมีกระถางต้นไม้ |
| พื้นที่ดูแลสัตว์ | ห้องรวมแมวและห้องหมาเล็กแยกกัน สะอาด มีของเล่น |
| รับ · ความจุ | แมวและสุนัข · ดูแลอยู่ 29/35 ตัว · **รับเพิ่มได้ 6 ตัว** |
| บริจาค | ไม่เปิดรับ |
| ฉุกเฉิน · Verified | ไม่รับกรณีฉุกเฉิน · Verified (ตัวอย่าง) |
| เวลาทำการ (ตัวอย่าง) · เงื่อนไข | พุธ–อาทิตย์ 10:00–16:00 · รับเฉพาะหมาเล็กและแมว |

- `MANAGER_LOOK`: a bright-faced 34-year-old Thai woman with a bob haircut, a wide smile, wearing a light pink t-shirt
- `EXTERIOR`: three connected white-painted townhouses with potted plants in front
- `CARE_AREA`: separate tidy rooms for cats and small dogs with toys, beds and clean floors
- ภาพ: `manager.webp`, `exterior.webp`, `care-area.webp` (ไม่มีมุมบริจาค)

#### shelter-006 · ลานรักน้องบางมด · เขตทุ่งครุ (`thung-khru`)

| หัวข้อ | รายละเอียด |
|---|---|
| ผู้ดูแลสถานที่ | คุณธนพล (ผู้จัดการ) · ชาย 42 ปี · ผู้ชายตัวใหญ่ใจดี ผมเกรียน ไว้เครา ยิ้มกว้าง สวมเสื้อกล้ามสีเทาและผ้าขาวม้าคาดเอว · คำลงท้าย ครับ |
| สถานที่ | ลานดินกว้างล้อมรั้วใกล้สวนมะพร้าว มีเพิงไม้หลังคาจากหลายหลัง |
| พื้นที่ดูแลสัตว์ | คอกหมาใต้เพิงไม้ร่มรื่น มีบ่อน้ำตื้นให้หมาคลายร้อน |
| รับ · ความจุ | สุนัข · ดูแลอยู่ 71/80 ตัว · **รับเพิ่มได้ 9 ตัว** |
| บริจาค | เปิดรับบริจาค (สถานะตัวอย่าง) — ต้องการอาหารหมาและผ้าใบกันฝน (ข้อความตัวอย่าง) |
| ฉุกเฉิน · Verified | รับกรณีฉุกเฉิน · ไม่มีป้าย |
| เวลาทำการ (ตัวอย่าง) · เงื่อนไข | ทุกวัน 07:00–18:00 · รับเฉพาะหมา |

- `MANAGER_LOOK`: a big-hearted 42-year-old Thai man with a buzz cut, a beard, a wide grin, wearing a gray tank top with a traditional pha khao ma cloth at the waist
- `EXTERIOR`: a wide fenced dirt compound near coconut groves with several wooden shelters topped with thatched roofs
- `CARE_AREA`: shaded dog pens under wooden shelters with a shallow cooling pool and healthy dogs playing
- `DONATION_ITEMS`: sacks of dog food and folded tarpaulins stored under a wooden shelter
- ภาพ: `manager.webp`, `exterior.webp`, `care-area.webp`, `donation-corner.webp`

#### shelter-007 · บ้านแมวชั้นสอง · เขตสาทร (`sathon`)

| หัวข้อ | รายละเอียด |
|---|---|
| ผู้ดูแลสถานที่ | คุณนลิน (ผู้ก่อตั้ง) · หญิง 31 ปี · หญิงสาวออฟฟิศ ผมยาวตรง ใส่แว่นกรอบดำ ยิ้มเขิน สวมเสื้อเชิ้ตสีฟ้า · คำลงท้าย ค่ะ |
| สถานที่ | ตึกแถวในซอยย่านธุรกิจ ชั้นสองเป็นบ้านแมว หน้าต่างติดมุ้งลวด |
| พื้นที่ดูแลสัตว์ | ห้องแมวชั้นสองที่มีคอนโดแมวหลายชั้นและมุมนอนแดด |
| รับ · ความจุ | แมว · ดูแลอยู่ 30/30 ตัว · **เต็มแล้ว** |
| บริจาค | เปิดรับบริจาค (สถานะตัวอย่าง) — ต้องการอาหารแมวสูตรแมวโต (ข้อความตัวอย่าง) |
| ฉุกเฉิน · Verified | ไม่รับกรณีฉุกเฉิน · Verified (ตัวอย่าง) |
| เวลาทำการ (ตัวอย่าง) · เงื่อนไข | เสาร์–อาทิตย์ 10:00–15:00 · รับเฉพาะแมว / ตอนนี้เต็มแล้ว |

- `MANAGER_LOOK`: a 31-year-old Thai office worker with long straight hair, black-framed glasses, a shy smile, wearing a light blue shirt
- `EXTERIOR`: a shophouse in a business-district soi where the second floor is a cat home with mesh-screened windows
- `CARE_AREA`: a second-floor cat room with multi-level cat condos, sunny sleeping spots and calm cats
- `DONATION_ITEMS`: boxes of adult cat food stacked neatly beside a shelf of cat bowls
- ภาพ: `manager.webp`, `exterior.webp`, `care-area.webp`, `donation-corner.webp`

#### shelter-008 · สวนพักใจสี่ขามีนบุรี · เขตมีนบุรี (`min-buri`)

| หัวข้อ | รายละเอียด |
|---|---|
| ผู้ดูแลสถานที่ | คุณอิสมาแอล (ผู้ดูแลสวน) · ชาย 44 ปี · ผู้ชายมุสลิมหน้าคม ไว้เคราเรียบร้อย สวมหมวกกะปิเยาะสีขาว ยิ้มอบอุ่น · คำลงท้าย ครับ |
| สถานที่ | สวนผลไม้เก่าที่ปรับเป็นที่พักสัตว์ รั้วไม้ไผ่กับตาข่าย ร่มไม้ใหญ่ |
| พื้นที่ดูแลสัตว์ | โซนหมาในสวนร่ม และบ้านแมวยกพื้นติดมุ้งลวด |
| รับ · ความจุ | แมวและสุนัข · ดูแลอยู่ 58/70 ตัว · **รับเพิ่มได้ 12 ตัว** |
| บริจาค | เปิดรับบริจาค (สถานะตัวอย่าง) — ต้องการทรายแมวและเชือกจูงหมา (ข้อความตัวอย่าง) |
| ฉุกเฉิน · Verified | รับกรณีฉุกเฉิน · Verified (ตัวอย่าง) |
| เวลาทำการ (ตัวอย่าง) · เงื่อนไข | ทุกวัน 08:00–17:00 · รับทั้งหมาและแมว |

- `MANAGER_LOOK`: a warm 44-year-old Thai Muslim man with a neat beard, wearing a white kufi cap and a simple shirt, a gentle smile
- `EXTERIOR`: a former fruit orchard converted into an animal sanctuary with bamboo and mesh fencing under large shady trees
- `CARE_AREA`: a shaded orchard dog zone and a raised screened cat house with shelves
- `DONATION_ITEMS`: cat litter bags and hanging dog leashes neatly organized in a wooden shed
- ภาพ: `manager.webp`, `exterior.webp`, `care-area.webp`, `donation-corner.webp`

#### shelter-009 · บ้านน้องรอบ้าน · เขตดอนเมือง (`don-mueang`)

| หัวข้อ | รายละเอียด |
|---|---|
| ผู้ดูแลสถานที่ | คุณพิมพ์ชนก (ผู้ประสานงาน) · หญิง 28 ปี · หญิงสาวผมหางม้า ผิวขาวเหลือง ยิ้มสดใส สวมเสื้อยืดสีขาว · คำลงท้าย ค่ะ |
| สถานที่ | บ้านเดี่ยวชั้นเดียวหลังใหญ่ รั้วเตี้ยทาสีเหลืองเนย |
| พื้นที่ดูแลสัตว์ | ห้องรับรองสำหรับพบน้องที่รอบ้าน และห้องพักแมวกับหมาแยกกัน |
| รับ · ความจุ | แมวและสุนัข · ดูแลอยู่ 38/45 ตัว · **รับเพิ่มได้ 7 ตัว** |
| บริจาค | ไม่เปิดรับ |
| ฉุกเฉิน · Verified | ไม่รับกรณีฉุกเฉิน · Verified (ตัวอย่าง) |
| เวลาทำการ (ตัวอย่าง) · เงื่อนไข | พฤหัส–อาทิตย์ 11:00–17:00 · เน้นหาบ้านให้น้องที่ผ่านขั้นตามหาเจ้าของแล้ว (จำลอง) |

- `MANAGER_LOOK`: a cheerful 28-year-old Thai woman with a ponytail, light warm skin, a bright smile, wearing a white t-shirt
- `EXTERIOR`: a large single-story detached house with a low butter-yellow painted fence
- `CARE_AREA`: a cozy meet-and-greet room with sofas, plus separate clean rooms for cats and dogs
- ภาพ: `manager.webp`, `exterior.webp`, `care-area.webp` (ไม่มีมุมบริจาค)

#### shelter-010 · เรือนไม้ริมน้ำตลิ่งชัน · เขตตลิ่งชัน (`taling-chan`)

| หัวข้อ | รายละเอียด |
|---|---|
| ผู้ดูแลสถานที่ | คุณสมพร (ผู้ก่อตั้ง) · หญิง 60 ปี · คุณป้าใจดี ผมสั้นสีเทา ยิ้มอบอุ่น สวมเสื้อคอกระเช้าลายดอก · คำลงท้าย ค่ะ |
| สถานที่ | เรือนไทยไม้สักริมคลอง มีสะพานไม้และสวนกล้วยรอบบ้าน |
| พื้นที่ดูแลสัตว์ | ระเบียงไม้กว้างติดมุ้งลวดสำหรับแมว และลานใต้ถุนสำหรับหมา |
| รับ · ความจุ | แมวและสุนัข · ดูแลอยู่ 33/40 ตัว · **รับเพิ่มได้ 7 ตัว** |
| บริจาค | เปิดรับบริจาค (สถานะตัวอย่าง) — ต้องการอาหารเปียกสำหรับแมวสูงวัย (ข้อความตัวอย่าง) |
| ฉุกเฉิน · Verified | ไม่รับกรณีฉุกเฉิน · Verified (ตัวอย่าง) |
| เวลาทำการ (ตัวอย่าง) · เงื่อนไข | ทุกวัน 09:00–16:00 · รับน้องสูงวัยเป็นพิเศษ |

- `MANAGER_LOOK`: a kind 60-year-old Thai woman with short gray hair, a warm smile, wearing a floral traditional blouse
- `EXTERIOR`: a traditional teak Thai house by a canal with a wooden bridge and banana trees around it
- `CARE_AREA`: a wide screened wooden veranda for cats and a shaded area under the stilt house for dogs
- `DONATION_ITEMS`: cans of wet cat food in woven baskets on a wooden table
- ภาพ: `manager.webp`, `exterior.webp`, `care-area.webp`, `donation-corner.webp`

#### shelter-011 · บ้านเพื่อนขนนุ่ม · เขตลาดกระบัง (`lat-krabang`)

| หัวข้อ | รายละเอียด |
|---|---|
| ผู้ดูแลสถานที่ | คุณวิชัย (ผู้จัดการ) · ชาย 48 ปี · ผู้ชายวัยสี่สิบปลาย ใส่แว่น ผมสั้นแซมขาว ยิ้มใจดี สวมเสื้อเชิ้ตสีน้ำเงิน · คำลงท้าย ครับ |
| สถานที่ | โกดังเก่าที่ปรับปรุงเป็นที่พักสัตว์ ทาสีขาว มีหน้าต่างระบายอากาศ |
| พื้นที่ดูแลสัตว์ | โซนหมาแยกคอกกว้าง และห้องแมวติดแอร์ |
| รับ · ความจุ | แมวและสุนัข · ดูแลอยู่ 76/90 ตัว · **รับเพิ่มได้ 14 ตัว** |
| บริจาค | เปิดรับบริจาค (สถานะตัวอย่าง) — ต้องการอาหารหมาและพัดลมตั้งพื้น (ข้อความตัวอย่าง) |
| ฉุกเฉิน · Verified | รับกรณีฉุกเฉิน · Verified (ตัวอย่าง) |
| เวลาทำการ (ตัวอย่าง) · เงื่อนไข | ทุกวัน 09:00–17:00 · รับทั้งหมาและแมว |

- `MANAGER_LOOK`: a kind 48-year-old Thai man with glasses, short graying hair, a friendly smile, wearing a blue shirt
- `EXTERIOR`: a converted former warehouse painted white with ventilation windows and a fenced front area
- `CARE_AREA`: spacious individual dog pens and an air-conditioned cat room with shelves
- `DONATION_ITEMS`: sacks of dog food and a few standing fans lined up by a wall
- ภาพ: `manager.webp`, `exterior.webp`, `care-area.webp`, `donation-corner.webp`

#### shelter-012 · บ้านหางตั้งบางเขน · เขตบางเขน (`bang-khen`)

| หัวข้อ | รายละเอียด |
|---|---|
| ผู้ดูแลสถานที่ | คุณณรงค์ (ผู้ก่อตั้ง) · ชาย 57 ปี · ชายวัยห้าสิบกว่าผมขาวตัดสั้น ผิวแทน ยิ้มกว้าง สวมเสื้อยืดสีกรมท่า · คำลงท้าย ครับ |
| สถานที่ | บ้านเดี่ยวหลังเก่าที่มีลานหญ้าหลังบ้านกว้าง รั้วสูง |
| พื้นที่ดูแลสัตว์ | ลานหญ้ามีบ้านหมาไม้และสระน้ำตื้น |
| รับ · ความจุ | สุนัข · ดูแลอยู่ 40/45 ตัว · **รับเพิ่มได้ 5 ตัว** |
| บริจาค | ไม่เปิดรับ |
| ฉุกเฉิน · Verified | ไม่รับกรณีฉุกเฉิน · ไม่มีป้าย |
| เวลาทำการ (ตัวอย่าง) · เงื่อนไข | ทุกวัน 08:00–16:00 · รับเฉพาะหมา |

- `MANAGER_LOOK`: a cheerful 57-year-old Thai man with short white hair, tanned skin, a wide smile, wearing a navy t-shirt
- `EXTERIOR`: an older detached house with a wide backyard lawn and a tall fence
- `CARE_AREA`: a grassy yard with wooden dog houses, a shallow splash pool and happy dogs
- ภาพ: `manager.webp`, `exterior.webp`, `care-area.webp` (ไม่มีมุมบริจาค)

#### shelter-013 · บ้านกระต่ายและผองเพื่อน · เขตภาษีเจริญ (`phasi-charoen`)

| หัวข้อ | รายละเอียด |
|---|---|
| ผู้ดูแลสถานที่ | คุณขวัญข้าว (ผู้ดูแล) · หญิง 30 ปี · หญิงสาวน่ารักผมเปียสองข้าง ใส่แว่นกรอบกลม ยิ้มสดใส สวมเอี๊ยมยีนส์ · คำลงท้าย ค่ะ |
| สถานที่ | บ้านเดี่ยวมีเรือนกระจกเล็ก ๆ และสวนหญ้าล้อมรั้วตาถี่ |
| พื้นที่ดูแลสัตว์ | ห้องกระต่ายที่มีคอกกว้าง หญ้าแห้ง และห้องแมวแยก |
| รับ · ความจุ | แมวและกระต่าย · ดูแลอยู่ 31/40 ตัว · **รับเพิ่มได้ 9 ตัว** |
| บริจาค | เปิดรับบริจาค (สถานะตัวอย่าง) — ต้องการหญ้าทิโมธีและทรายแมว (ข้อความตัวอย่าง) |
| ฉุกเฉิน · Verified | ไม่รับกรณีฉุกเฉิน · Verified (ตัวอย่าง) |
| เวลาทำการ (ตัวอย่าง) · เงื่อนไข | เสาร์–อาทิตย์ 10:00–16:00 · รับกระต่ายและแมว |

- `MANAGER_LOOK`: a cute 30-year-old Thai woman with two braids, round glasses, a cheerful smile, wearing denim overalls
- `EXTERIOR`: a detached house with a small greenhouse and a fine-mesh fenced grass garden
- `CARE_AREA`: a rabbit room with spacious pens, hay racks and tunnels, plus a separate cat room
- `DONATION_ITEMS`: bales of timothy hay and bags of cat litter on a shelf
- ภาพ: `manager.webp`, `exterior.webp`, `care-area.webp`, `donation-corner.webp`

#### shelter-014 · บ้านแมวแก่ใจดี · เขตห้วยขวาง (`huai-khwang`)

| หัวข้อ | รายละเอียด |
|---|---|
| ผู้ดูแลสถานที่ | คุณชไมพร (ผู้ก่อตั้ง) · หญิง 49 ปี · หญิงวัยสี่สิบปลาย ผมยาวดัดลอน ยิ้มอ่อนโยน สวมเสื้อคาร์ดิแกนสีครีม · คำลงท้าย ค่ะ |
| สถานที่ | ทาวน์เฮาส์สองคูหาในซอยเงียบ ทาสีเขียวอ่อน |
| พื้นที่ดูแลสัตว์ | ห้องแมวสูงวัยที่มีที่นอนนุ่ม ทางลาด และพื้นกันลื่น |
| รับ · ความจุ | แมว · ดูแลอยู่ 22/25 ตัว · **รับเพิ่มได้ 3 ตัว** |
| บริจาค | เปิดรับบริจาค (สถานะตัวอย่าง) — ต้องการอาหารแมวสูงวัยและแผ่นรองซับ (ข้อความตัวอย่าง) |
| ฉุกเฉิน · Verified | ไม่รับกรณีฉุกเฉิน · Verified (ตัวอย่าง) |
| เวลาทำการ (ตัวอย่าง) · เงื่อนไข | อังคาร–อาทิตย์ 10:00–16:00 · รับเฉพาะแมวอายุ 7 ปีขึ้นไป |

- `MANAGER_LOOK`: a gentle 49-year-old Thai woman with long wavy hair, a soft smile, wearing a cream cardigan
- `EXTERIOR`: two joined townhouses painted soft green in a quiet soi
- `CARE_AREA`: a senior-cat room with soft beds, gentle ramps, non-slip floors and relaxed older cats
- `DONATION_ITEMS`: senior cat food packs and absorbent pads stacked neatly
- ภาพ: `manager.webp`, `exterior.webp`, `care-area.webp`, `donation-corner.webp`

#### shelter-015 · ลานอุ่นไอรักประเวศ · เขตประเวศ (`prawet`)

| หัวข้อ | รายละเอียด |
|---|---|
| ผู้ดูแลสถานที่ | คุณศุภชัย (ผู้ประสานงาน) · ชาย 36 ปี · ผู้ชายหน้าตาดี ผมรองทรง ยิ้มมั่นใจ สวมเสื้อยืดสีส้มอิฐ · คำลงท้าย ครับ |
| สถานที่ | พื้นที่ลานกว้างหลังตึกพาณิชย์ รั้วเหล็กสีเทา หลังคาโปร่งแสง |
| พื้นที่ดูแลสัตว์ | คอกหมาแยกขนาด และห้องแมวติดพัดลม |
| รับ · ความจุ | แมวและสุนัข · ดูแลอยู่ 52/60 ตัว · **รับเพิ่มได้ 8 ตัว** |
| บริจาค | เปิดรับบริจาค (สถานะตัวอย่าง) — ต้องการอาหารหมาและแชมพูอาบน้ำสัตว์ (ข้อความตัวอย่าง) |
| ฉุกเฉิน · Verified | รับกรณีฉุกเฉิน · Verified (ตัวอย่าง) |
| เวลาทำการ (ตัวอย่าง) · เงื่อนไข | ทุกวัน 09:00–17:00 · รับทั้งหมาและแมว |

- `MANAGER_LOOK`: a handsome 36-year-old Thai man with a neat tapered haircut, a confident smile, wearing a brick-orange t-shirt
- `EXTERIOR`: a wide yard behind commercial buildings with gray metal fencing and translucent roofing
- `CARE_AREA`: dog pens organized by size and a ventilated cat room with fans
- `DONATION_ITEMS`: dog food sacks and bottles of pet shampoo without labels on a shelf
- ภาพ: `manager.webp`, `exterior.webp`, `care-area.webp`, `donation-corner.webp`

#### shelter-016 · บ้านหมาน้อยคลองสามวา · เขตคลองสามวา (`khlong-sam-wa`)

| หัวข้อ | รายละเอียด |
|---|---|
| ผู้ดูแลสถานที่ | คุณกมล (ผู้ก่อตั้ง) · หญิง 43 ปี · หญิงวัยสี่สิบ ผมสั้นเท่ ผิวแทน ยิ้มกว้าง สวมเสื้อยืดสีน้ำตาล · คำลงท้าย ค่ะ |
| สถานที่ | บ้านสวนกลางทุ่ง รั้วไม้ระแนงยาว |
| พื้นที่ดูแลสัตว์ | ลานหมาเล็กและคอกลูกหมาที่สะอาด |
| รับ · ความจุ | สุนัข · ดูแลอยู่ 43/50 ตัว · **รับเพิ่มได้ 7 ตัว** |
| บริจาค | ไม่เปิดรับ |
| ฉุกเฉิน · Verified | ไม่รับกรณีฉุกเฉิน · Verified (ตัวอย่าง) |
| เวลาทำการ (ตัวอย่าง) · เงื่อนไข | ทุกวัน 08:00–17:00 · รับเฉพาะหมา / เน้นลูกหมาและหมาเล็ก |

- `MANAGER_LOOK`: a lively 43-year-old Thai woman with a short cool haircut, tanned skin, a wide smile, wearing a brown t-shirt
- `EXTERIOR`: a garden house in the middle of fields with a long slatted wooden fence
- `CARE_AREA`: a small-dog play yard and a clean puppy pen with soft mats
- ภาพ: `manager.webp`, `exterior.webp`, `care-area.webp` (ไม่มีมุมบริจาค)

#### shelter-017 · บ้านสะพานใจ · เขตราษฎร์บูรณะ (`rat-burana`)

| หัวข้อ | รายละเอียด |
|---|---|
| ผู้ดูแลสถานที่ | คุณอนันต์ (ผู้จัดการ) · ชาย 52 ปี · ผู้ชายวัยห้าสิบ ผมหงอกบาง ยิ้มใจดี ใส่แว่นอ่านหนังสือ สวมเสื้อเชิ้ตสีครีม · คำลงท้าย ครับ |
| สถานที่ | อาคารสองชั้นริมแม่น้ำ รั้วเหล็กดัดสีขาว |
| พื้นที่ดูแลสัตว์ | ห้องพักฟื้นที่สะอาดและลานหมาริมน้ำที่ล้อมรั้ว |
| รับ · ความจุ | แมวและสุนัข · ดูแลอยู่ 47/55 ตัว · **รับเพิ่มได้ 8 ตัว** |
| บริจาค | เปิดรับบริจาค (สถานะตัวอย่าง) — ต้องการผ้าขนหนูและอาหารสำหรับสัตว์พักฟื้น (ข้อความตัวอย่าง) |
| ฉุกเฉิน · Verified | รับกรณีฉุกเฉิน · Verified (ตัวอย่าง) |
| เวลาทำการ (ตัวอย่าง) · เงื่อนไข | ทุกวัน 09:00–17:00 · รับน้องที่ต้องพักฟื้นหลังรักษา (จำลอง) |

- `MANAGER_LOOK`: a kind 52-year-old Thai man with thinning gray hair, reading glasses, a warm smile, wearing a cream shirt
- `EXTERIOR`: a two-story riverside building with a white wrought-iron fence
- `CARE_AREA`: a clean recovery room with soft bedding and a fenced riverside dog yard
- `DONATION_ITEMS`: stacks of clean towels and recovery pet food cans on shelves
- ภาพ: `manager.webp`, `exterior.webp`, `care-area.webp`, `donation-corner.webp`

#### shelter-018 · บ้านเหมียวสายไหม · เขตสายไหม (`sai-mai`)

| หัวข้อ | รายละเอียด |
|---|---|
| ผู้ดูแลสถานที่ | คุณปิยะดา (ผู้ประสานงาน) · หญิง 27 ปี · หญิงสาวหน้าหวาน ผมยาวสีน้ำตาล ยิ้มน่ารัก สวมเสื้อยืดสีม่วงอ่อน · คำลงท้าย ค่ะ |
| สถานที่ | ทาวน์โฮมหัวมุมมีสวนข้างบ้าน รั้วตาข่ายสูง |
| พื้นที่ดูแลสัตว์ | สวนแมวปิดตาข่ายและห้องแมวในบ้าน |
| รับ · ความจุ | แมว · ดูแลอยู่ 30/35 ตัว · **รับเพิ่มได้ 5 ตัว** |
| บริจาค | เปิดรับบริจาค (สถานะตัวอย่าง) — ต้องการของเล่นแมวและที่ลับเล็บ (ข้อความตัวอย่าง) |
| ฉุกเฉิน · Verified | ไม่รับกรณีฉุกเฉิน · Verified (ตัวอย่าง) |
| เวลาทำการ (ตัวอย่าง) · เงื่อนไข | เสาร์–อาทิตย์ 10:00–17:00 · รับเฉพาะแมว |

- `MANAGER_LOOK`: a sweet 27-year-old Thai woman with long brown hair, a lovely smile, wearing a lilac t-shirt
- `EXTERIOR`: a corner townhome with a side garden and a tall mesh fence
- `CARE_AREA`: a fully netted cat garden (catio) with plants and an indoor cat room
- `DONATION_ITEMS`: cat toys in baskets and cardboard scratchers stacked by the door
- ภาพ: `manager.webp`, `exterior.webp`, `care-area.webp`, `donation-corner.webp`

#### shelter-019 · บ้านขนฟูบางพลัด · เขตบางพลัด (`bang-phlat`)

| หัวข้อ | รายละเอียด |
|---|---|
| ผู้ดูแลสถานที่ | คุณธีรวัฒน์ (ผู้ดูแล) · ชาย 33 ปี · หนุ่มหน้าใส ผมสั้น ยิ้มกว้าง สวมเสื้อยืดสีฟ้า · คำลงท้าย ครับ |
| สถานที่ | บ้านเดี่ยวสองชั้นใกล้ริมน้ำ มีระเบียงกว้าง |
| พื้นที่ดูแลสัตว์ | ห้องแมวชั้นบนและลานหมาชั้นล่าง |
| รับ · ความจุ | แมวและสุนัข · ดูแลอยู่ 24/30 ตัว · **รับเพิ่มได้ 6 ตัว** |
| บริจาค | ไม่เปิดรับ |
| ฉุกเฉิน · Verified | ไม่รับกรณีฉุกเฉิน · ไม่มีป้าย |
| เวลาทำการ (ตัวอย่าง) · เงื่อนไข | ศุกร์–อาทิตย์ 10:00–16:00 · รับทั้งหมาและแมว |

- `MANAGER_LOOK`: a friendly 33-year-old Thai man with short hair, a wide smile, wearing a light blue t-shirt
- `EXTERIOR`: a two-story detached house near the river with a wide balcony
- `CARE_AREA`: an upstairs cat room and a ground-floor dog area with clean beds
- ภาพ: `manager.webp`, `exterior.webp`, `care-area.webp` (ไม่มีมุมบริจาค)

#### shelter-020 · สวนสี่ขาทวีวัฒนา · เขตทวีวัฒนา (`thawi-watthana`)

| หัวข้อ | รายละเอียด |
|---|---|
| ผู้ดูแลสถานที่ | คุณมยุรี (ผู้ก่อตั้ง) · หญิง 50 ปี · หญิงวัยห้าสิบ ผิวแทน ผมยาวรวบ ยิ้มอบอุ่น สวมเสื้อเชิ้ตลายดอก · คำลงท้าย ค่ะ |
| สถานที่ | สวนกว้างริมคลองชลประทาน มีบ้านไม้และโรงเรือนสัตว์ |
| พื้นที่ดูแลสัตว์ | โรงเรือนหมาแมวแยกกัน มีพื้นที่วิ่งเล่นกว้าง |
| รับ · ความจุ | แมวและสุนัข · ดูแลอยู่ 55/65 ตัว · **รับเพิ่มได้ 10 ตัว** |
| บริจาค | เปิดรับบริจาค (สถานะตัวอย่าง) — ต้องการอาหารหมาแมวและอุปกรณ์ทำความสะอาด (ข้อความตัวอย่าง) |
| ฉุกเฉิน · Verified | ไม่รับกรณีฉุกเฉิน · Verified (ตัวอย่าง) |
| เวลาทำการ (ตัวอย่าง) · เงื่อนไข | ทุกวัน 08:00–17:00 · รับทั้งหมาและแมว |

- `MANAGER_LOOK`: a warm 50-year-old Thai woman with tanned skin, long tied-back hair, a kind smile, wearing a floral shirt
- `EXTERIOR`: a wide garden by an irrigation canal with a wooden house and animal shelters
- `CARE_AREA`: separate shelters for dogs and cats with a large grassy play area
- `DONATION_ITEMS`: pet food sacks and cleaning supplies without labels neatly arranged in a shed
- ภาพ: `manager.webp`, `exterior.webp`, `care-area.webp`, `donation-corner.webp`

---

## 7. Checklist หลังสร้างภาพ

ตรวจทุก batch ก่อนทำ batch ถัดไป

- [ ] ไฟล์ครบตามรายการ “ภาพ” ของทุก record ใน batch ชื่อไฟล์และ path ตรงตามหัวข้อ 4
- [ ] ภาพคนดูเป็นภาพถ่ายจริง หน้าไม่คล้ายคนดังหรือบุคคลจริง อายุดูเป็นผู้ใหญ่ มือและตาไม่ผิดรูป
- [ ] ลุค (ทรงผม แว่น เสื้อผ้า โทนผิว) ตรงกับคำบรรยายของ record
- [ ] ภาพบ้านตรงประเภทบ้านและรายละเอียด ไม่มีคน ไม่มีสัตว์ ไม่มีบ้านเลขที่หรือป้าย
- [ ] ภาพน้อง: จำนวน ชนิด สี และพันธุ์ตรงกับ “น้องที่ดูแลอยู่” ทุกตัว กายวิภาคถูกต้อง ดูสุขภาพดี
- [ ] ภาพสถานสงเคราะห์สะอาดและมีมนุษยธรรม ไม่มีสัตว์ป่วยหรือกรงแออัด
- [ ] มุมบริจาคไม่มีเงิน QR เลขบัญชี ฉลาก หรือป้ายที่อ่านได้
- [ ] ไม่มีข้อความ โลโก้ หรือลายน้ำในภาพใดเลย
- [ ] WebP ≤ 300 KB ขนาดตามหัวข้อ 4 ลบ metadata แล้ว
- [ ] เพิ่มแถวใน CREDITS.md หนึ่งแถวต่อ batch เช่น `ai-personas-001-010` หรือ `ai-shelters-001-010` ระบุเครื่องมือที่ใช้ วันที่สร้าง และเงื่อนไขการใช้งานภาพของเครื่องมือนั้น ณ วันที่สร้าง
- [ ] ใน `src/data` ตั้ง `images.*.src` เป็น path ของไฟล์ `aiGenerated: true`, `creditId` ตรงกับแถว CREDITS.md และ `alt` ตามรูปแบบในหัวข้อ 4
