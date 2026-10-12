# CREDITS.md — ที่มาและไลเซนส์ของภาพ ฟอนต์ ไอคอน และ animation

ทุก asset ที่ใช้ในเว็บ Cozypet ต้องมีแถวในไฟล์นี้ก่อน merge และ `MediaRef.creditId` ในข้อมูลต้องตรงกับคอลัมน์ ID (ดู PROMPT.md หัวข้อ 10.2 และ 15) หน้า `/about-demo` สรุปที่มา ส่วนทะเบียนเต็มอยู่ในตารางนี้

## กติกา

- **แหล่งภาพตามประเภท (PROMPT.md D3, D8):**
  - ภาพสัตว์ทุก record → **ภาพ AI สมจริงจาก built-in image_gen** ตามคำขอ 8 ต.ค. 2026 (D21/D22): แมว 138 หมา 76 กระต่าย 13 นก 2 หนูตะเภา 1 แฮมสเตอร์ 1 รวม 231 ช่อง (รวม D23) แยกจาก mascot
  - ภาพคน บ้าน และน้องที่ผู้รับดูแลรายบุคคลดูแลอยู่ → **ภาพสร้างด้วย AI โดย Codex** ตาม [CODEX_IMAGE_PROMPTS.md](CODEX_IMAGE_PROMPTS.md) บันทึกเป็นแถวต่อ batch และระบุเครื่องมือกับเงื่อนไขการใช้งานภาพ ณ วันที่สร้าง
  - ภาพสถานสงเคราะห์ → **ภาพพื้นที่ดูแลสาธิตที่สร้างใหม่ด้วย AI** ตาม D22 จำนวน 20 ช่อง ไม่ใช่สถานที่จริงขององค์กร ไม่มีคน/โลโก้/ป้าย; gallery มีคำอธิบายเรื่องภาพ ส่วนข้อมูลชื่อองค์กรอ้างอิงเดิมยังคงอยู่
  - mascot แมวและหมา → **ภาพ AI สมจริงพื้นหลังโปร่งใส** สร้างด้วย built-in image_gen ตามคำขอ 8 ต.ค. 2026 แยก layer ใน SVG เพื่อ animate ดู `docs/MASCOT_ASSETS.md`; wordmark → ออกแบบเองเป็น SVG
  - ตัวละครและฉากใน animation (ขนมชั้น ขนมปัง มอคค่า น้องหมา มือคน ซอย ห้องคอนโด UI กล้อง) → **ออกแบบเองเป็น SVG ในโค้ด** ห้าม trace ภาพถ่าย ห้ามใช้ asset 3D หรือ UI กล้องของยี่ห้อจริง (STORYBOARD.md หัวข้อ 6)
  - โลโก้แบรนด์พันธมิตร → **ป้ายที่ออกแบบเองของแบรนด์สมมติ** ห้ามคล้ายแบรนด์จริง
  - ปุ่ม Google Sign-In และไอคอน SDG → ใช้ตามแนวทางของเจ้าของ (Google / สหประชาชาติ) โดยตรวจเงื่อนไข ณ วันที่ใช้ ห้ามดัดแปลง
  - โทรศัพท์ 3 มิติและเคอร์เซอร์อุ้งเท้าของทัวร์ → **สร้างเองจากโค้ด/SVG** ห้ามใช้โมเดล 3 มิติหรือ UI ของยี่ห้อจริง
  - ภาพหน้าจอ ภาพนิ่ง และวิดีโอในงานส่ง → สร้างจากเว็บของโปรเจกต์เอง ไฟล์ผลลัพธ์ไม่อยู่ใน repo
  - ฟอนต์ SIL OFL และไอคอนไลเซนส์ MIT/ISC
- **ห้าม:** ดึงรูปจาก Google Images โดยตรง, ใช้/trace ภาพอ้างอิง, ใช้ชื่อ โลโก้ ข้อความ หรือภาพของ PetZen, ภาพคนจริงที่ไม่มีสิทธิ์ใช้ หรือป้ายทะเบียนชัดเจน, hotlink จากเว็บอื่น
- ดาวน์โหลดภาพเก็บใน `public/images/` และบันทึก URL ต้นทาง ผู้สร้าง ไลเซนส์ และวันที่
- ถ้าไลเซนส์ต้องให้เครดิต (เช่น CC BY) ต้องแสดงเครดิตในหน้า `/about-demo` ตามรูปแบบที่ไลเซนส์กำหนด
- ถ้าแก้ไขภาพ (ครอป ย่อ ปรับสี) ให้ระบุในคอลัมน์หมายเหตุ; รุ่นนี้เก็บ PNG ต้นฉบับ ใช้ SVG crop เฉพาะช่องภาพ และถอดป้าย AI/ภาพวาดออกจากรูปตามคำขอ ที่มาคงอยู่ในเครดิตและ /about-demo

