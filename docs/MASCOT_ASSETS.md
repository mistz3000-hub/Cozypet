# Cozypet — ภาพ mascot แมวและหมาสมจริง

ปรับตามคำขอผู้ใช้วันที่ 8 ต.ค. 2026: แมวต้องดูเหมือนแมวทั่วไปในชีวิตจริง มีพื้นหลังโปร่งใส และยังเล่น animation บนเว็บได้

## ไฟล์และเครื่องมือ

- `public/mascot/cat-neutral.png` — ท่าปกติ, PNG RGBA 1254×1254
- `public/mascot/cat-happy.png` — แมวตัวเดิมหลับตาฟิน, PNG RGBA 1254×1254
- สร้าง/แก้ด้วย built-in `image_gen` และ `transparent_background: true`; ไม่ได้ใช้ CLI หรือ API key ภายนอก
- เก็บ alpha จากไฟล์ต้นฉบับโดยคัดลอกไฟล์เท่านั้น ไม่ได้คัดลอกภาพถ่ายของผู้อื่น
- ใช้ใน `PhotoCatArt.tsx`: SVG masks แยกหัว ลำตัว ดวงตา และอุ้งเท้า; หน้าแรกและ mini mascot ใช้ภาพชุดเดียวกัน
- มองตาม pointer ด้วย smoothing เดิม, ตาเลื่อนไม่เกิน 1.2 หน่วย SVG เพื่อคงรูปร่างสมจริง; คลิก/แตะ/คีย์บอร์ดทำท่าฟินและปล่อยหัวใจ; reduced motion หยุดการตามต่อเนื่องและ idle
- ภาพนี้เป็นภาพสร้างด้วย AI ของแมวสมมติ

## การตอบสนองล่าสุด

ค่าล่าสุดตามคำขอ 8 ต.ค. 2026: คลิก/แตะ/Enter/Space → หลับตาฟินค้าง **1,000ms** พร้อมหัวใจ SVG สีชมพู 3 ดวงขนาด 48/56/48px ลอยใน **1,400ms** เว้น 80ms กดซ้ำระหว่างสีหน้าฟิน 1,000ms ไม่เพิ่มหัวใจ; หลังครบ 1 วินาทีกดใหม่ได้และยกเลิก timer ของชุดเก่า; reduced motion คงสีหน้า 1 วินาทีและหัวใจ 1 ดวงจางโดยไม่ลอย ตำแหน่งหัวใจอยู่เหนือภาพ ไม่บังปุ่ม/ข้อความ และ idle blink ไม่ทับท่าฟิน

ภาพแมวทุก record อีก 128 ตัวอยู่ใน [CAT_PHOTO_PROMPTS.md](CAT_PHOTO_PROMPTS.md) เป็นภาพ AI ที่สร้างใหม่ ไม่ใช่ภาพดึงจากเว็บ

## Prompt: ภาพท่าปกติ

```text
Use case: photorealistic-natural.
Asset type: transparent web mascot cutout for the cream and gold Cozypet landing page.
Primary request: create ONE beautiful, completely lifelike young ginger tabby domestic shorthair cat, as a natural high-quality pet photograph, peeking up from behind an invisible desk with both front paws resting over the invisible straight front edge. This must look like an ordinary real cat one could see in daily life, NOT a cartoon, illustration, stylized toy or 3D render.
Scene/backdrop: genuine transparent alpha background. No visible desk, floor, environment, backdrop, baked checkerboard, cast shadow on the background or colored rectangular background.
Subject: one ginger tabby with subtle natural orange stripes, cream muzzle, cream chest and lighter soft paws; natural proportionate greenish amber eyes, narrow feline pupils, pink nose, finely detailed whiskers and fur. Friendly curious neutral expression, mouth closed, ears upright. Real cat anatomy and realistic eye size.
Composition/framing: single front-facing centered cat, square canvas 1024x1024; entire head and both ears fully visible with some margin at the top; short upper chest visible beneath the chin; two intact furry forepaws clearly separate and resting at the same horizontal level near the bottom, one on either side of its chest, as if gripping the top of an invisible table. No hind legs or tail. The silhouette, whiskers and paws must all be cleanly separated from the transparent background; keep 5 percent empty margin around all edges. The head faces the camera straight, with both eyes looking forward.
Lighting/mood: soft diffuse natural window light, warm inviting lifelike photographic quality, crisp facial detail with realistic fine soft fur edges.
Constraints: absolutely no cartoon features, oversize eyes, plastic fur, collar, costume, accessories, text, logo, watermark, hearts, scenery or table. Output is only one cat on transparent alpha. Preserve realistic texture at full resolution for use at 500 CSS pixels wide.
```

## Prompt: ภาพหลับตาฟิน

ใช้ภาพท่าปกติเป็น edit target โดยคง identity ตำแหน่ง ท่าทาง และ alpha

