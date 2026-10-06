'use client';

import { useMemo, type ReactNode } from 'react';
import type { GeoPoint, StatusLevel } from '@/lib/types';
import { DISTRICTS } from '@/data/districts';
import { useI18n } from '@/i18n/provider';
import { m as motionEl } from '@/lib/motion';
import { SPRING } from '@/lib/motion-tokens';
import { StatusShape } from '@/components/ui/StatusBadge';
import { MAP_H, MAP_W, PX_PER_KM, project, riverPath, viewFor } from './projection';
import s from './map.module.css';

export interface MapPin {
  id: string;
  location: GeoPoint;
  level: StatusLevel;
  kind: 'shelter' | 'individual' | 'place';
  label: string;
  dim?: boolean;
}

/** แผนที่ mockup กรุงเทพฯ (SVG) — “แผนที่ตัวอย่าง ไม่ใช่แผนที่จริง” · หมุดเป็นปุ่มที่มีชื่อ */
export function BangkokMap({ pins = [], searchPoint, radiusKm, selectedId, onSelect, mini = false, overlay, routes = [], showLegend = true, children, zoomKm, searching = false }: {
  pins?: MapPin[];
  searchPoint?: GeoPoint | null;
  radiusKm?: number | null;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  mini?: boolean;
  overlay?: ReactNode;
  /** เส้นโค้งจากจุดค้นหาไปยังที่แนะนำ (≤ 3) */
  routes?: GeoPoint[];
  showLegend?: boolean;
  children?: ReactNode;
  /** ซูมให้เห็นรัศมีนี้รอบจุดค้นหา (null = ทั้งกรุงเทพฯ) */
  zoomKm?: number | null;
  /** radar ระหว่างค้นหา (reduced motion: วงนิ่ง) */
  searching?: boolean;
}) {
  const { m } = useI18n();
  const land = useMemo(() => DISTRICTS.map((d) => ({ id: d.id, ...project(d.center) })), []);
  const river = useMemo(() => riverPath(), []);
  const sp = searchPoint ? project(searchPoint) : null;
  const view = viewFor(sp, zoomKm);
  const left = (x: number) => ((x - view.x) / view.w) * 100;
  const top = (y: number) => ((y - view.y) / view.h) * 100;
  const inView = (x: number, y: number) => left(x) > -2 && left(x) < 102 && top(y) > -2 && top(y) < 102;

  return (
    <div className={[s.wrap, mini && s.mini].filter(Boolean).join(' ')}>
      <div className={s.canvas} style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}>
        <svg viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} className={s.svg} aria-hidden="true" focusable="false">
          <rect x={-MAP_W} y={-MAP_H} width={MAP_W * 3} height={MAP_H * 3} fill="var(--cp-bg-alt)" />
          <g fill="var(--cp-map-land)">
            {land.map((p) => <circle key={p.id} cx={p.x} cy={p.y} r={52} />)}
          </g>
          <g fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.8">
            {land.map((p) => <circle key={p.id} cx={p.x} cy={p.y} r={3} fill="#E9DEC8" stroke="none" />)}
          </g>
          <path d={river} fill="none" stroke="var(--cp-river)" strokeWidth={mini ? 10 : 12} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          {sp && radiusKm ? (
            <circle cx={sp.x} cy={sp.y} r={radiusKm * PX_PER_KM} fill="rgb(244 180 0 / 10%)" stroke="var(--cp-gold-600)" strokeWidth="2" strokeDasharray="6 6" vectorEffect="non-scaling-stroke" />
          ) : null}
          {sp ? routes.map((r, i) => {
            const to = project(r);
            const mx = (sp.x + to.x) / 2;
            const lift = (view.h / MAP_H) * (40 + i * 12);
            const my = Math.min(sp.y, to.y) - lift;
            return (
              <motionEl.path
                key={`${r.lat}-${r.lng}`}
                d={`M${sp.x} ${sp.y} Q${mx} ${my} ${to.x} ${to.y}`}
                fill="none"
                stroke="var(--cp-gold-600)"
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray="2 8"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ ...SPRING.gentle, delay: i * 0.12 }}
              />
            );
          }) : null}
        </svg>
        {children}
        {pins.map((p) => {
          const pt = project(p.location);
          if (!inView(pt.x, pt.y)) return null;
          const selected = p.id === selectedId;
          const common = {
            className: s.pin,
            'data-kind': p.kind,
            'data-level': p.level,
            'data-selected': selected ? 'true' : undefined,
            'data-dim': p.dim ? 'true' : undefined,
            style: { left: `${left(pt.x)}%`, top: `${top(pt.y)}%` },
          } as const;
          const body = (
            <>
              {p.kind === 'shelter' ? (
                <svg viewBox="0 0 24 30" className={s.drop} aria-hidden="true">
                  <path d="M12 29s10-9.5 10-17A10 10 0 0 0 2 12c0 7.5 10 17 10 17z" fill="currentColor" stroke="#fff" strokeWidth="2" />
                </svg>
              ) : (
                <span className={s.area} aria-hidden="true" />
              )}
              <span className={s.pinShape} aria-hidden="true"><StatusShape level={p.level} size={mini ? 10 : 14} /></span>
              {selected ? <motionEl.span className={s.ring} aria-hidden="true" initial={{ scale: 0.6, opacity: 0.9 }} animate={{ scale: 1.8, opacity: 0 }} transition={{ duration: 0.7 }} /> : null}
            </>
          );
          return onSelect && !mini ? (
            <button key={p.id} type="button" {...common} aria-label={p.label} aria-pressed={selected} onClick={() => onSelect(p.id)} data-tour={p.level === 'full' && p.kind !== 'place' ? 'nearby-full-pin' : undefined} data-tour-safe={p.level === 'full' && p.kind !== 'place' ? 'true' : undefined}>
              {body}
            </button>
          ) : (
            <span key={p.id} {...common} aria-hidden="true">{body}</span>
          );
        })}
        {sp && searching ? <span className={s.radar} style={{ left: `${left(sp.x)}%`, top: `${top(sp.y)}%` }} aria-hidden="true" /> : null}
        {sp ? (
          <span className={s.search} style={{ left: `${left(sp.x)}%`, top: `${top(sp.y)}%` }} aria-hidden="true">
            <span className={s.searchDot} />
          </span>
        ) : null}
        <span className={s.mockLabel}>{m.map.mockLabel}</span>
        {overlay}
      </div>
      {showLegend ? (
        <ul className={s.legend} aria-label={m.status.legendTitle}>
          {(['open', 'tight', 'full'] as StatusLevel[]).map((l) => (
            <li key={l} data-level={l}><StatusShape level={l} /> {m.status[l]}</li>
          ))}
          <li><span className={s.legendSearch} aria-hidden="true" /> {m.map.searchPoint}</li>
          {!mini ? <li><span className={s.legendDrop} aria-hidden="true" /> {m.map.shelterPin}</li> : null}
          {!mini ? <li><span className={s.legendArea} aria-hidden="true" /> {m.map.individualArea}</li> : null}
          {!mini && pins.some((p) => p.kind === 'place') ? <li><span className={s.legendPlace} aria-hidden="true" /> {m.map.yourPlace}</li> : null}
        </ul>
      ) : null}
    </div>
  );
}
