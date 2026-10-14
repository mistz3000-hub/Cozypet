# Claude handoff — Cozypet Motion work

**อัปเดต:** 14 ต.ค. 2026

**งานต่อไป:** ทำ Motion ตาม `MOTION.md` และเกณฑ์ M8.6 ใน `PROMPT.md` โดยเริ่มจาก source ปัจจุบัน ห้ามสร้างระบบหลักหรือ backend ซ้ำ

## สถานะโปรเจกต์และบริการ

- Source of truth: repository [`mistz3000-hub/Cozypet`](https://github.com/mistz3000-hub/Cozypet), branch งาน `claude/wizardly-cori-i4qnh9`.
- เว็บสาธารณะ: [https://cozypet-iota.vercel.app](https://cozypet-iota.vercel.app).
- Vercel project: [`cozy-pet/cozypet`](https://vercel.com/cozy-pet/cozypet), plan Hobby; GitHub repository เชื่อมแล้ว, production branch คือ `main`. งานบน branch อื่นสร้าง Preview; การ promote Production ทำเมื่อเจ้าของสั่ง/อนุมัติตามรอบงาน.
- Supabase project: `Cozypet`, ref `kxecehtzrizrpmrjfcng` ([Dashboard](https://supabase.com/dashboard/project/kxecehtzrizrpmrjfcng)); ใช้ Free plan. Auth/Google provider ถูกตั้งค่าแล้ว, migrations 3 ชุด, RLS และ private Storage bucket `community-shelters` มีบันทึกการติดตั้งใน `docs/D29_D30_DELIVERY.md`.
- Vercel Production มี environment variable `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SITE_URL`; ห้ามพิมพ์/คัดลอก secret หรือเพิ่ม key ใน repo. ตรวจแล้ว `SITE_URL=https://cozypet-iota.vercel.app` และ `/api/auth/google` บนเว็บจริงส่ง callback ไป `https://cozypet-iota.vercel.app/auth/callback?next=%2F`.
- Google OAuth ขั้นสุดท้ายต้องทดสอบโดยเจ้าของจากเว็บ Production เพื่อยืนยันการเลือกบัญชี/consent และ session หลัง callback; ห้ามใช้ URL ที่มี `code` จากการล็อกอินครั้งก่อน เพราะเป็นรหัสใช้ครั้งเดียว.

### หมายเหตุเรื่อง localhost

ล็อกอินที่เริ่มจาก `http://localhost:3000` จะกลับ `localhost` เพราะ development ใช้ origin เดิมเพื่อให้ PKCE cookie ตรง host นี่เป็นพฤติกรรมเฉพาะเครื่องผู้พัฒนา ไม่ใช่ URL สำหรับเพื่อนในห้อง ให้เปิด Production URL ด้านบนแล้วเริ่ม Google login จากที่นั่น ระบบ Production ถูกตรวจแล้วว่าชี้กลับโดเมน CozyPet. อย่าแก้ dev callback ให้ข้ามไป Production เพราะ verifier cookie ของ localhost จะไม่ตามไปด้วย.

## สิ่งที่ทำแล้ว

- เว็บ Next.js ใช้งานได้บน Vercel; Home, scan/search, map mockup, community shelters, dashboard/profile, demo donations/QR, และหน้าเกี่ยวกับข้อมูลจำลองอยู่ใน source ปัจจุบัน (ดู README และ `docs/FEATURE_WALKTHROUGH.md`).
- Supabase Auth สำหรับ Google/email และข้อมูลบ้านพักส่วนกลาง: เจ้าของสร้าง/แก้ร่าง/เผยแพร่/พัก/เก็บถาวรของตัวเอง; ผู้ใช้ทั่วไปอ่าน record ที่เผยแพร่; API ตรวจ session และ RLS คุม owner. รูปเก็บใน bucket ส่วนตัวและเผยแพร่ผ่าน signed URL.
- หน้า Home มี Google profile card สำหรับ session ที่ล็อกอินแล้ว; หน้า `/profile` แสดงตัวตนบัญชีและทางไปตั้งค่าบัญชี/จัดการบ้านพัก. Callback recovery รองรับ Supabase fallback ที่กลับ `/` พร้อม `code`.
- มูลนิธิ: เลือกประเภทมูลนิธิแล้วต้องกรอกเลขทะเบียนที่แจ้งก่อน create/update. เลขนี้เป็นข้อมูลทดลองที่ผู้ใช้กรอกเองและ **ยังไม่ได้ตรวจสอบกับหน่วยงาน**; จะแสดงแก่ทุกคนเมื่อเผยแพร่. `DEMO-REG-...` ยังคงเป็น ID record ที่ระบบสร้าง ไม่ใช่เลขทะเบียน. Field อยู่ใน JSONB เดิม ไม่ต้องเพิ่ม migration. อ่าน `docs/SHARED_SHELTERS_AND_QR.md`.
- Core mascot interactions ที่มีอยู่ ได้แก่เลือกแมว/หมา, reaction หัวใจ, ฉาก scroll เข้าปาก, loading ของภาพจริง และ radar สำหรับฉากค้นหา; รายละเอียด source/spec อยู่ใน `MOTION.md`, `STORYBOARD.md`, `docs/MASCOT_ASSETS.md`.

## Motion: สถานะจริงและงานที่ยังเหลือ

Motion **ยังไม่เสร็จครบตามสเปก**; app/backend/hosting เป็นฐานให้ทำต่อได้ ไม่ต้องเริ่มโครงการใหม่.

- มี dependency `motion`, `three`, `gsap`; มี `src/lib/motion.tsx`, `src/lib/motion-tokens.ts`, lazy feature loaders, `src/features/motion/tour/TourLauncher.tsx` และ `TourHost.tsx` ให้ตรวจและต่อยอด.
- พบ `src/features/motion/howto/PhoneTourSection.tsx` ปัจจุบันคืน `null` และยังไม่พบ implementation ใน `src/features/motion/webgl/`. ห้ามรายงาน Phone Tour หรือ WebGL Motion Kit ว่าทำเสร็จแล้ว.
- ทำ M8.6 ตาม `PROMPT.md` AC-81–AC-89: LazyMotion/bundle split, token parity, reduced-motion, Phone Tour หน้า Home + `/how-to`, WebGL Motion Kit 6 ชิ้น, in-app tours, safe autopilot, `data-tour`/คำแปล TH/EN และ deterministic 32 วินาที `howto` capture.
- ใช้ `MOTION.md` เป็น source of truth เรื่อง tokens, timings, scenes, accessibility, performance และ tour behavior; ใช้ `STORYBOARD.md` สำหรับเนื้อเรื่อง/ภาพ/เสียง. รักษา mascot และ business screens ที่มีอยู่ ห้ามเขียนทับเพื่อทำ tour.
- ทุก state สำคัญต้องอ่านได้ใน DOM; เคารพ `prefers-reduced-motion`; skeleton ใช้เฉพาะรอ data/image decode/request จริง; ห้ามเพิ่ม fake delay, ห้าม autopilot ทำ network/write actions และห้ามให้ tour กดบริจาค/เผยแพร่/บันทึกจริง.
- ไม่ต้องแก้ Supabase schema, provider, Vercel env หรือ billing เพื่อทำ Motion. ข้อมูลธุรกิจ/แผนที่/การชำระเงินยังเป็น demo; ห้ามนำเสนอเป็น transaction หรือองค์กรที่ตรวจสอบจริง.

## ลำดับให้ Claude ทำ

1. อ่าน `AGENTS.md`, `README.md`, `PROMPT.md` (ส่วน 3.6–3.8, 7.19, 16–17), `STORYBOARD.md`, และ `MOTION.md` ก่อนแก้.
2. ตรวจ `git status`, branch และไฟล์ที่มีอยู่; รักษาการแก้ไขของผู้ใช้และอย่าทำ migration ซ้ำ.
3. เริ่ม M8.6 จาก `PhoneTourSection.tsx` ที่เป็น placeholder และเติม WebGL/tour ตาม AC ทีละส่วน; ใช้ component/tokens/types ปัจจุบัน.
4. ตรวจตาม `AGENTS.md` และ `MOTION.md` โดยรายงาน AC ที่ผ่าน/ยังไม่ผ่านแยกกัน; ตรวจ desktop, mobile, reduced motion และการ render how-to ก่อนอ้างว่าเสร็จ.
5. อัปเดต README และเอกสารส่งต่อให้ตรงกับสิ่งที่ทดสอบจริง. Commit/push/deploy เฉพาะเมื่อเจ้าของสั่ง.

## ข้อจำกัดที่ต้องคงไว้

- ไม่ใช้ service-role/secret key ใน client หรือ commit; ไม่เปิด billing.
- ไม่เพิ่มเงินจริง, payment gateway, GPS จริง, AI image matching จริง หรือคำรับรองว่าเลขทะเบียน/บัญชี Google ยืนยันองค์กร.
- ไม่ลบ/แก้ migration history และไม่สร้างโปรเจกต์ Supabase/Vercel ซ้ำ.
