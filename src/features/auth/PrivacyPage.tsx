'use client';

import { useI18n } from '@/i18n/provider';
import s from './auth.module.css';

const UPDATED = '2026-10-06';

export function PrivacyPage() {
  const { m, f, date } = useI18n();
  return (
    <div className={`cp-container cp-page ${s.wide}`}>
      <h1>{m.privacy.title}</h1>
      <p className={s.fine}>{f(m.privacy.updated, { date: date(UPDATED) })}</p>
      <p>{m.privacy.intro}</p>
      {m.privacy.sections.map((sec) => (
        <section key={sec.h} className={s.policy}>
          <h2 className={s.h2}>{sec.h}</h2>
          <p>{sec.p}</p>
        </section>
      ))}
    </div>
  );
}
