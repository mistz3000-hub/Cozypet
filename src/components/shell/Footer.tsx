'use client';

import Link from 'next/link';
import { useI18n } from '@/i18n/provider';
import { PROJECT_INFO } from '@/data/project-info';
import { Wordmark } from './Wordmark';
import s from './footer.module.css';

export function Footer() {
  const { m, f } = useI18n();
  const links = [
    ['/scan', m.footer.scan],
    ['/nearby', m.footer.nearby],
    ['/listings', m.footer.listings],
    ['/stories', m.footer.stories],
    ['/donate', m.footer.donate],
    ['/partners', m.business.partners],
    ['/insights', m.footer.insights],
    ['/how-to', m.footer.howTo],
    ['/profile#reset', m.footer.reset],
    ['/about-demo', m.footer.aboutDemo],
    ['/privacy', m.footer.privacy],
  ] as const;
  return (
    <footer className={`${s.footer} cp-no-print`}>
      <div className={`cp-container ${s.inner}`}>
        <div className={s.brandCol}>
          <Wordmark height={28} />
          <p className={s.team}>{f(m.footer.team, { project: PROJECT_INFO.projectLabel, team: PROJECT_INFO.teamName })}</p>
        </div>
        <nav aria-label={m.footer.links} className={s.links}>
          {links.map(([href, label]) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
        </nav>
        <p className={s.disclaimer}>{m.footer.disclaimer}</p>
      </div>
    </footer>
  );
}