## ภาพอ้างอิงที่ใช้ตอนออกแบบ (ไม่อยู่ในเว็บ)

| ภาพ | ใช้ดู | สถานะ |
|---|---|---|
| ภาพแมวเกาะขอบโต๊ะ | ท่าทางโผล่จากหลังโต๊ะและอุ้งเท้าบนขอบโต๊ะ | ไม่ใช้ในเว็บ ไม่ trace |
| ภาพเว็บ PetZen | โทนครีม/เหลืองทองและการจัดวาง hero | ไม่ใช้ในเว็บ ไม่คัดลอกแบรนด์ |
| ภาพหน้าเว็บยาว | ลำดับ section และแนวการ์ดเรื่องราว | ไม่ใช้ในเว็บ |
| วิดีโอโปรโมต Elysia (94 วินาที) | เทคนิค animation และจังหวะเสียง (สรุปใน STORYBOARD.md) | ไม่ใช้ในเว็บ ไม่คัดลอกชื่อ ภาพ หรือเพลง ไม่ใส่ใน repo |

**ไม่เพิ่มภาพต้นฉบับลง repo (PROMPT.md D7)** คำอธิบายที่ใช้ทำงานอยู่ใน PROMPT.md หัวข้อ 3.1 แล้ว

## ทะเบียน asset

> แถวที่มีสถานะ **วางแผน** ยังไม่มีไฟล์จริง ผู้ implement ต้องเติม URL ไลเซนส์ และวันที่ให้ครบ แล้วเปลี่ยนสถานะเป็น **ใช้งาน**

