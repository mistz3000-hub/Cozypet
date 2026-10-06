import type { GeoPoint } from './types';
import { BANGKOK_BOUNDS } from '@/data/districts';

const EARTH_RADIUS_KM = 6371;
const toRad = (d: number) => (d * Math.PI) / 180;

/** ระยะเส้นตรง (haversine) เป็นกิโลเมตร ไม่ปัด */
export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** ระยะที่แสดงผล: ปัดทศนิยม 1 ตำแหน่ง (PROMPT.md 11.4) */
export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  return Math.round(haversineKm(a, b) * 10) / 10;
}

export function offsetPoint(origin: GeoPoint, bearingDeg: number, meters: number): GeoPoint {
  const b = toRad(bearingDeg);
  const dLat = (meters * Math.cos(b)) / 111_320;
  const dLng = (meters * Math.sin(b)) / (111_320 * Math.cos(toRad(origin.lat)));
  return { lat: origin.lat + dLat, lng: origin.lng + dLng };
}

export function clampToBangkok(p: GeoPoint): GeoPoint {
  return {
    lat: Math.min(BANGKOK_BOUNDS.maxLat, Math.max(BANGKOK_BOUNDS.minLat, p.lat)),
    lng: Math.min(BANGKOK_BOUNDS.maxLng, Math.max(BANGKOK_BOUNDS.minLng, p.lng)),
  };
}

export function round5(p: GeoPoint): GeoPoint {
  return { lat: Math.round(p.lat * 1e5) / 1e5, lng: Math.round(p.lng * 1e5) / 1e5 };
}

export function inBangkok(p: GeoPoint): boolean {
  return p.lat >= BANGKOK_BOUNDS.minLat && p.lat <= BANGKOK_BOUNDS.maxLat && p.lng >= BANGKOK_BOUNDS.minLng && p.lng <= BANGKOK_BOUNDS.maxLng;
}
