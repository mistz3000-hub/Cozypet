'use client';

import dynamic from 'next/dynamic';
import type { TeamInfo } from './context';

// three.js และ GSAP โหลดเฉพาะหน้านี้ (ไม่อยู่ใน bundle แรกของเว็บ) และไม่ render ฝั่ง server
const FilmPlayer = dynamic(() => import('./FilmPlayer').then((m) => m.FilmPlayer), { ssr: false });

export function FilmPage(props: { cutId: string; locale: 'th' | 'en'; record: boolean; team: TeamInfo | null }) {
  return <FilmPlayer {...props} />;
}
