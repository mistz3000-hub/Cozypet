/**
 * เครื่องมือร่วมของสคริปต์ film:* (DEMO_VIDEO.md หัวข้อ 9) — ไม่ใช่ส่วนของเว็บ
 * ใช้ Chromium ที่ติดตั้งไว้แล้ว (ห้ามรัน playwright install) และ ffmpeg ในเครื่อง (หรือ FFMPEG_PATH)
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { chromium, type Browser, type Page } from '@playwright/test';

export const ROOT = path.resolve(import.meta.dirname, '..', '..');
export const OUT = path.join(ROOT, 'out', 'film');
export const BASE_URL = process.env.FILM_BASE_URL ?? 'http://localhost:3100';

export function arg(name: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) return process.argv[i + 1];
  const eq = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (eq) return eq.slice(name.length + 3);
  return fallback;
}
export const flag = (name: string) => process.argv.includes(`--${name}`);

export function ensureDir(p: string) {
  mkdirSync(p, { recursive: true });
  return p;
}

export function chromiumPath(): string | undefined {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH ?? '/opt/pw-browsers';
  for (const p of [path.join(base, 'chromium-1194', 'chrome-linux', 'chrome'), '/opt/pw-browsers/chromium']) {
    if (existsSync(p)) return p;
  }
  return undefined;
}

/**
 * เบราว์เซอร์ที่ใช้: FILM_CHROME_CHANNEL (chrome/msedge) ถ้ากำหนด → Chromium ที่ติดตั้งไว้ในเครื่อง cloud →
 * Windows/macOS ใช้ Chrome ในเครื่อง (Windows ไม่มี Chrome ใช้ Edge แทน) · Linux อื่นใช้ค่าเริ่มต้นของ Playwright
 */
function browserChoice(): { channel?: string; executablePath?: string } {
  if (process.env.FILM_CHROME_CHANNEL) return { channel: process.env.FILM_CHROME_CHANNEL };
  const local = chromiumPath();
  if (local) return { executablePath: local };
  if (process.platform === 'win32') {
    const dirs = [process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA].filter((d): d is string => !!d);
    return { channel: dirs.some((d) => existsSync(path.join(d, 'Google', 'Chrome', 'Application', 'chrome.exe'))) ? 'chrome' : 'msedge' };
  }
  if (process.platform === 'darwin') return { channel: 'chrome' };
  return {};
}

/** headed: เปิดหน้าต่างเบราว์เซอร์ให้เห็น (บางเครื่องใช้การ์ดจอได้เฉพาะโหมดนี้) — หรือ FILM_HEADED=1 */
export async function launch(extraArgs: string[] = [], opts: { headed?: boolean } = {}): Promise<Browser> {
  return chromium.launch({
    ...browserChoice(),
    headless: !(opts.headed || process.env.FILM_HEADED === '1'),
    // หน้าต่างที่ถูกบัง/ย่อต้องไม่ถูกหน่วง ไม่งั้น seek ค้าง
    args: ['--no-proxy-server', '--disable-background-networking', '--disable-component-update', '--autoplay-policy=no-user-gesture-required', '--font-render-hinting=none', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', ...extraArgs],
  });
}

/** ชื่อตัววาด WebGL ของหน้า (เช่นชื่อการ์ดจอ หรือ SwiftShader เมื่อวาดด้วย CPU) */
export async function glRenderer(page: Page): Promise<string> {
  return page.evaluate(() => {
    const c = document.createElement('canvas');
    const g = c.getContext('webgl2') ?? c.getContext('webgl');
    if (!g) return 'none';
    const ext = g.getExtension('WEBGL_debug_renderer_info');
    const name = String(ext ? g.getParameter(ext.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER));
    g.getExtension('WEBGL_lose_context')?.loseContext();
    return name;
  });
}

export const isSoftwareGL = (name: string) => /swiftshader|llvmpipe|softpipe|software|basic render|^none$/i.test(name);

export function ffmpegPath(): string {
  const p = process.env.FFMPEG_PATH ?? 'ffmpeg';
  const r = spawnSync(p, ['-version'], { encoding: 'utf8' });
  if (r.status !== 0) {
    console.error(`ไม่พบ ffmpeg (${p}) — ติดตั้ง ffmpeg ในเครื่อง หรือกำหนด FFMPEG_PATH ให้ชี้ไปยังไฟล์ ffmpeg ที่มี libx264 และ aac`);
    process.exit(1);
  }
  return p;
}

export function ffprobeDuration(ff: string, file: string): number {
  const r = spawnSync(ff, ['-hide_banner', '-i', file], { encoding: 'utf8' });
  const m = /Duration: (\d+):(\d+):(\d+\.\d+)/.exec(r.stderr ?? '');
  return m ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) : 0;
}

export async function waitForServer(url = BASE_URL, timeoutMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(url, { method: 'HEAD' });
      if (r.status < 500) return;
    } catch {
      // ยังไม่ขึ้น
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  console.error(`เปิด ${url} ไม่ได้ — รัน npm run build && npm start -- -p 3100 ก่อน (DEMO_VIDEO.md 4.1)`);
  process.exit(1);
}

/** ข้อมูลทีมจาก team.local.json (SUBMISSION.md 3.1) — คืนรายการช่องที่ขาด */
export function teamPlaceholders(): string[] {
  const file = path.join(ROOT, 'team.local.json');
  if (!existsSync(file)) return ['team.local.json (ทั้งไฟล์)'];
  const team = JSON.parse(readFileSync(file, 'utf8')) as { teamName?: string; siteUrl?: string; members?: { fullNameTh?: string; studentId?: string }[] };
  const missing: string[] = [];
  if (!team.teamName) missing.push('teamName');
  if (!team.members?.length) missing.push('members');
  team.members?.forEach((mb, i) => {
    if (!mb.fullNameTh) missing.push(`members[${i}].fullNameTh`);
    if (!mb.studentId) missing.push(`members[${i}].studentId`);
  });
  if (!team.siteUrl) missing.push('siteUrl');
  return missing;
}

export const CUTS = ['demo', 'demo-short'] as const;
export type CutId = (typeof CUTS)[number];
