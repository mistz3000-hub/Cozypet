import type { CSSProperties } from 'react';
import s from './skeleton.module.css';

/** Only mount while the owning image, data request or Suspense boundary is pending. */
export function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return <span aria-hidden="true" data-skeleton className={[s.shape, className].filter(Boolean).join(' ')} style={style} />;
}
