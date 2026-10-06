'use client';

import { useState } from 'react';
import type { MediaRef } from '@/lib/types';
import { parseArtSrc } from '@/data/pet-art';
import { useI18n } from '@/i18n/provider';
import { PetArt } from './PetArt';
import { Icon } from './ui/Icon';
import s from './petimage.module.css';

/**
 * ภาพสัตว์/สถานที่: ภาพวาดในโค้ด (`art:`), ภาพในเครื่อง (data URL) หรือไฟล์ใน public — มี fallback ขนาดคงที่ (PROMPT.md 15)
 */
export function PetImage({ media, ratio = '4 / 3', className, label, fallbackLabel, rounded = true }: {
  media?: MediaRef | null;
  ratio?: string;
  className?: string;
  /** ป้ายมุมภาพ เช่น “ภาพสร้างด้วย AI” */
  label?: string | null;
  fallbackLabel?: string;
  rounded?: boolean;
}) {
  const { m } = useI18n();
  const [failed, setFailed] = useState(false);
  const art = media ? parseArtSrc(media.src) : null;
  const localOnly = media?.src === 'local-only';
  const showFallback = !media || failed || localOnly;
  const tag = label ?? (media?.aiGenerated ? m.common.aiImage : art ? m.common.drawnImage : null);
  return (
    <div className={[s.box, rounded && s.rounded, className].filter(Boolean).join(' ')} style={{ aspectRatio: ratio }}>
      {showFallback ? (
        <div className={s.fallback} role="img" aria-label={media?.alt || fallbackLabel || ''}>
          <Icon name="paw" size={36} />
          {fallbackLabel ? <span className={s.fallbackText}>{fallbackLabel}</span> : null}
        </div>
      ) : art ? (
        <div role="img" aria-label={media!.alt} className={s.art}>
          <PetArt species={art.species} colors={art.colors} collar={art.collar} seed={art.seed} className={s.svg} />
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={media!.src} alt={media!.alt} className={s.img} onError={() => setFailed(true)} loading="lazy" decoding="async" />
      )}
      {tag && !showFallback ? <span className={s.tag}>{tag}</span> : null}
    </div>
  );
}

/** avatar วงกลม: รูป หรือ ตัวอักษรแรกบนพื้นทอง */
export function Avatar({ name, media, size = 40, aiLabel = false }: { name: string; media?: MediaRef | null; size?: number; aiLabel?: boolean }) {
  const { m } = useI18n();
  const [failed, setFailed] = useState(false);
  const initial = name.trim().charAt(0) || '?';
  return (
    <span className={s.avatar} style={{ width: size, height: size, fontSize: size * 0.42 }}>
      {media && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={media.src} alt={media.alt} onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden="true">{initial}</span>
      )}
      {aiLabel && media && !failed ? <span className={s.aiDot} title={m.common.aiImage}>{m.common.aiImageShort}</span> : null}
    </span>
  );
}
