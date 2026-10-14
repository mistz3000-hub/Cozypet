/**
 * npm run film:voice -- --cut demo [--lang en] [--script-only]
 * - --lang en (ค่าเริ่มต้น): สร้างเสียงพากย์ผู้หญิงสังเคราะห์ด้วย Kokoro (ออฟไลน์ ฟรี) → out/film/voice/<cut>-en/voice.wav
 *   ต้องตั้ง FILM_TTS_PYTHON (python ที่ติดตั้ง kokoro-onnx soundfile numpy) และ KOKORO_DIR (ไฟล์โมเดล ไม่อยู่ใน repo)
 * - --provider files --dir <โฟลเดอร์>: นำเข้าไฟล์เสียงที่อัด/สร้างเองทีละบรรทัด ชื่อไฟล์ = รหัสช็อต (S02.wav, S07a.wav, S07b.wav …)
 *   ตัดเงียบหัวท้าย · เร่งแบบคงระดับเสียง (ffmpeg atempo ไม่เกิน 1.12 เท่า) · เลื่อนเวลาเริ่มเล็กน้อยให้ไม่ทับกัน → out/film/voice/<cut>-<lang>/voice.wav
 * - --script-only: เขียนบทพากย์พร้อมเวลา (ใช้ให้สมาชิกทีมอัดเสียงเอง เช่นภาษาไทย) → out/film/voice/<cut>-<lang>-script.md
 *   เสียงที่ทีมอัดเอง: บันทึกเป็น out/film/voice-<lang>.wav (48 kHz) แล้ว film:mux จะใช้แทนเสียงสังเคราะห์
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { OUT, arg, ensureDir, flag, launch, waitForServer } from './lib.ts';
import { openFilm } from './render.ts';

const cut = arg('cut', 'demo')!;
const lang = arg('lang', 'en') === 'th' ? 'th' : 'en';
const dir = ensureDir(path.join(OUT, 'voice'));

await waitForServer();
const browser = await launch();
const { ctx, page } = await openFilm(browser, cut, lang);
const plan = await page.evaluate((l) => window.__cozypetFilm!.voPlan(l as 'th' | 'en'), lang);
await ctx.close();
await browser.close();

const mmss = (t: number) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;
const script = [
  `# บทพากย์ ${cut} (${lang === 'th' ? 'ภาษาไทย' : 'English'})`,
  '',
  'เสียงผู้หญิง น้ำเสียงอบอุ่น สดใส แต่ชัดและเป็นมืออาชีพ · อัด 48 kHz เงียบ ไม่มีเสียงสะท้อน · แต่ละบรรทัดต้องจบก่อน “ไม่เกิน”',
  'วิธีใช้: อัดทั้งเรื่องเป็นไฟล์เดียวตามเวลา (หรืออัดทีละบรรทัดแล้ววางตามเวลาในโปรแกรมตัดต่อ) แล้วบันทึกเป็น `out/film/voice-' + lang + '.wav`',
  '',
  '| เริ่ม | ไม่เกิน (วินาที) | ช็อต | บท |',
  '|---|---|---|---|',
  ...plan.lines.map((l) => `| ${mmss(l.start)} | ${l.maxDur.toFixed(1)} | ${l.shot} | ${l.text} |`),
  '',
].join('\n');
const scriptFile = path.join(dir, `${cut}-${lang}-script.md`);
writeFileSync(scriptFile, script);
console.log(`บทพากย์ → ${path.relative(process.cwd(), scriptFile)}`);
if (flag('script-only')) process.exit(0);

const provider = arg('provider', 'kokoro');
if (provider === 'gemini') {
  await geminiVoice();
  process.exit(0);
}
if (provider === 'files') {
  importFiles();
  process.exit(0);
}
if (lang !== 'en') {
  console.error('Kokoro รองรับเฉพาะภาษาอังกฤษ — ภาษาไทยใช้ --provider gemini (ตั้ง GEMINI_API_KEY, GEMINI_TTS_MODEL) หรือ --script-only แล้วให้ทีมอัดเอง');
  process.exit(1);
}
const py = process.env.FILM_TTS_PYTHON;
if (!py || !process.env.KOKORO_DIR) {
  console.error('ตั้ง FILM_TTS_PYTHON และ KOKORO_DIR ก่อน (ดู README หัวข้อวิดีโอเดโม)');
  process.exit(1);
}
const planFile = path.join(dir, `${cut}-${lang}-plan.json`);
writeFileSync(planFile, JSON.stringify({ voice: arg('voice', 'af_heart'), lang: 'en-us', speed: Number(arg('speed', '1.0')), duration: plan.duration, lines: plan.lines }, null, 1));
const outDir = ensureDir(path.join(dir, `${cut}-${lang}`));
const r = spawnSync(py, ['-I', path.join(import.meta.dirname, 'voice.py'), planFile, outDir], { stdio: 'inherit', env: process.env });
if (r.status !== 0) process.exit(r.status ?? 1);
console.log(`เสียงพากย์ → ${path.relative(process.cwd(), path.join(outDir, 'voice.wav'))}`);

/**
 * Gemini TTS (free tier ของ Gemini API — ตรวจชื่อรุ่น โควตา และภาษาจากเอกสารทางการก่อน ห้ามใส่ชื่อรุ่นเป็นค่าเริ่มต้น)
 * env: GEMINI_API_KEY (ฝั่งเครื่องเท่านั้น ห้าม commit/log), GEMINI_TTS_MODEL, GEMINI_TTS_VOICE (เสียงผู้หญิงที่เลือก)
 */
