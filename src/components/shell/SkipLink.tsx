'use client';

import { useI18n } from '@/i18n/provider';

export function SkipLink() {
  const { m } = useI18n();
  return (
    <a href="#main" className="skip-link">
      {m.common.skipToContent}
    </a>
  );
}
