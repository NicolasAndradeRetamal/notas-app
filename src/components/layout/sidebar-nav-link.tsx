'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type SidebarNavLinkProps = {
  href: string;
  children: ReactNode;
  count?: number;
  icon?: ReactNode;
  matchQuery?: string;
  countDimsOnHover?: boolean;
};

export function SidebarNavLink({
  href,
  children,
  count,
  icon,
  matchQuery,
  countDimsOnHover = false,
}: SidebarNavLinkProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [hrefPath, hrefQuery] = href.split('?');
  let isActive = pathname === hrefPath;
  if (isActive && matchQuery) {
    isActive = searchParams.toString() === matchQuery;
  } else if (isActive && hrefQuery !== undefined) {
    isActive = searchParams.toString() === hrefQuery;
  } else if (isActive && !hrefQuery) {
    isActive = searchParams.toString() === '';
  }

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'relative flex h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors duration-150',
        isActive
          ? 'bg-primary-soft text-ink font-medium'
          : 'text-ink-muted hover:bg-surface-sunken hover:text-ink',
      )}
    >
      {isActive ? (
        <span
          className="bg-primary absolute inset-y-1 left-0 w-[3px] rounded-full"
          aria-hidden="true"
        />
      ) : null}
      {icon}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {count !== undefined ? (
        <span
          className={cn(
            'text-meta text-ink-subtle tabular-nums',
            countDimsOnHover &&
              'transition-opacity group-focus-within/row:opacity-0 group-hover/row:opacity-0 [@media(hover:none)]:opacity-0',
          )}
        >
          {count}
        </span>
      ) : null}
    </Link>
  );
}
