'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { filmEn } from '@/i18n/film-en';
import { filmTh } from '@/i18n/film-th';
import { HELPER_WEIGHTS } from '@/lib/balancer-config';
import { runSimulation } from '@/lib/simulation';
import type { CaptureIndex } from './capture';
import { capturePlan } from './plan';
import { captionText, fill, type FilmContext, type FilmFacts, type TeamInfo } from './context';
import { getCut, realUsageRatio, scenesOf, shotAt, type Cut, type SceneId, type Shot, type Transition } from './cuts';
import { createKit, type GLKit, type GLScene } from './gl';
import { Compositor, pawMaskTexture } from './compositor';
import { DeviceScene } from './device';
import { ExplainLayer } from './explain';
import { ExplainDom } from './ExplainDom';
import { RichKinetic, plain } from './props/dom';
import { DEFAULT_POST, Post, type PostOpts } from './post';
import { DEVICE_POST } from './device';
import { SCENES } from './scenes';
import { buildSubtitles, type SubtitleLine } from './subtitles';
import { voPlan, type VoLine, type VoTrack } from './vo';
import { clamp, ease, prog, BAR } from './timeline';
import s from './film.module.css';

const TRANS: Record<Transition, number> = { cut: 0, paw: BAR / 2, fade: 0.5, flyIn: 0, mapIn: 1.0, boxIn: 1.0, windows: 0 };

interface FilmApi {
  duration(): number;
  ready(): Promise<{ webgl: boolean }>;
  seek(t: number): Promise<void>;
  renderAudio(): Promise<{ sampleRate: number; channels: number; frames: number; chunks: number }>;
  audioChunk(i: number): Promise<string>;
  subtitles(): SubtitleLine[];
  capturePlan(text: string, locale: 'th' | 'en'): ReturnType<typeof capturePlan>;
  captureTexts(locale: 'th' | 'en'): typeof filmTh.capture;
  voPlan(lang: 'th' | 'en'): { duration: number; lines: VoLine[] };
  info(): { duration: number; realUsage: number; shots: { id: string; start: number; dur: number; kind: string }[]; facts: FilmFacts };
  setClean(on: boolean): Promise<void>;
}

declare global {
  interface Window {
    __cozypetFilm?: FilmApi;
    __filmCaptures?: CaptureIndex;
    __filmVoice?: VoTrack;
  }
}

function buildFacts(captures: CaptureIndex, locale: 'th' | 'en', team: TeamInfo | null): FilmFacts {
  const c3 = captures.C3?.facts ?? {};
  const plan = c3.name ? null : capturePlan((locale === 'en' ? filmEn : filmTh).capture.assist, locale);
  const run = runSimulation();
  const sim = Number(captures.C8?.facts.sim) || run.reductionPct;
  const st = team?.stat;
  return {
    name: c3.name || plan?.topName || '',
    sim,
    assistAi: c3.assistSource === 'ai',
    chatAi: captures.C5?.facts.chatSource === 'ai',
    login: captures.C1?.facts.login === 'account',
    pct: Number(captures.C6?.facts.pct) || 10,
    weights: { space: Math.round(HELPER_WEIGHTS.space * 100), distance: Math.round(HELPER_WEIGHTS.proximity * 100), urgency: Math.round(HELPER_WEIGHTS.urgency * 100) },
    homeId: 'adopter-001',
    cases: run.a.totals.arrivals,
    calls: { before: run.a.totals.calls, after: run.b.totals.calls },
    stat: st && Number.isFinite(st.value) && st.source ? { value: st.value, label: (locale === 'en' ? st.labelEn : null) ?? st.label, source: st.source } : undefined,
  };
}

interface Layer { shot: Shot; lt: number; z: number; style: CSSProperties; outgoing: boolean }
interface Frame { layers: Layer[]; tr: Transition; p: number }

const PAW_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="#000"><ellipse cx="50" cy="64" rx="24" ry="20"/><ellipse cx="22" cy="40" rx="9" ry="11"/><ellipse cx="38" cy="24" rx="9" ry="12"/><ellipse cx="62" cy="24" rx="9" ry="12"/><ellipse cx="78" cy="40" rx="9" ry="11"/></g></svg>';
const pawSizeAt = (p: number) => 30 + 4200 * ease.in(p);

