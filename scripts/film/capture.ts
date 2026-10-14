/**
 * npm run film:capture -- --locale th [--only C2,C3] [--photo path]
 * อัดหน้าจอแอปจริงจาก production build ตาม DEMO_VIDEO.md หัวข้อ 4 (ฉบับ D33)
 * - ใช้ CDP Page.startScreencast เก็บทุกเฟรมพร้อมเวลา + บันทึก cue ของทุก action ลง capture.json
 * - เสียงในแอปปิด, reduced motion ปิด, Run 001, เขตเวลา Asia/Bangkok
 * - ไม่ใช้บัญชีจริง เว้นแต่กำหนด FILM_LOGIN_EMAIL/FILM_LOGIN_PASSWORD (ช็อตเข้าสู่ระบบ ทำบนเครื่องทีมเท่านั้น)
 */
import { existsSync, rmSync, writeFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { BrowserContext, CDPSession, Locator, Page } from '@playwright/test';
import { BASE_URL, OUT, ROOT, arg, ensureDir, launch, waitForServer } from './lib.ts';

type Locale = 'th' | 'en';
type CueType = 'tap' | 'type' | 'scroll' | 'mark' | 'point' | 'blur';
interface Box { x: number; y: number; w: number; h: number }
interface Cue { t: number; type: CueType; label?: string; x?: number; y?: number; box?: Box; to?: number }

const locale = (arg('locale', 'th') === 'en' ? 'en' : 'th') as Locale;
const only = arg('only')?.split(',').map((s) => s.trim().toUpperCase());
const photo = arg('photo') ?? [path.join(OUT, 'stills', 'khanomchan-street.png'), path.join(ROOT, 'public', 'mascot', 'cat-neutral.png')].find((p) => existsSync(p))!;
const outRoot = ensureDir(path.join(OUT, 'captures', locale));
const MOBILE = { width: 390, height: 844, dpr: 2 };
const DESKTOP = { width: 1440, height: 900, dpr: 1.25 };
const TYPE_MS = 60;
const READ_MS = 1200;

interface Plan { districtId: string; districtName: string; fullId: string; fullName: string; topId: string; topName: string; topIsPersona: boolean }
interface Texts { marks: string; name: string; assist: string; chat2: string }

class Recorder {
  private cdp: CDPSession | null = null;
  private frames: number[] = [];
  private cues: Cue[] = [];
  private t0 = 0;
  private dir = '';
  private writes: Promise<void>[] = [];
  private id = '';
  facts: Record<string, string> = {};

  private page: Page;
  private device: 'mobile' | 'desktop';

  constructor(page: Page, device: 'mobile' | 'desktop') {
    this.page = page;
    this.device = device;
  }

  now() {
    return (Date.now() - this.t0) / 1000;
  }

  async start(id: string) {
    this.id = id;
    this.dir = path.join(outRoot, id);
    rmSync(this.dir, { recursive: true, force: true });
    ensureDir(path.join(this.dir, 'frames'));
    this.frames = [];
    this.cues = [];
    this.facts = {};
    this.writes = [];
    this.cdp = await this.page.context().newCDPSession(this.page);
    this.cues.push({ t: 0, type: 'mark', label: `nav:${new URL(this.page.url()).pathname}` });
    const vp = this.page.viewportSize()!;
    const dpr = this.device === 'mobile' ? MOBILE.dpr : DESKTOP.dpr;
    this.t0 = Date.now();
    this.cdp.on('Page.screencastFrame', (ev: { data: string; sessionId: number; metadata: { timestamp?: number } }) => {
      const t = ev.metadata.timestamp ? ev.metadata.timestamp - this.t0 / 1000 : this.now();
      const n = this.frames.length + 1;
      this.frames.push(Math.max(0, t));
      this.writes.push(writeFile(path.join(this.dir, 'frames', `${String(n).padStart(6, '0')}.jpg`), Buffer.from(ev.data, 'base64')));
      void this.cdp?.send('Page.screencastFrameAck', { sessionId: ev.sessionId }).catch(() => undefined);
    });
    await this.cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: Math.round(vp.width * dpr), maxHeight: Math.round(vp.height * dpr), everyNthFrame: 1 });
    this.mark('start');
    // บังคับให้มีเฟรมแรกแม้หน้านิ่ง
    await this.page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(null))));
  }

  async stop() {
    this.mark('end');
    await this.page.waitForTimeout(250);
    await this.cdp?.send('Page.stopScreencast').catch(() => undefined);
    await Promise.all(this.writes);
    const vp = this.page.viewportSize()!;
    const dpr = this.device === 'mobile' ? MOBILE.dpr : DESKTOP.dpr;
    const meta = {
      id: this.id, locale, device: this.device,
      viewport: { w: vp.width, h: vp.height },
      frameSize: { w: Math.round(vp.width * dpr), h: Math.round(vp.height * dpr) },
      duration: this.now(), frames: this.frames, cues: this.cues, facts: this.facts,
    };
    writeFileSync(path.join(this.dir, 'capture.json'), JSON.stringify(meta, null, 1));
    console.log(`  ${this.id}: ${meta.duration.toFixed(1)}s · ${this.frames.length} เฟรม · ${this.cues.length} cue`);
    await this.cdp?.detach().catch(() => undefined);
    this.cdp = null;
  }

  mark(label: string) {
    this.cues.push({ t: this.now(), type: 'mark', label });
  }

  async box(loc: Locator): Promise<Box | undefined> {
    const b = await loc.boundingBox().catch(() => null);
    return b ? { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) } : undefined;
  }

  /** เลื่อนหน้าแบบนุ่มให้ element อยู่กลางจอ แล้วรอให้นิ่ง */
  async reveal(loc: Locator, block: 'center' | 'start' | 'end' = 'center') {
    await loc.waitFor({ state: 'visible', timeout: 15_000 });
    const moved = await loc.evaluate((el, blk) => {
      const r = el.getBoundingClientRect();
      const inView = r.top >= 70 && r.bottom <= window.innerHeight - 90;
      if (!inView) el.scrollIntoView({ behavior: 'smooth', block: blk as ScrollLogicalPosition });
      return !inView;
    }, block);
    if (moved) {
      this.cues.push({ t: this.now(), type: 'scroll' });
      await this.page.waitForTimeout(650);
    }
  }

  async tap(loc: Locator, label?: string, opts: { force?: boolean; noReveal?: boolean; hold?: number; dispatch?: boolean } = {}) {
    if (!opts.noReveal) await this.reveal(loc);
    await this.page.waitForTimeout(opts.hold ?? 220);
    const box = await this.box(loc);
    this.cues.push({ t: this.now(), type: 'tap', label, box, x: box ? box.x + box.w / 2 : undefined, y: box ? box.y + box.h / 2 : undefined });
    // dispatch: กดที่ element ตรง ๆ (หมุดบนแผนที่ซ้อนกันได้ การกดตามพิกัดอาจโดนหมุดอื่น)
    if (opts.dispatch) await loc.evaluate((el: HTMLElement) => el.click());
    else await loc.click({ force: opts.force, timeout: 10_000 });
  }

  async point(loc: Locator, label: string, ms = 900) {
    await this.reveal(loc);
    const box = await this.box(loc);
    this.cues.push({ t: this.now(), type: 'point', label, box, x: box ? box.x + box.w / 2 : undefined, y: box ? box.y + box.h / 2 : undefined, to: this.now() + ms / 1000 });
    await this.page.waitForTimeout(ms);
  }

  /** บันทึกกรอบของ element เป็น cue ทันที (ไม่รอ ไม่เลื่อนหน้า) */
  async cueBox(loc: Locator, label: string, ms: number) {
    const box = await this.box(loc);
    if (box) this.cues.push({ t: this.now(), type: 'point', label, box, to: this.now() + ms / 1000 });
  }

  async type(loc: Locator, text: string, label?: string) {
    await this.tap(loc, label ? `${label}-focus` : undefined);
    const box = await this.box(loc);
    const t = this.now();
    await loc.pressSequentially(text, { delay: TYPE_MS });
    this.cues.push({ t, type: 'type', label, box, to: this.now() });
  }

  async blurBox(loc: Locator, from: number, to: number) {
    const box = await this.box(loc);
    if (box) this.cues.push({ t: from, type: 'blur', box, to });
  }

  async hold(ms = READ_MS) {
    await this.page.waitForTimeout(ms);
  }

  async scrollBy(dy: number, ms = 700) {
    this.cues.push({ t: this.now(), type: 'scroll' });
    await this.page.evaluate((d) => window.scrollBy({ top: d, behavior: 'smooth' }), dy);
    await this.page.waitForTimeout(ms);
  }
}

