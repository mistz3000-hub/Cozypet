import type { Species } from '@/lib/types';
import { coatColor, collarColor } from '@/data/colors';
import { rngFromKey } from '@/lib/seeded-random';

/**
 * ภาพวาดประกอบสัตว์ด้วยโค้ด (CREDITS.md `art-pets`) สีตามข้อมูลประกาศ — ไม่ใช่ภาพถ่าย
 * รูปแบบ deterministic ตาม seed เพื่อให้ภาพเดิมทุกครั้ง
 */
export function PetArt({ species, colors, collar, seed, className }: { species: Species; colors: string[]; collar?: string; seed: string; className?: string }) {
  const rng = rngFromKey(`cozypet:v1:art:${seed}`);
  const ids = colors.length ? colors : ['cream'];
  const calico = ids.includes('calico');
  const tabby = ids.includes('tabby');
  const spotted = ids.includes('spotted');
  const solid = ids.filter((c) => !['calico', 'tabby', 'spotted'].includes(c));
  const main = calico ? '#FBF8F2' : coatColor(solid[0] ?? (tabby ? 'orange' : 'cream'))?.swatch ?? '#EAD7B5';
  const second = calico ? '#E8913A' : solid[1] ? coatColor(solid[1])?.swatch ?? '#FBF8F2' : null;
  const third = calico ? '#2E2A27' : null;
  const stroke = '#2B2118';
  const bgHue = ['#FFF3D1', '#FFE6D5', '#E6EEF8', '#E3F4EC'][Math.floor(rng() * 4)];
  const tilt = (rng() - 0.5) * 8;
  const collarC = collarColor(collar)?.swatch;
  const uid = seed.replace(/[^a-z0-9]/gi, '');
  const darkPelt = main === '#2E2A27';
  const eye = darkPelt ? '#F4C542' : stroke;

  return (
    <svg viewBox="0 0 200 150" className={className} role="presentation" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice">
      <defs>
        <clipPath id={`h-${uid}`}>
          {species === 'dog' ? <ellipse cx="100" cy="78" rx="46" ry="42" /> : species === 'cat' ? <ellipse cx="100" cy="80" rx="48" ry="40" /> : <ellipse cx="100" cy="86" rx="40" ry="36" />}
        </clipPath>
      </defs>
      <rect width="200" height="150" fill={bgHue} />
      <circle cx={30 + rng() * 140} cy={20 + rng() * 20} r="34" fill="#fff" opacity="0.35" />
      <g transform={`rotate(${tilt} 100 90)`}>
        {/* ลำตัว */}
        <ellipse cx="100" cy="148" rx="62" ry="42" fill={main} stroke={stroke} strokeWidth="2.5" />
        {/* หู */}
        {species === 'cat' ? (
          <>
            <path d="M58 64 64 22l30 30z" fill={main} stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M142 64 136 22l-30 30z" fill={second ?? main} stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M66 54 69 34l14 15z M134 54 131 34l-14 15z" fill="#F7B8B0" />
          </>
        ) : species === 'dog' ? (
          <>
            <path d="M60 50q-24 4-18 46 14-2 22-24z" fill={second ?? main} stroke={stroke} strokeWidth="2.5" />
            <path d="M140 50q24 4 18 46-14-2-22-24z" fill={second ?? main} stroke={stroke} strokeWidth="2.5" />
          </>
        ) : (
          <>
            <ellipse cx="82" cy="34" rx="11" ry="32" fill={main} stroke={stroke} strokeWidth="2.5" />
            <ellipse cx="118" cy="34" rx="11" ry="32" fill={main} stroke={stroke} strokeWidth="2.5" />
            <ellipse cx="82" cy="36" rx="5" ry="22" fill="#F7B8B0" />
            <ellipse cx="118" cy="36" rx="5" ry="22" fill="#F7B8B0" />
          </>
        )}
        {/* หัว */}
        <g clipPath={`url(#h-${uid})`}>
          <rect x="40" y="30" width="120" height="100" fill={main} />
          {second && !calico ? <ellipse cx={rng() < 0.5 ? 72 : 128} cy="64" rx="30" ry="26" fill={second} /> : null}
          {calico ? (
            <>
              <ellipse cx="74" cy="58" rx="26" ry="20" fill={second!} />
              <ellipse cx="132" cy="70" rx="20" ry="16" fill={third!} />
              <path d="M92 46q8-8 16 0q-2 10-8 14q-6-4-8-14z" fill={second!} />
            </>
          ) : null}
          {tabby ? (
            <path d="M86 44q4 10 0 18M100 40v20M114 44q-4 10 0 18M58 80h14M142 80h-14M60 92h12M140 92h-12" stroke="#7A4A22" strokeWidth="4" strokeLinecap="round" opacity="0.55" fill="none" />
          ) : null}
          {spotted ? <g fill="#2E2A27" opacity="0.8"><circle cx="70" cy="60" r="6" /><circle cx="128" cy="56" r="5" /><circle cx="118" cy="96" r="4" /></g> : null}
          <ellipse cx="100" cy="98" rx={species === 'dog' ? 26 : 22} ry={species === 'dog' ? 18 : 14} fill={darkPelt ? '#4A4440' : '#FFF6EA'} opacity={darkPelt ? 1 : 0.92} />
        </g>
        {species === 'dog' ? <ellipse cx="100" cy="78" rx="46" ry="42" fill="none" stroke={stroke} strokeWidth="2.5" /> : species === 'cat' ? <ellipse cx="100" cy="80" rx="48" ry="40" fill="none" stroke={stroke} strokeWidth="2.5" /> : <ellipse cx="100" cy="86" rx="40" ry="36" fill="none" stroke={stroke} strokeWidth="2.5" />}
        {/* หน้า */}
        <ellipse cx="82" cy="80" rx="6" ry="7.5" fill={eye} />
        <ellipse cx="118" cy="80" rx="6" ry="7.5" fill={eye} />
        <circle cx="80" cy="77" r="2" fill="#fff" />
        <circle cx="116" cy="77" r="2" fill="#fff" />
        {species === 'dog' ? (
          <ellipse cx="100" cy="94" rx="8" ry="5.5" fill={stroke} />
        ) : (
          <path d="M95 92h10l-5 5z" fill="#E77C86" />
        )}
        <path d="M100 98q-3 6-9 5M100 98q3 6 9 5" stroke={darkPelt ? '#FFF6EA' : stroke} strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx="70" cy="96" rx="7" ry="4" fill="#F0707A" opacity="0.35" />
        <ellipse cx="130" cy="96" rx="7" ry="4" fill="#F0707A" opacity="0.35" />
        {species === 'cat' ? <path d="M70 92l-22-3M70 98l-22 2M130 92l22-3M130 98l22 2" stroke={darkPelt ? '#FFF6EA' : stroke} strokeWidth="1.4" opacity="0.4" /> : null}
        {/* ปลอกคอ */}
        {collarC ? (
          <>
            <path d={species === 'dog' ? 'M62 114q38 18 76 0' : 'M64 114q36 16 72 0'} stroke={collarC} strokeWidth="8" fill="none" strokeLinecap="round" />
            <circle cx="100" cy="126" r="6" fill="#F4C542" stroke={stroke} strokeWidth="1.5" />
          </>
        ) : null}
      </g>
    </svg>
  );
}
