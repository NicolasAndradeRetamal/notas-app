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
  const queryParam = searchParams.get('q') ?? '';
  const [value, setValue] = useState(queryParam);
  const [syncedParam, setSyncedParam] = useState(queryParam);
  const [pending, setPending] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Navigation elsewhere (filter chips, back button) rewrites the query param.
  if (queryParam !== syncedParam) {
    setSyncedParam(queryParam);
    setValue(queryParam);
  }

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
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
      setPending(false);
    }, DEBOUNCE_MS);
  };

  return (
    <div className={className}>
      <label htmlFor="note-search" className="sr-only">
        Buscar en tus notas
      </label>
      <div className="relative">
        <span className="text-ink-subtle pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
          {pending ? (
            <Spinner size="sm" />
          ) : (
            <Search className="h-[18px] w-[18px]" aria-hidden="true" />
          )}
        </span>
        <input
          id="note-search"
          type="search"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Buscar en tus notas…"
          autoFocus={autoFocus}
          className="border-line-strong bg-surface-sunken text-ink placeholder:text-ink-subtle hover:border-ink-subtle focus-visible:border-primary focus-visible:bg-surface-raised focus-visible:outline-primary h-11 w-full rounded-md border pr-3 pl-10 text-[0.9375rem] focus-visible:outline-2 focus-visible:outline-offset-2"
        />
      </div>
    </div>
  );
}
