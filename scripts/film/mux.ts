/**
 * npm run film:mux -- --cut demo --locale th [--voice path.wav] [--no-voice]
 * รวมภาพ (video.mp4) + ดนตรี/เสียงประกอบ (music.wav) + เสียงพากย์ (ถ้ามี) → out/film/cozypet-<cut>-<locale>.mp4
 * - เพลงหลบใต้เสียงพากย์ด้วย sidechaincompress, ปรับความดังแบบ loudnorm 2 รอบ (−16 LUFS, −1 dBTP)
 * - เขียนซับ .srt, ภาพปก thumbnail.png และ contact-sheet.jpg (ภาพย่อทุก 2 วินาที) สำหรับตรวจงาน
 * เสียงพากย์: --voice หรือ out/film/voice-<locale>.wav (ทีมอัดเอง) หรือ out/film/voice/<cut>-en/voice.wav (สังเคราะห์ ภาษาอังกฤษ)
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { OUT, arg, ensureDir, ffmpegPath, flag, launch, waitForServer } from './lib.ts';
import { openFilm } from './render.ts';

const cut = arg('cut', 'demo')!;
const locale = arg('locale', 'th') === 'en' ? 'en' : 'th';
const dir = ensureDir(path.join(OUT, `${cut}-${locale}`));
const ff = ffmpegPath();
const video = path.join(dir, 'video.mp4');
const music = path.join(dir, 'music.wav');
const final = path.join(OUT, `cozypet-${cut}-${locale}.mp4`);

function run(args: string[], label: string): string {
  const r = spawnSync(ff, ['-hide_banner', '-y', ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) {
    console.error(r.stderr?.slice(-3000));
    throw new Error(`ffmpeg ล้มเหลว: ${label}`);
  }
  return r.stderr ?? '';
}

function pickVoice(): { file: string; json: string | null } | null {
  if (flag('no-voice')) return null;
  const cands = [arg('voice'), path.join(OUT, `voice-${locale}.wav`), path.join(OUT, 'voice', `${cut}-${locale}`, 'voice.wav'), path.join(OUT, 'voice', `${cut}-en`, 'voice.wav')].filter(Boolean) as string[];
  for (const f of cands) {
    if (existsSync(f)) {
      const j = path.join(path.dirname(f), 'voice.json');
      return { file: f, json: existsSync(j) ? j : null };
    }
  }
  return null;
}

for (const f of [video, music]) if (!existsSync(f)) throw new Error(`ไม่พบ ${path.relative(process.cwd(), f)} — รัน film:render และ film:audio ก่อน`);
const voice = pickVoice();
const mixed = path.join(dir, 'mix.wav');
// 1) ผสมเสียง: เพลงหลบใต้เสียงพากย์
if (voice) {
  run(['-i', music, '-i', voice.file, '-filter_complex', '[1:a]aresample=48000,asplit=2[v1][v2];[0:a][v1]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=350:makeup=1[duck];[duck][v2]amix=inputs=2:normalize=0:weights=1 1.35[out]', '-map', '[out]', '-ar', '48000', '-ac', '2', mixed], 'mix');
} else {
  run(['-i', music, '-ar', '48000', '-ac', '2', mixed], 'copy');
}
// 2) loudnorm รอบที่ 1 วัดค่า แล้วรอบที่ 2 ใช้ค่าที่วัดได้
const pass1 = run(['-i', mixed, '-af', 'loudnorm=I=-16:TP=-1:LRA=11:print_format=json', '-f', 'null', '-'], 'loudnorm-1');
const m = JSON.parse(pass1.slice(pass1.lastIndexOf('{'), pass1.lastIndexOf('}') + 1)) as Record<string, string>;
const ln = `loudnorm=I=-16:TP=-1:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
run(['-i', video, '-i', mixed, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-af', ln, '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', final], 'mux');
console.log(`✓ ${path.relative(process.cwd(), final)}${voice ? ` (เสียงพากย์: ${path.relative(process.cwd(), voice.file)})` : ' (ไม่มีเสียงพากย์)'}`);

// 3) ซับไตเติล (ตามบทพากย์ถ้ามี ไม่งั้นตามคำบรรยายบนจอ)
await waitForServer();
const browser = await launch();
try {
  if (voice?.json) process.env.FILM_VOICE_JSON = voice.json;
  const { ctx, page } = await openFilm(browser, cut, locale);
  const subs = await page.evaluate(() => window.__cozypetFilm!.subtitles());
  const ts = (t: number) => {
    const ms = Math.round(t * 1000);
    const h = Math.floor(ms / 3600000);
    const mi = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`;
  };
  const srt = subs.map((l, i) => `${i + 1}\n${ts(l.start)} --> ${ts(l.end)}\n${l.text.replace(/\*\*/g, '')}\n`).join('\n');
  const srtFile = path.join(OUT, `cozypet-${cut}-${locale}.${locale}.srt`);
  writeFileSync(srtFile, srt);
  console.log(`✓ ${path.relative(process.cwd(), srtFile)} (${subs.length} บรรทัด)`);
  await ctx.close();
} finally {
  await browser.close();
}

// 4) ภาพปก + contact sheet
const info = JSON.parse(readFileSync(path.join(dir, 'info.json'), 'utf8')) as { shots: { id: string; start: number; dur: number; kind: string }[] };
const homeShot = info.shots.find((x) => x.kind === 'home');
const thumbAt = homeShot ? homeShot.start + homeShot.dur - 1.2 : 30;
run(['-ss', thumbAt.toFixed(2), '-i', final, '-frames:v', '1', path.join(OUT, `thumbnail-${cut}-${locale}.png`)], 'thumbnail');
run(['-i', final, '-vf', 'fps=1/2,scale=384:-1,tile=8x11', '-frames:v', '1', '-q:v', '4', path.join(OUT, `contact-sheet-${cut}-${locale}.jpg`)], 'contact sheet');
console.log('✓ thumbnail + contact sheet');
