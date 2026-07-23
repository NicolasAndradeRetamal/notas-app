'use client';

import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { NotebookDTO } from '@/types/dto';
import { Button } from '@/components/ui/button';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import type { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { NotebookDialog } from './notebook-dialog';
import { NotebookDeleteDialog } from './notebook-delete-dialog';

export function NotebookRowMenu({ notebook }: { notebook: NotebookDTO }) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const items: DropdownMenuItem[] = [
    {
      type: 'button',
      key: 'edit',
      label: 'Editar cuaderno…',
      icon: <Pencil aria-hidden="true" />,
      onClick: () => setEditing(true),
    },
    { type: 'separator', key: 'sep' },
    {
      type: 'button',
      key: 'delete',
      label: 'Eliminar cuaderno',
      icon: <Trash2 aria-hidden="true" />,
      onClick: () => setDeleting(true),
      destructive: true,
    },
  ];

  return (
    <>
      <DropdownMenu
        align="end"
        label={`Acciones del cuaderno «${notebook.name}»`}
        items={items}
        trigger={
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Acciones del cuaderno «${notebook.name}»`}
          >
            <MoreVertical aria-hidden="true" />
          </Button>
        }
      />
      <NotebookDialog open={editing} onClose={() => setEditing(false)} notebook={notebook} />
      <NotebookDeleteDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        notebook={notebook}
      />
    </>
  );
}
