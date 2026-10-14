import { LOGO, logoNosePath, logoTailPath } from '@/lib/brand';

/** ตัว C เป็นหางแมวขดรอบหน้าแมว (D34 รอบ v3) — ใช้เป็นตัว C ของคำว่า Cozypet และเป็นไอคอนแอป */
function CatC({ ink, nose }: { ink: string; nose: string }) {
  return (
    <>
      <path d={logoTailPath()} fill={ink} />
      {LOGO.eyes.map(([cx, cy]) => <circle key={cx} cx={cx} cy={cy} r={LOGO.eyeR} fill={ink} />)}
      <path d={logoNosePath()} fill={nose} stroke={nose} strokeWidth={1.3} strokeLinejoin="round" />
    </>
  );
}

/** Wordmark: ตัว C เป็นหางแมว ตามด้วย ozy (สีเข้ม) และ pet (สีทอง) */
export function Wordmark({ height = 28, symbolOnly = false, title = 'Cozypet' }: { height?: number; symbolOnly?: boolean; title?: string }) {
  const t = LOGO.tile;
  if (symbolOnly) {
    return (
      <svg viewBox={`0 0 ${LOGO.view} ${LOGO.view}`} height={height} width={height} role="img" aria-label={title}>
        <rect x={t.x} y={t.y} width={t.size} height={t.size} rx={t.radius} fill="var(--cp-gold-500)" />
        <CatC ink="var(--cp-ink)" nose="var(--cp-heart)" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 150 46" height={height} width={(height * 150) / 46} role="img" aria-label={title}>
      <g transform="translate(-5.5 -2) scale(0.72)">
        <CatC ink="var(--cp-ink)" nose="var(--cp-heart)" />
      </g>
      <text x="33" y="39.5" fontFamily="var(--font-mitr), 'Noto Sans Thai', sans-serif" fontWeight="600" fontSize="31" letterSpacing="-0.6">
        <tspan fill="var(--cp-ink)">ozy</tspan>
        <tspan fill="var(--cp-gold-700)">pet</tspan>
      </text>
    </svg>
  );
}
