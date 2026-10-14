/**
 * npm run film:voice -- --cut demo [--lang en] [--script-only]
 * - --lang en (ค่าเริ่มต้น): สร้างเสียงพากย์ผู้หญิงสังเคราะห์ด้วย Kokoro (ออฟไลน์ ฟรี) → out/film/voice/<cut>-en/voice.wav
 *   ต้องตั้ง FILM_TTS_PYTHON (python ที่ติดตั้ง kokoro-onnx soundfile numpy) และ KOKORO_DIR (ไฟล์โมเดล ไม่อยู่ใน repo)
 * - --script-only: เขียนบทพากย์พร้อมเวลา (ใช้ให้สมาชิกทีมอัดเสียงเอง เช่นภาษาไทย) → out/film/voice/<cut>-<lang>-script.md
 *   เสียงที่ทีมอัดเอง: บันทึกเป็น out/film/voice-<lang>.wav (48 kHz) แล้ว film:mux จะใช้แทนเสียงสังเคราะห์
 */
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
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