| ID | ไฟล์ใน repo | ใช้ที่ | ที่มา/ผู้สร้าง | URL ต้นทาง | ไลเซนส์ | วันที่ได้มา | สถานะ | หมายเหตุ |
|---|---|---|---|---|---|---|---|---|
| `mascot-cat` | `public/mascot/cat-neutral.png`, `public/mascot/cat-happy.png`, `public/mascot/cat-yawn.png`, `src/components/mascot/PhotoCatArt.tsx` | Hero, dock, ฉากเว็บในปาก | built-in image_gen; แมวสมมติ | — | ภาพ AI ตามเงื่อนไขบริการของเครื่องมือ | 2026-10-08 | ใช้งาน | PNG alpha 3 expressions; native SVG layers/CSS; prompts ใน docs/MASCOT_ASSETS.md |
| `mascot-dog` | `public/mascot/dog-neutral.png`, `public/mascot/dog-happy.png`, `public/mascot/dog-yawn.png`, `src/components/mascot/PhotoDogArt.tsx` | Hero, dock, ฉากเว็บในปาก | built-in image_gen; โกลเด้นรีทรีฟเวอร์สมมติ | — | ภาพ AI ตามเงื่อนไขบริการของเครื่องมือ | 2026-10-08 | ใช้งาน | PNG alpha 3 expressions; native SVG layers/CSS; prompts ใน docs/MASCOT_ASSETS.md |
| `wordmark` | `src/components/shell/Wordmark.tsx` | Header, footer, เว็บในปากสัตว์ | สร้างขึ้นสำหรับ Cozypet | — | ของโปรเจกต์ | 2026-10-08 | ใช้งาน | D23: C ตัวใหญ่โค้งเป็นหางแมว คง Cozy สีเข้ม pet สีทองและอุ้งเท้า; SVG ที่ออกแบบเอง |
| `font-mitr` | ผ่าน `next/font/google` | หัวข้อ, wordmark | Cadson Demak | https://fonts.google.com/specimen/Mitr | SIL OFL 1.1 (ตรวจอีกครั้ง) | — | วางแผน | |
| `font-noto-sans-thai` | ผ่าน `next/font/google` | เนื้อหา | Google / Noto project | https://fonts.google.com/noto/specimen/Noto+Sans+Thai | SIL OFL 1.1 (ตรวจอีกครั้ง) | — | วางแผน | |
| `icons` | `lucide-react` หรือ inline SVG | ไอคอนทั่วไป, ไอคอนเงิน | Lucide contributors หรือสร้างเอง | https://lucide.dev | ISC (ถ้าใช้ Lucide) | — | วางแผน | |
| `district-centers` | `src/data/districts.ts` | จุดกึ่งกลาง 50 เขต (mock) | ระบุแหล่งอ้างอิงเมื่อสร้าง | — | ตามแหล่งที่ใช้ | — | วางแผน | พิกัดโดยประมาณ ปัดทศนิยม 3 ตำแหน่ง |
| `pet-photo-###` | `public/images/pets/…` | ประกาศ, เรื่องราว, รูปตัวอย่างในหน้าสแกน | ภาพถ่ายที่มีสิทธิ์ใช้งาน | — | — | — | วางแผน | เพิ่มหนึ่งแถวต่อภาพ |
| `art-pets` | `src/components/PetArt.tsx`, `src/data/pet-art.ts` | โค้ดภาพวาดเดิม | สร้างขึ้นสำหรับ Cozypet | — | ของโปรเจกต์ | 2026-10-06 | เลิกใช้ในภาพ records | PetImage ใช้ภาพสมจริงทั้งหมด ถ้าไฟล์หายใช้ไอคอนอุ้งเท้า |
| `ai-cats-01` | `public/images/cats/cats-01.png` | listing-001–listing-025 (16 ตัว, ช่องภาพคงที่) | built-in image_gen สำหรับ Cozypet; แมวสมมติ | — | ภาพสร้างด้วย AI ตามเงื่อนไขบริการของเครื่องมือที่ใช้ | 2026-10-08 | ใช้งาน | Atlas 4×4; mapping ใน src/data/cat-photos.generated.ts; prompt และรายชื่อช่องใน docs/CAT_PHOTO_PROMPTS.md |
| `ai-cats-02` | `public/images/cats/cats-02.png` | listing-027–adopter-010-pet-1 (16 ตัว, ช่องภาพคงที่) | built-in image_gen สำหรับ Cozypet; แมวสมมติ | — | ภาพสร้างด้วย AI ตามเงื่อนไขบริการของเครื่องมือที่ใช้ | 2026-10-08 | ใช้งาน | Atlas 4×4; mapping ใน src/data/cat-photos.generated.ts; prompt และรายชื่อช่องใน docs/CAT_PHOTO_PROMPTS.md |
| `ai-cats-03` | `public/images/cats/cats-03.png` | adopter-011-pet-3–adopter-025-pet-1 (16 ตัว, ช่องภาพคงที่) | built-in image_gen สำหรับ Cozypet; แมวสมมติ | — | ภาพสร้างด้วย AI ตามเงื่อนไขบริการของเครื่องมือที่ใช้ | 2026-10-08 | ใช้งาน | Atlas 4×4; mapping ใน src/data/cat-photos.generated.ts; prompt และรายชื่อช่องใน docs/CAT_PHOTO_PROMPTS.md |
| `ai-cats-04` | `public/images/cats/cats-04.png` | adopter-026-pet-1–adopter-042-pet-1 (16 ตัว, ช่องภาพคงที่) | built-in image_gen สำหรับ Cozypet; แมวสมมติ | — | ภาพสร้างด้วย AI ตามเงื่อนไขบริการของเครื่องมือที่ใช้ | 2026-10-08 | ใช้งาน | Atlas 4×4; mapping ใน src/data/cat-photos.generated.ts; prompt และรายชื่อช่องใน docs/CAT_PHOTO_PROMPTS.md |
| `ai-cats-05` | `public/images/cats/cats-05.png` | adopter-042-pet-2–adopter-059-pet-1 (16 ตัว, ช่องภาพคงที่) | built-in image_gen สำหรับ Cozypet; แมวสมมติ | — | ภาพสร้างด้วย AI ตามเงื่อนไขบริการของเครื่องมือที่ใช้ | 2026-10-08 | ใช้งาน | Atlas 4×4; mapping ใน src/data/cat-photos.generated.ts; prompt และรายชื่อช่องใน docs/CAT_PHOTO_PROMPTS.md |
| `ai-cats-06` | `public/images/cats/cats-06.png` | adopter-061-pet-1–adopter-075-pet-1 (16 ตัว, ช่องภาพคงที่) | built-in image_gen สำหรับ Cozypet; แมวสมมติ | — | ภาพสร้างด้วย AI ตามเงื่อนไขบริการของเครื่องมือที่ใช้ | 2026-10-08 | ใช้งาน | Atlas 4×4; mapping ใน src/data/cat-photos.generated.ts; prompt และรายชื่อช่องใน docs/CAT_PHOTO_PROMPTS.md |
| `ai-cats-07` | `public/images/cats/cats-07.png` | adopter-075-pet-2–adopter-089-pet-1 (16 ตัว, ช่องภาพคงที่) | built-in image_gen สำหรับ Cozypet; แมวสมมติ | — | ภาพสร้างด้วย AI ตามเงื่อนไขบริการของเครื่องมือที่ใช้ | 2026-10-08 | ใช้งาน | Atlas 4×4; mapping ใน src/data/cat-photos.generated.ts; prompt และรายชื่อช่องใน docs/CAT_PHOTO_PROMPTS.md |
| `ai-cats-08` | `public/images/cats/cats-08.png` | adopter-089-pet-2–adopter-100-pet-2 (16 ตัว, ช่องภาพคงที่) | built-in image_gen สำหรับ Cozypet; แมวสมมติ | — | ภาพสร้างด้วย AI ตามเงื่อนไขบริการของเครื่องมือที่ใช้ | 2026-10-08 | ใช้งาน | Atlas 4×4; mapping ใน src/data/cat-photos.generated.ts; prompt และรายชื่อช่องใน docs/CAT_PHOTO_PROMPTS.md |
| `ai-personas-001-010` … `ai-personas-091-100` | `public/images/personas/adopter-###/…` | โปรไฟล์ บ้าน น้องที่ดูแลอยู่ ของผู้รับดูแลรายบุคคล | สร้างด้วย AI (Codex) ตาม CODEX_IMAGE_PROMPTS.md | — | ตามเงื่อนไขของเครื่องมือ ณ วันที่สร้าง | — | วางแผน | หนึ่งแถวต่อ batch 10 records บุคคลสมมติ `aiGenerated: true` |
| `shelter-photo-###` | `public/images/shelters/shelter-###/…` | การ์ดและโปรไฟล์สถานสงเคราะห์จริง | ภาพจากช่องทางทางการขององค์กร (เครดิต: ชื่อองค์กร) | ลิงก์ต้นทาง | ใช้เพื่องานการศึกษา ไม่ใช่เชิงพาณิชย์ (สิทธิ์เป็นของเจ้าของภาพ) | — | วางแผน | หนึ่งแถวต่อภาพ เลี่ยงภาพที่เห็นหน้าบุคคลชัด ห้ามภาพ QR/เลขบัญชี |
| `sound-synth` | `src/lib/audio/` | เพลงและเสียงประกอบทั้งหมด | สังเคราะห์ด้วย Web Audio API ในโค้ดของโปรเจกต์ | — | ของโปรเจกต์ | — | วางแผน | ไม่มีไฟล์เสียงจากภายนอก ถ้าเพิ่มไฟล์ต้องเป็น CC0 และเพิ่มแถวใหม่ |
| `lib-threejs-gsap` | `package.json` | animation เล่าเรื่องและเอฟเฟกต์ | three.js / GSAP | https://threejs.org · https://gsap.com | MIT (three.js) · ตรวจเงื่อนไข GSAP ณ วันที่ติดตั้ง | — | วางแผน | โหลดแบบ dynamic import |
| `fallback-paw` | `public/images/fallback-paw.svg` | ภาพ fallback | สร้างขึ้นสำหรับ Cozypet | — | ของโปรเจกต์ | — | วางแผน | |
| `story-characters` | `src/features/story/characters/` | animation บท 0–14 (ขนมชั้น ขนมปัง มอคค่า น้องหมา มือคน) | สร้างขึ้นสำหรับ Cozypet (SVG ในโค้ด) | — | ของโปรเจกต์ | — | วางแผน | ออกแบบจากคำบรรยายใน STORYBOARD.md ไม่ trace ภาพ |
| `story-scenes` | `src/features/story/scenes/` | ฉากซอย ห้องคอนโด เมืองยามค่ำ UI ช่องมองภาพ | สร้างขึ้นสำหรับ Cozypet (SVG + shader ในโค้ด) | — | ของโปรเจกต์ | — | วางแผน | ไม่มีตัวอักษร ป้าย ป้ายทะเบียน หรือแบรนด์ในฉาก |
| `app-illustrations` | `src/components/illustrations/` | กล่องพัสดุ ผู้ดูแลยืนยันรับของ ป้ายระดับแต้มน้ำใจ | สร้างขึ้นสำหรับ Cozypet | — | ของโปรเจกต์ | — | วางแผน | |
| `partner-brand-badges` | `src/components/illustrations/brands/` | แบรนด์พันธมิตร A–C (แบรนด์สมมติ) | สร้างขึ้นสำหรับ Cozypet | — | ของโปรเจกต์ | — | วางแผน | ห้ามคล้ายโลโก้แบรนด์จริง |
| `google-signin` | `src/features/auth/GoogleButton.tsx` | ปุ่ม “เข้าสู่ระบบด้วย Google” | Google | แนวทางแบรนด์ของ Google Sign-In (ตรวจ URL ทางการ ณ วันที่ทำ) | ตามแนวทางของ Google | — | วางแผน | ห้ามดัดแปลงโลโก้ G |
| `sdg-icons` | `public/images/sdg/` หรือป้ายข้อความ | โปสเตอร์ สไลด์ รายงาน วิดีโอ | สหประชาชาติ (ถ้าใช้ไอคอนทางการ) | แนวทางการใช้ SDG ของสหประชาชาติ (ตรวจ URL ทางการ ณ วันที่ทำ) | ตามแนวทางของสหประชาชาติ (ใช้เพื่อการศึกษา ไม่ดัดแปลง) | — | วางแผน | ถ้าไม่แน่ใจเงื่อนไข ให้ใช้ป้ายข้อความ “SDG 3” ที่ทำเอง |
| `submission-media` | `public/_generated/`, `out/` (ไม่ commit) | ภาพหน้าจอ ภาพนิ่ง วิดีโอ โปสเตอร์ สไลด์ รายงาน | สร้างจากเว็บ Cozypet ด้วยสคริปต์ของโปรเจกต์ | — | ของโปรเจกต์ | — | วางแผน | ภาพในงานส่งที่มาจาก asset อื่นต้องอ้างแถวของ asset นั้นด้วย |
| `lib-motion` | `package.json` | motion ของ UI (LazyMotion + `m`) | Motion (motion.dev) | https://motion.dev | ตรวจไลเซนส์ ณ วันที่ติดตั้ง (คาดว่า MIT) | — | วางแผน | โหลดเต็มเฉพาะ feature pack ที่ใช้ |
| `howto-phone-model` | `src/features/motion/howto/` | โทรศัพท์ 3 มิติใน Phone Tour | สร้างขึ้นสำหรับ Cozypet (procedural geometry) | — | ของโปรเจกต์ | — | วางแผน | ไม่เหมือนรุ่น/ยี่ห้อใด ไม่มีโมเดลจากภายนอก |
| `tour-cursor-paw` | `src/features/motion/tour/` | เคอร์เซอร์อุ้งเท้าและวงแตะของทัวร์ | สร้างขึ้นสำหรับ Cozypet (SVG) | — | ของโปรเจกต์ | — | วางแผน | |
| `lib-supabase` | `package.json` | บัญชีผู้ใช้และฐานข้อมูล | Supabase | https://supabase.com | ตรวจไลเซนส์ของ `@supabase/ssr` และ `@supabase/supabase-js` ณ วันที่ติดตั้ง | — | วางแผน | ใช้ฝั่ง server เท่านั้น |
| `lib-zod-qrcode` | `package.json` | ตรวจ schema, QR บนโปสเตอร์/สไลด์ | zod / qrcode contributors | https://zod.dev · https://github.com/soldair/node-qrcode | MIT (ตรวจอีกครั้ง) | — | วางแผน | |
| `tool-playwright-ffmpeg` | devDependency / โปรแกรมในเครื่อง | อัดหน้าจอ ส่งออก PDF และ render วิดีโอ | Microsoft Playwright / FFmpeg | https://playwright.dev · https://ffmpeg.org | Apache-2.0 (Playwright) · LGPL/GPL (FFmpeg ใช้เป็นเครื่องมือ ไม่แจกจ่ายไปกับเว็บ) | — | วางแผน | ห้ามใส่ไฟล์ ffmpeg ใน repo |

