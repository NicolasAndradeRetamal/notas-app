import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  buildHref: (page: number) => { pathname: string; query: Record<string, string> };
};

export function Pagination({ page, pageSize, total, hasMore, buildHref }: PaginationProps) {
  if (total <= pageSize && page === 1) return null;

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const canGoPrev = page > 1;
  const canGoNext = hasMore;

  return (
    <nav aria-label="Paginación de notas" className="mt-8 flex flex-col items-center gap-2">
      <div className="flex items-center gap-4">
        <PaginationButton
          direction="prev"
          disabled={!canGoPrev}
          href={canGoPrev ? buildHref(page - 1) : undefined}
        />
        <span className="text-meta tabular-nums text-ink-muted">
          Página {page} de {totalPages}
        </span>
        <PaginationButton
          direction="next"
          disabled={!canGoNext}
          href={canGoNext ? buildHref(page + 1) : undefined}
        />
      </div>
      <p className="text-meta tabular-nums text-ink-subtle">
        Mostrando {start}–{end} de {total} notas
      </p>
    </nav>
  );
}

function PaginationButton({
  direction,
  disabled,
  href,
}: {
  direction: 'prev' | 'next';
  disabled: boolean;
  href?: { pathname: string; query: Record<string, string> };
}) {
  const label = direction === 'prev' ? 'Anterior' : 'Siguiente';
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;
  const classes = cn(
    'inline-flex h-11 items-center gap-2 rounded-md border border-line-strong bg-surface-raised px-4 text-[0.9375rem] font-medium text-ink transition-colors duration-150',
    disabled
      ? 'cursor-not-allowed border-line text-ink-subtle opacity-55'
      : 'hover:bg-surface-sunken',
  );

  if (disabled || !href) {
    return (
      <span className={classes} aria-disabled="true">
        {direction === 'prev' ? <Icon className="h-5 w-5" aria-hidden="true" /> : null}
        {label}
        {direction === 'next' ? <Icon className="h-5 w-5" aria-hidden="true" /> : null}
      </span>
    );
  }

  return (
    <Link href={href} className={classes}>
      {direction === 'prev' ? <Icon className="h-5 w-5" aria-hidden="true" /> : null}
      {label}
      {direction === 'next' ? <Icon className="h-5 w-5" aria-hidden="true" /> : null}
    </Link>
  );
}
