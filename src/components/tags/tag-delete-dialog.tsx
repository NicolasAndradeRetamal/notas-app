'use client';

import { usePathname, useRouter } from 'next/navigation';
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
  const pathname = usePathname();
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
      // Only leave the page when the user is looking at the tag they deleted.
      if (pathname === `/tags/${tag.slug}`) {
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
      title="Eliminar etiqueta"
      description={
        tag.noteCount
          ? `Se quitará de las ${tag.noteCount} notas que la usan. Las notas no se eliminan.`
          : 'Ninguna nota usa esta etiqueta.'
      }
      confirmLabel="Eliminar etiqueta"
      confirmingLabel="Eliminando…"
      destructive
      pending={pending}
      error={error}
    />
  );
}
