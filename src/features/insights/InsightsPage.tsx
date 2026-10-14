'use client';

import { useId, useState } from 'react';
import { useI18n } from '@/i18n/provider';
import { HELPER_WEIGHTS } from '@/lib/balancer-config';
import { runSimulation, SIM_DEFAULT, SIM_LAMBDAS, SIM_SCENARIOS, type SimScenario, type SimulationResult } from '@/lib/simulation';
import { m as motionEl, useReducedMotion } from '@/lib/motion';
import { DURATION_MS, DUR, EASE, staggerDelay } from '@/lib/motion-tokens';
import { Badge, Card } from '@/components/ui/Badge';
import { Button, LinkButton } from '@/components/ui/Button';
import { CountUp } from '@/components/ui/CountUp';
import { Segmented } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { factorLabel } from '@/features/balancer/reason-text';
import s from './insights.module.css';

type Weights = keyof typeof HELPER_WEIGHTS;
const FACTORS = Object.keys(HELPER_WEIGHTS) as Weights[];

/** จำลองสถานการณ์ 30 วัน (PROMPT.md 7.16, 11.7) — ข้อมูลสมมติเท่านั้น */
export function InsightsPage() {
  const { m, f } = useI18n();
  const id = useId();
  const [scenario, setScenario] = useState<SimScenario>(SIM_DEFAULT.scenario);
  const [lambda, setLambda] = useState<number>(SIM_DEFAULT.lambda);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [running, setRunning] = useState(false);
  const [runKey, setRunKey] = useState(0);

  const run = () => {
    setRunning(true);
    // หน่วงสั้น ๆ ให้เห็นสถานะ “กำลังจำลอง…” (คำนวณจริงใช้เวลาไม่ถึง 100ms)
    window.setTimeout(() => {
      setResult(runSimulation(scenario, lambda));
      setRunKey((k) => k + 1);
      setRunning(false);
    }, DURATION_MS.slow);
  };

  return (
    <div className={`cp-container cp-page ${s.page}`}>
      <header className={s.head}>
        <h1>{m.insights.title}</h1>
        <Badge tone="gold" icon="info">{m.insights.badge}</Badge>
        <p>{m.insights.p1}</p>
        <p>{m.insights.p2}</p>
        <p>{m.insights.p3}</p>
      </header>

      <Card as="section" aria-labelledby={`${id}-fx`} className={s.formula}>
        <h2 id={`${id}-fx`} className={s.h2}>{m.insights.formulaTitle}</h2>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr><th scope="col">{m.insights.factor}</th><th scope="col">{m.insights.weight}</th><th scope="col">{m.insights.meaning}</th></tr>
            </thead>
            <tbody>
              {FACTORS.map((k) => (
                <tr key={k}>
                  <th scope="row">{factorLabel(k, m)}</th>
                  <td>{f(m.insights.pct, { n: Math.round(HELPER_WEIGHTS[k] * 100) })}</td>
                  <td>{m.insights.meanings[k]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card as="section" aria-labelledby={`${id}-ct`} className={s.controls} data-tour="insights-controls">
        <h2 id={`${id}-ct`} className={s.h2}>{m.insights.controls}</h2>
        <p className={s.muted}>{m.insights.places}</p>
        <div className={s.ctrlRow}>
          <span className={s.ctrlLabel}>{m.insights.scenario}</span>
          <Segmented<SimScenario>
            name={`${id}-sc`}
            label={m.insights.scenario}
            value={scenario}
            onChange={setScenario}
            options={SIM_SCENARIOS.map((x) => ({ value: x, label: m.insights.scenarios[x] }))}
          />
        </div>
        <div className={s.ctrlRow}>
          <span className={s.ctrlLabel}>{m.insights.lambda}</span>
          <Segmented<string>
            name={`${id}-la`}
            label={m.insights.lambda}
            value={String(lambda)}
            onChange={(v) => setLambda(Number(v))}
            options={SIM_LAMBDAS.map((n) => ({ value: String(n), label: f(m.insights.lambdaOpt, { n }) }))}
          />
        </div>
        <div>
          <Button variant="primary" icon="bolt" onClick={run} disabled={running} data-film="sim-run">
            {running ? m.insights.running : m.insights.run}
          </Button>
        </div>
      </Card>

      <section aria-labelledby={`${id}-rs`} className={s.results} data-tour="insights-chart" aria-live="polite" aria-busy={running}>
        <h2 id={`${id}-rs`} className="visually-hidden">{m.insights.title}</h2>
        {result ? (
          <Results key={runKey} r={result} />
        ) : (
          <p className={s.empty}><Icon name="info" size="1em" /> {m.insights.beforeRun}</p>
        )}
      </section>
    </div>
  );
}

function Results({ r }: { r: SimulationResult }) {
  const { m, f, num } = useI18n();
  const pct = (v: number) => f(m.insights.pct, { n: Math.round(v * 100) });
  const km = (v: number) => f(m.insights.kpiDistanceValue, { km: v.toFixed(1) });
  const repeatA = r.a.days.map((d) => d.calls - d.placed);
  const repeatB = r.b.days.map((d) => d.calls - d.placed);

  return (
    <div className={s.resultsInner}>
      <p className={s.resultFor}>
        <Badge tone="gold" icon="info">{m.insights.badge}</Badge>{' '}
        {f(m.insights.resultFor, { scenario: m.insights.scenarios[r.scenario], lambda: f(m.insights.lambdaOpt, { n: r.lambda }) })}
      </p>
      <ul className={s.kpis} data-film="sim-kpis" data-sim={r.reductionPct}>
        <li className={s.kpiHero}>
          <span className={s.kpiLabel}>{m.insights.kpiReduction}</span>
          <span className={s.kpiBig}><CountUp value={r.reductionPct} format={(n) => f(m.insights.kpiReductionValue, { pct: n })} /></span>
          <span className={s.kpiSub}>{f(m.insights.kpiCompare, { a: f(m.insights.calls, { n: num(r.a.totals.calls) }), b: f(m.insights.calls, { n: num(r.b.totals.calls) }) })}</span>
        </li>
        <li>
          <span className={s.kpiLabel}>{m.insights.kpiUnplaced}</span>
          <span className={s.kpiVal}>{f(m.insights.kpiCompare, { a: f(m.insights.kpiUnplacedValue, { n: num(r.a.totals.unplaced) }), b: f(m.insights.kpiUnplacedValue, { n: num(r.b.totals.unplaced) }) })}</span>
        </li>
        <li>
          <span className={s.kpiLabel}>{m.insights.kpiDistance}</span>
          <span className={s.kpiVal}>{f(m.insights.kpiCompare, { a: km(r.a.totals.avgDistanceKm), b: km(r.b.totals.avgDistanceKm) })}</span>
        </li>
        <li>
          <span className={s.kpiLabel}>{m.insights.chartSpread}</span>
          <span className={s.kpiVal}>{f(m.insights.kpiCompare, { a: pct(r.a.totals.avgSpread), b: pct(r.b.totals.avgSpread) })}</span>
        </li>
      </ul>
      <p className={s.legend}>
        <span className={s.keyA} aria-hidden="true" /> {m.insights.policyA}
        <span className={s.keyB} aria-hidden="true" /> {m.insights.policyB}
      </p>
      <p className="visually-hidden">{f(m.insights.chartSummary, { a: m.insights.policyA, b: m.insights.policyB })}</p>

      <ChartCard title={m.insights.chartSpread} note={m.insights.chartSpreadNote} table={(
        <SeriesTable a={r.a.days.map((d) => d.spread)} b={r.b.days.map((d) => d.spread)} fmt={pct} />
      )}>
        <LineChart a={r.a.days.map((d) => d.spread)} b={r.b.days.map((d) => d.spread)} max={1} fmtY={pct} />
      </ChartCard>

      <ChartCard title={m.insights.chartCalls} table={<SeriesTable a={repeatA} b={repeatB} fmt={(n) => num(n)} />}>
        <BarChart a={repeatA} b={repeatB} />
      </ChartCard>

      <ChartCard title={m.insights.chartFinal} note={m.insights.finalNote} table={(
        <table className={s.table}>
          <thead><tr><th scope="col">{m.insights.placeCol}</th><th scope="col">{m.insights.policyA}</th><th scope="col">{m.insights.policyB}</th></tr></thead>
          <tbody>
            {r.a.finalRatios.map((x, i) => (
              <tr key={x.id}><th scope="row">{f(m.insights.place, { label: x.label })}</th><td>{pct(x.ratio)}</td><td>{pct(r.b.finalRatios[i].ratio)}</td></tr>
            ))}
          </tbody>
        </table>
      )}>
        <FinalBars a={r.a.finalRatios} b={r.b.finalRatios} />
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, note, children, table }: { title: string; note?: string; children: React.ReactNode; table: React.ReactNode }) {
  const { m } = useI18n();
  const [showTable, setShowTable] = useState(false);
  const id = useId();
  return (
    <Card as="section" aria-labelledby={`${id}-t`} className={s.chart}>
      <h3 id={`${id}-t`} className={s.h3}>{title}</h3>
      {note ? <p className={s.muted}>{note}</p> : null}
      <figure className={s.figure} aria-hidden={showTable ? undefined : 'true'}>{children}</figure>
      <LinkButton aria-expanded={showTable} aria-controls={`${id}-tbl`} onClick={() => setShowTable((v) => !v)} data-tour-safe="true">
        <Icon name="doc" size="1em" /> {showTable ? m.insights.hideTable : m.insights.showTable}
      </LinkButton>
      {showTable ? <div id={`${id}-tbl`} className={s.tableWrap}>{table}</div> : null}
    </Card>
  );
}

const W = 760;
const H = 240;
const PAD = { l: 48, r: 16, t: 12, b: 28 };

function useDraw() {
  const reduced = useReducedMotion();
  return (i: number) => (reduced
    ? { initial: false as const }
    : { initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: { duration: DUR.hero * 2, ease: EASE.out, delay: staggerDelay(i) } });
}

function axes(max: number, fmtY: (n: number) => string, days: number, dayLabel: string) {
  const ticks = [0, 0.5, 1].map((k) => k * max);
  const x = (i: number) => PAD.l + (i / Math.max(1, days - 1)) * (W - PAD.l - PAD.r);
  const y = (v: number) => H - PAD.b - (v / max) * (H - PAD.t - PAD.b);
  return {
    x, y,
    el: (
      <g className={s.axes}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} />
            <text x={PAD.l - 6} y={y(t) + 4} textAnchor="end">{fmtY(t)}</text>
          </g>
        ))}
        {[1, 10, 20, days].map((d) => <text key={d} x={x(d - 1)} y={H - 8} textAnchor={d === 1 ? 'start' : 'middle'}>{d === 1 ? `${dayLabel} ${d}` : d}</text>)}
      </g>
    ),
  };
}