const sel = {
  film: (id: string) => `[data-film="${id}"]`,
  tour: (id: string) => `[data-tour="${id}"]`,
};

async function newContext(device: 'mobile' | 'desktop', state?: Awaited<ReturnType<BrowserContext['storageState']>>) {
  const vp = device === 'mobile' ? MOBILE : DESKTOP;
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.dpr,
    isMobile: device === 'mobile',
    hasTouch: device === 'mobile',
    locale: locale === 'th' ? 'th-TH' : 'en-US',
    timezoneId: 'Asia/Bangkok',
    reducedMotion: 'no-preference',
    storageState: state,
  });
  await ctx.addCookies([{ name: 'cozypet_locale', value: locale, url: BASE_URL }]);
  return ctx;
}

async function settle(page: Page, ms = 600) {
  await page.waitForLoadState('load');
  await page.evaluate(() => document.fonts.ready.then(() => true));
  await page.waitForTimeout(ms);
}

/** ปิดป้าย Critical ล่วงหน้าใน context ใหม่ (sessionStorage เป็นต่อแท็บ) */
async function preDismissCritical(ctx: BrowserContext) {
  await ctx.addInitScript(() => {
    try { sessionStorage.setItem('cozypet:critical-notice:session:v1', '1'); } catch { /* */ }
  });
}

