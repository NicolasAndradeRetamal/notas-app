'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

type FilterChipProps = {
  label: string;
  onRemove: () => void;
  removeLabel: string;
  className?: string;
};

export function FilterChip({ label, onRemove, removeLabel, className }: FilterChipProps) {
  return (
    <span
      className={cn(
        'animate-fade-in border-primary/40 bg-primary-soft text-primary inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[0.8125rem]',
        className,
      )}
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel}
        className="hit-44 text-primary hover:text-primary-strong"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </span>
  );
}