```text
Use case: precise-object-edit. Asset type: second expression frame of the lifelike Cozypet transparent cat mascot.
Edit the attached generated cat photograph to create the exact SAME cat, on the exact SAME transparent canvas, in the exact SAME position and pose, with a relaxed happy slow-blink expression: both eyes naturally softly closed as a real contented cat being gently stroked. Keep its mouth closed and natural, not a human smile. Change ONLY the eyelids/eye expression and the tiny immediately surrounding fur. Preserve the precise cat identity, coat pattern, ears, whiskers, muzzle, pink nose, head outline, neck/chest, both forepaws, body pose, lighting, framing, canvas size and every transparent edge. Do not move, resize, rotate or recenter the cat. The original and edited image must align pixel-for-pixel outside the eye areas, for animation crossfading. Genuine transparent alpha background, no table, no scenery, no text, no heart, no logo, no watermark. This is a realistic pet photograph, never a cartoon or 3D illustration.
```

## เพิ่มหมาและท่าหาว (D22)

- `public/mascot/dog-neutral.png`, `dog-happy.png`, `dog-yawn.png` — โกลเด้นรีทรีฟเวอร์สมมติตัวเดียวกัน 3 expressions ใช้ PhotoDogArt.tsx ใน hero/dock และ PetMouthJourney.tsx ในฉากเว็บในปาก
- `public/mascot/cat-yawn.png` — แมวส้มไทยพันทางตัวเดิมหาว ใช้ใน PetMouthJourney.tsx
- ทุกไฟล์สร้างด้วย built-in image_gen และ transparent_background: true การแก้ expression อ้างอิงภาพปกติของสัตว์ตัวนั้น
- หน้าแรกแสดงแมวและหมาอย่างละตัวพร้อมชื่อพันธุ์ ส่วน switch เลือกสัตว์ในฉากหาวและ dock คงค่าใน demo session
- React/Motion ผูกกับการเลื่อนตาม keyframes ใน pet-journey-config.ts หาว → ซูมปาก → หน้าเว็บที่กดได้ ไม่มีวิดีโอ ไม่มีการจับ scroll และมีปุ่มข้ามฉาก; reduced motion ใช้ภาพนิ่ง
- หลังฟิน 1,000ms กดซ้ำได้ หัวใจสามดวงห่างกัน 20% ของความกว้างสัตว์จึงเห็นครบทั้งมือถือและคอม (ไม่ใช้ระยะ px คงที่)

### Prompt: หมาโกลเด้นท่าปกติ

```text
Generate a single high-resolution photographic cutout asset, transparent alpha background. An ordinary real young adult golden retriever with natural accurate anatomy, honey golden fur, kind brown eyes, ears gently drooping, closed mouth with a subtle smile. Frontal symmetrical head and upper chest, looking directly at camera, TWO front paws extend down at bottom corners as if resting over the edge of an invisible table, claws natural. EXACT frame: square canvas, subject centered, top of head at 12% height, eyes at 38% height, nose at 53%, shoulders at 70%, paws at 84-98% height on left 16-37% and right 63-85%, bottom of chest goes to 94%. Entire head, ears, shoulders and paws visible. No background, no table, no floor, no text, no logos, no clothing, no collar, no humans. Soft warm natural studio daylight, photoreal fine fur details, real small eyes. NOT illustration, NOT cartoon, NOT toy, NOT 3D, not oversized head. Premium pet photograph for a cream-white rescue website mascot.
```

### Prompt: dog-happy

```text
Edit ONLY the face expression of this same photographic golden retriever cutout. Eyes gently fully CLOSED with blissful relaxed smile, slight peaceful upward chin, cheek fur soft, mouth still naturally closed, not toothy human smile. Exactly preserve head position, body, two paws, lighting, golden fur identity, size, placement, original transparent alpha background. No added hearts or symbols. The neutral and happy expressions will be crossfaded as website animation frames; alignment must be exact.
```

### Prompt: dog-yawn

```text
Edit the same ordinary real golden retriever cutout into a sleepy gentle wide YAWN facing front. Eyes closed, jaw fully open downward with rounded dark oval interior centered x50%, mouth interior extends roughly y51%-75% of the canvas, small natural dog teeth and pink tongue at bottom. Realistic relaxed dog, no aggression, no scary teeth, no bared snarl. Preserve fur identity, ears, shoulders, both paws and original canvas alignment, remain photographic with transparent alpha background. This is a photo animation frame of a yawn; no table, no scene, no text.
```

### Prompt: cat-yawn

```text
Edit the same real orange tabby cat cutout into a big sleepy cute YAWN. Closed relaxed eyes, mouth opens widely DOWNWARD as a clear vertical oval with a dark inner mouth and small pink tongue at bottom, few small realistic teeth, not aggressive and not cartoon. Mouth center exactly x50%, center of mouth about y66%, inside spans x42%-58% and y57%-77%. Keep the same head size and identity, ears, fur patterns, whiskers, front-facing shoulders and BOTH paws, original alignment and natural light. Transparent alpha background preserved, no table, no text. Ordinary real photographic cat; this frame will crossfade with the neutral frame.
```
