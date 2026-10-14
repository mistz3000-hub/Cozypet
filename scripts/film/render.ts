/**
 * npm run film:render -- --cut demo --locale th [--from 0 --to 10] [--jobs 3] [--allow-placeholders]
 * เปิด /film?record=1 แล้ว seek ทีละเฟรม (30 fps) → screenshot → ffmpeg (DEMO_VIDEO.md หัวข้อ 9)
 * ผลลัพธ์: out/film/<cut>-<locale>/video.mp4 (ไม่มีเสียง)
 */
import { spawn } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Browser } from '@playwright/test';
import { BASE_URL, OUT, arg, ensureDir, ffmpegPath, flag, launch, teamPlaceholders, waitForServer } from './lib.ts';

const FPS = 30;
const cut = arg('cut', 'demo')!;
const locale = arg('locale', 'th') === 'en' ? 'en' : 'th';
const jobs = Math.max(1, Number(arg('jobs', '3')));

export function captureIndex(loc: string): Record<string, unknown> {
  const dir = path.join(OUT, 'captures', loc);
  const index: Record<string, unknown> = {};
  if (!existsSync(dir)) return index;
  for (const id of readdirSync(dir)) {
    const f = path.join(dir, id, 'capture.json');
    if (existsSync(f)) index[id] = JSON.parse(readFileSync(f, 'utf8'));
  }
  return index;
}

/** หน้า /film พร้อมข้อมูลภาพอัด (ไฟล์ใน out/film เสิร์ฟผ่าน route ของ Playwright ไม่ผ่านเว็บ) */
export async function openFilm(browser: Browser, cutId: string, loc: string) {
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, locale: loc === 'th' ? 'th-TH' : 'en-US', timezoneId: 'Asia/Bangkok', reducedMotion: 'no-preference' });
  await ctx.route('**/__film/**', async (route) => {
    const rel = decodeURIComponent(new URL(route.request().url()).pathname.replace(/^\/__film\//, ''));
    const file = path.normalize(path.join(OUT, rel));
    if (!file.startsWith(OUT) || !existsSync(file)) return route.fulfill({ status: 404, body: '' });
    const type = file.endsWith('.png') ? 'image/png' : file.endsWith('.jpg') ? 'image/jpeg' : 'application/octet-stream';
    return route.fulfill({ status: 200, body: readFileSync(file), headers: { 'content-type': type, 'cache-control': 'max-age=3600' } });
  });
  const idx = captureIndex(loc);
  // เสียงพากย์ (ถ้ามี): ใช้จัดซับ/คำแปลใต้ภาพให้ตรงกับเสียงที่ได้ยิน — FILM_VOICE_JSON=out/film/voice/<cut>-<lang>/voice.json
  const vf = process.env.FILM_VOICE_JSON;
  const voice = vf && existsSync(vf) ? (() => { const v = JSON.parse(readFileSync(vf, 'utf8')) as { lang: string; lines: unknown[] }; return { lang: v.lang.startsWith('en') ? 'en' : 'th', lines: v.lines }; })() : null;
  await ctx.addInitScript(({ data, voice: vo }) => {
    (window as unknown as { __filmCaptures: unknown }).__filmCaptures = data;
    if (vo) (window as unknown as { __filmVoice: unknown }).__filmVoice = vo;
    try { sessionStorage.setItem('cozypet:critical-notice:session:v1', '1'); } catch { /* */ }
  }, { data: idx, voice });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.warn('  pageerror:', e.message.slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('Failed to load resource')) console.warn('  console:', m.text().slice(0, 200)); });
  await page.goto(`${BASE_URL}/film?cut=${cutId}&locale=${loc}&record=1${process.env.FILM_QUERY ? `&${process.env.FILM_QUERY}` : ''}`, { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.__cozypetFilm, null, { timeout: 60_000 });
  const ready = await page.evaluate(() => window.__cozypetFilm!.ready());
  if (!ready.webgl) console.warn('  ⚠ WebGL ใช้ไม่ได้ — ฉาก 3 มิติจะไม่แสดง');
  return { ctx, page };
}

