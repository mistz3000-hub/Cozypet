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
- โค้ดและภาพเวอร์ชันนี้ commit/push ขึ้น branch `claude/wizardly-cori-i4qnh9` แล้ว (`fcf3870`); หน้า About ของ GitHub repo มีลิงก์ production URL
- เชื่อม GitHub Login Connection และติดตั้ง Vercel GitHub App แล้ว; Vercel API ยืนยัน Git link `mistz3000-hub/Cozypet` และ Production Branch `main`
- `main` เดิมเป็น ancestor ของโค้ดล่าสุด จึงเผยแพร่โค้ดที่ build ผ่านด้วย fast-forward ไม่ force-push; การอัปเดต `main` ต่อจากนี้เป็น production deployment ส่วน branch งานเดิมคงไว้
- การ build ทำใน `out/deploy-ready-2026-10-12` เพื่อไม่กระทบ `.next` ของเว็บที่กำลังเปิดในเครื่อง สำเนานี้ไม่รวม `.env.local` หรือข้อมูลทีมส่วนตัว

## วิธีเผยแพร่ที่รักษาฟังก์ชันเดิม

ใช้ GitHub เก็บ source และใช้ Vercel Hobby เป็นเว็บโฮสต์ โปรเจกต์นี้ใช้ Next.js App Router, cookies, Supabase server routes และ `/api/chat`/`/api/assist` จึงต้องมี server runtime

1. เข้าสู่ Vercel ด้วยบัญชี GitHub ที่เป็นเจ้าของ repository แล้วใช้แผน Hobby สำหรับงานส่วนตัวไม่เชิงพาณิชย์
2. ทำงานบน branch ของงาน แล้วส่งเวอร์ชันที่พร้อมเผยแพร่เข้า `main` ซึ่งเป็น Production Branch ของ Vercel; เมื่อ push/merge เข้า main ระบบจะเริ่ม deploy
3. ใช้ framework Next.js และค่า build มาตรฐาน เริ่มด้วย `AI_PROVIDER=demo` และไม่ตั้ง Supabase/AI keys เพื่อเปิดเว็บต้นแบบโดยไม่ต้องเสียค่า API
4. เมื่อ deployment เป็น Ready เปิด production URL และใช้ URL นั้นส่งให้ผู้ทดลอง
5. หากเปิดบัญชีผู้ใช้จริงภายหลัง ตั้ง `SITE_URL` เป็น production URL และตั้ง Supabase redirect URLs ให้ตรงกัน คีย์อยู่ใน Vercel Environment Variables ฝั่ง server เท่านั้น

Repository ที่เป็น Public ไม่ทำให้โปรแกรม Next.js เริ่มทำงานเอง GitHub Pages ให้บริการ HTML/CSS/JavaScript แบบ static หากต้องการใช้ Pages อย่างเดียว ต้องทำโหมด static demo แยกและใช้บทสนทนาสำรองในเครื่อง ส่วน API และบัญชีผู้ใช้ของแอปปัจจุบันต้องใช้โฮสต์ที่รัน server ได้

## ตั้ง Vercel สำหรับ coding agent

ทำตาม https://vercel.com/get-started.md:

- ติดตั้ง Vercel CLI 63.1.2 แบบ global และตรวจ `whoami` สำเร็จ
- ติดตั้ง `vercel@openai-curated` ผ่าน Codex marketplace แบบ user scope; `codex plugin list --json` ยืนยัน installed/enabled
- เพิ่ม shared MCP endpoint `https://mcp.vercel.com` แบบ user scope ใน Codex โดยเก็บ configuration อื่นไว้ และเปิดการยืนยันสำหรับเครื่องมือที่เขียนข้อมูลด้วย `default_tools_approval_mode = "writes"`
- Codex MCP OAuth สำเร็จ (`authStatus: o_auth`); เรียก `search_vercel_documentation` และ `list_teams` ผ่าน shared MCP endpoint สำเร็จ ทีมที่คืนมาคือ CozyPet (`cozy-pet`)
- ตรวจไฟล์ plugin แล้วมี `commands/status.md`, `commands/deploy.md` และคำสั่งอื่นครบ; plugin ใน native Codex marketplace เป็น installed/enabled ส่วนรายการคำสั่ง/เครื่องมือในแชตที่เปิดก่อนติดตั้งอาจต้องเปิด session ใหม่เพื่อโหลด
- ไม่ต้องใช้ standalone skills ซ้ำกับ plugin และไม่มีการเปลี่ยน plan ไป Pro

## สถานะการตั้งค่า agent ที่ยืนยันแล้ว

```text
CLI: 63.1.2, authenticated as mistz3000-1017
Guidance: vercel@openai-curated plugin, user scope, installed/enabled
MCP: OAuth authenticated, shared endpoint https://mcp.vercel.com
MCP config: C:\Users\Administrator\.codex\config.toml
Authenticated MCP check: search_vercel_documentation and list_teams succeeded
MCP mutation confirmation: default_tools_approval_mode = "writes"
Reload: open a new session to load plugin commands into a chat started before installation
```

อ้างอิง: [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), [Vercel Hobby](https://vercel.com/docs/plans/hobby), [Vercel for GitHub](https://vercel.com/docs/git/vercel-for-github)
# D26: โมเดลรายได้และชุมชน (12 ต.ค. 2026)

หน้าใหม่: `/partners`, `/profile`, `/agreements/adoption`, `/requests/[id]/agreement` และรายละเอียด `/helpers/foundation-demo-001..003` พร้อมส่วน `#micro-donations`, `#crisis-cases`, `#sponsor-home`, `#platform-revenue` ที่เชื่อมจากหน้าแรก/Dashboard

เวอร์ชันนี้ใช้ source ของ branch `claude/wizardly-cori-i4qnh9` และเผยแพร่แบบ manual production ไปยัง https://cozypet-iota.vercel.app/ ตามคำสั่งเผยแพร่เดิมของผู้ใช้ การเชื่อม GitHub/Vercel และ production branch เดิมคงอยู่

- TypeScript ผ่าน, lint ไม่มี error (warnings เดิม 7 ข้อ), production build ผ่านทั้งใน snapshot และ Vercel
- การเผยแพร่ D26 ครั้งแรกเป็น `dpl_FpNsc8fe9c8b5CffYmP2uGxkJG14` สถานะ READY และตรวจ HTTP แบบไม่ส่ง cookies พบ 200 ที่หน้าแรก รายละเอียดมูลนิธิสมมติ และ `/partners`
- ตรวจที่ HTTP ยืนยันหน้า/โมดูลเผยแพร่ ไม่ใช่หลักฐานว่าได้ทดสอบคลิกทุก flow ไม่มีการรัน unit/E2E tests ในรอบนี้ตามคำสั่งการทำงาน
- ไม่มี key/Supabase/payment gateway ใหม่ ไม่มีการเปิด billing ทุกยอดและการส่งของเป็นการจำลอง `businessState` อยู่ใน browser เท่านั้น
- ข้อกำหนด/ข้อมูล: [BUSINESS_DEMO.md](BUSINESS_DEMO.md) · คู่มือกดดูหัวข้อที่ได้รับ: [FEATURE_WALKTHROUGH.md](FEATURE_WALKTHROUGH.md)
