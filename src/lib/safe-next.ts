/** next ที่ปลอดภัย: ต้องขึ้นต้นด้วย / และไม่ใช่ // หรือ /\ (กัน open redirect) — PROMPT.md 7.9 */
export function safeNext(next: string | null | undefined, fallback = '/'): string {
  if (!next) return fallback;
  if (!next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback;
  return next;
}
