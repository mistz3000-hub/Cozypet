'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import type { MascotKind } from '@/lib/types';
import { useDemoSession, useHydrated } from '@/lib/store';
import { useReducedMotion } from '@/lib/motion';
import { useI18n } from '@/i18n/provider';
import { playSfx } from '@/lib/audio/sfx';
import { MascotArt } from './MascotArt';
import { MascotErrorBoundary, MascotStatic } from './MascotErrorBoundary';
import { MASCOT } from './mascot-config';
import s from './mascot.module.css';

interface Heart { id: number; x: number; rot: number; delay: number; size: number }

/** hero mascot: มองตาม pointer, reaction เมื่อกด, หัวใจ, idle (PROMPT.md 6.3–6.6, 6.8) */
export function MascotStage({ forceError = false }: { forceError?: boolean }) {
  const hydrated = useHydrated();
  const [session] = useDemoSession();
  const kind: MascotKind | null = hydrated ? session.mascot : null;
  return (
    <div className={s.stageWrap}>
      <MascotErrorBoundary kind={kind ?? 'cat'}>
        {kind ? <StageInner kind={kind} forceError={forceError} /> : <MascotStatic kind="cat" emptyTable />}
      </MascotErrorBoundary>
    </div>
  );
}

function Thrower(): null {
  throw new Error('forced mascot error');
}