## ภาพเพิ่มเติมตามคำขอ 8 ต.ค. 2026 (D22)

523 ช่องภาพทั้งหมดแยกจาก mascot 6 expressions: แมว 128 ช่องในตารางเดิม; ตารางนี้อีก 395 ช่อง (ผู้รับดูแล 100 บ้าน 100 สัตว์ที่ไม่ใช่แมว 71 กลุ่มสัตว์ 91 พื้นที่ดูแลสาธิต 20 เจ้าของประกาศ 13) บุคคลเป็นผู้ใหญ่สมมติ ไม่มีภาพเจ้าหน้าที่ขององค์กรจริง ไม่มีข้อความ AI หรือภาพวาดทับรูป; `aiGenerated` และ `creditId` ยังคงอยู่ และหน้า `/about-demo` อธิบายที่มา

เก็บ PNG ต้นฉบับที่ได้จาก image_gen โดยคัดลอกไฟล์ ไม่ผ่านการแก้ raster ใช้ native SVG crop ช่องภาพใน AtlasPhoto.tsx; บ้าน homes-01/02 ใช้ขอบช่องตามภาพจริงและตัด gutter 4px ใน SVG เพื่อไม่เห็นช่องข้างเคียง ขนาด atlas บ้านสองไฟล์คือ 1295×1214 และ 1305×1206 พินใช้รูปชุดเดียวกับโปรไฟล์ ไม่สร้างบุคคลหรือสถานที่ใหม่เมื่อค้นหา