async function renderRange(ff: string, browser: Browser, from: number, to: number, file: string, label: string) {
  const { ctx, page } = await openFilm(browser, cut, locale);
  const cdp = await ctx.newCDPSession(page);
  const enc = spawn(ff, ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', flag('draft') ? 'veryfast' : 'slow', '-crf', flag('draft') ? '23' : '18', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise<void>((resolve, reject) => enc.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}`)))));
  const start = Date.now();
  for (let f = from; f < to; f++) {
    const t = f / FPS;
    const timer = setTimeout(() => {
      console.error(`เฟรม ${f} (t=${t.toFixed(3)}s) รอ seek/ready เกิน 10 วินาที — หยุด`);
      process.exit(1);
    }, 10_000);
    await page.evaluate((tt) => window.__cozypetFilm!.seek(tt), t);
    clearTimeout(timer);
    const shot = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 95, clip: { x: 0, y: 0, width: 1920, height: 1080, scale: 1 }, captureBeyondViewport: false });
    const buf = Buffer.from(shot.data, 'base64');
    if (!enc.stdin.write(buf)) await new Promise((r) => enc.stdin.once('drain', r));
    if ((f - from) % 60 === 59) {
      const fps = (f - from + 1) / ((Date.now() - start) / 1000);
      process.stdout.write(`  [${label}] เฟรม ${f + 1 - from}/${to - from} · ${fps.toFixed(1)} เฟรม/วินาที\n`);
    }
  }
  enc.stdin.end();
  await done;
  await ctx.close();
}

async function main() {
  const outDir = ensureDir(path.join(OUT, `${cut}-${locale}`));
  const outFile = arg('out') ?? path.join(outDir, 'video.mp4');
  const ff = ffmpegPath();
  const missing = teamPlaceholders();
  if (missing.length && !flag('allow-placeholders')) {
    console.error(`ข้อมูลทีมยังไม่ครบ (SUBMISSION.md 3.1): ${missing.join(', ')}\nเติม team.local.json หรือใส่ --allow-placeholders เพื่อดูร่าง`);
    process.exit(1);
  }
  await waitForServer();
  const browser = await launch(['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']);
  const probe = await openFilm(browser, cut, locale);
  const duration = await probe.page.evaluate(() => window.__cozypetFilm!.duration());
  const info = await probe.page.evaluate(() => window.__cozypetFilm!.info());
  await probe.ctx.close();
  const from = Math.round(Number(arg('from', '0')) * FPS);
  const to = Math.min(Math.round(Number(arg('to', String(duration))) * FPS), Math.round(duration * FPS));
  console.log(`เรนเดอร์ ${cut}/${locale}: เฟรม ${from}–${to} (${((to - from) / FPS).toFixed(1)} วินาที) · ภาพใช้งานจริง ${(info.realUsage * 100).toFixed(1)}% · ${jobs} งานพร้อมกัน`);
  const total = to - from;
  const per = Math.ceil(total / jobs);
  const parts: string[] = [];
  const tasks: Promise<void>[] = [];
  for (let j = 0; j < jobs; j++) {
    const a = from + j * per;
    const b = Math.min(to, a + per);
    if (a >= b) break;
    const part = path.join(outDir, `part-${j}.mp4`);
    parts.push(part);
    tasks.push(renderRange(ff, browser, a, b, part, `งาน ${j + 1}`));
  }
  await Promise.all(tasks);
  await browser.close();
  if (parts.length === 1) {
    rmSync(outFile, { force: true });
    await new Promise<void>((resolve, reject) => spawn(ff, ['-v', 'error', '-y', '-i', parts[0], '-c', 'copy', '-movflags', '+faststart', outFile], { stdio: 'inherit' }).on('close', (c) => (c === 0 ? resolve() : reject(new Error('copy')))));
  } else {
    const list = path.join(outDir, 'parts.txt');
    writeFileSync(list, parts.map((p) => `file '${p}'`).join('\n'));
    await new Promise<void>((resolve, reject) => spawn(ff, ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', outFile], { stdio: 'inherit' }).on('close', (c) => (c === 0 ? resolve() : reject(new Error('concat')))));
    rmSync(list, { force: true });
  }
  parts.forEach((p) => rmSync(p, { force: true }));
  writeFileSync(path.join(outDir, 'info.json'), JSON.stringify(info, null, 2));
  console.log(`เสร็จ → ${path.relative(process.cwd(), outFile)}`);
}

if (path.resolve(process.argv[1] ?? "") === import.meta.filename) await main();