function StageInner({ kind, forceError }: { kind: MascotKind; forceError: boolean }) {
  const { m } = useI18n();
  const reduced = useReducedMotion();
  const stage = useRef<HTMLButtonElement>(null);
  const artBox = useRef<HTMLDivElement>(null);
  const target = useRef({ ex: 0, ey: 0, hr: 0, hx: 0, hy: 0 });
  const current = useRef({ ex: 0, ey: 0, hr: 0, hx: 0, hy: 0 });
  const idleTimer = useRef<number | null>(null);
  const visible = useRef(true);
  const reacting = useRef(false);
  const [reaction, setReaction] = useState(false);
  const [hearts, setHearts] = useState<Heart[]>([]);
  const heartSeq = useRef(0);

  // สลับ mascot: ตัวเดิมย่อหลังโต๊ะ ตัวใหม่โผล่ขึ้น (ปรับ state ระหว่าง render ตามแบบ React)
  const [shown, setShown] = useState<MascotKind>(kind);
  const [leaving, setLeaving] = useState<MascotKind | null>(null);
  if (kind !== shown) {
    setLeaving(shown);
    setShown(kind);
  }
  useEffect(() => {
    if (!leaving) return;
    const t = window.setTimeout(() => setLeaving(null), reduced ? MASCOT.reducedSwitchMs : MASCOT.switchMs);
    return () => window.clearTimeout(t);
  }, [leaving, reduced]);

  const apply = useCallback(() => {
    const root = artBox.current;
    if (!root) return;
    const c = current.current;
    root.querySelectorAll<SVGGElement>('[data-active="true"] [data-part="pupil"]').forEach((p) => {
      p.style.transform = `translate(${c.ex}px, ${c.ey}px)`;
    });
    const head = root.querySelector<SVGGElement>('[data-active="true"] [data-part="head"]');
    if (head) head.style.transform = `translate(${c.hx}px, ${c.hy}px) rotate(${c.hr}deg)`;
  }, []);

  // loop แบบหน่วง (smoothing) ด้วย requestAnimationFrame — หยุดเมื่อค่าคงที่หรืออยู่นอกจอ
  const loop = useRef<{ kick: () => void }>({ kick: () => {} });
  useEffect(() => {
    let frame: number | null = null;
    let last = 0;
    const step = (now: number) => {
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      const t = target.current;
      const c = current.current;
      const ke = 1 - Math.exp(-dt / MASCOT.tauEyeMs);
      const kh = 1 - Math.exp(-dt / MASCOT.tauHeadMs);
      c.ex += (t.ex - c.ex) * ke;
      c.ey += (t.ey - c.ey) * ke;
      c.hr += (t.hr - c.hr) * kh;
      c.hx += (t.hx - c.hx) * kh;
      c.hy += (t.hy - c.hy) * kh;
      apply();
      const settled = Math.abs(t.ex - c.ex) + Math.abs(t.ey - c.ey) + Math.abs(t.hr - c.hr) + Math.abs(t.hx - c.hx) + Math.abs(t.hy - c.hy) < 0.02;
      if (settled || !visible.current) {
        frame = null;
        last = 0;
        return;
      }
      frame = requestAnimationFrame(step);
    };
    loop.current.kick = () => {
      if (frame === null && visible.current) frame = requestAnimationFrame(step);
    };
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [apply]);
  const kick = useCallback(() => loop.current.kick(), []);

  const lookAt = useCallback((clientX: number, clientY: number) => {
    const el = artBox.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const scale = r.width / 400;
    const cx = r.left + MASCOT.headCenter.x * scale;
    const cy = r.top + MASCOT.headCenter.y * scale;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const len = Math.hypot(dx, dy) || 1;
    const reach = Math.min(1, len / (r.width * 0.9));
    dx /= len;
    dy /= len;
    if (reduced) {
      // reduced motion: ตาเปลี่ยนตำแหน่งทันทีไปทิศใกล้ที่สุด (ซ้าย/กลาง/ขวา)
      const dir = dx < -0.35 ? -1 : dx > 0.35 ? 1 : 0;
      current.current = { ex: dir * MASCOT.eyeMax, ey: 0, hr: 0, hx: 0, hy: 0 };
      target.current = { ...current.current };
      apply();
      return;
    }
    target.current = {
      ex: dx * MASCOT.eyeMax * reach,
      ey: dy * MASCOT.eyeMax * reach,
      hr: dx * MASCOT.headRotateMax * reach,
      hx: dx * MASCOT.headShiftMax * reach,
      hy: dy * MASCOT.headShiftMax * reach * 0.6,
    };
    kick();
  }, [apply, kick, reduced]);

  const rest = useCallback((afterMs: number) => {
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      target.current = { ex: 0, ey: 0, hr: 0, hx: 0, hy: 0 };
      if (reduced) {
        current.current = { ...target.current };
        apply();
      } else kick();
    }, afterMs);
  }, [apply, kick, reduced]);

  // mouse ทั้งหน้าต่าง / แตะที่ใดก็ได้ในหน้าแรก
  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || !visible.current) return;
      lookAt(e.clientX, e.clientY);
      rest(MASCOT.idleReturnMs);
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' || !visible.current) return;
      if (stage.current?.contains(e.target as Node)) return;
      lookAt(e.clientX, e.clientY);
      rest(MASCOT.touchGlanceMs);
    };
    const onLeave = () => rest(0);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
  }, [lookAt, rest, reduced]);

  // หยุดเมื่ออยู่นอกจอหรือแท็บถูกซ่อน
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting && !document.hidden;
    });
    io.observe(el);
    const onVis = () => {
      visible.current = !document.hidden;
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  // idle: กะพริบตาและหูกระดิก (ไม่ใช่ข้อมูล จึงสุ่มด้วย Math.random ได้)
  useEffect(() => {
    if (reduced) return;
    let blinkT = 0;
    let earT = 0;
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const blink = () => {
      if (visible.current) {
        artBox.current?.querySelectorAll<SVGRectElement>('[data-active="true"] [data-part="lid"]').forEach((lid) => {
          lid.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }], { duration: MASCOT.blinkMs, easing: 'ease-in-out' });
        });
      }
      blinkT = window.setTimeout(blink, rand(MASCOT.blinkMinMs, MASCOT.blinkMaxMs));
    };
    const ear = () => {
      if (visible.current) {
        const which = Math.random() < 0.5 ? 'ear-l' : 'ear-r';
        artBox.current?.querySelector<SVGGElement>(`[data-active="true"] [data-part="${which}"]`)?.animate(
          [{ transform: 'rotate(0)' }, { transform: `rotate(${which === 'ear-l' ? -MASCOT.earTwitchDeg : MASCOT.earTwitchDeg}deg)` }, { transform: 'rotate(0)' }],
          { duration: MASCOT.earTwitchMs, easing: 'ease-in-out' },
        );
      }
      earT = window.setTimeout(ear, rand(MASCOT.earMinMs, MASCOT.earMaxMs));
    };
    blinkT = window.setTimeout(blink, rand(MASCOT.blinkMinMs, MASCOT.blinkMaxMs));
    earT = window.setTimeout(ear, rand(MASCOT.earMinMs, MASCOT.earMaxMs));
    return () => {
      window.clearTimeout(blinkT);
      window.clearTimeout(earT);
    };
  }, [reduced, shown]);

  const react = useCallback(() => {
    if (reacting.current) return; // กดซ้ำระหว่าง reaction ไม่สร้างหัวใจชุดใหม่
    reacting.current = true;
    setReaction(true);
    playSfx(kind === 'dog' ? 'woof' : 'meow');
    const n = reduced ? 1 : 3;
    const batch: Heart[] = Array.from({ length: n }, (_, i) => ({
      id: ++heartSeq.current,
      x: reduced ? 0 : (i - 1) * 46 + (i === 1 ? 0 : (Math.random() - 0.5) * 10),
      rot: reduced ? 0 : (Math.random() * 24 - 12),
      delay: i * MASCOT.heartGapMs,
      size: reduced ? 36 : 28 + Math.round(Math.random() * 20),
    }));
    setHearts(batch);
    window.setTimeout(() => setReaction(false), reduced ? MASCOT.reducedReactionMs : MASCOT.reactionMs);
    window.setTimeout(() => {
      setHearts([]);
      reacting.current = false;
    }, MASCOT.reactionLockMs);
  }, [kind, reduced]);

  // พื้นที่เล่นบน stage: ลากนิ้วแล้วมองตาม
  const onStagePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === 'mouse' || reduced) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    lookAt(e.clientX, e.clientY);
  };
  const onStagePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === 'mouse' || reduced || !e.currentTarget.hasPointerCapture(e.pointerId)) return;
    lookAt(e.clientX, e.clientY);
  };
  const onStagePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === 'mouse') return;
    if (reduced) lookAt(e.clientX, e.clientY);
    rest(MASCOT.releaseHoldMs);
  };

  return (
    <button
      ref={stage}
      type="button"
      className={s.stage}
      aria-label={kind === 'dog' ? m.mascot.playDog : m.mascot.playCat}
      onClick={react}
      onPointerDown={onStagePointerDown}
      onPointerMove={onStagePointerMove}
      onPointerUp={onStagePointerUp}
      onPointerCancel={onStagePointerUp}
      data-reacting={reaction ? 'true' : undefined}
      data-kind={kind}
      style={{ '--heart-ms': `${MASCOT.heartMs}ms` } as CSSProperties}
    >
      {forceError ? <Thrower /> : null}
      <span className={s.blob} aria-hidden="true" />
      <div ref={artBox} className={s.art}>
        {leaving ? (
          <div className={`${s.layer} ${s.leaving}`} data-active="false" key={`leave-${leaving}`}>
            <MascotArt kind={leaving} />
          </div>
        ) : null}
        <div className={`${s.layer} ${leaving ? s.entering : ''}`} data-active="true" data-kind={shown} key={`show-${shown}`}>
          <MascotArt kind={shown} />
        </div>
      </div>
      <span className={s.hearts} aria-hidden="true">
        {hearts.map((h) => (
          <svg
            key={h.id}
            className={s.heart}
            data-reduced={reduced ? 'true' : undefined}
            viewBox="0 0 24 24"
            width={h.size}
            height={h.size}
            style={{ left: `calc(50% + ${h.x}px)`, animationDelay: `${h.delay}ms`, '--rot': `${h.rot}deg` } as CSSProperties}
          >
            <path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z" fill="currentColor" />
          </svg>
        ))}
      </span>
    </button>
  );
}