async function geminiVoice() {
  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_TTS_MODEL;
  const voice = process.env.GEMINI_TTS_VOICE;
  if (!key || !model || !voice) {
    console.error('ตั้ง GEMINI_API_KEY, GEMINI_TTS_MODEL และ GEMINI_TTS_VOICE ก่อน (ชื่อรุ่น/เสียงดูจากเอกสารทางการของ Gemini API)');
    process.exit(1);
  }
  const style = lang === 'th'
    ? 'อ่านด้วยน้ำเสียงผู้หญิงที่อบอุ่น สดใส น่ารัก แต่ชัดเจนและเป็นมืออาชีพแบบผู้บรรยายวิดีโอนวัตกรรม จังหวะกระฉับกระเฉง: '
    : 'Read as a warm, bright, friendly yet professional female narrator for an innovation demo video, at a lively pace: ';
  const outDir = ensureDir(path.join(dir, `${cut}-${lang}`));
  const SR = 48000;
  const mix = new Float32Array(Math.ceil(plan.duration * SR) + SR);
  const report: { key: string; start: number; dur: number; maxDur: number; fits: boolean }[] = [];
  for (const line of plan.lines) {
    let pcm: Float32Array | null = null;
    let rate = 24000;
    for (let attempt = 0; attempt < 4 && !pcm; attempt++) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          contents: [{ parts: [{ text: style + line.text }] }],
          generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } },
        }),
      });
      if (res.status === 429 || res.status >= 500) {
        const wait = 20_000 * (attempt + 1);
        console.warn(`  ${line.key}: HTTP ${res.status} รอ ${wait / 1000} วินาที (โควตาฟรีจำกัดต่อนาที/วัน)`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      if (!res.ok) {
        console.error(`  ${line.key}: HTTP ${res.status} — ตรวจชื่อรุ่น/เสียง/โควตา`);
        process.exit(1);
      }
      const data = (await res.json()) as { candidates?: { content?: { parts?: { inlineData?: { data: string; mimeType: string } }[] } }[] };
      const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData;
      if (!part) continue;
      rate = Number(/rate=(\d+)/.exec(part.mimeType)?.[1] ?? 24000);
      const buf = Buffer.from(part.data, 'base64');
      pcm = new Float32Array(buf.length / 2);
      for (let i = 0; i < pcm.length; i++) pcm[i] = buf.readInt16LE(i * 2) / 32768;
    }
    if (!pcm) {
      console.error(`  ${line.key}: ไม่ได้เสียงกลับมา`);
      process.exit(1);
    }
    // ตัดเงียบหัวท้าย แล้ว resample → 48 kHz (linear)
    let a = 0;
    let b = pcm.length - 1;
    while (a < b && Math.abs(pcm[a]) < 0.01) a++;
    while (b > a && Math.abs(pcm[b]) < 0.01) b--;
    const src = pcm.subarray(Math.max(0, a - Math.round(rate * 0.03)), Math.min(pcm.length, b + Math.round(rate * 0.08)));
    let speed = 1;
    const dur0 = src.length / rate;
    if (dur0 > line.maxDur) speed = Math.min(1.15, dur0 / line.maxDur);
    const n = Math.round((src.length / rate / speed) * SR);
    const s0 = Math.round(line.start * SR);
    for (let i = 0; i < n && s0 + i < mix.length; i++) {
      const x = (i / SR) * speed * rate;
      const i0 = Math.floor(x);
      const fr = x - i0;
      mix[s0 + i] += (src[i0] ?? 0) * (1 - fr) + (src[i0 + 1] ?? 0) * fr;
    }
    const dur = n / SR;
    report.push({ key: line.key, start: line.start, dur: Math.round(dur * 1000) / 1000, maxDur: line.maxDur, fits: dur <= line.maxDur + 0.05 });
    console.log(`  ${line.start.toFixed(2)}s ${line.key.padEnd(14)} ${dur.toFixed(2)}s / ${line.maxDur.toFixed(2)}s${speed > 1 ? ` x${speed.toFixed(2)}` : ''}${dur > line.maxDur + 0.05 ? '  ⚠ ยาวเกินช่วง' : ''}`);
    await new Promise((r) => setTimeout(r, 4000)); // เคารพ rate limit ของ free tier
  }
  let peak = 0;
  for (const v of mix) peak = Math.max(peak, Math.abs(v));
  const gain = peak > 0 ? 0.89 / peak : 1;
  const len = Math.ceil(plan.duration * SR);
  const wav = Buffer.alloc(44 + len * 4);
  wav.write('RIFF', 0); wav.writeUInt32LE(36 + len * 4, 4); wav.write('WAVE', 8); wav.write('fmt ', 12);
  wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(2, 22); wav.writeUInt32LE(SR, 24); wav.writeUInt32LE(SR * 4, 28); wav.writeUInt16LE(4, 32); wav.writeUInt16LE(16, 34);
  wav.write('data', 36); wav.writeUInt32LE(len * 4, 40);
  for (let i = 0; i < len; i++) {
    const v = Math.max(-1, Math.min(1, mix[i] * gain));
    const q = Math.round(v * 32767);
    wav.writeInt16LE(q, 44 + i * 4);
    wav.writeInt16LE(q, 46 + i * 4);
  }
  writeFileSync(path.join(outDir, 'voice.wav'), wav);
  writeFileSync(path.join(outDir, 'voice.json'), JSON.stringify({ voice, lang, provider: 'gemini', synthetic: true, lines: report }, null, 1));
  console.log(`เสียงพากย์ → ${path.relative(process.cwd(), path.join(outDir, 'voice.wav'))}`);
}

