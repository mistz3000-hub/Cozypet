'use client';

import { useState } from 'react';
import type { ExclusionKey, Recommendation } from '@/lib/types';
import { useI18n } from '@/i18n/provider';
import { Meter } from '@/components/ui/Meter';
import { CountUp } from '@/components/ui/CountUp';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { factorLabel, factorRawText, reasonText } from './reason-text';
import s from './balancer.module.css';

/** แผง “เบื้องหลัง” — น้ำหนัก ค่าจริงจาก record ส่วนที่คิดเป็นคะแนน (ตัวเลขเป็นข้อความเสมอ) PROMPT.md 7.11 */
export function WhyPanel({ rec, excluded, kind = 'helper', name }: { rec: Recommendation; excluded?: Record<ExclusionKey, number>; kind?: 'helper' | 'donation' | 'adoption'; name?: string }) {
  const { m, f, num, locale } = useI18n();
  const [table, setTable] = useState(false);
  const rawLabel = (key: string, raw: string) => factorRawText(key, raw, m, f, locale);
  const exTotal = excluded ? Object.values(excluded).reduce((a, b) => a + b, 0) : 0;
  const exParts = excluded ? (Object.entries(excluded) as [ExclusionKey, number][]).filter(([, n]) => n > 0).map(([k, n]) => f(m.why.ex[k], { n })).join(' · ') : '';
  return (
    <div className={s.why}>
      {name ? <p className={s.whyName}>{name}</p> : null}
      {rec.reasons.length ? (
        <ul className={s.reasonChips} aria-label={m.popup.whyLine}>
          {rec.reasons.map((r, i) => <li key={i}><Icon name="check" size="1em" /> {reasonText(r, m, f)}</li>)}
        </ul>
      ) : null}
      <div className={s.whyHead}>
        <h3>{m.why.factorsTitle}</h3>
        <Button small variant="ghost" icon={table ? 'chart' : 'list'} onClick={() => setTable((v) => !v)}>{table ? m.why.asBars : m.why.asTable}</Button>
      </div>
      {table ? (
        <table className={s.table}>
          <thead><tr><th scope="col">{m.why.thFactor}</th><th scope="col">{m.why.thWeight}</th><th scope="col">{m.why.thValue}</th><th scope="col">{m.why.thPoints}</th></tr></thead>
          <tbody>
            {rec.factors.map((fa) => (
              <tr key={fa.key}>
                <th scope="row">{factorLabel(fa.key, m)}</th>
                <td>{num(fa.weight * 100)}%</td>
                <td>{rawLabel(fa.key, fa.rawLabel)}</td>
                <td>{num(fa.weight * fa.value * 100, 1)} / {num(fa.weight * 100)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <ul className={s.factors}>
          {rec.factors.map((fa) => {
            const pts = fa.weight * fa.value * 100;
            const max = fa.weight * 100;
            return (
              <li key={fa.key}>
                <div className={s.factorTop}>
                  <span className={s.factorName}>{factorLabel(fa.key, m)}</span>
                  <span className={s.factorWeight}>{f(m.why.weight, { pct: num(max) })}</span>
                </div>
                <p className={s.factorRaw}>{rawLabel(fa.key, fa.rawLabel)}</p>
                <Meter value={Math.round(pts * 10) / 10} max={max} label={factorLabel(fa.key, m)} level="gold" valueText={f(m.why.contribution, { points: num(pts, 1), max: num(max) })} />
                <p className={s.factorPts}><CountUp value={Math.round(pts)} /> / {num(max)} · {f(m.why.contribution, { points: num(pts, 1), max: num(max) })}</p>
              </li>
            );
          })}
        </ul>
      )}
      <h3 className={s.whySub}>{m.why.sourcesTitle}</h3>
      <ul className={s.sources}>{(kind === 'donation' ? m.why.donationSources : m.why.sources).map((x) => <li key={x}>{x}</li>)}</ul>
      {excluded ? (
        <>
          <h3 className={s.whySub}>{m.why.excludedTitle}</h3>
          <p>{exTotal ? f(m.why.excluded, { total: exTotal, parts: exParts }) : m.why.excludedNone}</p>
        </>
      ) : null}
      <p className={s.whyNote}><Icon name="info" size="1em" /> {m.why.note}</p>
      <p className={s.whyNote}>{m.why.scoreNote}</p>
    </div>
  );
}
