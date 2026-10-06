/**
 * ภาพ mascot ที่ออกแบบเองสำหรับ Cozypet (SVG แยกชิ้นส่วน พื้นหลังโปร่งใส) — CREDITS.md `mascot-cat`, `mascot-dog`
 * viewBox 400×320 ลำดับ layer: ฉาก → หาง → ลำตัว → หัว {หู, หน้า {ตา{ลูกตา}, เปลือกตา, ปาก, แก้ม}} → ขอบโต๊ะ → อุ้งเท้า
 * กลุ่มที่มี data-part ถูกควบคุมโดย MascotStage
 */
import type { MascotKind } from '@/lib/types';

const INK = '#2B2118';

function Table() {
  return (
    <g data-part="table">
      <rect x="0" y="236" width="400" height="84" rx="10" fill="#D9B98C" />
      <rect x="0" y="236" width="400" height="16" rx="8" fill="#E8CFA6" />
      <path d="M0 268h400" stroke="#C9A574" strokeWidth="2" opacity="0.6" />
      <path d="M40 290h90M210 298h120" stroke="#C9A574" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
    </g>
  );
}

function Eyes({ white = false }: { white?: boolean }) {
  return (
    <>
      <g data-part="eyes-open">
        <g transform="translate(160 158)">
          {white ? <ellipse rx="15" ry="17" fill="#fff" /> : null}
          <g data-part="pupil">
            <ellipse rx="12" ry="15" fill={INK} />
            <circle cx="-4" cy="-5" r="4.5" fill="#fff" />
            <circle cx="4" cy="5" r="2" fill="#fff" opacity="0.8" />
          </g>
          <rect data-part="lid" x="-17" y="-19" width="34" height="38" fill="currentColor" style={{ transformOrigin: '0 -19px', transform: 'scaleY(0)' }} />
        </g>
        <g transform="translate(240 158)">
          {white ? <ellipse rx="15" ry="17" fill="#fff" /> : null}
          <g data-part="pupil">
            <ellipse rx="12" ry="15" fill={INK} />
            <circle cx="-4" cy="-5" r="4.5" fill="#fff" />
            <circle cx="4" cy="5" r="2" fill="#fff" opacity="0.8" />
          </g>
          <rect data-part="lid" x="-17" y="-19" width="34" height="38" fill="currentColor" style={{ transformOrigin: '0 -19px', transform: 'scaleY(0)' }} />
        </g>
      </g>
      <g data-part="eyes-happy" style={{ opacity: 0 }}>
        <path d="M146 160q14-16 28 0" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />
        <path d="M226 160q14-16 28 0" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />
      </g>
    </>
  );
}

