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
        className="hit-44 text-ink flex min-h-11 cursor-pointer items-center gap-3 text-[0.9375rem]"
      >
        <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            aria-invalid={Boolean(error) || undefined}
            className={cn(
              'peer border-line-strong h-5 w-5 appearance-none rounded-sm border-[1.5px]',
              'checked:border-primary checked:bg-primary',
              'hover:border-ink-subtle checked:hover:border-primary-strong',
              'focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-55',
              error && 'border-danger',
              className,
            )}
            {...props}
          />
          <Check
            className="text-on-primary pointer-events-none absolute h-3.5 w-3.5 opacity-0 peer-checked:opacity-100"
            aria-hidden="true"
          />
        </span>
        {label}
      </label>
      {error ? <p className="text-danger mt-1 ml-8 text-[0.8125rem]">{error}</p> : null}
    </div>
  );
});