await waitForServer();
const browser = await launch([`--lang=${locale === 'th' ? 'th-TH' : 'en-US'}`]);
const want = (id: string) => !only || only.includes(id);

// ข้อความที่พิมพ์และแผนช็อตมาจาก /film (i18n และ Smart Load Balancer ชุดเดียวกับแอป)
const planCtx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const planPage = await planCtx.newPage();
await planPage.goto(`${BASE_URL}/film?record=1`, { waitUntil: 'load' });
await planPage.waitForFunction(() => !!window.__cozypetFilm, null, { timeout: 30_000 });
const tx = await planPage.evaluate((l) => window.__cozypetFilm!.captureTexts(l), locale) as Texts;
const plan = await planPage.evaluate(([text, l]) => window.__cozypetFilm!.capturePlan(text, l), [tx.assist, locale] as const) as Plan | null;
await planCtx.close();
if (!plan) {
  console.error('หาแผนช็อต C3 ไม่ได้ (ไม่มีเขตที่ที่ใกล้สุดเต็มแล้วไม่ใช่องค์กรจริง)');
  process.exit(1);
}
writeFileSync(path.join(ensureDir(OUT), `capture-plan.${locale}.json`), JSON.stringify(plan, null, 2));
console.log(`แผน C3: เขต ${plan.districtName} · ที่ใกล้สุดที่เต็ม ${plan.fullName} (${plan.fullId}) · อันดับ 1 ${plan.topName} (${plan.topId})${plan.topIsPersona ? '' : ' — ไม่ใช่ persona ของ Run ใช้ชื่อจริงในคำบรรยาย'}`);

console.log(`อัดหน้าจอ (${locale}) จาก ${BASE_URL} · รูปที่ใช้อัปโหลด: ${path.relative(ROOT, photo)}`);

// ── มือถือ: C0–C6 ต่อเนื่องใน browser เดียว (ประวัติต่อเนื่องตามเรื่อง: ประกาศ ขนมชั้น → แชต → แพ็กเกจ)
const mctx = await newContext('mobile');

const page = await mctx.newPage();
const rec = new Recorder(page, 'mobile');
page.on('pageerror', (e) => console.warn('  pageerror:', e.message.slice(0, 160)));
page.on('framenavigated', (f) => {
  if (f === page.mainFrame()) rec.mark(`nav:${new URL(f.url()).pathname}`);
});

// C0 — เปิดเว็บครั้งแรก ป้าย Critical (D30) → ปิดด้วยมือ
await page.goto(`${BASE_URL}/`, { waitUntil: 'load' });
if (want('C0')) {
  await rec.start('C0');
  await settle(page, 300);
  const dlg = page.getByRole('dialog');
  await dlg.waitFor({ state: 'visible', timeout: 15_000 });
  rec.mark('notice');
  await page.waitForTimeout(1500);
  await dlg.locator('img').first().evaluate((img: HTMLImageElement) => img.decode?.().catch(() => undefined)).catch(() => undefined);
  const firstCase = dlg.locator('article, li').first();
  await rec.point(firstCase, 'case', 1500);
  await rec.tap(dlg.getByRole('button', { name: locale === 'th' ? 'ปิด' : 'Close' }).first(), 'close', { noReveal: true });
  await page.waitForTimeout(400);
  rec.mark('home');
  await rec.hold(1800);
  await rec.stop();
} else {
  await page.getByRole('dialog').getByRole('button', { name: locale === 'th' ? 'ปิด' : 'Close' }).first().click().catch(() => undefined);
}

