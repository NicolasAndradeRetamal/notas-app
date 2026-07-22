'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { createTagAction, updateTagAction } from '@/server/actions/tag.actions';
import type { TagDTO } from '@/types/dto';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';

// Preview only: the canonical slug is always computed by the server.
function previewSlug(name: string) {
  const diacritics = /[̀-ͯ]/g;
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(diacritics, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

type TagDialogProps = {
  open: boolean;
  onClose: () => void;
  tag?: TagDTO;
};

export function TagDialog({ open, onClose, tag }: TagDialogProps) {
  const isEdit = Boolean(tag);
  const [name, setName] = useState(tag?.name ?? '');
  const [nameError, setNameError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const handleClose = () => {
    if (pending) return;
    onClose();
  };

  const handleSubmit = () => {
    setNameError(undefined);
    startTransition(async () => {
      const result = isEdit
        ? await updateTagAction({ id: tag!.id, name })
        : await createTagAction({ name });

      if (!result.ok) {
        if (result.fieldErrors?.name?.[0]) {
          setNameError(result.fieldErrors.name[0]);
        } else {
          toast({ variant: 'error', title: result.message });
        }
        return;
      }

      toast({
        variant: 'success',
        title: isEdit ? 'Etiqueta actualizada.' : `Etiqueta #${result.data.name} creada.`,
      });
      router.refresh();
      onClose();
    });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={isEdit ? 'Editar etiqueta' : 'Crear etiqueta'}
      size="sm"
      preventClose={pending}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={pending}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            loading={pending}
            loadingText="Creando…"
            disabled={name.trim().length === 0}
          >
            {isEdit ? 'Guardar cambios' : 'Crear etiqueta'}
          </Button>
        </>
      }
    >
      <div className="space-y-1.5">
        <Input
          label="Nombre"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={nameError}
          maxLength={40}
        />
        {name.trim() ? (
          <p className="text-[0.8125rem] text-ink-subtle">
            Se guardará como <span className="font-mono">#{previewSlug(name)}</span>
          </p>
        ) : null}
      </div>
    </Dialog>
  );
}
