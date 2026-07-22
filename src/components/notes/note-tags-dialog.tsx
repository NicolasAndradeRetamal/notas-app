'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { setNoteTagsAction } from '@/server/actions/note.actions';
import type { NoteDetailDTO, NoteSummaryDTO, TagDTO } from '@/types/dto';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { TagPicker } from './tag-picker';
import type { TagOption } from './tag-picker';

type NoteTagsDialogProps = {
  open: boolean;
  onClose: () => void;
  note: NoteSummaryDTO | NoteDetailDTO;
  tags: TagDTO[];
};

export function NoteTagsDialog({ open, onClose, note, tags }: NoteTagsDialogProps) {
  const [selected, setSelected] = useState<TagOption[]>(
    note.tags.map((t) => ({ id: t.id, name: t.name })),
  );
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await setNoteTagsAction({
        noteId: note.id,
        tagIds: selected.map((t) => t.id),
      });
      if (!result.ok) {
        toast({ variant: 'error', title: result.message });
        return;
      }
      toast({ variant: 'success', title: 'Etiquetas actualizadas.' });
      router.refresh();
      onClose();
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Editar etiquetas"
      size="sm"
      preventClose={pending}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} loading={pending} loadingText="Guardando…">
            Guardar cambios
          </Button>
        </>
      }
    >
      <TagPicker value={selected} onChange={setSelected} availableTags={tags} />
    </Dialog>
  );
}
