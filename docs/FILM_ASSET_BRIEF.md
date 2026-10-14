# Demo Video รอบ v3 — รายการแก้ไข, brief ภาพ ChatGPT และเสียงพากย์ไทย

อัปเดต 14 ต.ค. 2026 · ใช้คู่กับ [DEMO_VIDEO.md](../DEMO_VIDEO.md) D34

## 1. รายการแก้ไขรอบ v3 (ผู้ใช้สั่ง — ห้ามลืม)

- [ ] **0:35** เส้น flow, ป้ายขั้นที่ และคำบรรยายของช็อตแอปโผล่ทับฉาก “เชื่อมทุกคน” ระหว่างเปลี่ยนฉาก → ซ่อนไว้จนฉากใหม่เข้าเต็มจอ แล้วค่อยเล่นเข้า
- [ ] **1:34** เส้นทองจากโทรศัพท์วิ่งทับหน้าการ์ด “เบื้องหลัง” → ให้เส้นอยู่หลังการ์ด
- [ ] **1:53** ป้าย “ส่งต่อน้องสำเร็จ (จำลอง)” บังคำบรรยายรอง → prop/ป้ายต้องอยู่ใต้กล่องคำบรรยายเสมอ
- [ ] **2:09** เหรียญแบ่งส่วนบังคำบรรยายรอง + กล่องกระดาษ model เพี้ยน (ฝาปิดอยู่แต่แผ่นพับอ้าออก) → ทำกล่องใหม่ให้เปิด/ปิดถูกและสมจริง
- [ ] **2:44** “−66%” ทับข้อความ SDG 9 → จัดผังใหม่
- [ ] **0:19** prop ฉากปัญหายังไม่สวย ลูกกลม ๆ ไม่ลงหลุมตรง → ทำ model ใหม่ให้สมจริง ลูกตกลงหลอดพอดีแล้วซ้อนกันจนล้น
- [ ] **0:28** ตัว C ในโลโก้ให้เป็นหางแมว (ทั้งในแอปและวิดีโอ)
- [ ] **1:07** หน้าจอขาว 3 เฟรมตอนเข้าหน้าฟอร์ม (แก้ใน `cuts.ts` แล้ว รอ render)
- [ ] ใส่ภาพจาก ChatGPT (หัวข้อ 2) ในฉาก 2:26–2:40 และฉากอื่นที่ระบุ
- [ ] เสียงพากย์ไทยสมจริงแบบหนังพากย์ด้วย AI (หัวข้อ 3)
- [ ] เรนเดอร์สุดท้าย 1080p 120fps (หัวข้อ 4) — **พักไว้ ยังไม่ render จนกว่าผู้ใช้สั่ง**
- [ ] ใส่ไอคอน 3 มิติ (P1, P2), น้องแมวลูกกลม (P3), แผนที่ (B5), เมืองกลางคืน (B6) เป็น prop แทนของเดิม

## 2. ภาพที่ให้ ChatGPT สร้าง

