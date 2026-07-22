'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import type { NotebookDTO } from '@/types/dto';
import { Button } from '@/components/ui/button';
import { NotebookDialog } from './notebook-dialog';
import { NotebookList } from './notebook-list';

export function SidebarNotebooksGroup({ notebooks }: { notebooks: NotebookDTO[] }) {
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between px-3">
        <h2 className="text-xs font-semibold tracking-wider text-ink-subtle uppercase">Cuadernos</h2>
        <Button variant="ghost" size="icon" onClick={() => setCreating(true)} aria-label="Crear cuaderno">
          <Plus aria-hidden="true" />
        </Button>
      </div>
      {notebooks.length > 0 ? (
        <div className="mt-1">
          <NotebookList notebooks={notebooks} />
        </div>
      ) : (
        <div className="px-3 py-2">
          <p className="text-[0.8125rem] text-ink-subtle">Aún no tienes cuadernos</p>
          <Button variant="ghost" size="sm" onClick={() => setCreating(true)} className="mt-1 px-0">
            Crear el primero
          </Button>
        </div>
      )}
      <NotebookDialog open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
