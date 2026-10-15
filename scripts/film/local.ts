/**
 * npm run film:local -- [--kit <โฟลเดอร์ zip>] [--fps 120] [--cut demo] [--locale th] [--jobs 3] [--headed] [--cpu] [--build]
 * เรนเดอร์วิดีโอเดโมทั้งชุดบนเครื่องทีม (เช่น Windows ที่มีการ์ดจอ) ด้วยคำสั่งเดียว — คู่มือ: docs/FILM_LOCAL_RENDER.md
 * ตรวจไฟล์ → build (ถ้ายังไม่มี หรือ --build) → เปิดเว็บ production ที่ FILM_BASE_URL (ค่าเริ่มต้นพอร์ต 3100) →
 * film:render --gpu → film:mux → ปิดเว็บที่เปิดเอง
 * ต้องมี out/film/captures/<locale>, out/film/<cut>-<locale>/music.wav และ team.local.json ก่อน
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { BASE_URL, OUT, ROOT, arg, ffmpegPath, flag, teamPlaceholders, waitForServer } from './lib.ts';

const cut = arg('cut', 'demo')!;
const locale = arg('locale', 'th') === 'en' ? 'en' : 'th';
const fps = arg('fps', '120')!;
const jobs = arg('jobs', '3')!;
const NEXT = path.join(ROOT, 'node_modules', 'next', 'dist', 'bin', 'next');
const port = new URL(BASE_URL).port || '3100';
const rel = (p: string) => path.relative(ROOT, p);

function run(args: string[], env: Record<string, string> = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    spawn(process.execPath, args, { cwd: ROOT, stdio: 'inherit', env: { ...process.env, ...env } }).on('close', (c) => (c === 0 ? resolve() : reject(new Error(`คำสั่ง ${args.slice(-6).join(' ')} หยุดด้วยรหัส ${c}`))));
  });
}

async function up(): Promise<boolean> {
  try {
    return (await fetch(BASE_URL, { method: 'HEAD' })).status < 500;
  } catch {
    return false;
  }
}

function fail(msg: string): never {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

// 0) --kit <โฟลเดอร์>: แตกชุดไฟล์ (cozypet-film-kit-*.zip) ลง out/film ก่อน
const kit = arg('kit');
if (kit) await run(['--experimental-strip-types', '--no-warnings', path.join(ROOT, 'scripts', 'film', 'kit.ts'), 'unpack', '--from', kit]);

// 1) ตรวจของที่ต้องมีให้ครบก่อนเริ่ม (เรนเดอร์ 120fps ใช้เวลานาน ไม่ควรมาพังกลางทาง)
const ff = ffmpegPath();
console.log(`✓ ffmpeg: ${ff}`);
const missing = teamPlaceholders();
if (missing.length) fail(`team.local.json ยังไม่ครบ: ${missing.join(', ')} — วางไฟล์ไว้ที่ ${ROOT}`);
console.log('✓ team.local.json');
const capDir = path.join(OUT, 'captures', locale);
const caps = existsSync(capDir) ? readdirSync(capDir).filter((id) => existsSync(path.join(capDir, id, 'capture.json'))) : [];
// ชุดภาพที่ช็อตในวิดีโอใช้ (อ่านจาก cuts.ts) ต้องมีครบ ไม่งั้นจอโทรศัพท์ในวิดีโอจะว่าง
const needed = [...new Set([...readFileSync(path.join(ROOT, 'src', 'features', 'film', 'cuts.ts'), 'utf8').matchAll(/capture: '([A-Z0-9]+)'/g)].map((m) => m[1]))].sort();
const lack = needed.filter((id) => !caps.includes(id));
if (lack.length) fail(`ภาพอัดหน้าจอใน ${rel(capDir)} ยังขาด ${lack.join(', ')} — แตกไฟล์ชุดเรนเดอร์ (film-kit) ทุกส่วนลงโฟลเดอร์ out/film ก่อน`);
console.log(`✓ ภาพอัดหน้าจอครบ ${needed.length} ชุด (${needed.join(', ')})`);
const music = path.join(OUT, `${cut}-${locale}`, 'music.wav');
if (!existsSync(music)) fail(`ไม่พบ ${rel(music)} — แตกไฟล์ชุดเรนเดอร์ หรือรัน npm run film:audio -- --cut ${cut} --locale ${locale}`);
console.log(`✓ ${rel(music)}`);
const voiceJson = path.join(OUT, 'voice', `${cut}-${locale}`, 'voice.json');
const hasVoice = existsSync(voiceJson) && existsSync(path.join(path.dirname(voiceJson), 'voice.wav'));
console.log(hasVoice ? `✓ เสียงพากย์ ${rel(path.dirname(voiceJson))}` : '  (ไม่มีเสียงพากย์ — วิดีโอจะมีแต่ดนตรี)');

// 2) build + เปิดเว็บ
if (flag('build') || !existsSync(path.join(ROOT, '.next', 'BUILD_ID'))) {
  console.log('\n— build เว็บ (ครั้งแรกใช้เวลาหลายนาที)');
  await run([NEXT, 'build']);
}
let server: ChildProcess | null = null;
if (!(await up())) {
  console.log(`\n— เปิดเว็บ production ที่ ${BASE_URL}`);
  server = spawn(process.execPath, [NEXT, 'start', '-p', port], { cwd: ROOT, stdio: 'ignore' });
  await waitForServer(BASE_URL, 90_000);
}
const stop = () => {
  if (server && server.exitCode === null) server.kill();
};
process.on('exit', stop);
process.on('SIGINT', () => process.exit(130));

// 3) เรนเดอร์ภาพ → 4) ผสมเสียง
const env: Record<string, string> = { FILM_BASE_URL: BASE_URL, ...(hasVoice ? { FILM_VOICE_JSON: voiceJson } : {}) };
const ts = ['--experimental-strip-types', '--no-warnings'];
const started = Date.now();
try {
  console.log(`\n— เรนเดอร์ ${cut}/${locale} ${fps}fps ${flag('cpu') ? '(CPU)' : '(การ์ดจอ)'} · ${jobs} งานพร้อมกัน · หยุดกลางทางได้ รันคำสั่งเดิมซ้ำจะทำต่อจากชิ้นที่เสร็จแล้ว`);
  await run([...ts, path.join(ROOT, 'scripts', 'film', 'render.ts'), '--cut', cut, '--locale', locale, '--fps', fps, '--jobs', jobs, ...(flag('cpu') ? [] : ['--gpu']), ...(flag('headed') ? ['--headed'] : [])], env);
  console.log('\n— ผสมเสียง ซับ และภาพปก');
  await run([...ts, path.join(ROOT, 'scripts', 'film', 'mux.ts'), '--cut', cut, '--locale', locale], env);
} catch (e) {
  stop();
  fail((e as Error).message);
}
stop();
const final = path.join(OUT, `cozypet-${cut}-${locale}.mp4`);
console.log(`\n✓ เสร็จใน ${Math.round((Date.now() - started) / 60000)} นาที → ${final}`);
process.exit(0);