// C1 — ทดลอง Demo (Run 001) → แดชบอร์ด → กองอาหาร 50/100 (D26)
await page.goto(`${BASE_URL}/start?next=${encodeURIComponent('/dashboard')}`, { waitUntil: 'load' });
await settle(page);
if (want('C1')) await rec.start('C1');
// ช็อตเข้าสู่ระบบจริง (Google/อีเมล) อัดบนเครื่องทีมที่เข้าถึงเว็บสาธารณะได้เท่านั้น — สคริปต์นี้ใช้เส้นทางทดลอง Demo
rec.facts.login = 'demo';
await rec.type(page.locator('input[inputmode="numeric"]').first(), '001', 'run');
await page.waitForTimeout(400);
await rec.tap(page.locator('form button[type="submit"]').first(), 'start-run');
await page.waitForURL('**/dashboard', { timeout: 20_000 });
await settle(page, 300);
rec.mark('dashboard');
await rec.hold(1600);
const micro = page.locator(sel.tour('micro-donation'));
await rec.reveal(micro.locator('h2, h3').first(), 'start');
await rec.hold(700);
await rec.tap(micro.locator('input[type="checkbox"]').first(), 'micro-ack', { force: true });
for (const amount of [50, 100]) {
  await rec.tap(micro.locator('button').filter({ hasText: String(amount) }).first(), `micro-${amount}`);
  const dlg = page.getByRole('dialog');
  await dlg.waitFor({ state: 'visible' });
  await dlg.locator('img').first().waitFor({ state: 'visible', timeout: 15_000 }).catch(() => undefined);
  await page.waitForTimeout(500);
  await rec.tap(dlg.locator('input[type="checkbox"]').first(), `qr-ack-${amount}`, { force: true });
  await rec.tap(dlg.getByRole('button').last(), `paid-${amount}`);
  await dlg.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => undefined);
  await page.waitForTimeout(700);
  rec.mark(`micro-done-${amount}`);
}
await rec.reveal(micro.locator('h2, h3').first(), 'start');
await rec.hold(1500);
if (want('C1')) await rec.stop();

// C2 — สแกนจำลอง กรณียังไม่พบ → ลงประกาศพบสัตว์ “ขนมชั้น”
await page.goto(`${BASE_URL}/scan`, { waitUntil: 'load' });
await settle(page);
if (want('C2')) await rec.start('C2');
await rec.hold(700);
const choose = page.locator(sel.tour('scan-upload')).getByRole('button').nth(1);
await rec.tap(choose, 'choose-photo');
await page.locator('input[type="file"][accept^="image/jpeg"]').first().setInputFiles(photo);
await page.waitForTimeout(900);
rec.mark('photo');
await rec.hold(900);
await rec.tap(page.locator('label').filter({ has: page.locator('input[type="radio"][value="cat"]') }).first(), 'species');
for (const c of ['orange', 'tabby']) {
  await rec.tap(page.locator(`label[data-value="${c}"]`).first(), `color-${c}`);
}
await rec.type(page.locator('textarea').first(), tx.marks, 'markings');
await rec.tap(page.locator('label').filter({ has: page.locator('input[type="radio"][value="no"]') }).first(), 'collar-no');
const district = page.locator('[role="combobox"]').first();
await rec.tap(district, 'district-open');
await page.waitForTimeout(500);
await rec.tap(page.getByRole('option', { name: plan.districtName, exact: true }).first(), 'district');
await rec.tap(page.locator('label').filter({ has: page.locator('input[type="radio"][value="nomatch"]') }).first(), 'case-nomatch');
await rec.tap(page.locator('form button[type="submit"]').last(), 'scan');
await page.locator('[data-film="scan-notfound"], h2[tabindex="-1"]').first().waitFor({ state: 'visible', timeout: 15_000 });
await page.waitForTimeout(300);
rec.mark('result');
await rec.point(page.locator('[data-film="scan-notfound"]').first(), 'notfound', 2200);
await rec.tap(page.locator('[data-film="post-found"]').first(), 'post');
await page.waitForURL('**/listings/new**', { timeout: 15_000 });
await settle(page, 400);
rec.mark('form');
await rec.hold(800);
await rec.type(page.locator('[data-film="listing-name"]').first(), tx.name, 'name');
await rec.hold(500);
await rec.tap(page.locator('form button[type="submit"]').last(), 'preview');
await page.waitForTimeout(700);
rec.mark('preview-shown');
await rec.hold(1200);
await rec.tap(page.locator('[data-film="listing-submit"]').first(), 'submit');
await page.locator('[data-film="listing-done"]').first().waitFor({ state: 'visible', timeout: 15_000 });
rec.mark('done');
await rec.hold(2000);
if (want('C2')) await rec.stop();

