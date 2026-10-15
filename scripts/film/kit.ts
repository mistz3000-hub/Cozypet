/**
 * ชุดไฟล์สำหรับย้ายไปเรนเดอร์บนเครื่องอื่น (docs/FILM_LOCAL_RENDER.md) — ไฟล์ใน out/film ไม่อยู่ใน Git
 *
 * npm run film:kit -- pack [--locale th] [--cut demo] [--out <dir>] [--part-mb 28]
 *   ภาพอัดหน้าจอแต่ละชุด → วิดีโอ H.264 4:4:4 CRF 10 (ภาพเหมือนเดิมด้วยตา ~49 dB, เล็กลง ~20 เท่า)
 *   ดนตรี/เสียงพากย์ → FLAC (ไม่สูญเสีย) แล้วแบ่งเป็น zip ไฟล์ละไม่เกิน --part-mb
 * npm run film:kit -- unpack --from <โฟลเดอร์ที่มี cozypet-film-kit-*.zip หรือที่แตกไว้แล้ว>
 *   แตก zip แล้วถอดกลับเป็น out/film/captures/<locale>/<id>/frames/*.jpg + capture.json, music.wav, voice.wav/json
 *   ตรวจจำนวนเฟรมกับ manifest ทุกชุด
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { OUT, arg, ensureDir, ffmpegPath } from './lib.ts';

interface Manifest {
  locale: string;
  cut: string;
  captures: { id: string; frames: number }[];
  music: boolean;
  voice: boolean;
}

const ff = ffmpegPath();
const mode = process.argv[2];

function ffrun(args: string[], label: string) {
  const r = spawnSync(ff, ['-v', 'error', '-y', ...args], { encoding: 'utf8' });
  if (r.status !== 0) {
    console.error(r.stderr);
    throw new Error(`ffmpeg ล้มเหลว: ${label}`);
  }
}

function pack() {
  const locale = arg('locale', 'th')!;
  const cut = arg('cut', 'demo')!;
  const partMb = Number(arg('part-mb', '28'));
  const out = ensureDir(path.resolve(arg('out', path.join(OUT, 'kit'))!));
  const stage = ensureDir(path.join(out, 'stage'));
  const capRoot = path.join(OUT, 'captures', locale);
  const files: string[] = [];
  const m: Manifest = { locale, cut, captures: [], music: false, voice: false };
  for (const id of readdirSync(capRoot).sort()) {
    const dir = path.join(capRoot, id);
    if (!existsSync(path.join(dir, 'capture.json'))) continue;
    const frames = readdirSync(path.join(dir, 'frames')).filter((f) => f.endsWith('.jpg')).length;
    const rel = path.join('captures', locale);
    ensureDir(path.join(stage, rel));
    // ทุกเฟรมเรียงตามเลขไฟล์ (เวลาจริงของแต่ละเฟรมอยู่ใน capture.json) · 4:4:4 ไม่ลดสีและใช้ขนาดคี่ได้
    ffrun(['-framerate', '60', '-i', path.join(dir, 'frames', '%06d.jpg'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '10', '-pix_fmt', 'yuv444p', '-g', '600', path.join(stage, rel, `${id}.mkv`)], id);
    copyFileSync(path.join(dir, 'capture.json'), path.join(stage, rel, `${id}.json`));
    files.push(path.join(rel, `${id}.mkv`), path.join(rel, `${id}.json`));
    m.captures.push({ id, frames });
    console.log(`  ${id}: ${frames} เฟรม → ${(statSync(path.join(stage, rel, `${id}.mkv`)).size / 1e6).toFixed(1)} MB`);
  }
  const music = path.join(OUT, `${cut}-${locale}`, 'music.wav');
  if (existsSync(music)) {
    ffrun(['-i', music, '-c:a', 'flac', '-compression_level', '12', path.join(stage, 'music.flac')], 'music');
    files.push('music.flac');
    m.music = true;
  }
  const voiceDir = path.join(OUT, 'voice', `${cut}-${locale}`);
  if (existsSync(path.join(voiceDir, 'voice.wav'))) {
    ffrun(['-i', path.join(voiceDir, 'voice.wav'), '-c:a', 'flac', '-compression_level', '12', path.join(stage, 'voice.flac')], 'voice');
    copyFileSync(path.join(voiceDir, 'voice.json'), path.join(stage, 'voice.json'));
    files.push('voice.flac', 'voice.json');
    m.voice = true;
  }
  writeFileSync(path.join(stage, 'kit-manifest.json'), JSON.stringify(m, null, 2));
  // แบ่ง zip ไม่ให้เกินขนาดที่ส่งได้ (ไฟล์ใหญ่ก่อน) · manifest อยู่ทุกส่วน
  const items = files.map((f) => ({ f, size: statSync(path.join(stage, f)).size })).sort((a, b) => b.size - a.size);
  const parts: { files: string[]; size: number }[] = [];
  for (const it of items) {
    const p = parts.find((x) => x.size + it.size <= partMb * 1e6);
    if (p) {
      p.files.push(it.f);
      p.size += it.size;
    } else parts.push({ files: [it.f], size: it.size });
  }
  parts.forEach((p, i) => {
    const zip = path.join(out, `cozypet-film-kit-${locale}-${i + 1}of${parts.length}.zip`);
    rmSync(zip, { force: true });
    const r = spawnSync('zip', ['-q', '-0', zip, 'kit-manifest.json', ...p.files], { cwd: stage, encoding: 'utf8' });
    if (r.status !== 0) throw new Error(`zip ล้มเหลว: ${r.stderr}`);
    console.log(`✓ ${zip} (${(statSync(zip).size / 1e6).toFixed(1)} MB)`);
  });
  rmSync(stage, { recursive: true, force: true });
}

function unpack() {
  const from = path.resolve(arg('from') ?? path.join(os.homedir(), 'Downloads'));
  const zips = existsSync(from) ? readdirSync(from).filter((f) => /^cozypet-film-kit-.*\.zip$/i.test(f)) : [];
  let src = from;
  let tmp = '';
  if (zips.length) {
    tmp = mkdtempSync(path.join(os.tmpdir(), 'cozypet-kit-'));
    for (const z of zips) {
      // Windows 10+ และ macOS มี tar (bsdtar) ที่แตก zip ได้ · Linux ใช้ unzip
      const r = process.platform === 'linux' ? spawnSync('unzip', ['-q', '-o', path.join(from, z), '-d', tmp]) : spawnSync('tar', ['-xf', path.join(from, z), '-C', tmp]);
      if (r.status !== 0) throw new Error(`แตกไฟล์ ${z} ไม่ได้`);
      console.log(`  แตก ${z}`);
    }
    src = tmp;
  }
  const mf = path.join(src, 'kit-manifest.json');
  if (!existsSync(mf)) throw new Error(`ไม่พบชุดไฟล์ใน ${from} — ใส่ --from <โฟลเดอร์ที่มี cozypet-film-kit-*.zip>`);
  const m = JSON.parse(readFileSync(mf, 'utf8')) as Manifest;
  const lack: string[] = [];
  for (const c of m.captures) {
    const mkv = path.join(src, 'captures', m.locale, `${c.id}.mkv`);
    if (!existsSync(mkv)) {
      lack.push(c.id);
      continue;
    }
    const dir = path.join(OUT, 'captures', m.locale, c.id);
    rmSync(dir, { recursive: true, force: true });
    const frames = ensureDir(path.join(dir, 'frames'));
    // ถอดกลับทีละเฟรม ไม่เพิ่ม/ทิ้งเฟรม (ตรวจจำนวนกับ manifest ด้านล่าง)
    ffrun(['-i', mkv, '-fps_mode', 'passthrough', '-q:v', '2', '-start_number', '1', path.join(frames, '%06d.jpg')], c.id);
    copyFileSync(path.join(src, 'captures', m.locale, `${c.id}.json`), path.join(dir, 'capture.json'));
    const n = readdirSync(frames).filter((f) => f.endsWith('.jpg')).length;
    if (n !== c.frames) throw new Error(`${c.id}: ได้ ${n} เฟรม แต่ควรได้ ${c.frames}`);
    console.log(`✓ ${c.id}: ${n} เฟรม`);
  }
  if (m.music) {
    const f = path.join(src, 'music.flac');
    if (existsSync(f)) {
      ffrun(['-i', f, '-c:a', 'pcm_s16le', path.join(ensureDir(path.join(OUT, `${m.cut}-${m.locale}`)), 'music.wav')], 'music');
      console.log(`✓ ดนตรี → out/film/${m.cut}-${m.locale}/music.wav`);
    } else lack.push('music.flac');
  }
  if (m.voice) {
    const f = path.join(src, 'voice.flac');
    if (existsSync(f)) {
      const dir = ensureDir(path.join(OUT, 'voice', `${m.cut}-${m.locale}`));
      ffrun(['-i', f, '-c:a', 'pcm_s16le', path.join(dir, 'voice.wav')], 'voice');
      copyFileSync(path.join(src, 'voice.json'), path.join(dir, 'voice.json'));
      console.log(`✓ เสียงพากย์ → out/film/voice/${m.cut}-${m.locale}/voice.wav`);
    } else lack.push('voice.flac');
  }
  if (tmp) rmSync(tmp, { recursive: true, force: true });
  if (lack.length) throw new Error(`ชุดไฟล์ยังไม่ครบ ขาด ${lack.join(', ')} — ดาวน์โหลด cozypet-film-kit-*.zip ให้ครบทุกส่วนไว้ในโฟลเดอร์เดียวกัน`);
  console.log('✓ ชุดไฟล์พร้อม — ต่อด้วย npm run film:local -- --fps 120');
}

if (mode === 'pack') pack();
else if (mode === 'unpack') unpack();
else {
  console.error('ใช้: npm run film:kit -- pack | unpack --from <โฟลเดอร์>');
  process.exit(1);
}
