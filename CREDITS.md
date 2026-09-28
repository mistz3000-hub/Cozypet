# CREDITS.md — ที่มาและไลเซนส์ของภาพ ฟอนต์ ไอคอน และ animation

ทุก asset ที่ใช้ในเว็บ Cozypet ต้องมีแถวในไฟล์นี้ก่อน merge และ `MediaRef.creditId` ในข้อมูลต้องตรงกับคอลัมน์ ID (ดู PROMPT.md หัวข้อ 10.2 และ 15) หน้า `/about-demo` แสดงข้อมูลจากตารางนี้

## กติกา

- **แหล่งภาพตามประเภท (PROMPT.md D3, D8):**
  - ภาพสัตว์ในประกาศและเรื่องราว → **ภาพถ่ายที่มีสิทธิ์ใช้งาน** (เช่น Unsplash, Pexels, Wikimedia Commons โดยตรวจเงื่อนไขของแต่ละไฟล์ ณ วันที่ดาวน์โหลด)
  - ภาพคน บ้าน น้องที่ persona ดูแลอยู่ และสถานสงเคราะห์ → **ภาพสร้างด้วย AI โดย Codex** ตาม [CODEX_IMAGE_PROMPTS.md](CODEX_IMAGE_PROMPTS.md) บันทึกเป็นแถวต่อ batch และระบุเครื่องมือกับเงื่อนไขการใช้งานภาพ ณ วันที่สร้าง
  - mascot และ wordmark → **ออกแบบเอง** (SVG แยกชิ้นส่วน พื้นหลังโปร่งใส)
  - ฟอนต์ SIL OFL และไอคอนไลเซนส์ MIT/ISC
- **ห้าม:** ดึงรูปจาก Google Images โดยตรง, ใช้/trace ภาพอ้างอิง, ใช้ชื่อ โลโก้ ข้อความ หรือภาพของ PetZen, ภาพที่เห็นหน้าคนหรือป้ายทะเบียนชัดเจน, hotlink จากเว็บอื่น
- ดาวน์โหลดภาพเก็บใน `public/images/` และบันทึก URL ต้นทาง ผู้สร้าง ไลเซนส์ และวันที่
- ถ้าไลเซนส์ต้องให้เครดิต (เช่น CC BY) ต้องแสดงเครดิตในหน้า `/about-demo` ตามรูปแบบที่ไลเซนส์กำหนด
- ถ้าแก้ไขภาพ (ครอป ย่อ ปรับสี) ให้ระบุในคอลัมน์หมายเหตุ

## ภาพอ้างอิงที่ใช้ตอนออกแบบ (ไม่อยู่ในเว็บ)

| ภาพ | ใช้ดู | สถานะ |
|---|---|---|
| ภาพแมวเกาะขอบโต๊ะ | ท่าทางโผล่จากหลังโต๊ะและอุ้งเท้าบนขอบโต๊ะ | ไม่ใช้ในเว็บ ไม่ trace |
| ภาพเว็บ PetZen | โทนครีม/เหลืองทองและการจัดวาง hero | ไม่ใช้ในเว็บ ไม่คัดลอกแบรนด์ |
| ภาพหน้าเว็บยาว | ลำดับ section และแนวการ์ดเรื่องราว | ไม่ใช้ในเว็บ |

**ไม่เพิ่มภาพต้นฉบับลง repo (PROMPT.md D7)** คำอธิบายที่ใช้ทำงานอยู่ใน PROMPT.md หัวข้อ 3.1 แล้ว

## ทะเบียน asset

> แถวที่มีสถานะ **วางแผน** ยังไม่มีไฟล์จริง ผู้ implement ต้องเติม URL ไลเซนส์ และวันที่ให้ครบ แล้วเปลี่ยนสถานะเป็น **ใช้งาน**

| ID | ไฟล์ใน repo | ใช้ที่ | ที่มา/ผู้สร้าง | URL ต้นทาง | ไลเซนส์ | วันที่ได้มา | สถานะ | หมายเหตุ |
|---|---|---|---|---|---|---|---|---|
| `mascot-cat` | `src/components/mascot/CatMascot.tsx`, `public/mascot/cat-static.svg` | Hero, tab bar/dock | สร้างขึ้นสำหรับ Cozypet | — | ของโปรเจกต์ | — | วางแผน | ท่าอ้างอิงจากคำอธิบาย ไม่ trace ภาพ |
| `mascot-dog` | `src/components/mascot/DogMascot.tsx`, `public/mascot/dog-static.svg` | Hero, tab bar/dock | สร้างขึ้นสำหรับ Cozypet | — | ของโปรเจกต์ | — | วางแผน | |
| `wordmark` | `src/components/Wordmark.tsx` | Header, footer | สร้างขึ้นสำหรับ Cozypet | — | ของโปรเจกต์ | — | วางแผน | ห้ามเลียนแบบ PetZen |
| `font-mitr` | ผ่าน `next/font/google` | หัวข้อ, wordmark | Cadson Demak | https://fonts.google.com/specimen/Mitr | SIL OFL 1.1 (ตรวจอีกครั้ง) | — | วางแผน | |
| `font-noto-sans-thai` | ผ่าน `next/font/google` | เนื้อหา | Google / Noto project | https://fonts.google.com/noto/specimen/Noto+Sans+Thai | SIL OFL 1.1 (ตรวจอีกครั้ง) | — | วางแผน | |
| `icons` | `lucide-react` หรือ inline SVG | ไอคอนทั่วไป, ไอคอนเงิน | Lucide contributors หรือสร้างเอง | https://lucide.dev | ISC (ถ้าใช้ Lucide) | — | วางแผน | |
| `district-centers` | `src/data/districts.ts` | จุดกึ่งกลาง 50 เขต (mock) | ระบุแหล่งอ้างอิงเมื่อสร้าง | — | ตามแหล่งที่ใช้ | — | วางแผน | พิกัดโดยประมาณ ปัดทศนิยม 3 ตำแหน่ง |
| `pet-photo-###` | `public/images/pets/…` | ประกาศ, เรื่องราว, รูปตัวอย่างในหน้าสแกน | ภาพถ่ายที่มีสิทธิ์ใช้งาน | — | — | — | วางแผน | เพิ่มหนึ่งแถวต่อภาพ |
| `ai-personas-001-010` … `ai-personas-091-100` | `public/images/personas/adopter-###/…` | โปรไฟล์ บ้าน น้องที่ดูแลอยู่ ของผู้รับดูแลรายบุคคล | สร้างด้วย AI (Codex) ตาม CODEX_IMAGE_PROMPTS.md | — | ตามเงื่อนไขของเครื่องมือ ณ วันที่สร้าง | — | วางแผน | หนึ่งแถวต่อ batch 10 records บุคคลสมมติ `aiGenerated: true` |
| `ai-shelters-001-010`, `ai-shelters-011-020` | `public/images/shelters/shelter-###/…` | ผู้ดูแล ภายนอก พื้นที่ดูแลสัตว์ มุมบริจาค | สร้างด้วย AI (Codex) ตาม CODEX_IMAGE_PROMPTS.md | — | ตามเงื่อนไขของเครื่องมือ ณ วันที่สร้าง | — | วางแผน | สถานที่สมมติ `aiGenerated: true` |
| `fallback-paw` | `public/images/fallback-paw.svg` | ภาพ fallback | สร้างขึ้นสำหรับ Cozypet | — | ของโปรเจกต์ | — | วางแผน | |