| ID | ไฟล์ใน repo | ใช้ที่ | ที่มา/ผู้สร้าง | URL ต้นทาง | ไลเซนส์ | วันที่ได้มา | สถานะ | หมายเหตุ |
|---|---|---|---|---|---|---|---|---|
| `ai-people-01` | `public/images/people/people-01.png` | ภาพโปรไฟล์ ผู้รับดูแล แชต และหมุดบุคคล | built-in image_gen สำหรับ Cozypet | — | ภาพ AI ตามเงื่อนไขบริการของเครื่องมือ | 2026-10-08 | ใช้งาน | 25 ช่อง จาก adopter-001 ถึง adopter-025; atlas 5×5; ภาพสมมติ ผูก record ID กับช่องภาพคงที่; prompt/mapping ใน docs/GENERATED_MEDIA_PROMPTS.md |
| `ai-people-02` | `public/images/people/people-02.png` | ภาพโปรไฟล์ ผู้รับดูแล แชต และหมุดบุคคล | built-in image_gen สำหรับ Cozypet | — | ภาพ AI ตามเงื่อนไขบริการของเครื่องมือ | 2026-10-08 | ใช้งาน | 25 ช่อง จาก adopter-026 ถึง adopter-050; atlas 5×5; ภาพสมมติ ผูก record ID กับช่องภาพคงที่; prompt/mapping ใน docs/GENERATED_MEDIA_PROMPTS.md |
| `ai-people-03` | `public/images/people/people-03.png` | ภาพโปรไฟล์ ผู้รับดูแล แชต และหมุดบุคคล | built-in image_gen สำหรับ Cozypet | — | ภาพ AI ตามเงื่อนไขบริการของเครื่องมือ | 2026-10-08 | ใช้งาน | 25 ช่อง จาก adopter-051 ถึง adopter-075; atlas 5×5; ภาพสมมติ ผูก record ID กับช่องภาพคงที่; prompt/mapping ใน docs/GENERATED_MEDIA_PROMPTS.md |
| `ai-people-04` | `public/images/people/people-04.png` | ภาพโปรไฟล์ ผู้รับดูแล แชต และหมุดบุคคล | built-in image_gen สำหรับ Cozypet | — | ภาพ AI ตามเงื่อนไขบริการของเครื่องมือ | 2026-10-08 | ใช้งาน | 25 ช่อง จาก adopter-076 ถึง adopter-100; atlas 5×5; ภาพสมมติ ผูก record ID กับช่องภาพคงที่; prompt/mapping ใน docs/GENERATED_MEDIA_PROMPTS.md |
| `ai-homes-01` | `public/images/homes/homes-01.png` | บ้านผู้รับดูแล | built-in image_gen สำหรับ Cozypet | — | ภาพ AI ตามเงื่อนไขบริการของเครื่องมือ | 2026-10-08 | ใช้งาน | 25 ช่อง จาก adopter-001 ถึง adopter-025; atlas 5×5; ภาพสมมติ ผูก record ID กับช่องภาพคงที่; prompt/mapping ใน docs/GENERATED_MEDIA_PROMPTS.md |
| `ai-homes-02` | `public/images/homes/homes-02.png` | บ้านผู้รับดูแล | built-in image_gen สำหรับ Cozypet | — | ภาพ AI ตามเงื่อนไขบริการของเครื่องมือ | 2026-10-08 | ใช้งาน | 25 ช่อง จาก adopter-026 ถึง adopter-050; atlas 5×5; ภาพสมมติ ผูก record ID กับช่องภาพคงที่; prompt/mapping ใน docs/GENERATED_MEDIA_PROMPTS.md |
| `ai-homes-03` | `public/images/homes/homes-03.png` | บ้านผู้รับดูแล | built-in image_gen สำหรับ Cozypet | — | ภาพ AI ตามเงื่อนไขบริการของเครื่องมือ | 2026-10-08 | ใช้งาน | 25 ช่อง จาก adopter-051 ถึง adopter-075; atlas 5×5; ภาพสมมติ ผูก record ID กับช่องภาพคงที่; prompt/mapping ใน docs/GENERATED_MEDIA_PROMPTS.md |
| `ai-homes-04` | `public/images/homes/homes-04.png` | บ้านผู้รับดูแล | built-in image_gen สำหรับ Cozypet | — | ภาพ AI ตามเงื่อนไขบริการของเครื่องมือ | 2026-10-08 | ใช้งาน | 25 ช่อง จาก adopter-076 ถึง adopter-100; atlas 5×5; ภาพสมมติ ผูก record ID กับช่องภาพคงที่; prompt/mapping ใน docs/GENERATED_MEDIA_PROMPTS.md |
| `ai-pets-01` | `public/images/pets/pets-01.png` | ภาพสุนัข/กระต่ายในประกาศ เรื่องราว สแกน และสัตว์รายตัวของผู้รับดูแล | built-in image_gen สำหรับ Cozypet | — | ภาพ AI ตามเงื่อนไขบริการของเครื่องมือ | 2026-10-08 | ใช้งาน | 16 ช่อง จาก listing-006 ถึง adopter-003-pet-2; atlas 4×4; ภาพสมมติ ผูก record ID กับช่องภาพคงที่; prompt/mapping ใน docs/GENERATED_MEDIA_PROMPTS.md |
| `ai-pets-02` | `public/images/pets/pets-02.png` | ภาพสุนัข/กระต่ายในประกาศ เรื่องราว สแกน และสัตว์รายตัวของผู้รับดูแล | built-in image_gen สำหรับ Cozypet | — | ภาพ AI ตามเงื่อนไขบริการของเครื่องมือ | 2026-10-08 | ใช้งาน | 16 ช่อง จาก adopter-006-pet-1 ถึง adopter-041-pet-1; atlas 4×4; ภาพสมมติ ผูก record ID กับช่องภาพคงที่; prompt/mapping ใน docs/GENERATED_MEDIA_PROMPTS.md |
| `ai-pets-03` | `public/images/pets/pets-03.png` | ภาพสุนัข/กระต่ายในประกาศ เรื่องราว สแกน และสัตว์รายตัวของผู้รับดูแล | built-in image_gen สำหรับ Cozypet | — | ภาพ AI ตามเงื่อนไขบริการของเครื่องมือ | 2026-10-08 | ใช้งาน | 16 ช่อง จาก adopter-043-pet-1 ถึง adopter-064-pet-1; atlas 4×4; ภาพสมมติ ผูก record ID กับช่องภาพคงที่; prompt/mapping ใน docs/GENERATED_MEDIA_PROMPTS.md |
| `ai-pets-04` | `public/images/pets/pets-04.png` | ภาพสุนัข/กระต่ายในประกาศ เรื่องราว สแกน และสัตว์รายตัวของผู้รับดูแล | built-in image_gen สำหรับ Cozypet | — | ภาพ AI ตามเงื่อนไขบริการของเครื่องมือ | 2026-10-08 | ใช้งาน | 16 ช่อง จาก adopter-064-pet-2 ถึง adopter-088-pet-1; atlas 4×4; ภาพสมมติ ผูก record ID กับช่องภาพคงที่; prompt/mapping ใน docs/GENERATED_MEDIA_PROMPTS.md |
| `ai-pets-05` | `public/images/pets/pets-05.png` | ภาพสุนัข/กระต่ายในประกาศ เรื่องราว สแกน และสัตว์รายตัวของผู้รับดูแล | built-in image_gen สำหรับ Cozypet | — | ภาพ AI ตามเงื่อนไขบริการของเครื่องมือ | 2026-10-08 | ใช้งาน | 7 ช่อง จาก adopter-088-pet-2 ถึง adopter-097-pet-2; atlas 4×4; ภาพสมมติ ผูก record ID กับช่องภาพคงที่; prompt/mapping ใน docs/GENERATED_MEDIA_PROMPTS.md |
| `ai-shelters-01` | `public/images/shelters/shelters-01.png` | ภาพพื้นที่ดูแลสาธิตในโปรไฟล์ การ์ด และหมุดสถานที่ | built-in image_gen สำหรับ Cozypet | — | ภาพ AI ตามเงื่อนไขบริการของเครื่องมือ | 2026-10-08 | ใช้งาน | 20 ช่อง จาก shelter-001 ถึง shelter-020; atlas 5×5; ภาพพื้นที่สาธิตสมมติ ไม่ใช่สถานที่จริงขององค์กร ไม่มีคน/โลโก้/ป้าย; prompt/mapping ใน docs/GENERATED_MEDIA_PROMPTS.md |
| `ai-pet-groups-01` | `public/images/pet-groups/pet-groups-01.png` | ภาพสัตว์ในบ้านผู้รับดูแล 91 ชุด | built-in image_gen สำหรับ Cozypet | — | ภาพ AI ตามเงื่อนไขบริการของเครื่องมือ | 2026-10-08 | ใช้งาน | 25 ช่อง จาก adopter-001 ถึง adopter-027; atlas 5×5; ภาพสมมติ ผูก record ID กับช่องภาพคงที่; prompt/mapping ใน docs/GENERATED_MEDIA_PROMPTS.md |
| `ai-pet-groups-02` | `public/images/pet-groups/pet-groups-02.png` | ภาพสัตว์ในบ้านผู้รับดูแล 91 ชุด | built-in image_gen สำหรับ Cozypet | — | ภาพ AI ตามเงื่อนไขบริการของเครื่องมือ | 2026-10-08 | ใช้งาน | 25 ช่อง จาก adopter-028 ถึง adopter-055; atlas 5×5; ภาพสมมติ ผูก record ID กับช่องภาพคงที่; prompt/mapping ใน docs/GENERATED_MEDIA_PROMPTS.md |
| `ai-pet-groups-03` | `public/images/pet-groups/pet-groups-03.png` | ภาพสัตว์ในบ้านผู้รับดูแล 91 ชุด | built-in image_gen สำหรับ Cozypet | — | ภาพ AI ตามเงื่อนไขบริการของเครื่องมือ | 2026-10-08 | ใช้งาน | 25 ช่อง จาก adopter-056 ถึง adopter-082; atlas 5×5; ภาพสมมติ ผูก record ID กับช่องภาพคงที่; prompt/mapping ใน docs/GENERATED_MEDIA_PROMPTS.md |
| `ai-pet-groups-04` | `public/images/pet-groups/pet-groups-04.png` | ภาพสัตว์ในบ้านผู้รับดูแล 91 ชุด | built-in image_gen สำหรับ Cozypet | — | ภาพ AI ตามเงื่อนไขบริการของเครื่องมือ | 2026-10-08 | ใช้งาน | 16 ช่อง จาก adopter-083 ถึง adopter-100; atlas 5×5; ภาพสมมติ ผูก record ID กับช่องภาพคงที่; prompt/mapping ใน docs/GENERATED_MEDIA_PROMPTS.md |
| `ai-owners-01` | `public/images/owners/owners-01.png` | ภาพเจ้าของประกาศในแชต | built-in image_gen สำหรับ Cozypet | — | ภาพ AI ตามเงื่อนไขบริการของเครื่องมือ | 2026-10-08 | ใช้งาน | 13 ช่อง จาก owner-001 ถึง owner-013; atlas 4×4; ภาพสมมติ ผูก record ID กับช่องภาพคงที่; prompt/mapping ใน docs/GENERATED_MEDIA_PROMPTS.md |

