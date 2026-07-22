import Link from 'next/link';
import { X } from 'lucide-react';

export function FilterChipLink({
  label,
  removeLabel,
  href,
}: {
  label: string;
  removeLabel: string;
  href: { pathname: string; query: Record<string, string> };
}) {
  return (
    <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-primary/40 bg-primary-soft px-3 text-[0.8125rem] text-primary">
      {label}
      <Link href={href} aria-label={removeLabel} className="hit-44 text-primary hover:text-primary-strong">
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </span>
  );
}