export function CatArt() {
  const fur = '#F2A65A';
  const furDark = '#E08A3C';
  const cream = '#FFF1DE';
  return (
    <svg viewBox="0 0 400 320" width="100%" height="100%" role="presentation" aria-hidden="true" focusable="false" style={{ color: fur, overflow: 'visible' }}>
      <g data-part="body">
        <path d="M110 252c0-50 40-78 90-78s90 28 90 78z" fill={fur} />
        <path d="M160 252c0-30 18-50 40-50s40 20 40 50z" fill={cream} />
      </g>
      <g data-part="head" style={{ transformOrigin: '200px 200px', transformBox: 'view-box' }}>
        <g data-part="ear-l" style={{ transformOrigin: '140px 110px', transformBox: 'view-box' }}>
          <path d="M112 128 124 52q4-10 13-4l50 50z" fill={fur} />
          <path d="M126 112 133 70l34 34z" fill="#F7B8B0" />
        </g>
        <g data-part="ear-r" style={{ transformOrigin: '260px 110px', transformBox: 'view-box' }}>
          <path d="M288 128 276 52q-4-10-13-4l-50 50z" fill={fur} />
          <path d="M274 112 267 70l-34 34z" fill="#F7B8B0" />
        </g>
        <ellipse cx="200" cy="165" rx="98" ry="80" fill={fur} />
        <path d="M184 92q4 16 0 26M200 88q0 18 0 30M216 92q-4 16 0 26" stroke={furDark} strokeWidth="6" strokeLinecap="round" fill="none" />
        <ellipse cx="200" cy="196" rx="58" ry="38" fill={cream} />
        <g data-part="face">
          <Eyes />
          <ellipse data-part="cheek" cx="132" cy="192" rx="17" ry="10" fill="#F0707A" opacity="0.35" />
          <ellipse data-part="cheek" cx="268" cy="192" rx="17" ry="10" fill="#F0707A" opacity="0.35" />
          <path d="M192 180h16l-8 9z" fill="#E77C86" stroke="#E77C86" strokeWidth="3" strokeLinejoin="round" />
          <path data-part="mouth" d="M200 190q-4 10-14 8M200 190q4 10 14 8" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M150 186l-40-6M150 196l-40 4M250 186l40-6M250 196l40 4" stroke={INK} strokeWidth="2" strokeLinecap="round" opacity="0.35" />
        </g>
      </g>
      <Table />
      <g data-part="paw-l" style={{ transformOrigin: '150px 244px', transformBox: 'view-box' }}>
        <ellipse cx="150" cy="244" rx="32" ry="19" fill={cream} stroke={furDark} strokeWidth="2" />
        <path d="M138 252v-8M150 254v-9M162 252v-8" stroke={furDark} strokeWidth="3" strokeLinecap="round" />
      </g>
      <g data-part="paw-r" style={{ transformOrigin: '250px 244px', transformBox: 'view-box' }}>
        <ellipse cx="250" cy="244" rx="32" ry="19" fill={cream} stroke={furDark} strokeWidth="2" />
        <path d="M238 252v-8M250 254v-9M262 252v-8" stroke={furDark} strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function DogArt() {
  const fur = '#C8956A';
  const furDark = '#9E6D47';
  const cream = '#FBEBD7';
  return (
    <svg viewBox="0 0 400 320" width="100%" height="100%" role="presentation" aria-hidden="true" focusable="false" style={{ color: fur, overflow: 'visible' }}>
      <g data-part="tail" style={{ transformOrigin: '318px 236px', transformBox: 'view-box' }}>
        <path d="M312 240q34-20 40-70q2-14-8-10q-6 40-38 66z" fill={fur} stroke={furDark} strokeWidth="2" />
      </g>
      <g data-part="body">
        <path d="M108 252c0-52 42-80 92-80s92 28 92 80z" fill={fur} />
        <path d="M162 252c0-28 16-48 38-48s38 20 38 48z" fill={cream} />
      </g>
      <g data-part="head" style={{ transformOrigin: '200px 200px', transformBox: 'view-box' }}>
        <ellipse cx="200" cy="160" rx="92" ry="82" fill={fur} />
        <g data-part="ear-l" style={{ transformOrigin: '122px 104px', transformBox: 'view-box' }}>
          <path d="M126 96q-46-6-50 52q0 34 22 40q18-30 34-62z" fill={furDark} />
        </g>
        <g data-part="ear-r" style={{ transformOrigin: '278px 104px', transformBox: 'view-box' }}>
          <path d="M274 96q46-6 50 52q0 34-22 40q-18-30-34-62z" fill={furDark} />
        </g>
        <ellipse cx="200" cy="200" rx="64" ry="44" fill={cream} />
        <path d="M168 110q32-14 64 0" stroke={cream} strokeWidth="10" strokeLinecap="round" fill="none" opacity="0.7" />
        <g data-part="face">
          <Eyes />
          <ellipse data-part="cheek" cx="128" cy="196" rx="16" ry="10" fill="#F0707A" opacity="0.3" />
          <ellipse data-part="cheek" cx="272" cy="196" rx="16" ry="10" fill="#F0707A" opacity="0.3" />
          <ellipse cx="200" cy="184" rx="18" ry="12" fill={INK} />
          <ellipse cx="195" cy="180" rx="5" ry="3" fill="#fff" opacity="0.6" />
          <path data-part="mouth" d="M200 196v8q-6 10-18 6M200 204q6 10 18 6" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
          <path data-part="tongue" d="M194 210q6 16 12 0z" fill="#F0707A" style={{ opacity: 0 }} />
        </g>
      </g>
      <Table />
      <g data-part="paw-l" style={{ transformOrigin: '150px 244px', transformBox: 'view-box' }}>
        <ellipse cx="150" cy="244" rx="33" ry="20" fill={cream} stroke={furDark} strokeWidth="2" />
        <path d="M138 252v-8M150 254v-9M162 252v-8" stroke={furDark} strokeWidth="3" strokeLinecap="round" />
      </g>
      <g data-part="paw-r" style={{ transformOrigin: '250px 244px', transformBox: 'view-box' }}>
        <ellipse cx="250" cy="244" rx="33" ry="20" fill={cream} stroke={furDark} strokeWidth="2" />
        <path d="M238 252v-8M250 254v-9M262 252v-8" stroke={furDark} strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function MascotArt({ kind }: { kind: MascotKind }) {
  return kind === 'dog' ? <DogArt /> : <CatArt />;
}
