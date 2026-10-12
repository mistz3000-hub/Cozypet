import type { SVGProps } from 'react';
import type { MascotKind } from '@/lib/types';

/** Original vector marks: rounded, retractable cat toes / broad dog pads with small claws. */
export function PawPrint({ kind, ...props }: { kind: MascotKind } & SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
    {kind === 'cat' ? <>
      <ellipse cx="9" cy="19" rx="4.2" ry="5.3" transform="rotate(-28 9 19)" />
      <ellipse cx="18.5" cy="11" rx="4.4" ry="5.7" transform="rotate(-10 18.5 11)" />
      <ellipse cx="29.5" cy="11" rx="4.4" ry="5.7" transform="rotate(10 29.5 11)" />
      <ellipse cx="39" cy="19" rx="4.2" ry="5.3" transform="rotate(28 39 19)" />
      <path d="M11 32c-1.8-5 3-9 7-9 2-5 10-5 12 0 4 0 8.8 4 7 9-1.5 5.5-8 3-13 3s-11.5 2.5-13-3Z" />
    </> : <>
      <ellipse cx="9" cy="19" rx="4.5" ry="6.2" transform="rotate(-24 9 19)" />
      <ellipse cx="18.5" cy="10.5" rx="4.7" ry="6.5" transform="rotate(-8 18.5 10.5)" />
      <ellipse cx="29.5" cy="10.5" rx="4.7" ry="6.5" transform="rotate(8 29.5 10.5)" />
      <ellipse cx="39" cy="19" rx="4.5" ry="6.2" transform="rotate(24 39 19)" />
      <path d="M10.5 33c-1-4.5 3.8-7.5 7-11 3-4 10-4 13 0 3.2 3.5 8 6.5 7 11-1.3 6-8.5 2-13.5 2s-12.2 4-13.5-2Z" />
      <path d="m5 10-1-2m13-6-.3-1m14 .9.3-1M43 10l1-2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>}
  </svg>;
}
