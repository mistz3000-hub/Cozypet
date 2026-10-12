'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { m as motionEl, MotionConfig, useReducedMotion, useScroll, useSpring, useTransform } from '@/lib/motion';
import { SPRING } from '@/lib/motion-tokens';
import { mascotImages, retryImages, useImagesReady } from '@/lib/image-loading';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDemoSession, useHydrated } from '@/lib/store';
import { useI18n } from '@/i18n/provider';
import { PetHearts } from '@/components/mascot/PetHearts';
import { usePetReaction } from '@/components/mascot/usePetReaction';
import { PetImage, Avatar } from '@/components/PetImage';
import { Icon } from '@/components/ui/Icon';
import { ButtonLink } from '@/components/ui/Button';
import { Wordmark } from '@/components/shell/Wordmark';
import { ADOPTERS, STORIES } from '@/data';
import { PET_JOURNEY as J } from './pet-journey-config';
import s from './pet-journey.module.css';

export function PetMouthJourney() {
  const { m } = useI18n();
  const [session] = useDemoSession();
  const hydrated = useHydrated();
  const reducedHearts = !!useReducedMotion();
  const kind = hydrated ? session.mascot : 'cat';
  const images = mascotImages(kind);
  const assets = useImagesReady(images);
  const { reaction, hearts, react } = usePetReaction(kind, reducedHearts);
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 640, pet: 560, centerY: 0.5 });
  const [entered, setEntered] = useState(false);
  const [petInteractive, setPetInteractive] = useState(true);
  const { scrollYProgress: rawProgress } = useScroll({ target: root, offset: ['start center', 'end end'] });
  const scrollYProgress = useSpring(rawProgress, SPRING.soft);
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      const pet = parseFloat(getComputedStyle(el).getPropertyValue('--animal-size'));
      const centerY = parseFloat(getComputedStyle(el).getPropertyValue('--animal-center-y')) / 100;
      setDimensions({ width: r.width, height: r.height, pet: Number.isFinite(pet) ? pet : Math.min(440, r.width * 0.64), centerY: Number.isFinite(centerY) ? centerY : 0.5 });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const update = (p: number) => { setEntered(p >= J.linksActive); setPetInteractive(p < J.enterStart); };
    update(scrollYProgress.get());
    return scrollYProgress.on('change', update);
  }, [scrollYProgress]);
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  const yawn = useTransform(scrollYProgress, [J.yawnStart, J.yawnFull], [0, 1]);
  const normal = useTransform(yawn, v => 1 - v);
  const scale = useTransform(scrollYProgress, p => Math.pow(J.zoom[kind], clamp((p - J.enterStart) / (J.enterEnd - J.enterStart))));
  const petOpacity = useTransform(scrollYProgress, [...J.petFade], [1, 0]);
  const haloOpacity = useTransform(scrollYProgress, [...J.haloFade], [1, 0]);
  const portalOpacity = useTransform(scrollYProgress, [...J.portalFade], [0, 1]);
  const portalLight = useTransform(scrollYProgress, [...J.portalLight], [0, 1]);
  const previewScale = useTransform(scrollYProgress, p => {
    const marks = J.previewMarks;
    const sizes = dimensions.width < 768 ? J.previewMobile : J.previewDesktop;
    let wanted = 1;
    for (let i = 1; i < marks.length; i++) if (p <= marks[i]) {
      wanted = sizes[i - 1] + (sizes[i] - sizes[i - 1]) * clamp((p - marks[i - 1]) / (marks[i] - marks[i - 1]));
      break;
    }
    if (p >= J.enterEnd) return 1;
    const z = Math.pow(J.zoom[kind], clamp((p - J.enterStart) / (J.enterEnd - J.enterStart)));
    const mouth = J.mouth[kind];
    const inset = dimensions.width < 768 ? 32 : 48;
    // Fit the complete page rectangle inside the growing oval; avoid chopping its headline.
    const fit = J.maskOpaque / Math.hypot((dimensions.width - inset) / (2 * dimensions.pet * mouth.rx * z), (dimensions.height - inset) / (2 * dimensions.pet * mouth.ry * z));
    return Math.min(wanted, fit);
  });
  const previewY = useTransform(scrollYProgress, p => {
    const offset = dimensions.height * (dimensions.centerY - 0.5) + dimensions.pet * (J.mouth[kind].y - 0.5);
    return offset * (1 - clamp((p - J.previewRecenter[0]) / (J.previewRecenter[1] - J.previewRecenter[0])));
  });
  const mask = useTransform(scrollYProgress, p => {
    if (p >= J.enterEnd) return 'none';
    const mouth = J.mouth[kind];
    const z = Math.pow(J.zoom[kind], clamp((p - J.enterStart) / (J.enterEnd - J.enterStart)));
    const rx = dimensions.pet * mouth.rx * z;
    const ry = dimensions.pet * mouth.ry * z;
    const y = dimensions.height * dimensions.centerY + dimensions.pet * (mouth.y - 0.5);
    // Grayscale mask channels soften the opening into the photographic mouth.
    return `radial-gradient(ellipse ${rx}px ${ry}px at 50% ${y}px, black ${J.maskOpaque * 100}%, transparent 100%)`;
  });
  const canUseLinks = entered;
  const helpers = [ADOPTERS[0], ADOPTERS[2], ADOPTERS[13]];

  return (
    <MotionConfig reducedMotion="never">
    <section ref={root} className={s.journey} data-pet-journey data-kind={kind} aria-labelledby="pet-journey-title">
      <h2 id="pet-journey-title" className="visually-hidden">{m.petJourney.title}</h2>
      <div ref={stage} className={s.stage} data-journey-stage>
        <Link className={`visually-hidden ${s.skip}`} href="#how-it-works">{m.petJourney.skip}</Link>
        <motionEl.div className={s.halo} style={{ opacity: haloOpacity }} aria-hidden="true" />
        <motionEl.div className={s.decor} style={{ opacity: haloOpacity }} aria-hidden="true"><Icon name="paw" size={24} /><Icon name="paw" size={18} /><Icon name="heart" size={20} /></motionEl.div>
        <motionEl.div className={s.animal} data-journey-animal style={{ scale, opacity: petOpacity, transformOrigin: `50% ${J.mouth[kind].y * 100}%` }} aria-busy={assets.loading}>
          {assets.loading ? <Skeleton /> : assets.error ? <div className={s.imageError} role="status">{m.mascot.loadFailed}<button type="button" onClick={() => retryImages(images)}>{m.common.retry}</button></div> : <>
          <button type="button" className={s.petTrigger} aria-label={kind === 'cat' ? m.mascot.playCat : m.mascot.playDog} onClick={react} disabled={!petInteractive} data-pet-play="journey">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motionEl.img src={`/mascot/${kind}-${reaction ? 'happy' : 'neutral'}.png`} alt="" className={s.pet} style={{ opacity: normal }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motionEl.img src={`/mascot/${kind}-yawn.png`} alt="" className={s.pet} style={{ opacity: yawn }} />
          <PetHearts hearts={hearts} reduced={reducedHearts} anchor="photo" />
          <span className="visually-hidden" role="status">{reaction ? m.mascot.petLoved : ''}</span>
          </button>
          </>}
        </motionEl.div>
        <motionEl.div className={s.portal} data-journey-portal style={{ opacity: assets.ready ? portalOpacity : 0, maskImage: mask, WebkitMaskImage: mask }} aria-hidden={!canUseLinks} inert={!canUseLinks} data-entered={canUseLinks ? 'true' : undefined}>
          <motionEl.div className={s.portalSurface} style={{ opacity: portalLight }} aria-hidden="true" />
          <motionEl.div className={s.siteWindow} data-journey-page style={{ scale: previewScale, y: previewY }}>
            <div className={s.siteTop}><Wordmark height={34} /><span><Icon name="heart" size={15} /> {m.petJourney.insideText}</span></div>
            <div className={s.siteHero}>
              <div>
                <span className={s.eyebrow}>{m.petJourney.inside}</span>
                <h3>{m.petJourney.portalTitle}</h3>
                <p>{m.petJourney.portalText}</p>
                <div className={s.ctas}><ButtonLink href="/scan" variant="primary" icon="camera">{m.landing.ctaFound}</ButtonLink><ButtonLink href="/nearby" icon="pin">{m.landing.findCta}</ButtonLink></div>
              </div>
              <figure className={s.pictureFrame}><PetImage media={STORIES[kind === 'cat' ? 0 : 1].photo} ratio="1 / 1" className={s.previewPet} /><figcaption><Icon name="heart" size={16} />{m.petJourney.insideText}</figcaption></figure>
            </div>
            <div className={s.helpers}>
              {helpers.map(h => <Link href={`/helpers/${h.id}`} key={h.id} className={s.helper}>
                <Avatar name={h.displayName} media={h.images.profile} size={44} />
                <span><strong>{h.displayName}</strong><small>{m.kind.individual}</small></span>
                <Icon name="arrowRight" size={16} />
              </Link>)}
            </div>
          </motionEl.div>
        </motionEl.div>
      </div>
    </section>
    </MotionConfig>
  );
}
