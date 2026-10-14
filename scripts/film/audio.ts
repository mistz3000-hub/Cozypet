/**
 * npm run film:audio -- --cut demo --locale th
 * เรนเดอร์ดนตรี + เสียงประกอบจาก /film (OfflineAudioContext ในเบราว์เซอร์) → out/film/<cut>-<locale>/music.wav (48 kHz stereo 16-bit)
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { OUT, arg, ensureDir, launch, waitForServer } from './lib.ts';
import { openFilm } from './render.ts';

const cut = arg('cut', 'demo')!;
const locale = arg('locale', 'th') === 'en' ? 'en' : 'th';
const dir = ensureDir(path.join(OUT, `${cut}-${locale}`));

function wavHeader(dataBytes: number, sampleRate: number, channels: number): Buffer {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + dataBytes, 4);
  h.write('WAVE', 8);
  h.write('fmt ', 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(channels, 22);
  h.writeUInt32LE(sampleRate, 24);
  h.writeUInt32LE(sampleRate * channels * 2, 28);
  h.writeUInt16LE(channels * 2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36);
  h.writeUInt32LE(dataBytes, 40);
  return h;
}

export async function renderMusic(cutId: string, loc: string, file: string) {
  const browser = await launch(['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']);
  try {
    const { ctx, page } = await openFilm(browser, cutId, loc);
    const t0 = Date.now();
    const info = await page.evaluate(() => window.__cozypetFilm!.renderAudio());
    const parts: Buffer[] = [];
    for (let i = 0; i < info.chunks; i++) {
      const b64 = await page.evaluate((k) => window.__cozypetFilm!.audioChunk(k), i);
      parts.push(Buffer.from(b64, 'base64'));
    }
    const data = Buffer.concat(parts);
    writeFileSync(file, Buffer.concat([wavHeader(data.length, info.sampleRate, info.channels), data]));
    console.log(`✓ ${file} (${(info.frames / info.sampleRate).toFixed(1)} s, ${((Date.now() - t0) / 1000).toFixed(1)} s)`);
    await ctx.close();
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && import.meta.filename === path.resolve(process.argv[1])) {
  await waitForServer();
  await renderMusic(cut, locale, path.join(dir, 'music.wav'));
}
