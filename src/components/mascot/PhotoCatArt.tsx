'use client';

import { useId } from 'react';

const NEUTRAL = '/mascot/cat-neutral.png';
const HAPPY = '/mascot/cat-happy.png';

/** Generated photographic cutouts, layered for head, gaze, blink and paw motion. */
export function PhotoCatArt({ withTable = true }: { withTable?: boolean }) {
  const prefix = `photo-cat-${useId().replace(/:/g, '')}`;
  const id = (name: string) => `${prefix}-${name}`;
  const photo = (src = NEUTRAL) => (
    <image href={src} x="50" y="8" width="300" height="300" preserveAspectRatio="xMidYMid meet" />
  );

  return (
    <svg viewBox="0 0 400 320" width="100%" height="100%" aria-hidden="true" focusable="false" data-photo-cat="true" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={id('neck-fade')} x1="0" y1="202" x2="0" y2="230" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="white" stopOpacity="1" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id={id('head')} x="0" y="0" width="400" height="320" maskUnits="userSpaceOnUse" style={{ maskType: 'alpha' }}>
          <rect width="400" height="320" fill={`url(#${id('neck-fade')})`} />
        </mask>
        <clipPath id={id('body')}><rect x="48" y="196" width="304" height="68" /></clipPath>
        <clipPath id={id('paw-l')}><ellipse cx="124" cy="269" rx="40" ry="34" /></clipPath>
        <clipPath id={id('paw-r')}><ellipse cx="286" cy="269" rx="39" ry="34" /></clipPath>
        <clipPath id={id('eye-l')}><ellipse cx="168.5" cy="122" rx="11" ry="10" /></clipPath>
        <clipPath id={id('eye-r')}><ellipse cx="236.5" cy="128" rx="11" ry="10" /></clipPath>
        <clipPath id={id('eyelids')}>
          <ellipse cx="168.5" cy="122" rx="21" ry="15" />
          <ellipse cx="236.5" cy="128" rx="21" ry="15" />
        </clipPath>
      </defs>
      <g data-part="body" clipPath={`url(#${id('body')})`}>{photo()}</g>
      <g data-part="head" style={{ transformOrigin: '200px 204px', transformBox: 'view-box' }}>
        <g data-part="face" mask={`url(#${id('head')})`}>
          <g data-part="eyes-open">
            {photo()}
            {(['eye-l', 'eye-r'] as const).map((eye) => (
              <g key={eye} clipPath={`url(#${id(eye)})`}>
                <g data-part="pupil">{photo()}</g>
              </g>
            ))}
            <image data-part="lid" href={HAPPY} x="50" y="8" width="300" height="300" clipPath={`url(#${id('eyelids')})`} style={{ opacity: 0 }} />
          </g>
          <g data-part="eyes-happy" style={{ opacity: 0 }}>{photo(HAPPY)}</g>
        </g>
      </g>
      {withTable ? (
        <g data-part="table">
          <rect x="0" y="262" width="400" height="58" rx="10" fill="var(--cp-table-wood)" />
          <rect x="0" y="262" width="400" height="14" rx="8" fill="var(--cp-table-edge)" />
          <path d="M0 286h400M40 302h90M245 309h96" stroke="var(--cp-table-grain)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        </g>
      ) : null}
      <g data-part="paw-l" clipPath={`url(#${id('paw-l')})`} style={{ transformOrigin: '124px 274px', transformBox: 'view-box' }}>{photo()}</g>
      <g data-part="paw-r" clipPath={`url(#${id('paw-r')})`} style={{ transformOrigin: '278px 274px', transformBox: 'view-box' }}>{photo()}</g>
    </svg>
  );
}
