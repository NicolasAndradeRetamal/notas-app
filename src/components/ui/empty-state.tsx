import type { ComponentType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type EmptyStateProps = {
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'mx-auto flex max-w-md flex-col items-center gap-4 py-12 text-center md:py-16',
        className,
      )}
    >
      <span className="flex h-24 w-24 items-center justify-center rounded-2xl bg-surface-sunken">
        <Icon className="h-12 w-12 text-ink-subtle" aria-hidden={true} />
      </span>
      <div className="space-y-1">
        <h2 className="text-balance text-lg font-semibold text-ink">{title}</h2>
        {description ? (
          <p className="text-pretty max-w-[42ch] text-[0.9375rem] text-ink-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
