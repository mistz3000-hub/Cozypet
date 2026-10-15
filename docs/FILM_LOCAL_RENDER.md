# เรนเดอร์วิดีโอเดโมบนเครื่องทีม (Windows + การ์ดจอ)

เครื่อง cloud ที่ใช้พัฒนาไม่มีการ์ดจอ ฉาก 3 มิติจึงถูกวาดด้วย CPU ช้าประมาณ 1.2–1.8 วินาทีต่อเฟรม (120fps ทั้งเรื่องคือ 21,120 เฟรม) เอกสารนี้อธิบายวิธีย้ายไปเรนเดอร์บนเครื่องที่มีการ์ดจอด้วยคำสั่งเดียว `npm run film:local`

ผลลัพธ์จะเหมือนกับเครื่อง cloud ทุกอย่าง เพราะใช้โค้ด ภาพอัดหน้าจอ ดนตรี และเสียงพากย์ชุดเดียวกัน

## 1. ติดตั้งเครื่องมือ (ครั้งเดียว)

เปิด **PowerShell** แล้ววางทีละบรรทัด:

```powershell
winget install OpenJS.NodeJS.LTS
winget install Git.Git
winget install Gyan.FFmpeg
```

จากนั้น **ปิด PowerShell แล้วเปิดใหม่** แล้วตรวจว่าใช้ได้:

```powershell
node -v       # ต้องได้ v22.6 ขึ้นไป
ffmpeg -version
```

- ต้องมี Google Chrome หรือ Microsoft Edge (Windows มี Edge อยู่แล้ว) ไม่ต้องรัน `playwright install`
- อัปเดตไดรเวอร์การ์ดจอเป็นรุ่นล่าสุด
- โน้ตบุ๊กที่มีการ์ดจอ 2 ตัว (Intel + NVIDIA/AMD): Settings → System → Display → Graphics → เพิ่ม `chrome.exe` (หรือ `msedge.exe`) แล้วเลือก **High performance**
- ถ้า `npm` ขึ้นว่า *running scripts is disabled* ให้รัน `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` หนึ่งครั้ง

## 2. ดึงโค้ด

```powershell
cd $HOME\Desktop
git clone -b claude/wizardly-cori-i4qnh9 https://github.com/mistz3000-hub/Cozypet.git
cd Cozypet
npm ci
```

ถ้าเคย clone ไว้แล้ว ใช้ `git pull` ในโฟลเดอร์ `Cozypet` แทน

## 3. วางไฟล์ที่ไม่ได้อยู่ใน Git

| ไฟล์ | วางที่ | ที่มา |
|---|---|---|
| `cozypet-film-kit-th-1.zip` และ `-2.zip` (ภาพอัดหน้าจอแอป, ดนตรี, เสียงพากย์) | แตก**ทั้งสองไฟล์**ลง `Cozypet\out\film\` | ไฟล์ที่ Claude ส่งให้ในแชต (แยก 2 ส่วนเพราะจำกัดไฟล์ละ 500 MB) |
| `team.local.json` (ชื่อทีม สมาชิก รหัสนักศึกษา) | `Cozypet\team.local.json` | ไฟล์ของทีม ห้าม commit (อยู่ใน `.gitignore` แล้ว) |

แตก zip ทั้งสองไฟล์ด้วยคำสั่ง (แก้พาธถ้าไฟล์ไม่ได้อยู่ใน Downloads):

```powershell
Expand-Archive $HOME\Downloads\cozypet-film-kit-th-1.zip -DestinationPath out\film -Force
Expand-Archive $HOME\Downloads\cozypet-film-kit-th-2.zip -DestinationPath out\film -Force
```

แตกถูกที่แล้วจะมี `out\film\captures\th\C0\capture.json` … `C9`, `out\film\demo-th\music.wav` และ `out\film\voice\demo-th\voice.wav`

## 4. เรนเดอร์

```powershell
npm run film:local -- --fps 120
```

สคริปต์จะทำต่อกันเอง:

1. ตรวจ ffmpeg, `team.local.json`, ภาพอัดหน้าจอ, ดนตรี และเสียงพากย์ ถ้าขาดอะไรจะหยุดตั้งแต่ต้นพร้อมบอกว่าขาดไฟล์ไหน
2. build เว็บ (ครั้งแรกใช้เวลาหลายนาที) แล้วเปิดเว็บ production ที่ `http://localhost:3100`
3. เรนเดอร์ภาพด้วยการ์ดจอ โดยดูบรรทัด `ตัววาด WebGL:`
   - ถ้าเป็นชื่อการ์ดจอ (เช่น NVIDIA / AMD / Intel) แปลว่าใช้การ์ดจอแล้ว
   - ถ้าเป็น SwiftShader สคริปต์จะสลับไปเปิดหน้าต่าง Chrome ให้เอง **ห้ามปิดหน้าต่างนั้นระหว่างเรนเดอร์** ย่อหน้าต่างได้
   - ระหว่างทำจะแสดงความเร็ว (เฟรม/วินาที) และเวลาที่เหลือโดยประมาณ
