# ส่งมอบ D29 / D30 — 14 ตุลาคม 2026

## เว็บและโค้ด

- เว็บหลัก: https://cozypet-iota.vercel.app/
- โค้ดเว็บที่เผยแพร่: commit `4571e667565731936313a44ac50da111a7ad64c4` บน branch `claude/wizardly-cori-i4qnh9`
- Production Ready: `dpl_7FVksxvAu8B1bCza6wnZweCSWqXd` ได้จาก GitHub build/promotion ใช้ Supabase Free / Vercel Hobby ไม่เปิด billing
- ป้าย Critical: `docs/CRITICAL_NOTICE_D30.md` (ภาพ PNG และ WebP ใน `public/media/critical`)
- บัญชี/บ้านพัก/QR/ภาษี: `docs/SHARED_SHELTERS_AND_QR.md`

## หลักฐานที่ตรวจในรอบนี้

- `npm run typecheck` ผ่าน, `npm run lint` ผ่าน ไม่มี error มี warning เดิม 7 รายการ, `npm run build` ผ่าน
- ดูหน้าแรกจริงผ่าน Chrome บน desktop 1440×1000 และ mobile 390×844: ป้าย/รูป/ปุ่มปิดแสดง และ body ของป้ายบนมือถือเลื่อนได้ ภาพ preview ใน `out/d29-preview/` ไม่ commit
- เว็บสาธารณะ `/`, `/shelter/manage`, `/shelters`, `/demo/qr`, `/donation-tax` และภาพป้าย ตอบ 200
- Public API `/api/shelters` อ่านฐานข้อมูลกลางสำเร็จ ปัจจุบันไม่มี record ผู้ใช้ที่เผยแพร่ ยังไม่ได้สร้างข้อมูลแทนมนุษย์
- `/api/shelters?mine=1` เมื่อไม่ Login ตอบ 401
- Google OAuth บนลิงก์จริงส่งต่อไป Supabase แล้ว `accounts.google.com` พร้อม callback ของเว็บหลักและ next `/shelter/manage` ถูกต้อง ขั้นเลือกบัญชี/consent/บันทึกบ้านพักสองบัญชีต้องทำด้วยผู้ใช้จริง ยังไม่ได้รายงานว่า flow นั้นทดสอบเสร็จ
- ย่อภาพ QR ครบ 57 ไฟล์รวมประมาณ 0.95 MB พร้อม manifest ของต้นฉบับ ไม่แก้รูปต้นทาง
- Supabase applied migrations 3 ชุด RLS/Storage bucket ทำงานจาก configuration จริง ชื่อไฟล์ local ตรง version ใน migration history เพื่อไม่ให้ Claude apply ซ้ำ
- การอัปโหลดจาก CLI ถูก Vercel ปฏิเสธ `Not authorized`; GitHub integration สร้าง preview สำเร็จ จึงใช้ CLI promote รุ่นนั้นและตรวจ Production Ready / alias แล้ว

ไม่ได้รัน unit/E2E suite ใหม่ในรอบนี้ ไม่ใช้คำว่า build ผ่านเป็นหลักฐานว่า authentication สองบัญชีหรือการชำระเงินจริงทำงาน

## ทางเข้าของผู้ใช้

1. หน้าแรก → ป้าย Critical (ครั้งแรกของ tab session) → × เพื่อเล่นเว็บ หรือปุ่มช่วยไปแพ็กเกจ เปิดป้ายซ้ำจาก Footer ได้
2. หน้าแรก → เลือกพื้นที่ผู้ดูแล หรือเมนูบัญชี → จัดการบ้านพัก → Login Google/อีเมล → เพิ่มบ้านพัก → บันทึกร่าง → รูป/หมุด → ยืนยันเผยแพร่
3. ทุกคน → บ้านพักของชุมชน `/shelters` หรือค้นหา `/nearby` → หมุด/รายละเอียด ID เดิม อัปเดตเมื่อ refresh/กลับแท็บหรือภายใน 15 วินาทีขณะเปิดหน้า
4. แพ็กเกจหรือกองอาหาร 50/100 → QR ทดลอง → เปิดรูปได้โดยไม่สแกน → ติ๊กเข้าใจ → ฉันชำระเงินแล้ว (ทดลอง) → เครดิตและรายการทดลอง
5. `/donation-tax` → เงื่อนไข/คำนวณสมมติ/พิมพ์สรุป มี watermark ใช้ลดหย่อนจริงไม่ได้

Review/ภาพรับของที่สืบทอดจาก D26 เป็นข้อมูลทดลองประจำ Run/บัญชี; ข้อมูลกลาง D29 คือบ้านพัก รูปบ้านพัก/สัตว์ สถานะเผยแพร่ และข้อความส่วนตัว ไม่เรียกรีวิวทดลองว่าเป็นการยืนยันองค์กรจริง
