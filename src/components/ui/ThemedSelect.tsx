'use client';

import { Children, Fragment, isValidElement, useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode, type SelectHTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, m, useReducedMotion } from '@/lib/motion';
import { T } from '@/lib/motion-tokens';
import { Icon } from './Icon';
import field from './field.module.css';
import s from './select.module.css';

interface Choice { value: string; label: string; disabled: boolean; hidden: boolean; group?: string }
interface OptionProps { children?: ReactNode; value?: string | number; label?: string; disabled?: boolean; hidden?: boolean }
interface Position { left: number; top: number; width: number; maxHeight: number; above: boolean }

function textOf(node: ReactNode): string {
  return Children.toArray(node).map((child) => isValidElement<OptionProps>(child) ? textOf(child.props.children) : String(child)).join('');
}

function choicesOf(children: ReactNode, group?: string, groupDisabled = false): Choice[] {
  return Children.toArray(children).flatMap((child): Choice[] => {
    if (!isValidElement<OptionProps>(child)) return [];
    if (child.type === Fragment) return choicesOf(child.props.children, group, groupDisabled);
    if (child.type === 'optgroup') return choicesOf(child.props.children, child.props.label, !!child.props.disabled);
    if (child.type !== 'option') return [];
    const label = child.props.label ?? textOf(child.props.children);
    return [{ value: String(child.props.value ?? label), label, disabled: groupDisabled || !!child.props.disabled, hidden: !!child.props.hidden, group }];
  });
}

