# เปิด CozyPet ให้คนอื่นเล่น

## สถานะที่ตรวจเมื่อ 12 ตุลาคม 2026

- Repository `mistz3000-hub/Cozypet` เป็น Public อยู่แล้ว
- `https://mistz3000-hub.github.io/Cozypet/` ตอบ 404 จึงยังไม่มีเว็บที่เล่นได้ที่ URL นี้
- เวอร์ชันล่าสุดในเครื่องเปิดด้วย `npm run dev -- --hostname 127.0.0.1 --port 3010`
- Production build ของสำเนาโค้ดปัจจุบันผ่าน คำสั่ง `npm run build` รวมขั้น TypeScript ของ Next.js; ไม่ได้รันชุดทดสอบแยก
- Production URL: **https://cozypet-iota.vercel.app/**
- Vercel project: `cozy-pet/cozypet`, team `CozyPet`, plan `hobby`, CLI login `mistz3000-1017`
- Deployment `dpl_GgNwphzFf99cEuHy4juhz5iMZpy2` เป็น READY; build บน Vercel ผ่านพร้อม TypeScript
- ตรวจ HTTP โดยไม่ใช้ cookie/token: หน้าแรก, `/scan` และ `/mascot/cat-neutral.png` ตอบ 200 บน production alias ไม่มีหน้า Vercel login ขวาง
- เผยแพร่ด้วย Vercel CLI จากไฟล์ปัจจุบัน ใช้ค่าเริ่มต้น demo ไม่ได้ตั้ง API key หรือระบบบัญชี Supabase เพิ่ม
- การเชื่อม GitHub เพื่อ deploy อัตโนมัติยังรอเจ้าของเพิ่ม GitHub Login Connection ใน Vercel จึงยังไม่อ้างว่า push แล้วเว็บอัปเดตเอง
- การ build ทำใน `out/deploy-ready-2026-10-12` เพื่อไม่กระทบ `.next` ของเว็บที่กำลังเปิดในเครื่อง สำเนานี้ไม่รวม `.env.local` หรือข้อมูลทีมส่วนตัว

## วิธีเผยแพร่ที่รักษาฟังก์ชันเดิม

ใช้ GitHub เก็บ source และใช้ Vercel Hobby เป็นเว็บโฮสต์ โปรเจกต์นี้ใช้ Next.js App Router, cookies, Supabase server routes และ `/api/chat`/`/api/assist` จึงต้องมี server runtime

1. เข้าสู่ Vercel ด้วยบัญชี GitHub ที่เป็นเจ้าของ repository แล้วใช้แผน Hobby สำหรับงานส่วนตัวไม่เชิงพาณิชย์
2. อัปโหลดโค้ดและรูปเวอร์ชันปัจจุบันขึ้น branch ของงานก่อนนำเข้าผ่าน GitHub หรือ deploy สำเนาปัจจุบันด้วย Vercel CLI หลัง login
3. ใช้ framework Next.js และค่า build มาตรฐาน เริ่มด้วย `AI_PROVIDER=demo` และไม่ตั้ง Supabase/AI keys เพื่อเปิดเว็บต้นแบบโดยไม่ต้องเสียค่า API
4. เมื่อ deployment เป็น Ready เปิด production URL และใช้ URL นั้นส่งให้ผู้ทดลอง
5. หากเปิดบัญชีผู้ใช้จริงภายหลัง ตั้ง `SITE_URL` เป็น production URL และตั้ง Supabase redirect URLs ให้ตรงกัน คีย์อยู่ใน Vercel Environment Variables ฝั่ง server เท่านั้น

Repository ที่เป็น Public ไม่ทำให้โปรแกรม Next.js เริ่มทำงานเอง GitHub Pages ให้บริการ HTML/CSS/JavaScript แบบ static หากต้องการใช้ Pages อย่างเดียว ต้องทำโหมด static demo แยกและใช้บทสนทนาสำรองในเครื่อง ส่วน API และบัญชีผู้ใช้ของแอปปัจจุบันต้องใช้โฮสต์ที่รัน server ได้

## ตั้ง Vercel สำหรับ coding agent

ทำตาม https://vercel.com/get-started.md:

- ติดตั้ง Vercel CLI 63.1.2 แบบ global และตรวจ `whoami` สำเร็จ
- ติดตั้ง `vercel@openai-curated` ผ่าน Codex marketplace แบบ user scope; `codex plugin list --json` ยืนยัน installed/enabled
- เพิ่ม shared MCP endpoint `https://mcp.vercel.com` แบบ user scope ใน Codex โดยเก็บ configuration อื่นไว้ และเปิดการยืนยันสำหรับเครื่องมือที่เขียนข้อมูลด้วย `default_tools_approval_mode = "writes"`
- OAuth ของ MCP และการตรวจ `list_teams` ผ่าน MCP ยังรอขั้นเชื่อมต่อ; ไม่เหมารวมสถานะ CLI login ว่า MCP authenticated แล้ว
- ไม่ต้องใช้ standalone skills ซ้ำกับ plugin และไม่มีการเปลี่ยน plan ไป Pro

อ้างอิง: [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), [Vercel Hobby](https://vercel.com/docs/plans/hobby), [Vercel for GitHub](https://vercel.com/docs/git/vercel-for-github)
