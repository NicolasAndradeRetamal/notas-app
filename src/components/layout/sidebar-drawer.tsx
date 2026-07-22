'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { useSidebarDrawer } from './sidebar-drawer-context';

export function SidebarDrawer({ children }: { children: ReactNode }) {
  const { open, setOpen } = useSidebarDrawer();
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, setOpen]);

  return (
    <div className="lg:hidden" aria-hidden={!open}>
      <div
        onClick={() => setOpen(false)}
        className={cn(
          'fixed inset-0 z-40 bg-[var(--color-scrim)] transition-opacity duration-200',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />
      <div
        id="mobile-sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-[272px] bg-surface-raised shadow-lg transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {children}
      </div>
    </div>
  );
}
