'use client';

import { useI18n } from '@/i18n/provider';
import { Button, ButtonLink } from '@/components/ui/Button';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const { m } = useI18n();
  return (
    <div className="cp-container cp-page" style={{ textAlign: 'center', paddingBlock: 64 }}>
      <h1>{m.errorPage.title}</h1>
      <p>{m.errorPage.text}</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button variant="primary" icon="refresh" onClick={reset}>{m.common.retry}</Button>
        <ButtonLink href="/" icon="home">{m.notFound.home}</ButtonLink>
      </div>
    </div>
  );
}
