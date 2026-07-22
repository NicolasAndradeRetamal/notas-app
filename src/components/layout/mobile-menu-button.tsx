'use client';

import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebarDrawer } from './sidebar-drawer-context';

export function MobileMenuButton() {
  const { open, setOpen } = useSidebarDrawer();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="lg:hidden"
      aria-expanded={open}
      aria-controls="mobile-sidebar"
      aria-label={open ? 'Cerrar el menú de navegación' : 'Abrir el menú de navegación'}
      onClick={() => setOpen(!open)}
    >
      {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
    </Button>
  );
}
