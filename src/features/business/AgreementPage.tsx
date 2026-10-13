'use client';
import { useSearchParams } from 'next/navigation';
import { useI18n } from '@/i18n/provider';
import { useStore, useHydrated } from '@/lib/store';
import { getHelper } from '@/data';
import { helperName } from '@/features/helpers/helper-text';
import { useAllListings } from '@/features/shared/data-hooks';
import { Notice, Skeleton } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import s from './business.module.css';
import { useShelters } from '@/features/shelters/useShelters';
export function AgreementPage({ requestId }: { requestId?: string }) {
  const { m, locale, dateTime } = useI18n();
  const hydrated = useHydrated();
  const params = useSearchParams();
  const requests = useStore('careRequests');
  const listings = useAllListings();
  const request = requestId ? requests.find((r) => r.id === requestId) : undefined;
  const helperId=request?.helperId??params.get('helper');
  const shared=useShelters(false,!!helperId?.startsWith('community-'));
  const h = shared.helpers.find(h=>h.id===helperId)??getHelper(helperId);
  const listing = listings.find((l) => l.id === request?.listingId);
  if (!hydrated||(helperId?.startsWith('community-')&&shared.loading)) return <div className="cp-container cp-page"><Skeleton height={350} /></div>;
  if (requestId && !request) return <div className="cp-container cp-page"><Notice>{m.business.agreementMissing}</Notice></div>;
  if (h?.isRealOrganization || h?.isPlaceholder) return <div className="cp-container cp-page"><Notice>{m.business.agreementReal}</Notice>{h.officialUrl ? <a href={h.officialUrl} target="_blank" rel="noopener noreferrer">{m.helper.officialLink}</a> : null}</div>;
  return <div className="cp-container cp-page"><div className={`${s.actions} ${s.noPrint}`}><Button variant="primary" icon="doc" onClick={() => window.print()}>{m.business.agreementPrint}</Button><ButtonLink href={h?.publicPlaceId?`/shelters/${h.publicPlaceId}`:h ? `/helpers/${h.id}` : '/profile'} icon="arrowLeft">{m.common.back}</ButtonLink></div>
    <article className={s.agreement}><p className={s.agreementMark}>{m.business.agreementMark}</p><h1>{m.business.agreementTitle}</h1>
      {request ? <p>{m.requests.type[request.type]} · {dateTime(request.createdAt)}</p> : null}
      {h ? <p>{m.business.agreementCaregiver}: {helperName(h, locale)}</p> : null}
      <p>{m.business.agreementPeople}</p><p>{m.business.agreementPet}{listing ? ` ${listing.name ?? ''} · ${m.species[listing.species]} · ${listing.markings ?? ''}` : ''}</p><p>{m.business.agreementDate}</p><ol>{m.business.agreementRules.map((r) => <li key={r}>{r}</li>)}</ol><p>{m.business.agreementSign}</p><p className={s.muted}>{m.business.agreementPrivacy}</p>
    </article></div>;
}
