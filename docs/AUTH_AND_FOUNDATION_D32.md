# D32 — Auth สาธารณะและเลขมูลนิธิ

อัปเดต 14 ตุลาคม 2026 · งานต่อเนื่องจาก D29–D31

## สาเหตุที่ยืนยันได้

โค้ด Production ส่ง `redirect_to` ไป Vercel อยู่แล้ว แต่ OAuth flow ที่ Supabase สร้างยังมี `referrer=http://localhost:3000`. ดังนั้นการตรวจเฉพาะ 307 ของเว็บยังไม่พิสูจน์ปลายทางที่ Supabase เลือกจริง.

เจ้าของแก้ Authentication → URL Configuration และ Save แล้ว: Site URL `https://cozypet-iota.vercel.app`, Redirect URL `https://cozypet-iota.vercel.app/auth/callback`. ตรวจ flow ใหม่หลัง Save ทั้ง callback ธรรมดาและ callback ที่มี `next` พบ `referrer` เป็น callback บนเว็บสาธารณะทั้งคู่. ตรวจกรณีจำลอง Google ปฏิเสธ consent พบ Supabase 302 → callback สาธารณะ → แอป 307 → `/login` บนโดเมนเดียวกัน.

## กติกา Auth ปัจจุบัน

- `src/lib/public-site.ts` เป็น origin กลาง `https://cozypet-iota.vercel.app`; ไม่มี fallback localhost จาก `SITE_URL` ใน auth source.
- หน้า `/login` และ `/signup` จาก localhost/Preview ไปเว็บสาธารณะก่อนส่งข้อมูลบัญชี; Google button เรียก public endpoint โดยตรง.
- `/api/auth/google` จาก origin อื่นส่งต่อ public endpoint ก่อนสร้าง PKCE verifier cookie. Callback ที่มาผิด origin ส่งต่อ public callbackก่อนแลก code; `/?code=...` recovery ใช้ public callbackด้วย.
- `next` รับเฉพาะ path ภายในและปฏิเสธ control characters/backslash/URL ต่างโดเมน. ค่าไม่ปลอดภัยหรือไม่ได้ระบุกลับ Home `/` ตามคำขอของเจ้าของ.
- ไม่มี key/token/อีเมล/authorization code ในบันทึกตรวจงาน. ไม่ใช้ `code` เก่าหรือย้อนเติม session ให้บัญชีผู้ใช้.

## ID ของมูลนิธิ

เมื่อเลือกประเภทมูลนิธิ ต้องกรอกเลขทะเบียนจำลอง 1–60 ตัวอักษร; ค่า whitespace อย่างเดียวไม่ผ่าน. UI มี required, API ตรวจด้วย `ShelterWrite`, Supabase ตรวจซ้ำผ่าน trigger `shelter_foundation_registration` จึงข้าม API ไปบันทึกโดยตรงก็เว้นเลขไม่ได้.

ตัวอย่างเลขสำหรับสาธิตคือ `DEMO-FND-BKK-2569-0001`; `DEMO-REG-...` เป็น record ID ที่ฐานข้อมูลสร้างแยกให้และมี unique constraint. ทั้งสองเป็นข้อมูลจำลอง ไม่ตรวจสอบกับหน่วยงานและไม่รับรองการจดทะเบียน/สิทธิ์ภาษี. แสดงเลขในหน้าจัดการของเจ้าของและหน้ารายละเอียดหลังเผยแพร่.

Migration `20261014045430_cozypet_required_foundation_registration.sql` ติดตั้งแล้ว เป็นชุดที่ 4 ใน Supabase; local version ตรงกับ migration history. ไม่ต้อง apply ซ้ำ. Record เก่าที่ไม่มีเลขยังอ่านได้ แต่การเขียนครั้งต่อไปของมูลนิธิต้องกรอกเลข. ไม่แก้ข้อมูลผู้ใช้เดิม.

ตรวจ trigger จริง: missing, empty, whitespace และ overlong ถูกปฏิเสธ; เลขสาธิตที่ถูกขนาดผ่าน validation ไปถึง foreign-key check ของบัญชีเจ้าของ. Probe ใช้ owner UUID ที่ไม่มีใน auth.users และไม่สร้าง record ค้างในฐานข้อมูล.

## หลักฐานและขอบเขต

- `npm run lint`: ผ่าน มี warning เดิม 7 รายการ.
- `npm run typecheck`: ผ่าน.
- `npm test`: 9 files, 112 tests ผ่าน รวม localhost/127.0.0.1/IPv6/Preview, start disabled/rate/provider error, callback สำเร็จ/ไม่มี code/หมดอายุ/เครือข่ายล้ม และ external next ที่ซ่อน control characters.
- Production build ใช้ `npm run build` ตามปกติ. แก้ pure-selector ของ CSS Modules: selector ของ Critical anchor และ print chrome ย้ายไป globals; local print classes คงอยู่ใน module.
- Mobile spot-check 360/390px: Home, shelters, listings, profile, login ไม่มี document horizontal overflow; ป้าย Critical ปิดได้และ body เลื่อนภายในได้; skeleton เปลี่ยนเป็นเนื้อหา/empty state หลัง request เสร็จ.
- Supabase public tables 5 ตารางเปิด RLS ทั้งหมด. ตรวจ policy owner สำหรับการเขียน shelter และการอ่านร่าง/ข้อความส่วนตัว; ใช้ Google metadata เฉพาะแสดงชื่อ/รูป ไม่ใช้เป็นสิทธิ์เจ้าของ.
- Security advisor ยังมี warning เดิม: `delete_my_account()` เป็น SECURITY DEFINER ที่ authenticated เรียกได้ตามที่ออกแบบ ตรวจ function ว่าจำกัด `auth.uid()` และ search_path ว่างแล้ว; leaked-password protection ปิดอยู่ ไม่เปิดบริการเสียเงิน. อ่าน [function advisory](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable) และ [password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

การตรวจปลายทาง OAuth และกรณียกเลิกไม่ใช่การเลือกบัญชี Google จริงหรือ proof ว่า session ของเจ้าของแสดงรูปได้; ขั้น consent/session จริงและการเผยแพร่บ้านพักด้วยผู้ใช้สองบัญชียังต้องตรวจด้วยผู้ใช้จริง. ไม่อ้างว่า Motion, Phone Tour หรือ WebGL เสร็จแล้ว.

## Claude ทำต่อ

เริ่มจาก `CLAUDE.md` (นำเข้า AGENTS และ handoff) → README → PROMPT D32/ส่วน Motion/AC → STORYBOARD → MOTION. ใช้ `docs/CLAUDE_MOTION_HANDOFF.md` เป็นรายการสิ่งที่มีและงานที่ยังเหลือ; Supabase/Vercel เชื่อมแล้ว ไม่สร้างโปรเจกต์หรือ apply migration ซ้ำ. ทำ M8.6 ต่อจาก PhoneTourSection ที่ยังคืน null และ WebGL Motion Kit ที่ยังไม่มี implementation.
