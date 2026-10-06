'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n/provider';
import { Icon } from '@/components/ui/Icon';
import { Wordmark } from './Wordmark';
import { AccountButton, HelpButton, LocaleSwitch, RunBadge, SoundToggle } from './HeaderControls';
import s from './header.module.css';

const ANCHORS = [
  { id: 'top', key: 'home' },
  { id: 'how-it-works', key: 'howItWorks' },
  { id: 'find-location', key: 'findLocation' },
  { id: 'stories', key: 'stories' },
  { id: 'about', key: 'about' },
] as const;

export function Header() {
  const { m } = useI18n();
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={s.header} data-scrolled={scrolled ? 'true' : undefined}>
      <div className={`cp-container ${s.inner}`}>
        <Link href="/" className={s.brand} aria-label="Cozypet">
          <Wordmark height={30} />
        </Link>
        {isHome ? (
          <nav aria-label={m.nav.mainNav} className={s.anchors}>
            {ANCHORS.map((a) => (
              <a key={a.id} href={`#${a.id}`}>{m.nav[a.key]}</a>
            ))}
          </nav>
        ) : null}
        <div className={s.right}>
          <RunBadge />
          <div className={s.wideOnly}>
            <LocaleSwitch />
          </div>
          <HelpButton compact />
          <div className={s.wideOnly}>
            <AccountButton />
          </div>
          {isHome ? (
            <Link href="/scan" className={`${s.cta} ${s.desktopOnly}`}>{m.nav.startHelping}</Link>
          ) : null}
          <button
            type="button"
            className={s.menuBtn}
            aria-expanded={menuOpen}
            aria-controls="cp-mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? m.nav.closeMenu : m.nav.menu}
          >
            <Icon name={menuOpen ? 'x' : 'menu'} />
          </button>
        </div>
      </div>
      <div id="cp-mobile-menu" className={s.mobileMenu} hidden={!menuOpen}>
        <div className="cp-container">
          {isHome ? (
            <nav aria-label={m.nav.mainNav} className={s.mobileAnchors}>
              {ANCHORS.map((a) => (
                <a key={a.id} href={`#${a.id}`} onClick={closeMenu}>{m.nav[a.key]}</a>
              ))}
              <Link href="/scan" className={s.cta} onClick={closeMenu}>{m.nav.startHelping}</Link>
            </nav>
          ) : null}
          <div className={s.mobileControls}>
            <LocaleSwitch />
            <SoundToggle />
            <div onClick={closeMenu}><AccountButton /></div>
          </div>
        </div>
      </div>
    </header>
  );
}
