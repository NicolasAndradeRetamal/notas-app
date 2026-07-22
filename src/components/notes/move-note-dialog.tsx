'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { moveNoteAction } from '@/server/actions/note.actions';
import type { NoteDetailDTO, NoteSummaryDTO, NotebookDTO } from '@/types/dto';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';

type MoveNoteDialogProps = {
  open: boolean;
  onClose: () => void;
  note: NoteSummaryDTO | NoteDetailDTO;
  notebooks: NotebookDTO[];
};

export function MoveNoteDialog({ open, onClose, note, notebooks }: MoveNoteDialogProps) {
  const [notebookId, setNotebookId] = useState(note.notebook?.id ?? '');
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await moveNoteAction({ id: note.id, notebookId: notebookId || null });
      if (!result.ok) {
        toast({ variant: 'error', title: result.message });
        return;
      }
      toast({
        variant: 'success',
        title: result.data.notebook ? `Nota movida a «${result.data.notebook.name}».` : 'Nota quitada del cuaderno.',
      });
      router.refresh();
      onClose();
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Mover a un cuaderno"
      size="sm"
      preventClose={pending}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} loading={pending} loadingText="Moviendo…">
            Mover nota
          </Button>
        </>
      }
    >
      <Select label="Cuaderno" hideLabel value={notebookId} onChange={(e) => setNotebookId(e.target.value)}>
        <option value="">Sin cuaderno</option>
        {notebooks.map((notebook) => (
          <option key={notebook.id} value={notebook.id}>
            {notebook.name}
          </option>
        ))}
      </Select>
    </Dialog>
  );
}
