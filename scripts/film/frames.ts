/**
 * npm run film:frames -- --cut demo --locale th --t 1,25.5,40 [--out dir] [--clean]
 * จับภาพเฟรมเดี่ยว ๆ จาก /film สำหรับตรวจงาน (และใช้ทำภาพนิ่ง)
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { OUT, arg, ensureDir, flag, launch, waitForServer } from './lib.ts';
import { openFilm } from './render.ts';

const cut = arg('cut', 'demo')!;
const locale = arg('locale', 'th') === 'en' ? 'en' : 'th';
const times = (arg('t') ?? '0').split(',').map(Number);
const dir = ensureDir(arg('out') ?? path.join(OUT, 'frames'));

await waitForServer();
const browser = await launch(['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']);
const { ctx, page } = await openFilm(browser, cut, locale);
if (flag('clean')) await page.evaluate(() => window.__cozypetFilm!.setClean(true));
for (const t of times) {
  const s0 = Date.now();
  await page.evaluate((tt) => window.__cozypetFilm!.seek(tt), t);
  const buf = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1920, height: 1080 } });
  const file = path.join(dir, `${cut}-${locale}-${t.toFixed(2)}.png`);
  writeFileSync(file, buf);
  console.log(`${file} (${Date.now() - s0} ms)`);
}
await ctx.close();
await browser.close();