// C3 — เล่าให้ AI ช่วยสรุป → ค้นหา → แตะที่เต็ม → pop-up แนะนำ → เบื้องหลัง → คุยกับผู้รับดูแล
await page.goto(`${BASE_URL}/nearby?district=${plan.districtId}`, { waitUntil: 'load' });
await settle(page);
if (want('C3')) await rec.start('C3');
await rec.hold(600);
const assistBox = page.locator(sel.tour('nearby-assist'));
await rec.type(assistBox.locator('textarea').first(), tx.assist, 'assist');
await rec.tap(assistBox.locator('[data-assist-submit="true"]').first(), 'assist-submit');
await assistBox.locator('[data-film="assist-result"]').first().waitFor({ state: 'visible', timeout: 20_000 });
rec.facts.assistSource = (await assistBox.locator('[data-film="assist-result"]').getAttribute('data-source')) ?? 'rules';
rec.mark('chips');
await rec.point(assistBox.locator('[data-film="assist-result"]').first(), 'chips-box', 2400);
await rec.tap(assistBox.locator('[data-film="assist-apply"]').first(), 'apply');
await page.waitForTimeout(300);
rec.mark('searching');
await rec.reveal(page.locator(sel.tour('nearby-legend')), 'start');
await page.locator('[data-film="nearby-results"]').first().waitFor({ state: 'visible', timeout: 20_000 });
rec.mark('results');
await rec.hold(1500);
const pinInfo = await page.evaluate(() => Array.from(document.querySelectorAll('[data-pin-id]')).map((el) => `${el.getAttribute('data-pin-id')}:${el.getAttribute('data-level')}:${el.tagName}`));
const pointText = await page.locator('[class*="pointMain"]').first().textContent().catch(() => '');
console.log(`  C3 จุดค้นหา: ${pointText?.trim()} · หมุด ${pinInfo.length}: ${pinInfo.filter((p) => p.includes(':full')).join(', ')}`);
const fullPin = page.locator(`[data-pin-id="${plan.fullId}"]`).first();
await rec.tap(fullPin, 'full-pin', { dispatch: true });
const popup = page.locator(sel.tour('nearby-popup'));
await popup.waitFor({ state: 'visible', timeout: 10_000 });
await page.waitForTimeout(500);
rec.mark('popup');
const firstRec = popup.locator('li').first();
rec.facts.name = (await firstRec.locator('h3').first().textContent().catch(() => null))?.trim() ?? plan.topName;
rec.facts.topId = plan.topId;
rec.facts.fullName = plan.fullName;
await rec.point(firstRec, 'rec-1', 2000);
await rec.tap(page.locator('[data-popup-why="true"]').first(), 'why');
await page.waitForTimeout(700);
rec.mark('why-open');
await rec.point(page.locator(sel.tour('nearby-why')).first(), 'why-panel', 2800);
await rec.tap(firstRec.locator('a[href*="/chat/new"]').first(), 'chat');
await page.waitForURL('**/chat/**', { timeout: 20_000 });
await settle(page, 300);
rec.mark('chat-open');
await rec.hold(500);
if (want('C3')) await rec.stop();