## สัตว์และพันธุ์เพิ่มเติม (D23)

เพิ่มภาพสัตว์รายตัวอีก 32 ช่อง รวมปัจจุบัน 231 ช่องและภาพทุกประเภท 555 ช่อง แยกจาก mascot 6 ท่า ภาพทุกตัวอยู่ในประกาศสาธิต ID คงที่ ดู [prompt และ mapping](docs/ANIMAL_VARIETY.md)

| creditId | ไฟล์ | ใช้งาน | ผู้สร้าง | ที่มา | สิทธิ์ | วันที่ | สถานะ | หมายเหตุ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `ai-variety-01` | `public/images/variety/variety-01.png` | ประกาศและแกลเลอรี | built-in image_gen สำหรับ Cozypet | — | ภาพ AI ตามเงื่อนไขบริการของเครื่องมือ | 2026-10-08 | ใช้งาน | 16 ช่อง: listing-029…044; แมว 10 และหมา 6; ภาพสมจริง ไม่มีป้ายทับรูป |
| `ai-variety-02` | `public/images/variety/variety-02.png` | ประกาศและแกลเลอรี | built-in image_gen สำหรับ Cozypet | — | ภาพ AI ตามเงื่อนไขบริการของเครื่องมือ | 2026-10-08 | ใช้งาน | 16 ช่อง: listing-045…060; หมา 4 กระต่าย 8 นก 2 หนูตะเภา 1 แฮมสเตอร์ 1; native SVG crop ตามเส้นแบ่งจริง ไม่แก้ PNG |
