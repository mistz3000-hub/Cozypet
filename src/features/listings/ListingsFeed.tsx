'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useId, useMemo } from 'react';
import type { ListingType, Species } from '@/lib/types';
import { useI18n } from '@/i18n/provider';
import { HELPERS } from '@/data';
import { coatColor } from '@/data/colors';
import { getDistrict } from '@/data/districts';
import { rankAdoptions } from '@/lib/balancer';
import { useStore } from '@/lib/store';
import { useNow } from '@/lib/useNow';
import { AnimatePresence, m as motionEl, MotionMax } from '@/lib/motion';
import { T } from '@/lib/motion-tokens';
import { useAllListings } from '@/features/shared/data-hooks';
import { DistrictSelect } from '@/features/shared/DistrictSelect';
import { ButtonLink, Button } from '@/components/ui/Button';
import { Field, Select, TextInput } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { ListingCard } from './ListingCard';
import s from './listings.module.css';

const TABS: ListingType[] = ['lost', 'found', 'adoption'];
const helperMap = new Map(HELPERS.map((h) => [h.id, h]));

export function ListingsFeed() {
  const { m, f, num } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const all = useAllListings();
  const history = useStore('searchHistory');
  const now = useNow();
  const id = useId();

  const tab = (TABS.includes(params.get('tab') as ListingType) ? params.get('tab') : 'lost') as ListingType;
  const q = params.get('q') ?? '';
  const species = (params.get('species') ?? '') as Species | '';
  const district = params.get('district') ?? '';
  const status = (params.get('status') ?? 'open') as 'open' | 'closed' | 'all';
  const sortParam = params.get('sort');
  const sort = (sortParam === 'oldest' || sortParam === 'latest' || (sortParam === 'recommended' && tab === 'adoption')) ? sortParam : (tab === 'adoption' ? 'recommended' : 'latest');

  const set = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '') next.delete(k);
      else next.set(k, v);
    }
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const { items, ranks } = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = all.filter((l) => l.type === tab);
    if (species) list = list.filter((l) => l.species === species);
    if (district) list = list.filter((l) => l.districtId === district);
    if (status !== 'all') list = list.filter((l) => l.status === status);
    if (needle) {
      list = list.filter((l) => {
        const d = getDistrict(l.districtId);
        const hay = [l.name, l.markings, l.description, l.speciesOther, d?.nameTh, d?.nameEn, ...l.colors.flatMap((c) => [coatColor(c)?.label.th, coatColor(c)?.label.en])].filter(Boolean).join(' ').toLowerCase();
        return hay.includes(needle);
      });
    }
    const rankMap = new Map<string, number>();
    if (sort === 'recommended' && tab === 'adoption') {
      const ranked = rankAdoptions({ listings: list, helpers: helperMap, now: new Date(now || Date.parse('2026-10-06T00:00:00Z')), history }).items;
      ranked.forEach((r, i) => rankMap.set(r.id, i + 1));
      const order = new Map(ranked.map((r, i) => [r.id, i]));
      list = [...list].sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999));
    } else {
      list = [...list].sort((a, b) => (sort === 'oldest' ? a.eventAt.localeCompare(b.eventAt) : b.eventAt.localeCompare(a.eventAt)) || a.id.localeCompare(b.id));
    }
    return { items: list, ranks: rankMap };
  }, [all, tab, species, district, status, q, sort, history, now]);

  const from = params.toString();
  const filtersActive = !!(q || species || district || status !== 'open');

  return (
    <div className="cp-container cp-page">
      <header className={s.head}>
        <div>
          <h1>{m.listings.title}</h1>
          <p className={s.intro}>{m.listings.intro}</p>
        </div>
        <div className={s.headActions}>
          <ButtonLink href="/listings/new?mode=found" variant="primary" icon="plus">{m.listings.postFound}</ButtonLink>
          <ButtonLink href="/listings/new?mode=lost" icon="plus">{m.listings.postLost}</ButtonLink>
        </div>
      </header>

      <div role="tablist" aria-label={m.listings.tabsLabel} className={s.tabs}>
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            type="button"
            aria-selected={tab === t}
            className={s.tab}
            onClick={() => set({ tab: t, sort: null })}
          >
            {t === 'lost' ? m.listings.tabLost : t === 'found' ? m.listings.tabFound : m.listings.tabAdoption}
          </button>
        ))}
      </div>

      <section className={s.filters} aria-label={m.listings.filtersTitle}>
        <Field id={`${id}-q`} label={m.listings.search}>
          <TextInput id={`${id}-q`} type="search" value={q} placeholder={m.listings.searchPh} onChange={(e) => set({ q: e.target.value })} />
        </Field>
        <Field id={`${id}-sp`} label={m.listings.filterSpecies}>
          <Select id={`${id}-sp`} value={species} onChange={(e) => set({ species: e.target.value })}>
            <option value="">{m.listings.all}</option>
            <option value="cat">{m.species.cat}</option>
            <option value="dog">{m.species.dog}</option>
            <option value="other">{m.species.other}</option>
          </Select>
        </Field>
        <Field id={`${id}-d`} label={m.listings.filterDistrict}>
          <DistrictSelect id={`${id}-d`} value={district} onChange={(e) => set({ district: e.target.value })} placeholder={m.listings.all} />
        </Field>
        <Field id={`${id}-st`} label={m.listings.filterStatus}>
          <Select id={`${id}-st`} value={status} onChange={(e) => set({ status: e.target.value === 'open' ? null : e.target.value })}>
            <option value="open">{m.listings.statusOpen}</option>
            <option value="closed">{m.listings.statusClosed}</option>
            <option value="all">{m.listings.all}</option>
          </Select>
        </Field>
        <Field id={`${id}-so`} label={m.listings.filterSort}>
          <Select id={`${id}-so`} value={sort} onChange={(e) => set({ sort: e.target.value })}>
            {tab === 'adoption' ? <option value="recommended">{m.listings.sortRecommended}</option> : null}
            <option value="latest">{m.listings.sortLatest}</option>
            <option value="oldest">{m.listings.sortOldest}</option>
          </Select>
        </Field>
      </section>

      <div className={s.countRow}>
        <p className={s.count} aria-live="polite">{f(m.listings.resultCount, { n: num(items.length) })}</p>
        {filtersActive ? <Button small variant="ghost" icon="x" onClick={() => set({ q: null, species: null, district: null, status: null })}>{m.listings.clearFilters}</Button> : null}
      </div>

      {items.length ? (
        <MotionMax>
          <ul className={s.grid}>
            <AnimatePresence initial={false}>
              {items.map((l) => (
                <motionEl.li key={l.id} layout={items.length <= 30} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: T.exit }} transition={T.base}>
                  <ListingCard listing={l} from={from} rank={ranks.get(l.id) && (ranks.get(l.id) ?? 99) <= 3 ? ranks.get(l.id) : undefined} />
                </motionEl.li>
              ))}
            </AnimatePresence>
          </ul>
        </MotionMax>
      ) : (
        <div className={s.empty}>
          <Icon name="search" size={34} />
          <p>{m.listings.empty}</p>
          <div className={s.headActions}>
            <Button icon="x" onClick={() => set({ q: null, species: null, district: null, status: null })}>{m.listings.clearFilters}</Button>
            <ButtonLink href={`/listings/new?mode=${tab === 'lost' ? 'lost' : 'found'}`} variant="primary" icon="plus">{tab === 'lost' ? m.listings.postLost : m.listings.postFound}</ButtonLink>
          </div>
        </div>
      )}
    </div>
  );
}
