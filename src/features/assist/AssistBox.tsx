'use client';

import { useEffect, useId, useState } from 'react';
import type { AssistIntakeResult, AssistSignal, HelpType, Species, Urgency } from '@/lib/types';
import { useI18n } from '@/i18n/provider';
import { updateValue } from '@/lib/store';
import { isEmptyIntake } from '@/lib/assist-rules';
import { TOUR_RESET_EVENT } from '@/lib/tour/runtime';
import { AnimatePresence, m as motionEl } from '@/lib/motion';
import { SPRING, T } from '@/lib/motion-tokens';
import { Button } from '@/components/ui/Button';
import { Badge, Notice } from '@/components/ui/Badge';
import { Field, TextArea } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { DistrictSelect } from '@/features/shared/DistrictSelect';
import { requestIntake } from './assist-client';
import s from './assist.module.css';

const PROVIDER_LABEL: Record<string, string> = { gemini: 'Gemini', groq: 'Groq', openrouter: 'OpenRouter' };

/** กล่อง “เล่าให้ AI ช่วยสรุป” (PROMPT.md 7.11) — ใช้ใน /nearby, /dashboard และผลสแกนกรณีไม่พบ */
export function AssistBox({ onApply, compact = false, tourTarget }: { onApply: (r: AssistIntakeResult) => void; compact?: boolean; tourTarget?: string }) {
  const { m, f, locale } = useI18n();
  const id = useId();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AssistIntakeResult | null>(null);

  // ทัวร์ไปขั้นถัดไป/ออก → ล้างข้อความที่พิมพ์และผลสรุป
  useEffect(() => {
    const reset = () => {
      setText('');
      setResult(null);
    };
    window.addEventListener(TOUR_RESET_EVENT, reset);
    return () => window.removeEventListener(TOUR_RESET_EVENT, reset);
  }, []);

  const submit = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setResult(null);
    const r = await requestIntake(text.trim(), locale);
    setResult(r);
    setLoading(false);
  };

  const patch = (p: Partial<AssistIntakeResult>) => setResult((prev) => (prev ? { ...prev, ...p } : prev));
  const toggleSignal = (sig: AssistSignal) => patch({ signals: result?.signals.includes(sig) ? result.signals.filter((x) => x !== sig) : [...(result?.signals ?? []), sig] });

  const apply = () => {
    if (!result) return;
    updateValue('searchHistory', (prev) => [
      { at: new Date().toISOString(), helpType: result.helpType === 'unknown' ? 'intake' : result.helpType, species: result.species === 'unknown' ? 'cat' : result.species, urgency: result.urgency === 'unknown' ? 'normal' : result.urgency, districtId: result.districtId ?? undefined },
      ...prev,
    ].slice(0, 50));
    onApply(result);
  };

  const empty = result ? isEmptyIntake(result) : false;
  const showVet = result && (result.needsVet || result.urgency === 'emergency');
  const over = text.length > 300;

  return (
    <section className={[s.box, compact && s.compact].filter(Boolean).join(' ')} aria-labelledby={`${id}-t`} data-tour={tourTarget}>
      <h3 id={`${id}-t`} className={s.title}><Icon name="sparkle" /> {m.assist.title}</h3>
      {!compact ? <p className={s.intro}>{m.assist.intro}</p> : null}
      <form onSubmit={(e) => { e.preventDefault(); void submit(); }}>
        <Field id={`${id}-text`} label={m.assist.label} hint={m.assist.warning} counter={`${text.length}/300`} error={over ? m.assist.label : null}>
          <TextArea
            id={`${id}-text`}
            value={text}
            maxLength={300}
            rows={compact ? 2 : 3}
            placeholder={m.assist.placeholder}
            onChange={(e) => setText(e.target.value)}
            aria-describedby={`${id}-text-hint`}
            data-tour-safe="true"
            data-assist-input="true"
          />
        </Field>
        <div className={s.actions}>
          <Button type="submit" variant="primary" icon="sparkle" disabled={!text.trim() || loading || over} data-tour-safe="true" data-assist-submit="true">
            {loading ? m.assist.loading : m.assist.submit}
          </Button>
          {result || text ? <Button variant="ghost" small onClick={() => { setText(''); setResult(null); }}>{m.assist.clear}</Button> : null}
        </div>
      </form>
      <div aria-live="polite">
        {loading ? <p className={s.loading}><span className={s.spinner} aria-hidden="true" /> {m.assist.loading}</p> : null}
        <AnimatePresence>
          {result ? (
            <motionEl.div key="result" className={s.result} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: T.exit }} transition={SPRING.soft}>
              <p className={s.source}>
                <Badge tone={result.source === 'ai' ? 'gold' : 'info'} icon={result.source === 'ai' ? 'sparkle' : 'list'}>
                  {result.source === 'ai' ? f(m.assist.sourceAi, { provider: PROVIDER_LABEL[result.provider ?? ''] ?? 'AI' }) : m.assist.sourceRules}
                </Badge>
              </p>
              {empty ? (
                <Notice tone="warn" icon="info">{m.assist.empty}</Notice>
              ) : (
                <>
                  {result.summary ? <p className={s.summary}>{f(m.assist.summary, { text: result.summary })}</p> : null}
                  <p className={s.chipsTitle}>{m.assist.chipsTitle}</p>
                  <div className={s.grid}>
                    <ChipRow label={m.assist.fHelpType} value={result.helpType} options={(['intake', 'donate', 'adopt'] as HelpType[]).map((v) => ({ v, l: m.helpType[v] }))} onChange={(v) => patch({ helpType: v as HelpType })} />
                    <ChipRow label={m.assist.fSpecies} value={result.species} options={(['cat', 'dog', 'other'] as Species[]).map((v) => ({ v, l: m.species[v] }))} onChange={(v) => patch({ species: v as Species })} />
                    <ChipRow label={m.assist.fAge} value={result.ageGroup} options={(['young', 'adult'] as const).map((v) => ({ v, l: m.assist.age[v] }))} onChange={(v) => patch({ ageGroup: v as 'young' | 'adult' })} />
                    <ChipRow label={m.assist.fUrgency} value={result.urgency} options={(['normal', 'soon', 'emergency'] as Urgency[]).map((v) => ({ v, l: m.urgency[v] }))} onChange={(v) => patch({ urgency: v as Urgency })} />
                    <div className={s.row}>
                      <span className={s.rowLabel}>{m.assist.fSignals}</span>
                      <div className={s.chips}>
                        {(['injured', 'sick', 'trapped', 'hungry', 'young_alone', 'aggressive'] as AssistSignal[]).map((sig) => (
                          <button key={sig} type="button" className={s.chip} aria-pressed={result.signals.includes(sig)} onClick={() => toggleSignal(sig)}>
                            {result.signals.includes(sig) ? <Icon name="check" size="1em" /> : null}{m.assist.signal[sig]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className={s.row}>
                      <label className={s.rowLabel} htmlFor={`${id}-district`}>{m.assist.fDistrict}</label>
                      <DistrictSelect id={`${id}-district`} value={result.districtId ?? ''} onChange={(e) => patch({ districtId: e.target.value || null })} placeholder={m.assist.noDistrict} />
                    </div>
                  </div>
                  {showVet ? <Notice tone="error" icon="emergency" role="note">{m.assist.vet}</Notice> : null}
                  <Button variant="primary" icon="search" onClick={apply} className={s.apply}>{m.assist.apply}</Button>
                </>
              )}
            </motionEl.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}

function ChipRow({ label, value, options, onChange }: { label: string; value: string; options: { v: string; l: string }[]; onChange: (v: string) => void }) {
  return (
    <div className={s.row} role="group" aria-label={label}>
      <span className={s.rowLabel}>{label}</span>
      <div className={s.chips}>
        {options.map((o) => (
          <button key={o.v} type="button" className={s.chip} aria-pressed={value === o.v} onClick={() => onChange(o.v)}>
            {value === o.v ? <Icon name="check" size="1em" /> : null}{o.l}
          </button>
        ))}
      </div>
    </div>
  );
}
