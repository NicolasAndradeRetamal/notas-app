'use client';

import { useRouter } from 'next/navigation';
import { Copy, Eye, FolderInput, MoreVertical, Pencil, Tags, Trash2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { deleteNoteAction, restoreNoteAction } from '@/server/actions/note.actions';
import type { NoteDetailDTO, NoteSummaryDTO, NotebookDTO, TagDTO } from '@/types/dto';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import type { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { MoveNoteDialog } from './move-note-dialog';
import { NoteTagsDialog } from './note-tags-dialog';

type NoteActionsMenuProps = {
  note: NoteSummaryDTO | NoteDetailDTO;
  notebooks: NotebookDTO[];
  tags: TagDTO[];
  showOpen?: boolean;
  showCopyMarkdown?: boolean;
};

export function NoteActionsMenu({
  note,
  notebooks,
  tags,
  showOpen = true,
  showCopyMarkdown = false,
}: NoteActionsMenuProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [moveOpen, setMoveOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);

  const handleTrash = () => {
    startTransition(async () => {
      const result = await deleteNoteAction({ id: note.id });
      if (!result.ok) {
        toast({ variant: 'error', title: result.message });
        return;
      }
      toast({
        variant: 'success',
        title: 'Nota enviada a la papelera.',
        action: {
          label: 'Deshacer',
          onClick: () => {
            startTransition(async () => {
              const undo = await restoreNoteAction({ id: note.id });
              if (undo.ok) {
                toast({ variant: 'success', title: 'Nota restaurada.' });
                router.refresh();
              }
            });
          },
        },
      });
      router.refresh();
      router.push('/notes');
    });
  };

  const handleCopyMarkdown = () => {
    if ('content' in note) {
      void navigator.clipboard.writeText(note.content);
      toast({ variant: 'success', title: 'Markdown copiado.' });
    }
  };

  const items: DropdownMenuItem[] = [
    ...(showOpen
      ? ([{ type: 'link', key: 'open', href: `/notes/${note.id}`, label: 'Abrir', icon: <Eye aria-hidden="true" /> }] as const)
      : []),
    { type: 'link', key: 'edit', href: `/notes/${note.id}/edit`, label: 'Editar', icon: <Pencil aria-hidden="true" /> },
    {
      type: 'button',
      key: 'move',
      label: 'Mover a un cuaderno…',
      icon: <FolderInput aria-hidden="true" />,
      onClick: () => setMoveOpen(true),
    },
    {
      type: 'button',
      key: 'tags',
      label: 'Editar etiquetas…',
      icon: <Tags aria-hidden="true" />,
      onClick: () => setTagsOpen(true),
    },
    ...(showCopyMarkdown
      ? ([
          {
            type: 'button',
            key: 'copy',
            label: 'Copiar el markdown',
            icon: <Copy aria-hidden="true" />,
            onClick: handleCopyMarkdown,
          },
        ] as const)
      : []),
    { type: 'separator', key: 'sep' },
    {
      type: 'button',
      key: 'trash',
      label: 'Enviar a la papelera',
      icon: <Trash2 aria-hidden="true" />,
      onClick: handleTrash,
      destructive: true,
      disabled: pending,
    },
  ];

  return (
    <>
      <DropdownMenu
        align="end"
        label={`Acciones de la nota «${note.title}»`}
        items={items}
        trigger={
          <Button variant="ghost" size="icon" aria-label={`Acciones de la nota «${note.title}»`}>
            <MoreVertical aria-hidden="true" />
          </Button>
        }
      />
      <MoveNoteDialog open={moveOpen} onClose={() => setMoveOpen(false)} note={note} notebooks={notebooks} />
      <NoteTagsDialog open={tagsOpen} onClose={() => setTagsOpen(false)} note={note} tags={tags} />
    </>
  );
}
