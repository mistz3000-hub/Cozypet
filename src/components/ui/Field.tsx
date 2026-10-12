'use client';

import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { useI18n } from '@/i18n/provider';
import { Icon } from './Icon';
import { m as motionEl, useReducedMotion } from '@/lib/motion';
import { T } from '@/lib/motion-tokens';
import s from './field.module.css';

export function Field({ label, required, hint, error, children, id, counter }: {
  label: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  error?: string | null;
  id: string;
  children: ReactNode;
  counter?: ReactNode;
}) {
  const { m } = useI18n();
  return (
    <div className={s.field} data-invalid={error ? 'true' : undefined}>
      <label id={`${id}-label`} htmlFor={id} className={s.label}>
        {label}
        {required ? <span className={s.req}> * <span className={s.reqText}>{m.common.required}</span></span> : null}
      </label>
      {children}
      {hint ? <p id={`${id}-hint`} className={s.hint}>{hint}</p> : null}
      <div className={s.meta}>
        {error ? (
          <p id={`${id}-error`} className={s.error}>
            <Icon name="alert" size="1em" /> {error}
          </p>
        ) : <span />}
        {counter ? <span className={s.counter}>{counter}</span> : null}
      </div>
    </div>
  );
}

export function describedBy(id: string, hint?: unknown, error?: unknown) {
  return [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined;
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={[s.input, props.className].filter(Boolean).join(' ')} />;
}
export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={[s.input, s.textarea, props.className].filter(Boolean).join(' ')} />;
}
export { ThemedSelect as Select } from './ThemedSelect';

/** radio group แบบการ์ด/ชิป */
export function RadioGroup<T extends string>({ name, legend, value, onChange, options, layout = 'row', required, error, hint }: {
  name: string;
  legend: ReactNode;
  value: T | null;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode; description?: ReactNode; disabled?: boolean }[];
  layout?: 'row' | 'column';
  required?: boolean;
  error?: string | null;
  hint?: ReactNode;
}) {
  const { m } = useI18n();
  const id = useId();
  return (
    <fieldset className={s.fieldset} aria-describedby={describedBy(id, hint, error)} data-invalid={error ? 'true' : undefined}>
      <legend className={s.label}>
        {legend}
        {required ? <span className={s.req}> * <span className={s.reqText}>{m.common.required}</span></span> : null}
      </legend>
      {hint ? <p id={`${id}-hint`} className={s.hint}>{hint}</p> : null}
      <div className={layout === 'row' ? s.optRow : s.optCol}>
        {options.map((o) => (
          <label key={o.value} className={s.opt} data-checked={value === o.value ? 'true' : undefined} data-disabled={o.disabled ? 'true' : undefined}>
            <input type="radio" name={name} value={o.value} checked={value === o.value} disabled={o.disabled} onChange={() => onChange(o.value)} />
            <span className={s.optText}>
              <span className={s.optLabel}>{o.label}</span>
              {o.description ? <span className={s.optDesc}>{o.description}</span> : null}
            </span>
          </label>
        ))}
      </div>
      {error ? <p id={`${id}-error`} className={s.error}><Icon name="alert" size="1em" /> {error}</p> : null}
    </fieldset>
  );
}

/** กลุ่มชิปเลือกได้หลายค่า */
export function ChipGroup({ legend, values, onChange, options, required, error, hint }: {
  legend: ReactNode;
  values: string[];
  onChange: (v: string[]) => void;
  options: { value: string; label: ReactNode; swatch?: string }[];
  required?: boolean;
  error?: string | null;
  hint?: ReactNode;
}) {
  const { m } = useI18n();
  const id = useId();
  return (
    <fieldset className={s.fieldset} aria-describedby={describedBy(id, hint, error)} data-invalid={error ? 'true' : undefined}>
      <legend className={s.label}>
        {legend}
        {required ? <span className={s.req}> * <span className={s.reqText}>{m.common.required}</span></span> : null}
      </legend>
      {hint ? <p id={`${id}-hint`} className={s.hint}>{hint}</p> : null}
      <div className={s.chips}>
        {options.map((o) => {
          const on = values.includes(o.value);
          return (
            <label key={o.value} className={s.chip} data-checked={on ? 'true' : undefined}>
              <input type="checkbox" checked={on} onChange={() => onChange(on ? values.filter((v) => v !== o.value) : [...values, o.value])} />
              {o.swatch ? <span className={s.swatch} style={{ background: o.swatch }} aria-hidden="true" /> : null}
              {o.label}
              {on ? <Icon name="check" size="1em" /> : null}
            </label>
          );
        })}
      </div>
      {error ? <p id={`${id}-error`} className={s.error}><Icon name="alert" size="1em" /> {error}</p> : null}
    </fieldset>
  );
}

export function Checkbox({ checked, onChange, children, id, required, error }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode; id?: string; required?: boolean; error?: string | null }) {
  const auto = useId();
  const cid = id ?? auto;
  return (
    <div className={s.checkWrap} data-invalid={error ? 'true' : undefined}>
      <label className={s.check} htmlFor={cid}>
        <input id={cid} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-required={required} aria-invalid={!!error} aria-describedby={error ? `${cid}-error` : undefined} />
        <span>{children}</span>
      </label>
      {error ? <p id={`${cid}-error`} className={s.error}><Icon name="alert" size="1em" /> {error}</p> : null}
    </div>
  );
}

/** segmented control (radio group) */
export function Segmented<T extends string>({ label, value, onChange, options, name }: { label: string; value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode }[]; name: string }) {
  const reduced = useReducedMotion();
  const index = Math.max(0, options.findIndex((option) => option.value === value));
  return (
    <div role="radiogroup" aria-label={label} className={s.segmented} style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      <motionEl.span aria-hidden="true" className={s.segThumb} style={{ width: `calc((100% - 4px) / ${options.length})` }} initial={false} animate={{ x: `${index * 100}%` }} transition={reduced ? { duration: 0 } : T.switch} />
      {options.map((o) => (
        <label key={o.value} className={s.segItem} data-checked={value === o.value ? 'true' : undefined}>
          <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  );
}

export function ErrorSummary({ title, errors }: { title: string; errors: { id: string; message: string }[] }) {
  if (!errors.length) return null;
  return (
    <div className={s.summary} role="alert" tabIndex={-1} id="error-summary">
      <p className={s.summaryTitle}><Icon name="alert" /> {title}</p>
      <ul>
        {errors.map((e) => (
          <li key={e.id}>
            <a href={`#${e.id}`} onClick={(ev) => { ev.preventDefault(); document.getElementById(e.id)?.focus(); }}>{e.message}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
