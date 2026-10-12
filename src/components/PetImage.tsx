'use client';

import { useState } from 'react';
import type { MediaRef } from '@/lib/types';
import { parseArtSrc } from '@/data/pet-art';
import { petPhotoFor } from '@/data/pet-photos';
import { AtlasPhoto } from './AtlasPhoto';
import { Icon } from './ui/Icon';
import { Skeleton } from './ui/Skeleton';
import { useImagesReady } from '@/lib/image-loading';
import { useI18n } from '@/i18n/provider';
import s from './petimage.module.css';

/** All known demo animals resolve to generated photographs, including old locally saved records. */
export function PetImage({ media, ratio = '4 / 3', className, fallbackLabel, rounded = true }: {
  media?: MediaRef | null;
  ratio?: string;
  className?: string;
  label?: string | null;
  fallbackLabel?: string;
  rounded?: boolean;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const legacy = media ? parseArtSrc(media.src) : null;
  const display = legacy ? petPhotoFor(legacy.seed) : media;
  const { m } = useI18n();
  const image = useImagesReady(display && display.src !== 'local-only' ? [display.src] : []);
  const showFallback = !display || failedSrc === display.src || display.src === 'local-only' || image.error;
  const busy = !showFallback && image.loading;
  return (
    <div className={[s.box, rounded && s.rounded, className].filter(Boolean).join(' ')} style={{ aspectRatio: ratio }} aria-busy={busy} aria-label={busy ? m.common.loading : undefined}>
      {showFallback ? (
        <div className={s.fallback} role="img" aria-label={display?.alt || fallbackLabel || ''}>
          <Icon name="paw" size={36} />
          {fallbackLabel ? <span className={s.fallbackText}>{fallbackLabel}</span> : null}
        </div>
      ) : busy ? <Skeleton className={s.photoSkeleton} /> : (
        <AtlasPhoto media={display!} className={display!.atlas ? s.svg : s.img} onError={() => setFailedSrc(display!.src)} />
      )}
    </div>
  );
}

/** Round portrait, with the same stable atlas cropping as all other photos. */
export function Avatar({ name, media, size = 40 }: { name: string; media?: MediaRef | null; size?: number; aiLabel?: boolean }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const initial = name.trim().charAt(0) || '?';
  const image = useImagesReady(media && media.src !== 'local-only' ? [media.src] : []);
  return (
    <span className={s.avatar} style={{ width: size, height: size, fontSize: size * 0.42 }} aria-busy={image.loading}>
      {image.loading ? <Skeleton /> : media && media.src !== 'local-only' && media.src !== failedSrc && !image.error ? (
        <AtlasPhoto media={media} className={s.avatarPhoto} cover onError={() => setFailedSrc(media.src)} />
      ) : <span aria-hidden="true">{initial}</span>}
    </span>
  );
}
