/** Original wordmark: a large capital C curled like a cat's tail, plus the existing gold pet and paw. */
export function Wordmark({ height = 28, symbolOnly = false, title = 'Cozypet' }: { height?: number; symbolOnly?: boolean; title?: string }) {
  if (symbolOnly) {
    return (
      <svg viewBox="0 0 48 48" height={height} width={height} role="img" aria-label={title}>
        <rect width="48" height="48" rx="14" fill="var(--cp-gold-500)" />
        <path d="M35 36C25 42 11 37 10 25 9 15 16 8 25 8c7 0 12 4 11 8-.5 4-4 5-7 2" fill="none" stroke="var(--cp-ink)" strokeWidth="6" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 166 42" height={height} width={(height * 166) / 42} role="img" aria-label={title}>
      <path d="M29 33C20 39 6 34 5 23 4 13 11 5 20 5c7 0 12 4 11 8-.5 4-4 5-7 2" fill="none" stroke="var(--cp-ink)" strokeWidth="6" strokeLinecap="round" />
      <text x="32" y="34" fontFamily="var(--font-mitr), 'Noto Sans Thai', sans-serif" fontWeight="600" fontSize="30" fill="var(--cp-ink)" letterSpacing="-0.5">ozy</text>
      <text x="83" y="34" fontFamily="var(--font-mitr), 'Noto Sans Thai', sans-serif" fontWeight="600" fontSize="30" fill="var(--cp-gold-700)" letterSpacing="-0.5">pet</text>
      <g fill="var(--cp-gold-500)" transform="translate(145 9)">
        <ellipse cx="6" cy="9" rx="4.2" ry="3.6" />
        <circle cx="1.6" cy="4.2" r="1.7" />
        <circle cx="5" cy="1.6" r="1.7" />
        <circle cx="8.6" cy="2" r="1.7" />
        <circle cx="11.2" cy="5" r="1.7" />
      </g>
    </svg>
  );
}
