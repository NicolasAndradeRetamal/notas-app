'use client';

import { Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';

const DEBOUNCE_MS = 350;

type SearchInputProps = {
  className?: string;
  autoFocus?: boolean;
};

export function SearchInput({ className, autoFocus }: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('q') ?? '');
  const [pending, setPending] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(searchParams.get('q') ?? '');
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleChange = (next: string) => {
    setValue(next);
    setPending(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.trim()) {
        params.set('q', next.trim());
      } else {
        params.delete('q');
      }
      params.delete('page');
      router.push({ pathname, query: Object.fromEntries(params) });
      setPending(false);
    }, DEBOUNCE_MS);
  };

  return (
    <div className={className}>
      <label htmlFor="note-search" className="sr-only">
        Buscar en tus notas
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-subtle">
          {pending ? <Spinner size="sm" /> : <Search className="h-[18px] w-[18px]" aria-hidden="true" />}
        </span>
        <input
          id="note-search"
          type="search"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Buscar en tus notas…"
          autoFocus={autoFocus}
          className="h-11 w-full rounded-md border border-line-strong bg-surface-sunken pr-3 pl-10 text-[0.9375rem] text-ink placeholder:text-ink-subtle hover:border-ink-subtle focus-visible:border-primary focus-visible:bg-surface-raised focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        />
      </div>
    </div>
  );
}
