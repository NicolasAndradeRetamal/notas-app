import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type BadgeVariant =
  'neutral' | 'tag' | 'tag-active' | 'success' | 'danger' | 'warning' | 'info';

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  neutral: 'bg-surface-sunken text-ink-muted',
  tag: 'border border-line bg-surface-sunken text-ink',
  'tag-active': 'border border-primary bg-primary-soft text-primary',
  success: 'bg-success-soft text-success',
  danger: 'bg-danger-soft text-danger',
  warning: 'bg-warning-soft text-warning',
  info: 'bg-info-soft text-info',
};

type BadgeProps = {
  variant?: BadgeVariant;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  title?: string;
};

export function Badge({ variant = 'neutral', icon, children, className, title }: BadgeProps) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex h-6 items-center gap-1 rounded-sm px-2 text-xs font-medium',
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