4. ผสมดนตรีกับเสียงพากย์ (ปรับความดัง −16 LUFS) แล้วทำซับ ภาพปก และ contact sheet
5. ปิดเว็บที่เปิดเอง

ผลลัพธ์อยู่ใน `out\film\`:

- `cozypet-demo-th.mp4` คือวิดีโอสุดท้าย 1080p 120fps พร้อมเสียง
- `cozypet-demo-th.th.srt` คือซับ
- `contact-sheet-demo-th.jpg` คือภาพย่อทุก 2 วินาทีไว้ตรวจงาน

กด **Ctrl+C** เพื่อหยุดได้ทุกเมื่อ ส่วนที่เสร็จแล้ว (ชิ้นละ 3 วินาที) ถูกเก็บไว้ รันคำสั่งเดิมซ้ำจะทำต่อจากจุดเดิม

## 5. ปรับแต่ง

| ตัวเลือก | ใช้เมื่อ |
|---|---|
| `--jobs 4` (ค่าเริ่มต้น 3) | การ์ดจอ/CPU ยังว่าง ลองเพิ่มหรือลดแล้วดูเฟรม/วินาที |
| `--headed` | บังคับเปิดหน้าต่าง Chrome ตั้งแต่แรก |
| `--fps 60` | อยากได้ผลเร็วขึ้นครึ่งหนึ่ง |
| `--build` | ดึงโค้ดใหม่ (`git pull`) แล้วต้อง build ใหม่ |
| `--cpu` | ไม่ใช้การ์ดจอ (ช้ามาก ใช้ทดสอบเท่านั้น) |

## 6. แก้ปัญหา

| อาการ | วิธีแก้ |
|---|---|
| `ไม่พบ ffmpeg` | ปิด/เปิด PowerShell ใหม่ หรือ `$env:FFMPEG_PATH="C:\...\ffmpeg.exe"` |
| พอร์ต 3100 ถูกใช้อยู่ | `$env:FILM_BASE_URL="http://localhost:3200"` แล้วรันใหม่ |
| ใช้ Edge แต่อยากใช้ Chrome (หรือกลับกัน) | `$env:FILM_CHROME_CHANNEL="chrome"` หรือ `"msedge"` |
| ยังขึ้น SwiftShader แม้เปิดหน้าต่าง | ตั้ง High performance ตามข้อ 1 อัปเดตไดรเวอร์ แล้วเปิด `chrome://gpu` ดูว่า WebGL2 เป็น *Hardware accelerated* |
| ค้างที่เฟรมใดเฟรมหนึ่งเกิน 60 วินาที | สคริปต์จะหยุดเอง รันคำสั่งเดิมซ้ำเพื่อทำต่อ |

## ข้อควรจำ

- การเรนเดอร์ไม่ต้องใช้คีย์ Supabase หรือคีย์ AI ใด ๆ และไม่ต้องเชื่อมต่อบัญชี
- ห้าม commit โฟลเดอร์ `out\` หรือไฟล์ `team.local.json` (อยู่ใน `.gitignore` แล้ว)
- วิดีโอสุดท้ายมีชื่อและรหัสนักศึกษาในฉากรายชื่อทีมตามที่ทีมกำหนด ให้ระวังเรื่องนี้เวลาโพสต์สาธารณะ
