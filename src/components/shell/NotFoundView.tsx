'use client';

import { useI18n } from '@/i18n/provider';
import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

export function NotFoundView() {
  const { m } = useI18n();
  return (
    <div className="cp-container cp-page" style={{ textAlign: 'center', paddingBlock: 64 }}>
      <Icon name="paw" size={56} style={{ color: 'var(--cp-gold-700)' }} />
      <h1>{m.notFound.title}</h1>
      <p>{m.notFound.text}</p>
      <ButtonLink href="/" variant="primary" icon="home">{m.notFound.home}</ButtonLink>
    </div>
  );
}
