/** ป้ายข้อความของ prop อธิบายขั้นตอน (DOM วางตามตำแหน่ง 3 มิติของ prop) */
import { fill, type FilmContext } from './context';
import type { Shot } from './cuts';
import { RUN, explainAt, explainPhase, runHeights, zonePx } from './explain';
import { Counter } from './props/dom';
import { clamp, ease, prog } from './timeline';
import s from './film.module.css';

function Chip({ x, y, show, tone, children }: { x: number; y: number; show: number; tone?: 'gold' | 'green' | 'red' | 'grey'; children: React.ReactNode }) {
  const k = ease.backOut(clamp(show));
  return (
    <span className={s.xChip} data-tone={tone} style={{ left: x, top: y, opacity: clamp(show * 1.4), transform: `translate(-50%, -50%) scale(${(0.6 + 0.4 * k).toFixed(3)})` }}>
      {children}
    </span>
  );
}

export function ExplainDom({ shot, lt, ctx, desktop = false }: { shot: Shot; lt: number; ctx: FilmContext; desktop?: boolean }) {
  const e = explainAt(shot, lt);
  if (!e) return null;
  const { pin, pout, k } = explainPhase(e, lt);
  const vis = pin * (1 - pout);
  if (vis <= 0.01) return null;
  const x = ctx.fm.scenes.explain;
  const at = (dx: number, dy: number) => zonePx(dx, dy, desktop);
  const show = (a: number) => prog(k, a, a + 0.35) * (1 - pout);
  const out: React.ReactNode[] = [];
  switch (e.kind) {
    case 'micro':
      x.micro.chips.forEach((c, i) => {
        const p = at(-1.35 + i * 0.25, 0.6 - i * 0.5);
        out.push(<Chip key={c} x={p.x} y={p.y} show={show(0.45 + i * 0.5)} tone="gold">{c}</Chip>);
      });
      out.push(<Chip key="l" {...at(0, -1.12)} show={show(1.6)}>{x.micro.label}</Chip>);
      break;
    case 'scan': {
      const pos: [number, number][] = [[-1.45, 0.75], [1.45, 0.55], [-1.5, -0.6], [1.4, -0.75]];
      x.scan.chips.forEach((c, i) => {
        const p = at(...pos[i]);
        out.push(<Chip key={c} x={p.x} y={p.y} show={show(0.9 + i * 0.55)} tone="gold">{c}</Chip>);
      });
      out.push(<Chip key="l" {...at(0, 1.25)} show={show(0.5)}>{x.scan.label}</Chip>);
      break;
    }
    case 'compare':
      out.push(<Chip key="l" {...at(0.2, 1.05)} show={show(0.4)}>{x.compare.label}</Chip>);
      out.push(<Chip key="r" {...at(0.2, -1.0)} show={show(2.8)} tone="grey">{x.compare.result}</Chip>);
      break;
    case 'post':
      out.push(<Chip key="l" {...at(0, -1.12)} show={show(0.75)} tone="green">✓ {x.post.label}</Chip>);
      break;
    case 'assist':
      out.push(<Chip key="l" {...at(0.6, -1.1)} show={show(0.9)}>{x.assist.label}</Chip>);
      break;
    case 'nearby':
      out.push(<Chip key="f" {...at(-0.75, 1.05)} show={show(0.3)} tone="red">{x.nearby.full}</Chip>);
      out.push(<Chip key="b" {...at(0.95, 0.85)} show={show(1.2)} tone="green">{x.nearby.best}</Chip>);
      break;
    case 'chat':
      out.push(<Chip key="r" {...at(1.35, -0.2)} show={show(1.0)} tone="green">✓✓ {x.chat.label}</Chip>);
      break;
    case 'handoff':
      out.push(<Chip key="h" {...at(0, 1.25)} show={show(0.3)} tone="gold">♥ {x.handoff.label}</Chip>);
      break;
    case 'donate':
      x.donate.chips.forEach((c, i) => {
        const p = at(1.4, 0.9 - i * 0.6);
        out.push(<Chip key={c} x={p.x} y={p.y} show={show(1.6 + i * 0.35)} tone={i === 1 ? 'gold' : undefined}>{fill(c, { pct: ctx.facts.pct })}</Chip>);
      });
      break;
    case 'run': {
      const run = ctx.fm.scenes.run;
      const { before, after } = ctx.facts.calls;
      const { hb, ha } = runHeights(k, before, after);
      const lb = at(-RUN.x * 0.97, RUN.base + hb + 0.32);
      const la = at(RUN.x * 0.97, RUN.base + ha + 0.32);
      const dropped = k >= RUN.drop[0];
      out.push(
        <span key="nb" className={s.xRunNum} style={{ left: lb.x, top: lb.y, opacity: show(0.15) }}>
          <Counter t={k} at={0.15} dur={0.8} value={before} locale={ctx.locale} />
        </span>,
      );
      out.push(
        <span key="na" className={s.xRunNum} data-tone="gold" style={{ left: la.x, top: la.y, opacity: show(0.45) }}>
          {dropped ? <Counter t={k} at={RUN.drop[0]} dur={0.8} from={before} value={after} locale={ctx.locale} /> : <Counter t={k} at={0.45} dur={0.7} value={before} locale={ctx.locale} />}
        </span>,
      );
      out.push(<Chip key="lb" {...at(-RUN.x, RUN.base - 0.32)} show={show(0.3)} tone="grey">{run.before}</Chip>);
      out.push(<Chip key="la" {...at(RUN.x + 0.15, RUN.base - 0.32)} show={show(0.6)} tone="gold">{run.after}</Chip>);
      out.push(<Chip key="pct" {...at(RUN.x + 0.1, RUN.base + 1.5)} show={show(RUN.drop[1] - 0.1)} tone="green">−{ctx.facts.sim}%</Chip>);
      out.push(<Chip key="u" {...at(0, RUN.base + RUN.max + 0.85)} show={show(0.2)}>{run.unit}</Chip>);
      break;
    }
    case 'globe':
      x.globe.chips.forEach((c, i) => {
        const p = at(i ? 1.1 : -1.1, 0.4 - i * 0.6);
        out.push(<Chip key={c} x={p.x} y={p.y} show={show(0.2 + i * 0.4)} tone="gold">{c}</Chip>);
      });
      break;
  }
  return <>{out}</>;
}