/** The visible combobox shares its value and change event with a native form control. */
export function ThemedSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const autoId = useId();
  const id = props.id ?? autoId;
  const listId = `${id}-choices`;
  const trigger = useRef<HTMLButtonElement>(null);
  const native = useRef<HTMLSelectElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const typeahead = useRef({ text: '', at: 0 });
  const all = useMemo(() => choicesOf(props.children), [props.children]);
  const choices = useMemo(() => all.filter((o) => !o.hidden), [all]);
  const [local, setLocal] = useState(String(props.defaultValue ?? all[0]?.value ?? ''));
  const value = String(props.value ?? local);
  const selected = all.find((o) => o.value === value);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState<Position | null>(null);
  const reduced = useReducedMotion();
  const portalHost = trigger.current?.closest('[role="dialog"]') ?? (typeof document !== 'undefined' ? document.body : null);

  const place = useCallback(() => {
    const button = trigger.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const viewport = window.visualViewport;
    const topEdge = (viewport?.offsetTop ?? 0) + 12;
    const leftEdge = (viewport?.offsetLeft ?? 0) + 12;
    const rightEdge = leftEdge + (viewport?.width ?? window.innerWidth) - 24;
    const bottomEdge = topEdge + (viewport?.height ?? window.innerHeight) - 24;
    const width = Math.min(rightEdge - leftEdge, Math.max(rect.width, Math.min(340, Math.max(...choices.map((o) => o.label.length * 9 + 56), 200))));
    const desiredHeight = Math.min(320, choices.length * 48 + 16);
    const below = bottomEdge - rect.bottom - 8;
    const above = rect.top - topEdge - 8;
    const flip = below < desiredHeight && above > below;
    const maxHeight = Math.max(48, Math.min(desiredHeight, flip ? above : below));
    setPosition({ left: Math.max(leftEdge, Math.min(rect.left, rightEdge - width)), top: flip ? Math.max(topEdge, rect.top - 8 - maxHeight) : rect.bottom + 8, width, maxHeight, above: flip });
  }, [choices]);

  useEffect(() => {
    if (!open) return;
    place();
    const closeOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!trigger.current?.contains(target) && !panel.current?.contains(target)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside, true);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    window.visualViewport?.addEventListener('resize', place);
    window.visualViewport?.addEventListener('scroll', place);
    return () => {
      document.removeEventListener('pointerdown', closeOutside, true);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
      window.visualViewport?.removeEventListener('resize', place);
      window.visualViewport?.removeEventListener('scroll', place);
    };
  }, [open, place]);

  useEffect(() => {
    if (open) panel.current?.querySelector<HTMLElement>(`[data-choice-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open, position?.maxHeight]);

  useEffect(() => { if (props.disabled) setOpen(false); }, [props.disabled]);

  const show = () => {
    if (props.disabled || !choices.some((o) => !o.disabled)) return;
    setActive(Math.max(0, choices.findIndex((o) => o.value === value && !o.disabled)));
    place();
    setOpen(true);
  };

  const choose = (index: number) => {
    const option = choices[index];
    if (!option || option.disabled || !native.current) return;
    native.current.value = option.value;
    native.current.dispatchEvent(new Event('change', { bubbles: true }));
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  };

  const move = (direction: number) => {
    for (let step = 1; step <= choices.length; step++) {
      const index = (active + direction * step + choices.length) % choices.length;
      if (!choices[index].disabled) { setActive(index); return; }
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape' && open) {
      event.preventDefault(); event.stopPropagation(); setOpen(false); return;
    }
    if (event.key === 'Tab') { setOpen(false); return; }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open) choose(active); else show();
      return;
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      if (!open) { show(); return; }
      if (event.key === 'Home') setActive(choices.findIndex((o) => !o.disabled));
      else if (event.key === 'End') setActive(choices.map((o) => !o.disabled).lastIndexOf(true));
      else move(event.key === 'ArrowDown' ? 1 : -1);
      return;
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      const now = Date.now();
      const prev = now - typeahead.current.at < 700 ? typeahead.current.text : '';
      const needle = (prev + event.key).toLocaleLowerCase();
      typeahead.current = { text: needle, at: now };
      const start = open ? active + 1 : Math.max(0, choices.findIndex((o) => o.value === value));
      const ordered = [...choices.slice(start), ...choices.slice(0, start)];
      const match = ordered.find((o) => !o.disabled && o.label.toLocaleLowerCase().startsWith(needle))
        ?? ordered.find((o) => !o.disabled && o.label.toLocaleLowerCase().startsWith(event.key.toLocaleLowerCase()));
      if (match) { place(); setActive(choices.indexOf(match)); setOpen(true); }
    }
  };

  const accessible = Object.fromEntries(Object.entries(props).filter(([key]) => key.startsWith('aria-') || key.startsWith('data-')));
  const nativeProps = Object.fromEntries(Object.entries(props).filter(([key]) => !key.startsWith('data-') && key !== 'autoFocus' && key !== 'style'));
  return (
    <div className={s.wrap}>
      <select
        {...nativeProps}
        id={`${id}-native`}
        ref={native}
        className={s.native}
        tabIndex={-1}
        aria-hidden="true"
        onFocus={() => trigger.current?.focus()}
        onChange={(event) => { setLocal(event.target.value); props.onChange?.(event); }}
      />
      <button
        {...accessible}
        ref={trigger}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        aria-required={props.required || undefined}
        disabled={props.disabled}
        autoFocus={props.autoFocus}
        tabIndex={props.tabIndex}
        className={[field.input, s.trigger, props.className].filter(Boolean).join(' ')}
        style={props.style}
        title={props.title ?? selected?.label}
        onClick={() => open ? setOpen(false) : show()}
        onKeyDown={onKeyDown}
        onBlur={() => setOpen(false)}
      >
        <span className={s.value}>{selected?.label ?? choices[0]?.label}</span>
        <Icon name="chevronDown" className={s.chevron} />
      </button>
      {portalHost ? createPortal(
        <AnimatePresence>
          {open && position ? (
            <m.div
              ref={panel}
              id={listId}
              role="listbox"
              aria-labelledby={props['aria-label'] ? undefined : `${id}-label`}
              aria-label={props['aria-label']}
              className={s.panel}
              style={{ left: position.left, top: position.top, width: position.width, maxHeight: position.maxHeight, transformOrigin: position.above ? 'bottom left' : 'top left' }}
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: position.above ? 4 : -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={reduced ? { duration: 0 } : T.quick}
            >
              {choices.map((option, index) => (
                <Fragment key={option.value}>
                  {option.group && option.group !== choices[index - 1]?.group ? <p className={s.group}>{option.group}</p> : null}
                  <div
                    id={`${listId}-${index}`}
                    role="option"
                    aria-selected={value === option.value}
                    aria-disabled={option.disabled || undefined}
                    data-choice-index={index}
                    data-active={active === index || undefined}
                    className={s.option}
                    onPointerDown={(event) => event.preventDefault()}
                    onPointerMove={(event) => event.pointerType === 'mouse' && !option.disabled && setActive(index)}
                    onClick={() => choose(index)}
                  >
                    <span>{option.label}</span>
                    {value === option.value ? <Icon name="check" size={18} /> : null}
                  </div>
                </Fragment>
              ))}
            </m.div>
          ) : null}
        </AnimatePresence>, portalHost,
      ) : null}
    </div>
  );
}