**กติการ่วม (ใส่ท้ายทุก prompt ได้):** ไม่มีคน ไม่มีตัวหนังสือ ไม่มีโลโก้/แบรนด์จริง ไม่มีลายน้ำ ไม่เลียนแบบภาพของใคร โทนอบอุ่นครีม–ทอง (#F4B400) เข้ากับแอป · ส่งไฟล์ PNG ขนาดใหญ่สุดที่ทำได้ · ตั้งชื่อไฟล์ตามที่ระบุแล้วอัปโหลดในแชต ผมจะใส่ใน `public/images/film/` และบันทึกที่มาใน CREDITS.md

**ต้องกี่มุม/กี่สถานะ:** ฉากในวิดีโอเป็น 3 มิติที่กล้องขยับไม่มาก จึงใช้ **1 มุมต่อภาพ** พอ
- ภาพฉากหลังใช้มุมตรง
- ของที่ตัดพื้นหลังใช้มุม 3/4 จากด้านหน้าเฉียงบนประมาณ 25°
- ของที่ต้องหมุนหรือเปิด (กล่องกระดาษ หลอดแก้ว หัวใจ) ผมทำเป็น model 3 มิติเอง แล้วใช้ภาพจาก ChatGPT เป็น “พื้นผิว” แทน จึงไม่ต้องเจนหลายมุมและไม่ต้องเจนท่าเปิด–ปิด
- จังหวะเปิดต่าง ๆ (กล่องเปิด, ชัตเตอร์, รูปแปะตู้เย็น) ทำเป็น animation ในโค้ด

| ID | ชื่อไฟล์ | ใช้ที่ | ขนาด | พื้นหลัง |
|---|---|---|---|---|
| L1 | `logo-tail-reference.png` | 0:26–0:30 โลโก้ + ทั้งแอป | 1024×1024 | ครีมเรียบ |
| B1 | `bg-rain-window.png` | 2:29–2:32 ฝนตกนอกหน้าต่าง → กล้องพุ่งเข้าห้อง | แนวนอน 1536×1024 | เต็มภาพ |
| B2 | `bg-living-room.png` | 2:32–2:37 ห้องในบ้าน (ฉากหลังแมวบนเบาะ จะถูกเบลอ) | แนวนอน 1536×1024 | เต็มภาพ |
| B3 | `bg-fridge-door.png` | 2:37–2:40 ประตูตู้เย็นที่แปะรูปโพลารอยด์ | แนวนอน 1536×1024 | เต็มภาพ |
| B4 | `bg-adopt-desk.png` | 2:26–2:29 โต๊ะเซ็นสัญญารับเลี้ยง | แนวนอน 1536×1024 | เต็มภาพ |
| O1 | `pet-bed.png` | 2:32–2:37 เบาะนอนที่แมวนั่ง | 1024×1024 | **โปร่งใส** |
| T1 | `tex-kraft.png` | กล่องของบริจาค (0:22, 1:55–2:12) | 1024×1024 ต่อกันได้ไร้รอย | เต็มภาพ |
| T2 | `tex-paper.png` | สัญญา ประกาศ โพลารอยด์ | 1024×1024 ต่อกันได้ไร้รอย | เต็มภาพ |
| P1 | `icons-3d-a.png` | ไอคอนบนเหรียญ/การ์ดทั้งเรื่อง (0:19, 0:30, 2:40) | 1024×1024 ตาราง 3×3 | **โปร่งใส** |
| P2 | `icons-3d-b.png` | เหมือน P1 ชุดที่ 2 | 1024×1024 ตาราง 3×3 | **โปร่งใส** |
| P3 | `cat-balls.png` | 0:19 น้องแมวลูกกลมที่หล่นลงหลอด | 1536×1024 ตาราง 3×2 | **โปร่งใส** |
| B5 | `tex-night-map.png` | 1:12 พื้นแผนที่กลางคืนของ Smart Load Balancer | 1024×1024 | เต็มภาพ |
| B6 | `bg-night-skyline.png` | 2:24 เมืองกลางคืนตอน “รอเจ้าของ” | แนวนอน 1536×1024 | เต็มภาพ |

### P1 — ไอคอน 3 มิติแบบดินปั้น ชุด A (ตาราง 3×3)

```
A 3×3 grid sheet of nine cute glossy 3D clay-style icons, Pixar-like soft toy render, transparent
background (PNG with alpha), each icon centered in its own equal square cell with clear empty
margin around it, no overlap, consistent soft studio light from the upper left, consistent warm
palette: golden yellow #F4B400, cream #FFF3D1, dark brown #2B2118, coral red #D0402F, mint green
#2E8B62. Row 1: smartphone with a paw on the screen, megaphone, question mark.
Row 2: magnifying glass, heart, small house. Row 3: cardboard box with a heart sticker,
chat bubble with three dots, map pin. No text, no letters, no logos, no shadows on the background.
```

### P2 — ไอคอน 3 มิติแบบดินปั้น ชุด B (ตาราง 3×3)

```
Same style, same lighting, same palette and same 3×3 transparent grid layout as the previous sheet.
Row 1: shield with a check mark, globe, bar chart with an upward arrow.
Row 2: cat paw print, balance scale, two hands shaking.
Row 3: camera with a scan frame, round clock, sparkle star.
No text, no letters, no logos, no shadows on the background.
```

### P3 — น้องแมวลูกกลม (ตาราง 3×2)

```
A 3×2 grid sheet of six adorable round "mochi" cat ball figurines, glossy vinyl toy / soft clay
render, each one a near-perfect sphere body with two small ears, tiny dot eyes, a little pink
nose, front view facing the camera, transparent background (PNG with alpha), each centered in its
own equal cell with margin, no overlap, consistent soft light from upper left.
Colors: orange tabby, cream, light grey, black with white muzzle, white, calico.
No text, no shadows on the background.
```

### B5 — พื้นแผนที่เมืองกลางคืน

```
Top-down stylized aerial night map texture of a riverside Asian city, deep navy and indigo tones,
a wide curving river crossing the image, glowing warm-gold main roads and thin blue side streets,
dark city blocks, soft glow, minimal and clean like a premium data-visualization map, square,
no labels, no text, no icons, no logos.
```

### B6 — เมืองกลางคืน

```
Photorealistic Bangkok-style city at night seen from a low rooftop, many apartment windows with
a mix of warm and cool lights, soft haze, deep blue sky, cinematic, calm and slightly lonely mood,
no people, no readable signs, no text, no logos. Landscape 3:2.
```

### L1 — โลโก้ C เป็นหางแมว (ภาพอ้างอิง ผมวาดเป็นเวกเตอร์ใหม่ให้ใช้ได้ทั้งแอปและ 3 มิติ)

```
A 2×2 sheet of four minimal app-logo concepts on a plain cream background (#FFF8EC).
Each concept is the letter "C" formed by one curled, fluffy cat tail: thick and soft at the base,
tapering smoothly, with the tip curling inward like a happy cat's tail. Bold, geometric, friendly,
flat vector style, solid golden yellow (#F4B400) with optional dark-brown (#2B2118) accents,
no gradients, no outlines thinner than the tail, works at 32 px.
Variation 1: tail-C alone. Variation 2: tail-C with two small cat ears at the top end.
Variation 3: tail-C on a rounded-square app icon tile. Variation 4: tail-C next to the lowercase
word-shape "ozypet" drawn as simple rounded geometric letters.
No other text, no mascots copied from existing brands, generous spacing, centered.
```

### B1 — หน้าต่างกลางคืนตอนฝนตก

```
Photorealistic cinematic night shot, straight-on view of the outside wall of a small Bangkok
apartment in heavy rain. One window in the exact center, about 40% of the frame width, glowing
with warm amber light; through the glass a cozy living room with plants and a sofa is softly
visible. Cool blue-teal rain and wet concrete wall outside, visible rain streaks, droplets on the
glass, gentle reflections, 35 mm lens, shallow depth of field, no people, no animals, no text,
no signs, no logos. Landscape 3:2.
```

### B2 — ห้องนั่งเล่นอบอุ่น (ฉากหลังของแมว)

```
Photorealistic cozy Thai condo living room in soft late-afternoon sunlight, warm cream and wood
tones, large window with sheer curtains on the left, potted plants, a fabric sofa in the
background, light oak floor. Eye-level camera at about 60 cm height, clear empty floor space in
the center foreground (a pet bed will be placed there later), creamy bokeh, cinematic, no people,
no animals, no text, no logos. Landscape 3:2.
```

### B3 — ประตูตู้เย็น

```
Photorealistic close-up, straight-on view of a cream / pastel butter-yellow retro refrigerator
door filling almost the entire frame, smooth enamel surface with subtle soft reflections, a slim
chrome handle on the right edge, soft kitchen daylight from the left, a blurred warm kitchen
visible only at the far edges. Large clean empty area in the middle for photos and magnets.
No magnets, no papers, no text, no logos. Landscape 3:2.
```

### B4 — โต๊ะเซ็นสัญญารับเลี้ยง

```
Photorealistic top-down view of a warm light-oak wooden desk in soft morning daylight, a small
potted plant in the top-left corner, a cup of tea in the bottom-right corner, a ballpoint pen,
large empty area in the center for a document. Calm, cozy, warm cream tones, subtle shadows,
no paper, no people, no animals, no text, no logos. Landscape 3:2.
```

### O1 — เบาะนอนสัตว์เลี้ยง (พื้นหลังโปร่งใส)

```
Photorealistic round donut-shaped pet bed, empty, plush cream faux-fur outer ring with a soft
dusty-pink round cushion inside, product-photo style, three-quarter front view from about 25°
above, soft studio light from the upper left, centered with margin around it, transparent
background (PNG with alpha), no shadow on the background, no animals, no text, no logos.
```

### T1 — พื้นผิวกระดาษลังคราฟต์ (ต่อกันได้ไร้รอย)

```
Seamless tileable texture of brown kraft corrugated cardboard surface, flat top-down, even soft
lighting with no shadows or vignette, natural fibers and subtle speckles, slight corrugation
ripples, no creases, no print, no text. Square.
```

### T2 — พื้นผิวกระดาษ (ต่อกันได้ไร้รอย)

```
Seamless tileable texture of warm off-white premium paper, flat top-down, even lighting, very
subtle fibers and grain, no folds, no stains, no text. Square.
```

## 3. เสียงพากย์ไทยแบบหนังพากย์ด้วย AI

**ตัวเลือกฟรีสำหรับทำคลิปเดียว (เรียงตามที่แนะนำ):**

| ลำดับ | บริการ | ฟรีแค่ไหน | ข้อดี | ข้อควรระวัง |
|---|---|---|---|---|
| 1 | Google AI Studio — Gemini TTS | ฟรีในหน้าเว็บ (มีจำกัดต่อวัน) | รองรับไทย สั่งอารมณ์ด้วยข้อความได้ ใช้ทางอัตโนมัติด้านล่างได้ | ต้องล็อกอิน Google · ห้ามเปิด billing |
| 2 | Botnoi Voice (voice.botnoi.ai) | มีเครดิตฟรีสำหรับผู้ใช้ใหม่ / แอปบน Canva ใช้ฟรี | บริษัทไทย เสียงไทยหลายร้อยแบบ สำเนียงเป็นธรรมชาติ | อ่านเงื่อนไขการใช้และการให้เครดิตก่อน |
| 3 | ElevenLabs (รุ่น v3) | 10,000 เครดิต/เดือน ≈ 10 นาที พอสำหรับคลิปนี้ | เสียงสมจริงมาก ใส่อารมณ์ได้ | แผนฟรีต้องให้เครดิต ElevenLabs และห้ามใช้เชิงพาณิชย์ · ทดสอบภาษาไทยก่อน |

ทุกตัวเลือก: ห้ามโคลนเสียงคนจริงหรือนักพากย์ที่มีชื่อเสียง · เขียนในเครดิตท้ายคลิปว่า “เสียงบรรยายสังเคราะห์ด้วย AI” · ส่งเป็น WAV/MP3 รายบรรทัด ตั้งชื่อตาม key ในบทพากย์ หรือไฟล์เดียวทั้งเรื่องตามเวลาในบท แล้วผมจะจัดให้ตรงจังหวะ ปรับความดัง และลดเสียงดนตรีใต้เสียงพากย์ให้เอง

แนะนำ **Gemini TTS** เพราะฟรีใน Google AI Studio รองรับภาษาไทย มีเสียงผู้หญิงหลายแบบ และสั่งอารมณ์เป็นภาษาพูดได้ ถ้าจะใช้ key ห้ามเปิด billing (งบ 0 บาท) เสียงนี้เป็นเสียงสังเคราะห์ ไม่เลียนแบบนักพากย์จริง และจะเขียนกำกับในเครดิตว่า “เสียงบรรยายสังเคราะห์ด้วย AI”

**ทาง A — อัตโนมัติ (ดีที่สุด):** สคริปต์ `npm run film:voice -- --provider gemini` สร้างทุกบรรทัด แล้วยืด/ย่อให้พอดีจังหวะภาพให้เอง
1. สร้าง API key ฟรีที่ Google AI Studio (ไม่ต้องผูกบัตร)
2. ใส่ key ใน **ตั้งค่า environment ของ cloud session** (เมนู environment ที่แถบชื่อ session → Edit → ช่อง secrets หรือ environment variables)
   - `GEMINI_API_KEY` = key
   - `GEMINI_TTS_MODEL` = ชื่อรุ่น TTS ล่าสุดที่เห็นใน AI Studio
   - `GEMINI_TTS_VOICE` = ชื่อเสียงที่เลือก
3. เปิด session ใหม่ (ค่าใหม่จะเข้าเฉพาะ session ใหม่)
4. **ห้ามวาง key ในแชต**

**ทาง B — ทำมือใน AI Studio (ไม่ต้องให้ key):**
1. เปิดหน้า Generate speech
2. เลือกเสียงผู้หญิง แนะนำลองเทียบ Leda, Aoede, Zephyr, Laomedeia, Sulafat
3. วางคำสั่งสไตล์ด้านล่าง ตามด้วยบทพากย์ทีละบรรทัดจาก `out/film/voice/demo-th-script.md` (ผมสร้างให้)
4. ดาวน์โหลดเป็นไฟล์ WAV ตั้งชื่อตาม key ของบรรทัด เช่น `swarm.wav`, `connect.wav` แล้วอัปโหลดในแชต

**คำสั่งสไตล์ (วางก่อนบท):**

```
อ่านเป็นภาษาไทยด้วยเสียงผู้หญิงอายุราว 25 ปี น้ำเสียงสดใส อบอุ่น น่ารักแต่มืออาชีพ
แบบผู้บรรยายหนังตัวอย่าง/โฆษณาแอปที่พากย์ไทย ยิ้มในน้ำเสียง จังหวะกระชับมีชีวิตชีวา
ชัดถ้อยชัดคำ เน้นคำสำคัญ ไม่ตะโกน ไม่เลียนแบบเสียงคนจริงคนใด
```

## 4. เรนเดอร์สุดท้าย 1080p 120fps

- **เครื่อง cloud นี้ไม่มีการ์ดจอ:** CPU 4 คอร์ วาด 3 มิติด้วยซอฟต์แวร์ (SwiftShader) ได้ราว 0.5 เฟรม/วินาที
  - 120fps ความยาว 2:51 มี 20,480 เฟรม จะใช้ราว 11–12 ชั่วโมง
  - render แบ่งเป็นชิ้นและทำต่อได้เมื่อถูกหยุด จึงทำได้แต่ต้องรอนาน
- **ถ้ามีเครื่องที่มีการ์ดจอ:** สคริปต์รองรับ `--gpu` และ `--fps 120` จะเร็วกว่ามาก (ราวสิบถึงหลายสิบเฟรม/วินาที)
- **ข้อควรรู้:**
  - YouTube และจอส่วนใหญ่เล่นได้สูงสุด 60fps
  - 120fps เห็นผลบนจอ 120Hz เท่านั้น
  - ช็อตแอปจริงอัดมาที่ราว 60fps ช่วงนั้นจะซ้ำเฟรม
  - ถ้าต้องการให้ลื่นที่สุดโดยรอน้อยกว่า 60fps คุ้มกว่า แต่ทำ 120fps ได้ตามที่ต้องการ
