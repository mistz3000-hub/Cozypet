'use client';

import { useId } from 'react';
import type { MediaRef } from '@/lib/types';

/** Native SVG crops a tile without creating edited raster files. */
export function AtlasPhoto({ media, className, onError, cover = false }: {
  media: MediaRef;
  className?: string;
  onError?: () => void;
  cover?: boolean;
}) {
  const clip = `photo-${useId().replace(/:/g, '')}`;
  const tile = media.atlas;
  if (!tile) return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={media.src} alt={media.alt} className={className} onError={onError} loading="lazy" decoding="async" />
  );
  const crop = tile.crop;
  const width = crop?.width ?? 1;
  const height = crop?.height ?? 1;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio={cover ? 'xMidYMid slice' : 'xMidYMid meet'} className={className} role="img" aria-label={media.alt} data-photo-tile="true">
      <defs><clipPath id={clip}><rect width={width} height={height} /></clipPath></defs>
      <g clipPath={`url(#${clip})`}>
        <image href={media.src} x={crop ? -crop.x : -(tile.index % tile.columns)} y={crop ? -crop.y : -Math.floor(tile.index / tile.columns)} width={crop?.sheetWidth ?? tile.columns} height={crop?.sheetHeight ?? tile.rows} preserveAspectRatio="none" onError={onError} />
      </g>
    </svg>
  );
}
