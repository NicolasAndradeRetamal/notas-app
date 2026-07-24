'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { emptyTrashAction } from '@/server/actions/note.actions';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast';
import { pluralize } from '@/components/format';

export function EmptyTrashButton({ disabled }: { disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await emptyTrashAction();
      if (!result.ok) {
        toast({ variant: 'error', title: result.message });
        return;
      }
      toast({
        variant: 'success',
        title: `Papelera vaciada: ${pluralize(result.data.deleted, 'nota eliminada', 'notas eliminadas')}.`,
      });
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <Button variant="danger-ghost" size="md" onClick={() => setOpen(true)} disabled={disabled}>
        Vaciar la papelera
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title="Vaciar la papelera"
        description="Se eliminarán las notas definitivamente. Esta acción no se puede deshacer."
        confirmLabel="Eliminar notas"
        confirmingLabel="Vaciando…"
        destructive
        pending={pending}
      />
    </>
  );
}
