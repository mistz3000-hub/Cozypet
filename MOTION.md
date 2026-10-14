# MOTION.md — Motion Design และ “วิธีใช้งานแบบเคลื่อนไหว”

## D30 — Critical Notice

ใช้ Dialog เดิมกับ tokens/Reduced motion พื้นครีม ขอบมน ภาพสัตว์จริง ปุ่มปิด 44px และ focus trap แสดงหนึ่งครั้งต่อ tab session หลังอ่านข้อมูลกลาง หยุด polling ของป้ายเมื่อปิด Skeleton ของภาพรอ load/decode จริง ไม่มีเวลารอปลอม ป้ายไม่สร้าง donation/request และ autopilot ไม่กดช่วยหรือปิดป้ายเอง ผู้ถ่ายคลิปเปิด/ปิดด้วยมือก่อนเริ่มทัวร์ ดู docs/CRITICAL_NOTICE_D30.md

## D31 — สถานะส่งต่องานให้ Claude (14 ต.ค. 2026)

เว็บและ backend พร้อมเป็นฐานสำหรับ implement Motion ต่อแล้ว แต่ M8.6 ยังไม่เสร็จครบ: `src/features/motion/howto/PhoneTourSection.tsx` ยังคืน `null` และยังไม่มี source ใน `src/features/motion/webgl/`. โปรดเริ่มจาก source จริงและตรวจ AC-81–AC-89 ไม่รายงานตามสเปกอย่างเดียว

Supabase project และ Vercel production เชื่อมแล้ว; D32 แก้หน้า Login/Signup และจุดเริ่ม OAuth จาก localhost/Preview ให้ไปเริ่มที่เว็บสาธารณะก่อนสร้าง PKCE cookie. Callback ใช้ `https://cozypet-iota.vercel.app/auth/callback` เสมอ. ตรวจพบ Supabase เคย fallback ไป localhost และเจ้าของแก้ URL Configuration แล้ว; flow ที่สร้างหลังแก้เลือกโดเมนเว็บจริงทั้งกรณีปกติและกดยกเลิก. รายละเอียดบริการ หลักฐาน ข้อจำกัด และงาน Motion ที่เหลืออยู่ใน [docs/CLAUDE_MOTION_HANDOFF.md](docs/CLAUDE_MOTION_HANDOFF.md) และ [docs/AUTH_AND_FOUNDATION_D32.md](docs/AUTH_AND_FOUNDATION_D32.md).


## เพิ่มเติม 8 ต.ค. 2026 — ภาพสมจริงและฉากปาก

- Hero ใช้ photo mascot ทั้งแมว/หมาอิสระสองตัว หัวใจ 3 ดวงเริ่มเห็นทันที พิกัดกระจายเป็นสัดส่วนของพื้นที่ เพื่อไม่ถูกตัดบนมือถือ และสามารถเล่นใหม่ได้หลังสีหน้าครบ 1 วินาที
- Pet mouth journey ใช้ progress จากตำแหน่ง scroll ของ section ผ่าน requestAnimationFrame แบบพักเมื่ออยู่นอกจอ; ช่วงและขนาดอยู่ใน `pet-journey-config.ts` ไม่จับ scroll/touch ด้วย preventDefault
- ภาพปกติ crossfade เป็นภาพหาวก่อนซูม หน้าจอเว็บถูก clip เป็นวงรีตรงปาก จากนั้นขยายเป็นกรอบมุมมนจนเต็ม sticky stage ปุ่มในหน้าจอกดได้เมื่อเผยแล้ว
- Radar 3 วง + sweep โปร่งใส ระยะรอบ 1,800ms เหลื่อม 600ms ใช้ transform/opacity เท่านั้น `prefers-reduced-motion` แสดงวงนิ่ง หยุดและ unmount เมื่อเสร็จหรือตัดการค้นหา

> **ใช้ทำอะไร:** ต้นฉบับของ (1) ระบบ motion ของ UI ทั้งแอปด้วยไลบรารี **Motion** (motion.dev) (2) ชุด **WebGL Motion Kit** ที่ใช้ซ้ำได้ และ (3) การโชว์วิธีใช้งานแบบเคลื่อนไหว 2 ชั้น: **Phone Tour** (โทรศัพท์ 3 มิติหมุนไปตามการเลื่อนหน้า โชว์ 5 หน้าจอบังคับ) และ **ทัวร์ในแอป** (ไฮไลต์ปุ่มจริงทีละจุด พร้อมโหมด “ให้ Cozypet สาธิต”)
> **ความสัมพันธ์กับเอกสารอื่น:** เนื้อเรื่อง ตัวละคร และเสียงของ animation เล่าเรื่องอยู่ใน [STORYBOARD.md](STORYBOARD.md) ส่วนไฟล์นี้กำหนด **ระบบ motion และวิธีใช้งาน** สเปกเทคนิคกลาง ข้อห้าม และ route อยู่ใน [PROMPT.md](PROMPT.md) หัวข้อ 3.6–3.8, 7.19 เกณฑ์ตรวจรับคือ AC-81–AC-89
> **สถานะ:** สเปกระบบ Motion; มี implementation บางส่วนแล้ว แต่ยังไม่ครบทุกชิ้น (เพิ่ม 1 ต.ค. 2026, D19; ปรับ mascot 8 ต.ค. 2026, D20)
> **อัปเดต mascot 8 ต.ค. 2026 (D20):** แมวใช้ภาพ AI สมจริงแบบ PNG alpha 2 expression ใน `PhotoCatArt.tsx` แยกหัว/ตา/อุ้งเท้าด้วย SVG masks ใช้ smoothing เดิมและ idle blink เปลี่ยน opacity ของภาพตาปิด ตาขยับไม่เกิน 1.2 หน่วย SVG, คลิก/แตะ/คีย์บอร์ดทำท่าหลับตาฟินค้าง **1,000ms** และปล่อยหัวใจสีชมพูขนาด 48/56/48px 3 ดวง ลอยพร้อมขยายแล้วจางใน **1,400ms** เว้น 80ms ต่อดวง กดซ้ำระหว่าง 1,600ms ไม่เพิ่มหัวใจ; reduced motion คงท่าฟิน 1 วินาทีและใช้หัวใจ 1 ดวงจางด้วย opacity ไม่มีการลอย รายละเอียดและ prompt อยู่ใน `docs/MASCOT_ASSETS.md`

## สารบัญ