// C5 — แชต: คำถามสำเร็จรูป → อ่านแล้ว → ตอบ → ยืนยันส่งต่อน้อง (จำลอง) → ฉลอง
// หน้าแชตสูงเต็มจอและเลื่อนในกล่องข้อความเอง จึงไม่เลื่อนหน้า (noReveal)
await page.evaluate(() => window.scrollTo(0, 0));
const assistantCount = () => page.locator('[data-film="msg-assistant"]').count();
const waitAssistant = async (n: number) => {
  await page.waitForFunction((k) => document.querySelectorAll('[data-film="msg-assistant"]').length >= k, n, { timeout: 30_000 }).catch(() => console.warn('  ไม่พบคำตอบในเวลา'));
};
if (want('C5')) await rec.start('C5');
await rec.hold(900);
let before = await assistantCount();
await rec.tap(page.locator(`${sel.tour('chat-quick')} button`).first(), 'quick', { noReveal: true, dispatch: true });
await page.locator('[data-film="msg-read"]').last().waitFor({ state: 'visible', timeout: 20_000 }).catch(() => undefined);
rec.mark('read');
await rec.cueBox(page.locator('[data-film="msg-read"]').last(), 'read-status', 1800);
await waitAssistant(before + 1);
rec.mark('reply-1');
rec.facts.chatSource = (await page.locator('[data-film="chat-source"]').first().getAttribute('data-source').catch(() => null)) ?? 'demo';
await rec.hold(2000);
before = await assistantCount();
await rec.tap(page.locator('form textarea').first(), 'chat-type-focus', { noReveal: true });
const typeStart = rec.now();
await page.locator('form textarea').first().pressSequentially(tx.chat2, { delay: TYPE_MS });
rec.mark('chat-typed');
void typeStart;
await rec.tap(page.locator('form button[type="submit"]').first(), 'chat-send', { noReveal: true, dispatch: true });
await waitAssistant(before + 1);
rec.mark('reply-2');
await rec.hold(2000);
await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
await page.waitForTimeout(400);
await rec.tap(page.locator(`${sel.tour('chat-handoff')} button`).first(), 'handoff', { noReveal: true, dispatch: true });
const sheet = page.getByRole('dialog');
await sheet.waitFor({ state: 'visible' });
await page.waitForTimeout(500);
rec.mark('sheet');
await rec.hold(1600);
const waitBox = sheet.locator('input[type="checkbox"]');
if (await waitBox.count()) await rec.tap(waitBox.first(), 'wait-ack', { force: true });
await rec.tap(sheet.locator('[data-film="handoff-confirm"]').first(), 'handoff-confirm');
await page.locator('[data-film="handoff-card"]').first().waitFor({ state: 'visible', timeout: 10_000 });
rec.mark('celebrate');
await rec.hold(3400);
if (want('C5')) await rec.stop();

// C6 — ส่งแพ็กเกจของใช้ (คำสั่งจำลอง): ผู้รับที่ขาดแคลนที่สุด → แพ็กเกจ → ความโปร่งใส → QR ทดลอง → แบ่งเงิน 10% → คู่ค้าส่งตรง → timeline
await page.goto(`${BASE_URL}/donate`, { waitUntil: 'load' });
await settle(page);
if (want('C6')) await rec.start('C6');
await rec.hold(1200);
const target = page.locator(`${sel.tour('donate-targets')} li`).first();
await rec.point(target, 'target-1', 1400);
await rec.tap(target.getByRole('button').first(), 'pick-target');
await page.waitForTimeout(500);
rec.mark('packages');
await rec.tap(page.locator('[data-film="package"]').first(), 'package');
await rec.tap(page.locator('[data-film="donate-next"]').first(), 'next');
await page.waitForTimeout(500);
rec.mark('summary');
await rec.reveal(page.locator(sel.tour('donate-transparency')));
await rec.hold(1600);
await rec.tap(page.locator('[data-film="donate-ack"] input, [data-film="donate-ack"]').first(), 'ack', { force: true });
await rec.tap(page.locator(`${sel.tour('donate-confirm')} button`).first(), 'confirm');
const pay = page.getByRole('dialog');
await pay.waitFor({ state: 'visible' });
await pay.locator('img').first().waitFor({ state: 'visible', timeout: 15_000 }).catch(() => undefined);
await page.waitForTimeout(600);
rec.mark('qr');
await rec.tap(pay.locator('input[type="checkbox"]').first(), 'qr-ack', { force: true });
await rec.tap(pay.getByRole('button').last(), 'paid');
await page.waitForURL('**/donate/orders/**', { timeout: 20_000 });
await settle(page, 300);
rec.mark('order');
await rec.hold(1000);
const flow = page.locator(sel.tour('business-money-flow'));
await rec.reveal(flow);
rec.facts.pct = (await flow.getAttribute('data-pct')) ?? '';
await rec.point(flow, 'money-flow', 300);
await rec.tap(flow.getByRole('button').first(), 'split');
await page.waitForTimeout(700);
rec.mark('split-done');
await rec.hold(1200);
await rec.tap(flow.getByRole('button').first(), 'transfer');
await page.waitForTimeout(700);
rec.mark('transfer-done');
await rec.hold(900);
await rec.tap(page.locator('[data-film="order-fast"]').first(), 'fast');
await page.waitForTimeout(1200);
rec.mark('arrived');
await rec.reveal(page.locator('[data-film="order-thanks"]').first());
await rec.hold(2200);
if (want('C6')) await rec.stop();

