'use client';

import { CircleAlert } from 'lucide-react';
import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  icon?: ReactNode;
  trailingSlot?: ReactNode;
  optional?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hideLabel = false,
    hint,
    error,
    icon,
    trailingSlot,
    optional = false,
    id,
    className,
    required,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className={cn('text-sm font-medium text-ink', hideLabel && 'sr-only')}
      >
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-0.5 text-ink-muted">
            *
          </span>
        ) : null}
        {optional ? <span className="ml-1 font-normal text-ink-subtle">(opcional)</span> : null}
      </label>
      <div className="relative flex items-center">
        {icon ? (
          <span className="pointer-events-none absolute left-3 text-ink-subtle [&_svg]:h-[18px] [&_svg]:w-[18px]">
            {icon}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={hint || error ? hintId : undefined}
          className={cn(
            'h-11 w-full rounded-md border border-line-strong bg-surface-sunken px-3 text-[0.9375rem] text-ink',
            'transition-colors duration-150 ease-out placeholder:text-ink-subtle',
            'hover:border-ink-subtle',
            'focus-visible:border-primary focus-visible:bg-surface-raised focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2',
            'disabled:cursor-not-allowed disabled:border-line disabled:bg-surface-sunken/60 disabled:text-ink-subtle',
            'read-only:border-transparent read-only:bg-transparent',
            icon && 'pl-10',
            trailingSlot && 'pr-11',
            error && 'border-danger bg-danger-soft',
            className,
          )}
          {...props}
        />
        {trailingSlot ? <span className="absolute right-1.5">{trailingSlot}</span> : null}
      </div>
      <p id={hintId} className="min-h-[1.125rem] text-[0.8125rem]">
        {error ? (
          <span className="flex items-center gap-1 text-danger">
            <CircleAlert className="h-4 w-4" aria-hidden="true" />
            {error}
          </span>
        ) : hint ? (
          <span className="text-ink-subtle">{hint}</span>
        ) : null}
      </p>
    </div>
  );
});
