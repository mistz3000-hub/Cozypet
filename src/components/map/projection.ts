import type { GeoPoint } from '@/lib/types';
import { BANGKOK_BOUNDS } from '@/data/districts';

export const MAP_W = 640;
export const MAP_H = 500;

export function project(p: GeoPoint): { x: number; y: number } {
  const x = ((p.lng - BANGKOK_BOUNDS.minLng) / (BANGKOK_BOUNDS.maxLng - BANGKOK_BOUNDS.minLng)) * MAP_W;
  const y = ((BANGKOK_BOUNDS.maxLat - p.lat) / (BANGKOK_BOUNDS.maxLat - BANGKOK_BOUNDS.minLat)) * MAP_H;
  return { x, y };
}

/** px ต่อกิโลเมตร (แกนตั้ง) */
export const PX_PER_KM = MAP_H / ((BANGKOK_BOUNDS.maxLat - BANGKOK_BOUNDS.minLat) * 111.32);

/** แม่น้ำเจ้าพระยาแบบเรียบง่าย (พิกัดโดยประมาณ ใช้วาด mockup เท่านั้น) */
export const RIVER: GeoPoint[] = [
  { lat: 13.96, lng: 100.505 }, { lat: 13.9, lng: 100.495 }, { lat: 13.84, lng: 100.51 }, { lat: 13.8, lng: 100.505 },
  { lat: 13.765, lng: 100.49 }, { lat: 13.74, lng: 100.495 }, { lat: 13.72, lng: 100.51 }, { lat: 13.705, lng: 100.515 },
  { lat: 13.69, lng: 100.535 }, { lat: 13.675, lng: 100.555 }, { lat: 13.66, lng: 100.545 }, { lat: 13.64, lng: 100.53 },
  { lat: 13.6, lng: 100.54 }, { lat: 13.55, lng: 100.56 }, { lat: 13.49, lng: 100.58 },
];

export function riverPath(): string {
  const pts = RIVER.map(project);
  let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const mx = (p0.x + p1.x) / 2;
    const my = (p0.y + p1.y) / 2;
    d += ` Q${p0.x.toFixed(1)} ${p0.y.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  const last = pts[pts.length - 1];
  return `${d} T${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
}

/** viewBox ของแผนที่: ทั้งกรุงเทพฯ หรือซูมให้เห็นรัศมี zoomKm รอบจุดค้นหา (มีขอบ 40%) */
export function viewFor(center: { x: number; y: number } | null, zoomKm?: number | null): { x: number; y: number; w: number; h: number } {
  if (!center || !zoomKm) return { x: 0, y: 0, w: MAP_W, h: MAP_H };
  const h = Math.min(MAP_H, zoomKm * PX_PER_KM * 2 * 1.4);
  const w = (h * MAP_W) / MAP_H;
  return { x: center.x - w / 2, y: center.y - h / 2, w, h };
}