/** นำเข้าไฟล์เสียงรายบรรทัด (เช่นจาก Google AI Studio) แล้ววางตามเวลาในแผน */
function importFiles() {
  const src = arg('dir');
  const ff = process.env.FFMPEG_PATH ?? 'ffmpeg';
  if (!src) {
    console.error('ระบุ --dir <โฟลเดอร์ไฟล์เสียง> (ชื่อไฟล์ S02.wav, S07a.wav …)');
    process.exit(1);
  }
  const SR = 48000;
  const MAX_SPEED = Number(arg('max-speed', '1.12'));
  const GAP = 0.15;
  const tmp = ensureDir(path.join(dir, `${cut}-${lang}`, 'tmp'));
  // ไฟล์ของบรรทัดที่ i: ช็อตที่มีหลายบรรทัดใช้ a, b, c ตามลำดับ
  const seen = new Map<string, number>();
  const count = new Map<string, number>();
  for (const l of plan.lines) count.set(l.shot, (count.get(l.shot) ?? 0) + 1);
  const items = plan.lines.map((l) => {
    const n = seen.get(l.shot) ?? 0;
    seen.set(l.shot, n + 1);
    const name = (count.get(l.shot) ?? 1) > 1 ? `${l.shot}${String.fromCharCode(97 + n)}` : l.shot;
    const file = path.join(src, `${name}.wav`);
    if (!existsSync(file)) {
      console.error(`ไม่พบ ${file}`);
      process.exit(1);
    }
    // แปลงเป็น 48 kHz mono float + ตัดเงียบหัวท้าย (ffmpeg silenceremove ทั้งสองด้าน)
    const raw = path.join(tmp, `${name}.f32`);
    const r = spawnSync(ff, ['-v', 'error', '-y', '-i', file, '-af', 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse', '-ac', '1', '-ar', String(SR), '-f', 'f32le', raw]);
    if (r.status !== 0) {
      console.error(`แปลง ${file} ไม่ได้`);
      process.exit(1);
    }
    const speech = readFileSync(raw).length / 4 / SR;
    return { line: l, name, file, raw, speech, speed: 1, start: l.start, dur: speech };
  });
  // วางทีละบรรทัด: เริ่มก่อนแผนได้ไม่เกิน 0.6 วิ (แต่ไม่ทับบรรทัดก่อน) แล้วต้องจบก่อนบรรทัดถัดไปตามแผน
  // ถ้ายาวเกินช่อง เร่งแบบคงระดับเสียงได้ไม่เกิน MAX_SPEED · ยังเกินอีกจึงยอมล้น (บรรทัดถัดไปเลื่อนตาม)
  let prevEnd = 0;
  items.forEach((it, i) => {
    const strictEnd = (i + 1 < items.length ? items[i + 1].line.start : plan.duration - 0.25) - GAP;
    const earliest = Math.max(prevEnd + GAP, it.line.start - 0.6, 0);
    const start = Math.max(earliest, Math.min(it.line.start, strictEnd - it.speech));
    const room = strictEnd - start;
    const speed = it.speech > room ? Math.min(MAX_SPEED, it.speech / Math.max(0.1, room)) : 1;
    it.start = Math.round(start * 1000) / 1000;
    it.speed = Math.round(speed * 1000) / 1000;
    it.dur = Math.round((it.speech / speed) * 1000) / 1000;
    prevEnd = it.start + it.dur;
  });
  const len = Math.ceil(plan.duration * SR);
  const mix = new Float32Array(len);
  const report: { key: string; shot: string; start: number; dur: number; speed: number; maxDur: number; fits: boolean }[] = [];
  for (const it of items) {
    let raw = it.raw;
    if (it.speed > 1.001) {
      raw = it.raw.replace(/\.f32$/, '.fast.f32');
      spawnSync(ff, ['-v', 'error', '-y', '-f', 'f32le', '-ar', String(SR), '-ac', '1', '-i', it.raw, '-af', `atempo=${it.speed}`, '-f', 'f32le', raw]);
    }
    const buf = readFileSync(raw);
    const pcm = new Float32Array(buf.buffer, buf.byteOffset, Math.floor(buf.length / 4));
    const s0 = Math.round(it.start * SR);
    // เฟดหัวท้าย 10 ms กันเสียงคลิก
    const fade = Math.round(SR * 0.01);
    for (let i = 0; i < pcm.length && s0 + i < len; i++) {
      const g = Math.min(1, i / fade, (pcm.length - 1 - i) / fade);
      mix[s0 + i] += pcm[i] * g;
    }
    const next = items[items.indexOf(it) + 1];
    const fits = !next || it.start + pcm.length / SR <= next.start + 0.001;
    report.push({ key: it.line.key, shot: it.name, start: it.start, dur: Math.round((pcm.length / SR) * 1000) / 1000, speed: it.speed, maxDur: it.line.maxDur, fits });
    console.log(`  ${it.name.padEnd(5)} ${it.start.toFixed(2)}s (แผน ${it.line.start.toFixed(2)}) ${(pcm.length / SR).toFixed(2)}s${it.speed > 1.001 ? ` ×${it.speed.toFixed(2)}` : ''}${fits ? '' : '  ⚠ ทับบรรทัดถัดไป'}`);
  }
  let peak = 0;
  for (const v of mix) peak = Math.max(peak, Math.abs(v));
  const gain = peak > 0 ? 0.89 / peak : 1;
  const wav = Buffer.alloc(44 + len * 4);
  wav.write('RIFF', 0); wav.writeUInt32LE(36 + len * 4, 4); wav.write('WAVE', 8); wav.write('fmt ', 12);
  wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(2, 22); wav.writeUInt32LE(SR, 24); wav.writeUInt32LE(SR * 4, 28); wav.writeUInt16LE(4, 32); wav.writeUInt16LE(16, 34);
  wav.write('data', 36); wav.writeUInt32LE(len * 4, 40);
  for (let i = 0; i < len; i++) {
    const q = Math.round(Math.max(-1, Math.min(1, mix[i] * gain)) * 32767);
    wav.writeInt16LE(q, 44 + i * 4);
    wav.writeInt16LE(q, 46 + i * 4);
  }
  const outDir = path.join(dir, `${cut}-${lang}`);
  writeFileSync(path.join(outDir, 'voice.wav'), wav);
  writeFileSync(path.join(outDir, 'voice.json'), JSON.stringify({ voice: arg('voice-name', 'ai-studio'), lang, provider: arg('source', 'files'), synthetic: true, lines: report }, null, 1));
  rmSync(tmp, { recursive: true, force: true });
  console.log(`เสียงพากย์ → ${path.relative(process.cwd(), path.join(outDir, 'voice.wav'))}`);
}
