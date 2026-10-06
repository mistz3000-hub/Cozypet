/**
 * ดึงข้อความระหว่าง marker `<!-- NAME:START -->` / `<!-- NAME:END -->` (GEMINI_ROLEPLAY.md 1.6)
 * pure function — ไม่อ่านไฟล์ เพื่อทดสอบได้
 */
export type MarkerName = 'COZYPET_SYSTEM_INSTRUCTION' | 'COZYPET_ASSIST_INTAKE' | 'COZYPET_ASSIST_EXPLAIN';

export function extractMarkerBlock(source: string, name: MarkerName): string | null {
  const lines = source.split(/\r?\n/);
  const start = `<!-- ${name}:START -->`;
  const end = `<!-- ${name}:END -->`;
  const starts = lines.flatMap((l, i) => (l.trim() === start ? [i] : []));
  const ends = lines.flatMap((l, i) => (l.trim() === end ? [i] : []));
  if (starts.length !== 1 || ends.length !== 1 || ends[0] <= starts[0]) return null;
  const text = lines.slice(starts[0] + 1, ends[0]).join('\n').trim();
  return text || null;
}
