'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { deleteNotebookAction } from '@/server/actions/notebook.actions';
import type { NotebookDTO } from '@/types/dto';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast';

type NotebookDeleteDialogProps = {
  open: boolean;
  onClose: () => void;
  notebook: NotebookDTO;
};

export function NotebookDeleteDialog({ open, onClose, notebook }: NotebookDeleteDialogProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const handleConfirm = () => {
    setError(undefined);
    startTransition(async () => {
      const result = await deleteNotebookAction({ id: notebook.id });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      toast({
        variant: 'success',
        title:
          result.data.detachedNotes === 1
            ? 'Cuaderno eliminado. 1 nota quedó sin cuaderno.'
            : `Cuaderno eliminado. ${result.data.detachedNotes} notas quedaron sin cuaderno.`,
      });
      // Only leave the page when the user is looking at the notebook they deleted.
      if (pathname === `/notebooks/${notebook.id}`) {
        router.push('/notes');
      } else {
        router.refresh();
      }
      onClose();
    });
  };

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Eliminar cuaderno"
      description={
        notebook.noteCount === 1
          ? 'La nota de este cuaderno no se eliminará: quedará sin cuaderno.'
          : notebook.noteCount
            ? `Las ${notebook.noteCount} notas de este cuaderno no se eliminarán: quedarán sin cuaderno.`
            : 'Este cuaderno no tiene notas.'
      }
      confirmLabel="Eliminar cuaderno"
      confirmingLabel="Eliminando…"
      destructive
      pending={pending}
      error={error}
    />
  );
}
