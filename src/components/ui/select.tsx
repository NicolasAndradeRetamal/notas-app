'use client';

import { ChevronDown } from 'lucide-react';
import { forwardRef, useId } from 'react';
import type { ReactNode, SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hideLabel = false, hint, error, id, className, children, required, ...props },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const hintId = `${selectId}-hint`;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={selectId}
        className={cn('text-ink text-sm font-medium', hideLabel && 'sr-only')}
      >
        {label}
        {required ? (
          <span aria-hidden="true" className="text-ink-muted ml-0.5">
            *
          </span>
        ) : null}
      </label>
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={hint || error ? hintId : undefined}
          className={cn(
            'border-line-strong bg-surface-sunken text-ink h-11 w-full appearance-none rounded-md border px-3 pr-10 text-[0.9375rem]',
            'transition-colors duration-150 ease-out',
            'hover:border-ink-subtle',
            'focus-visible:border-primary focus-visible:bg-surface-raised focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-2',
            'disabled:border-line disabled:bg-surface-sunken/60 disabled:text-ink-subtle disabled:cursor-not-allowed',
            error && 'border-danger bg-danger-soft',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="text-ink-muted pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2"
          aria-hidden="true"
        />
      </div>
      <p id={hintId} className="min-h-[1.125rem] text-[0.8125rem]">
        {error ? (
          <span className="text-danger">{error}</span>
        ) : hint ? (
          <span className="text-ink-subtle">{hint}</span>
        ) : null}
      </p>
    </div>
  );
});
