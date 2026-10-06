/** wordmark ที่ออกแบบเอง: “Cozy” สีเข้ม + “pet” โทนทอง พร้อมหูแมวบนตัว C และจุดอุ้งเท้า (CREDITS.md `wordmark`) */
export function Wordmark({ height = 28, symbolOnly = false, title = 'Cozypet' }: { height?: number; symbolOnly?: boolean; title?: string }) {
  if (symbolOnly) {
    return (
      <svg viewBox="0 0 48 48" height={height} width={height} role="img" aria-label={title}>
        <rect width="48" height="48" rx="14" fill="#F4B400" />
        <path d="M14 15 17 7l6 6M34 15l-3-8-6 6" fill="#2B2118" />
        <path d="M33 32.5A11 11 0 1 1 33 15.5" fill="none" stroke="#2B2118" strokeWidth="5.5" strokeLinecap="round" />
        <circle cx="35" cy="24" r="3" fill="#FFF3D1" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 150 40" height={height} width={(height * 150) / 40} role="img" aria-label={title}>
      <path d="M8.5 13.5 10.8 6l5 5.2M22.5 11.2 27.5 6l2.3 7.5" fill="#2B2118" />
      <text x="2" y="33" fontFamily="var(--font-mitr), 'Noto Sans Thai', sans-serif" fontWeight="600" fontSize="30" fill="#2B2118" letterSpacing="-0.5">Cozy</text>
      <text x="74" y="33" fontFamily="var(--font-mitr), 'Noto Sans Thai', sans-serif" fontWeight="600" fontSize="30" fill="#9C6B00" letterSpacing="-0.5">pet</text>
      <g fill="#F4B400" transform="translate(132 9)">
        <ellipse cx="6" cy="9" rx="4.2" ry="3.6" />
        <circle cx="1.6" cy="4.2" r="1.7" />
        <circle cx="5" cy="1.6" r="1.7" />
        <circle cx="8.6" cy="2" r="1.7" />
        <circle cx="11.2" cy="5" r="1.7" />
      </g>
    </svg>
  );
}
