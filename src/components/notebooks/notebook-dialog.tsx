'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { createNotebookAction, updateNotebookAction } from '@/server/actions/notebook.actions';
import type { NotebookDTO } from '@/types/dto';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';

const SWATCHES = [
  '#0f766e',
  '#2563eb',
  '#7c3aed',
  '#c026d3',
  '#dc2626',
  '#ea580c',
  '#ca8a04',
  '#16a34a',
];

type NotebookDialogProps = {
  open: boolean;
  onClose: () => void;
  notebook?: NotebookDTO;
};

export function NotebookDialog({ open, onClose, notebook }: NotebookDialogProps) {
  const isEdit = Boolean(notebook);
  const [name, setName] = useState(notebook?.name ?? '');
  const [color, setColor] = useState<string | null>(notebook?.color ?? null);
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
        ? await updateNotebookAction({ id: notebook!.id, name, color })
        : await createNotebookAction({ name, color });

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
        title: isEdit ? 'Cuaderno actualizado.' : `Cuaderno «${result.data.name}» creado.`,
      });
      router.refresh();
      onClose();
    });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={isEdit ? 'Editar cuaderno' : 'Crear cuaderno'}
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
            loadingText="Guardando…"
            disabled={name.trim().length === 0}
          >
            {isEdit ? 'Guardar cambios' : 'Crear cuaderno'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Nombre"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={nameError}
          maxLength={80}
        />
        <fieldset>
          <legend className="text-ink mb-2 text-sm font-medium">Color</legend>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setColor(null)}
              aria-pressed={color === null}
              aria-label="Sin color"
              title="Sin color"
              className="hit-44 border-line-strong bg-surface-sunken text-ink-subtle focus-visible:outline-primary flex h-8 w-8 items-center justify-center rounded-full border-2 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              ×
            </button>
            {SWATCHES.map((swatch) => (
              <button
                key={swatch}
                type="button"
                onClick={() => setColor(swatch)}
                aria-pressed={color === swatch}
                aria-label={`Color ${swatch}`}
                className="hit-44 focus-visible:outline-primary flex h-8 w-8 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  backgroundColor: swatch,
                  boxShadow: color === swatch ? '0 0 0 2px var(--color-primary)' : undefined,
                }}
              >
                {color === swatch ? <span className="text-on-primary">✓</span> : null}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
    </Dialog>
  );
}