1. [หลักการและการแบ่งหน้าที่](#1-หลักการและการแบ่งหน้าที่)
2. [Motion tokens](#2-motion-tokens)
3. [แคตตาล็อกการเคลื่อนไหวในแอป](#3-แคตตาล็อกการเคลื่อนไหวในแอป)
4. [WebGL Motion Kit](#4-webgl-motion-kit)
5. [Phone Tour — วิธีใช้งานทีละหน้าจอ](#5-phone-tour--วิธีใช้งานทีละหน้าจอ)
6. [ทัวร์ในแอป](#6-ทัวร์ในแอป)
7. [โครงสคริปต์ทัวร์และ data-tour](#7-โครงสคริปต์ทัวร์และ-data-tour)
8. [การเข้าถึง](#8-การเข้าถึง)
9. [ประสิทธิภาพและงบ](#9-ประสิทธิภาพและงบ)
10. [การทดสอบ](#10-การทดสอบ)

---

## 1. หลักการและการแบ่งหน้าที่

1. **ภาพเคลื่อนไหวต้องอธิบายการทำงาน ไม่ใช่แค่ตกแต่ง** ทุกชิ้นตอบได้ว่า “บอกผู้ใช้ว่าอะไรกำลังเกิด” (สถานะเปลี่ยน อะไรเชื่อมกับอะไร ขั้นต่อไปคืออะไร)
2. **เบา เร็ว ไม่ขวางการใช้งาน** ตามหัวข้อ 3.6 ของ PROMPT.md และไม่มีสิ่งใดต้องรอ animation จบก่อนจึงกดได้
3. **ข้อความไทยเป็น DOM/SVG เสมอ** แม้อยู่ในฉาก 3 มิติ (หัวข้อ 5.3)
4. **ใช้ข้อมูลและ component จริง** หน้าจอที่โชว์ในทัวร์ประกอบจาก component ตัวเดียวกับแอป และข้อมูลจาก `src/data` ห้ามแต่งตัวเลขเพื่อให้ภาพสวย
5. **ทุกชิ้นมีโหมดสำรอง** (reduced motion, ไม่มี WebGL, มือถือสเปกต่ำ) และข้อมูลครบแม้ไม่มีการเคลื่อนไหว

**การแบ่งหน้าที่ (ไลบรารีละหน้าที่ ไม่ซ้ำกัน)**

| ชั้น | เครื่องมือ | ใช้กับ | เหตุผล |
|---|---|---|---|
| UI interaction | **Motion** (`motion`, entry `motion/react`) | transition ของหน้า, layout animation ของรายการ/การ์ด, sheet ที่ลากปิดได้, ตัวชี้แท็บที่เลื่อน, presence ของ toast/pop-up, spring ของปุ่ม, ตัวเลขนับขึ้น, scroll-linked value, spotlight และ coachmark ของทัวร์ | API แบบ declarative เข้ากับ React, spring ที่ให้ความรู้สึกเป็นธรรมชาติ, รองรับ reduced motion |
| Timeline ที่ต้อง **seek ได้** | **GSAP** | animation เล่าเรื่อง (STORYBOARD.md) และ Phone Tour (เพราะต้อง scrub ตามการเลื่อน และ render ทีละเฟรมในโหมดอัดวิดีโอ) | master timeline ที่ตั้งเวลาได้แม่นและ deterministic |
| การเรนเดอร์ 3 มิติ | **three.js** | ตัวเครื่องโทรศัพท์ เอฟเฟกต์ใน WebGL Motion Kit ฉากใน animation | WebGL |
| DOM ในฉาก 3 มิติ | `CSS3DRenderer` ของ three.js (ตรวจ path import ตามรุ่นที่ติดตั้ง) | หน้าจอโทรศัพท์ที่เป็น DOM จริง | ได้ตัวอักษรไทยคมชัดและซิงก์กับกล้อง WebGL |

- ใน Phone Tour ให้ GSAP คุม timeline หลัก (ทั้ง WebGL และ DOM) โดยรับค่า progress จาก scroll ผ่าน Motion `useScroll` ส่วน interaction ของผู้ใช้ (hover, drag, layout, tap) ใช้ Motion
- ห้ามใช้ GSAP กับ UI ธรรมดาและห้ามใช้ Motion คุม timeline ที่ต้อง seek (เพื่อไม่ให้สองไลบรารีแย่งกันควบคุม element เดียวกัน)
- เหตุผลของ dependency (ต้องบันทึกใน README): Motion = UI motion แบบ declarative, GSAP + three.js = ฉาก/timeline ที่ seek ได้ ตรวจไลเซนส์และเงื่อนไขของทั้งหมด ณ วันที่ติดตั้ง
- ใช้ Motion แบบ **LazyMotion + `m`** (ห้าม import `motion` เต็มรูปแบบ) และโหลด feature pack แบบ async (`domAnimation` เป็นค่าตั้งต้น, `domMax` เฉพาะหน้าที่ใช้ `layout` หรือ `drag`) เพื่อไม่ให้ bundle แรกหนัก ตรวจชื่อและ path ตามเอกสารทางการของรุ่นที่ติดตั้ง
- ครอบทั้งแอปด้วย `MotionConfig reducedMotion="user"` และ transition ตั้งต้นจาก tokens

## 2. Motion tokens

แหล่งความจริงเดียวคือ `src/lib/motion-tokens.ts` (TypeScript) และ CSS custom properties ใน `:root` ที่ **ต้องมีค่าตรงกัน** (มี unit test, หัวข้อ 10) ห้าม hard-code ตัวเลขเวลา easing หรือ spring ใน component

**เวลา**

| Token | ค่า | ใช้กับ |
|---|---|---|
| `--cp-dur-instant` | 90ms | ขอบ focus, สีปุ่มเมื่อกด |
| `--cp-dur-quick` | 150ms | hover, toggle, ป้ายสถานะเปลี่ยน, exit ของ presence |
| `--cp-dur-base` | 250ms | การ์ดเข้า, transition ของหน้า, ตัวชี้แท็บ |
| `--cp-dur-slow` | 400ms | พื้นที่ใหญ่ เช่น dialog บน desktop, spotlight ของทัวร์เมื่อ reduced motion ไม่เปิด |
| `--cp-dur-hero` | 700ms | เฉพาะ hero และ Phone Tour |

**Easing**

| Token | ค่า |
|---|---|
| `--cp-ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` (ตัวเดียวกับหัวข้อ 3.6) |
| `--cp-ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` |
| `--cp-ease-in` | `cubic-bezier(0.5, 0, 0.75, 0)` (ใช้กับ exit เท่านั้น) |

**Spring (เฉพาะ TypeScript)**

| ชื่อ | ค่า | ใช้กับ |
|---|---|---|
| `snappy` | `stiffness 520, damping 38, mass 1` | ปุ่ม, ตัวชี้แท็บ, chip |
| `soft` | `stiffness 260, damping 28, mass 1` | sheet, การ์ด, spotlight, coachmark |
| `bouncy` | `stiffness 380, damping 18, mass 1` | อุ้งเท้า หัวใจ ป้ายแต้มน้ำใจ (เล็กและสั้นเท่านั้น) |
| `gentle` | `stiffness 120, damping 24, mass 1` | ทำให้ค่า scroll เนียนใน Phone Tour |

**ระยะและสเกล:** เข้าหน้า 8px · การ์ด 16px · sheet 24px · hover ยกขึ้น 2px · กดปุ่ม scale 0.97 · pop 0.92 → 1 · **stagger 40ms** ต่อรายการ (สูงสุด 8 รายการ เกินนั้นรวมเวลาไม่เกิน 320ms)

## 3. แคตตาล็อกการเคลื่อนไหวในแอป

กติการวม: animate เฉพาะ `transform`, `opacity` และ `filter` (blur ≤ 8px) ส่วนการเปลี่ยนขนาด/ตำแหน่งของรายการให้ใช้ `layout` ของ Motion (จำกัดรายการที่ animate พร้อมกัน ≤ 30) ห้าม animate `width/height/top/left` ตรง ๆ

| # | จุดใช้ | การเคลื่อนไหว | เทคนิค (Motion) | เมื่อ reduced motion |
|---|---|---|---|---|
| 1 | ทุกหน้า | เข้า: จาง + เลื่อนขึ้น 8px (`base`) **เฉพาะตอนเข้า** ไม่มี exit ของหน้า เพื่อไม่ให้การกดเมนูช้าลง | `app/template.tsx` + `m.div` | จางอย่างเดียว 90ms |
| 2 | tab bar / dock | ตัวชี้แท็บ (pill) เลื่อนไปแท็บใหม่ | `layoutId` + spring `snappy` | สลับทันที |
| 3 | ปุ่มและชิป | hover ยก 2px, กด scale 0.97 | `whileHover` `whileTap` | ไม่ยก ไม่ย่อ เปลี่ยนสีอย่างเดียว |
| 4 | รายการผลลัพธ์ `/nearby`, `/listings` | เมื่อกรอง/เรียงใหม่ การ์ดเลื่อนไปที่ใหม่ ตัวที่หายจางออก ตัวที่เพิ่มเข้า stagger | `layout` + `AnimatePresence` | ปรากฏ/หายทันที |
| 5 | แผนที่ ↔ การ์ด | เลือกการ์ดแล้วหมุดเด้ง (`bouncy`) และวงเรืองรอบหมุดขยาย 1 ครั้ง | `animate()` + `layoutId` ของวงเน้น | ขอบหนาขึ้นทันที |
| 6 | ป้ายระดับสถานะ | เมื่อเปลี่ยน (รับได้ → ใกล้เต็ม → เต็ม) ป้ายเก่าจางออกเลื่อนขึ้น ป้ายใหม่เข้า | `AnimatePresence mode="wait"` | สลับทันที |
| 7 | แถบความจุ/เสบียง/ความคืบหน้า | เติมจาก 0 ถึงค่าจริง (`slow`) | `animate` ของ `scaleX` (origin ซ้าย) | แสดงค่าจริงทันที |
| 8 | ตัวเลขบนแดชบอร์ด ยอดจำลอง แต้มน้ำใจ | นับขึ้นจาก 0 ถึงค่าจริง 700ms (ค่าจริงจากข้อมูลเท่านั้น) | `animate(0, v, { onUpdate })` + `Intl.NumberFormat` | แสดงค่าจริงทันที |
| 9 | pop-up แนะนำ (7.11) | มือถือ: sheet เลื่อนขึ้น (`soft`) ลากลงเพื่อปิดได้ (ลากเกิน 25% หรือเร็วกว่า 500px/s) · desktop: dialog scale 0.96 → 1 + จาง | `drag="y"` + `dragConstraints` + `onDragEnd` | โผล่ทันที ปิดด้วยปุ่ม |
| 10 | การ์ดแนะนำใน pop-up | เข้าทีละใบ stagger 40ms ตามอันดับ | `variants` + `staggerChildren` | ปรากฏพร้อมกัน |
| 11 | แผง “เบื้องหลัง” | แถบปัจจัยแต่ละอันเติมตามน้ำหนัก ตัวเลข % นับขึ้น | ข้อ 7 + ข้อ 8 | แสดงทันที |
| 12 | แชต | bubble เด้งเข้า (`soft`) · ติ๊ก “อ่านแล้ว” จางเข้า · จุด “กำลังพิมพ์” เด้งเหลื่อมกัน 120ms · ปุ่ม “ข้อความใหม่ ↓” เด้งเข้า | `m.div` + `variants` | จางเข้า จุดนิ่ง |
| 13 | ยืนยันส่งต่อน้อง (7.6) | การ์ดเลื่อนขึ้นจากช่องพิมพ์ รูปสองรูปเข้าหากันด้วย spring หัวใจเด้งกลาง (ชิ้นกระจายเป็น WebGL `HeartBurst`) | `m` + `animate` sequence | การ์ดจางเข้าอย่างเดียว |
| 14 | timeline คำสั่งจำลอง (7.12) | ขั้นที่ถึงแล้วติ๊กด้วยวงขยาย + เส้นเชื่อมวาดต่อ (`pathLength`) | `m.path` + `pathLength` | ติ๊กทันที |
| 15 | toast | เข้าจากล่าง (`soft`) ค้าง 4 วินาที ออก 150ms ปัดข้างเพื่อปิดได้ | `AnimatePresence` + `drag="x"` | จางเข้า/ออก |
| 16 | mascot switch (6.4) | ตัวเดิมย่อหลังโต๊ะ ตัวใหม่โผล่ (250–350ms) | `AnimatePresence` + `animate` | crossfade ≤ 120ms |
| 17 | หน้าแรก | hero parallax เล็กน้อยตาม scroll, ลิงก์ header เปลี่ยนเป็นแบบย่อเมื่อเลื่อน, การ์ด 3 ขั้นตอนเข้าตอนเข้าจอ | `useScroll` + `useTransform` + `whileInView` (`once`) | ไม่ parallax แสดงทันที |
| 18 | ทัวร์ในแอป | spotlight เลื่อนไปยังเป้าหมายด้วย spring, coachmark เข้า/ออก, เคอร์เซอร์อุ้งเท้า (หัวข้อ 6) | `animate` + `AnimatePresence` | spotlight ย้ายทันที ไม่มีเคอร์เซอร์ |

## 4. WebGL Motion Kit

ชุดเอฟเฟกต์ 3 มิติที่ใช้ซ้ำได้ อยู่ใน `src/features/motion/webgl/` ทุกชิ้นเป็นคลาสที่มี `mount(scene)`, `setProgress(t: 0..1)` (ให้ timeline คุมได้), `setQuality('high'|'low')` และ `dispose()` ใช้ seeded RNG (`src/lib/seeded-random.ts`) เพื่อให้เรนเดอร์ซ้ำได้เหมือนเดิม **เป็นภาพประกอบเท่านั้น** ข้อมูลหรือสถานะที่ต้องรู้ต้องมีใน DOM ด้วยเสมอ

| ID | ชื่อ | หน้าตาและการเคลื่อนไหว | งบ (high / low) | ใช้ที่ | ถ้าไม่มี WebGL |
|---|---|---|---|---|---|
| `PawTrail` | รอยเท้าประกาย | รอยอุ้งเท้าเล็ก ๆ เรืองสีทองโผล่ตามเส้นทางหรือตำแหน่ง pointer แล้วจางใน 700ms | 40 / 16 ชิ้น | hero, Phone Tour ขั้น 1, ตอนแตะในทัวร์ | จุด CSS |
| `NoticeSwirl` | ประกาศปลิว | ใบประกาศกระดาษ (ไม่มีตัวอักษร) หมุนวนเป็นเกลียวช้า ๆ พร้อม depth of field | 300 / 80 ใบ | STORYBOARD บท 0/10, Phone Tour ขั้น 2 | พื้นไล่สีนิ่ง |
| `RadarSweep` | เรดาร์กวาด | วงแหวนสีทองแผ่ + กรวยแสงกวาดรอบจุดค้นหา หมุดโผล่ทีละจุดเมื่อถูกกวาดผ่าน | 1 mesh (shader) | `/nearby` ตอนค้นหา, Phone Tour ขั้น 3, STORYBOARD บท 7 | วงนิ่ง + ข้อความสถานะ |
| `WaterColumns` | คอลัมน์ระดับน้ำ | แท่งกระจกเติม “น้ำ” แสดงความจุ/ความแออัด ระดับขึ้นลงด้วย spring ผิวน้ำมีคลื่นเบา ระดับเท่ากันเมื่อกระจายสมดุล | 20 คอลัมน์ | `/insights`, STORYBOARD บท 7, Phone Tour ขั้น 4 | แท่ง SVG |
| `RouteFlow` | เส้นทางไหล | ริบบิ้นเรืองแสงไหลตามเส้นโค้ง (CatmullRom) จากจุดต้นทางไปปลายทางที่แนะนำ มีหัวลูกศรอุ้งเท้า | ≤ 3 เส้น | pop-up แนะนำ, STORYBOARD บท 7/8, Phone Tour ขั้น 4–5 | เส้น SVG ประ |
| `HeartBurst` | หัวใจและรอยเท้ากระจาย | ชิ้นหัวใจ/รอยเท้าพุ่งจากจุดหนึ่งตามแรงโน้มถ่วงเบา ๆ แล้วจาง | 24 / 10 ชิ้น | ยืนยันส่งต่อน้อง, แต้มน้ำใจ, Phone Tour ขั้น 5 | หัวใจ 1 ดวง จางด้วย opacity |

- **หนึ่งหน้าเปิด WebGL context ไม่เกิน 2 อัน** และหยุด render เมื่อออกนอกจอหรือแท็บถูกซ่อน (กติกาหัวข้อ 3.7)
- สี: ใช้ tokens ของแบรนด์ (ทอง ครีม เหลืองเนย พีช) สีสถานะ (เขียว/เหลือง/แดง) ใช้ตาม `--cp-pin-*` เสมอและมี DOM label กำกับ
- แสงกะพริบ: ห้ามเกิน 3 ครั้ง/วินาที และเอฟเฟกต์ที่วนต้องช้ากว่า 1 Hz

## 5. Phone Tour — วิธีใช้งานทีละหน้าจอ

### 5.1 ภาพรวม

โทรศัพท์ 3 มิติกลางจอ **หมุนและเอียงตามการเลื่อนหน้า** โชว์ 5 หน้าจอบังคับของแอป (Login/Profile → Home/Dashboard → Main Function → AI/Smart Function → Result/Recommendation) ทุกขั้นมีเคอร์เซอร์อุ้งเท้าแตะให้ดู ข้อความอธิบายว่าเทคโนโลยีทำงานอย่างไร (ตัวบอก INPUT/PROCESS/OUTPUT) และปุ่ม “ลองจริง” ที่พาไปหน้าจริง

**ใช้ที่ไหน**
1. หน้าแรก ใน section “ช่วยน้องได้ใน 3 ขั้นตอน” ต่อจาก animation เล่าเรื่อง (id `how-to-use` เป็นส่วนย่อยของ section เดิม ไม่นับเป็น section ที่ 7) เป็นแบบ **pinned + scroll-scrub**
2. หน้า **`/how-to`** เต็มหน้า (ลิงก์ในโปสเตอร์และสไลด์) มีทั้งโหมดเลื่อน และโหมด **เล่นอัตโนมัติ** (ปุ่มเล่น/หยุด, Space) และแถบเลือกขั้น
3. **`/film?cut=howto`** สร้างคลิป 32.0 วินาที (วนได้) ไว้ใช้ในสไลด์ (SUBMISSION.md หัวข้อ 6 สไลด์ 8) และไฟล์ `cozypet-howto.mp4`

### 5.2 ไทม์ไลน์ (32.0 วินาที = 12 ห้อง ที่ 90 BPM)

1 ห้อง = 2.667 วินาที 1 จังหวะ = 0.667 วินาที ทุกขั้นเริ่มตรงต้นห้อง **เคอร์เซอร์แตะที่เวลา “เริ่มขั้น + 4.0 วินาที”** (ห้องที่สอง จังหวะที่ 3) แล้วหน้าจอเปลี่ยน 0.3 วินาทีหลังแตะ

| ช่วง | เวลา (ห้อง) | ขั้น | ท่าโทรศัพท์ (yaw / ตำแหน่ง desktop) | หน้าจอ (DOM, หัวข้อ 5.3) | เคอร์เซอร์ | WebGL (Motion Kit) | ข้อความ TH / EN | IPO |
|---|---|---|---|---|---|---|---|---|
| intro | 0.0–2.7 (1) | เริ่ม | 0° / กลาง · พุ่งขึ้นจากล่างจอ (`soft`) | โลโก้ Cozypet | — | `PawTrail` เบา ๆ | “ใช้งานยังไง? 5 หน้าจอ” / “How it works: 5 screens” | — |
| 1 | 2.7–8.0 (2) | **เข้าสู่ระบบ / โปรไฟล์** | 0° → 0° / ขวา | `/login` แล้วเปลี่ยนเป็นการ์ดทักทาย | แตะปุ่มเล็ก “ทดลอง Demo” | `PawTrail` ตามเคอร์เซอร์ | “เข้าสู่ระบบ หรือกดทดลอง Demo ได้ทันที” / “Sign in, or just try the demo” | INPUT: บัญชี หรือโหมดทดลอง |
| 2 | 8.0–13.3 (2) | **หน้าหลัก / แดชบอร์ด** | −14° / ซ้าย | แดชบอร์ด: ทางลัด 4 ไทล์ เคสเร่งด่วน ยอดจำลอง | แตะไทล์ “หาที่รับน้อง” | `NoticeSwirl` ความหนาแน่นต่ำด้านหลัง | “เลือกสิ่งที่อยากทำ เห็นเคสเร่งด่วนทันที” / “Pick what you want to do and see urgent cases at a glance” | OUTPUT: เคสเร่งด่วน + ยอดจำลอง |
| 3 | 13.3–18.7 (2) | **ฟังก์ชันหลัก: ค้นหา** | +10° / ขวา | `/nearby`: กล่อง “เล่าให้ AI ช่วยสรุป” (พิมพ์ข้อความตัวอย่างทีละตัว) → ชิปโผล่ → แผนที่หมุดสีสถานะ | แตะ “ให้ AI ช่วยสรุป” | `RadarSweep` หมุดโผล่ตามการกวาด | “เล่าเป็นภาษาพูด ระบบสรุปเป็นข้อมูล แล้วค้นหา” / “Describe it naturally; it becomes search filters” | INPUT → PROCESS: ข้อความ + จุดค้นหาตัวอย่าง |
| 4 | 18.7–24.0 (2) | **AI / Smart Function** | −8° / ซ้าย | แผนที่ + pop-up “ที่นี่เต็มแล้ว — ลองที่นี่แทนไหม?” การ์ดแนะนำ 3 ใบ + ชิปเหตุผล + แผง “เบื้องหลัง” | แตะหมุดสีแดง แล้วแตะ “ดูเบื้องหลัง” | `WaterColumns` + `RouteFlow` ไปหมุดเขียว | “ที่ใกล้สุดเต็ม ระบบแนะนำที่ที่ยังรับได้ พร้อมเหตุผล” / “Nearest place is full, so it suggests places with space, and says why” | PROCESS: Smart Load Balancer (น้ำหนักจาก `balancer-config.ts`) |
| 5 | 24.0–29.3 (2) | **ผลลัพธ์ / คำแนะนำ** | +14° / ขวา | `/helpers/[id]`: ความจุ แถบเสบียงสีแดง ปุ่ม “ส่งแพ็กเกจของใช้ (จำลอง)” → timeline 4 ขั้นติ๊ก → “+แต้มน้ำใจ” | แตะ “ส่งแพ็กเกจของใช้ (จำลอง)” | กล่องพัสดุ 3 มิติลอยตาม `RouteFlow` เข้าจอ → `HeartBurst` | “ส่งของไปถึงคนที่ต้องการที่สุด ติดตามได้ทุกขั้น (คำสั่งจำลอง)” / “Send supplies to where they’re needed, tracked at every step (simulated)” | OUTPUT: คำสั่งจำลอง + timeline |
| outro | 29.3–32.0 (1) | จบ | 0° / กลาง · ค่อย ๆ กลับ | โลโก้ + ข้อความ | — | `PawTrail` เบา ๆ | “ลองด้วยตัวเอง” + ปุ่ม **“ทดลอง Demo”** และ **“เริ่มทัวร์ในแอป”** | — |

- **ตัวบอก IPO** เป็นชิป 3 ช่อง “INPUT · PROCESS · OUTPUT” ขั้นที่ทำงานอยู่เป็นพื้นทอง อีกสองช่องจาง และมีข้อความตัวเลขอธิบายใต้ชิป
- **ค่าจริงเท่านั้น:** น้ำหนักปัจจัย ตัวเลขความจุ และข้อความบนหน้าจอมาจาก `balancer-config.ts` และ fixture ใน `src/data` (ผู้รับดูแลรายบุคคลที่เต็มและที่ว่างที่เลือกต้องมีอยู่จริงตาม fixture ใน PROMPT.md หัวข้อ 10.3) ห้ามพิมพ์ตัวเลขลงในสคริปต์ทัวร์ตรง ๆ
- ป้ายเล็กใต้โทรศัพท์: “หน้าจอย่อจากแอปจริง ข้อมูลตัวอย่าง”

### 5.3 โทรศัพท์และหน้าจอ

- **ตัวเครื่อง (WebGL):** ออกแบบเอง ไม่เหมือนรุ่นหรือยี่ห้อใด `RoundedBoxGeometry` ขอบมน 56px (สัดส่วน 9:19.5) สีครีม `--cp-bg-alt` ด้าน matte, ขอบปุ่มสีทอง, กล้องหน้าเป็นจุดเล็ก, เงาตกพื้นนุ่ม, แสง 3 จุด (key อุ่นจากซ้ายบน, fill ครีมจากขวา, rim ทองจากหลัง) ไม่มีโมเดลจากภายนอก (สร้างจากโค้ด)
- **หน้าจอ (DOM จริง):** ใช้ `CSS3DRenderer` ของ three.js วางองค์ประกอบ DOM ขนาด 390×844 (logical px) ทับหน้าจอโทรศัพท์โดยซิงก์กับกล้องเดียวกัน จึงได้ **ตัวอักษรไทยคมชัดตลอดการหมุน** และไม่ฝ่าฝืนกติกา “ห้าม render ไทยใน WebGL”
  - หมุนได้ไม่เกิน **±28° (yaw)** และ ±10° (pitch) เพื่อไม่ให้เห็นด้านหลังและไม่ต้องจัดการการบังกันระหว่าง DOM กับ WebGL
  - ชั้น DOM ตั้ง `pointer-events: none` และ `aria-hidden="true"` (เป็นภาพประกอบ) เนื้อหาเดียวกันมีใน **รายการข้อความของแต่ละขั้น** ที่อ่านได้และใช้กับ screen reader (หัวข้อ 8)
  - หน้าจอประกอบจาก **presentational component ตัวเดียวกับหน้าจริง** (เช่น `StatusBadge`, `HelperCard`, `WhyPanel`, `SupplyBar`) ใน `src/features/motion/howto/screens/` พร้อมข้อมูลจาก `src/data` ไม่เรียก network ไม่อ่าน/เขียน storage
- **กล้อง:** FOV 28° ถอยหลัง dolly ช้า ๆ ระหว่างขั้น (z 6.0 → 5.4) มี depth of field เบา ๆ ที่พื้นหลัง
- **พื้นหลัง:** ไล่สีครีม → เหลืองเนยตามขั้น + ชิ้นกระดาษและรอยเท้าลอย ≤ 60 ชิ้น (instanced)

### 5.4 การคุมด้วย scroll และปุ่มควบคุม

- ส่วนที่ pin สูง `7 × 70vh` บน desktop (intro + 5 ขั้น + outro) และ `7 × 55vh` บนมือถือ stage ใช้ `position: sticky` ที่ `top: header height`
- `scrollYProgress` (Motion `useScroll`) → `useSpring(gentle)` → `timeline.progress(v)` ของ GSAP master timeline จึงเลื่อนไป-กลับได้เนียน และกระโดดข้ามขั้นได้
- **จุดขั้น 5 จุด** (`role="tablist"` มี `aria-label`) กดแล้วเลื่อนไปต้นขั้น (`behavior: 'smooth'` หรือทันทีเมื่อ reduced motion) ใช้ ←/→ เปลี่ยนขั้น (เมื่อโฟกัสอยู่ในแถบ)
- ปุ่ม **“ข้ามไปใช้งานเลย”** (ไป `/login`) และ **“เริ่มทัวร์ในแอป”** (หัวข้อ 6) อยู่ในส่วนนี้ตลอด
- เสียง: ใช้เสียง UI เดิม (ป๊อป, ติ๊ก, chime) เฉพาะเมื่อผู้ใช้เปิดเสียงไว้ ไม่มีเพลงในโหมด scroll (เพลงมีเฉพาะ `/film?cut=howto`)

### 5.5 โหมดสำรอง

| สถานการณ์ | สิ่งที่แสดง |
|---|---|
| ไม่มี WebGL / context หลุด | โทรศัพท์เป็น DOM + CSS 3D (`perspective: 1200px; transform: rotateY(var(--yaw)) rotateX(var(--pitch))`) ซึ่ง **GSAP ขับค่าตัวแปร CSS เดียวกัน** พื้นหลังเป็น SVG รอยเท้า ใช้หน้าจอ DOM ชุดเดิม |
| `prefers-reduced-motion` | ไม่ pin ไม่หมุน แสดง 5 การ์ด (โทรศัพท์แบน + ข้อความ + IPO + ปุ่ม “ลองจริง”) เรียงแนวตั้ง |
| มือถือสเปกต่ำ / ประหยัดพลังงาน | โหมด `low` ของ Motion Kit, DPR ≤ 1.25, ปิด depth of field, ชิ้นพื้นหลัง ≤ 24 |
| JavaScript ยังโหลดไม่เสร็จ | การ์ด 5 ขั้นแบบนิ่ง (server-rendered) |

## 6. ทัวร์ในแอป

### 6.1 ภาพรวม

ปุ่ม **“วิธีใช้”** (ไอคอน ? + ข้อความ) ใน header ทุกหน้า เปิดทัวร์ของ **หน้าปัจจุบัน** (page tour 2–6 ขั้น) หรือกด “ทัวร์ทั้งแอป” เพื่อเล่นตามลำดับ **แดชบอร์ด → สแกน → ค้นหา → แพ็กเกจของใช้ → จำลองสถานการณ์** (ประมาณ 2 นาที) ทัวร์ **ไม่ขวางการใช้งานจริง**: ไฮไลต์ปุ่มจริงด้วย spotlight ผู้ใช้กดปุ่มนั้นเองได้ทุกเมื่อ

- **ไม่เริ่มเอง** ครั้งแรกที่เข้าหน้าหลังเริ่ม Run/เข้าสู่ระบบ จะมีการ์ดเล็ก “อยากให้พาดูวิธีใช้ไหม” (ปิดได้ จำค่า “ไม่ต้องถามอีก” ใน `tourState`) ห้าม auto-start เสียงหรือภาพเคลื่อนไหวใด ๆ
- ลัด: กด `?` (เมื่อโฟกัสไม่ได้อยู่ในช่องพิมพ์) เปิดทัวร์ของหน้านั้น

### 6.2 ส่วนประกอบและพฤติกรรม

| ส่วน | รายละเอียด |
|---|---|
| **Spotlight** | ชั้นมืดความทึบ 45% สี `--cp-ink` ด้วย SVG `mask` เจาะรูตามกรอบเป้าหมาย (`getBoundingClientRect` + padding 8px, รัศมีตามเป้าหมาย ≥ 16px) Motion เลื่อน/ปรับขนาดรูด้วย spring `soft` ชั้นนี้ `pointer-events: none` จึงกดปุ่มจริงได้ |
| **Coachmark** | การ์ดกว้างสูงสุด 320px (มือถือ: ติดล่างเหนือ tab bar เต็มความกว้างลบ gutter) หัวข้อ ข้อความไม่เกิน 2 ประโยค ตัวนับ “2/5” ปุ่ม **“ย้อนกลับ” “ต่อไป” “ข้ามทัวร์”** วางตำแหน่งอัตโนมัติ (บน/ล่าง/ข้าง) และพลิกเมื่อชนขอบจอ มีลูกศรชี้เป้าหมาย |
| **ชนิดขั้น** | `explain` (ผู้ใช้กด “ต่อไป”) · `try` (รอผู้ใช้ทำตามจริง เช่น กดหมุด แล้วไปต่ออัตโนมัติ โดยมีปุ่ม “ต่อไป” และ “ข้ามขั้นนี้” เสมอ) · `demo` (มีปุ่ม **“ให้ Cozypet สาธิต”**) |
| **เคอร์เซอร์อุ้งเท้า** | SVG อุ้งเท้า 28px สีทอง `--cp-gold-500` ขอบ `--cp-ink` 2px เงานุ่ม เคลื่อนตามเส้นโค้ง Bézier ที่คำนวณด้วยฟังก์ชัน deterministic `cursorAt(t)` (`src/lib/tour/path.ts`) ใช้ spring `soft` ตอนเข้าเป้า แตะ: scale 1 → 0.85 → 1 (`bouncy`) + วงคลื่น 24 → 64px จางใน 450ms + `PawTrail` 3 ชิ้น ใช้ตัวเดียวกันกับ Phone Tour |
| **การเลื่อนหน้า** | ก่อนไฮไลต์ `scrollIntoView({ block: 'center' })` (smooth หรือทันทีตาม reduced motion) แล้วรอตำแหน่งนิ่ง (ResizeObserver + 200ms) ถ้าไม่พบเป้าหมายหรือถูกซ่อนภายใน 1.5 วินาที **ข้ามขั้นนั้นเงียบ ๆ** (ไม่แสดง error) |
| **การนำทาง** | ทัวร์ทั้งแอปเปลี่ยนหน้าด้วย `router.push` แล้วรอเป้าหมายแรกของหน้านั้น ผู้ใช้กดย้อนกลับของเบราว์เซอร์ได้ ทัวร์จะหยุดและไม่พาไปเอง |
| **การปิด** | “ข้ามทัวร์”, Esc, หรือจบทัวร์ → คืนโฟกัสไปที่ปุ่ม “วิธีใช้” และบันทึก `tourState.completedPages` ทัวร์จบแล้วเริ่มใหม่ได้เสมอ |

### 6.3 สคริปต์ของแต่ละหน้า (ข้อความร่าง)

ข้อความทุกข้อมาจาก i18n (`tour.*` ใน `th.ts`/`en.ts`) ไม่เกิน 2 ประโยค ใช้ศัพท์ตามหัวข้อ 2 ของ PROMPT.md ตัวเลขในข้อความต้องมาจากข้อมูลจริง (ใส่ผ่าน placeholder)

| หน้า | ขั้น (`data-tour`) | ชนิด | TH | EN |
|---|---|---|---|---|
| `/dashboard` | `dash-shortcuts` | explain | “เริ่มจากเลือกสิ่งที่อยากทำ: เจอน้อง หาที่รับน้อง ส่งของ หรืออยากรับเลี้ยง” | “Start by choosing what you want to do: found a pet, find a place, send supplies, or adopt.” |
| | `dash-urgent` | explain | “การ์ดสีแดงคือเคสเร่งด่วน มาจากเสบียงที่ใกล้หมดหรือประกาศที่ติดความเร่งด่วน (ข้อมูลสาธิต)” | “Red cards are urgent cases: supplies running out or time-sensitive notices (demo data).” |
| | `dash-total` | explain | “ยอดนี้เป็นยอดจำลองจากข้อมูลสมมติ ไม่ใช่ยอดจริง” | “This total is simulated from sample data, not real figures.” |
| | `dash-why` | try | “กด ‘ดูเบื้องหลัง’ เพื่อดูว่าระบบคำนวณจากอะไร” | “Tap ‘Behind the scenes’ to see what the system calculated from.” |
| `/scan` | `scan-upload` | explain | “ถ่ายหรือเลือกรูป รูปอยู่ในเครื่องคุณเท่านั้น ไม่ถูกอัปโหลด” | “Take or pick a photo. It stays on your device and is never uploaded.” |
| | `scan-case` | explain | “เลือกกรณี demo ที่อยากลอง ผลจะเป็นไปตามกรณีที่เลือก” | “Choose a demo case. The result follows the case you pick.” |
| | `scan-note` | explain | “นี่คือสแกนจำลอง ไม่ได้ใช้ AI วิเคราะห์ภาพจริง และไม่พบไม่ได้แปลว่าไม่มีเจ้าของ” | “This scan is simulated, with no real image AI. Not found never means no owner.” |
| `/nearby` | `nearby-assist` | demo | “เล่าสถานการณ์เป็นภาษาพูด แล้วระบบสรุปเป็นตัวกรองให้ แก้เองได้เสมอ” | “Describe the situation in your own words and it becomes filters you can edit.” |
| | `nearby-sort` | explain | “เรียงแบบ ‘แนะนำ’ ใช้ Smart Load Balancer ที่ว่างตามสัดส่วน ระยะ และความเร่งด่วน” | “‘Recommended’ uses the Smart Load Balancer: space, distance, and urgency.” |
| | `nearby-legend` | explain | “สีและรูปทรงของหมุดบอกระดับ: รับได้ ใกล้เต็ม เต็ม ตำแหน่งเป็นจุดตัวอย่าง ไม่ใช่ GPS” | “Pin colour and shape show Has space, Almost full, or Full. Locations are samples, not GPS.” |
| | `nearby-full-pin` | demo | “ลองแตะที่ที่เต็ม ระบบจะเสนอที่ที่ยังรับได้” | “Tap a full place and the system suggests places that still have space.” |
| | `nearby-popup` | explain | “การ์ดแนะนำพร้อมเหตุผลจากข้อมูลจริง เป็นคำแนะนำ ไม่ใช่การรับประกันว่ารับน้องได้” | “Each suggestion shows reasons from real data. It is a recommendation, not a guarantee.” |
| | `nearby-why` | try | “เปิด ‘ดูเบื้องหลัง’ เพื่อเห็นน้ำหนักและค่าของแต่ละปัจจัย” | “Open ‘Behind the scenes’ to see each factor’s weight and value.” |
| `/helpers/[id]` | `helper-status` | explain | “ระดับสถานะคำนวณจากความจุ ข้อมูลของสถานสงเคราะห์จริงเป็นข้อมูลสาธิตเสมอ” | “Status comes from capacity. Figures for real shelters are always demo data.” |
| | `helper-supplies` | explain | “แถบเสบียงบอกว่าของใช้เหลือประมาณกี่วัน (เฉพาะผู้รับดูแลรายบุคคล ข้อมูลสาธิต)” | “The supply bar shows roughly how many days of supplies remain (individual caregivers only, demo data).” |
| | `helper-actions` | explain | “คำขอทุกชนิดเป็น ‘รอการติดต่อ (demo)’ ไม่ใช่การอนุมัติ” | “Every request stays ‘waiting for contact (demo)’. Nothing is approved.” |
| `/chat/[id]` | `chat-read` | explain | “ข้อความของคุณขึ้น ‘อ่านแล้ว’ ก่อนคำตอบ คุยกับผู้ช่วย AI หรือบทสนทนาตัวอย่าง ไม่ใช่คนจริง” | “Your message shows ‘Read’ before the reply. You’re talking to an AI assistant or sample chat, not a real person.” |
| | `chat-quick` | explain | “กดคำถามสำเร็จรูปเพื่อส่งทันที” | “Tap a quick reply to send it right away.” |
| | `chat-handoff` | explain | “คุยกันแล้วกด ‘ยืนยันส่งต่อน้อง (จำลอง)’ แอปตรวจเงื่อนไขจากข้อมูล ไม่ใช่ AI ตัดสิน” | “After chatting, tap ‘Confirm handoff (simulated)’. The app checks the data; the AI doesn’t decide.” |
| `/donate` | `donate-notice` | explain | “คำสั่งจำลอง ไม่มีการเก็บเงินหรือจัดส่งจริง แบรนด์พันธมิตรเป็นแบรนด์สมมติ” | “Simulated orders: no money is taken and nothing ships. Partner brands are fictional.” |
| | `donate-targets` | explain | “รายการเรียงตามความขาดแคลน ความแออัด และความเป็นธรรม ผู้ที่เพิ่งได้รับแพ็กเกจจะลดอันดับลง” | “Ranked by scarcity, crowding, and fairness. Someone who just received a package moves down.” |
| | `donate-transparency` | explain | “ดูว่าส่วนแบ่งมาจากแบรนด์ ผู้บริจาคไม่เสียค่าธรรมเนียมเพิ่ม (ตัวอย่าง)” | “See that the platform share comes from the brand; donors pay no extra fee (example).” |
| | `donate-confirm` | explain | “ปุ่มนี้สร้างคำสั่งจำลองและเริ่ม timeline ติดตาม ขั้นชำระเงินปิดในเดโม” | “This button creates a simulated order and starts the tracking timeline. Payment is disabled in the demo.” |
| `/insights` | `insights-controls` | explain | “เลือกสถานการณ์แล้วกดจำลอง 30 วัน” | “Pick a scenario and run the 30-day simulation.” |
| | `insights-chart` | explain | “เทียบแบบเดิมกับ Smart Load Balancer นี่คือการจำลองด้วยข้อมูลสมมติ ไม่ใช่ผลจริง” | “Compares the old way with the Smart Load Balancer. This is a simulation on made-up data, not real results.” |

หน้าอื่นที่ไม่มีสคริปต์ ให้ปุ่ม “วิธีใช้” ลิงก์ไป `/how-to`

### 6.4 โหมด “ให้ Cozypet สาธิต” (autopilot)

ผู้ใช้กดปุ่มในขั้นชนิด `demo` แล้วเคอร์เซอร์อุ้งเท้าทำให้ดูบนปุ่มจริง

- **ปลอดภัยโดยการออกแบบ:**
  - ทำได้เฉพาะ action กับ element ที่มี `data-tour-safe="true"` (เปลี่ยนเฉพาะสถานะ UI เช่น เปิด pop-up เปลี่ยนการเรียง เปิดแผงเบื้องหลัง) element อื่นจะถูกปฏิเสธ (dev: โยน error · production: ข้ามขั้น)
  - **ไม่ส่งฟอร์ม ไม่สร้างหรือแก้ record ใด ๆ ไม่เรียก `/api/*` และไม่เขียน storage** ยกเว้น `tourState`
  - การสรุปข้อความในขั้น `nearby-assist` ใช้ **กฎคำสำคัญในเบราว์เซอร์ (`assistMode: 'rules'`)** จึงไม่กินโควตา AI ที่ใช้ร่วมกัน และไม่บันทึกลง `searchHistory` (ขั้นจบก่อนปุ่ม “ใช้ค่านี้ค้นหา”)
  - ขั้น `donate-confirm` และปุ่มส่งใด ๆ **หยุดก่อนกดเสมอ** เคอร์เซอร์ชี้แล้วอธิบายเท่านั้น
- **คืนสถานะ:** เมื่อไปขั้นถัดไปหรือออกจากทัวร์ ปิด pop-up/แผงที่เปิดไว้และล้างข้อความที่พิมพ์ในกล่อง assist
- **ข้อความตัวอย่างที่พิมพ์:** “เจอลูกแมวสามสีตัวเล็ก ตาแฉะนิดหน่อย อยู่ปากซอยคนเดียว” (ความเร็ว 60ms/ตัวอักษร) และ `nearby-full-pin` เลือกหมุด “เต็ม” แรกจากผลค้นหาปัจจุบัน ถ้าไม่มี ให้ข้ามขั้นพร้อมข้อความ “ผลค้นหานี้ยังไม่มีที่ที่เต็ม ลองเปลี่ยนเขตดูนะ”
- ผู้ใช้ขยับเมาส์ กด หรือแตะระหว่างสาธิตแล้วหยุดทันที ส่งการควบคุมคืนผู้ใช้

## 7. โครงสคริปต์ทัวร์และ data-tour

types อยู่ใน `src/lib/types.ts` (PROMPT.md หัวข้อ 10.2) ข้อมูลสคริปต์อยู่ใน `src/lib/tour/scripts.ts` (ไม่มีข้อความ มีเฉพาะคีย์ i18n)

```ts
export interface TourStep {
  id: string;                        // 'nearby-assist'
  route: string;                     // '/nearby'
  target: string;                    // ค่า data-tour เช่น 'nearby-assist'
  kind: 'explain' | 'try' | 'demo';
  placement?: 'auto' | 'top' | 'bottom' | 'left' | 'right';
  titleKey: string;                  // 'tour.nearby.assist.title'
  bodyKey: string;                   // 'tour.nearby.assist.body'
  ipo?: 'input' | 'process' | 'output';
  advanceOn?: 'click-target';        // เฉพาะ kind 'try'
  action?: { type: 'tap'; safeTarget: string } | { type: 'type'; safeTarget: string; textKey: string };
  motionKit?: 'PawTrail' | 'RadarSweep' | 'WaterColumns' | 'RouteFlow' | 'HeartBurst';
}
export interface TourState {
  dismissedHint: boolean;            // กด “ไม่ต้องถามอีก”
  completedPages: string[];          // route ที่ดูจบแล้ว
  updatedAt: string;
}
```

- `src/lib/tour/targets.ts` เป็นรายการ `data-tour` ที่อนุญาตพร้อม route ทุก component ที่เป็นเป้าหมายต้องใส่ `data-tour="<id>"` และ element ที่ autopilot แตะได้ใส่ `data-tour-safe="true"`
- ใช้ผ่าน `TourProvider` (state machine: `idle → locating → showing → (demoing) → done`) และ hook `useTour()`
- ทุก page tour ไม่เกิน **6 ขั้น** และทัวร์ทั้งแอปรวม ≤ 24 ขั้น
- สคริปต์ Phone Tour ใช้โครงเวลาเดียวกับหัวข้อ 5.2 (`src/features/motion/howto/timeline.ts`) และใช้ฟังก์ชัน `cursorAt(t)` ตัวเดียวกับทัวร์ในแอป

## 8. การเข้าถึง

- **ไม่พึ่งการเคลื่อนไหว:** ทุกขั้นของ Phone Tour มีข้อความ ชิป IPO และปุ่ม “ลองจริง” เป็น DOM ปกติเรียงตามลำดับการอ่าน (ซ่อนด้วยภาพไม่ได้ ใช้ได้กับ screen reader) ส่วนตัวโทรศัพท์และหน้าจอย่อเป็นภาพประกอบ (`aria-hidden`) พร้อม `figcaption` บอกสรุปสั้น ๆ
- **reduced motion:** ปิด pin/หมุด 3 มิติ, layout animation, parallax, เคอร์เซอร์อุ้งเท้า, WebGL ที่วนซ้ำ ทัวร์ยังใช้ได้ครบด้วย spotlight ที่ย้ายทันที ค่านี้ได้จาก `useReducedMotion()` และ CSS `prefers-reduced-motion` พร้อมกัน
- **ทัวร์:**
  - coachmark เป็น `role="dialog"` `aria-modal="false"` `aria-labelledby` หัวข้อ โฟกัสไปที่หัวข้อ (`tabindex="-1"`) เมื่อเปิดแต่ละขั้น และวน Tab ภายใน coachmark (Esc ออก) มีปุ่ม **“ไปที่ปุ่มจริง”** ที่ย้ายโฟกัสไปยังเป้าหมาย เพื่อผู้ใช้คีย์บอร์ดที่ต้องการกดเอง
  - ประกาศ “ขั้น 2 จาก 5: …” ผ่าน `aria-live="polite"` (ไม่ประกาศซ้ำเมื่อ spotlight เลื่อน)
  - ←/→ เปลี่ยนขั้น, Esc ปิด, `?` เปิด, และคืนโฟกัสไปที่ปุ่ม “วิธีใช้”
  - ขนาดตัวอักษรของ coachmark ≥ 16px รองรับซูม 200% และเป้าหมายแตะ ≥ 44×44px
- **ความปลอดภัยต่อผู้ไวต่อแสง:** ไม่มีแฟลชเต็มจอใน Phone Tour และทัวร์ รอยคลื่นและหัวใจช้ากว่า 1 Hz
- **เสียง:** ปิดเป็นค่าเริ่มต้น เริ่มหลังผู้ใช้กดเท่านั้น และทุกเหตุการณ์ที่มีเสียงมีภาพบอกด้วย

## 9. ประสิทธิภาพและงบ

| รายการ | งบ |
|---|---|
| JS ที่เพิ่มใน bundle แรกของหน้าแรก | Motion core (LazyMotion + `m`) เท่านั้น three.js, GSAP, `domMax` และโค้ดทัวร์โหลดแบบ dynamic import เมื่อ section เข้าจอหรือผู้ใช้กด “วิธีใช้” |
| เฟรมเรต | desktop 60 fps · มือถือระดับกลาง ≥ 30 fps ถ้าต่ำกว่าต่อเนื่อง 2 วินาที สลับ `low` อัตโนมัติ |
| Phone Tour | DPR ≤ 2 (มือถือ ≤ 1.5), draw call ≤ 80, ชิ้นพื้นหลัง ≤ 60, texture ≤ 8 MB รวม, dispose ทุกอย่างเมื่อออกจากหน้า |
| layout animation | ≤ 30 รายการพร้อมกัน เกินนั้นใช้ fade เฉยๆ |
| ทัวร์ | เปิดไม่เกิน 150ms หลังกดปุ่ม (โหลด chunk ล่วงหน้าเมื่อ hover/focus ปุ่ม “วิธีใช้”) |
| หยุดเมื่อไม่เห็น | IntersectionObserver + `visibilitychange` หยุดทั้ง GSAP timeline, rAF และ render loop |

## 10. การทดสอบ

| ทดสอบ | วิธี | AC |
|---|---|---|
| tokens ตรงกัน | unit test อ่าน `motion-tokens.ts` เทียบกับค่า CSS custom properties ใน `:root` (เวลา easing) และตรวจว่า component ไม่มีค่าเวลา/easing ที่ hard-code (grep ในไฟล์ `.tsx`/`.module.css`) | AC-82 |
| ใช้ Motion ถูกวิธี | lint/grep: ห้าม import `motion` เต็มรูปแบบนอก `src/lib/motion.ts` ต้องใช้ `m` ภายใต้ `LazyMotion` | AC-81 |
| ความถูกต้องของสคริปต์ทัวร์ | unit test: ทุก `target` มี `data-tour` ในซอร์ส, ทุก `*Key` มีใน `th.ts` และ `en.ts`, ข้อความ ≤ 2 ประโยค, page tour ≤ 6 ขั้น, ทุก `action.safeTarget` มี `data-tour-safe` | AC-88 |
| autopilot ปลอดภัย | unit/integration: mock `fetch` และ spy storage ระหว่างเล่น autopilot ทุกขั้น ต้องไม่มีการเรียก network และไม่มีการเขียน key อื่นนอกจาก `tourState` | AC-87 |
| deterministic | `cursorAt(t)` และ timeline Phone Tour ให้ค่าเดิมทุกครั้ง; `film:render --cut howto` สองรอบได้ hash เฟรมที่ t = 5, 15, 25 วินาทีเท่ากัน | AC-89 |
| Phone Tour | M: เลื่อนไป-กลับทั้ง desktop และมือถือ, โหมดไม่มี WebGL (บังคับ), reduced motion, ซูม 200% | AC-84, 85, 83 |
| ทัวร์ในแอป | M: ทุก page tour บน 360px และ 1280px, ย้ายโฟกัสและคีย์บอร์ด, เป้าหมายไม่พบ → ข้าม | AC-86 |


### การเปลี่ยน reduced motion ระหว่างเปิดหน้า

PetMouthJourney ใช้ matchMedia + useSyncExternalStore เพื่อเปลี่ยนรูปแบบทันทีเมื่อ prefers-reduced-motion เปลี่ยน ไม่ต้องรีโหลด: ปิดฉาก sticky/zoom แสดงภาพนิ่งและเปิดลิงก์ในหน้าเว็บ ส่วนภาพ mini mascot และรูปโปรไฟล์คงเดิม

## D25 — เลื่อนเข้าปากอัตโนมัติและหัวใจเหนือหัว

### D29 — ผู้ดูแลสถานที่และ QR

ใช้กรอบ PetFrame/PetStat และ T.switch เดิม ข้อมูลส่วนกลางและสร้าง QR แสดง skeleton ระหว่าง request จริง รูปสุ่มผูกกับ onLoad/decode ไม่ตั้ง timeout สถานะเผยแพร่และยอดบริจาคอัปเดตหลัง server/การยืนยันจริงในเดโมเท่านั้น QR เปิดรูปสัตว์เป็น scene ใหม่ที่ใช้ได้โดยไม่ต้องสแกน หยุดทัวร์ก่อนปุ่มเขียนข้อมูลทุกปุ่ม ดู docs/SHARED_SHELTERS_AND_QR.md

### D28 — กล่องยอดสมทบและเสียงลูบสัตว์

- กองอาหารใช้ PetFrame/PetStat ชุดเดียวกับ Profile Credit อุ้งเท้าสลับด้วย T.switch; reduced motion เปลี่ยนทันที การสลับสัตว์ไม่สร้าง loading ปลอมหรือเปลี่ยนยอด
- การ์ดเร่งด่วนและ CSR ใช้แถว grid แบบ stretch, รูป 16:9 และพื้นที่ action ที่ดันลงท้าย body ทุกใบ ชื่อและบรรทัดเสบียงต่างกันได้ ปุ่มต้องตรงกันภายในแถวทั้งกรณีสอง/สามใบ
- ขณะกดสัตว์ใช้เสียงบันทึกจริง CC0 สั้นราว 1 วินาที ผูกกับ reaction/หัวใจเดิม ไม่ผูกกับ hover หรือการเลื่อนหน้า โหลดหลังเปิด Sound on เท่านั้น มี cache และ fade หัวท้าย ปิดเสียง/สลับตัว/ออกจากหน้าต้องหยุด source และ invalidate การโหลดค้าง ใช้ภาพเดิมครบเมื่อ mute/reduced motion ไม่มีเพลงเพิ่ม

### D27 — การ์ด Profile Credit และซองจดหมาย

- กรอบโปรไฟล์ใช้รอยอุ้งเท้า SVG: แมวมีนิ้วกลมและไม่มีเล็บ หมาอุ้งเท้ากว้างและมีเล็บเล็ก ๆ ตาม mascot ใน demoSession เดียวกับแถบล่าง ไม่เปลี่ยนยอด/ประวัติเมื่อสลับสัตว์
- รอยอุ้งเท้าสลับด้วย opacity ผ่าน LazyMotion/m + T.switch (400ms ease-in-out); reduced motion เปลี่ยนทันที รอยตกแต่ง aria-hidden และ pointer-events none ไม่บังปุ่ม/ข้อความ
- ซองรับของใช้ SVG วาดในโค้ด พื้นครีม มีตราอุ้งเท้าแมว/หมาและซีลตามสัตว์ที่เลือก ปรากฏด้วย T.slow (opacity/translateY/rotate); reduced motion ไม่ขยับ ไม่ใช่สถานะกำลังโหลด
- การ์ดเร่งด่วนเป็น flex column และ actions มี margin-top auto ภาพอัตราส่วนเดียวกันแบบ cover เพื่อให้ปุ่มและขอบล่างตรงกันเมื่อข้อมูลทรายแมวต่างกัน

### D26 — โมเดลรายได้และชุมชน

ต่อยอด UI/วิดีโอจาก [BUSINESS_DEMO.md หัวข้อ 9](docs/BUSINESS_DEMO.md#9-motion-และ-video-สำหรับ-claude): ตัวเลขกองอาหาร, timeline แบ่งเงิน, แบนเนอร์, CSR, กระดานรับของ และเครดิตส่วนตัว ใช้ tokens/reduced motion เดิม ไม่ animate layout property หรือหน่วง skeleton ปลอม ทุกปุ่มที่เปลี่ยน record ต้องหยุดก่อนยืนยันใน autopilot

- คำสั่งล่าสุด: ฉากหาวเริ่มเมื่อเลื่อนมาถึง โดยไม่มีหัวข้อสอนเลื่อน ปุ่มเปิด/หยุด หรือสวิตช์ซ้ำในฉาก ใช้สวิตช์ที่แถบล่างร่วมกันต่อไป
- ฉากนี้ตาม scroll ของผู้ใช้ทั้ง desktop/touch โดยเปิด MotionConfig เฉพาะฉากเพื่อให้เลื่อนเข้าปากได้ทันที ไม่ใช้ timer เล่นแทนการเลื่อน ไม่ล็อก scroll และไม่เปลี่ยน route อัตโนมัติ
- เริ่มติดตามเมื่อ section เข้าถึงกลาง viewport; ปรับขอบปากเป็น radial mask ที่ขอบนุ่ม พร้อมภาพสัตว์ใหญ่ขึ้น เงาและแสงครีม เว็บไซต์ข้างในจัดระยะใหม่ และขยายเต็มพื้นที่ต่อเนื่อง
- หัวใจเริ่มเหนือหัว 3 ดวงขนาด 26–36px ทยอยออกห่างกัน 110ms แยกลอยขึ้น 76px และแผ่ออกแต่ละทิศทาง มี fade ช่วงท้าย 1,350ms หน้าฟินยังคง 1,000ms โหมดลดการเคลื่อนไหวใช้ 2 ดวงลอยขึ้นเบา ๆ 38px ก่อน fade ไม่หมุนหรือแผ่ออก ใช้ MotionConfig เฉพาะอนุภาคเพื่อให้การลอยที่ผู้ใช้สั่งด้วยการกด/แตะยังเห็นได้
- ข้อกำหนดนี้แทนส่วน D24 ที่ให้กดเปิดฉาก reduced motion และหัวใจดวงใหญ่บนหน้าผาก; ระบบ skeleton ตามโหลดจริงและ cache ใช้ต่อ

## D24 — หัวใจ การสลับสัตว์ และการโหลดจริง (8 ต.ค. 2026)

- หน้าแรกแสดงสัตว์หลักทีละตัว ใช้ค่า mascot เดียวกับสวิตช์ด้านล่างและฉากเข้าปาก แก้ข้อกำหนดเก่าที่ให้วางแมวและหมาคู่กัน
- กดหรือแตะสัตว์: หน้าฟินค้าง 1,000ms หัวใจ SVG สีชมพูสามดวงลอยขึ้น 1,400ms; reduced motion แสดงหัวใจนิ่งพร้อม opacity โดยไม่อาศัย CSS keyframes ที่ถูกย่อเหลือ 0.01ms การกดซ้ำไม่ทำให้ timer ชุดก่อนลบหัวใจชุดใหม่
- สวิตช์ใช้แถบเลือกเลื่อน 400ms ด้วย EASE.inOut; โหมดลดการเคลื่อนไหวเปลี่ยนโดยไม่เลื่อน
- Skeleton ผูกกับการโหลดและ decode รูปจริง ใช้ cache กลางเพื่อไม่ให้แสดงซ้ำเมื่อภาพพร้อมแล้ว; route loading ใช้ Suspense ของ Next.js ไม่ตั้ง timeout เพื่อแกล้งโหลด
- ฉากเข้าปากใช้ scroll progress ที่กรองด้วย spring และมีปุ่มเปิดฉากเฉพาะเมื่อผู้ใช้เลือก reduced motion; การเปิดเป็นความสมัครใจเฉพาะฉากและหยุดกลับภาพนิ่งได้
- ไม่บังคับเลื่อน ไม่เปลี่ยน route อัตโนมัติ ไม่ใช้ skeleton กับการเปลี่ยนค่าท้องถิ่นที่เสร็จทันที
- คำตอบแชตแสดง typing ระหว่าง request จริงและแสดงคำตอบทันทีเมื่อได้ผล ลบเวลารอจำลองในฟอร์มประกาศและคำขอ ผู้ช่วยสรุปแสดง skeleton ระหว่าง request จริง; radar สแกนและ finding ยังคงเป็นฉากสาธิตตามขอบเขต prototype
- หัวใจใช้ usePetReaction/PetHearts ชุดเดียวกันสำหรับ hero และสัตว์ในฉากหาวขณะยังไม่ซูม ปากใช้สัดส่วน ellipse กับขนาด viewport คำนวณพื้นที่เว็บให้พอดีก่อนขยายเต็มหน้า

## D23 — Dropdown และแกลเลอรี (8 ต.ค. 2026)

- Popup dropdown เปิดด้วย opacity + translateY 4px + scale 0.98 → 1 ใช้ T.quick (150ms) และ design tokens เดิม กรอบมน 18px ตัวเลือกมน 12px เลือกแล้วพื้น butter กับ check สีทอง ไม่ใช้เมนู native ของระบบปฏิบัติการ
- reduced motion ขึ้นรายการทันที ไม่มีการเลื่อน/ขยาย; chevron ปิด transition ตาม media query
- วัดจากปุ่มจริงแล้ว clamp ภายใน visual viewport เว้นขอบ 12px และห่างปุ่ม 8px; เปิดขึ้นด้านบนเมื่อด้านล่างมีพื้นที่น้อย มี max-height 320px กับ scroll ภายใน ตัวเลือกชื่อยาวตัดบรรทัดได้
- คีย์บอร์ด: Enter/Space เปิดและเลือก, ↑/↓ ย้าย active, Home/End ไปต้น/ท้ายเมื่อเปิด, พิมพ์นำหน้าค้นตัวเลือก (เก็บคำ 700ms), Escape ปิด dropdown ก่อน dialog, Tab ออกจากช่อง ไม่มี focus trap ในรายการ
- โฟกัสคงบน combobox ใช้ aria-activedescendant/listbox/option/aria-selected, Field label เชื่อมกับปุ่มจริง; hidden native select ไม่รับ Tab และ data-tour อยู่บนปุ่มเท่านั้น
- Touch: แตะเลือก เลื่อนรายการตามปกติ ไม่ใช้ pointer hover ของนิ้วเพื่อขยับ active/scroll โดยไม่ตั้งใจ
- แกลเลอรีใหม่ใช้ภาพนิ่งสมจริง hover ยกการ์ด 4px ด้วย --cp-dur-quick; reduced motion งดการยกการ์ด ปุ่มชนิดสัตว์ใช้ aria-pressed และลิงก์ไปประกาศจริงใน demo