// C9 — สลับภาษา (มือถือ) ไทย → EN
const state = await mctx.storageState();
if (want('C9')) {
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'load' });
  await settle(page);
  await rec.start('C9');
  await rec.hold(900);
  await rec.tap(page.locator('[aria-controls="cp-mobile-menu"]').first(), 'menu');
  await page.waitForTimeout(500);
  const target = locale === 'th' ? 'en' : 'th';
  await rec.tap(page.locator(`#cp-mobile-menu button[lang="${target}"]`).first(), 'lang');
  await page.waitForTimeout(500);
  await rec.tap(page.locator('[aria-controls="cp-mobile-menu"]').first(), 'menu-close');
  rec.mark('switched');
  const wide = await page.evaluate(() => {
    const out: string[] = [];
    document.querySelectorAll('main *').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.right > window.innerWidth + 2 && r.width > 60 && !(el instanceof SVGElement)) out.push(`${el.tagName}.${String((el as HTMLElement).className).slice(0, 40)} ${Math.round(r.width)}w → ${Math.round(r.right)}`);
    });
    return { scrollWidth: document.documentElement.scrollWidth, out: out.slice(0, 8) };
  });
  if (wide.scrollWidth > 390 || wide.out.length) console.warn('  C9 ล้นจอหลังสลับภาษา:', JSON.stringify(wide));
  await rec.hold(1200);
  await rec.scrollBy(500, 900);
  await rec.hold(800);
  await rec.stop();
  // คืนภาษาเดิมให้ช็อตต่อไป
  await page.locator('[aria-controls="cp-mobile-menu"]').first().click();
  await page.locator(`#cp-mobile-menu button[lang="${locale}"]`).first().click();
}
await mctx.close();

// ── Desktop: C7 แดชบอร์ด (รายได้แยกจากเงินช่วยเหลือ) + Profile · C8 จำลองสถานการณ์
const dctx = await newContext('desktop', state);
await preDismissCritical(dctx);
const dpage = await dctx.newPage();
const drec = new Recorder(dpage, 'desktop');
if (want('C7')) {
  await dpage.goto(`${BASE_URL}/dashboard`, { waitUntil: 'load' });
  await settle(dpage, 900);
  await drec.start('C7');
  await drec.hold(1500);
  await drec.reveal(dpage.locator(sel.tour('crisis-cases')), 'start');
  await drec.hold(1200);
  await drec.reveal(dpage.locator(sel.tour('business-revenue')), 'start');
  drec.mark('revenue');
  await drec.hold(1800);
  await dpage.goto(`${BASE_URL}/profile`, { waitUntil: 'load' });
  await settle(dpage, 300);
  drec.mark('profile');
  await drec.reveal(dpage.locator(sel.tour('profile-credit')), 'start');
  await drec.hold(2200);
  await drec.stop();
}
if (want('C8')) {
  await dpage.goto(`${BASE_URL}/insights`, { waitUntil: 'load' });
  await settle(dpage, 600);
  await drec.start('C8');
  await drec.hold(800);
  await drec.reveal(dpage.locator(sel.tour('insights-controls')), 'start');
  await drec.tap(dpage.locator('[data-film="sim-run"]').first(), 'run');
  await dpage.locator('[data-film="sim-kpis"]').first().waitFor({ state: 'visible', timeout: 10_000 });
  drec.mark('kpis');
  drec.facts.sim = (await dpage.locator('[data-film="sim-kpis"]').getAttribute('data-sim')) ?? '';
  await drec.reveal(dpage.locator('[data-film="sim-kpis"]').first(), 'start');
  await drec.hold(2600);
  await drec.scrollBy(420, 1200);
  await drec.hold(1200);
  await drec.stop();
}
await dctx.close();
await browser.close();
console.log(`เสร็จ → ${path.relative(ROOT, outRoot)}`);