function frameAt(cut: Cut, t: number): Frame {
  const cur = shotAt(cut, t);
  const lt = t - cur.start;
  const tr = cur.transitionIn ?? 'cut';
  const d = TRANS[tr];
  if (d > 0 && lt < d && cur.index > 0) {
    const prev = cut.shots[cur.index - 1];
    const p = clamp(lt / d);
    const inStyle: CSSProperties = {};
    if (tr === 'paw') {
      const mask = `url("data:image/svg+xml,${encodeURIComponent(PAW_SVG)}") center / ${pawSizeAt(p)}px ${pawSizeAt(p)}px no-repeat`;
      Object.assign(inStyle, { mask, WebkitMask: mask });
    } else if (tr === 'fade') inStyle.opacity = ease.inOut(p);
    else if (tr === 'mapIn' || tr === 'boxIn') inStyle.opacity = prog(p, 0.55, 1);
    const outStyle: CSSProperties = tr === 'mapIn' || tr === 'boxIn' ? { opacity: 1 - prog(p, 0, 0.3) } : {};
    return {
      tr, p,
      layers: [
        { shot: prev, lt: prev.dur + lt, z: 10, style: outStyle, outgoing: true },
        { shot: cur, lt, z: 20, style: inStyle, outgoing: false },
      ],
    };
  }
  return { tr: 'cut', p: 1, layers: [{ shot: cur, lt, z: 20, style: {}, outgoing: false }] };
}

/** ค่าของ post-process ตามช็อต (ฉากเล่าเรื่องกำหนดเองได้ · ช็อตแอปใช้ค่ากลาง) */
function postFor(cur: Layer, prev: Layer | null): PostOpts {
  const of = (l: Layer): PostOpts => (l.shot.scene ? SCENES[l.shot.scene].post?.(l.lt, l.shot.dur) ?? {} : DEVICE_POST);
  const o = of(cur);
  if (!prev) return o;
  // ช่วงเปลี่ยนช็อต: ใช้ค่าที่อ่อนกว่าของทั้งสองฝั่ง (ไม่ให้ฟุ้งกระโดด)
  const p = of(prev);
  return { ...p, ...o, bloom: Math.min(o.bloom ?? DEFAULT_POST.bloom, p.bloom ?? DEFAULT_POST.bloom) };
}

function prevKind(cut: Cut, shot: Shot, ctx: FilmContext): 'capture-mobile' | 'capture-desktop' | 'scene' | 'none' {
  const prev = cut.shots[shot.index - 1];
  if (!prev) return 'none';
  if (!prev.capture) return 'scene';
  return ctx.captures[prev.capture]?.device === 'desktop' ? 'capture-desktop' : 'capture-mobile';
}