function LineChart({ a, b, max, fmtY }: { a: number[]; b: number[]; max: number; fmtY: (n: number) => string }) {
  const { m } = useI18n();
  const draw = useDraw();
  const ax = axes(max, fmtY, a.length, m.insights.dayAxis);
  const path = (v: number[]) => v.map((p, i) => `${i ? 'L' : 'M'}${ax.x(i).toFixed(1)},${ax.y(Math.min(p, max)).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={s.svg} role="img">
      {ax.el}
      <motionEl.path d={path(a)} className={s.lineA} {...draw(0)} />
      <motionEl.path d={path(b)} className={s.lineB} {...draw(1)} />
    </svg>
  );
}

function BarChart({ a, b }: { a: number[]; b: number[] }) {
  const { m, num } = useI18n();
  const reduced = useReducedMotion();
  const max = Math.max(1, ...a, ...b);
  const nice = Math.ceil(max / 10) * 10;
  const ax = axes(nice, (n) => num(Math.round(n)), a.length, m.insights.dayAxis);
  const slot = (W - PAD.l - PAD.r) / a.length;
  const bw = Math.max(2, slot / 2 - 1);
  const base = H - PAD.b;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={s.svg} role="img">
      {ax.el}
      {a.map((v, i) => {
        const x0 = PAD.l + i * slot;
        const ha = base - ax.y(v);
        const hb = base - ax.y(b[i]);
        const grow = reduced ? { initial: false as const } : { initial: { scaleY: 0 }, animate: { scaleY: 1 }, transition: { duration: DUR.slow, ease: EASE.out, delay: i * (DUR.instant / 6) } };
        return (
          <g key={i}>
            <motionEl.rect x={x0} y={base - ha} width={bw} height={ha} className={s.barA} style={{ transformOrigin: `${x0}px ${base}px`, transformBox: 'view-box' }} {...grow} />
            <motionEl.rect x={x0 + bw + 1} y={base - hb} width={bw} height={hb} className={s.barB} style={{ transformOrigin: `${x0}px ${base}px`, transformBox: 'view-box' }} {...grow} />
          </g>
        );
      })}
    </svg>
  );
}

function FinalBars({ a, b }: { a: SimulationResult['a']['finalRatios']; b: SimulationResult['b']['finalRatios'] }) {
  const { m } = useI18n();
  const reduced = useReducedMotion();
  const col = (list: typeof a, cls: string, title: string) => (
    <div className={s.finalCol}>
      <p className={s.finalTitle}>{title}</p>
      <ul className={s.finalList}>
        {list.map((x, i) => (
          <li key={x.id}>
            <span className={s.finalLabel}>{x.label}</span>
            <span className={s.finalTrack}>
              <motionEl.span
                className={`${s.finalFill} ${cls}`}
                style={{ width: `${Math.round(Math.min(1, x.ratio) * 100)}%` }}
                initial={reduced ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: DUR.slow, ease: EASE.out, delay: staggerDelay(i) }}
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <div className={s.finalGrid}>
      {col(a, s.fillA, m.insights.policyA)}
      {col(b, s.fillB, m.insights.policyB)}
    </div>
  );
}

function SeriesTable({ a, b, fmt }: { a: number[]; b: number[]; fmt: (n: number) => string }) {
  const { m } = useI18n();
  return (
    <table className={s.table}>
      <thead><tr><th scope="col">{m.insights.tableDay}</th><th scope="col">{m.insights.policyA}</th><th scope="col">{m.insights.policyB}</th></tr></thead>
      <tbody>
        {a.map((v, i) => <tr key={i}><th scope="row">{i + 1}</th><td>{fmt(v)}</td><td>{fmt(b[i])}</td></tr>)}
      </tbody>
    </table>
  );
}
