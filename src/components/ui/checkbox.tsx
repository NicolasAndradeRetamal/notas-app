'use client';

import { Check } from 'lucide-react';
import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string;
  error?: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, error, id, className, ...props },
  ref,
) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;

  return (
    <div>
      <label
        htmlFor={checkboxId}
        className="hit-44 flex min-h-11 cursor-pointer items-center gap-3 text-[0.9375rem] text-ink"
      >
        <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            aria-invalid={Boolean(error) || undefined}
            className={cn(
              'peer h-5 w-5 appearance-none rounded-sm border-[1.5px] border-line-strong',
              'checked:border-primary checked:bg-primary',
              'hover:border-ink-subtle checked:hover:border-primary-strong',
              'focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-55',
              error && 'border-danger',
              className,
            )}
            {...props}
          />
          <Check
            className="pointer-events-none absolute h-3.5 w-3.5 text-on-primary opacity-0 peer-checked:opacity-100"
            aria-hidden="true"
          />
        </span>
        {label}
      </label>
      {error ? <p className="ml-8 mt-1 text-[0.8125rem] text-danger">{error}</p> : null}
    </div>
  );
});
