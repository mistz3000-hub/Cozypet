import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import s from './ui.module.css';
import { Icon, type IconName } from './Icon';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft';

interface Common {
  variant?: Variant;
  small?: boolean;
  block?: boolean;
  icon?: IconName;
  iconRight?: IconName;
  iconOnly?: boolean;
  children?: ReactNode;
  className?: string;
}

export function btnClass({ variant = 'secondary', small, block, iconOnly, className }: Omit<Common, 'children'>) {
  return [s.btn, s[variant], small && s.small, block && s.block, iconOnly && s.iconOnly, className].filter(Boolean).join(' ');
}

export function Button({ variant, small, block, icon, iconRight, iconOnly, children, className, type = 'button', ...rest }: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={btnClass({ variant, small, block, iconOnly, className })} {...rest}>
      {icon ? <Icon name={icon} /> : null}
      {iconOnly ? <span className="visually-hidden">{children}</span> : children}
      {iconRight ? <Icon name={iconRight} /> : null}
    </button>
  );
}

export function ButtonLink({ href, variant, small, block, icon, iconRight, iconOnly, children, className, ...rest }: Common & { href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  return (
    <Link href={href} className={btnClass({ variant, small, block, iconOnly, className })} {...rest}>
      {icon ? <Icon name={icon} /> : null}
      {iconOnly ? <span className="visually-hidden">{children}</span> : children}
      {iconRight ? <Icon name={iconRight} /> : null}
    </Link>
  );
}

export function LinkButton({ children, className, type = 'button', ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={[s.linkBtn, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </button>
  );
}
