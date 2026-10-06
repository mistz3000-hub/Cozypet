'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/i18n/provider';
import { useDemoSession, useHydrated } from '@/lib/store';
import { m as motionEl } from '@/lib/motion';
import { SPRING } from '@/lib/motion-tokens';
import { Icon, type IconName } from '@/components/ui/Icon';
import { MascotSwitch } from '@/components/mascot/MascotSwitch';
import { MiniMascot, DOCK_TOUCH_EVENT } from '@/components/mascot/MiniMascot';
import { SoundToggle } from './HeaderControls';
import s from './tabbar.module.css';

interface Tab { key: 'tabHome' | 'tabScan' | 'tabNearby' | 'tabListings' | 'tabProfile'; href: string; icon: IconName; match: (p: string) => boolean; tour: string }

/** bottom tab bar (มือถือ) / dock (แท็บเล็ต-desktop) — PROMPT.md 3.5, 6.4, 6.7 */
export function TabBar() {
  const { m } = useI18n();
  const pathname = usePathname() ?? '/';
  const hydrated = useHydrated();
  const [session] = useDemoSession();
  const hasRun = hydrated && session.runNumber !== null;
  const tabs: Tab[] = [
    { key: 'tabHome', href: hasRun ? '/dashboard' : '/', icon: 'home', match: (p) => p === '/' || p.startsWith('/dashboard'), tour: 'tab-home' },
    { key: 'tabScan', href: '/scan', icon: 'scan', match: (p) => p.startsWith('/scan'), tour: 'tab-scan' },
    { key: 'tabNearby', href: '/nearby', icon: 'search', match: (p) => p.startsWith('/nearby') || p.startsWith('/helpers'), tour: 'tab-nearby' },
    { key: 'tabListings', href: '/listings', icon: 'list', match: (p) => p.startsWith('/listings'), tour: 'tab-listings' },
    { key: 'tabProfile', href: '/profile', icon: 'user', match: (p) => p.startsWith('/profile') || p.startsWith('/account'), tour: 'tab-profile' },
  ];
  const active = tabs.findIndex((t) => t.match(pathname));
  const touch = () => window.dispatchEvent(new Event(DOCK_TOUCH_EVENT));

  return (
    <div className={`${s.wrap} cp-hide-when-typing cp-no-print`}>
      <div className={s.bar}>
        <div className={s.topRow}>
          <MiniMascot style={{ right: 14, top: -34 }} />
          <div className={s.soundSlot}><SoundToggle /></div>
          <MascotSwitch compact idSuffix="-dock" />
        </div>
        <nav aria-label={m.nav.tabs} className={s.tabs} data-tour="tabbar">
          {active >= 0 ? (
            <motionEl.span
              className={s.pill}
              aria-hidden="true"
              initial={false}
              animate={{ x: `${active * 100}%` }}
              transition={SPRING.snappy}
            />
          ) : null}
          {tabs.map((t, i) => (
            <Link
              key={t.key}
              href={t.href}
              className={s.tab}
              aria-current={i === active ? 'page' : undefined}
              onPointerEnter={touch}
              onFocus={touch}
              onTouchStart={touch}
              data-tour={t.tour}
            >
              <Icon name={t.icon} />
              <span>{m.nav[t.key]}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
