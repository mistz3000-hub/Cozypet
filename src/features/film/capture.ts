/**
 * ข้อมูลภาพอัดหน้าจอแอปจริง (DEMO_VIDEO.md หัวข้อ 4) และการจับเวลาช็อต
 * สคริปต์ scripts/film/capture.ts สร้างไฟล์ out/film/captures/<locale>/<id>/capture.json
 */

export type CueType = 'tap' | 'type' | 'scroll' | 'mark' | 'point' | 'blur';
export interface Box { x: number; y: number; w: number; h: number }
export interface Cue { t: number; type: CueType; label?: string; x?: number; y?: number; box?: Box; to?: number }

export interface CaptureMeta {
  id: string;
  locale: 'th' | 'en';
  device: 'mobile' | 'desktop';
  /** ขนาด viewport (logical px) */
  viewport: { w: number; h: number };
  /** ขนาดภาพเฟรม (px จริง) */
  frameSize: { w: number; h: number };
  duration: number;
  /** เวลาของเฟรม (วินาทีจากเริ่มอัด) เรียงจากน้อยไปมาก ชื่อไฟล์ตาม index เริ่ม 1 */
  frames: number[];
  cues: Cue[];
  /** ค่าที่ต้องใช้ในคำบรรยายตามจริงตอนอัด */
  facts: Record<string, string>;
}

export type CaptureIndex = Record<string, CaptureMeta>;

export function frameUrl(locale: string, id: string, index: number): string {
  return `/__film/captures/${locale}/${id}/frames/${String(index + 1).padStart(6, '0')}.jpg`;
}

/** index ของเฟรมล่าสุดที่เวลา ≤ src */
export function frameAt(meta: CaptureMeta, src: number): number {
  const f = meta.frames;
  if (!f.length) return -1;
  let lo = 0;
  let hi = f.length - 1;
  if (src <= f[0]) return 0;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (f[mid] <= src) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

export function markTime(meta: CaptureMeta, label: string, fallback?: number): number {
  const c = meta.cues.find((x) => (x.type === 'mark' || x.type === 'tap' || x.type === 'point' || x.type === 'type') && x.label === label);
  if (c) return c.t;
  if (fallback !== undefined) return fallback;
  return label === 'end' ? meta.duration : 0;
}

/** จุดยึดเวลา: เวลาในช็อต → ป้ายใน cue (หรือเวลาอัดเป็นวินาที) */
export interface Anchor { at: number; mark: string; offset?: number }

export interface Segment { shotA: number; shotB: number; srcA: number; srcB: number; speed: number }

/** เพดานการเร่งความเร็ว (DEMO_VIDEO.md หัวข้อ 1) */
export const MAX_SPEED = 1.5;

/**
 * แปลงเวลาในช็อตเป็นเวลาในภาพอัด
 * - ระหว่างจุดยึดเล่นเร็วสูงสุด 1.5 เท่า ถ้าภาพอัดยาวเกินจะตัดช่วงต้นของส่วนนั้น (ตัดตรงจุดยึด)
 * - ถ้าภาพอัดสั้นกว่า เล่นปกติแล้วค้างเฟรมสุดท้ายของส่วนนั้น
 */
export function buildSegments(meta: CaptureMeta, anchors: Anchor[]): Segment[] {
  const pts = anchors.map((a) => ({ at: a.at, src: markTime(meta, a.mark) + (a.offset ?? 0) }));
  const segs: Segment[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const dur = b.at - a.at;
    const srcDur = Math.max(0, b.src - a.src);
    if (dur <= 0) continue;
    if (srcDur > dur * MAX_SPEED) {
      segs.push({ shotA: a.at, shotB: b.at, srcA: b.src - dur * MAX_SPEED, srcB: b.src, speed: MAX_SPEED });
    } else if (srcDur >= dur) {
      segs.push({ shotA: a.at, shotB: b.at, srcA: a.src, srcB: b.src, speed: srcDur / dur });
    } else {
      segs.push({ shotA: a.at, shotB: a.at + srcDur, srcA: a.src, srcB: b.src, speed: 1 });
      segs.push({ shotA: a.at + srcDur, shotB: b.at, srcA: b.src, srcB: b.src, speed: 0 });
    }
  }
  return segs;
}

export function srcTime(segs: Segment[], t: number): number {
  if (!segs.length) return 0;
  if (t <= segs[0].shotA) return segs[0].srcA;
  for (const s of segs) {
    if (t <= s.shotB) return s.speed === 0 ? s.srcB : s.srcA + (t - s.shotA) * s.speed;
  }
  return segs[segs.length - 1].srcB;
}

/** เวลาในภาพอัด → เวลาในช็อต (null ถ้าช่วงนั้นถูกตัดออก) */
export function shotTime(segs: Segment[], src: number): number | null {
  for (const s of segs) {
    if (s.speed === 0) continue;
    if (src >= s.srcA && src <= s.srcB) return s.shotA + (src - s.srcA) / s.speed;
  }
  return null;
}
