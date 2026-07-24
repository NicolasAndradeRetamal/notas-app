'use client';

import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { TagDTO } from '@/types/dto';
import { Button } from '@/components/ui/button';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import type { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { TagDialog } from './tag-dialog';
import { TagDeleteDialog } from './tag-delete-dialog';

export function TagRowMenu({ tag }: { tag: TagDTO }) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const items: DropdownMenuItem[] = [
    {
      type: 'button',
      key: 'edit',
      label: 'Renombrar etiqueta…',
      icon: <Pencil aria-hidden="true" />,
      onClick: () => setEditing(true),
    },
    { type: 'separator', key: 'sep' },
    {
      type: 'button',
      key: 'delete',
      label: 'Eliminar etiqueta',
      icon: <Trash2 aria-hidden="true" />,
      onClick: () => setDeleting(true),
      destructive: true,
    },
  ];

  return (
    <>
      <DropdownMenu
        align="end"
        label={`Acciones de la etiqueta #${tag.name}`}
        items={items}
        trigger={
          <Button variant="ghost" size="icon" aria-label={`Acciones de la etiqueta #${tag.name}`}>
            <MoreVertical aria-hidden="true" />
          </Button>
        }
      />
      <TagDialog open={editing} onClose={() => setEditing(false)} tag={tag} />
      <TagDeleteDialog open={deleting} onClose={() => setDeleting(false)} tag={tag} />
    </>
  );
}
