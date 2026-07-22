'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { deleteTagAction } from '@/server/actions/tag.actions';
import type { TagDTO } from '@/types/dto';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast';

type TagDeleteDialogProps = {
  open: boolean;
  onClose: () => void;
  tag: TagDTO;
};

export function TagDeleteDialog({ open, onClose, tag }: TagDeleteDialogProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const router = useRouter();
  const { toast } = useToast();

  const handleConfirm = () => {
    setError(undefined);
    startTransition(async () => {
      const result = await deleteTagAction({ id: tag.id });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      toast({ variant: 'success', title: 'Etiqueta eliminada.' });
      router.push('/notes');
      router.refresh();
      onClose();
    });
  };

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Eliminar etiqueta"
      description={`Se quitará de las ${tag.noteCount ?? 0} notas que la usan. Las notas no se eliminan.`}
      confirmLabel="Eliminar etiqueta"
      confirmingLabel="Eliminando…"
      destructive
      pending={pending}
      error={error}
    />
  );
}
