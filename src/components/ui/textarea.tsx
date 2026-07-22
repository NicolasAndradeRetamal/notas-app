'use client';

import { forwardRef, useId } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hideLabel?: boolean;
  hint?: string;
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hideLabel = false, hint, error, id, className, required, ...props },
  ref,
) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const hintId = `${textareaId}-hint`;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={textareaId}
        className={cn('text-sm font-medium text-ink', hideLabel && 'sr-only')}
      >
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-0.5 text-ink-muted">
            *
          </span>
        ) : null}
      </label>
      <textarea
        ref={ref}
        id={textareaId}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={hint || error ? hintId : undefined}
        className={cn(
          'min-h-24 w-full resize-y rounded-md border border-line-strong bg-surface-sunken px-3 py-2.5 text-[0.9375rem] text-ink',
          'transition-colors duration-150 ease-out placeholder:text-ink-subtle',
          'hover:border-ink-subtle',
          'focus-visible:border-primary focus-visible:bg-surface-raised focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2',
          'disabled:cursor-not-allowed disabled:border-line disabled:bg-surface-sunken/60 disabled:text-ink-subtle',
          error && 'border-danger bg-danger-soft',
          className,
        )}
        {...props}
      />
      <p id={hintId} className="min-h-[1.125rem] text-[0.8125rem]">
        {error ? <span className="text-danger">{error}</span> : hint ? <span className="text-ink-subtle">{hint}</span> : null}
      </p>
    </div>
  );
});
