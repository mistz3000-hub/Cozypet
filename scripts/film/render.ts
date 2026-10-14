/**
 * npm run film:render -- --cut demo --locale th [--from 0 --to 10] [--jobs 3] [--chunk 90] [--fresh] [--allow-placeholders]
 * เปิด /film?record=1 แล้ว seek ทีละเฟรม (30 fps) → screenshot → ffmpeg (DEMO_VIDEO.md หัวข้อ 9)
 * ผลลัพธ์: out/film/<cut>-<locale>/video.mp4 (ไม่มีเสียง)
 */
import { spawn } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Browser } from '@playwright/test';
import { BASE_URL, OUT, arg, ensureDir, ffmpegPath, flag, launch, teamPlaceholders, waitForServer } from './lib.ts';

const FPS = 30;
const cut = arg('cut', 'demo')!;
const locale = arg('locale', 'th') === 'en' ? 'en' : 'th';
const jobs = Math.max(1, Number(arg('jobs', '3')));
const GL_ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];

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

/** เตรียมหน้า /film หนึ่งหน้าต่อหนึ่งงาน แล้วเรนเดอร์ช่วงเฟรมทีละชิ้นจากคิวเดียวกัน */
async function worker(ff: string, label: string, queue: { from: number; to: number; file: string }[], total: { done: number; frames: number; start: number }) {
  const browser = await launch(GL_ARGS);
  const { ctx, page } = await openFilm(browser, cut, locale);
  const cdp = await ctx.newCDPSession(page);
  let first = true;
  for (let job = queue.shift(); job; job = queue.shift()) {
    const tmp = job.file.replace(/\.mp4$/, '.tmp.mp4');
    const enc = spawn(ff, ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', flag('draft') ? 'veryfast' : 'slow', '-crf', flag('draft') ? '23' : '18', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', '-f', 'mp4', tmp], { stdio: ['pipe', 'inherit', 'inherit'] });
    const done = new Promise<void>((resolve, reject) => enc.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}`)))));
    for (let f = job.from; f < job.to; f++) {
      const t = f / FPS;
      // เฟรมแรกของงานต้องเตรียมฉาก/พื้นผิวทั้งหมด จึงให้เวลานานกว่า (SwiftShader หลายงานพร้อมกันช้ามาก)
      const limit = first ? 180 : 60;
      first = false;
      const timer = setTimeout(() => {
        console.error(`เฟรม ${f} (t=${t.toFixed(3)}s) รอ seek/ready เกิน ${limit} วินาที — หยุด (รันคำสั่งเดิมซ้ำเพื่อทำต่อจากชิ้นที่เสร็จแล้ว)`);
        process.exit(1);
      }, limit * 1000);
      await page.evaluate((tt) => window.__cozypetFilm!.seek(tt), t);
      clearTimeout(timer);
      const shot = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 95, clip: { x: 0, y: 0, width: 1920, height: 1080, scale: 1 }, captureBeyondViewport: false });
      const buf = Buffer.from(shot.data, 'base64');
      if (!enc.stdin.write(buf)) await new Promise((r) => enc.stdin.once('drain', r));
      total.done++;
    }
    enc.stdin.end();
    await done;
    renameSync(tmp, job.file);
    const fps = total.done / ((Date.now() - total.start) / 1000);
    const left = (total.frames - total.done) / Math.max(0.01, fps);
    process.stdout.write(`  [${label}] ${path.basename(job.file)} · รวม ${total.done}/${total.frames} เฟรม · ${fps.toFixed(2)} เฟรม/วินาที · เหลือ ~${Math.ceil(left / 60)} นาที\n`);
  }
  await ctx.close();
  await browser.close();
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
  const browser = await launch(GL_ARGS);
  const probe = await openFilm(browser, cut, locale);
  const duration = await probe.page.evaluate(() => window.__cozypetFilm!.duration());
  const info = await probe.page.evaluate(() => window.__cozypetFilm!.info());
  await probe.ctx.close();
  await browser.close();
  const from = Math.round(Number(arg('from', '0')) * FPS);
  const to = Math.min(Math.round(Number(arg('to', String(duration))) * FPS), Math.round(duration * FPS));
  // แบ่งเป็นชิ้นสั้น ๆ ในคิวเดียว งานที่ว่างหยิบชิ้นถัดไป (ฉาก 3 มิติหนักไม่ไปกองที่งานเดียว) · ชิ้นที่เสร็จแล้วเก็บไว้ รันซ้ำจะทำต่อ (--fresh เพื่อเริ่มใหม่)
  const chunk = Math.max(15, Number(arg('chunk', '90')));
  const chunkDir = path.join(outDir, `chunks-${from}-${to}${flag('draft') ? '-draft' : ''}`);
  if (flag('fresh')) rmSync(chunkDir, { recursive: true, force: true });
  ensureDir(chunkDir);
  const all: { from: number; to: number; file: string }[] = [];
  for (let a = from; a < to; a += chunk) all.push({ from: a, to: Math.min(to, a + chunk), file: path.join(chunkDir, `${String(a).padStart(6, '0')}.mp4`) });
  const queue = all.filter((c) => !existsSync(c.file));
  const frames = queue.reduce((n, c) => n + c.to - c.from, 0);
  console.log(`เรนเดอร์ ${cut}/${locale}: เฟรม ${from}–${to} (${((to - from) / FPS).toFixed(1)} วินาที) · ภาพใช้งานจริง ${(info.realUsage * 100).toFixed(1)}% · ${all.length} ชิ้น (เหลือ ${queue.length}) · ${jobs} งานพร้อมกัน`);
  const total = { done: 0, frames, start: Date.now() };
  await Promise.all(Array.from({ length: Math.min(jobs, queue.length) }, (_, j) => worker(ff, `งาน ${j + 1}`, queue, total)));
  const list = path.join(chunkDir, 'list.txt');
  writeFileSync(list, all.map((c) => `file '${c.file}'`).join('\n'));
  rmSync(outFile, { force: true });
  await new Promise<void>((resolve, reject) => spawn(ff, ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', outFile], { stdio: 'inherit' }).on('close', (c) => (c === 0 ? resolve() : reject(new Error('concat')))));
  if (!flag('keep-chunks')) rmSync(chunkDir, { recursive: true, force: true });
  writeFileSync(path.join(outDir, 'info.json'), JSON.stringify(info, null, 2));
  console.log(`เสร็จ → ${path.relative(process.cwd(), outFile)}`);
}

if (path.resolve(process.argv[1] ?? "") === import.meta.filename) await main();
