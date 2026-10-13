# D30 — ป้ายประกาศเคส Critical

## พฤติกรรม

- แสดงครั้งแรกที่เปิดเว็บใน session ของแท็บ ใช้ `sessionStorage` key `cozypet:critical-notice:session:v1` ไม่ผูกกับบัญชีหรือ Run ไม่เพิ่ม API billing
- อ่านข้อมูลกลางก่อนตัดสินใจเปิด หาก API unavailable ยังมีเคสสาธิตเดิมที่อ่านได้ ไม่แกล้งว่าฐานข้อมูลสำเร็จ ไม่มี sleep/fake loading
- ใช้ Smart Load Balancer `rankDonationTargets` เดิม แสดงสูงสุด 3 สถานพักพิงสมมติ/ชุมชนที่เปิดรับแพ็กเกจ มีอาหาร/ทรายระดับ critical หรือความจุเต็ม ไม่อ้างองค์กรจริงมีวิกฤต
- รูปเป็นภาพ campaign สมมติ ชื่อสถานที่ เขต จำนวน/ความจุ และอาหารเป็น DOM จาก record/effectiveSupplies ไม่ฝังเลขเก่าในภาพ
- ปิดได้จาก × ขนาด 44px, Esc, backdrop หรือ “ขอดูเว็บก่อน” คืน focus ด้วย Dialog เดิม; ใช้ tokens และ reduced motion
- ปุ่ม “ดูเคสนี้” ไปหน้า detail ของ ID นั้น ปุ่มช่วยส่งแพ็กเกจไป checkout ไม่สร้างหรือยืนยันยอดจากป้าย
- หลังปิด ไม่เปิดซ้ำขณะเปลี่ยน route/refresh ใน session เดิม กด Footer → “เปิดป้ายเคส Critical” ได้ทุกเมื่อ แท็บใหม่เริ่ม session ใหม่ตามพฤติกรรมเบราว์เซอร์ (duplicate tab บางเบราว์เซอร์คัดลอก session)
- ภาพใช้ WebP ที่ optimize จากต้นฉบับ PNG และ skeleton เฉพาะตอนภาพยังไม่ load/decode; polling ของป้ายหยุดเมื่อปิด
- สำหรับ Motion/Video ผู้ถ่ายเปิด/ปิดป้ายด้วยมือ ไม่ให้ autopilot กดสร้าง record หรือ checkout

## ไฟล์

- UI: `src/features/business/CriticalNotice.tsx`, `critical-notice.module.css`
- Shell: `AppProviders.tsx`, ปุ่มเปิดซ้ำใน `Footer.tsx`
- ภาพต้นฉบับ: `public/media/critical/cozypet-critical-notice.png`
- ภาพเว็บ: `public/media/critical/cozypet-critical-notice.webp`
- ข้อความ TH/EN: `src/i18n/community-th.ts`, `community-en.ts`

## Prompt ภาพ (built-in image_gen)

Create one premium website campaign illustration for the Thai animal welfare prototype CozyPet: a warm, photorealistic ginger domestic cat and a young golden retriever sitting closely together, gentle eyes looking toward the viewer, fine natural fur texture and realistic proportions. Landscape 3:2 composition, animals placed across the lower centre and right with generous clean ivory cream negative space across the upper third. Beside them a small empty ceramic food bowl and a plain kraft food parcel without text or brand. Soft cream, pale buttery yellow and muted peach palette, natural warm window light, a tasteful curved cream paper notice board backdrop, tiny embossed paw prints and a small soft coral heart seal as accents. Kind, inviting and hopeful, elegant editorial photography blended with a minimal paper campaign backdrop for an urgent shelter help announcement. All animals are fictional visual subjects, no actual shelter or organization is depicted. No lettering, no numbers, no logos, no watermark, no interface buttons: the website will place accessible live Thai headings, case data and close/action buttons over and below this art. No cartoon rendering, no human figures, no injury, no dramatic distress. Make the finished landscape asset polished and suitable for a rounded cream modal on both desktop and mobile.
