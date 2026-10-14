import type { ComponentType, CSSProperties } from 'react';
import type { GLScene } from '../gl';
import type { FilmContext, SceneProps } from '../context';
import type { Shot } from '../cuts';
import type { PostOpts } from '../post';

/** ชนิดของเสียงประกอบที่ผูกกับภาพ (สังเคราะห์ใน audio/render.ts) */
export type SfxKind =
  | 'impact' | 'riser' | 'whoosh' | 'pop' | 'sparkle' | 'draw' | 'tick' | 'ping' | 'chime' | 'thud'
  | 'paper' | 'shutter' | 'flash' | 'radar' | 'type' | 'success' | 'zap' | 'land' | 'stamp' | 'clock'
  | 'swish' | 'glass' | 'flip' | 'rain' | 'purr' | 'meow' | 'drop' | 'tap' | 'read' | 'scan' | 'coin'
  | 'steps' | 'af' | 'beep' | 'sniff' | 'ambience' | 'yawn' | 'twinkle' | 'type' | 'message';

/**
 * เสียงประกอบหนึ่งจุด (เวลาภายในช็อต)
 * note = ลำดับโน้ตในบันไดเสียงของเพลง (เสียงจึงกลมกลืนกับคอร์ด และไล่ขึ้นตามลำดับวัตถุที่โผล่)
 */
export interface SceneSfx { at: number; kind: SfxKind; note?: number; dur?: number; gain?: number; pan?: number }

export interface SceneModule {
  /** ฉาก WebGL (สร้างครั้งเดียวต่อหน้า) */
  gl?: (ctx: FilmContext) => GLScene;
  /** ชั้น DOM ด้านบน (ข้อความไทยทั้งหมดอยู่ที่นี่) */
  Overlay?: ComponentType<SceneProps>;
  /** HUD ของฉากเล่าเรื่อง: 'light' | 'dark' | none */
  hud?: 'light' | 'dark';
  /** สไตล์ของ canvas WebGL ในฉากนี้ (เช่น เบลอโฟกัส/แสง) — ใช้ CSS filter ได้โดยไม่ต้อง post-process */
  canvasStyle?: (t: number, dur: number) => CSSProperties;
  /** โทนของคำบรรยายมาตรฐาน */
  captionTone?: 'light' | 'dark';
  /** ค่า bloom/vignette/โทนสีของฉาก ณ เวลา t */
  post?: (t: number, dur: number) => PostOpts;
  /** เสียงประกอบที่ตรงกับ animation ของฉาก */
  sfx?: (shot: Shot, ctx: FilmContext) => SceneSfx[];
}