export function FilmPlayer({ cutId, locale, record, team }: { cutId: string; locale: 'th' | 'en'; record: boolean; team: TeamInfo | null }) {
  const cut = useMemo(() => getCut(cutId), [cutId]);
  const [captures] = useState<CaptureIndex>(() => (typeof window !== 'undefined' ? window.__filmCaptures ?? {} : {}));
  const [voice] = useState<VoTrack | null>(() => (typeof window !== 'undefined' ? window.__filmVoice ?? null : null));
  const ctx = useMemo<FilmContext>(() => ({
    locale,
    fm: locale === 'en' ? filmEn : filmTh,
    sub: locale === 'th' ? filmEn : null,
    facts: buildFacts(captures, locale, team),
    team,
    captures,
    record,
  }), [locale, captures, team, record]);
  const [t, setT] = useState(0);
  const [clean, setCleanState] = useState(false);
  const [webgl, setWebgl] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [fit, setFit] = useState({ k: 1, x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const kitRef = useRef<GLKit | null>(null);
  const glRef = useRef(new Map<SceneId, GLScene>());
  const deviceRef = useRef<DeviceScene | null>(null);
  const compRef = useRef<Compositor | null>(null);
  const postRef = useRef<Post | null>(null);
  const readyRef = useRef<Promise<{ webgl: boolean }> | null>(null);
  const waiters = useRef<(() => void)[]>([]);
  const tRef = useRef(0);

  const frame = frameAt(cut, t);
  /** ขั้นตอนการใช้งาน = บทของช็อตแอปจริงตามลำดับ */
  const steps = useMemo(() => [...new Set(cut.shots.filter((x) => x.capture).map((x) => x.chapter))], [cut]);

  /** วาดชั้น WebGL ของเฟรมนี้ (ฉากเดียว หรือสองฉากผสมกันตอนเปลี่ยนช็อต) */
  const drawGL = useCallback((f: Frame) => {
    const kit = kitRef.current;
    const device = deviceRef.current;
    if (!kit) return;
    const drawLayer = (l: Layer, override?: Parameters<DeviceScene['render']>[5]) => {
      if (l.shot.capture) {
        device?.render(l.shot, l.lt, ctx, kit, prevKind(cut, l.shot, ctx), override);
        return;
      }
      const sc = l.shot.scene ? glRef.current.get(l.shot.scene) : undefined;
      if (sc) sc.render(l.lt, kit, l.shot);
      else {
        kit.renderer.setClearColor('#fffdf8');
        kit.renderer.clear();
      }
    };
    const post = postRef.current;
    const out = post ? post.input() : null;
    const cur = f.layers[f.layers.length - 1];
    const T = cur.shot.start + cur.lt;
    const opts = postFor(cur, f.layers.length === 1 ? null : f.layers[0]);
    const finish = () => {
      if (post) post.finish(kit, T, opts);
    };
    if (f.layers.length === 1) {
      kit.renderer.setRenderTarget(out);
      drawLayer(f.layers[0]);
      finish();
      return;
    }
    const [a, b] = f.layers;
    const comp = compRef.current;
    if (!comp) {
      kit.renderer.setRenderTarget(out);
      drawLayer(b);
      finish();
      return;
    }
    if ((f.tr === 'mapIn' || f.tr === 'boxIn') && b.shot.capture) {
      // ฉากเล่าเรื่องย่อเข้าไปเป็นจอโทรศัพท์ (match cut)
      kit.renderer.setRenderTarget(comp.targetA());
      drawLayer(a);
      kit.renderer.setRenderTarget(out);
      drawLayer(b, { tex: comp.targetA().texture, mix: prog(f.p, 0.45, 0.95), camFill: 1 - ease.inOut(f.p) });
      finish();
      return;
    }
    kit.renderer.setRenderTarget(comp.targetA());
    drawLayer(a);
    kit.renderer.setRenderTarget(comp.targetB());
    drawLayer(b);
    comp.composite(kit, f.tr === 'paw' ? 'paw' : 'fade', ease.inOut(f.p), pawSizeAt(f.p), out);
    finish();
  }, [ctx, cut]);

  useLayoutEffect(() => {
    drawGL(frame);
    const w = waiters.current;
    waiters.current = [];
    w.forEach((fn) => fn());
  });

  const ready = useCallback(() => {
    if (!readyRef.current) {
      readyRef.current = (async () => {
        await document.fonts.ready;
        const canvas = canvasRef.current;
        const kit = canvas ? createKit(canvas, record) : null;
        kitRef.current = kit;
        if (kit) {
          compRef.current = new Compositor(await pawMaskTexture(kit));
          // ?post=0 ปิด post-process (ใช้ตรวจหาปัญหา)
          if (new URLSearchParams(window.location.search).get('post') !== '0') postRef.current = new Post(new URLSearchParams(window.location.search).get('msaa') === '0' ? 0 : 4);
          if (cut.shots.some((x) => x.capture)) {
            const d = new DeviceScene();
            await d.init(kit);
            deviceRef.current = d;
          }
          for (const id of scenesOf(cut)) {
            const mod = SCENES[id];
            if (!mod.gl || glRef.current.has(id)) continue;
            const scene = mod.gl(ctx);
            await scene.init(kit);
            glRef.current.set(id, scene);
          }
          // prop อธิบายขั้นตอน (ต้องสร้างหลังบท 0 เพราะใช้ “ภาพแรกบนถนน”)
          if (deviceRef.current) {
            const ex = new ExplainLayer();
            await ex.init(kit, ctx);
            deviceRef.current.explain = ex;
          }
        }
        setWebgl(!!kit);
        return { webgl: !!kit };
      })();
    }
    return readyRef.current;
  }, [cut, ctx, record]);

  const prepare = useCallback(async (nt: number) => {
    const f = frameAt(cut, nt);
    for (const l of f.layers) {
      if (l.shot.capture) await deviceRef.current?.prepare(l.shot, l.lt, ctx);
      else if (l.shot.scene) await glRef.current.get(l.shot.scene)?.prepare?.(l.lt, l.shot);
    }
  }, [cut, ctx]);

  const seek = useCallback(async (nt: number) => {
    await ready();
    const target = Math.max(0, Math.min(nt, cut.duration - 1e-6));
    await prepare(target);
    await new Promise<void>((resolve) => {
      waiters.current.push(resolve);
      tRef.current = target;
      setT(target);
      requestAnimationFrame(() => {
        if (waiters.current.includes(resolve)) {
          drawGL(frameAt(cut, target));
          waiters.current = waiters.current.filter((fn) => fn !== resolve);
          resolve();
        }
      });
    });
    const imgs = Array.from(stageRef.current?.querySelectorAll('img') ?? []);
    await Promise.all(imgs.map((img) => (img.complete && img.naturalWidth ? Promise.resolve() : img.decode().catch(() => undefined))));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  }, [cut, ready, prepare, drawGL]);

  useEffect(() => {
    const api: FilmApi = {
      duration: () => cut.duration,
      ready,
      seek,
      renderAudio: async () => {
        const { renderAudio } = await import('./audio/render');
        return renderAudio(cut, ctx);
      },
      audioChunk: async (i) => {
        const { audioChunk } = await import('./audio/render');
        return audioChunk(i);
      },
      subtitles: () => buildSubtitles(cut, ctx, voice),
      capturePlan: (text, l) => capturePlan(text, l),
      captureTexts: (l) => (l === 'en' ? filmEn : filmTh).capture,
      voPlan: (l) => ({ duration: cut.duration, lines: voPlan(cut, l === 'en' ? filmEn : filmTh, ctx) }),
      info: () => ({ duration: cut.duration, realUsage: realUsageRatio(cut), shots: cut.shots.map((x) => ({ id: x.id, start: x.start, dur: x.dur, kind: x.capture ?? x.scene ?? '' })), facts: ctx.facts }),
      setClean: async (on) => {
        setCleanState(on);
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      },
    };
    window.__cozypetFilm = api;
    void ready();
    return () => {
      if (window.__cozypetFilm === api) delete window.__cozypetFilm;
    };
  }, [cut, ctx, ready, seek, voice]);

  useEffect(() => {
    if (record) return;
    const onResize = () => {
      const k = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
      setFit({ k, x: (window.innerWidth - 1920 * k) / 2, y: (window.innerHeight - 1080 * k) / 2 });
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [record]);

  // เล่นในโหมดดูตัวอย่าง (นาฬิกาจริง ไม่ใช้ตอนอัด)
  useEffect(() => {
    if (!playing || record) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const next = tRef.current + (now - last) / 1000;
      last = now;
      if (next >= cut.duration) {
        setPlaying(false);
        return;
      }
      tRef.current = next;
      void prepare(next);
      setT(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, record, cut.duration, prepare]);

  const cur = frame.layers[frame.layers.length - 1];
  const glShot = frame.layers.length === 1 ? cur : null;
  const canvasStyle = glShot?.shot.scene ? SCENES[glShot.shot.scene].canvasStyle?.(glShot.lt, glShot.shot.dur) : undefined;

  return (
    <div className={s.viewport} style={record ? { background: 'transparent', display: 'block' } : undefined}>
      <div ref={stageRef} className={s.stage} style={record ? undefined : { transform: `translate(${fit.x}px, ${fit.y}px) scale(${fit.k})` }} data-film-stage="true">
        <div className={s.glWrap} style={{ visibility: webgl ? 'visible' : 'hidden', ...canvasStyle }}>
          <canvas ref={canvasRef} className={s.canvas} width={1920} height={1080} />
        </div>
        {frame.layers.map((l) => (
          <ShotLayer key={l.shot.id + (l.outgoing ? ':out' : '')} layer={l} ctx={ctx} clean={clean} />
        ))}
        {!clean ? <Chrome shot={cur.shot} lt={cur.lt} ctx={ctx} voice={voice} t={t} steps={steps} /> : null}
      </div>
      {!record ? (
        <div className={s.controls}>
          <button type="button" onClick={() => setPlaying((v) => !v)}>{playing ? ctx.fm.preview.pause : ctx.fm.preview.play}</button>
          <input type="range" min={0} max={cut.duration} step={1 / 30} value={t} onChange={(e) => { setPlaying(false); void seek(Number(e.target.value)); }} aria-label={ctx.fm.preview.title} />
          <span>{t.toFixed(2)} / {cut.duration.toFixed(1)} · {cur.shot.id}</span>
        </div>
      ) : null}
    </div>
  );
}

function ShotLayer({ layer, ctx, clean }: { layer: Layer; ctx: FilmContext; clean: boolean }) {
  const { shot, lt } = layer;
  if (shot.capture || clean) return null;
  const Overlay = SCENES[shot.scene!].Overlay;
  if (!Overlay) return null;
  return (
    <div className={s.layer} style={{ ...layer.style, zIndex: layer.z + 2 }}>
      <Overlay t={lt} dur={shot.dur} shot={shot} ctx={ctx} />
    </div>
  );
}

/** คำบรรยาย ตัวบอก IPO HUD และซับของช็อตปัจจุบัน */
function Chrome({ shot, lt, ctx, voice, t, steps }: { shot: Shot; lt: number; ctx: FilmContext; voice: VoTrack | null; t: number; steps: string[] }) {
  const fm = ctx.fm;
  const stepIdx = shot.capture ? steps.indexOf(shot.chapter) : -1;
  // ช่วงเปลี่ยนฉากเข้า (อุ้งเท้า/จาง/ซูม): ยังไม่โชว์ HUD/คำบรรยายของช็อตใหม่ทับฉากเก่า — รอให้ฉากใหม่เกือบเต็มจอก่อน
  const tr = shot.transitionIn ?? 'cut';
  const intro = shot.index > 0 && TRANS[tr] > 0 ? TRANS[tr] * 0.85 : 0;
  const from = (a: number) => Math.max(a, intro);
  const gate = intro > 0 ? ease.out(prog(lt, intro - 0.1, intro + 0.35)) : 1;
  const stepIn = ease.out(prog(lt, intro, intro + 0.5));
  const cap = shot.captions?.find((c) => lt >= from(c.at) && lt <= c.to);
  const text = cap ? captionText(fm, cap.key, ctx) : null;
  const fade = cap ? Math.min(clamp((lt - from(cap.at)) / 0.25), clamp((cap.to - lt) / 0.2)) : 0;
  const ipo = shot.ipo ? [...shot.ipo].reverse().find(([at]) => lt >= at)?.[1] : undefined;
  const meta = shot.capture ? ctx.captures[shot.capture] : undefined;
  const desktop = meta?.device === 'desktop';
  const mod = shot.scene ? SCENES[shot.scene] : null;
  const card = shot.cards?.find((c) => lt >= c.from && lt <= c.to);
  const cardText = card ? captionText(fm, card.key, ctx).card : undefined;
  const cardFade = card ? Math.min(clamp((lt - card.from) / 0.3), clamp((card.to - lt) / 0.25)) : 0;
  // ซับล่าง: บทพากย์ (ถ้ามีเสียงพากย์ภาษาอังกฤษ) ไม่อย่างนั้นคำแปลของคำบรรยาย
  const voLine = voice?.lines.find((l) => t >= l.start - 0.05 && t <= l.start + l.dur + 0.25);
  const voText = voLine ? (voice!.lang === 'en' ? filmEn : filmTh).vo[voLine.key as keyof typeof filmEn.vo] : null;
  let subText: string | null = null;
  if (voText && (ctx.locale === 'en' || voice?.lang === 'en')) subText = voText.replace('{sim}', String(ctx.facts.sim));
  else if (cap && ctx.sub) subText = plain(captionText(ctx.sub, cap.key, ctx).main);
  const subFade = voLine ? Math.min(clamp((t - voLine.start + 0.05) / 0.15), clamp((voLine.start + voLine.dur + 0.25 - t) / 0.15)) : fade;

  return (
    <>
      {mod?.hud ? <Hud shot={shot} lt={lt} ctx={ctx} dark={mod.hud === 'dark'} /> : null}
      {shot.ipo ? (
        <div className={s.ipo} aria-hidden="true" style={{ opacity: gate }}>
          {(['input', 'process', 'output'] as const).map((k) => <span key={k} data-on={ipo === k ? 'true' : undefined}>{fm.ipo[k]}</span>)}
        </div>
      ) : null}
      {stepIdx >= 0 ? (
        <div className={s.flow} aria-hidden="true" style={{ opacity: 0.9 * gate }}>
          {steps.map((c, i) => <span key={c} data-done={i <= stepIdx ? 'true' : undefined} data-cur={i === stepIdx ? 'true' : undefined} style={i === stepIdx ? { transform: `scaleX(${0.3 + 0.7 * stepIn})`, transformOrigin: 'left' } : undefined} />)}
        </div>
      ) : null}
      {shot.capture && !desktop ? (
        <span className={s.stepNo} aria-hidden="true" style={{ opacity: stepIn, transform: `translateY(${(1 - stepIn) * 30}px)` }}>{String(stepIdx + 1).padStart(2, '0')}</span>
      ) : null}
      {shot.capture ? <ExplainDom shot={shot} lt={lt} ctx={ctx} desktop={desktop} /> : null}
      {shot.capture && !desktop ? (
        <div className={s.side}>
          <span className={s.chapter} style={{ opacity: gate, transform: `translateY(${((1 - gate) * 14).toFixed(1)}px)` }}><span className={s.stepTag}>{fill(fm.hud.step, { n: stepIdx + 1 })}</span>{fm.chapters[shot.chapter]}</span>
          {text && cap ? <p className={s.capMain} style={{ opacity: Math.min(1, clamp((cap.to - lt) / 0.2)) }}><RichKinetic key={cap.key + cap.at} text={text.main} t={lt} at={from(cap.at)} /></p> : null}
          {text?.sub ? <p className={s.capSub} style={{ opacity: fade }}>{text.sub}</p> : null}
          {cardText ? (
            <div className={s.card} style={{ opacity: cardFade, transform: `translateX(${(1 - cardFade) * -16}px)` }}>
              <span className={s.cardIcon} aria-hidden="true">✦</span>{cardText}
            </div>
          ) : null}
        </div>
      ) : null}
      {shot.capture && desktop && text ? (
        <div className={s.lower} style={{ opacity: fade }}>
          <span className={s.chapter}>{fill(fm.hud.step, { n: stepIdx + 1 })} · {fm.chapters[shot.chapter]}</span>
          <p className={s.capMain}>{plain(text.main)}</p>
          {text.sub ? <p className={s.capSub}>{text.sub}</p> : null}
        </div>
      ) : null}
      {shot.scene && text ? (
        <div className={s.storyCap} data-dark={mod?.captionTone === 'dark' ? 'true' : undefined} style={{ opacity: fade, transform: `translateY(${(1 - fade) * 12}px)` }}>
          <p className={s.capMain}>{plain(text.main)}</p>
          {text.sub ? <p className={s.capSub}>{text.sub}</p> : null}
        </div>
      ) : null}
      {subText && subFade > 0 ? <p className={s.subline} style={{ opacity: subFade, ['--sub-x' as string]: '50%', maxWidth: 1400 }} lang="en">{subText}</p> : null}
    </>
  );
}

function Hud({ shot, lt, ctx, dark }: { shot: Shot; lt: number; ctx: FilmContext; dark: boolean }) {
  const fm = ctx.fm;
  const n = String(shot.index).padStart(2, '0');
  return (
    <div className={s.hud} data-dark={dark ? 'true' : undefined} aria-hidden="true">
      <div className={s.hudTL}>{fm.hud.brand}</div>
      <div className={s.hudTR}>
        <span>{n} — {fm.chapters[shot.chapter]}</span>
        <span className={s.hudBar}><i style={{ transform: `scaleX(${clamp(lt / shot.dur)})` }} /></span>
      </div>
      <div className={s.hudBR}>{fm.hud.story}</div>
    </div>
  );
}
