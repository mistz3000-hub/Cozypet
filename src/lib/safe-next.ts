/** next ที่ปลอดภัย: ต้องขึ้นต้นด้วย / และไม่ใช่ // หรือ /\ (กัน open redirect) — PROMPT.md 7.9 */
export function safeNext(next: string | null | undefined, fallback = '/'): string {
  if (!next) return fallback;
  if (!next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback;
  // URL parsers strip control characters before resolving a redirect. For
  // example, /\n/localhost:3000 becomes a protocol-relative external URL.
  if (/[\u0000-\u001f\u007f]/.test(next)) return fallback;
  try {
    if (new URL(next, 'https://internal.invalid').origin !== 'https://internal.invalid') return fallback;
  } catch {
    return fallback;
  }
  return next;
}
