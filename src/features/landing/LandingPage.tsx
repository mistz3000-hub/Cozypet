'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { useI18n } from '@/i18n/provider';
import { useDemoSession, useHydrated } from '@/lib/store';
import { m as motionEl } from '@/lib/motion';
import { T, staggerDelay } from '@/lib/motion-tokens';
import { ADOPTERS, HELPERS, SHELTERS, STORIES } from '@/data';
import { DISTRICTS } from '@/data/districts';
import { PROJECT_INFO } from '@/data/project-info';
import { buildFindingSession, formatRun } from '@/lib/run';
import { statusLevel } from '@/lib/status';
import { ButtonLink } from '@/components/ui/Button';
import { Badge, Eyebrow } from '@/components/ui/Badge';
import { Icon, type IconName } from '@/components/ui/Icon';
import { CountUp } from '@/components/ui/CountUp';
import { MascotStage } from '@/components/mascot/MascotStage';
import { BangkokMap, type MapPin } from '@/components/map/BangkokMap';
import { StoryCard } from '@/features/stories/StoryCard';
import { StoryFilmSection } from '@/features/story/StoryFilmSection';
import { PhoneTourSection } from '@/features/motion/howto/PhoneTourSection';
import s from './landing.module.css';

export function LandingPage() {
  const { m, f, district } = useI18n();
  const params = useSearchParams();
  const hydrated = useHydrated();
  const [session] = useDemoSession();
  const run = hydrated ? session.runNumber : null;
  const finding = run ? session.findingIndexByRun[formatRun(run)] ?? 1 : 1;
  const point = run ? buildFindingSession(run, finding, 'run_seed', undefined, '').searchPoint : null;
  const pointDistrict = run ? buildFindingSession(run, finding, 'run_seed', undefined, '').districtId : null;

  const stories = useMemo(() => {
    // 3 ใบ มีทั้งสองผลลัพธ์อย่างน้อยอย่างละ 1
    const adopted = STORIES.filter((x) => x.outcome === 'adopted');
    const reunited = STORIES.filter((x) => x.outcome === 'reunited');
    return [adopted[0], reunited[0], adopted[1] ?? reunited[1]].filter(Boolean);
  }, []);

  const pins: MapPin[] = useMemo(() => HELPERS.filter((_, i) => i % 3 === 0).map((h) => ({ id: h.id, location: h.location, level: statusLevel(h), kind: h.kind, label: h.displayName })), []);

  const steps: { title: string; text: string; cta: string; href: string; icon: IconName }[] = [
    { title: m.landing.step1Title, text: m.landing.step1Text, cta: m.landing.step1Cta, href: '/scan', icon: 'camera' },
    { title: m.landing.step2Title, text: m.landing.step2Text, cta: m.landing.step2Cta, href: '/listings?tab=lost', icon: 'search' },
    { title: m.landing.step3Title, text: m.landing.step3Text, cta: m.landing.step3Cta, href: '/nearby', icon: 'chat' },
  ];

  return (
    <div className={s.page}>
      {/* 1 Hero */}
      <section id="top" className={s.hero} aria-labelledby="hero-title">
        <div className={`cp-container ${s.heroGrid}`}>
          <div className={s.heroText}>
            <Badge tone="butter" icon="sparkle">{m.landing.heroBadge}</Badge>
            <h1 id="hero-title" className={s.heroTitle}>{m.landing.heroTitle}</h1>
            <p className={s.heroLead}>{m.landing.heroText}</p>
            <div className={s.heroCtas}>
              <ButtonLink href="/scan" variant="primary" icon="paw">{m.landing.ctaFound}</ButtonLink>
              <ButtonLink href="/listings/new?mode=lost" variant="secondary" icon="search">{m.landing.ctaLost}</ButtonLink>
            </div>
            <p className={s.nearbyLink}>
              <Link href="/nearby"><Icon name="pin" size="1em" /> {m.landing.ctaNearby}</Link>
              <span className={s.nearbyNote}>{m.landing.ctaNearbyNote}</span>
            </p>
          </div>
          <div className={s.heroArt}>
            <MascotStage forceError={params.get('mascotError') === '1'} />
          </div>
        </div>
      </section>

      {/* 2 How it works */}
      <section id="how-it-works" className={s.section} aria-labelledby="how-title">
        <div className="cp-container">
          <header className={s.sectionHead}>
            <Eyebrow icon="paw">Cozypet</Eyebrow>
            <h2 id="how-title">{m.landing.howTitle}</h2>
            <p className={s.sectionLead}>{m.landing.howIntro}</p>
          </header>
          <StoryFilmSection />
          <PhoneTourSection />
          <ol className={s.steps}>
            {steps.map((st, i) => (
              <motionEl.li
                key={st.title}
                className={s.step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ ...T.base, delay: staggerDelay(i) }}
              >
                <span className={s.stepIcon} aria-hidden="true"><Icon name={st.icon} size={26} /></span>
                <span className={s.stepNum}>{f(m.landing.stepLabel, { n: i + 1 })}</span>
                <h3>{st.title}</h3>
                <p>{st.text}</p>
                <ButtonLink href={st.href} variant="soft" small iconRight="arrowRight">{st.cta}</ButtonLink>
              </motionEl.li>
            ))}
          </ol>
        </div>
      </section>

      {/* 3 Find location */}
      <section id="find-location" className={`${s.section} ${s.alt}`} aria-labelledby="find-title">
        <div className={`cp-container ${s.findGrid}`}>
          <div>
            <header className={s.sectionHead}>
              <Eyebrow icon="pin">{m.nav.findLocation}</Eyebrow>
              <h2 id="find-title">{m.landing.findTitle}</h2>
            </header>
            {run && pointDistrict ? (
              <p className={s.runPoint}><Icon name="target" /> {f(m.landing.findRun, { run: formatRun(run), district: district(pointDistrict) })}</p>
            ) : (
              <p className={s.runPoint}>
                <Icon name="info" /> {m.landing.findNoRun}{' '}
                <Link href="/start?next=/nearby">{m.landing.findNoRunCta}</Link>
              </p>
            )}
            <dl className={s.stats}>
              <div><dt>{m.landing.statShelters}</dt><dd><CountUp value={SHELTERS.length} /></dd></div>
              <div><dt>{m.landing.statIndividuals}</dt><dd><CountUp value={ADOPTERS.length} /></dd></div>
              <div><dt>{m.landing.statDistricts}</dt><dd><CountUp value={DISTRICTS.length} /></dd></div>
            </dl>
            <p className="visually-hidden">{f(m.landing.findStats, { shelters: SHELTERS.length, individuals: ADOPTERS.length, districts: DISTRICTS.length })}</p>
            <p className={s.note}><Icon name="info" size="1em" /> {m.landing.findNote}</p>
            <ButtonLink href="/nearby" variant="primary" icon="search">{m.landing.findCta}</ButtonLink>
          </div>
          <BangkokMap mini pins={pins} searchPoint={point} radiusKm={point ? 5 : null} />
        </div>
      </section>

      {/* 4 Stories */}
      <section id="stories" className={s.section} aria-labelledby="stories-title">
        <div className="cp-container">
          <header className={s.sectionHead}>
            <Eyebrow icon="heart">{m.nav.stories}</Eyebrow>
            <h2 id="stories-title">{m.landing.storiesTitle}</h2>
          </header>
          <div className={s.storyGrid}>
            {stories.map((st) => <StoryCard key={st.id} story={st} />)}
          </div>
          <div className={s.center}>
            <ButtonLink href="/stories" variant="secondary" iconRight="arrowRight">{m.landing.storiesAll}</ButtonLink>
          </div>
        </div>
      </section>

      {/* 5 About */}
      <section id="about" className={`${s.section} ${s.alt}`} aria-labelledby="about-title">
        <div className="cp-container">
          <header className={s.sectionHead}>
            <Eyebrow icon="info">{m.nav.about}</Eyebrow>
            <h2 id="about-title">{m.landing.aboutTitle}</h2>
            <p className={s.sectionLead}>{m.landing.aboutText}</p>
            <p className={s.team}>
              <Badge tone="gold">{PROJECT_INFO.projectLabel}</Badge> <span>{f(m.landing.aboutTeam, { team: PROJECT_INFO.teamName })}</span>
              {PROJECT_INFO.course ? <span> · {PROJECT_INFO.course}</span> : null}
              {PROJECT_INFO.institution ? <span> · {PROJECT_INFO.institution}</span> : null}
            </p>
          </header>
          <div className={s.aboutGrid}>
            <div className={s.aboutCol}>
              <h3><Icon name="check" /> {m.landing.aboutCanTitle}</h3>
              <ul>{m.landing.aboutCan.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
            <div className={`${s.aboutCol} ${s.aboutMock}`}>
              <h3><Icon name="info" /> {m.landing.aboutMockTitle}</h3>
              <ul>{m.landing.aboutMock.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
          </div>
          <p className={s.aboutLinks}>
            <Link href="/insights"><Icon name="chart" size="1em" /> {m.landing.aboutInsights}</Link>
            <Link href="/about-demo"><Icon name="doc" size="1em" /> {m.landing.aboutDemoLink}</Link>
          </p>
        </div>
      </section>

      {/* 6 CTA */}
      <section id="get-started" className={s.ctaSection} aria-labelledby="cta-title">
        <div className={`cp-container ${s.ctaBox}`}>
          <h2 id="cta-title">{m.landing.ctaTitle}</h2>
          <p>{m.landing.ctaText}</p>
          <div className={s.heroCtas}>
            <ButtonLink href="/scan" variant="primary" icon="paw">{m.landing.ctaFound}</ButtonLink>
            <ButtonLink href="/nearby" variant="secondary" icon="search">{m.landing.findCta}</ButtonLink>
            <ButtonLink href="/listings" variant="ghost" icon="list">{m.landing.ctaListings}</ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
