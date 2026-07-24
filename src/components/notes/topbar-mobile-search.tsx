'use client';

import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SearchInput } from './search-input';

export function TopbarMobileSearch() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative md:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-expanded={open}
        aria-label={open ? 'Cerrar la búsqueda' : 'Buscar en tus notas'}
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? <X aria-hidden="true" /> : <Search aria-hidden="true" />}
      </Button>
      {open ? (
        <div className="border-line bg-surface-raised fixed inset-x-0 top-14 z-10 border-t p-3 shadow-sm">
          <SearchInput autoFocus />
        </div>
      ) : null}
    </div>
  );
}
