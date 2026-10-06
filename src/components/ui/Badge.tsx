import type { ReactNode } from 'react';
import s from './ui.module.css';
import { Icon, type IconName } from './Icon';

export type BadgeTone = 'neutral' | 'info' | 'reunited' | 'adopted' | 'open' | 'tight' | 'full' | 'gold' | 'butter' | 'error';

export function Badge({ tone = 'neutral', icon, children, className, title }: { tone?: BadgeTone; icon?: IconName; children: ReactNode; className?: string; title?: string }) {
  const cls = [s.badge, tone !== 'neutral' && s[`b-${tone}`], className].filter(Boolean).join(' ');
  return (
    <span className={cls} title={title}>
      {icon ? <Icon name={icon} size="1em" /> : null}
      {children}
    </span>
  );
}

export function Card({ children, className, flat, as: Tag = 'div', ...rest }: { children: ReactNode; className?: string; flat?: boolean; as?: 'div' | 'section' | 'article' | 'li' } & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={[s.card, flat && s.cardFlat, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </Tag>
  );
}

export function Notice({ tone = 'info', icon = 'info', children, className, role }: { tone?: 'info' | 'warn' | 'error' | 'success' | 'butter'; icon?: IconName; children: ReactNode; className?: string; role?: string }) {
  return (
    <div className={[s.notice, tone !== 'info' && s[`n-${tone}`], className].filter(Boolean).join(' ')} role={role}>
      <Icon name={icon} />
      <div>{children}</div>
    </div>
  );
}

export function Skeleton({ height = 16, width = '100%', className, radius }: { height?: number | string; width?: number | string; className?: string; radius?: number }) {
  return <div aria-hidden="true" className={[s.skeleton, className].filter(Boolean).join(' ')} style={{ height, width, borderRadius: radius }} />;
}

export function Eyebrow({ children, icon }: { children: ReactNode; icon?: IconName }) {
  return (
    <span className={s.eyebrow}>
      {icon ? <Icon name={icon} size="1em" /> : null}
      {children}
    </span>
  );
}
